require('dotenv').config();
const { importFromOpenAlex } = require('../services/paperImportService');
const { connectMySQL } = require('../config/mysql');
const Paper = require('../models/Paper');

/**
 * Script to import papers from OpenAlex into MySQL database
 * Usage: npm run import:openalex -- --count=100 --query="machine learning"
 */

async function importPapers() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let count = 50;
  let query = 'computer science';

  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      count = parseInt(arg.split('=')[1]);
    }
    if (arg.startsWith('--query=')) {
      query = arg.split('=')[1].replace(/"/g, '');
    }
  });

  console.log('\n🚀 Starting OpenAlex Paper Import');
  console.log(`📊 Count: ${count}`);
  console.log(`🔍 Query: "${query}"\n`);

  try {
    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    await connectMySQL();
    console.log('✅ MySQL connected\n');

    // Import papers from OpenAlex
    const papers = await importFromOpenAlex(query, count);

    if (papers.length === 0) {
      console.log('⚠️  No papers found to import');
      process.exit(0);
    }

    // Insert papers into MySQL
    console.log(`\n💾 Inserting ${papers.length} papers into database...`);
    let inserted = 0;
    let skipped = 0;

    for (const paperData of papers) {
      try {
        // Check if paper already exists (by title similarity)
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

        if (inserted % 10 === 0) {
          console.log(`  Progress: ${inserted} papers inserted...`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to insert paper: ${paperData.title.substring(0, 50)}...`);
      }
    }

    console.log('\n✅ Import Complete!');
    console.log(`📈 Inserted: ${inserted} papers`);
    console.log(`⏭️  Skipped: ${skipped} papers (already exists)`);
    console.log(`📚 Total processed: ${papers.length} papers\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
importPapers();
