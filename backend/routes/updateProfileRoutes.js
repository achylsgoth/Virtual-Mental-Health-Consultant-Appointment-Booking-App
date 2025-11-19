const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const userProfileController= require('../controllers/profileUpdateController');

router.get('/profile', verifyToken, userProfileController.getUserProfile);

router.put('/update', verifyToken, userProfileController.updateProfile);

router.put('/change-password', verifyToken, userProfileController.changePassword);

router.post('/upload-avatar', verifyToken, userProfileController.uploadAvatar);

module.exports = router;