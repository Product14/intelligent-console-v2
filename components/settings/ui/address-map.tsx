'use client';

import { useEffect, useRef } from 'react';
import {
  loadGooglePlaces,
  type GoogleMapHandle,
  type GoogleMarkerHandle,
} from '@/lib/settings/google-places';

/**
 * Interactive Google Map preview for the AddressField.
 *
 * - Renders a centered marker at `lat` / `lng`.
 * - Re-centers + re-positions the marker on prop change so the preview
 *   updates as the operator edits the address (geocode-on-blur returns
 *   fresh coords; this component reflects them without a remount).
 * - Loads the Maps JS API on demand via the shared `loadGooglePlaces`
 *   loader (same script tag as Places, no duplicate fetch).
 *
 * Costs $7 / 1000 map loads (Dynamic Maps API). Each refresh that mounts
 * this component is one billable load. If the bill ever becomes a
 * concern, the cheaper Static Maps route is documented in git history —
 * we used it briefly before reverting per product direction.
 *
 * When `lat`/`lng` are null, renders a muted placeholder strip — keeps
 * the field's layout stable while the user is mid-edit.
 */
export function AddressMapPreview({
  lat,
  lng,
  className,
  isLoading,
  onRefresh,
}: {
  lat: number | null;
  lng: number | null;
  className?: string;
  /** When true, overlays a subtle loading indicator on the map. */
  isLoading?: boolean;
  /** When provided, renders a "Refresh" button in the top-right corner. The
   *  caller decides when to show it (typically: there are uncommitted edits
   *  to the address since the last geocode). Clicking it triggers the
   *  caller's geocode flow. */
  onRefresh?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapHandle | null>(null);
  const markerRef = useRef<GoogleMarkerHandle | null>(null);

  // Initialise the map once the container is mounted and Maps JS is loaded.
  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    const init = async () => {
      try {
        await loadGooglePlaces();
        if (cancelled) return;

        const maps = window.google?.maps as
          | (typeof window.google.maps & {
              importLibrary?: (name: string) => Promise<Record<string, unknown>>;
            })
          | undefined;
        if (!maps) {
          console.warn('[AddressMapPreview] window.google.maps unavailable');
          return;
        }

        // Defensive: when the script is loaded via the async-loader pattern,
        // Map/Marker constructors come from importLibrary. Use them when
        // present; fall back to direct access for the legacy pattern.
        let MapCtor = maps.Map;
        let MarkerCtor = maps.Marker;
        if ((!MapCtor || !MarkerCtor) && typeof maps.importLibrary === 'function') {
          const [mapsLib, markerLib] = await Promise.all([
            maps.importLibrary('maps'),
            maps.importLibrary('marker'),
          ]);
          if (cancelled) return;
          const mapsLibAny = mapsLib as unknown as { Map?: typeof maps.Map };
          const markerLibAny = markerLib as unknown as { Marker?: typeof maps.Marker };
          MapCtor = mapsLibAny.Map ?? MapCtor;
          MarkerCtor = markerLibAny.Marker ?? MarkerCtor;
        }
        if (!MapCtor || !MarkerCtor) {
          console.warn('[AddressMapPreview] Map/Marker constructors unavailable');
          return;
        }
        if (!containerRef.current) return;

        if (!mapRef.current) {
          mapRef.current = new MapCtor(containerRef.current, {
            center: { lat, lng },
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'cooperative',
          });
        } else {
          mapRef.current.setCenter({ lat, lng });
        }

        if (!markerRef.current && mapRef.current) {
          markerRef.current = new MarkerCtor({
            position: { lat, lng },
            map: mapRef.current,
          });
        } else if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        }
      } catch (err) {
        console.error('[AddressMapPreview] init failed', err);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  // Tear down the marker when coordinates clear, so the placeholder shows.
  useEffect(() => {
    if (lat == null || lng == null) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
    }
  }, [lat, lng]);

  if (lat == null || lng == null) {
    return (
      <div
        className={`flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-black/10 bg-gray-lighter text-xs text-black-40 ${className ?? ''}`}
      >
        Map preview will appear once coordinates resolve.
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <div
        ref={containerRef}
        className="h-full min-h-[180px] w-full overflow-hidden rounded-lg border border-black/10"
      />
      {onRefresh && !isLoading && (
        // Dim scrim + centered button — communicates "this map is out of
        // sync with your edits, click to refresh." The corner-button
        // placement we tried first was too easy to miss.
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black-dark shadow-[0_6px_20px_rgba(16,24,40,0.25)] hover:bg-gray-50"
            aria-label="Refresh map location"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>
      )}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/40 text-xs font-medium text-black-60">
          Updating location…
        </div>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
