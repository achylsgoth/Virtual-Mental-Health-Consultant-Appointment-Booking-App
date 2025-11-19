const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const sessionSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Therapist',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    calendarEventId:{
        type: String, 
        required: true
    },

    scheduledTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        default: 60, // minutes
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    meetingLink: {
        type: String,
        required: true
    },
    reminders:{
        useDefault:{type:Boolean, default: true},
        overrides:[{
            method: {type: String, enum:['email', 'popup']},
            minutes: Number
        }]
    },
    payment: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        transactionId: String
    },
    notes: {
        privateNotes: [noteSchema],
        sharedNotes: [noteSchema],
        },
    cancellation: {
        reason: String,
        cancelledBy: {
            type: String,
            enum: ['client', 'therapist']
        },
        cancelledAt: Date
    }
}, {
    timestamps: true
});

// Indexes for frequent queries
sessionSchema.index({ therapistId: 1, scheduledTime: 1 });
sessionSchema.index({ clientId: 1, scheduledTime: 1 });
sessionSchema.index({ status: 1 });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;