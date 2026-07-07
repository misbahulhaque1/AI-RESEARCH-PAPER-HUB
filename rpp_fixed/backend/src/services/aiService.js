const { HfInference } = require('@huggingface/inference');
const Summary = require('../models/mongo/Summary');

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

// Generate summary using Hugging Face
exports.generateSummary = async (text) => {
  try {
    // Truncate text if too long (BART has token limits)
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: truncatedText,
      parameters: {
        max_length: 150,
        min_length: 40,
        do_sample: false
      }
    });

    return result.summary_text;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate AI summary');
  }
};

// Extract key points using text analysis
exports.extractKeyPoints = async (text) => {
  try {
    // Simple extraction based on sentence scoring
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Score sentences by word frequency
    const wordFreq = {};
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const scoredSentences = sentences.map(sentence => {
      const score = sentence.split(/\s+/)
        .reduce((sum, word) => sum + (wordFreq[word.toLowerCase()] || 0), 0);
      return { sentence: sentence.trim(), score };
    });

    // Get top 5 key points
    const keyPoints = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.sentence);

    return keyPoints;
  } catch (error) {
    console.error('Error extracting key points:', error);
    return [];
  }
};

// Analyze difficulty level
exports.analyzeDifficulty = async (text) => {
  try {
    const words = text.split(/\s+/).length;
    const complexWords = text.match(/\b\w{8,}\b/g) || [];
    const complexWordRatio = complexWords.length / words;

    if (complexWordRatio > 0.15 || words > 5000) {
      return 'advanced';
    } else if (complexWordRatio > 0.08 || words > 2000) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  } catch (error) {
    console.error('Error analyzing difficulty:', error);
    return 'intermediate';
  }
};

// Generate complete analysis for a paper
exports.analyzePaper = async (paperId, abstract) => {
  try {
    // Check if summary already exists
    const existingSummary = await Summary.findOne({ paper_id: paperId });
    if (existingSummary) {
      return existingSummary;
    }

    // Generate AI summary
    const summary_text = await this.generateSummary(abstract);
    
    // Extract key points
    const key_points = await this.extractKeyPoints(abstract);
    
    // Analyze difficulty
    const difficulty_level = await this.analyzeDifficulty(abstract);

    // Save to MongoDB
    const summary = await Summary.create({
      paper_id: paperId,
      summary_text,
      key_points,
      difficulty_level
    });

    return summary;
  } catch (error) {
    console.error('Error analyzing paper:', error);
    throw error;
  }
};
