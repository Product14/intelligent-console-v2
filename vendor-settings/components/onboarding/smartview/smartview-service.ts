import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import type {
  SaveSmartViewEntityResponse,
  SmartViewEntityConfig,
  SmartViewEntityResponse,
} from './types';

const BASE_URL = process.env.APP_BACKEND_BASEURL;

// API endpoints
const ENDPOINTS = {
  getEntityConfig: `${BASE_URL}/central-config/v1/integration`,
  saveEntity: `${BASE_URL}/central-config/v1/integration`,
};

/**
 * Fetch SmartView entity configuration
 */
export async function fetchSmartViewEntityConfig(
  enterpriseId: string,
  teamId: string
): Promise<SmartViewEntityResponse | null> {
  try {
    const response = await CentralAPIHandler.handleGetRequest(
      ENDPOINTS.getEntityConfig,
      {
        enterpriseId,
        teamId,
        domain: 'publish',
        entity: 'SMARTVIEW',
      }
    );
    return response?.data as SmartViewEntityResponse;
  } catch (error) {
    console.error('Failed to fetch SmartView entity config:', error);
    return null;
  }
}

/**
 * Save SmartView entity configuration
 */
export async function saveSmartViewEntityConfig(
  params: {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
  },
  entityconfig: SmartViewEntityConfig
): Promise<SaveSmartViewEntityResponse> {
  try {
    const response = await CentralAPIHandler.handlePostRequest(
      ENDPOINTS.saveEntity,
      {
        enterpriseId: params.enterpriseId,
        enterpriseName: params.enterpriseName,
        teamId: params.teamId,
        teamName: params.teamName,
        userId: params.userId,
        domain: 'publish',
        entity: 'SMARTVIEW',
        entityconfig,
      }
    );
    return response as SaveSmartViewEntityResponse;
  } catch (error) {
    console.error('Failed to save SmartView entity config:', error);
    return {
      success: false,
      message: 'Failed to save SmartView configuration',
    };
  }
}

const smartviewService = {
  fetchSmartViewEntityConfig,
  saveSmartViewEntityConfig,
};

export default smartviewService;
