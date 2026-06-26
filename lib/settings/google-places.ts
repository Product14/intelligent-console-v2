'use client';

// Thin Google Places client. Lazy-loads the Maps JS SDK on first call.
// No `@vis.gl/react-google-maps` dependency — just the script tag + the
// `window.google.maps.places` SDK directly.

import { getConsoleContext } from '@/lib/settings/bridge/context-store';
import { getRuntimeConfig } from '@/lib/settings/runtime-config';

const SCRIPT_ID = 'google-maps-places-sdk';

// Minimal local types — we don't pull in `@types/google.maps`.
export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface ParsedAddress {
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  /** Optional sub-locality between city and state — county (US/UK),
   *  district (India), borough, etc. Maps to Google's
   *  `administrative_area_level_2`. Form labels this "District (optional)". */
  district: string;
  state: string;
  country: string;
  countryCode: string;
  zipcode: string;
  lat: number | null;
  lng: number | null;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              req: { input: string; types?: string[] },
              cb: (
                predictions: PlacePrediction[] | null,
                status: string
              ) => void
            ) => void;
          };
          PlacesService: new (attrContainer: HTMLElement) => {
            getDetails: (
              req: { placeId: string; fields: string[] },
              cb: (place: GoogleRawPlace | null, status: string) => void
            ) => void;
          };
          PlacesServiceStatus: { OK: string };
        };
        Geocoder: new () => {
          geocode: (
            req: { address: string },
            cb: (
              results: Array<{
                formatted_address?: string;
                geometry?: { location?: { lat: () => number; lng: () => number } };
              }> | null,
              status: string
            ) => void
          ) => void;
        };
        GeocoderStatus: { OK: string; ZERO_RESULTS: string };
        Map: new (container: HTMLElement, opts: GoogleMapOptions) => GoogleMapHandle;
        Marker: new (opts: GoogleMarkerOptions) => GoogleMarkerHandle;
        LatLng: new (lat: number, lng: number) => unknown;
      };
    };
  }
}

interface GoogleMapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
}

interface GoogleMapHandle {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMarkerOptions {
  position: { lat: number; lng: number };
  map: GoogleMapHandle;
}

interface GoogleMarkerHandle {
  setPosition: (latLng: { lat: number; lng: number }) => void;
  setMap: (map: GoogleMapHandle | null) => void;
}

interface GoogleRawAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleRawPlace {
  formatted_address?: string;
  address_components?: GoogleRawAddressComponent[];
  geometry?: {
    location?: {
      lat: (() => number) | number;
      lng: (() => number) | number;
    };
  };
}

let loadPromise: Promise<void> | null = null;

/** Resolve the Maps API key in priority order:
 *  1. ConsoleContext.googleMapsApiKey (provided by Console via postMessage)
 *  2. RuntimeConfig.googleMapsApiKey  (from /config.json, per-env deploy)
 *  3. process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (build-time, local dev) */
function resolveApiKeySync(): string | undefined {
  const ctx = getConsoleContext();
  if (ctx?.googleMapsApiKey) return ctx.googleMapsApiKey;
  const cfg = getRuntimeConfig();
  if (cfg.googleMapsApiKey) return cfg.googleMapsApiKey;
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || undefined;
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(resolveApiKeySync());
}

export function loadGooglePlaces(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load Google Maps SDK during SSR'));
  }
  if (window.google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const key = resolveApiKeySync();
  if (!key) {
    return Promise.reject(new Error('Google Maps API key not configured (check ConsoleContext / config.json / env var)'));
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Maps SDK load error')));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    // Note: NOT using `loading=async`. With the async-loader mode, the
    // Map / Marker / Geocoder constructors aren't guaranteed available on
    // window.google.maps after script load — they require importLibrary()
    // calls. Places autocomplete (which IS loaded via libraries=places)
    // continued to work, but the map preview's `new google.maps.Map(...)`
    // silently failed because the constructor wasn't there yet.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Maps SDK load error'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function fetchPlacePredictions(query: string): Promise<PlacePrediction[]> {
  if (!query.trim()) return [];
  await loadGooglePlaces();
  const places = window.google?.maps?.places;
  if (!places) return [];

  return new Promise<PlacePrediction[]>((resolve) => {
    const service = new places.AutocompleteService();
    service.getPlacePredictions(
      { input: query, types: ['geocode', 'establishment'] },
      (predictions, status) => {
        if (status !== places.PlacesServiceStatus.OK || !predictions) {
          resolve([]);
        } else {
          resolve(predictions);
        }
      }
    );
  });
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<ParsedAddress | null> {
  await loadGooglePlaces();
  const places = window.google?.maps?.places;
  if (!places) return null;

  // PlacesService requires a DOM node for the attribution container.
  const node = document.createElement('div');
  const service = new places.PlacesService(node);

  return new Promise<ParsedAddress | null>((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ['formatted_address', 'geometry', 'address_components'],
      },
      (place, status) => {
        if (status !== places.PlacesServiceStatus.OK || !place) {
          resolve(null);
        } else {
          resolve(parseGoogleAddress(place));
        }
      }
    );
  });
}

function parseGoogleAddress(place: GoogleRawPlace): ParsedAddress {
  const comps = place.address_components ?? [];
  const byType = new Map<string, GoogleRawAddressComponent>();
  for (const c of comps) {
    for (const t of c.types ?? []) {
      if (!byType.has(t)) byType.set(t, c);
    }
  }
  const get = (t: string) => byType.get(t)?.long_name ?? '';
  const getShort = (t: string) => byType.get(t)?.short_name ?? '';
  const firstOf = (types: string[]) => {
    for (const t of types) {
      const v = get(t);
      if (v) return v;
    }
    return '';
  };

  const streetNumber = get('street_number');
  const route = get('route');
  const subpremise = get('subpremise');
  const neighborhood = firstOf([
    'neighborhood',
    'sublocality_level_2',
    'sublocality_level_1',
    'sublocality',
  ]);

  const loc = place.geometry?.location;
  const lat = loc ? (typeof loc.lat === 'function' ? loc.lat() : loc.lat) : null;
  const lng = loc ? (typeof loc.lng === 'function' ? loc.lng() : loc.lng) : null;

  // City has multiple candidate sources in the Google address-components
  // vocabulary. Try the preferred ones first (locality / postal_town /
  // administrative_area_level_3). When none of those are present — common
  // for some India / UK / Australia / unincorporated-US addresses — fall
  // back to `administrative_area_level_2` so we never ship an empty `city`
  // alongside a populated district (the backend rejects with
  // `Address.city is required`).
  const adminArea2 = get('administrative_area_level_2');
  const city =
    firstOf(['locality', 'postal_town', 'administrative_area_level_3']) ||
    adminArea2;
  // Avoid duplicating the same value in district when it was used for city.
  const district = city === adminArea2 ? '' : adminArea2;

  return {
    formattedAddress: place.formatted_address ?? '',
    addressLine1: [streetNumber, route].filter(Boolean).join(' '),
    addressLine2: [subpremise && `Unit ${subpremise}`, neighborhood]
      .filter(Boolean)
      .join(', '),
    city,
    district,
    state: get('administrative_area_level_1'),
    country: get('country'),
    countryCode: getShort('country'),
    zipcode: get('postal_code'),
    lat,
    lng,
  };
}

/**
 * Geocode a free-text address into coordinates + a normalized formatted
 * string. Returns null when the input doesn't resolve (ZERO_RESULTS, etc.).
 * Used by AddressField's on-blur refresh — after the operator edits a
 * structured field, we re-run geocoding so lat/lng track the displayed
 * address instead of carrying the prior Places selection's coordinates.
 */
export async function geocodeAddress(
  query: string
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  await loadGooglePlaces();
  const maps = window.google?.maps;
  if (!maps?.Geocoder) return null;

  return new Promise((resolve) => {
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ address: trimmed }, (results, status) => {
      if (status !== maps.GeocoderStatus.OK || !results || results.length === 0) {
        resolve(null);
        return;
      }
      const top = results[0];
      const loc = top.geometry?.location;
      if (!loc) {
        resolve(null);
        return;
      }
      resolve({
        lat: loc.lat(),
        lng: loc.lng(),
        formattedAddress: top.formatted_address ?? trimmed,
      });
    });
  });
}

// Re-exports for the map preview — same handles the Geocoder uses, so the
// caller doesn't need to import from `window.google.maps` directly.
export type { GoogleMapHandle, GoogleMarkerHandle };

/** Rebuild a formatted-address line from edited structured fields. */
export function rebuildFormattedAddress(a: ParsedAddress): string {
  return [
    a.addressLine1,
    a.addressLine2,
    a.city,
    a.state,
    a.zipcode,
    a.country,
  ]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
}
