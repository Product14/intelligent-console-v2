'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import {
  fetchPlaceDetails,
  fetchPlacePredictions,
  geocodeAddress,
  isGooglePlacesConfigured,
  rebuildFormattedAddress,
  type ParsedAddress,
  type PlacePrediction,
} from '@/lib/settings/google-places';
import { AddressMapPreview } from './address-map';
import { FloatingPanel } from './floating-panel';

interface AddressFieldProps {
  label?: string;
  value: ParsedAddress | null;
  onChange: (next: ParsedAddress | null) => void;
  error?: string;
  required?: boolean;
  /** Optional row of quick-action buttons rendered above the search input
   *  (e.g. "Use rooftop address"). Only shown when the field is in search
   *  mode — once a value is set + the operator isn't actively changing it,
   *  quickActions hides to keep the compact pill view clean. */
  quickActions?: ReactNode;
}

export function AddressField({
  label = 'Address',
  value,
  onChange,
  error,
  required,
  quickActions,
}: AddressFieldProps) {
  const [query, setQuery] = useState<string>(value?.formattedAddress ?? '');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Anchor for the predictions dropdown — we portal the dropdown to
  // document.body via FloatingPanel so it escapes the accordion's
  // `overflow: hidden`. The panel's width tracks the wrapper's width so
  // suggestions visually align with the input below them.
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  // Structured-edit modal — opens on "Edit details" click. The map preview
  // (Maps JS dynamic load, ~$7 / 1000 mounts) lives ONLY inside this modal,
  // so the per-render page cost is zero unless an operator chooses to edit.
  const [isEditOpen, setIsEditOpen] = useState(false);
  // "Search mode" — operator clicked Change to swap in a different address.
  // When true, the compact pill is replaced by the Places search input;
  // selecting a result (or clicking Cancel) returns to the pill view. Keeps
  // the address visible only once at a time so the screen never shows the
  // same text twice.
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest value ref. The modal's geocodeNow reads from this so the value
  // it sends to Google is always the freshest one (React state updates
  // batch; the value prop in a callback closure can lag a render behind).
  const valueRef = useRef<ParsedAddress | null>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const placesConfigured = isGooglePlacesConfigured();

  // Keep query in sync if the parent updates value externally.
  useEffect(() => {
    setQuery(value?.formattedAddress ?? '');
  }, [value?.formattedAddress]);

  // Track the search wrapper's width so the portaled predictions panel can
  // match the input below it. Measured on open + on resize. useLayoutEffect
  // so the initial measurement is in place before the panel paints.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      if (searchWrapperRef.current) {
        setWrapperWidth(searchWrapperRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen]);

  const handleInputChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || !placesConfigured) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const next = await fetchPlacePredictions(q);
        setPredictions(next);
      } catch {
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = async (placeId: string) => {
    setIsOpen(false);
    const details = await fetchPlaceDetails(placeId);
    if (details) {
      onChange(details);
      setQuery(details.formattedAddress);
      // Done searching — fall back into the pill view.
      setIsSearching(false);
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setIsOpen(false);
    setPredictions([]);
    setQuery(value?.formattedAddress ?? '');
  };

  const updatePart = (key: keyof ParsedAddress, val: string) => {
    const current: ParsedAddress = value ?? {
      formattedAddress: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      state: '',
      country: '',
      countryCode: '',
      zipcode: '',
      lat: null,
      lng: null,
    };
    const next: ParsedAddress = { ...current, [key]: val };
    next.formattedAddress = rebuildFormattedAddress(next);
    onChange(next);
    setQuery(next.formattedAddress);
  };

  /**
   * Geocode the current address NOW (synchronous trigger, no debounce).
   * Used by the modal's Refresh button and the Done button. Returns
   * `true` when lat/lng were updated (either resolved or explicitly
   * nulled on ZERO_RESULTS), `false` when we bailed (no address text).
   *
   * Race-safe: re-reads the latest value via the ref AFTER the geocode
   * resolves, and only commits if the address text the operator sees
   * still matches what we sent. If they kept editing during the
   * network call, the result is discarded (caller's dirty flag stays
   * set so the next Done / Refresh will try again).
   */
  const geocodeNow = async (): Promise<boolean> => {
    const v = valueRef.current;
    if (!v) return false;
    const queryStr = rebuildFormattedAddress(v);
    if (!queryStr.trim()) return false;
    const result = await geocodeAddress(queryStr);
    const latest = valueRef.current;
    if (!latest) return false;
    // Discard if the operator typed more during the geocode — the result
    // we got is for the OLD text and applying it would lie.
    if (rebuildFormattedAddress(latest) !== queryStr) return false;
    if (result) {
      onChange({ ...latest, lat: result.lat, lng: result.lng });
    } else {
      // ZERO_RESULTS — explicitly null coords so the wire payload signals
      // "unknown" rather than carrying stale coords on a different address.
      onChange({ ...latest, lat: null, lng: null });
    }
    return true;
  };

  const hasParts =
    value &&
    (value.addressLine1 ||
      value.city ||
      value.state ||
      value.country ||
      value.zipcode);

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-black-80">
          {label}
          {required && <span className="ml-0.5 text-red">*</span>}
        </label>
      )}

      {/* Address surface is mutually exclusive: when a value is set AND
          the operator isn't actively searching for a different address,
          the compact pill renders. Otherwise the Places search input is
          shown. Never both — that produced the duplicate-display the user
          flagged. */}
      {hasParts && !isSearching ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/8 bg-gray-lighter px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-black-40" />
            <span className="truncate text-sm text-black-dark">
              {value?.formattedAddress || rebuildFormattedAddress(value!)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSearching(true);
                // Start the search input blank so the operator types a
                // new query rather than editing the existing one.
                setQuery('');
              }}
              className="whitespace-nowrap rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black-dark shadow-sm hover:bg-gray-light"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="whitespace-nowrap rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black-dark shadow-sm hover:bg-gray-light"
            >
              Edit details
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {quickActions && (
            <div className="flex flex-wrap items-center gap-2">{quickActions}</div>
          )}
          <div className="flex items-start gap-2">
            <div ref={searchWrapperRef} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-40" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => predictions.length > 0 && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              autoFocus={isSearching}
              placeholder={
                placesConfigured
                  ? 'Search for an address…'
                  : '1234 Main St, Springfield, IL 62701'
              }
              className={cn(
                'h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm text-black-87 outline-none transition-colors',
                'placeholder:text-black-40 focus:border-blue-light focus:ring-2 focus:ring-blue-12',
                error ? 'border-red' : 'border-blue-1'
              )}
              aria-invalid={!!error}
            />

            <FloatingPanel
              anchorRef={searchWrapperRef}
              open={isOpen && placesConfigured}
              onClose={() => setIsOpen(false)}
              width={wrapperWidth}
              className="max-h-64 overflow-y-auto rounded-lg border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-black-60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : predictions.length === 0 ? (
                <div className="px-3 py-3 text-sm text-black-40">
                  No matches. Try a different search.
                </div>
              ) : (
                predictions.map((p) => (
                  <button
                    key={p.place_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(p.place_id)}
                    className="flex w-full items-start gap-2 border-b border-black/4 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-black/3"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black-40" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-black-dark">
                        {p.structured_formatting?.main_text ?? p.description}
                      </div>
                      {p.structured_formatting?.secondary_text && (
                        <div className="truncate text-xs text-black-60">
                          {p.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </FloatingPanel>
          </div>
          {/* Cancel is only shown when a previous value exists — otherwise
              there's nothing to cancel back to. Operator can click it to
              abandon the new search and keep the prior address. */}
          {isSearching && hasParts && (
            <button
              type="button"
              onClick={cancelSearch}
              className="h-10 shrink-0 whitespace-nowrap rounded-md border border-black/15 bg-white px-3 text-xs font-semibold text-black-dark shadow-sm hover:bg-gray-light"
            >
              Cancel
            </button>
          )}
          </div>
        </div>
      )}

      {error && <span className="mt-1 block text-xs text-red">{error}</span>}

      {isEditOpen && value && (
        <AddressDetailsModal
          value={value}
          onClose={() => setIsEditOpen(false)}
          updatePart={updatePart}
          geocodeNow={geocodeNow}
        />
      )}
    </div>
  );
}

/**
 * Modal hosting the structured fields + interactive map preview. Portaled
 * so it escapes clipping ancestors; isolates the Maps JS mount to "operator
 * clicked Edit details" — zero map cost on plain page renders.
 *
 * Geocode trigger model (deliberate, see in-line comments for why):
 *   - Editing a structured field marks the address "dirty since last
 *     geocode" but does NOT fire a network call.
 *   - The Refresh button on the map (visible only while dirty) runs the
 *     geocode and updates lat / lng. If ZERO_RESULTS, lat / lng are
 *     explicitly nulled so the wire payload signals "unknown coords".
 *   - The Done button geocodes one final time IFF still dirty, then
 *     dismisses. If the operator already clicked Refresh and made no
 *     further edits, Done skips the geocode (no redundant call).
 */
function AddressDetailsModal({
  value,
  onClose,
  updatePart,
  geocodeNow,
}: {
  value: ParsedAddress;
  onClose: () => void;
  updatePart: (key: keyof ParsedAddress, val: string) => void;
  /** Triggers a one-shot geocode of the current address. Returns true when
   *  lat/lng were committed (resolved or nulled); false when there was
   *  nothing to geocode. */
  geocodeNow: () => Promise<boolean>;
}) {
  // True when the operator has edited a structured field since the last
  // geocode (or since modal open if they haven't refreshed yet). Drives
  // both the Refresh-button visibility and the Done-geocodes-if-needed
  // behavior. Editing addressLine2 alone doesn't dirty — a unit change
  // doesn't move the building, so the existing coords are still right.
  const [dirty, setDirty] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  // Surfaces required-field errors only after the operator first clicks Done.
  // Avoids screaming red on a freshly-opened modal — the asterisks already
  // communicate which fields matter; errors fire when they actually try to
  // commit invalid data.
  const [attempted, setAttempted] = useState(false);

  // Backend requires these five fields non-empty (from observed 400s on the
  // rooftop update endpoint: "addressLine1 / city / state / zipcode /
  // country is required"). addressLine2 (unit) and district remain optional.
  const errors: Partial<Record<keyof ParsedAddress, string>> = {
    addressLine1: !value.addressLine1?.trim() ? 'Street is required' : '',
    city: !value.city?.trim() ? 'City is required' : '',
    state: !value.state?.trim() ? 'State / Province is required' : '',
    zipcode: !value.zipcode?.trim() ? 'ZIP is required' : '',
    country: !value.country?.trim() ? 'Country is required' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  // Escape to close (skips the auto-geocode that Done would otherwise do).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFieldChange = (key: keyof ParsedAddress, val: string) => {
    updatePart(key, val);
    // Unit changes don't shift the marker — see comment on the dirty flag.
    if (key !== 'addressLine2') setDirty(true);
  };

  const runGeocode = async () => {
    setIsGeocoding(true);
    try {
      const committed = await geocodeNow();
      if (committed) setDirty(false);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleDone = async () => {
    if (hasErrors) {
      // Keep the modal open and surface inline errors. Operator fills the
      // missing fields and clicks Done again; once errors clear, this path
      // falls through to the geocode + close.
      setAttempted(true);
      return;
    }
    if (dirty) {
      await runGeocode();
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <h2 className="text-lg font-bold text-neutral-950">Edit address details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-black/8 bg-gray-lighter p-4">
              <Sub label="Street" required value={value.addressLine1 ?? ''} onChange={(v) => handleFieldChange('addressLine1', v)} colSpan={2} error={attempted ? errors.addressLine1 : undefined} />
              <Sub label="Unit (optional)" value={value.addressLine2 ?? ''} onChange={(v) => handleFieldChange('addressLine2', v)} colSpan={2} />
              <Sub label="City" required value={value.city ?? ''} onChange={(v) => handleFieldChange('city', v)} error={attempted ? errors.city : undefined} />
              <Sub label="District (optional)" value={value.district ?? ''} onChange={(v) => handleFieldChange('district', v)} />
              <Sub label="State / Province" required value={value.state ?? ''} onChange={(v) => handleFieldChange('state', v)} error={attempted ? errors.state : undefined} />
              <Sub label="ZIP" required value={value.zipcode ?? ''} onChange={(v) => handleFieldChange('zipcode', v)} error={attempted ? errors.zipcode : undefined} />
              <Sub label="Country" required value={value.country ?? ''} onChange={(v) => handleFieldChange('country', v)} colSpan={2} error={attempted ? errors.country : undefined} />
            </div>
            <AddressMapPreview
              lat={value.lat ?? null}
              lng={value.lng ?? null}
              isLoading={isGeocoding}
              onRefresh={dirty ? runGeocode : undefined}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDone}
              disabled={isGeocoding}
              className="rounded-md bg-black-dark px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {isGeocoding ? 'Updating…' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Sub({
  label,
  value,
  onChange,
  colSpan = 1,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colSpan?: 1 | 2;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className={cn('block', colSpan === 2 && 'col-span-2')}>
      <span className="mb-1 block text-xs font-medium text-black-60">
        {label}
        {required && <span className="ml-0.5 text-red">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required || undefined}
        aria-invalid={!!error || undefined}
        className={cn(
          'h-9 w-full rounded-md border bg-white px-3 text-sm text-black-87 outline-none transition-colors',
          'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
          error ? 'border-red' : 'border-blue-1'
        )}
      />
      {error && <span className="mt-1 block text-xs text-red">{error}</span>}
    </label>
  );
}
