const Client = require('../models/clientdb');

const addMood = async (req, res) => {
    try{
        const {mood, description} = req.body;
        const clientId = req.userId;

        const client = await Client.findById(clientId);
        if(!client) return res.status(404).json({message:'Client not found.'});

        client.moodTracker.push({mood, description});
        await client.save();

        res.status(201).json({message:'mood added successfully', moodTracker:client.moodTracker});

    } catch(error){
        res.status(500).json({message:'Internal Server Error', error: error.message});
    }
};

const getMood = async(req, res) => {
    try{
        const clientId = req.userId;
        const client = await Client.findById(clientId).select('moodTracker');
        if(!client) return res.status(404).json({message:'Client not found.'});

        res.status(200).json({message:"Successful getting mood.", moodTracker:client.moodTracker});
    }catch(error){
        res.status(500).json({message:"Server error", error:error.message});
    }
};

const deleteMood = async(req, res) =>{
    try{
        const { moodId } = req.params;
        const clientId = req.userId;

        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ message: "Client not found" });

        client.moodTracker = client.moodTracker.filter(entry => entry._id.toString() !== moodId);
        await client.save();

        res.status(200).json({ message: "Mood entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    addMood,
    getMood,
    deleteMood
}