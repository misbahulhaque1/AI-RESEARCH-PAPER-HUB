require('dotenv').config();
const axios = require('axios');
const { connectMySQL } = require('../config/mysql');
const Paper = require('../models/Paper');

/**
 * Bulk Import Script - Imports 1000+ research papers from OpenAlex
 * Uses multiple topics to get diverse papers
 */

const OPENALEX_BASE_URL = 'https://api.openalex.org';

// Research topics to import papers from
const TOPICS = [
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'natural language processing',
  'computer vision',
  'data science',
  'neural networks',
  'reinforcement learning',
  'blockchain technology',
  'cybersecurity',
  'cloud computing',
  'internet of things',
  'quantum computing',
  'bioinformatics',
  'robotics',
  'distributed systems',
  'software engineering',
  'database systems',
  'human computer interaction',
  'information retrieval'
];

const PAPERS_PER_TOPIC = 70; // 15 topics × 70 papers = 1050 papers

async function bulkImportPapers() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BULK PAPER IMPORT - 1000+ PAPERS');
  console.log('='.repeat(60));
  console.log(`📊 Topics: ${TOPICS.length}`);
  console.log(`📄 Papers per topic: ${PAPERS_PER_TOPIC}`);
  console.log(`🎯 Target: ${TOPICS.length * PAPERS_PER_TOPIC} papers`);
  console.log('='.repeat(60) + '\n');

  try {
    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    await connectMySQL();
    console.log('✅ MySQL connected\n');

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    // First, get all existing titles to avoid N+1 queries
    console.log('📋 Loading existing papers...');
    const existingPapers = await Paper.findAll({ attributes: ['title', 'doi'] });
    const existingTitles = new Set(existingPapers.map(p => p.title.toLowerCase()));
    const existingDOIs = new Set(existingPapers.filter(p => p.doi).map(p => p.doi.toLowerCase()));
    console.log(`   Found ${existingTitles.size} existing papers\n`);

    // Import from each topic
    for (let i = 0; i < TOPICS.length; i++) {
      const topic = TOPICS[i];
      console.log(`\n[${i + 1}/${TOPICS.length}] 📚 Importing papers for: "${topic}"`);
      console.log('-'.repeat(60));

      try {
        // Fetch papers from OpenAlex
        const response = await axios.get(`${OPENALEX_BASE_URL}/works`, {
          params: {
            search: topic,
            per_page: PAPERS_PER_TOPIC,
            sort: 'cited_by_count:desc',
            filter: 'from_publication_date:2018-01-01' // Removed has_abstract filter
          }
        });

        const works = response.data.results;
        console.log(`   📥 Retrieved ${works.length} papers from OpenAlex`);

        let inserted = 0;
        let skipped = 0;

        // Process each paper
        for (const work of works) {
          try {
            // Transform the work
            const paperData = transformWork(work);
            
            // Skip if no title
            if (!paperData.title || paperData.title === 'Untitled') {
              skipped++;
              continue;
            }

            // If no abstract, create a placeholder or use keywords
            if (!paperData.abstract || paperData.abstract.trim() === '') {
              // Use keywords as abstract if available
              if (paperData.keywords && paperData.keywords.length > 0) {
                paperData.abstract = `Research paper about ${paperData.keywords.slice(0, 5).join(', ')}. Published in ${paperData.source || 'academic journals'}.`;
              } else {
                paperData.abstract = `A research paper titled "${paperData.title}" published in ${paperData.year || 'recent years'}. This paper contributes to the field of ${topic}.`;
              }
            }

            // Check if paper already exists (by DOI or title)
            const titleKey = paperData.title.toLowerCase();
            const doiKey = paperData.doi ? paperData.doi.toLowerCase() : null;

            if ((doiKey && existingDOIs.has(doiKey)) || existingTitles.has(titleKey)) {
              skipped++;
              continue;
            }

            // Insert into database
            await Paper.create({
              title: paperData.title,
              abstract: paperData.abstract,
              authors: paperData.authors,
              year: paperData.year,
              source: paperData.source,
              url: paperData.url,
              pdf_url: paperData.pdf_url,
              keywords: paperData.keywords,
              doi: paperData.doi,
              created_at: new Date()
            });

            // Add to existing sets to prevent duplicates within same batch
            existingTitles.add(titleKey);
            if (doiKey) existingDOIs.add(doiKey);

            inserted++;
            totalInserted++;

          } catch (error) {
            totalFailed++;
            if (totalFailed <= 3) {
              console.error(`   ⚠️  Error inserting paper: ${error.message}`);
            }
            // Silently skip failed papers
          }
        }

        totalSkipped += skipped;
        console.log(`   ✅ Inserted: ${inserted} | Skipped: ${skipped} | Running Total: ${totalInserted}`);

        // Rate limiting - be nice to OpenAlex API
        await sleep(500);

      } catch (error) {
        console.error(`   ❌ Failed to fetch papers for "${topic}": ${error.message}`);
        totalFailed += PAPERS_PER_TOPIC;
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ BULK IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📈 Total Inserted: ${totalInserted}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📚 Grand Total: ${totalInserted + totalSkipped + totalFailed}`);
    console.log('='.repeat(60) + '\n');

    // Verify in database
    const count = await Paper.count();
    console.log(`💾 Papers in database: ${count}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Transform OpenAlex work into paper format
 */
function transformWork(work) {
  const authors = work.authorships
    ? work.authorships.map(a => a.author.display_name).slice(0, 10).join(', ')
    : 'Unknown';

  const keywords = work.keywords
    ? work.keywords.map(k => k.keyword).slice(0, 10)
    : [];

  const url = work.primary_location?.pdf_url || work.primary_location?.landing_page_url || work.doi;
  const pdf_url = work.primary_location?.pdf_url || '';
  const source = work.primary_location?.source?.display_name || (work.doi ? 'DOI' : 'OpenAlex');

  return {
    title: work.title || 'Untitled',
    abstract: work.abstract || '',
    authors: authors,
    year: work.publication_year || null,
    source: source,
    url: url || '',
    pdf_url: pdf_url,
    keywords: keywords,
    doi: work.doi || null,
    cited_by_count: work.cited_by_count || 0
  };
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the import
bulkImportPapers();
