'use client';

import { useRef, useState } from 'react';
import { Check, CircleSlash, MoreVertical, StickyNote, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { FloatingPanel } from '@/components/settings/ui/floating-panel';
import type { OverrideKind, ViniStatusOverride } from '@/lib/settings/vini-status-overrides';

interface OverrideMenuProps {
  current: ViniStatusOverride | null;
  onSet: (patch: { kind?: OverrideKind | null; note?: string | null }) => void;
  onClear: () => void;
}

/** Per-row "⋮" menu. Renders a single icon trigger that opens a portaled
 *  panel with: Mark Ready · Flag Blocked · Add/Edit Note · Clear Override.
 *  Adding a note swaps the panel content to a small textarea + Save. */
export function OverrideMenu({ current, onSet, onClear }: OverrideMenuProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'note'>('menu');
  const [draftNote, setDraftNote] = useState('');

  const close = () => {
    setOpen(false);
    setMode('menu');
  };

  const openNoteMode = () => {
    setDraftNote(current?.note ?? '');
    setMode('note');
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Override actions"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md text-black-40 transition-colors',
          'hover:bg-gray-8 hover:text-black-80',
          open && 'bg-gray-8 text-black-80'
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <FloatingPanel
        anchorRef={anchorRef}
        open={open}
        onClose={close}
        placement="bottom-end"
        width={240}
        className="rounded-xl border border-black/10 bg-white shadow-lg"
      >
        {mode === 'menu' ? (
          <ul className="py-1.5 text-sm">
            <MenuItem
              icon={<Check className="h-4 w-4 text-green-darker" />}
              label="Mark Ready"
              selected={current?.kind === 'ready'}
              onClick={() => {
                onSet({ kind: 'ready' });
                close();
              }}
            />
            <MenuItem
              icon={<CircleSlash className="h-4 w-4 text-red-warningRed" />}
              label="Flag Blocked"
              selected={current?.kind === 'blocked'}
              onClick={() => {
                onSet({ kind: 'blocked' });
                close();
              }}
            />
            <MenuItem
              icon={<StickyNote className="h-4 w-4 text-blue-light" />}
              label={current?.note ? 'Edit Note' : 'Add Note'}
              onClick={openNoteMode}
            />
            {(current?.kind || current?.note) && (
              <>
                <li className="my-1 border-t border-black/8" />
                <MenuItem
                  icon={<X className="h-4 w-4 text-black-60" />}
                  label="Clear Override"
                  onClick={() => {
                    onClear();
                    close();
                  }}
                />
              </>
            )}
          </ul>
        ) : (
          <div className="p-3">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-black-40">
              Note
            </label>
            <textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value.slice(0, 120))}
              rows={3}
              autoFocus
              placeholder="What's happening here?"
              className="block w-full resize-none rounded-md border border-black/15 px-2 py-1.5 text-sm text-black-80 placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-black-40">
              <span>{draftNote.length}/120</span>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-md px-2 py-1 text-xs font-medium text-black-60 hover:bg-gray-8"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSet({ note: draftNote.trim() ? draftNote.trim() : null });
                  close();
                }}
                className="rounded-md bg-blue-light px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
              >
                Save note
              </button>
            </div>
          </div>
        )}
      </FloatingPanel>
    </>
  );
}

function MenuItem({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-black-80 transition-colors',
          'hover:bg-gray-8',
          selected && 'font-semibold'
        )}
      >
        {icon}
        <span className="flex-1">{label}</span>
        {selected && <Check className="h-3.5 w-3.5 text-blue-light" />}
      </button>
    </li>
  );
}
