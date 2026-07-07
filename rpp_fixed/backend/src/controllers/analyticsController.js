const Paper = require('../models/Paper');
const SavedPaper = require('../models/SavedPaper');
const SearchHistory = require('../models/mongo/SearchHistory');
const { cache } = require('../config/redis');

// Get trending papers
exports.getTrendingPapers = async (req, res) => {
  try {
    const cacheKey = 'trending_papers';
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // Get most saved papers
    const trendingPapers = await Paper.findAll({
      attributes: [
        'paper_id',
        'title',
        'abstract',
        'year',
        'source'
      ],
      include: [{
        model: SavedPaper,
        attributes: [],
        required: false
      }],
      group: ['Paper.paper_id'],
      order: [[{ model: SavedPaper, as: 'SavedPapers' }, 'save_id', 'DESC']],
      limit: 10
    });

    const result = {
      papers: trendingPapers,
      updated_at: new Date()
    };

    await cache.set(cacheKey, result, 600); // Cache for 10 minutes

    res.json({ success: true, data: result });
  } catch (error) {
    throw error;
  }
};

// Get popular topics
exports.getPopularTopics = async (req, res) => {
  try {
    const cacheKey = 'popular_topics';
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // Get most searched queries
    let popularQueries = [];
    try {
      popularQueries = await SearchHistory.aggregate([
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);
    } catch (mongoError) {
      console.warn('Popular topics unavailable (MongoDB down):', mongoError.message);
    }

    const result = {
      topics: popularQueries,
      updated_at: new Date()
    };

    await cache.set(cacheKey, result, 600);

    res.json({ success: true, data: result });
  } catch (error) {
    throw error;
  }
};

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const totalPapers = await Paper.count();
    const totalSaved = await SavedPaper.count();
    
    const recentPapers = await Paper.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const stats = {
      totalPapers,
      totalSaved,
      recentPapers,
      activeUsers: 0 // Can be enhanced with user activity tracking
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    throw error;
  }
};
