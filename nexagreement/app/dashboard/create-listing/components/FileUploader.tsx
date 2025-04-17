'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type FileUploaderProps = {
  onFileUploaded?: (file: File) => void;
  className?: string;
  label?: string;
};

export function FileUploader({ 
  onFileUploaded, 
  className = '', 
  label = 'Upload Document' 
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (onFileUploaded) {
        onFileUploaded(selectedFile);
      }
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10485760 // 10MB
  });

  return (
    <div className={className}>
      <label className="block text-white font-medium mb-2">
        {label}
      </label>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-10 h-10 mx-auto text-green-400 mb-3"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-white font-medium mb-1">{file.name}</p>
            <p className="text-white/60 text-sm mb-2">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (onFileUploaded) onFileUploaded(null as any);
              }}
              className="text-red-400 text-sm hover:underline"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-12 h-12 mx-auto text-white/40 mb-4"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
              />
            </svg>
            <p className="text-white/60 mb-2">
              Drag and drop your document here, or click to browse
            </p>
            <p className="text-white/40 text-sm mb-4">
              Supported formats: PDF, DOCX (Max size: 10MB)
            </p>
            <button 
              type="button" 
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
            >
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
} 