'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { uploadToIPFS } from '@/app/utils/ipfs';

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  acceptedFileTypes?: string; // Allows customizing accepted file types
  maxSizeMB?: number; // Allows setting max file size in MB
}

export function FileUploader({ 
  onFileUploaded, 
  acceptedFileTypes = 'application/pdf', 
  maxSizeMB = 10 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.match(acceptedFileTypes)) {
      setError(`Please select a valid file type (${acceptedFileTypes})`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit`);
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // Validate file
    if (!validateFile(file)) {
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Start simulated progress bar for UX feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // Upload to IPFS
      const ipfsUrl = await uploadToIPFS(file);
      
      // Finish progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileUploaded(ipfsUrl);
        setIsUploading(false);
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      console.error('Error uploading file:', err);
      setError(errorMessage);
      setIsUploading(false);
      setFileName(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">
        Agreement Document (PDF)
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500/50 bg-blue-500/10' 
            : error 
              ? 'border-red-500/50 bg-red-500/5' 
              : 'border-white/20 hover:border-white/30 bg-black/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept={acceptedFileTypes}
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="py-4">
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-white/70">Uploading to IPFS... {uploadProgress}%</p>
            <p className="mt-1 text-xs text-white/50">
              Your file is being securely stored on the decentralized IPFS network
            </p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center space-x-2">
            <svg 
              className="h-6 w-6 text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-white/90">{fileName}</span>
          </div>
        ) : (
          <>
            <svg 
              className="mx-auto h-12 w-12 text-white/40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm text-white/70">
              Drag and drop your PDF agreement, or click to select
            </p>
            <p className="mt-1 text-xs text-white/50">
              PDF format only, max {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-400">
          {error}
        </div>
      )}
      
      {fileName && !isUploading && !error && (
        <div className="mt-2 text-sm text-green-400">
          File uploaded to IPFS successfully
        </div>
      )}
    </div>
  );
} 