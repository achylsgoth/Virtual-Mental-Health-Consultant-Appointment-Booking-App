const mongoose = require('mongoose');
const googleTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    expiry_date: { type: Date, required: true },
    scope: { type: String, required: true } // Track the scope of the token
});

const GoogleToken = mongoose.model('GoogleToken', googleTokenSchema);
module.exports = GoogleToken;