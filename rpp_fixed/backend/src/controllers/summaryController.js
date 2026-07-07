const aiService = require('../services/aiService');
const Paper = require('../models/Paper');

// Generate or get paper summary
exports.getOrCreateSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByPk(id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Generate or retrieve summary
    const summary = await aiService.analyzePaper(paper.paper_id, paper.abstract);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    throw error;
  }
};
