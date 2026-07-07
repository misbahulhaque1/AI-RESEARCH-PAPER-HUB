import React, { useEffect, useState } from 'react';
import { recommendationService } from '../services/paperService';
import PaperCard from '../components/PaperCard';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationService.getRecommendations();
      setRecommendations(response.data?.recommendations || response.recommendations || []);
      setReason(response.data?.reason || response.reason || '');
    } catch (error) {
      console.error('Error loading recommendations:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
        <p className="text-gray-600">Personalized paper recommendations for you</p>
      </div>

      {reason && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{reason}</p>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No recommendations yet. Save some papers to get personalized recommendations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((paper) => (
            <PaperCard key={paper.paper_id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
