require('dotenv').config();
const axios = require('axios');

async function testOpenAlex() {
  console.log('Testing OpenAlex API...');
  
  const response = await axios.get('https://api.openalex.org/works', {
    params: {
      search: 'artificial intelligence',
      per_page: 5,
      sort: 'cited_by_count:desc',
      filter: 'has_abstract:true,from_publication_date:2018-01-01'
    }
  });

  console.log(`\nRetrieved ${response.data.results.length} papers\n`);

  response.data.results.forEach((work, idx) => {
    console.log(`\n[${idx + 1}] ${work.title}`);
    console.log(`    Has abstract: ${!!work.abstract}`);
    console.log(`    Abstract length: ${work.abstract ? work.abstract.length : 0}`);
    console.log(`    Year: ${work.publication_year}`);
    console.log(`    DOI: ${work.doi || 'N/A'}`);
  });
}

testOpenAlex().catch(console.error);
