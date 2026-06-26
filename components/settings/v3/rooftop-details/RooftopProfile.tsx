import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';
// @ts-ignore - JS file from packages without type declarations
import { getCommonRooftopConfigs } from '@spyne-console/components/onboarding/rooftop-profile/api/get-common-rooftop-configs';
import OnboardingRooftopDetails from '@spyne-console/components/onboarding/rooftop-profile/onboarding-rooftop-details';

import useUserDetails from '@/hooks/settings/useUserDetails';

import DurationHolder from '../common/DurationHolder';
import RooftopViniConfiguration, {
  RooftopViniConfigFormData,
} from './RooftopViniConfiguration';

// Helper function to compare addresses
const compareAddresses = (address1: any, address2: any): boolean => {
  if (!address1 || !address2) {
    return false;
  }

  const normalize = (str: string) =>
    (str || '').toLowerCase().trim().replace(/\s+/g, ' ');

  return (
    normalize(address1.addressLine1) === normalize(address2.addressLine1) &&
    normalize(address1.addressLine2 || '') ===
      normalize(address2.addressLine2 || '') &&
    normalize(address1.city) === normalize(address2.city) &&
    normalize(address1.state) === normalize(address2.state) &&
    normalize(address1.country) === normalize(address2.country) &&
    normalize(address1.zipcode) === normalize(address2.zipcode)
  );
};

const compareGeoCoordinates = (
  geoCoordinates1: any,
  geoCoordinates2: any
): boolean => {
  if (!geoCoordinates1 || !geoCoordinates2) {
    return false;
  }
  return (
    geoCoordinates1.lat === geoCoordinates2.lat &&
    geoCoordinates1.lng === geoCoordinates2.lng
  );
};

const RooftopProfile = forwardRef(
  (
    {
      onFormChange,
      onErrorsChange,
    }: {
      onFormChange: (data: any) => void;
      onErrorsChange: (data: any) => void;
    },
    ref
  ) => {
    const { enterpriseId, teamId } = useUserDetails();
    const rooftopDetailsRef = useRef<any>(null);
    const viniConfigRef = useRef<any>(null);

    const [rooftopFormData, setRooftopFormData] = useState<any>(null);
    const [viniConfigFormData, setViniConfigFormData] =
      useState<RooftopViniConfigFormData | null>(null);

    // Store fetched addresses from API
    const [fetchedAddresses, setFetchedAddresses] = useState<{
      salesAddress: any;
      serviceAddress: any;
      partsAddress: any;
      financeAddress: any;
    }>({
      salesAddress: null,
      serviceAddress: null,
      partsAddress: null,
      financeAddress: null,
    });

    // Store computed "sameAs" flags for each department
    const [addressFlags, setAddressFlags] = useState({
      salesAddressSameAsRooftop: true,
      serviceAddressSameAsSales: true,
      partsAddressSameAsService: true,
      financeAddressSameAsSales: true,
    });

    const [rooftopErrors, setRooftopErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });
    const [viniErrors, setViniErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });

    // Expose showAllErrors method to parent
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        rooftopDetailsRef.current?.showAllErrors();
        viniConfigRef.current?.showAllErrors();

        // Scroll to first section with errors after validation completes
        setTimeout(() => {
          if (!rooftopErrors.hasErrors && viniErrors.hasErrors) {
            viniConfigRef.current?.scrollToError();
          }
        }, 100);
      },
    }));

    // Fetch all addresses from common rooftop configs
    useEffect(() => {
      const fetchAddresses = async () => {
        if (!enterpriseId || !teamId) {
          return;
        }

        try {
          const configData = await getCommonRooftopConfigs({
            enterpriseId,
            teamId,
          });

          if (configData) {
            setFetchedAddresses({
              salesAddress: configData.salesAddress || null,
              serviceAddress: configData.serviceAddress || null,
              partsAddress: configData.partsAddress || null,
              financeAddress: configData.financeAddress || null,
            });
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      };

      fetchAddresses();
    }, [enterpriseId, teamId]);

    // Compare addresses and compute "sameAs" flags when addresses are available
    useEffect(() => {
      const rooftopAddress = rooftopFormData?.rooftopAddress;
      const rooftopGeoCoordinates = rooftopFormData?.geoCoordinates;

      // Helper to check if address matches
      // Returns true if addresses match OR if the first address is missing/null (default to "same")
      const isAddressMatch = (
        address1: any,
        geoCoordinates1: any,
        address2: any,
        geoCoordinates2: any
      ): boolean => {
        // If the first address doesn't exist, default to "same" (true)
        if (!address1) return true;

        // If first address exists but second doesn't, they can't be the same
        if (!address2) return false;

        const addressMatch = compareAddresses(address1, address2);
        const geoMatch =
          geoCoordinates1 && geoCoordinates2
            ? compareGeoCoordinates(geoCoordinates1, geoCoordinates2)
            : false;

        return addressMatch && geoMatch;
      };

      // Compute salesAddressSameAsRooftop
      const salesAddressSameAsRooftop = isAddressMatch(
        fetchedAddresses.salesAddress?.address,
        fetchedAddresses.salesAddress?.geoCoordinates,
        rooftopAddress,
        rooftopGeoCoordinates
      );

      // Compute serviceAddressSameAsSales
      const serviceAddressSameAsSales = isAddressMatch(
        fetchedAddresses.serviceAddress?.address,
        fetchedAddresses.serviceAddress?.geoCoordinates,
        fetchedAddresses.salesAddress?.address,
        fetchedAddresses.salesAddress?.geoCoordinates
      );

      // Compute partsAddressSameAsService
      const partsAddressSameAsService = isAddressMatch(
        fetchedAddresses.partsAddress?.address,
        fetchedAddresses.partsAddress?.geoCoordinates,
        fetchedAddresses.serviceAddress?.address,
        fetchedAddresses.serviceAddress?.geoCoordinates
      );

      // Compute financeAddressSameAsSales
      const financeAddressSameAsSales = isAddressMatch(
        fetchedAddresses.financeAddress?.address,
        fetchedAddresses.financeAddress?.geoCoordinates,
        fetchedAddresses.salesAddress?.address,
        fetchedAddresses.salesAddress?.geoCoordinates
      );

      setAddressFlags({
        salesAddressSameAsRooftop,
        serviceAddressSameAsSales,
        partsAddressSameAsService,
        financeAddressSameAsSales,
      });
    }, [
      fetchedAddresses,
      rooftopFormData?.rooftopAddress,
      rooftopFormData?.geoCoordinates,
    ]);

    // Handle form data from OnboardingRooftopDetails
    const handleRooftopFormChange = (data: any) => {
      setRooftopFormData(data);
    };

    // Handle form data from RooftopViniConfiguration
    const handleViniConfigFormChange = (data: RooftopViniConfigFormData) => {
      setViniConfigFormData(data);
    };

    // Merge and emit form data whenever either changes
    useEffect(() => {
      if (onFormChange) {
        const mergedFormData = {
          ...rooftopFormData,
          viniConfig: viniConfigFormData,
        };
        onFormChange(mergedFormData);
      }
    }, [rooftopFormData, viniConfigFormData]);

    // Handle errors from OnboardingRooftopDetails
    const handleRooftopErrorsChange = (errorData: any) => {
      setRooftopErrors(errorData);
      const mergedErrors = {
        hasErrors: errorData.hasErrors || viniErrors.hasErrors,
        isValid: errorData.isValid && viniErrors.isValid,
        errors: {
          ...viniErrors.errors,
          ...errorData.errors,
        },
      };
      onErrorsChange?.(mergedErrors);
    };

    // Handle errors from RooftopViniConfiguration
    const handleViniErrorsChange = (errorData: any) => {
      setViniErrors(errorData);
      const mergedErrors = {
        hasErrors: rooftopErrors.hasErrors || errorData.hasErrors,
        isValid: rooftopErrors.isValid && errorData.isValid,
        errors: {
          ...rooftopErrors.errors,
          ...errorData.errors,
        },
      };
      onErrorsChange?.(mergedErrors);
    };

    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="mr-12 flex h-full flex-col gap-6 py-8">
          <OnboardingStepHeader
            title="Rooftop Details"
            description="Please provide your dealership information and contact details."
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div className="h-[calc(100%-120px)] w-full">
            <OnboardingRooftopDetails
              ref={rooftopDetailsRef}
              enterpriseId={enterpriseId}
              teamId={teamId}
              isProductVini={true}
              onFormChange={handleRooftopFormChange}
              onErrorsChange={handleRooftopErrorsChange}
            >
              <div className="flex w-full flex-col gap-4">
                <RooftopViniConfiguration
                  ref={viniConfigRef}
                  onFormChange={handleViniConfigFormChange}
                  onErrorsChange={handleViniErrorsChange}
                  rooftopAddress={{
                    address: rooftopFormData?.rooftopAddress,
                    geoCoordinates: rooftopFormData?.geoCoordinates,
                  }}
                  initialAddresses={{
                    salesAddress: fetchedAddresses.salesAddress,
                    serviceAddress: fetchedAddresses.serviceAddress,
                    partsAddress: fetchedAddresses.partsAddress,
                    financeAddress: fetchedAddresses.financeAddress,
                  }}
                  addressFlags={addressFlags}
                />
              </div>
            </OnboardingRooftopDetails>
          </div>
        </div>
      </div>
    );
  }
);

RooftopProfile.displayName = 'RooftopProfile';

export default RooftopProfile;
