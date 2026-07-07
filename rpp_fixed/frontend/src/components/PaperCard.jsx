import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Calendar, FileText, Download } from 'lucide-react';
import { paperService } from '../services/paperService';

const PaperCard = ({ paper }) => {
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    paperService.downloadPaper(paper.paper_id);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        <Link to={`/papers/${paper.paper_id}`} className="hover:text-primary-600">
          {paper.title}
        </Link>
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {paper.abstract || 'No abstract available'}
      </p>

      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.tags.slice(0, 5).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {paper.year && (
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{paper.year}</span>
            </div>
          )}
          
          {paper.source && (
            <div className="flex items-center space-x-1">
              <FileText size={14} />
              <span>{paper.source}</span>
            </div>
          )}

          {paper.downloads_count > 0 && (
            <div className="flex items-center space-x-1">
              <Download size={14} />
              <span>{paper.downloads_count}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {(paper.pdf_url || paper.file_url) && (
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm flex items-center space-x-1"
              title="Download PDF"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          )}
          <Link
            to={`/papers/${paper.paper_id}`}
            className="btn-primary text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
