const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

// GET /api/papers/:id/summary - Get or generate summary
router.get('/:id/summary', summaryController.getOrCreateSummary);

module.exports = router;
