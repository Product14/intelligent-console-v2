import React from 'react';

import CarCard from './car-card';
import ColorDropdown from './color-dropdown';

// Shimmer loader component
const ShimmerLoader = () => (
  <div className="flex h-[300px] w-full flex-row justify-around bg-white p-4">
    {[1, 2, 3, 4].map((item, index) => (
      <div
        key={item}
        className={`animate-pulse rounded-lg bg-white p-4 shadow-md ${index != 0 ? 'ml-3' : ''}`}
      >
        <div className="flex items-center space-x-4">
          <div className="ltb:w-40 h-32 w-28 rounded-lg bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-300"></div>
            <div className="h-3 w-1/2 rounded bg-gray-300"></div>
            <div className="h-3 w-2/3 rounded bg-gray-300"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded bg-gray-300"></div>
          <div className="h-3 w-5/6 rounded bg-gray-300"></div>
        </div>
      </div>
    ))}
  </div>
);

const ClonePresenter = ({
  vehiclesData,
  availableColors,
  chosenColor,
  loading,
  handleColorChange,
  useMedia,
}) => {
  // Extract vehicle info from first vehicle data
  const firstVehicle = vehiclesData[0];
  const vehicleInfo = firstVehicle
    ? {
        year: firstVehicle.year || '',
        make: firstVehicle.make || '',
        model: firstVehicle.model || '',
        trim: firstVehicle.trim || '',
      }
    : {};

  // Helper function to parse color combinations and create color display
  const parseColorCombination = (colorString) => {
    if (!colorString) return { colors: [], style: {} };

    // Split by comma and clean up
    const colors = colorString
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c);

    const colorMap = {
      red: '#FF0000',
      hot: '#FF4500',
      white: '#FFFFFF',
      black: '#000000',
      blue: '#0000FF',
      green: '#008000',
      yellow: '#FFFF00',
      orange: '#FFA500',
      purple: '#800080',
      pink: '#FFC0CB',
      gray: '#808080',
      grey: '#808080',
      silver: '#C0C0C0',
      gold: '#FFD700',
      brown: '#A52A2A',
      tan: '#D2B48C',
      'red hot': '#FF4500',
      'hot red': '#FF4500',
      'bright red': '#FF0000',
      'dark red': '#8B0000',
      'light red': '#FF6B6B',
      crimson: '#DC143C',
      navy: '#000080',
      'light blue': '#ADD8E6',
      'dark blue': '#00008B',
      'light green': '#90EE90',
      'dark green': '#006400',
      lime: '#00FF00',
      cyan: '#00FFFF',
      teal: '#008080',
      magenta: '#FF00FF',
      'light gray': '#D3D3D3',
      'dark gray': '#404040',
      charcoal: '#36454F',
    };

    if (colors.length === 1) {
      // Single color - try to find hex or use default
      const singleColor = colors[0].toLowerCase();
      const hexColor = colorMap[singleColor] || '#666';

      return {
        colors: [colors[0]],
        style: {
          backgroundColor: hexColor,
          border: hexColor === '#666' ? '1px solid #ddd' : 'none',
        },
      };
    } else if (colors.length > 1) {
      // Multiple colors - create gradient or split circle
      const hexColors = colors.map((color) => {
        const normalizedColor = color.toLowerCase();
        return colorMap[normalizedColor] || '#666';
      });

      if (colors.length === 2) {
        // Create linear gradient for 2 colors
        return {
          colors: colors,
          style: {
            background: `linear-gradient(45deg, ${hexColors[0]} 0%, ${hexColors[1]} 100%)`,
            border: 'none',
          },
        };
      } else {
        // For 3+ colors, create a radial gradient or use first color
        return {
          colors: colors,
          style: {
            background: `radial-gradient(circle, ${hexColors.join(', ')})`,
            border: 'none',
          },
        };
      }
    }

    return { colors: [], style: {} };
  };

  const handleUseMedia = (vehicle) => {
    console.log('Using media for vehicle:', vehicle);
    useMedia(vehicle);
    // TODO: Implement media usage logic
  };

  // if (loading) {
  //   return <ShimmerLoader />;
  // }

  return (
    <>
      <div className="mx-auto max-h-[50vh] w-full overflow-y-auto rounded-lg bg-white p-5 font-sans">
        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-80 flex-1">
            <h1 className="m-0 mb-2 inline-block text-2xl font-semibold text-gray-800">
              Import media from your inventory
            </h1>
            <a
              href="#"
              className="ml-4 text-sm font-medium text-indigo-500 no-underline hover:underline"
            >
              Learn More
            </a>
          </div>
          <div className="flex flex-wrap gap-4">
            <ColorDropdown
              availableColors={availableColors}
              chosenColor={chosenColor}
              handleColorChange={handleColorChange}
            />
          </div>
        </div>

        {/* Subtitle */}
        <div className="mb-8">
          <p className="m-0 text-base text-gray-600">
            We've found similar variants for{' '}
            <span className="font-semibold text-[rgba(64,35,135,1)]">
              {vehicleInfo.year} {vehicleInfo.make?.toUpperCase()}{' '}
              {vehicleInfo.model?.toUpperCase()}{' '}
              {vehicleInfo.trim?.toUpperCase()}
            </span>
          </p>
        </div>

        {/* Vehicle Cards Grid */}
        {!loading ? (
          <div className="mt-5 grid max-h-[38vh] grid-cols-1 gap-5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehiclesData.map((vehicle, index) => (
              <CarCard
                key={index}
                vehicle={vehicle}
                onUseMedia={handleUseMedia}
              />
            ))}
          </div>
        ) : (
          <ShimmerLoader />
        )}

        {/* Empty State */}
        {vehiclesData.length === 0 && !loading && (
          <div className="py-15 px-5 text-center text-gray-600">
            <p className="m-2 text-base">
              No vehicles found for the selected criteria.
            </p>
            <p className="m-2 text-base">
              Try adjusting the variant or color selection.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClonePresenter;
