import React, { useEffect, useState } from 'react';
import { analyticsService, paperService } from '../services/paperService';
import PaperCard from '../components/PaperCard';
import PaperUpload from '../components/PaperUpload';
import { BookOpen, TrendingUp, Search, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadData();
  }, [sortBy]);

  const loadData = async () => {
    try {
      const [statsData, papersData] = await Promise.all([
        analyticsService.getStats(),
        paperService.getPapers(1, 12, { sort: sortBy, search: searchQuery })
      ]);
      setStats(statsData.data || statsData);
      setPapers(papersData.data?.papers || papersData.papers || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUploadSuccess = () => {
    loadData(); // Reload papers after upload
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to AI Research Paper Intelligence Platform</p>
        </div>
        <PaperUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Search and Filter */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search papers by title, abstract, or authors..."
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_downloaded">Most Downloaded</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Papers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalPapers || 0}</p>
            </div>
            <BookOpen className="text-primary-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Saved Papers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalSaved || 0}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recent Papers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.recentPapers || 0}</p>
            </div>
            <Search className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
            </div>
            <BarChart3 className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Papers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Papers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard key={paper.paper_id} paper={paper} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
