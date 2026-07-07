const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

const connectElasticsearch = async () => {
  try {
    const health = await client.cluster.health();
    console.log('✅ Elasticsearch connection established successfully.');
    return client;
  } catch (error) {
    console.error('❌ Unable to connect to Elasticsearch:', error.message);
    // Don't throw error - Elasticsearch is optional for development
    console.log('⚠️  Elasticsearch features will be disabled');
    return null;
  }
};

// Create index mapping for papers
const createPaperIndex = async () => {
  try {
    const indexExists = await client.indices.exists({ index: 'papers' });
    
    if (!indexExists) {
      await client.indices.create({
        index: 'papers',
        body: {
          mappings: {
            properties: {
              paper_id: { type: 'integer' },
              title: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              abstract: { type: 'text', analyzer: 'standard' },
              authors: { type: 'keyword' },
              year: { type: 'integer' },
              source: { type: 'keyword' },
              keywords: { type: 'keyword' },
              created_at: { type: 'date' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });
      console.log('✅ Papers index created in Elasticsearch');
    }
  } catch (error) {
    console.error('Error creating papers index:', error);
  }
};

// Index a paper
const indexPaper = async (paper) => {
  try {
    await client.index({
      index: 'papers',
      id: paper.paper_id.toString(),
      body: {
        paper_id: paper.paper_id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors || [],
        year: paper.year,
        source: paper.source,
        keywords: paper.keywords || [],
        created_at: paper.created_at
      }
    });
  } catch (error) {
    console.error('Error indexing paper:', error);
  }
};

// Delete paper from index
const deletePaper = async (paperId) => {
  try {
    await client.delete({
      index: 'papers',
      id: paperId.toString()
    });
  } catch (error) {
    console.error('Error deleting paper from index:', error);
  }
};

// Search papers
const searchPapers = async (query, filters = {}) => {
  try {
    const searchQuery = {
      bool: {
        should: [
          {
            multi_match: {
              query: query,
              fields: ['title^3', 'abstract^2', 'authors', 'keywords'],
              fuzziness: 'AUTO'
            }
          }
        ],
        filter: []
      }
    };

    // Add filters
    if (filters.year) {
      searchQuery.bool.filter.push({ term: { year: filters.year } });
    }
    if (filters.source) {
      searchQuery.bool.filter.push({ term: { source: filters.source } });
    }
    if (filters.author) {
      searchQuery.bool.filter.push({ term: { authors: filters.author } });
    }

    const response = await client.search({
      index: 'papers',
      body: {
        query: searchQuery,
        highlight: {
          fields: {
            title: {},
            abstract: {}
          }
        },
        from: filters.from || 0,
        size: filters.size || 20
      }
    });

    return {
      total: response.hits.total.value,
      hits: response.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
        highlight: hit.highlight
      }))
    };
  } catch (error) {
    console.error('Error searching papers:', error);
    return { total: 0, hits: [] };
  }
};

module.exports = {
  client,
  connectElasticsearch,
  createPaperIndex,
  indexPaper,
  deletePaper,
  searchPapers
};
