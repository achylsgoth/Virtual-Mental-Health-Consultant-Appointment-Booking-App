const express = require('express');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const fs = require('fs');
const path = require('path');



//Load credentials from the JSOn file
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_CALLBACK_URL
);

module.exports = oauth2Client;