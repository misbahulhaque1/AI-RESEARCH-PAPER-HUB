// Demo mode in-memory store for testing without databases
const demoStore = {
  users: [],
  papers: [],
  savedPapers: [],
  summaries: [],
  searchHistory: []
};

let userIdCounter = 1;
let paperIdCounter = 1;

// User operations
demoStore.createUser = (userData) => {
  const user = {
    user_id: userIdCounter++,
    ...userData,
    created_at: new Date().toISOString()
  };
  demoStore.users.push(user);
  return user;
};

demoStore.findUserByEmail = (email) => {
  return demoStore.users.find(u => u.email === email);
};

demoStore.findUserById = (id) => {
  return demoStore.users.find(u => u.user_id === id);
};

// Paper operations
demoStore.createPaper = (paperData) => {
  const paper = {
    paper_id: paperIdCounter++,
    ...paperData,
    created_at: new Date().toISOString()
  };
  demoStore.papers.push(paper);
  return paper;
};

demoStore.getAllPapers = () => {
  return demoStore.papers;
};

demoStore.getPaperById = (id) => {
  return demoStore.papers.find(p => p.paper_id === parseInt(id));
};

demoStore.searchPapers = (query) => {
  const q = query.toLowerCase();
  return demoStore.papers.filter(p => 
    p.title?.toLowerCase().includes(q) ||
    p.abstract?.toLowerCase().includes(q) ||
    p.keywords?.some(k => k.toLowerCase().includes(q))
  );
};

// Saved papers operations
demoStore.savePaper = (userId, paperId) => {
  const saved = {
    user_id: userId,
    paper_id: paperId,
    saved_at: new Date().toISOString()
  };
  demoStore.savedPapers.push(saved);
  return saved;
};

demoStore.getUserSavedPapers = (userId) => {
  return demoStore.savedPapers
    .filter(sp => sp.user_id === userId)
    .map(sp => demoStore.getPaperById(sp.paper_id))
    .filter(p => p);
};

demoStore.unsavePaper = (userId, paperId) => {
  const index = demoStore.savedPapers.findIndex(
    sp => sp.user_id === userId && sp.paper_id === parseInt(paperId)
  );
  if (index !== -1) {
    demoStore.savedPapers.splice(index, 1);
    return true;
  }
  return false;
};

// Analytics
demoStore.getAnalytics = () => {
  return {
    totalPapers: demoStore.papers.length,
    totalUsers: demoStore.users.length,
    totalSaves: demoStore.savedPapers.length
  };
};

// Clear store (for testing)
demoStore.clear = () => {
  demoStore.users = [];
  demoStore.papers = [];
  demoStore.savedPapers = [];
  demoStore.summaries = [];
  demoStore.searchHistory = [];
  userIdCounter = 1;
  paperIdCounter = 1;
};

// Add some demo data
demoStore.seedDemoData = () => {
  demoStore.papers = [
    {
      paper_id: paperIdCounter++,
      title: 'Deep Learning for Natural Language Processing',
      abstract: 'A comprehensive survey of deep learning techniques applied to NLP tasks.',
      authors: 'John Smith, Jane Doe',
      year: 2024,
      source: 'arXiv',
      url: 'https://arxiv.org/abs/1234.5678',
      keywords: ['deep learning', 'NLP', 'neural networks'],
      created_at: new Date().toISOString()
    },
    {
      paper_id: paperIdCounter++,
      title: 'Transformer Architecture in Computer Vision',
      abstract: 'Exploring the application of transformer models to image recognition tasks.',
      authors: 'Alice Johnson, Bob Wilson',
      year: 2024,
      source: 'IEEE',
      url: 'https://ieeexplore.ieee.org/document/123456',
      keywords: ['transformers', 'computer vision', 'image recognition'],
      created_at: new Date().toISOString()
    },
    {
      paper_id: paperIdCounter++,
      title: 'Reinforcement Learning: A Survey',
      abstract: 'An overview of modern reinforcement learning algorithms and their applications.',
      authors: 'Michael Brown',
      year: 2023,
      source: 'ACM',
      url: 'https://dl.acm.org/doi/10.1145/123456',
      keywords: ['reinforcement learning', 'AI', 'algorithms'],
      created_at: new Date().toISOString()
    }
  ];
};

module.exports = demoStore;
