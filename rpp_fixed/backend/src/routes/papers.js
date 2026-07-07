const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const paperImportService = require('../services/paperImportService');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');
const upload = require('../middleware/upload');
const Paper = require('../models/Paper');
const path = require('path');
const fs = require('fs');

// POST /api/papers/upload - Upload research paper (PDF)
router.post('/upload', authMiddleware, upload.single('file'), paperController.uploadPaper);

// GET /api/papers/download/:id - Download paper PDF
router.get('/download/:id', paperController.downloadPaper);

// POST /api/papers - Create new paper (with optional PDF upload)
router.post('/', authMiddleware, upload.single('pdf'), validate('paper'), paperController.createPaper);

// GET /api/papers - Get all papers with pagination, search, filter, sort
router.get('/', paperController.getPapers);

// GET /api/papers/:id - Get paper by ID
router.get('/:id', paperController.getPaperById);

// PUT /api/papers/:id - Update paper
router.put('/:id', authMiddleware, validate('paper'), paperController.updatePaper);

// DELETE /api/papers/:id - Delete paper
router.delete('/:id', authMiddleware, paperController.deletePaper);

// POST /api/papers/import/openalex - Import papers from OpenAlex
router.post('/import/openalex', authMiddleware, async (req, res) => {
  try {
    const { query = 'computer science', count = 50 } = req.body;
    
    console.log(`📥 Import request: query="${query}", count=${count}`);
    
    // Import papers from OpenAlex
    const papers = await paperImportService.importFromOpenAlex(query, count);
    
    // Insert into database
    let inserted = 0;
    let skipped = 0;
    
    for (const paperData of papers) {
      try {
        // Check if paper already exists
        const existing = await Paper.findOne({
          where: { title: paperData.title }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Create new paper
        await Paper.create({
          title: paperData.title,
          abstract: paperData.abstract,
          authors: paperData.authors,
          year: paperData.year,
          source: paperData.source,
          url: paperData.url,
          pdf_url: paperData.pdf_url || paperData.source_pdf_url,
          keywords: paperData.keywords,
          created_at: new Date()
        });
        
        inserted++;
      } catch (error) {
        console.warn(`⚠️  Failed to insert: ${paperData.title.substring(0, 50)}...`);
      }
    }
    
    res.json({
      success: true,
      message: `Imported ${inserted} papers`,
      data: {
        inserted,
        skipped,
        total: papers.length
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import papers',
      error: error.message
    });
  }
});

module.exports = router;
