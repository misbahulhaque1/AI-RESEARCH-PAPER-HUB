const { searchPapers } = require('../config/elasticsearch');
const { cache } = require('../config/redis');
const Paper = require('../models/Paper');
const SearchHistory = require('../models/mongo/SearchHistory');

// Search papers with caching
exports.searchPapers = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20, year, source } = req.query;
    
    const cacheKey = `search:${q}:${page}:${limit}:${year}:${source}`;
    
    // Check cache first
    const cachedResults = await cache.get(cacheKey);
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        source: 'cache'
      });
    }

    // Search in Elasticsearch
    const filters = {
      from: (page - 1) * limit,
      size: parseInt(limit)
    };
    
    if (year) filters.year = parseInt(year);
    if (source) filters.source = source;

    const searchResults = await searchPapers(q, filters);

    // Save search history if user is authenticated (best-effort - Mongo
    // being down should never break an otherwise-successful search)
    if (req.user) {
      try {
        await SearchHistory.create({
          user_id: req.user.user_id,
          query: q,
          results_count: searchResults.total
        });
      } catch (historyError) {
        console.warn('Could not save search history:', historyError.message);
      }
    }

    // Cache results for 5 minutes
    const responseData = {
      papers: searchResults.hits,
      total: searchResults.total,
      page: parseInt(page),
      totalPages: Math.ceil(searchResults.total / limit)
    };

    await cache.set(cacheKey, responseData, 300);

    res.json({
      success: true,
      data: responseData,
      source: 'elasticsearch'
    });
  } catch (error) {
    // Fallback to MySQL search if Elasticsearch fails
    try {
      const papers = await Paper.findAll({
        where: {
          title: { [require('sequelize').Op.like]: `%${req.query.q}%` }
        },
        limit: parseInt(req.query.limit) || 20
      });

      res.json({
        success: true,
        data: {
          papers,
          total: papers.length,
          page: 1,
          totalPages: 1
        },
        source: 'mysql-fallback'
      });
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};
