import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/paperService';
import PaperCard from '../components/PaperCard';

const Analytics = () => {
  const [trending, setTrending] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [trendingData, topicsData] = await Promise.all([
        analyticsService.getTrendingPapers(),
        analyticsService.getPopularTopics()
      ]);
      setTrending(trendingData.data.papers || []);
      setTopics(topicsData.data.topics || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Trending papers and popular topics</p>
      </div>

      {/* Trending Papers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Papers</h2>
        {trending.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No trending papers yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trending.map((paper) => (
              <PaperCard key={paper.paper_id} paper={paper} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Topics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Search Topics</h2>
        {topics.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No search data yet</p>
          </div>
        ) : (
          <div className="card">
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-gray-700">{topic._id}</span>
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {topic.count} searches
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
