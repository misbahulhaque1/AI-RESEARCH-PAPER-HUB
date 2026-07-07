const Paper = require('../models/Paper');
const Author = require('../models/Author');
const { indexPaper, deletePaper } = require('../config/elasticsearch');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Upload research paper
exports.uploadPaper = async (req, res) => {
  try {
    const { title, abstract, authors, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Persist the PDF to Cloudinary so it survives redeploys/restarts -
    // local disk (uploads/) is ephemeral on most host platforms (Railway,
    // Render, etc.) and files saved there are lost the moment the app
    // restarts or is redeployed.
    const uploadResult = await uploadToCloudinary(req.file);

    // Clean up the temp file multer wrote to local disk now that it's
    // safely stored in Cloudinary.
    fs.unlink(req.file.path, (err) => {
      if (err) console.warn('Could not remove temp upload file:', err.message);
    });

    // Create paper in MySQL
    const paper = await Paper.create({
      title: title || req.file.originalname.replace('.pdf', ''),
      abstract: abstract || '',
      authors: authors || '',
      tags: tags ? JSON.parse(tags) : [],
      file_url: uploadResult.url,
      pdf_url: uploadResult.url,
      cloudinary_public_id: uploadResult.public_id,
      year: new Date().getFullYear(),
      source: 'User Upload',
      uploaded_by: req.user?.user_id || null,
      upload_date: new Date(),
      downloads_count: 0,
      keywords: [],
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Paper uploaded successfully',
      data: paper
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload paper',
      error: error.message
    });
  }
};

// Download paper PDF
exports.downloadPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByPk(id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if file exists locally
    if (paper.file_url && paper.file_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', paper.file_url);
      
      if (fs.existsSync(filePath)) {
        // Increment download count
        await paper.increment('downloads_count');
        
        // Send file
        return res.download(filePath, `${paper.title}.pdf`);
      }
    }

    // If no local file, redirect to external URL
    if (paper.pdf_url) {
      await paper.increment('downloads_count');
      return res.redirect(paper.pdf_url);
    }

    return res.status(404).json({
      success: false,
      message: 'PDF file not available'
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download paper',
      error: error.message
    });
  }
};

// Create new paper
exports.createPaper = async (req, res) => {
  try {
    const { title, abstract, authors, year, source, url, keywords } = req.body;

    let pdf_url = null;
    let cloudinary_public_id = null;

    // Upload PDF to Cloudinary if file exists
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file);
      pdf_url = uploadResult.url;
      cloudinary_public_id = uploadResult.public_id;
    }

    // Create paper in MySQL
    const paper = await Paper.create({
      title,
      abstract,
      authors,
      year,
      source,
      url,
      pdf_url,
      cloudinary_public_id,
      keywords: keywords || []
    });

    // Index in Elasticsearch
    try {
      await indexPaper({
        paper_id: paper.paper_id,
        title: paper.title,
        abstract: paper.abstract,
        authors: [],
        year: paper.year,
        source: paper.source,
        keywords: paper.keywords,
        created_at: paper.created_at
      });
    } catch (error) {
      console.error('Failed to index paper in Elasticsearch:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: paper
    });
  } catch (error) {
    throw error;
  }
};

// Get all papers with pagination, search, filter, sort
exports.getPapers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      year, 
      source, 
      search, 
      tags,
      sort = 'newest' // newest, oldest, most_downloaded, title
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    
    // Filter by year
    if (year) where.year = year;
    
    // Filter by source
    if (source) where.source = { [require('sequelize').Op.like]: `%${source}%` };
    
    // Search in title, abstract, authors
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { abstract: { [Op.like]: `%${search}%` } },
        { authors: { [Op.like]: `%${search}%` } }
      ];
    }

    // Order by sort parameter
    let order = [['created_at', 'DESC']]; // default: newest
    if (sort === 'oldest') {
      order = [['created_at', 'ASC']];
    } else if (sort === 'most_downloaded') {
      order = [['downloads_count', 'DESC']];
    } else if (sort === 'title') {
      order = [['title', 'ASC']];
    }

    const { count, rows } = await Paper.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order
    });

    res.json({
      success: true,
      data: {
        papers: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    throw error;
  }
};

// Get paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByPk(id, {
      include: [{
        model: Author,
        through: { attributes: [] }
      }]
    });

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    res.json({
      success: true,
      data: paper
    });
  } catch (error) {
    throw error;
  }
};

// Update paper
exports.updatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, authors, year, source, url, keywords } = req.body;

    const paper = await Paper.findByPk(id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Update paper
    await paper.update({
      title: title || paper.title,
      abstract: abstract !== undefined ? abstract : paper.abstract,
      authors: authors !== undefined ? authors : paper.authors,
      year: year || paper.year,
      source: source || paper.source,
      url: url || paper.url,
      keywords: keywords || paper.keywords
    });

    // Re-index in Elasticsearch
    try {
      await indexPaper({
        paper_id: paper.paper_id,
        title: paper.title,
        abstract: paper.abstract,
        authors: [],
        year: paper.year,
        source: paper.source,
        keywords: paper.keywords,
        created_at: paper.created_at
      });
    } catch (error) {
      console.error('Failed to update paper index:', error);
    }

    res.json({
      success: true,
      message: 'Paper updated successfully',
      data: paper
    });
  } catch (error) {
    throw error;
  }
};

// Delete paper
exports.deletePaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findByPk(id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Delete PDF from Cloudinary
    if (paper.cloudinary_public_id) {
      try {
        await deleteFromCloudinary(paper.cloudinary_public_id);
      } catch (error) {
        console.error('Failed to delete PDF from Cloudinary:', error);
      }
    }

    // Delete from Elasticsearch
    try {
      await deletePaper(id);
    } catch (error) {
      console.error('Failed to delete paper from Elasticsearch:', error);
    }

    // Delete from MySQL
    await paper.destroy();

    res.json({
      success: true,
      message: 'Paper deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};
