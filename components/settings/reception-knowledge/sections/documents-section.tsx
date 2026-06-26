'use client';

import { FileText, Trash2, Upload, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { DsButton } from '@/components/settings/ds';
import type {
  DocumentStatus,
  KnowledgeDocument,
} from '@/lib/settings/reception-knowledge-fixtures';

interface DocumentsSectionProps {
  items: KnowledgeDocument[];
  setItems: React.Dispatch<React.SetStateAction<KnowledgeDocument[]>>;
}

export function DocumentsSection({ items, setItems }: DocumentsSectionProps) {
  const fakeUpload = () => {
    const num = items.length + 1;
    setItems((prev) => [
      {
        id: `doc-${Date.now()}`,
        filename: `new-upload-${num}.pdf`,
        fileType: 'pdf',
        sizeKb: 512,
        uploadedBy: 'You',
        uploadedAt: 'Just now',
        status: 'processing',
        chunkCount: 0,
        timesReferenced: 0,
      },
      ...prev,
    ]);
  };

  const remove = (id: string) => setItems((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white p-4">
        <UploadCloud className="h-5 w-5 shrink-0 text-blue-light" />
        <div className="flex-1 text-sm text-black-dark">
          <strong>Upload PDFs / Word docs to enrich the agent's knowledge.</strong> Parsed into
          searchable chunks. The agent cites the source.
        </div>
        <DsButton
          label="Upload document"
          type="primary"
          size="AA"
          onClick={fakeUpload}
          icon={<Upload className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        <div className="hidden grid-cols-[1.6fr_60px_80px_100px_70px_70px_140px_40px] gap-3 border-b border-black/8 bg-gray-lighter/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-black-60 lg:grid">
          <div>Filename</div>
          <div>Type</div>
          <div>Size</div>
          <div>Status</div>
          <div>Chunks</div>
          <div>Used</div>
          <div>Uploaded</div>
          <div />
        </div>
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-black-40">No documents uploaded yet.</div>
        ) : (
          items.map((d) => (
            <div
              key={d.id}
              className="grid grid-cols-1 gap-2 border-b border-black/8 px-5 py-3 text-sm last:border-b-0 hover:bg-gray-lighter/50 lg:grid-cols-[1.6fr_60px_80px_100px_70px_70px_140px_40px] lg:items-center lg:gap-3"
            >
              <div className="flex items-center gap-2 font-semibold text-black-dark">
                <FileText className="h-4 w-4 text-red-500" />
                <span className="truncate">{d.filename}</span>
              </div>
              <div className="font-mono text-[11px] uppercase text-black-60">{d.fileType}</div>
              <div className="tabular-nums text-black-60">
                {d.sizeKb < 1024 ? `${d.sizeKb} KB` : `${(d.sizeKb / 1024).toFixed(1)} MB`}
              </div>
              <div>
                <StatusPill status={d.status} />
              </div>
              <div className="tabular-nums text-black-60">{d.chunkCount}</div>
              <div className="tabular-nums text-black-dark">
                {d.timesReferenced > 0 ? `${d.timesReferenced}×` : '—'}
              </div>
              <div className="text-xs text-black-60">
                {d.uploadedBy} · {d.uploadedAt}
              </div>
              <button
                type="button"
                onClick={() => remove(d.id)}
                aria-label="Remove document"
                className="justify-self-end text-black-40 transition-colors hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DocumentStatus }) {
  const cls =
    status === 'ready'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'processing'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-700';
  const label = status === 'ready' ? 'Ready' : status === 'processing' ? 'Processing' : 'Error';
  return (
    <span className={cn('inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold', cls)}>
      {label}
    </span>
  );
}
