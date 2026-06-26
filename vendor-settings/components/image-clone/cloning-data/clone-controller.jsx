import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// import CentralAPIHandler from '@/components/centralAPIHandler/centralAPIHandler';
import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import NoClonePresenter from '../no-clone-data/no-clone-presenter';
import ClonePresenter from './clone-presenter';
import EnterpriseCloneDisabledPresenter from './enterprise-clone-disabled-presenter';

// Shimmer loader component
const ShimmerLoader = () => (
  <div className="flex w-full flex-row justify-around p-4">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="animate-pulse rounded-lg bg-white p-4 shadow-md"
      >
        <div className="flex items-center space-x-4">
          <div className="h-32 w-28 rounded-lg bg-gray-300"></div>
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

// Utility function to check if an object is non-empty
const isNonEmptyObject = (obj) =>
  obj && Object.keys(obj).length > 0 && obj.constructor === Object;

// Utility function to remove square brackets from a string
const removeSquareBrackets = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/^\[|\]$/g, '');
};

const CloneController = ({
  useMedia,
  editVehicle,
  vinDetails = {},
  EditVin,
  setEditVin = () => {},
  setHeightClone = () => {},
  dealerVin = null,
  initialColor = null,
}) => {
  const dispatch = useDispatch();

  const [chosenColor, setChosenColor] = useState(initialColor);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(false);
  const [enterpriseCloneDisabled, setEnterpriseCloneDisabled] = useState(false);

  // Get data from Redux store
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const authReducer = useSelector((state) => state.authReducer);
  const vinDataFromRedux = useSelector(
    (state) => state.imageStudioReducer.vinData
  );

  // Memoize effectiveVinData so it updates when either source changes
  const effectiveVinData = useMemo(() => {
    return isNonEmptyObject(vinDetails) ? vinDetails : vinDataFromRedux;
  }, [vinDetails, vinDataFromRedux]);

  // Extract vehicleSnap data from effectiveVinData
  const vehicleSnap = effectiveVinData?.vehicleSnap || {};

  const getCloneData = async (selectedColor = null, checkFallBack = false) => {
    toast.error('Error fetching clone data:');
    try {
      setApiResponse(false);
      setLoading(true);
      const queryParams = new URLSearchParams(window.location.search);
      const enterpriseId =
        queryParams.get('enterprise_id') ||
        enterpriseTeamReducer?.enterprise?.enterprise_id ||
        enterpriseTeamReducer?.selectedEnterprise?.enterprise_id;

      const teamId = queryParams.get('team_id')
        ? removeSquareBrackets(queryParams.get('team_id'))
        : enterpriseTeamReducer?.selectedTeam?.team_id;

      const userId =
        authReducer?.userId ||
        queryParams.get('user_id') ||
        queryParams.get('userId');

      // Extract vehicle metadata from vehicleSnap
      const vehicleMetadataUpdates = {
        make: vehicleSnap?.make?.value || '',
        model: vehicleSnap?.model?.value || '',
        year: vehicleSnap?.year?.value
          ? parseInt(vehicleSnap.year.value)
          : vehicleSnap?.year?.value,
        trim: vehicleSnap?.trim?.value || '',
      };
      // const vehicleMetadataUpdates = {
      //     make:  'Chevrolet',
      //     model:  'Camaro',
      //     year: 2024,
      //     trim: 'qq'
      // };

      const requestData = {
        enterpriseId: enterpriseId,
        userId: userId,
        vehicleMetadataUpdates: vehicleMetadataUpdates,
        teamId: teamId,
        dealerVinId: dealerVin,
      };

      // Add color to request if selected
      if (selectedColor) {
        requestData.color = selectedColor;
      }

      const response = await CentralAPIHandler.handlePostRequest(
        process.env.APP_BACKEND_BASEURL + '/inventory/v3/process-clone-list',
        requestData
      );

      // Handle the response data
      if (response?.data) {
        setVehiclesData(response.data.vehiclesData || []);
        if (response?.data?.vehiclesData?.length == 0) {
          setHeightClone(true);
        }
        setAvailableColors(
          [
            ...response.data.interiorColors,
            ...response.data.exteriorColors,
            { color: 'All Colors', value: 'All Colors' },
          ] || [{ color: 'All Colors', value: 'All Colors' }]
        );

        // If no color was selected and colors are available, select the first one
        if (
          !selectedColor &&
          response.data.interiorColors &&
          response.data.interiorColors.length > 0
        ) {
          const firstColor = response.data.interiorColors[0].color;
          // setChosenColor(firstColor);
          // Optionally re-fetch with the first color
          // await getCloneData(firstColor);
        }

        if (
          checkFallBack &&
          initialColor &&
          response.data.vehiclesData?.length === 0
        ) {
          setChosenColor(null);
          await getCloneData();
        }
      } else {
        setEnterpriseCloneDisabled(true);
      }

      setApiResponse(true);

      return response;
    } catch (error) {
      setApiResponse(true);
      setHeightClone(true);
      setVehiclesData([]);
      setEnterpriseCloneDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle color selection
  const handleColorChange = async (color) => {
    setChosenColor(color);
    if (color === 'All Colors') {
      await getCloneData();
    } else {
      await getCloneData(color);
    }
  };

  useEffect(() => {
    if (initialColor) {
      getCloneData(initialColor, true);
    } else {
      getCloneData();
    }
  }, [
    vehicleSnap?.vin?.value,
    vehicleSnap?.make?.value,
    vehicleSnap?.model?.value,
    vehicleSnap?.year?.value,
    vehicleSnap?.trim?.value,
  ]);

  return (
    <>
      {enterpriseCloneDisabled ? (
        <EnterpriseCloneDisabledPresenter />
      ) : vehiclesData.length > 0 ? (
        <ClonePresenter
          vehiclesData={vehiclesData}
          availableColors={availableColors}
          chosenColor={chosenColor}
          loading={loading}
          handleColorChange={handleColorChange}
          useMedia={useMedia}
        />
      ) : apiResponse ? (
        <NoClonePresenter
          editVehicle={editVehicle}
          EditVin={EditVin}
          setEditVin={setEditVin}
          vinDetails={vinDetails}
        />
      ) : (
        <ShimmerLoader />
      )}
    </>
  );
};

export default CloneController;
