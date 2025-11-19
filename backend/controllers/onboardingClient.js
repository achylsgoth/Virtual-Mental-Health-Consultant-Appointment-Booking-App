const User = require('../models/User');
const Client = require('../models/clientdb');

const onboardClient = async (req, res) => {
    try{
        const userId = req.userId;

        const {emergencyContact, preferences, medicalHistory} = req.body;

        const client = await User.findById(userId);
        if(!client || client.role !== "client") {
            res.status(404).json({success:false, message:"Client user not found"});
        }

        if(!client.isVerified){
            return res.status(400).json({success:false, message:"Please verify your email first."});

        }

        client.emergencyContact = emergencyContact;
        client.preferences = preferences;
        client.medicalHistory = medicalHistory;
        client.isOnboarded = true;

        await client.save();

        res.status(200).json({success: true, message:"Client onboarding completed", client})
    } catch(error){
        console.error("Onboarding error", error);
        res.status(500).json({success: false, message:"An error occured during onboard process."});
    }
};

module.exports = onboardClient;