// import EditVin from '../../editVin/EditVin';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Image from 'next/image';

import Portal from '../../hoc/Portal';

const isNonEmptyObject = (obj) =>
  obj && Object.keys(obj).length > 0 && obj.constructor === Object;

export default function NoClonePresenter({
  editVehicle,
  EditVin,
  setEditVin = () => {},
  vinDetails = {},
}) {
  const [isEditVinOpen, setIsEditVinOpen] = useState(false);
  const vinRef = useRef(null);
  const [isVehicleDataPresent, setIsVehicleDataPresent] = useState(false);
  const vinDataFromRedux = useSelector(
    (state) => state.imageStudioReducer.vinData
  );

  // Memoize effectiveVinData so it updates when either source changes
  const vinData = useMemo(() => {
    return isNonEmptyObject(vinDetails) ? vinDetails : vinDataFromRedux;
  }, [vinDetails, vinDataFromRedux]);

  // Extract vehicleSnap data from effectiveVinData

  useEffect(() => {
    if (
      vinData?.vehicleSnap?.make?.value &&
      vinData?.vehicleSnap?.model?.value &&
      vinData?.vehicleSnap?.year?.value &&
      vinData?.vehicleSnap?.trim?.value
    ) {
      setIsVehicleDataPresent(true);
    }
  }, [
    vinData?.vehicleSnap?.make?.value,
    vinData?.vehicleSnap?.model?.value,
    vinData?.vehicleSnap?.year?.value,
    vinData?.vehicleSnap?.trim?.value,
  ]);
  return (
    <div className="flex w-full flex-1 flex-row justify-between rounded-lg bg-white">
      <div className="flex w-full flex-row justify-between p-5">
        <div className="flex w-[44%] flex-col gap-1">
          <span className="text-sm font-medium text-[rgba(0,0,0,0.4)]">
            IMPORT MEDIA FROM YOUR INVENTORY
          </span>
          {!isVehicleDataPresent ? (
            <span className="w-96 py-2 text-lg font-semibold text-[rgba(0,0,0,0.9)]">
              Enter Vehicle VIN or Details to Import Media from Your Inventory
            </span>
          ) : (
            <span className="max-w-80 py-2 text-lg font-semibold text-[rgba(0,0,0,0.9)]">
              We couldn’t find similar variants for &nbsp;
              <span className="text-[rgba(70,0,242,1)]">
                {vinData?.vehicleSnap?.make?.value}{' '}
                {vinData?.vehicleSnap?.model?.value}{' '}
                {vinData?.vehicleSnap?.year?.value}{' '}
                {vinData?.vehicleSnap?.trim?.value}
                {vinData?.vehicleSnap?.exteriorColor?.value?.[0] &&
                  `${' '}${vinData?.vehicleSnap?.exteriorColor?.value?.[0]}`}
              </span>
            </span>
          )}
          {isVehicleDataPresent ? (
            <span className="text-sm text-[rgba(0,0,0,0.4)]">
              Please check if you’ve added the correct VIN number or if the
              vehicle details fetched are correct.
            </span>
          ) : (
            <span className="text-sm text-[rgba(0,0,0,0.4)]">
              Shoot once and import media recurrently for every new vehicle with
              same combination of make model year trim colour.
            </span>
          )}
          <div className="flex flex-row gap-2 pt-2 align-baseline">
            <button
              ref={vinRef}
              className="w-36 cursor-pointer rounded-md border-[1px] border-[rgba(0,0,0,0.1)] px-4 py-2 font-semibold text-black transition-all duration-300 hover:translate-y-1"
              onClick={() => {
                if (EditVin) setIsEditVinOpen(true);
                else {
                  setEditVin();
                }
              }}
              // disabled={!EditVin}
            >
              {isVehicleDataPresent ? 'Edit VIN' : 'Enter VIN'}
            </button>
            <p
              onClick={editVehicle}
              className="text-md ml-4 cursor-pointer pt-3 font-medium text-[rgba(70,0,242,1)] underline"
            >
              {isVehicleDataPresent
                ? 'Edit Vehicle Details'
                : 'Enter Vehicle Details'}
            </p>
          </div>
        </div>
        <div className="flex w-[50%] flex-col justify-center gap-2">
          <img
            className="w-full"
            src={
              'https://spyne-static.s3.us-east-1.amazonaws.com/console/image_cloning/car_cloning_image.svg'
            }
            alt="no-clone"
          />
        </div>
      </div>
      {isEditVinOpen && EditVin && (
        <Portal>
          <PositionedEditVin
            vinRef={vinRef}
            isDropdownOpen={isEditVinOpen}
            onClose={() => setIsEditVinOpen(false)}
            EditVin={EditVin}
          />
        </Portal>
      )}
    </div>
  );
}

function PositionedEditVin({ vinRef, EditVin, ...props }) {
  const [style, setStyle] = React.useState({});
  React.useLayoutEffect(() => {
    if (vinRef.current) {
      const rect = vinRef.current.getBoundingClientRect();
      setStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        zIndex: 9999,
      });
    }
  }, [vinRef.current]);
  return (
    <div className="w-64" style={style}>
      <EditVin {...props} vinRef={vinRef} />
    </div>
  );
}

// NOTE: Ensure there is a <div id="myportal"></div> in your main _app.js or index.html for the Portal to work.
