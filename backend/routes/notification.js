const express = require('express');
const router = express.Router();
const {getNotifications, markAsRead} = require('../controllers/notification');
const verifyToken = require('../middleware/authMiddleware');

router.get('', verifyToken, getNotifications);
router.patch('/:id', verifyToken, markAsRead);


module.exports = router;