const axios = require('axios');

/**
 * Paper Import Service using OpenAlex API
 * OpenAlex is a free, open API for scholarly metadata
 * More reliable and maintainable than Google Scholar scraping
 */

const OPENALEX_BASE_URL = 'https://api.openalex.org';

/**
 * Search and import papers from OpenAlex
 * @param {string} query - Search query
 * @param {number} count - Number of papers to import
 * @returns {Array} Array of paper objects
 */
exports.importFromOpenAlex = async (query = 'computer science', count = 50) => {
  try {
    console.log(`📚 Importing ${count} papers for query: "${query}"`);
    
    const response = await axios.get(`${OPENALEX_BASE_URL}/works`, {
      params: {
        search: query,
        per_page: Math.min(count, 200), // OpenAlex max is 200 per page
        sort: 'cited_by_count:desc', // Most cited first
        filter: 'has_abstract:true,from_publication_date:2020-01-01' // Recent papers with abstracts
      }
    });

    const works = response.data.results;
    const papers = [];

    for (const work of works) {
      try {
        const paper = transformOpenAlexWork(work);
        if (paper.title && paper.abstract) {
          papers.push(paper);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to transform work: ${work.id}`);
      }
    }

    console.log(`✅ Successfully imported ${papers.length} papers from OpenAlex`);
    return papers;
  } catch (error) {
    console.error('❌ Error importing from OpenAlex:', error.message);
    throw error;
  }
};

/**
 * Transform OpenAlex work into our paper format
 */
function transformOpenAlexWork(work) {
  // Extract authors
  const authors = work.authorships
    ? work.authorships.map(a => a.author.display_name).slice(0, 10).join(', ')
    : 'Unknown';

  // Extract keywords/inverted index
  const keywords = work.keywords
    ? work.keywords.map(k => k.keyword).slice(0, 10)
    : [];

  // Get URLs
  const url = work.primary_location?.pdf_url || work.primary_location?.landing_page_url || work.doi;
  const sourcePdfUrl = work.primary_location?.pdf_url || null;

  // Determine source
  const source = work.primary_location?.source?.display_name || 
                 (work.doi ? 'DOI' : 'OpenAlex');

  return {
    title: work.title || 'Untitled',
    abstract: work.abstract || '',
    authors: authors,
    year: work.publication_year || null,
    source: source,
    url: url || '',
    source_pdf_url: sourcePdfUrl,
    pdf_url: sourcePdfUrl || '',
    keywords: keywords,
    doi: work.doi || null,
    cited_by_count: work.cited_by_count || 0,
    external_id: work.id
  };
}

/**
 * Import papers by specific topic/field
 */
exports.importByTopic = async (topic, count = 50) => {
  return exports.importFromOpenAlex(topic, count);
};

/**
 * Import papers from specific venue (journal/conference)
 */
exports.importByVenue = async (venueName, count = 50) => {
  try {
    console.log(`📚 Importing papers from venue: "${venueName}"`);
    
    const response = await axios.get(`${OPENALEX_BASE_URL}/works`, {
      params: {
        filter: `primary_location.source.display_name.search:"${venueName}"`,
        per_page: Math.min(count, 200),
        sort: 'cited_by_count:desc'
      }
    });

    const papers = response.data.results
      .map(work => transformOpenAlexWork(work))
      .filter(paper => paper.title && paper.abstract);

    console.log(`✅ Imported ${papers.length} papers from ${venueName}`);
    return papers;
  } catch (error) {
    console.error(`❌ Error importing from venue ${venueName}:`, error.message);
    throw error;
  }
};

/**
 * Search for papers without importing
 */
exports.searchOpenAlex = async (query, limit = 20) => {
  try {
    const response = await axios.get(`${OPENALEX_BASE_URL}/works`, {
      params: {
        search: query,
        per_page: limit,
        sort: 'cited_by_count:desc'
      }
    });

    return response.data.results.map(work => ({
      title: work.title,
      authors: work.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown',
      year: work.publication_year,
      abstract: work.abstract,
      url: work.primary_location?.landing_page_url || work.doi,
      cited_by_count: work.cited_by_count,
      source: work.primary_location?.source?.display_name || 'OpenAlex'
    }));
  } catch (error) {
    console.error('❌ Error searching OpenAlex:', error.message);
    throw error;
  }
};
