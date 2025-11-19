const express = require('express');
const router = express.Router();
const {createFeedback, getTherapistFeedback, getSessionFeedback, getCurrentTherapistFeedback} = require('../controllers/feedback');
const verifyToken = require('../middleware/verifyToken');

// Create feedback (only clients can submit feedback)
router.post('/give', verifyToken, createFeedback);

router.get('/myfeeback',verifyToken, getCurrentTherapistFeedback);

// Get all feedback for a therapist
router.get('/therapist/:therapistId', getTherapistFeedback);

// Get feedback for a specific session
router.get('/session/:sessionId', getSessionFeedback);

module.exports = router;
