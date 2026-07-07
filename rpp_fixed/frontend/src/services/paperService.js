import api from './api';

export const paperService = {
  getPapers: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.year && { year: filters.year }),
      ...(filters.source && { source: filters.source }),
      ...(filters.sort && { sort: filters.sort })
    });
    const response = await api.get(`/papers?${params}`);
    return response.data;
  },

  getPaperById: async (id) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  uploadPaper: async (formData) => {
    const response = await api.post('/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  downloadPaper: (id) => {
    // Trigger download by opening the download URL
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/papers/download/${id}`, '_blank');
  },

  createPaper: async (paperData) => {
    const response = await api.post('/papers', paperData);
    return response.data;
  },

  updatePaper: async (id, paperData) => {
    const response = await api.put(`/papers/${id}`, paperData);
    return response.data;
  },

  deletePaper: async (id) => {
    const response = await api.delete(`/papers/${id}`);
    return response.data;
  }
};

export const summaryService = {
  getSummary: async (paperId) => {
    const response = await api.get(`/papers/${paperId}/summary`);
    return response.data;
  }
};

export const searchService = {
  search: async (query, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      page: filters.page || 1,
      limit: filters.limit || 20,
      ...(filters.year && { year: filters.year }),
      ...(filters.source && { source: filters.source })
    });
    const response = await api.get(`/search?${params}`);
    return response.data;
  }
};

export const savedService = {
  getSavedPapers: async (page = 1, limit = 20) => {
    const response = await api.get(`/saved?page=${page}&limit=${limit}`);
    return response.data;
  },

  savePaper: async (paperId) => {
    const response = await api.post(`/saved/${paperId}`);
    return response.data;
  },

  removeSavedPaper: async (paperId) => {
    const response = await api.delete(`/saved/${paperId}`);
    return response.data;
  }
};

export const recommendationService = {
  getRecommendations: async () => {
    const response = await api.get('/saved/recommendations');
    return response.data;
  }
};

export const analyticsService = {
  getTrendingPapers: async () => {
    const response = await api.get('/analytics/trending');
    return response.data;
  },

  getPopularTopics: async () => {
    const response = await api.get('/analytics/popular-topics');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/analytics/stats');
    return response.data;
  }
};
