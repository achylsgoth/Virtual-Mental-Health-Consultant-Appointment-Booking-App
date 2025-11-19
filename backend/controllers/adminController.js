const Therapist = require('../models/therapistDB');
const Reports = require('../models/reportModel');
const User = require('../models/User');
const Post = require('../models/forumPage');


/**
 * Get all unverified therapists
 */
const getTherapistsForVerification = async (req, res) => {
    try {
        // Fetch all therapists who are not verified
        const therapists = await Therapist.find({ isLicenseVerified: false })
            .select('fullname email avatar specializations education sessionPrice languages qualificationProof');

        res.status(200).json({ success: true, therapists });
    } catch (error) {
        console.error("Error fetching therapists for verification:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Verify a therapist
 */
const verifyTherapist = async (req, res) => {
    try {
        const {therapistId, isLicenseVerified} = req.body;
        
        if (!therapistId) {
            return res.status(400).json({ 
                success: false, 
                message: "Therapist ID is required" 
            });
        }

        // Find the therapist
        const therapist = await Therapist.findById(therapistId);
        
        if (!therapist) {
            return res.status(404).json({ 
                success: false, 
                message: "Therapist not found" 
            });
        }

        if (isLicenseVerified) {
            // Approve the therapist
            therapist.isLicenseVerified = true;
            await therapist.save();
            
            // notification
            
            return res.status(200).json({
                success: true,
                message: "Therapist has been successfully verified"
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Therapist verification has been rejected",
            });
        }
    } catch (error) {
        console.error("Error verifying therapist:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Get all reports
 */
const getReports = async (req, res) => {
    try {
        const reports = await Reports.find()
            .populate('post', 'content createdAt')
            .populate('reportedBy', 'fullname username email avatar')
            .sort({ createdAt: -1 });
            
        if (!reports || reports.length === 0) {
            return res.status(200).json({
                success: true, 
                message: "No reports found",
                reports: []
            });
        }
        
        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get reports with filter options
 */
const getFilteredReports = async (req, res) => {
    try {
        const { status, reason, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (reason) filter.reason = reason;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get reports with filters and pagination
        const reports = await Reports.find(filter)
            .populate('post', 'content createdAt')
            .populate('reportedBy', 'fullname username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        // Get total count for pagination
        const totalReports = await Reports.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            reports,
            pagination: {
                total: totalReports,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalReports / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching filtered reports:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handle a reported content
 */
const handleReport = async (req, res) => {
    try {
        const { reportId, action, notes } = req.body;
        const adminId = req.userId;
        
        if (!reportId || !action) {
            return res.status(400).json({
                success: false,
                message: "Report ID and action are required"
            });
        }
        
        // Validate action
        if (!['reviewing', 'resolved', 'dismissed'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'reviewing', 'resolved', or 'dismissed'"
            });
        }
        
        // Find the report
        const report = await Reports.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }
        
        // Update report status
        report.status = action;
        report.resolvedBy = adminId;
        if (notes) {
            report.resolutionNotes = notes;
        }

        // If resolved, delete the reported post
        if (action === 'resolved') {
            if (report.post) {
                await Post.findByIdAndDelete(report.post);
            }
        }

        await report.save();
        
        res.status(200).json({
            success: true,
            message: `Report has been ${action}`,
            report
        });
    } catch (error) {
        console.error('Error handling report:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get admin dashboard stats
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get counts for various metrics
        const pendingReportsCount = await Reports.countDocuments({ status: 'pending' });
        const pendingTherapistsCount = await Therapist.countDocuments({ isTherapistVerified: false });
        const totalUsersCount = await User.countDocuments();
        const totalTherapistsCount = await Therapist.countDocuments();
        
        // Get recent reports (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentReports = await Reports.find({ 
            createdAt: { $gte: oneWeekAgo } 
        }).countDocuments();
        
        res.status(200).json({
            success: true,
            stats: {
                pendingReports: pendingReportsCount,
                pendingTherapists: pendingTherapistsCount,
                totalUsers: totalUsersCount,
                totalTherapists: totalTherapistsCount,
                recentReports
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { 
    getTherapistsForVerification,
    verifyTherapist,
    getReports,
    getFilteredReports,
    handleReport,
    getDashboardStats
}; 