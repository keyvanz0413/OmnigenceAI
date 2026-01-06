import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { message } from 'antd';
import { uploadFile } from '@/utils/uploadService';
import type { FileUploadResult } from '@/utils/uploadService';

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onSuccess?: (result: FileUploadResult) => void;
  onError?: (error: Error) => void;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  className?: string;
  disabled?: boolean;
  mode?: 'dropzone' | 'button';
  uploadText?: string;
  uploadHint?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '*',
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  onSuccess,
  onError,
  beforeUpload,
  className = '',
  disabled = false,
  mode = 'dropzone',
  uploadText = 'Upload File',
  uploadHint = 'Click or drag file to this area'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      message.error(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`);
      return false;
    }

    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileMimeType = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) return fileExtension === type;
        if (type.includes('/*')) return fileMimeType.startsWith(type.split('/')[0]);
        return fileMimeType === type;
      });

      if (!isAccepted) {
        message.error(`File type not supported. Accepted: ${accept}`);
        return false;
      }
    }
    return true;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!validateFile(file)) return;

    if (beforeUpload) {
      try {
        if (!(await beforeUpload(file))) return;
      } catch (error) {
        console.error('beforeUpload error:', error);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file, setUploadProgress);
      message.success('File uploaded successfully!');
      onSuccess?.(result);
    } catch (error: any) {
      message.error(`Upload failed: ${error.message || 'Unknown error'}`);
      onError?.(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (mode === 'dropzone') {
    return (
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled && !isUploading) handleFileUpload(e.dataTransfer.files);
        }}
        className={`
          group relative min-h-[200px] bg-white border-4 border-dashed rounded-3xl 
          flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
          ${className}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="text-center space-y-4">
            <Loader2 className="animate-spin text-emerald-600 mx-auto" size={48} />
            <div className="space-y-2">
              <p className="text-emerald-600 font-bold text-xl">Uploading...</p>
              <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-sm text-slate-500">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-emerald-50 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <Upload className="text-emerald-600" size={48} />
            </div>
            <p className="text-2xl font-black text-slate-700">{uploadText}</p>
            <p className="text-slate-400 font-medium mt-2">{uploadHint}</p>
            <p className="text-xs text-slate-400 mt-2">Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isUploading}
      className={`inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isUploading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Uploading... {uploadProgress}%</span>
        </>
      ) : (
        <>
          <Upload size={20} />
          <span>{uploadText}</span>
        </>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled || isUploading}
      />
    </button>
  );
};

export default FileUploader;
