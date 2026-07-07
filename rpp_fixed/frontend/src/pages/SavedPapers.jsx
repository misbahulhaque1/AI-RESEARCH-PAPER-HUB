import React, { useEffect, useState } from 'react';
import { savedService } from '../services/paperService';
import PaperCard from '../components/PaperCard';

const SavedPapers = () => {
  const [savedPapers, setSavedPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPapers();
  }, []);

  const loadSavedPapers = async () => {
    try {
      const response = await savedService.getSavedPapers();
      setSavedPapers(response.data?.savedPapers || response.savedPapers || []);
    } catch (error) {
      console.error('Error loading saved papers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Papers</h1>
        <p className="text-gray-600">Your bookmarked research papers</p>
      </div>

      {savedPapers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No saved papers yet. Start exploring and save papers you find interesting!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedPapers.map((paper) => (
            <PaperCard key={paper.paper_id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPapers;
