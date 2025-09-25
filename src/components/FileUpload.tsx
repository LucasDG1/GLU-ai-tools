import React, { useState, useRef } from 'react';
import { Upload, File, Image, Video, X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UploadedFile {
  id: string;
  tool_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
  author_name: string;
}

interface FileUploadProps {
  toolId: string;
}

export function FileUpload({ toolId }: FileUploadProps) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-291b20a9`;

  React.useEffect(() => {
    fetchUploads();
  }, [toolId]);

  const fetchUploads = async () => {
    try {
      const response = await fetch(`${apiUrl}/uploads/${toolId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setFiles(data.uploads || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    if (!authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setUploading(true);
    
    for (const file of fileList) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'application/pdf', 'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} not supported`);
        continue;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 50MB)`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tool_id', toolId);
        formData.append('author_name', authorName);

        const response = await fetch(`${apiUrl}/uploads`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          body: formData
        });

        if (response.ok) {
          toast.success(`${file.name} uploaded successfully`);
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    fetchUploads();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={20} className="text-glu-green" />;
    if (fileType.startsWith('video/')) return <Video size={20} className="text-glu-orange" />;
    return <File size={20} className="text-glu-gray" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="text-glu-orange" size={24} />
        <h3 className="text-xl font-semibold text-gray-900">{t('upload.title')}</h3>
      </div>

      <p className="text-glu-gray mb-6">{t('upload.description')}</p>

      {/* Author Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{t('common.name')}</label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="px-4 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-glu-orange focus:border-transparent w-full max-w-sm"
        />
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver 
            ? 'border-glu-orange bg-orange-50' 
            : 'border-gray-300 hover:border-glu-orange hover:bg-gray-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Upload size={48} className={`mx-auto mb-4 ${dragOver ? 'text-glu-orange' : 'text-glu-gray'}`} />
        <p className="text-lg font-medium mb-2">{t('upload.dragDrop')}</p>
        <p className="text-sm text-glu-gray">
          Supported: Images, Videos, PDFs, Text files (max 50MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.txt"
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-glu-orange"></div>
            <span className="text-glu-gray">Uploading...</span>
          </div>
        </div>
      )}

      {/* Uploaded Files Gallery */}
      {files.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Student Work Gallery</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  {getFileIcon(file.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.file_name}</p>
                    <p className="text-sm text-glu-gray">by {file.author_name}</p>
                  </div>
                </div>

                {/* Preview for images */}
                {file.file_type.startsWith('image/') && (
                  <div className="mb-3">
                    <img 
                      src={file.file_url} 
                      alt={file.file_name}
                      className="w-full h-32 object-cover bg-gray-100"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-glu-gray">
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  <a 
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-glu-orange hover:text-glu-orange/80 transition-colors"
                  >
                    <Download size={16} />
                    <span>View</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}