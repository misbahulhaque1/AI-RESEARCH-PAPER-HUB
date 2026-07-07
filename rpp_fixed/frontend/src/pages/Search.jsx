import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/paperService';
import PaperCard from '../components/PaperCard';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await searchService.search(query);
      setResults(response.data?.papers || response.papers || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Papers</h1>
        <p className="text-gray-600">Find research papers using AI-powered search</p>
      </div>

      <form onSubmit={handleSearch} className="card">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search terms..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            <SearchIcon size={18} className="inline mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && <div className="text-center py-12">Searching...</div>}

      {searched && !loading && (
        <div>
          <p className="text-gray-600 mb-4">{results.length} results found</p>
          {results.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No papers found. Try different search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((paper) => (
                <PaperCard key={paper.paper_id} paper={paper} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
