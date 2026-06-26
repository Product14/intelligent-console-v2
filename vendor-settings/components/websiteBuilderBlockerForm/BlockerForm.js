'use client';

import { UpdateManagementSyncData } from '@spyne-console/store';
import { useSelector } from '@spyne-console/store';

import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';

import Image from 'next/image';

import Spinner from '@spyne-console/design-system/spinner';

function BlockerForm({ isBoardingLead }) {
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const authReducer = useSelector((state) => state.authReducer);

  const [formData, setFormData] = useState({
    phone_number: '',
    message: '',
    email_id: authReducer?.emailId,
    isd_code: '',
    company_name: enterpriseTeamReducer?.enterprise?.enterprise_name,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(null);

  //
  useEffect(() => {
    setShowPopup(isBoardingLead);
  }, [isBoardingLead]);

  const validateFormFields = ({ formFields = {} }) => {
    const error = {};
    let emailId = formData?.email?.trim();
    emailId = emailId?.toLowerCase();

    if (!formData?.email_id || !formData?.email_id.trim()) {
      error.email_id = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email_id.trim())) {
        error.email_id = 'Invalid email address';
      }
    }
    if (!formData?.phone_number || !formData?.phone_number.trim()) {
      error.phone_number = 'Mobile Number is required';
    } else {
      const phoneRegex = /^[0-9]{8,14}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        error.phone_number = 'Mobile Number must be between 8 and 14 digits';
      }
    }
    return error;
  };

  const handlePhoneInput = (value, data) => {
    let tempErr = { ...formErrors };
    delete tempErr.phone_number;
    setFormErrors(tempErr);
    setFormData({
      ...formData,
      phone_number: value.replace(data.dialCode, ''),
      isd_code: `+${data.dialCode}`,
    });
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    let error = validateFormFields({ formFields: formData });

    setFormErrors(error);

    for (let key in error) {
      if (error[key]) {
        setIsLoading(false);
        return;
      }
    }
    try {
      const res = await UpdateManagementSyncData({
        enterprise_id: enterpriseTeamReducer.selectedTeam.enterprise_id,
        team_id: enterpriseTeamReducer.selectedTeam.team_id,
        team_name: enterpriseTeamReducer.selectedTeam.team_name,
        company_name: formData.company_name,
        user_id: authReducer.userId,
        phone_number: formData.phone_number,
        message: formData.message,
        email_id: formData.email_id,
        isd_code: formData.isd_code,
      });
      setShowPopup(true);
    } catch {
      console.error('There was an error submitting the form', error);

      setIsLoading(false);
    } finally {
      setIsLoading(false);
      // setFormData({})
    }
  };

  if (showPopup === true) {
    return (
      <div className="pointer-events-auto w-[495px] rounded-3xl bg-white p-6 text-center">
        <Image
          src={'https://spyne-static.s3.amazonaws.com/console/spyneLogoPng.svg'}
          className="mx-auto"
          width={116}
          height={100}
        />
        <p className="text-2xl font-medium">
          We got your <span className="text-blue-light font-bold">Message</span>
        </p>
        <p className="mb-6 text-black/50">
          Someone from our Team will connect with you soon.
        </p>
      </div>
    );
  }
  if (showPopup === false) {
    return (
      <div className="pointer-events-auto max-w-[495px] rounded-xl bg-white p-6 text-center">
        <Image
          src={'https://spyne-static.s3.amazonaws.com/console/spyneLogoPng.svg'}
          className="mx-auto mb-6"
          width={116}
          height={100}
        />
        <p className="mb-3 text-2xl font-medium">
          Submit <span className="text-blue-light font-bold">Response</span>
        </p>
        <p className="mb-6 text-base font-normal text-black/50">
          Just drop in your details here and we'll get back to you!
        </p>
        <div className="mb-6 w-full">
          <div className="w-full border-b border-black/30">
            <input
              className="placeholder:text-black-40 w-full px-3 py-2 text-lg leading-6 text-black/80 placeholder:font-medium"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_name: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="mb-6 w-full">
          <div className="w-full border-b border-black/30">
            <input
              className="placeholder:text-black-40 w-full px-3 py-2 text-lg leading-6 text-black/80 placeholder:font-medium"
              placeholder="E Mail"
              value={formData.email_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email_id: e.target.value }))
              }
            />
          </div>
          {formErrors?.email_id && (
            <div className="pt-1 text-left text-xs leading-5 text-red-500">
              {formErrors?.email_id}
            </div>
          )}
          <div className="mt-4 w-full border-b border-black/30">
            <PhoneInput
              country={'us'}
              onChange={(value, data) => handlePhoneInput(value, data)}
              enableSearch={true}
              inputProps={{
                name: 'phone',
                className:
                  'w-full pl-12 placeholder:text-black-40 placeholder:font-medium',
              }}
              containerClass="border-none spyne-submit-response text-lg font-medium leading-6 text-black/80"
            />
          </div>
          {formErrors?.phone_number && (
            <div className="pt-1 text-left text-xs leading-5 text-red-500">
              {formErrors?.phone_number}
            </div>
          )}
          <div className={`mt-4 w-full border-b border-black/30`}>
            <p className="mb-3 text-left text-base font-semibold text-black/60">
              Leave us a message
            </p>
            <textarea
              className="h-20 w-full resize-none text-base font-normal text-black/80"
              placeholder="Message here"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>
          {formErrors?.message && (
            <div className="pt-1 text-left text-xs leading-5 text-red-500">
              {formErrors?.message}
            </div>
          )}
        </div>
        <div className="flex">
          <button
            className="secondary-btn h-[52px] w-full"
            onClick={handleFormSubmit}
          >
            {isLoading ? <Spinner type={'LIGHT'} /> : 'Submit'}
          </button>
        </div>
      </div>
    );
  }
}

export default BlockerForm;
