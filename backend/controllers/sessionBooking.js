const Session = require('../models/session');
const {google} = require('googleapis');
const GoogleToken = require('../models/googleCalendar');
const User = require('../models/User');
const{encrypt, decrypt} = require('../utils/encryptionUtils');
const paymentController = require('../controllers/paymentController');



// Get OAuth2 client and stored credential
const getOAuth2Client = async (req, res) => {
    const therapistId = req.params;
    const tokenData = await GoogleToken.findOne({therapistId});
    if(!tokenData) throw new Error('Google authentication required');

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_CALLBACK_URL
    );

    oauth2Client.setCredentials({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: tokenData.expiry_date,
    });

    //Check if the access token is expired
    const now = new Date().getTime();
    if(new Date(tokenData.expiry_date).getTime() < now) {
        console.log('Access token is expired, Refreshing...');
        try{
            const {credentials} = await oauth2Client.refreshAccessToken();
            //update the token in db
            tokenData.access_token = credentials.access_token;
            tokenData.expiry_date = credentials.expiry_date;
            await tokenData.save();
        } catch (err) {
            console.error('Error Refreshing access token: ', err);
            throw new Error('Google authentication failed, please reconnect.');
        }
    }
    return oauth2Client;
};

// create a new session and sync with google calendar.
const createSession = async (req, res) => {
    try {
        const {therapistId, clientId, scheduledTime, duration } = req.body;

        const therapist = await User.findById(therapistId).select('fullname email');
        const client = await User.findById(clientId).select('fullname email');

        if (!therapist || !client) {
            return res.status(404).json({ success: false, message: "Therapist or client not found." });
        }

        // Get the OAuth2 client
        const oauth2Client = await getOAuth2Client(therapistId);

        // Initialize the Google Calendar API client
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Google calendar event
        const event = {
            summary: "Therapy Session",
            description: "A virtual therapy session.",
            start: { dateTime: scheduledTime, timeZone: 'UTC' },
            end: { dateTime: new Date(new Date(scheduledTime).getTime() + duration * 60000).toISOString(), timeZone: 'UTC' },
            attendees: [
                { email: therapist.email, displayName: therapist.fullname },
                { email: client.email, displayName: client.fullname }
            ],
            conferenceData: {
                createRequest: { requestId: `${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } }
            },
            reminders: { useDefault:true  }
        };

        const calendarEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all'
        });

        const meetingLink = calendarEvent.data.hangoutLink;

        const newSession = new Session({
            therapistId,
            clientId,
            scheduledTime,
            duration,
            status: 'scheduled',
            meetingLink,
            calendarEventId: calendarEvent.data.id
        });

        await newSession.save();
        res.status(201).json({ success: true, session: newSession });
    } catch (err) {
        console.error("Error creating session: ", err);
        const { pidx } = req.body;
        
        // If payment was already verified but session creation failed, attempt refund
        if (pidx) {
            try {
                // Check if payment was completed
                const paymentRecord = await Payment.findOne({ transactionId: pidx });
                
                if (paymentRecord && paymentRecord.status === 'paid') {
                    // Attempt to refund the payment
                    await refundPayment(
                        pidx,
                        paymentRecord.amount * 100, // Convert to paisa
                        'Session creation failed'
                    );
                    
                    // Update payment record
                    paymentRecord.status = 'refunded';
                    await paymentRecord.save();
                }
            } catch (refundError) {
                console.error('Refund failed:', refundError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error creating session',
            error: err.message
        });
    }
};
//Get therapist session
const getTherapistSession= async(req, res) => {
     
    try{
        const therapistId = req.userId;
        const sessions = await Session.find({ therapistId})
        .populate("clientId", "fullname email")
        .populate("therapistId", "fullname")
        .sort({scheduledTime: 1});

        if(!sessions.length) {
            return res.status(200).json({ success: true, message: "No sessions found."});
        }

        res.status(200).json({success: true, message:"Therapist session fetched success", sessions});


    }catch (err){
        console.log("Error fetching therapist sessions:", err);
        res.status(500).json({success: false, message:"Internal server error"});    }
};

//Session Cancellation function.
const cancelSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { cancelledBy, reason } = req.body;

        if (!cancelledBy || !['client', 'therapist'].includes(cancelledBy)) {
            return res.status(400).json({ success: false, message: "Invalid cancellation initiator." });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        if (session.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Session is already cancelled." });
        }

        // Get therapist's OAuth token
        const tokens = await GoogleToken.findOne({ userId: session.therapistId });
        if (!tokens) {
            return res.status(401).json({ success: false, message: "Therapist is not connected to Google." });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Delete event from the therapist's calendar
        if (session.calendarEventId) {
            await calendar.events.delete({
                calendarId: "primary",
                eventId: session.calendarEventId
            });
        }

        // Update session status to "cancelled"
        session.status = "cancelled";
        session.cancellation = {
            reason,
            cancelledBy,
            cancelledAt: new Date()
        };

        await session.save();

        res.status(200).json({ success: true, message: "Session cancelled successfully.", session });
    } catch (error) {
        console.error("Error cancelling session:", error);
        res.status(500).json({ success: false, message: "Error cancelling session", error });
    }
};


//delete Sesssion.
const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const therapistId = req.userId;

        // Find the session by ID
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Check if the therapist is authorized to delete the session
        if (session.therapistId.toString() !== therapistId) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        // Get the OAuth2 client with token refresh handling
        const oauth2Client = await getOAuth2Client(therapistId);

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Check if the event exists before attempting to delete
        if (session.calendarEventId) {
            try {
                await calendar.events.delete({
                    calendarId: "primary",
                    eventId: session.calendarEventId
                });
            } catch (calendarError) {
                if (calendarError.code === 410) {
                    console.warn("Calendar event already deleted:", calendarError.message);
                } else {
                    throw calendarError;
                }
            }
        }

        // Delete the session from the database
        await Session.findByIdAndDelete(sessionId);

        res.status(200).json({ success: true, message: "Session deleted successfully" });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ success: false, message: "Error deleting session", error: error.message });
    }
};
const setSessionStatusToCompleted = async (req, res) => {
    const { sessionId } = req.params; // Retrieve sessionId from the URL params
    const therapistId = req.userId; // Assuming the therapist ID is stored in the request (e.g., from JWT token)
    
    try {
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, therapistId }, // Ensure only the assigned therapist can update the session
            { $set: { status: 'completed' } }, // Update session status to 'completed'
            { new: true, runValidators: true } // Return updated document and validate input
        );

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found or unauthorized access.' });
        }

        res.status(200).json({ success: true, message: 'Session status updated to completed', session });
    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Get client sessions
const getClientSessions = async (req, res) => {
    try{
        const clientId = req.userId;
        const sessions = await Session.find({clientId})
        .populate("clientId", "fullname")
        .populate("therapistId", "fullname email")
        .sort({scheduledTime: 1});

        if(!sessions.length) {
            return res.status(200).json({ success: true, message: "No sessions found."});
        }

        res.status(200).json({success: true, message:"Therapist session fetched success", sessions});


    }catch (err){
        console.log("Error fetching therapist sessions:", err);
        res.status(500).json({success: false, message:"Internal server error"});    }
};


const getSessionDetails = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId)
            .populate('therapistId clientId');
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching session details' });
    }
};



// For private notes (array of notes)
const updatePrivateNotes = async (req, res) => {
    const { sessionId } = req.params;
    const { content } = req.body;
    const therapistId = req.userId;
    
    try {
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Note content is required' 
            });
        }
        
        // Encrypt and stringify
        const encryptedContent = encrypt(content);
        
        const newNote = {
            content: encryptedContent, // This is a string
            createdAt: new Date()
        };
        
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, therapistId },
            { $push: { 'notes.privateNotes': newNote }},
            { new: true, runValidators: true }
        ).populate('clientId', 'fullname email');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found or unauthorized access' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Private note added securely',
            session: session
        });
    } catch (error) {
        console.error('Error adding private note:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const updateSharedNotes = async (req, res) => {
    const { sessionId } = req.params;
    const { content } = req.body;
    const therapistId = req.userId;
    
    try {
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Shared note content is required' 
            });
        }
        
        // Encrypt content
        const encryptedContent = encrypt(content);
        
        // Create a new note object instead of replacing the entire field
        const newNote = {
            content: encryptedContent,
            createdAt: new Date()
        };
        
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, therapistId },
            { $push: { 'notes.sharedNotes': newNote }}, // Push to array instead of set
            { new: true, runValidators: true }
        ).populate('clientId', 'fullname email');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found or unauthorized access' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Shared note added securely',
            session: session
        });
    } catch (error) {
        console.error('Error adding shared note:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// For getting notes - updated to handle shared notes as array
const getSessionNotes = async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.userId;
    
    try {
        const session = await Session.findById(sessionId)
            .populate('clientId', 'fullname email')
            .populate('therapistId', 'fullname email');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        const isTherapist = session.therapistId._id.toString() === userId;
        const isClient = session.clientId._id.toString() === userId;

        if (!isTherapist && !isClient) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized access to session notes' 
            });
        }

        // Decrypt shared notes (now an array)
        let decryptedSharedNotes = [];
        if (session.notes.sharedNotes && session.notes.sharedNotes.length > 0) {
            decryptedSharedNotes = session.notes.sharedNotes.map(note => {
                try {
                    return {
                        ...note.toObject(),
                        content: decrypt(note.content),
                        encryptedContent: note.content // Keep original for reference
                    };
                } catch (error) {
                    console.error('Decryption failed for shared note:', error);
                    return {
                        ...note.toObject(),
                        content: '[Secure content unavailable]',
                        decryptionError: true
                    };
                }
            });
        }

        // Decrypt private notes if therapist
        let decryptedPrivateNotes = [];
        if (isTherapist && session.notes.privateNotes) {
            decryptedPrivateNotes = session.notes.privateNotes.map(note => {
                try {
                    return {
                        ...note.toObject(),
                        content: decrypt(note.content),
                        encryptedContent: note.content // Keep original for reference
                    };
                } catch (error) {
                    console.error('Decryption failed for private note:', error);
                    return {
                        ...note.toObject(),
                        content: '[Secure content unavailable]',
                        decryptionError: true
                    };
                }
            });
        }

        res.status(200).json({ 
            success: true, 
            notes: {
                sharedNotes: decryptedSharedNotes,
                privateNotes: isTherapist ? decryptedPrivateNotes : undefined
            }
        });
    } catch (error) {
        console.error('Error fetching session notes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Combined update function for both note types
const updateSessionNotes = async (req, res) => {
    const { sessionId } = req.params;
    const { privateNote, sharedNote } = req.body; // Changed from sharedNotes to sharedNote
    const therapistId = req.userId;
    
    try {
        // Initialize update object
        const updateOperations = {};
        const now = new Date();
        
        // Handle private notes (add to array)
        if (privateNote && typeof privateNote === 'string') {
            const encryptedContent = encrypt(privateNote);
            const newPrivateNote = {
                content: encryptedContent,
                createdAt: now
            };
            updateOperations['$push'] = { 'notes.privateNotes': newPrivateNote };
        }
        
        // Handle shared notes (add to array, not replace)
        if (sharedNote && typeof sharedNote === 'string') {
            const encryptedContent = encrypt(sharedNote);
            const newSharedNote = {
                content: encryptedContent,
                createdAt: now
            };
            
            // If $push already exists from private notes, add to it
            if (updateOperations['$push']) {
                updateOperations['$push']['notes.sharedNotes'] = newSharedNote;
            } else {
                updateOperations['$push'] = { 'notes.sharedNotes': newSharedNote };
            }
            
            // Also update the session updatedAt timestamp
            updateOperations['$set'] = { 'updatedAt': now };
        } else if (sharedNote !== undefined && typeof sharedNote !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Shared note must be a string' 
            });
        }
        
        // If no valid updates, return early
        if (Object.keys(updateOperations).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid note updates provided' 
            });
        }

        const session = await Session.findOneAndUpdate(
            { _id: sessionId, therapistId },
            updateOperations,
            { 
                new: true, 
                runValidators: true,
                timestamps: false // We're managing timestamps manually
            }
        ).populate('clientId', 'fullname email');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found or unauthorized access' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Session notes updated securely',
            session: {
                ...session.toObject(),
                // Don't return encrypted content in response
                notes: {
                    privateNotes: session.notes.privateNotes?.length || 0,
                    sharedNotes: session.notes.sharedNotes?.length || 0
                }
            }
        });
    } catch (error) {
        console.error('Error updating session notes:', error);
        
        // Handle specific encryption errors
        if (error.message.includes('encryption')) {
            return res.status(500).json({ 
                success: false, 
                message: 'Security processing error',
                error: 'Could not secure the notes' 
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid data format',
                error: error.message 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Updated to handle both private and shared notes as arrays
const getClientSessionsHistory = async (req, res) => {
    const { clientId } = req.params;
    const therapistId = req.userId;
    
    try {
        // Validate that clientId is a valid ObjectId
        if (!clientId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid client ID format' 
            });
        }

        // Find all sessions between this therapist and client
        const sessions = await Session.find({ 
            therapistId,
            clientId
        })
        .populate('clientId', 'fullname email')
        .sort({ scheduledTime: -1 }); // Sort by most recent first

        // Decrypt notes for each session
        const decryptedSessions = sessions.map(session => {
            const sessionObj = session.toObject();
            
            // Decrypt shared notes if they exist (now an array)
            if (sessionObj.notes?.sharedNotes && sessionObj.notes.sharedNotes.length > 0) {
                sessionObj.notes.sharedNotes = sessionObj.notes.sharedNotes.map(note => {
                    try {
                        return {
                            ...note,
                            content: decrypt(note.content),
                            encryptedContent: note.content // Keep original for reference
                        };
                    } catch (error) {
                        console.error('Decryption failed for shared note:', error);
                        return {
                            ...note,
                            content: '[Secure content unavailable]',
                            decryptionError: true
                        };
                    }
                });
            }
            
            // Decrypt private notes if they exist (only for therapist)
            if (sessionObj.notes?.privateNotes && sessionObj.notes.privateNotes.length > 0) {
                sessionObj.notes.privateNotes = sessionObj.notes.privateNotes.map(note => {
                    try {
                        return {
                            ...note,
                            content: decrypt(note.content),
                            encryptedContent: note.content
                        };
                    } catch (error) {
                        console.error('Decryption failed for private note:', error);
                        return {
                            ...note,
                            content: '[Secure content unavailable]',
                            decryptionError: true
                        };
                    }
                });
            }
            
            return sessionObj;
        });

        res.status(200).json({ 
            success: true, 
            message: 'Client session history retrieved successfully',
            sessions: decryptedSessions
        });
    } catch (error) {
        console.error('Error fetching client sessions history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message
        });
    }
};


module.exports  = {createSession,
                     getTherapistSession,
                    cancelSession,
            setSessionStatusToCompleted,
        getClientSessions,
         deleteSession,
         getSessionDetails,
        updatePrivateNotes,
        updateSharedNotes,
        getClientSessionsHistory,
        getSessionNotes,
        updateSessionNotes};

