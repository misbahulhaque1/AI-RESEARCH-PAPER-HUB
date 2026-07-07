const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/auth');

// GET /api/search - Search papers
router.get('/', authMiddleware, searchController.searchPapers);

module.exports = router;
