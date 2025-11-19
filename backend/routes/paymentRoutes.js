// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken  = require('../middleware/verifyToken');
const paymentController = require('../controllers/paymentController');

// Initiate payment for a session
router.post('/initiate', verifyToken, paymentController.initiatePayment);

// Verify payment and proceed
router.post('/verify', verifyToken, paymentController.verifyPayment);

router.get('/success', paymentController.paymentSuccess);
router.get('/failure', paymentController.paymentFailure);

module.exports = router;