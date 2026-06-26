import { cn } from '@spyne-console/utils';
import {
  APIProvider,
  AdvancedMarker,
  Map,
  useMap,
} from '@vis.gl/react-google-maps';

import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoLocationOutline, IoWarning } from 'react-icons/io5';
import { MdLocationOn } from 'react-icons/md';
import { toast } from 'react-toastify';

import Spinner from '@spyne-console/design-system/spinner';

import OnboardingPrimaryButton from '../buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '../buttons/onboarding-secondary-button';
import {
  buildAddress,
  buildAddressDetailLine,
  parseGoogleAddress,
} from './location-parser';

// Default location fallback (San Francisco)
const DEFAULT_LOCATION = {
  rooftopAddress: {
    addressLine1: '1234 Main Street',
    addressLine2: 'Suite 100',
    city: 'San Francisco',
    state: 'California',
    district: 'San Francisco County',
    zipcode: '94102',
    country: 'United States',
    formattedAddress:
      '1234 Main Street, Suite 100, San Francisco, CA 94102, United States',
  },
  geoCoordinates: {
    lat: 37.7749,
    lng: -122.4194,
  },
};

function MapInstanceBridge({ onReady }) {
  const map = useMap();

  useEffect(() => {
    if (map) onReady(map);
  }, [map, onReady]);

  return null;
}

export const LocationInputField = ({
  value,
  onChange,
  onChangeClick,
  placeholder,
  isSearchMode,
  disabled = false,
}) => (
  <div className="w-full">
    <div
      onClick={
        !isSearchMode && !disabled && onChangeClick ? onChangeClick : undefined
      }
      className={`flex items-center justify-between rounded-lg border border-[#00000033] px-3 py-2.5 ${
        disabled
          ? 'cursor-not-allowed bg-[#f6f6f6]'
          : !isSearchMode && onChangeClick
            ? 'cursor-pointer'
            : ''
      }`}
    >
      <div className="flex flex-1 items-center gap-4">
        <IoLocationOutline className="h-[18px] w-[18px] text-[#000000CC]" />
        {isSearchMode ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Start typing to search'}
            className="flex-1 bg-transparent text-sm font-medium leading-6 text-[#000000CC] outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]"
            autoFocus
            disabled={disabled}
          />
        ) : (
          <span className="text-sm font-medium leading-6 text-[#000000CC]">
            {value || placeholder}
          </span>
        )}
      </div>
      {onChangeClick && !isSearchMode && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChangeClick();
          }}
          type="button"
          className="text-sm font-medium leading-5 text-[#4600f2]"
        >
          Change
        </button>
      )}
    </div>
  </div>
);

const SearchResultItem = ({ title, subtitle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full flex-col gap-2 border-b border-[#0000001A] px-0 py-4 text-left transition-colors hover:bg-[#4600f20A]"
  >
    <span className="text-base font-semibold leading-6 text-[#000000CC]">
      {title}
    </span>
    <span className="text-sm font-normal leading-6 text-[#00000066]">
      {subtitle}
    </span>
  </button>
);

const NoResultsState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4600f214]">
      <IoLocationOutline className="h-6 w-6 text-[#4600f2]" />
    </div>
    <p className="mb-2 text-base font-semibold text-[#000000CC]">
      No results found
    </p>
    <p className="text-sm text-[#00000066]">
      Try searching with a different term
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="mb-4 flex h-12 w-12 items-center justify-center">
      <Spinner />
    </div>
    <p className="text-sm text-[#00000066]">Searching locations...</p>
  </div>
);

const OnboardingLocationPicker = ({
  isOpen = false,
  onClose,
  onConfirm,
  initialLocation = null,
  mapCenter = null,
  zoom = 14,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [currentCenter, setCurrentCenter] = useState(mapCenter);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const mapRef = useRef(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);
  const [addressLine1, setAddressLine1] = useState(
    selectedLocation?.addressLine1
  );
  const [addressLine2, setAddressLine2] = useState(
    selectedLocation?.addressLine2
  );
  const [zipcode, setZipcode] = useState(selectedLocation?.zipcode);
  const [district, setDistrict] = useState(selectedLocation?.district);
  const [country, setCountry] = useState(selectedLocation?.country);
  const [countryCode, setCountryCode] = useState(selectedLocation?.countryCode);
  const [state, setState] = useState(selectedLocation?.state);
  const [addressLine1Error, setAddressLine1Error] = useState('');
  const [zipcodeError, setZipcodeError] = useState('');
  const [districtError, setDistrictError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [stateError, setStateError] = useState('');

  useEffect(() => {
    if (!mapCenter) {
      setCurrentCenter(DEFAULT_LOCATION.geoCoordinates);
    }
  }, []);

  const handleCenterChanged = (event) => {
    setCurrentCenter({
      lat: event.detail.center.lat,
      lng: event.detail.center.lng,
    });
  };

  const updateAddress = () => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat: currentCenter.lat, lng: currentCenter.lng } },
      (results) => {
        if (!!results?.length) {
          const address = parseGoogleAddress({
            formatted_address: results[0].formatted_address,
            address_components: results[0].address_components,
            geometry: results[0].geometry,
          });
          setSelectedLocation(address);
          setAddressLine1(address.addressLine1 || '');
          setAddressLine2(address.addressLine2 || '');
          setZipcode(address.zipcode || '');
          setDistrict(address.district || '');
          setCountry(address.country || '');
          setCountryCode(address.countryCode || '');
          setState(address.state || '');
        } else {
          setSelectedLocation('');
          toast.error('Address not found');
        }
      }
    );
  };

  useEffect(() => {
    if (!isSearchMode || !searchQuery.trim()) {
      setPredictions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      // Guard against Google Maps API not being loaded
      if (!window.google?.maps?.places?.AutocompleteService) {
        console.warn('Google Maps API not loaded yet');
        return;
      }

      const autocompleteService =
        new window.google.maps.places.AutocompleteService();
      setIsFetchingAddress(true);
      autocompleteService.getPlacePredictions(
        {
          input: searchQuery,
          types: ['geocode', 'establishment'],
        },
        (predictions) => {
          if (!!predictions?.length) {
            setPredictions(predictions);
          } else {
            setPredictions([]);
          }
          setIsFetchingAddress(false);
        }
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSearchMode]);

  const handleSearchModeToggle = () => {
    setIsSearchMode(true);
    setSearchQuery('');
    setPredictions([]);
  };

  const handleSelectPrediction = (prediction) => {
    const placesService = new window.google.maps.places.PlacesService(
      mapRef.current
    );
    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['formatted_address', 'geometry', 'address_components'],
      },
      (place) => {
        if (place) {
          const address = parseGoogleAddress({
            formatted_address: place.formatted_address,
            address_components: place.address_components,
            geometry: place.geometry,
          });
          setSelectedLocation(address);
          setAddressLine1(address.addressLine1 || '');
          setAddressLine2(address.addressLine2 || '');
          setZipcode(address.zipcode || '');
          setDistrict(address.district || '');
          setCountry(address.country || '');
          setCountryCode(address.countryCode || '');
          setState(address.state || '');
          if (place.geometry?.location) {
            setCurrentCenter({ lat: address.lat, lng: address.lng });
            setTimeout(() => {
              mapRef.current.setCenter({ lat: address.lat, lng: address.lng });
            }, 100);
          }

          setIsSearchMode(false);
          setSearchQuery('');
          setPredictions([]);
        }
      }
    );
  };

  const handleCancel = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setPredictions([]);
    setSelectedLocation(null);
    setAddressLine1Error('');
    setZipcodeError('');
    setDistrictError('');
    setCountryError('');
    setStateError('');
    setAddressLine1('');
    setAddressLine2('');
    setZipcode('');
    setDistrict('');
    setCountry('');
    setCountryCode('');
    setState('');
    onClose?.();
  };

  const handleConfirm = () => {
    let hasError = false;

    if (!addressLine1?.trim()) {
      setAddressLine1Error('Address Line 1 is required');
      hasError = true;
    } else {
      setAddressLine1Error('');
    }

    if (!zipcode?.trim()) {
      setZipcodeError('Zipcode is required');
      hasError = true;
    } else {
      setZipcodeError('');
    }

    if (!district?.trim()) {
      setDistrictError('District is required');
      hasError = true;
    } else {
      setDistrictError('');
    }

    if (!country?.trim()) {
      setCountryError('Country is required');
      hasError = true;
    } else {
      setCountryError('');
    }

    if (!state?.trim()) {
      setStateError('State/Province is required');
      hasError = true;
    } else {
      setStateError('');
    }

    if (hasError) {
      toast.error('Please fill in all required fields');
      return;
    }

    onConfirm?.({
      address: {
        ...selectedLocation,
        addressLine1: addressLine1 || '',
        addressLine2: addressLine2 || '',
        zipcode: zipcode || '',
        district: district || '',
        country: country || '',
        countryCode: countryCode || '',
        state: state || '',
      },
      coordinates: currentCenter,
    });
    onClose?.();
  };

  const handleBackToMap = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setPredictions([]);
  };

  // Fetch coordinates when geocoordinates are null but we have address details
  useEffect(() => {
    const shouldFetchCoordinates =
      isOpen &&
      initialLocation &&
      !mapCenter &&
      (initialLocation.city ||
        initialLocation.state ||
        initialLocation.country);

    if (!shouldFetchCoordinates) return;

    const fetchCoordinatesFromAddress = async () => {
      setIsFetchingCoordinates(true);

      try {
        const geocoder = new window.google.maps.Geocoder();

        // Build address string from available components
        const addressParts = [
          initialLocation.city,
          initialLocation.state,
          initialLocation.country,
        ].filter(Boolean);

        const addressString = addressParts.join(', ');

        geocoder.geocode({ address: addressString }, (results, status) => {
          if (status === 'OK' && results?.length > 0) {
            const location = results[0].geometry.location;
            const newCenter = {
              lat:
                typeof location.lat === 'function'
                  ? location.lat()
                  : location.lat,
              lng:
                typeof location.lng === 'function'
                  ? location.lng()
                  : location.lng,
            };

            setCurrentCenter(newCenter);

            // Update the selected location with the fetched coordinates
            setSelectedLocation((prev) => ({
              ...prev,
              lat: newCenter.lat,
              lng: newCenter.lng,
            }));

            // Center the map on the new coordinates
            if (mapRef.current) {
              setTimeout(() => {
                mapRef.current.setCenter(newCenter);
              }, 100);
            }
          } else {
            toast.error(
              'An error occurred while fetching coordinates, please manually select a location on the map'
            );
          }
          setIsFetchingCoordinates(false);
        });
      } catch (error) {
        setIsFetchingCoordinates(false);
      }
    };

    // Add a small delay to ensure Google Maps API is loaded
    const timeoutId = setTimeout(() => {
      if (window.google?.maps?.Geocoder) {
        fetchCoordinatesFromAddress();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={['places', 'geocoding']}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080]">
        <div className="h-[90vh] w-[90vw] overflow-hidden overflow-y-auto rounded-[23px] bg-white shadow-[0px_8px_8px_-4px_#10182808,0px_20px_24px_-4px_#10182814]">
          <div className="grid h-full w-full grid-cols-2">
            <div className="h-full w-full overflow-hidden rounded-lg bg-[#E5E3DF]">
              <div className="flex flex-col gap-2 bg-white p-4 pr-0">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium leading-5 text-[#000000CC]">
                    Address Details
                  </label>
                  <LocationInputField
                    value={buildAddressDetailLine(selectedLocation)}
                    onChangeClick={handleSearchModeToggle}
                    placeholder="Select a location"
                    isSearchMode={false}
                  />
                </div>
              </div>

              {isFetchingCoordinates ? (
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Spinner />
                    <p className="text-sm text-[#00000066]">
                      Fetching location coordinates...
                    </p>
                  </div>
                </div>
              ) : currentCenter ? (
                <div className="h-[calc(100%-106px)] w-full overflow-hidden">
                  <Map
                    defaultCenter={currentCenter}
                    defaultZoom={zoom}
                    mapId="onboarding-location-picker"
                    onCenterChanged={handleCenterChanged}
                    onDragend={updateAddress}
                    draggable={true}
                    reuseMaps={true}
                    zoomControl={true}
                    disableDefaultUI={true}
                  >
                    <MapInstanceBridge onReady={(m) => (mapRef.current = m)} />
                    <AdvancedMarker position={currentCenter}>
                      <MdLocationOn className="h-10 w-10 text-[#2F333A]" />
                    </AdvancedMarker>
                  </Map>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4600f214]">
                      <IoLocationOutline className="h-6 w-6 text-[#4600f2]" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-base font-semibold text-[#000000CC]">
                        No location set
                      </p>
                      <p className="text-sm text-[#00000066]">
                        Please search for your location to continue
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-full flex-col p-4">
              {isSearchMode ? (
                <div className="flex h-full flex-col justify-between px-2">
                  <div>
                    <div className="mb-10 flex items-center gap-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[28px] border-8 border-[#4600f20A] bg-[#4600f214]">
                        <IoLocationOutline className="h-6 w-6 text-[#4600f2]" />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold leading-7 text-[#000000E6]">
                            Search Location
                          </h2>
                          <button
                            onClick={handleBackToMap}
                            type="button"
                            className="flex h-6 w-6 items-center justify-center"
                          >
                            <IoClose className="h-6 w-6 text-[#000000CC]" />
                          </button>
                        </div>
                        <p className="text-sm font-normal leading-5 text-[#00000099]">
                          Add your location from map
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <LocationInputField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Start typing to search"
                        isSearchMode={true}
                      />

                      <div className="flex h-[440px] flex-col overflow-y-auto">
                        {isFetchingAddress ? (
                          <LoadingState />
                        ) : searchQuery && predictions.length === 0 ? (
                          <NoResultsState />
                        ) : (
                          predictions.map((prediction) => (
                            <SearchResultItem
                              key={prediction.place_id}
                              title={prediction.structured_formatting.main_text}
                              subtitle={
                                prediction.structured_formatting.secondary_text
                              }
                              onClick={() => handleSelectPrediction(prediction)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col gap-6">
                  <div className="flex h-full flex-col justify-between gap-6 px-6">
                    <div className="flex flex-col gap-6">
                      <div className="relative flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          Address Line 1{' '}
                          <span className="text-[#ff003d]">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressLine1 || ''}
                          onChange={(e) => {
                            setAddressLine1(e.target.value);
                            if (addressLine1Error) {
                              setAddressLine1Error('');
                            }
                          }}
                          placeholder="Enter address line 1 (Required)"
                          maxLength={250}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium leading-6 ${
                            addressLine1Error
                              ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
                              : 'border-[rgba(0,0,0,0.2)] text-[#000000CC]'
                          } bg-white outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]`}
                        />
                        {addressLine1Error && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1">
                            <IoWarning className="h-4 w-4 text-[#c31812]" />
                            <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                              {addressLine1Error}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={addressLine2 || ''}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Enter address line 2 (Optional)"
                          maxLength={250}
                          className="rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[#000000CC] outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]"
                        />
                      </div>

                      <div className="relative flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          District <span className="text-[#ff003d]">*</span>
                        </label>
                        <input
                          type="text"
                          value={district || ''}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            if (districtError) {
                              setDistrictError('');
                            }
                          }}
                          placeholder="Enter district (Required)"
                          maxLength={250}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium leading-6 ${
                            districtError
                              ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
                              : 'border-[rgba(0,0,0,0.2)] text-[#000000CC]'
                          } bg-white outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]`}
                        />
                        {districtError && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1">
                            <IoWarning className="h-4 w-4 text-[#c31812]" />
                            <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                              {districtError}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          State/Province{' '}
                          <span className="text-[#ff003d]">*</span>
                        </label>
                        <input
                          type="text"
                          value={state || ''}
                          onChange={(e) => {
                            setState(e.target.value);
                            if (stateError) {
                              setStateError('');
                            }
                          }}
                          placeholder="Enter state/province (Required)"
                          maxLength={250}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium leading-6 ${
                            stateError
                              ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
                              : 'border-[rgba(0,0,0,0.2)] text-[#000000CC]'
                          } bg-white outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]`}
                        />
                        {stateError && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1">
                            <IoWarning className="h-4 w-4 text-[#c31812]" />
                            <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                              {stateError}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          Country <span className="text-[#ff003d]">*</span>
                        </label>
                        <input
                          type="text"
                          value={country || ''}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (countryError) {
                              setCountryError('');
                            }
                          }}
                          placeholder="Enter country (Required)"
                          maxLength={250}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium leading-6 ${
                            countryError
                              ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
                              : 'border-[rgba(0,0,0,0.2)] text-[#000000CC]'
                          } bg-white outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]`}
                        />
                        {countryError && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1">
                            <IoWarning className="h-4 w-4 text-[#c31812]" />
                            <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                              {countryError}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col gap-2">
                        <label className="text-sm font-medium leading-5 text-[#000000CC]">
                          Zipcode <span className="text-[#ff003d]">*</span>
                        </label>
                        <input
                          type="text"
                          value={zipcode || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setZipcode(value);
                            if (zipcodeError) {
                              setZipcodeError('');
                            }
                          }}
                          placeholder="Enter zipcode (Required)"
                          maxLength={50}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium leading-6 ${
                            zipcodeError
                              ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
                              : 'border-[rgba(0,0,0,0.2)] text-[#000000CC]'
                          } bg-white outline-none disabled:cursor-not-allowed disabled:bg-[#f6f6f6]`}
                        />
                        {zipcodeError && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1">
                            <IoWarning className="h-4 w-4 text-[#c31812]" />
                            <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                              {zipcodeError}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <OnboardingSecondaryButton
                        onClick={handleCancel}
                        className="w-full"
                      >
                        Cancel
                      </OnboardingSecondaryButton>
                      <OnboardingPrimaryButton
                        onClick={handleConfirm}
                        disabled={!buildAddress(selectedLocation)}
                        showIcon={false}
                        className="w-full"
                      >
                        Confirm
                      </OnboardingPrimaryButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default OnboardingLocationPicker;
