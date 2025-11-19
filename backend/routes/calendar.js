const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const GoogleToken = require('../models/googleCalendar');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const oauth2Client = require('../config/googleCalendarAuth');

router.get('/auth/google', verifyToken, (req, res)=>{
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - No token provided." });
    }
    const authUrl = oauth2Client.generateAuthUrl({
        access_type:'offline',
        scope:['https://www.googleapis.com/auth/calendar'],
        prompt:'consent',
        state: token,
    });
    res.redirect(authUrl);
});

router.get('/auth/google/calendar/callback',  async (req, res) => {
    const {state, code} = req.query;
    if (!state) {
        return res.status(401).json({ success: false, message: "Unauthorized - No token provided." });
    }
    try{
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        const userId = decoded.id;
        const {tokens} = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        //store token in DB
        await GoogleToken.findOneAndUpdate({ userId: userId},
            {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: new Date(tokens.expiry_date),
                scope: tokens.scope,
            },
            {upsert:true, new: true}
        );

        //update schema 
        await User.findByIdAndUpdate(userId, {googleCalendarConnected: true});


        res.send('Google Calendar connected successfully! Now you can sync events with google calendar.');
    } catch (error) { 
        console.error('Error retrieving access token', error);
        res.status(500).send('Error connecting to Google Calendar');
    }
});

module.exports = router;