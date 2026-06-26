import React from 'react';

export default function EnterpriseCloneDisabledPresenter() {
  return (
    <div className="flex w-full flex-1 flex-row justify-between rounded-lg bg-white">
      <div className="flex w-full flex-row justify-between p-5">
        <div className="flex w-[44%] flex-col gap-1">
          <span className="text-sm font-medium text-[rgba(0,0,0,0.4)]">
            IMPORT MEDIA FROM YOUR INVENTORY
          </span>
          <span className="w-96 py-2 text-lg font-semibold text-[rgba(0,0,0,0.9)]">
            Image cloning is not enabled for the enterprise
          </span>
          <span className="text-sm text-[rgba(0,0,0,0.4)]">
            Please contact your administrator to enable image cloning for your
            enterprise.
          </span>
        </div>
        <div className="flex w-[50%] flex-col justify-center gap-2">
          <img
            className="w-full"
            src={
              'https://spyne-static.s3.us-east-1.amazonaws.com/console/image_cloning/car_cloning_image.svg'
            }
            alt="enterprise-clone-disabled"
          />
        </div>
      </div>
    </div>
  );
}
