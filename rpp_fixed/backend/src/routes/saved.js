const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const recommendationService = require('../services/recommendationService');
const authMiddleware = require('../middleware/auth');

// POST /api/saved/:paperId - Save a paper
router.post('/:paperId', authMiddleware, savedController.savePaper);

// GET /api/saved - Get saved papers
router.get('/', authMiddleware, savedController.getSavedPapers);

// DELETE /api/saved/:paperId - Remove saved paper
router.delete('/:paperId', authMiddleware, savedController.removeSavedPaper);

// GET /api/recommendations - Get recommendations
router.get('/recommendations', authMiddleware, recommendationService.getRecommendations);

module.exports = router;
