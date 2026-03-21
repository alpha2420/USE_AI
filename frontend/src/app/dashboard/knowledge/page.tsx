'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Link2, FileText, AlignLeft, UploadCloud, Loader2 } from 'lucide-react';

export default function KnowledgePage() {
  const [url, setUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const urlMutation = useMutation({
    mutationFn: (newUrl: string) => api.post('/knowledge/url', { url: newUrl }),
    onSuccess: () => {
      toast.success('Website crawled and indexed successfully!');
      setUrl('');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to process URL'),
  });

  const manualMutation = useMutation({
    mutationFn: (text: string) => api.post('/knowledge/manual', { text }),
    onSuccess: () => {
      toast.success('Text added to knowledge base successfully!');
      setManualText('');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to process text'),
  });

  const pdfMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/knowledge/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('PDF parsed and indexed successfully!');
      setFile(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to process PDF'),
  });

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Knowledge Base</h1>
      <p className="text-gray-500">Train your AI agent by securely uploading context below.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Card 1: URL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2bg-blue-50 text-blue-600 rounded-lg">
              <Link2 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Upload URL</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-4">Paste an active URL. useAI will securely crawl the text context of the page.</p>
              <input 
                type="url" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://example.com" 
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={urlMutation.isPending}
              />
            </div>
            <button 
              onClick={() => urlMutation.mutate(url)} 
              disabled={urlMutation.isPending || !url.trim()} 
              className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
            >
              {urlMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {urlMutation.isPending ? 'Crawling...' : 'Train AI'}
            </button>
          </div>
        </div>

        {/* Card 2: PDF */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2bg-red-50 text-red-600 rounded-lg">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Upload PDF</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-4">Drag and drop a PDF manual, FAQ doc, or internal SOPs.</p>
              <label 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <p className="text-sm text-red-600 font-medium truncate max-w-full px-4">{file.name}</p>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 px-4 text-center">Click or drag and drop<br/>PDF (MAX. 10MB)</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  onChange={e => setFile(e.target.files?.[0] || null)} 
                  disabled={pdfMutation.isPending}
                />
              </label>
            </div>
            <button 
              onClick={() => file && pdfMutation.mutate(file)} 
              disabled={!file || pdfMutation.isPending} 
              className="mt-6 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
            >
              {pdfMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {pdfMutation.isPending ? 'Processing Document...' : 'Upload PDF'}
            </button>
          </div>
        </div>

        {/* Card 3: Manual Text */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2bg-purple-50 text-purple-600 rounded-lg">
              <AlignLeft className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Manual Text</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-4">Type raw rules or context explicitly.</p>
              <div className="relative">
                <textarea 
                  value={manualText} 
                  onChange={e => setManualText(e.target.value)} 
                  rows={4} 
                  placeholder="e.g. Our business hours are..." 
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                  disabled={manualMutation.isPending}
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-400">{manualText.length} chars</span>
              </div>
            </div>
            <button 
              onClick={() => manualMutation.mutate(manualText)} 
              disabled={!manualText.trim() || manualMutation.isPending} 
              className="mt-6 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
            >
              {manualMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {manualMutation.isPending ? 'Learning...' : 'Add Knowledge'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
