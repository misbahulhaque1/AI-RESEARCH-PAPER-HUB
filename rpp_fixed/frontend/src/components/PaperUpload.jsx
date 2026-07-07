import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { paperService } from '../services/paperService';
import toast from 'react-hot-toast';

const PaperUpload = ({ onUploadSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('abstract', abstract);
      formData.append('authors', authors);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)));

      const response = await paperService.uploadPaper(formData);
      
      toast.success('Paper uploaded successfully!');
      
      // Reset form
      setFile(null);
      setTitle('');
      setAbstract('');
      setAuthors('');
      setTags('');
      setIsOpen(false);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload paper');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Upload size={18} />
        <span>Upload Paper</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Research Paper</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle size={24} />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-600">Click to select PDF file</p>
                      <p className="text-sm text-gray-500 mt-1">Max file size: 50MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter paper title"
                required
              />
            </div>

            {/* Authors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authors
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="input-field"
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abstract
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Enter paper abstract"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field"
                placeholder="e.g., machine learning, AI, deep learning"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <FileText size={18} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload Paper</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperUpload;
