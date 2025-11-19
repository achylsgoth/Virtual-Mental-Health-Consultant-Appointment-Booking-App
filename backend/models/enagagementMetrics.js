const mongoose = require('mongoose');

const engagementMetricsSchema = new mongoose.Schema({
    date: {
        type: String, // Store as 'YYYY-MM-DD' for daily metrics
        required: true,
        unique: true
    },
    activeUsers: {
        type: Number,
        default: 0
    },
    totalSessionsBooked: {
        type: Number,
        default: 0
    },
    totalSessionsCompleted: {
        type: Number,
        default: 0
    },
    sessionEngagementRate: {
        type: Number,
        default: 0 // Calculated as (completed/booked * 100)
    }
});

const EngagementMetrics = mongoose.model('EngagementMetrics', engagementMetricsSchema);
module.exports = EngagementMetrics;
