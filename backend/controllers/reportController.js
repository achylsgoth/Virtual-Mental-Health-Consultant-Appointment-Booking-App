const Report = require('../models/reportModel');
const Post = require('../models/forumPage');
const mongoose = require('mongoose');
const {notifyAdmins} = require('../utils/notifyAdmin');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { postId, reason, description } = req.body;
    const userId = req.userId;

    // Validate post exists
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user has already reported this post
    const existingReport = await Report.findOne({ 
      post: postId, 
      reportedBy: userId,
      status: { $nin: ['resolved', 'dismissed'] } // Only check active reports
    });

    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reported this post' 
      });
    }

    const report = new Report({
      post: postId,
      reportedBy: userId,
      reason,
      description
    });

    await report.save();

    //notify admin
    await notifyAdmins({
      type:'report',
      title:'New Post Report',
      message:`A post has been reported : ${reason}`,
      relatedId: report._id,
      onModel:'Report'
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

// Get all reports (admin only)
exports.getAllReports = async (req, res) => {
  try {
    // Optional filtering
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.reason) {
      filter.reason = req.query.reason;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find(filter)
      .populate('post', 'content')
      .populate('reportedBy', 'name avatar')
      .populate('resolvedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    return res.status(200).json({
      success: true,
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get reports by post ID (admin only)
exports.getReportsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const reports = await Report.find({ post: postId })
      .populate('reportedBy', 'name avatar')
      .populate('resolvedBy', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching post reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports for this post',
      error: error.message
    });
  }
};

// Get reports created by current user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await Report.find({ reportedBy: userId })
      .populate('post', 'content')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your reports',
      error: error.message
    });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes } = req.body;
    const adminId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update fields
    if (status) report.status = status;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    
    // Set resolvedBy if status is being set to resolved or dismissed
    if (status === 'resolved' || status === 'dismissed') {
      report.resolvedBy = adminId;
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    });
  }
};

// Get report statistics (admin only)
exports.getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            reason: '$reason'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.status',
          reasons: {
            $push: {
              reason: '$_id.reason',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    // Get total reports count
    const total = await Report.countDocuments();
    
    // Count unique posts that have been reported
    const uniqueReportedPosts = await Report.aggregate([
      { $group: { _id: '$post' } },
      { $count: 'total' }
    ]);
    
    const uniquePostsCount = uniqueReportedPosts.length > 0 ? uniqueReportedPosts[0].total : 0;

    return res.status(200).json({
      success: true,
      stats,
      total,
      uniqueReportedPosts: uniquePostsCount
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error.message
    });
  }
};