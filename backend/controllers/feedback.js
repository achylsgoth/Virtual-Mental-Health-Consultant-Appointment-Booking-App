const Feedback = require('../models/feedback');
const Session = require('../models/session');

// Create feedback
const createFeedback = async (req, res) => {
    try {
        const { sessionId, rating, comment } = req.body;
        const clientId = req.userId; 
        
        console.log('Received Feedback Data:', { sessionId, clientId, rating, comment });
        
        // Validate input
        if (!sessionId || !rating) {
            return res.status(400).json({ message: 'Session ID and rating are required' });
        }
        
        // Expanded session search to handle potential issues
        const session = await Session.findById(sessionId);
        
        if (!session) {
            console.error(`Session not found: ${sessionId}`);
            return res.status(404).json({ message: 'Session not found' });
        }
        
        // Additional logging to understand session details
        console.log('Found Session:', session);
        
        // Optional: Check if client matches (if needed)
        if (session.clientId.toString() !== clientId.toString()) {
            console.error(`Client ID mismatch. Session client: ${session.clientId}, Request client: ${clientId}`);
            return res.status(403).json({ message: 'Not authorized to provide feedback for this session' });
        }
        
        // Prevent duplicate feedback with more robust checking
        const existingFeedback = await Feedback.findOne({ 
            sessionId: sessionId, 
            clientId: clientId 
        });
        
        if (existingFeedback) {
            return res.status(400).json({ message: 'Feedback already submitted for this session' });
        }
        
        const feedback = new Feedback({
            sessionId,
            therapistId: session.therapistId,
            clientId,
            rating,
            comment: comment || '' // Allow empty comment
        });
        
        await feedback.save();
        
        res.status(201).json({ 
            message: 'Feedback submitted successfully', 
            feedback 
        });
    } catch (error) {
        console.error('Feedback Submission Error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get feedback for a therapist
const getTherapistFeedback = async (req, res) => {
    try {
        const { therapistId } = req.params;
        const feedback = await Feedback.find({ therapistId }).sort({ givenAt: -1 });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get feedback by session ID
const getSessionFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const feedback = await Feedback.findOne({ sessionId });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCurrentTherapistFeedback = async (req, res) => {
    try {

        const therapistId = req.userId;

        if (!therapistId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find all feedbacks for the current therapist
        const feedbacks = await Feedback.find({ therapistId })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .populate({
                path: 'clientId',
                select: 'fullname' // Only select the client's fullname
            })
            .populate({
                path: 'sessionId',
                select: 'scheduledTime duration' // Select relevant session details
            });

        // Calculate overall feedback statistics
        const averageRating = feedbacks.length > 0 
            ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        res.status(200).json({
            feedbacks,
            stats: {
                totalFeedbacks: feedbacks.length,
                averageRating: parseFloat(averageRating)
            }
        });
    } catch (error) {
        console.error('Error fetching therapist feedbacks:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve feedbacks', 
            error: error.message 
        });
    }
};

module.exports = {
    createFeedback,
    getTherapistFeedback,
    getSessionFeedback,
    getCurrentTherapistFeedback
}