const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  results_count: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
searchHistorySchema.index({ user_id: 1, timestamp: -1 });
searchHistorySchema.index({ query: 1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;
