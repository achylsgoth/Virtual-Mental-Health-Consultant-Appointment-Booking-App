const Therapist = require('../models/User');
const OpenSlot = require('../models/availability');

const getAllTherapist = async (req, res) => {
    try {
        // Fetch all therapists from the database
        const therapists = await Therapist.find({ role: 'therapist' }).select('-password'); // Exclude password field

        // Check if there are any therapists
        if (!therapists || therapists.length === 0) {
            return res.status(404).json({ success: false, message: 'No therapists found.' });
        }

        res.status(200).json({ success: true, therapists });
    } catch (error) {
        console.error('Error fetching therapists:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching therapists.' });
    }
}

const getTherapistById = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the therapist by ID from the database
        const therapist = await Therapist.findById(id).select('-password'); // Exclude password field

        // Check if the therapist exists
        if (!therapist) {
            return res.status(404).json({ success: false, message: 'Therapist not found.' });
        }
        
        res.status(200).json({ success: true, therapist });
    } catch (error) {
        console.error('Error fetching therapist:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the therapist.' });
    }
};

const getTherapistAvailability = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the therapist exists
        const therapist = await Therapist.findById(id).select('-password');
        if (!therapist) {
            return res.status(404).json({ success: false, message: 'Therapist not found.' });
        }

        // Fetch availability slots for the therapist
        const availability = await OpenSlot.find({ therapistId: id });

        res.status(200).json({ success: true, availability });
    } catch (error) {
        console.error('Error fetching therapist availability:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching availability.' });
    }
};

//function to retrieve authenticated therapist availability
const getAuthenticatedTherapistAvailability = async(req, res) => {
    try {
        const therapistId = req.userId;

        const availability = await OpenSlot.findOne({ therapistId });

        if (!availability) {
            return res.status(404).json({ success: false, message: 'No availability found for this therapist.' });
        }

        res.status(200).json({ success: true, availability });
    } catch (error) {
        console.error('Error fetching authenticated therapist availability:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability.', error });
    }
};

const addorupdateAvailability = async (req, res) => {
    try {
        const { slots, timezone = 'GMT', isAvailable } = req.body;
        const therapistId = req.userId;

        // Check if availability exists for the therapist
        let availability = await OpenSlot.findOne({ therapistId });

        if (availability) {
            // If availability exists, check if the incoming slot already exists
            const incomingSlot = slots[0]; // Assuming only one slot is sent at a time
            let slotExists = false;

            // Iterate through existing slots to find a match
            availability.slots = availability.slots.map(existingSlot => {
                if (
                    new Date(existingSlot.startDateTime).toISOString() === new Date(incomingSlot.startDateTime).toISOString() &&
                    new Date(existingSlot.endDateTime).toISOString() === new Date(incomingSlot.endDateTime).toISOString()
                ) {
                    // Update the existing slot
                    slotExists = true;
                    return {
                        ...existingSlot,
                        isAvailable: incomingSlot.isAvailable
                    };
                }
                return existingSlot;
            });

            // If no matching slot was found, add the new slot
            if (!slotExists) {
                availability.slots.push(incomingSlot);
            }

            // Update timezone and isAvailable
            availability.timezone = timezone;
            availability.isAvailable = isAvailable;
        } else {
            // If no availability exists, create a new availability entry
            availability = new OpenSlot({ therapistId, slots, isAvailable, timezone });
        }

        // Save the updated availability
        await availability.save();

        res.status(200).json({ success: true, message: 'Availability updated successfully.', availability });
    } catch (err) {
        console.error('Error adding or updating availability:', err);
        res.status(500).json({ success: false, message: 'Failed to add or update availability', error: err.message });
    }
};


const deleteAvailability = async (req, res) => {
    try {
        const { startDateTime } = req.body;  // assuming you are using startDateTime as the identifier for the slot
        const therapistId = req.userId;

        // Find the therapist's availability document and remove the slot from the slots array
        const availability = await OpenSlot.findOneAndUpdate(
            { therapistId },
            { $pull: { slots: { startDateTime: new Date(startDateTime) } } },  // Remove slot based on startDateTime
            { new: true }  // Return the updated document
        );

        if (!availability) {
            return res.status(404).json({ success: false, message: 'No availability found for this therapist.' });
        }

        // If the slot was removed, return success
        res.status(200).json({ success: true, message: 'Slot deleted successfully.', availability });
    } catch (err) {
        console.error('Error deleting slot:', err);
        res.status(500).json({ success: false, message: 'Failed to delete slot', error: err.message });
    }
};

const updateAvailabilityAfterBooking = async (req, res) => {
    const { startDateTime, therapistId } = req.body; // Accept therapistId explicitly

    if (!therapistId) {
        return res.status(400).json({ success: false, message: 'Therapist ID is required.' });
    }

    try {
        const availability = await OpenSlot.findOne({ therapistId });

        if (!availability) {
            return res.status(404).json({ success: false, message: 'Availability not found for this therapist.' });
        }

        const slotIndex = availability.slots.findIndex(slot =>
            new Date(slot.startDateTime).toISOString() === new Date(startDateTime).toISOString()
        );

        if (slotIndex === -1 || !availability.slots[slotIndex].isAvailable) {
            return res.status(400).json({ success: false, message: 'Slot not found or already booked.' });
        }

        availability.slots[slotIndex].isAvailable = false; // Mark as booked

        await availability.save();
        res.status(200).json({ success: true, message: 'Slot marked as booked successfully.', availability });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


module.exports = {
    getAllTherapist,
    getTherapistById,
    getTherapistAvailability,
    addorupdateAvailability,
    getAuthenticatedTherapistAvailability,
    deleteAvailability,
    updateAvailabilityAfterBooking
};