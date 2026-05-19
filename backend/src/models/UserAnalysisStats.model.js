import mongoose from 'mongoose';

const RecentResultSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  summary: {
    total_accounts_analyzed: {
      type: Number,
      required: true,
    },
    suspicious_accounts_flagged: {
      type: Number,
      required: true,
    },
    fraud_rings_detected: {
      type: Number,
      required: true,
    },
    processing_time_seconds: {
      type: Number,
      required: true,
    },
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const UserAnalysisStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  totalAnalyses: {
    type: Number,
    default: 0,
  },
  totalAccountsAnalyzed: {
    type: Number,
    default: 0,
  },
  totalSuspiciousAccountsFlagged: {
    type: Number,
    default: 0,
  },
  totalFraudRingsDetected: {
    type: Number,
    default: 0,
  },
  lastAnalyzedAt: {
    type: Date,
    default: null,
  },
  latestResults: {
    type: [RecentResultSchema],
    default: [],
  },
}, { timestamps: true });

const UserAnalysisStats = mongoose.model('UserAnalysisStats', UserAnalysisStatsSchema);

export default UserAnalysisStats;
