'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DisplayableFile {
  id: string;
  file?: File;
  preview: string;
}

interface ExpenseUploaderProps {
  onFilesChange: (files: File[]) => void;
  existingAttachments: string[];
  onExistingAttachmentRemove: (path: string) => void;
}

const ExpenseUploader: React.FC<ExpenseUploaderProps> = ({
  onFilesChange,
  existingAttachments,
  onExistingAttachmentRemove,
}) => {
  const [displayFiles, setDisplayFiles] = useState<DisplayableFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to keep track of created blob URLs to prevent premature revocation
  const createdUrlsRef = useRef<string[]>([]);

  // Synchronize existing attachments from props
  useEffect(() => {
    setDisplayFiles(currentFiles => {
      const newFiles = currentFiles.filter(df => df.file);
      const existingAsDisplayable = existingAttachments.map(path => ({
        id: path,
        preview: path,
      }));
      return [...existingAsDisplayable, ...newFiles];
    });
  }, [existingAttachments]);

  // Report file changes to the parent form
  useEffect(() => {
    const newFiles = displayFiles.map(df => df.file).filter((f): f is File => !!f);
    onFilesChange(newFiles);
  }, [displayFiles, onFilesChange]);

  // Cleanup effect for blob URLs
  useEffect(() => {
    // This runs only when the component unmounts
    return () => {
      createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    if (displayFiles.length + acceptedFiles.length > 5) {
      setError('Maximum 5 files allowed.');
      return;
    }

    const newDisplayFiles = acceptedFiles.map(file => {
      const url = URL.createObjectURL(file);
      createdUrlsRef.current.push(url); // Track the new URL
      return {
        id: `${file.name}-${file.lastModified}`,
        file: file,
        preview: url,
      };
    });

    setDisplayFiles(current => [...current, ...newDisplayFiles]);

    if (fileRejections.length > 0) {
      setError(`${fileRejections[0].file.name}: ${fileRejections[0].errors[0].message}`);
    }
  }, [displayFiles]);

  const removeFile = (id: string) => {
    const fileToRemove = displayFiles.find(f => f.id === id);
    if (!fileToRemove) return;

    if (fileToRemove.file) {
      // This is a new file, revoke its URL and remove from tracking
      URL.revokeObjectURL(fileToRemove.preview);
      createdUrlsRef.current = createdUrlsRef.current.filter(url => url !== fileToRemove.preview);
      setDisplayFiles(current => current.filter(f => f.id !== id));
    } else {
      // This is an existing attachment, call the parent handler
      onExistingAttachmentRemove(id);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxSize: 4 * 1024 * 1024, // 4MB
  });

  return (
    <div className="space-y-4">
      <Label htmlFor="file-upload">
        <span className="hidden sm:inline">Upload Bukti Pembelian (Max 5 files, 4MB/file, JPEG/PNG)</span>
        <span className="sm:hidden">Upload Files (Max 5, 4MB)</span>
      </Label>
      <div
        {...getRootProps()}
        className={cn(
          "min-h-[60px] border border-gray-300 rounded-md cursor-pointer transition-colors",
          "hover:border-gray-400",
          isDragActive ? "border-blue-500 bg-blue-50" : "",
          displayFiles.length >= 5 ? "cursor-not-allowed opacity-70" : "",
          "flex flex-wrap items-center justify-center p-2 gap-2"
        )}
      >
        <Input {...getInputProps()} id="file-upload" className="hidden" />
        {displayFiles.length === 0 ? (
          <div className="flex flex-col items-center text-center text-muted-foreground">
            <UploadCloud className="h-6 w-6 mb-1" />
            {isDragActive ? <p>Drop files here...</p> : <p className="text-xs sm:text-sm">Drag & drop or click</p>}
          </div>
        ) : (
          <>
            {displayFiles.map(df => (
              <div key={df.id} className="relative h-16 w-16 sm:h-20 sm:w-20 border rounded-md overflow-hidden">
                <Image
                  src={df.preview}
                  alt={df.file?.name || 'existing attachment'}
                  fill
                  style={{ objectFit: 'cover' }} // Modern way for next/image
                  className="rounded-md"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(df.id); }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                  aria-label={`Remove ${df.file?.name || 'attachment'}`}
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
            {displayFiles.length < 5 && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-16 w-16 sm:h-20 sm:w-20 border-2 border-dashed rounded-md p-1">
                <UploadCloud className="h-6 w-6 mb-1" />
                <p className="text-xs text-center">Add more</p>
              </div>
            )}
          </>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default ExpenseUploader;