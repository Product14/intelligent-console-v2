import { useCallback, useRef, useState } from 'react';
import { IoInformationCircleOutline, IoWarning } from 'react-icons/io5';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { MdOutlineCheckCircle } from 'react-icons/md';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

interface ExcelUploadProps {
  onUploadComplete: (file: File) => void;
  isUploading: boolean;
  onUploadStart: (file: File) => void;
  sampleFileUrl: string;
  uploadError?: {
    message: string;
    errorFileUrl?: string;
  } | null;
}

const EXPECTED_FIELDS: { label: string; optional?: boolean }[] = [
  { label: 'First Name' },
  { label: 'Last Name' },
  { label: 'Role' },
  { label: 'Department' },
  { label: 'Phone Number' },
  { label: 'Extension', optional: true },
  { label: 'Email', optional: true },
];

type UploadState =
  | { status: 'idle' }
  | { status: 'ready'; file: File }
  | { status: 'uploading' };

export const ExcelUpload = ({
  onUploadComplete,
  isUploading,
  onUploadStart,
  sampleFileUrl,
  uploadError,
}: ExcelUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setUploadState({ status: 'ready', file });
      onUploadStart(file);
      onUploadComplete(file);
    },
    [onUploadStart, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadState({ status: 'idle' });
  };

  const handleSampleFileDownload = () => {
    if (!sampleFileUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = sampleFileUrl;
    downloadLink.download = 'SampleFile.xlsx';
    downloadLink.click();
  };

  const hasUploadError = Boolean(uploadError);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragOver && 'border-[#4600f2] bg-[#4600f2]/5',
          !isDragOver && !isUploading && 'border-gray-200 bg-gray-50',
          isUploading && 'border-[#4600f2]/40 bg-[#4600f2]/5'
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            hasUploadError ? 'bg-red-100' : 'bg-[#4600f2]/10'
          )}
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4600f2] border-t-transparent" />
          ) : hasUploadError ? (
            <IoWarning className="h-5 w-5 text-red-600" />
          ) : selectedFile ? (
            <MdOutlineCheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <LuUpload className="h-5 w-5 text-[#4600f2]" />
          )}
        </div>

        {selectedFile ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-neutral-950">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
            {isUploading ? (
              <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full animate-pulse rounded-full bg-[#4600f2]"
                  style={{ width: '60%' }}
                />
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="mt-1 text-xs font-medium text-[#4600f2] underline underline-offset-2"
              >
                Choose a different file
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-gray-600">
              Drag & Drop excel file(s) or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-[#4600f2] underline underline-offset-2"
              >
                browse
              </button>{' '}
              to upload
            </p>
            <p className="text-xs text-gray-400">
              Add your employee directory file in XLSX format
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-gray-400">Expected fields:</span>
          {EXPECTED_FIELDS.map(({ label, optional }) => (
            <span
              key={label}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700"
            >
              {label}
              {optional && <span className="ml-0.5 text-gray-400"> opt</span>}
            </span>
          ))}
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <IoInformationCircleOutline className="h-4 w-4 shrink-0" />
            <span>{uploadError.message}</span>
          </div>
          {uploadError.errorFileUrl && (
            <a
              href={uploadError.errorFileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#4600f2] underline underline-offset-2"
            >
              <LuDownload className="h-3.5 w-3.5" />
              Download File (with instructions to remove errors)
            </a>
          )}
        </div>
      )}

      {!hasUploadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <IoInformationCircleOutline className="h-4 w-4 shrink-0" />
            <span>
              Use the sample CSV format exactly to ensure a successful upload
            </span>
          </div>
          <button
            type="button"
            onClick={handleSampleFileDownload}
            disabled={!sampleFileUrl}
            aria-disabled={!sampleFileUrl}
            className={cn(
              'flex shrink-0 items-center gap-1.5 text-xs font-medium underline underline-offset-2',
              sampleFileUrl
                ? 'text-[#4600f2]'
                : 'cursor-not-allowed text-gray-400 no-underline'
            )}
          >
            <LuDownload className="h-3.5 w-3.5" />
            Download sample csv file
          </button>
        </div>
      )}
    </div>
  );
};
