import {
  CnamAuthorizedRepresentativeRequest,
  CnamProfilesResponse,
  CnamRegistrationPayload,
  CnamRegistrationRequest,
  CnamRegistrationResponse,
} from '@/models/twilio.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

const ENDPOINTS = {
  customerProfiles: `${BASE_URL}/user-management/v1/twilio/customer-profiles`,
  createSubaccount: `${BASE_URL}/user-management/v1/twilio/subaccounts/create`,
};

function toCnamRegistrationRequest(
  payload: CnamRegistrationPayload
): CnamRegistrationRequest {
  const { businessDetails: bd, authorizedRepresentatives: reps } = payload;

  return {
    enterprise_id: payload.enterpriseId,
    team_id: payload.teamId,
    business_details: {
      name: bd.name,
      display_name: bd.displayName,
      identity: bd.identity,
      type: bd.type,
      industry: bd.industry,
      operation_region: bd.operationRegion,
      registration_id_type: bd.registrationIdType,
      registration_id_value: bd.registrationIdValue,
      website: bd.website,
      address: {
        street: bd.address.street,
        city: bd.address.city,
        state: bd.address.state,
        zip: bd.address.zip,
        country: bd.address.country,
      },
    },
    authorized_representatives: reps.map(
      (rep): CnamAuthorizedRepresentativeRequest => ({
        first_name: rep.firstName,
        last_name: rep.lastName,
        email: rep.email,
        phone_number: `+${rep.phoneNumber}`,
        title: rep.title,
        position: rep.position,
      })
    ),
  };
}

export async function fetchCnameProfilesAPI(
  enterpriseId: string,
  teamId: string
): Promise<CnamProfilesResponse> {
  const response = await CentralAPIHandler.handleGetRequest(
    ENDPOINTS.customerProfiles,
    { enterprise_id: enterpriseId, team_id: teamId }
  );
  return response as CnamProfilesResponse;
}

export async function registerCnameAPI(
  payload: CnamRegistrationPayload
): Promise<CnamRegistrationResponse> {
  const requestBody = toCnamRegistrationRequest(payload);
  const response = await CentralAPIHandler.handlePostRequest(
    ENDPOINTS.customerProfiles,
    requestBody
  );
  return response as CnamRegistrationResponse;
}

export async function createTwilioSubaccountAPI(
  enterpriseId: string
): Promise<any> {
  return CentralAPIHandler.handlePostRequest(ENDPOINTS.createSubaccount, {
    enterprise_id: enterpriseId,
  });
}

const twilioService = {
  fetchCnameProfilesAPI,
  registerCnameAPI,
  createTwilioSubaccountAPI,
};

export default twilioService;
