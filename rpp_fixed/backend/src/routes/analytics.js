const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/trending - Get trending papers
router.get('/trending', analyticsController.getTrendingPapers);

// GET /api/analytics/popular-topics - Get popular topics
router.get('/popular-topics', analyticsController.getPopularTopics);

// GET /api/analytics/stats - Get platform statistics
router.get('/stats', analyticsController.getStats);

module.exports = router;
