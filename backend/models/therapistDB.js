const mongoose = require('mongoose');
const User = require('../models/User');
const therapistSchema = new mongoose.Schema(
    {
        qualificationProof: {
           resume:{
            type: String,
           },
           professionalLicense: {
            type: String,
           },
        },

        therapistType: {
            type:String,
            // required: true,
        },
        licenseNumber:{
            type: String,
            required: function() {
                return this.therapistType === "clinical";
            },
        },
        licenseIssuer:{
            type:String,
        },
        licenseExpiry:{
            type:Date,
        },

        isLicenseVerified: {
            type: Boolean,
            default: false,
        },
            specializations: [{
                type: String,
            }],
            education: [{
                degree: String,
                institution: String,
                year: Number
            }],
            
            sessionPrice: {
                type: Number
            },
            languages: [{
                type: String
            }],
        
        sessionHistory: [
            {
                clientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Client',
                },
                sessionDate: {
                    type: Date,
                },
                sessionNotes: {
                    type: String,
                    trim: true,
                },
            },
        ],
        paymentDetails: {
            provider: {
                type: String,
                enum: ['Khalti', 'Esewa'],
            },
            customerId: {
                type: String,
            }
        },
        paymentStatements: [
            {
                amount: {
                    type: Number,
                    required: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                clientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Client',
                },
            },
        ],
    }
);

const Therapist = User.discriminator('Therapist', therapistSchema)
module.exports = Therapist;
