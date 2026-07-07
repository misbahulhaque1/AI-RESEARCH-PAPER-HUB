const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  paper_id: {
    type: Number,
    required: true,
    index: true
  },
  summary_text: {
    type: String,
    required: true
  },
  key_points: [{
    type: String
  }],
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  generated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index
summarySchema.index({ paper_id: 1, generated_at: -1 });

const Summary = mongoose.model('Summary', summarySchema);

module.exports = Summary;
