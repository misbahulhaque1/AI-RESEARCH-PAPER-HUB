const SavedPaper = require('../models/SavedPaper');
const Paper = require('../models/Paper');
const { cache } = require('../config/redis');

// Save/bookmark a paper
exports.savePaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const userId = req.user.user_id;

    // Check if already saved
    const existing = await SavedPaper.findOne({
      where: { user_id: userId, paper_id: paperId }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Paper already saved'
      });
    }

    // Save paper
    await SavedPaper.create({
      user_id: userId,
      paper_id: paperId
    });

    // Clear recommendations cache
    await cache.del(`recommendations:${userId}`);

    res.status(201).json({
      success: true,
      message: 'Paper saved successfully'
    });
  } catch (error) {
    throw error;
  }
};

// Get user's saved papers
exports.getSavedPapers = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const savedPapers = await SavedPaper.findAll({
      where: { user_id: userId },
      include: [{
        model: Paper,
        attributes: ['paper_id', 'title', 'abstract', 'year', 'source', 'created_at']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['saved_at', 'DESC']]
    });

    const total = await SavedPaper.count({ where: { user_id: userId } });

    res.json({
      success: true,
      data: {
        savedPapers: savedPapers.map(sp => sp.Paper),
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    throw error;
  }
};

// Remove saved paper
exports.removeSavedPaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const userId = req.user.user_id;

    const deleted = await SavedPaper.destroy({
      where: { user_id: userId, paper_id: paperId }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved paper not found'
      });
    }

    // Clear recommendations cache
    await cache.del(`recommendations:${userId}`);

    res.json({
      success: true,
      message: 'Paper removed from saved list'
    });
  } catch (error) {
    throw error;
  }
};
