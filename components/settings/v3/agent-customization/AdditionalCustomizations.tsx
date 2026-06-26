import {
  getPresignedUrlsAPI,
  uploadFileToS3,
} from '@/services/settings/onboarding.service';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFile,
  FiTrash2,
  FiUpload,
  FiX,
} from 'react-icons/fi';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress?: number;
  isUploading?: boolean;
  uploadedUrl?: string;
  error?: string;
  file?: File;
}

interface AdditionalCustomizationsProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  errors?: {
    additionalCustomizations?: string;
  };
}

const AdditionalCustomizations: React.FC<AdditionalCustomizationsProps> = ({
  files,
  onChange,
  errors = {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const filesRef = useRef<UploadedFile[]>(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    // Filter to only allow CSV files
    const csvFiles = Array.from(selectedFiles).filter((file) => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.csv');
    });

    if (csvFiles.length === 0) {
      // Optionally show an error message if no CSV files were selected
      console.warn('Only CSV files are allowed');
      return;
    }

    const newFiles: UploadedFile[] = csvFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      progress: 0,
      isUploading: true,
      file: file,
    }));

    const updatedFiles = [...files, ...newFiles];
    onChange(updatedFiles);

    // Start uploading files
    uploadFiles(newFiles);
  };

  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<UploadedFile>) => {
      const updatedFiles = filesRef.current.map((f) =>
        f.id === fileId ? { ...f, ...updates } : f
      );
      filesRef.current = updatedFiles;
      onChange(updatedFiles);
    },
    [onChange]
  );

  const uploadFiles = useCallback(
    async (filesToUpload: UploadedFile[]) => {
      try {
        // Step 1: Get presigned URLs for all files
        const imageList = filesToUpload.map((file) => ({
          fileName: file.name,
          fileType: file.file?.type || 'application/octet-stream',
        }));

        const presignedResponse = await getPresignedUrlsAPI({
          imageList,
          bucketType: 'images',
        });

        if (presignedResponse.error || !presignedResponse.data) {
          throw new Error('Failed to get presigned URLs');
        }

        // Step 2: Upload each file to S3 using its presigned URL
        const uploadPromises = filesToUpload.map(async (fileItem, index) => {
          const presignedData = presignedResponse.data[index];
          const file = fileItem.file;

          if (!file || !presignedData) {
            updateFileStatus(fileItem.id, {
              isUploading: false,
              error: 'Failed to get upload URL',
              progress: 0,
            });
            return;
          }

          try {
            await uploadFileToS3(
              presignedData.presignedURL,
              file,
              (progress) => {
                updateFileStatus(fileItem.id, {
                  progress,
                  isUploading: true,
                });
              }
            );

            // Upload successful - update id to be the uploaded URL
            const uploadedUrl = presignedData.presignedURL.split('?')[0];
            const updatedFiles = filesRef.current.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    id: uploadedUrl, // Set id to the uploaded URL
                    progress: 100,
                    isUploading: false,
                    uploadedUrl: uploadedUrl,
                  }
                : f
            );
            filesRef.current = updatedFiles;
            onChange(updatedFiles);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            updateFileStatus(fileItem.id, {
              isUploading: false,
              error: 'Upload failed',
              progress: 0,
            });
          }
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error in upload process:', error);
        // Mark all files as failed
        filesToUpload.forEach((fileItem) => {
          updateFileStatus(fileItem.id, {
            isUploading: false,
            error: 'Failed to initiate upload',
            progress: 0,
          });
        });
      }
    },
    [updateFileStatus]
  );

  useEffect(() => {
    return () => {
      // Clean up all intervals when component unmounts
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [files, onChange]
  );

  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFileSelect(target.files);
    };
    input.click();
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = files.filter((f) => f.id !== fileId);
    onChange(updated);
    // Note: intervals will be cleaned up when they complete or when component unmounts
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Upload Additional Customizations
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          Which service facilities do you offer?
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div
          className={`flex h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-16 py-4 transition-colors ${
            isDragging
              ? 'border-[#4600f2] bg-[rgba(70,0,242,0.1)]'
              : 'border-[rgba(70,0,242,0.2)] bg-[rgba(70,0,242,0.05)]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <FiUpload className="h-12 w-12 text-[#4600f2]" strokeWidth={2} />

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-base">
                <span className="text-[#0b0b0b]">Drag your file(s) or</span>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="font-semibold text-[#4600f2] underline"
                >
                  browse
                </button>
                <span className="text-[#0b0b0b]">to upload</span>
              </div>
              <p className="text-center text-sm text-[#6d6d6d]">
                Add you existing leads in the sample CSV
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex flex-col gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4"
              >
                <div className="flex items-center gap-6">
                  <div className="flex h-8 w-8 items-center justify-center">
                    <FiFile className="h-8 w-8 text-[#4600f2]" />
                  </div>

                  <div className="flex flex-1 items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium leading-6 text-black/80">
                          {file.name}
                        </p>
                        {!file.isUploading &&
                          !file.error &&
                          file.uploadedUrl && (
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        {file.error && (
                          <FiAlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {file.error && (
                        <p className="text-xs text-red-500">{file.error}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="flex h-6 w-6 items-center justify-center text-black/60 hover:text-red-500"
                      disabled={file.isUploading}
                    >
                      {file.isUploading ? (
                        <FiX className="h-6 w-6" strokeWidth={2} />
                      ) : (
                        <FiTrash2 className="h-6 w-6" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {file.isUploading && (
                  <div className="flex items-center gap-6">
                    <div className="flex h-3 flex-1 overflow-hidden rounded-2xl bg-black/10">
                      <div
                        className="h-full bg-[#4600f2] transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-normal text-black/70">
                      {file.progress}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.additionalCustomizations && (
          <span className="text-xs text-red-500">
            {errors.additionalCustomizations}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdditionalCustomizations;
