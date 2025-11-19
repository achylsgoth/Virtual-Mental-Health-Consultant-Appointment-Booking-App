const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    therapistId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Therapist', 
        required: true 
    },
    slots: [{
        startDateTime: { type: Date, required: true }, // ISO 8601
        endDateTime: { type: Date, required: true },
        isAvailable: { type: Boolean, default: true }
    }],
    timezone: { type: String, default: 'GMT' }
});

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
