import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, X, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'application/pdf' || selected.type.startsWith('image/'))) {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid PDF or Image file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('invoice', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/invoice/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
      onUploadSuccess();
      onClose();
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-900">Upload Invoice</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${
              file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2 text-center cursor-pointer">
              <UploadCloud className={`mx-auto h-12 w-12 ${file ? 'text-blue-500' : 'text-slate-400'}`} />
              <div className="flex text-sm text-slate-600 justify-center">
                <span className="relative font-medium text-blue-600 bg-transparent rounded-md hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  {file ? file.name : 'Upload a file'}
                </span>
                {!file && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,image/*"
            onChange={handleFileChange}
          />

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Invoice'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
