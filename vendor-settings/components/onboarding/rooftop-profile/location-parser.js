const joinParts = (...parts) =>
  parts
    .map((p) => (p ?? '').toString().trim())
    .filter(Boolean)
    .join(', ');

const getLatLng = (geometry) => {
  const loc = geometry?.location;
  if (!loc) return { lat: null, lng: null };

  const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
  const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;

  return { lat, lng };
};

const buildReader = (address_components) => {
  const comps = address_components?.length ? address_components : [];
  const byType = new Map();

  for (const comp of comps) {
    for (const type of comp.types || []) {
      if (!byType.has(type)) byType.set(type, comp);
    }
  }

  const get = (type) => byType.get(type)?.long_name || '';
  const getShort = (type) => byType.get(type)?.short_name || '';

  const firstOf = (types) => {
    for (const t of types) {
      const v = get(t);
      if (v) return v;
    }
    return '';
  };

  return { get, getShort, firstOf };
};

const buildAddressLine1 = (r) => {
  const premise = r.get('premise') ?? '';
  const streetNumber = r.get('street_number') ?? '';
  const route = r.get('route') ?? '';
  const addressLine1 = joinParts(premise, streetNumber, route).trim();

  return addressLine1 || '';
};

const buildDistrict = (r) =>
  r
    .firstOf([
      'administrative_area_level_2',
      'sublocality_level_1',
      'sublocality',
    ])
    .trim() || '';

const buildCity = (r) =>
  r
    .firstOf(['locality', 'postal_town', 'administrative_area_level_3'])
    .trim() || '';

const buildAddressLine2 = (r) => {
  const subpremise = r.get('subpremise');
  const neighborhood = r.firstOf([
    'neighborhood',
    'sublocality_level_2',
    'sublocality_level_1',
    'sublocality',
  ]);

  const district = buildDistrict(r);
  const unit = subpremise ? `Unit ${subpremise}` : '';
  const addressLine2 = joinParts(unit, neighborhood, district).trim();
  return addressLine2 || '';
};

export const parseGoogleAddress = ({
  formatted_address,
  address_components,
  geometry,
}) => {
  const r = buildReader(address_components);
  const { lat, lng } = getLatLng(geometry);

  return {
    addressLine1: buildAddressLine1(r),
    addressLine2: buildAddressLine2(r),
    city: buildCity(r),
    state: r.get('administrative_area_level_1') || '',
    district: buildDistrict(r),
    country: r.get('country') || '',
    countryCode: r.getShort('country') || '',
    zipcode: r.get('postal_code') || '',
    lat,
    lng,
    formattedAddress: formatted_address || '',
  };
};

export const buildAddress = (address) => {
  if (!address) return '';
  return joinParts(
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.country
  );
};

export const buildAddressDetailLine = (address) => {
  if (!address) return '';
  return joinParts(address.city, address.state, address.country).trim();
};
