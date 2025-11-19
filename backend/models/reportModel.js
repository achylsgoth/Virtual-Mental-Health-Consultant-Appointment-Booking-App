const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['harmful', 'harassment', 'hateSpeech', 'falseInfo', 'spam', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries on post and status
reportSchema.index({ post: 1, status: 1 });
reportSchema.index({ reportedBy: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;