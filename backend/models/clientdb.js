const mongoose = require('mongoose');
const User = require('../models/User')
const clientSchema = new mongoose.Schema({
    moodTracker: [
        {
            mood: String, 
            timestamp: {
                type: Date,
                default: Date.now
            },
            description: String
        }
    ],

    journals: [
        {
            date: {
                type: Date, 
                default: Date.now
            },
            title: String,
            content: String
        }
    ],

    emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String
    },
    preferences: {
        therapistGender: String,
        preferredLanguage: String,
        preferredSessionTime: String
    },
    medicalHistory: {
        conditions: [String],
        medications: [String],
        allergies: [String],
        lastUpdated: Date
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date

});
 
const Client = User.discriminator('Client', clientSchema);
module.exports = Client;