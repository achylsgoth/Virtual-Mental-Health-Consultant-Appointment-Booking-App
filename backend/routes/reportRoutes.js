const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middleware/verifyToken');

//create a new report
router.post('/', verifyToken, reportController.createReport);

//get all reports(For admin)
router.get('/', verifyToken, reportController.getAllReports);

//get report statistics
router.get('/stats', verifyToken, reportController.getReportStats);

//get report of specific post
router.get('/post/:postId', verifyToken, reportController.getReportsByPost);

//get current user reports
router.get('/my-reports', verifyToken, reportController.getUserReports);

//update report status
router.patch('/:reportId', verifyToken, reportController.updateReportStatus);

module.exports = router;