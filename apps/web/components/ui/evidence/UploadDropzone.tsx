'use client';

// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — UploadDropzone Reusable Component
// ──────────────────────────────────────────────────────────────

import React, { memo, useState, useCallback, useRef } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface UploadDropzoneProps {
  onFileSelected?: (file: File) => void;
  isProcessing?: boolean;
  className?: string;
  accept?: string;
}

export const UploadDropzone = memo<UploadDropzoneProps>(({
  onFileSelected,
  isProcessing = false,
  className,
  accept = 'image/*,video/*,.json,.pdf,.doc',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (onFileSelected) onFileSelected(e.dataTransfer.files[0]);
    }
  }, [onFileSelected]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onFileSelected) onFileSelected(e.target.files[0]);
    }
  }, [onFileSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Drop evidence file or click to browse"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
      className={cn(
        'p-6 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center space-y-2',
        isDragOver
          ? 'border-blue-400 bg-blue-900/15'
          : 'border-white/10 bg-[#0f1419]/50 hover:border-blue-500/30 hover:bg-[#0f1419]/80',
        isProcessing && 'pointer-events-none opacity-60',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <FileImage className={cn(
        'w-8 h-8 transition-colors',
        isDragOver ? 'text-blue-400' : 'text-gray-500'
      )} />

      <div>
        <p className="text-sm font-medium text-gray-300">
          {isProcessing ? 'Processing...' : (
            <>Drag & drop or <span className="text-blue-400 underline">browse</span></>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Images, video, PDF, and telemetry JSON
        </p>
      </div>
    </div>
  );
});

UploadDropzone.displayName = 'UploadDropzone';
export default UploadDropzone;
