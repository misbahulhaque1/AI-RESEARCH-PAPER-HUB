import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { paperService, summaryService, savedService } from '../services/paperService';
import { Bookmark, Calendar, FileText, ExternalLink, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const PaperDetail = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaper();
    loadSummary();
  }, [id]);

  const loadPaper = async () => {
    try {
      const response = await paperService.getPaperById(id);
      setPaper(response.data);
    } catch (error) {
      console.error('Error loading paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await summaryService.getSummary(id);
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleSave = async () => {
    try {
      await savedService.savePaper(id);
      toast.success('Paper saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save paper');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!paper) {
    return <div className="text-center py-12">Paper not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{paper.title}</h1>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
          {paper.year && (
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{paper.year}</span>
            </div>
          )}
          {paper.source && (
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>{paper.source}</span>
            </div>
          )}
        </div>

        {paper.pdf_url && (
          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center"
          >
            <ExternalLink size={16} className="mr-2" />
            View PDF
          </a>
        )}

        <button onClick={handleSave} className="btn-secondary ml-4 inline-flex items-center">
          <Bookmark size={16} className="mr-2" />
          Save Paper
        </button>
      </div>

      {paper.abstract && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
        </div>
      )}

      {summary && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">AI Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{summary.summary_text}</p>
          
          {summary.key_points && summary.key_points.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Key Points:</h3>
              <ul className="list-disc list-inside space-y-2">
                {summary.key_points.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.difficulty_level && (
            <div className="mt-4">
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {summary.difficulty_level}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperDetail;
