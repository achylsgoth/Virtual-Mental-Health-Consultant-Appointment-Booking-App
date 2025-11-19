const express = require('express');
const router = express.Router();
const { 
    getTherapistsForVerification,
    verifyTherapist,
    getReports,
    getFilteredReports,
    handleReport,
    getDashboardStats
} = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// router.use(verifyToken);
// Therapist verification routes
router.get('/therapists/pending',  getTherapistsForVerification);
router.put('/therapists/verify',  verifyTherapist);

// Report handling routes
router.get('/reports', getReports);
router.get('/reports/filter', getFilteredReports);
router.post('/reports/handle', handleReport);

// Admin dashboard stats
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
