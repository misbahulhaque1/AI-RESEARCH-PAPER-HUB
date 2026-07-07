const Paper = require('../models/Paper');
const SavedPaper = require('../models/SavedPaper');
const SearchHistory = require('../models/mongo/SearchHistory');
const { cache } = require('../config/redis');

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cacheKey = `recommendations:${userId}`;

    // Check cache first (1 hour TTL)
    const cachedRecs = await cache.get(cacheKey);
    if (cachedRecs) {
      return res.json({
        success: true,
        data: cachedRecs,
        source: 'cache'
      });
    }

    // Get user's saved papers
    const savedPapers = await SavedPaper.findAll({
      where: { user_id: userId },
      include: [{
        model: Paper,
        attributes: ['paper_id', 'title', 'keywords']
      }]
    });

    // Extract keywords from saved papers
    const keywordCounts = {};
    savedPapers.forEach(sp => {
      if (sp.Paper && sp.Paper.keywords) {
        sp.Paper.keywords.forEach(kw => {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        });
      }
    });

    // Get top keywords
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    if (topKeywords.length === 0) {
      // If no saved papers, return recent papers
      const recentPapers = await Paper.findAll({
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          recommendations: recentPapers,
          reason: 'Recent papers (no saved papers yet)'
        }
      });
    }

    // Find papers with matching keywords.
    // NOTE: Op.overlap is a PostgreSQL-only array operator and is not
    // supported by Sequelize's MySQL dialect (this project uses MySQL,
    // and `keywords` is a JSON column here, not a native array type).
    // Using it would throw on every request. Instead, fetch candidate
    // papers (excluding already-saved ones) and filter for keyword
    // overlap in JS - simple and correct at this dataset scale.
    const savedIds = savedPapers.map(sp => sp.paper_id);
    const candidatePapers = await Paper.findAll({
      where: savedIds.length
        ? { paper_id: { [require('sequelize').Op.notIn]: savedIds } }
        : {},
      limit: 200,
      order: [['created_at', 'DESC']]
    });

    const recommendedPapers = candidatePapers
      .filter(p => Array.isArray(p.keywords) && p.keywords.some(kw => topKeywords.includes(kw)))
      .slice(0, 10);

    const result = {
      recommendations: recommendedPapers,
      reason: `Based on your interest in: ${topKeywords.slice(0, 3).join(', ')}`
    };

    // Cache for 1 hour
    await cache.set(cacheKey, result, 3600);

    res.json({
      success: true,
      data: result,
      source: 'database'
    });
  } catch (error) {
    throw error;
  }
};
