'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection, FileError } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { XCircle, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseUploaderProps {
  onFilesChange: (files: File[]) => void; // Callback to pass selected File objects to parent
  existingAttachments: string[]; // Paths of already uploaded files
  onExistingAttachmentRemove: (path: string) => void; // Callback for removing existing attachments
}

const ExpenseUploader: React.FC<ExpenseUploaderProps> = ({
  onFilesChange,
  existingAttachments,
  onExistingAttachmentRemove,
}) => {
  const [newlySelectedFiles, setNewlySelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pass newly selected files to parent whenever they change
  useEffect(() => {
    onFilesChange(newlySelectedFiles);
  }, [newlySelectedFiles, onFilesChange]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null); // Clear previous errors

    const totalFilesCount = newlySelectedFiles.length + existingAttachments.length;
    const newFilesToAdd = acceptedFiles.filter(file => {
      const maxFileSize = 4 * 1024 * 1024; // 4MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.name}. Only JPEG and PNG are allowed.`);
        return false;
      }
      if (file.size > maxFileSize) {
        setError(`File size exceeds 4MB for ${file.name}.`);
        return false;
      }
      return true;
    });

    if (totalFilesCount + newFilesToAdd.length > 5) {
      setError('Maximum 5 files allowed. Some files were not added.');
      setNewlySelectedFiles(prevFiles => [
        ...prevFiles,
        ...newFilesToAdd.slice(0, 10 - totalFilesCount),
      ]);
    } else {
      setNewlySelectedFiles(prevFiles => [...prevFiles, ...newFilesToAdd]);
    }

    if (fileRejections.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((err: FileError) => {
          setError(`${file.name}: ${err.message}`);
        });
      });
    }
  }, [newlySelectedFiles, existingAttachments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxSize: 4 * 1024 * 1024, // 4MB
    maxFiles: 5, // This limits selection, but we also handle it manually in onDrop for better error messages
    noClick: newlySelectedFiles.length + existingAttachments.length >= 5, // Disable click if max files reached
    noKeyboard: newlySelectedFiles.length + existingAttachments.length >= 5, // Disable keyboard if max files reached
  });

  const removeNewlySelectedFile = (fileToRemove: File) => {
    setNewlySelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const totalCurrentFiles = newlySelectedFiles.length + existingAttachments.length;

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
          totalCurrentFiles >= 5 ? "cursor-not-allowed opacity-70" : "",
          "flex flex-wrap items-center justify-center p-2 gap-2"
        )}
      >
        <Input {...getInputProps()} id="file-upload" className="hidden" />
        {totalCurrentFiles === 0 ? (
          <div className="flex flex-col items-center text-center text-muted-foreground">
            <UploadCloud className="h-6 w-6 mb-1" />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p className="text-xs sm:text-sm">Drag & drop or click to upload</p>
            )}
          </div>
        ) : (
          <>
            {existingAttachments.map((path, index) => (
              <div key={`existing-${index}`} className="relative h-16 basis-16 flex-grow border rounded-md overflow-hidden">
                <Image
                  src={path}
                  alt={`Existing attachment ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); onExistingAttachmentRemove(path); }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                  aria-label={`Remove existing attachment ${index + 1}`}
                >
                  <XCircle size={12} />
                </button>
              </div>
            ))}
            {newlySelectedFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative h-16 basis-16 flex-grow border rounded-md overflow-hidden">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeNewlySelectedFile(file); }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                  aria-label={`Remove ${file.name}`}
                >
                  <XCircle size={12} />
                </button>
              </div>
            ))}
            {totalCurrentFiles < 5 && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-16 basis-16 flex-grow border-2 border-dashed rounded-md p-1">
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
