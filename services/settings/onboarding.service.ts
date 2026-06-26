import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { StringUtils } from '@/utils-settings/StringUtils';

export interface UpdateOnboardingTaskPayload {
  productLineId: string;
  taskName: OnboardingTaskName;
  agentType: string;
  agentCallType: string;
}

export interface UpdateOnboardingTaskResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface OnboardingTask {
  taskName: string;
  segmentName: string;
  status: 'COMPLETED' | 'INPROGRESS' | 'PENDING';
  startTime: string | null;
  endTime: string | null;
}

export interface OnboardingProgressData {
  onboardingProgress: OnboardingTask[];
  percentageCompletion: number;
  onboardingStartTime: string;
}

export interface OnboardingProgressResponse {
  message: string;
  error: boolean;
  code: string;
  details: any;
  data: OnboardingProgressData;
}

export interface GetOnboardingProgressPayload {
  teamId: string;
  productLineId: string;
}

export interface GetTeamOnboardingStagePayload {
  enterpriseId: string;
  teamId: string;
}

export interface TeamOnboardingStageData {
  stage: string;
  subStage: string;
  productLineId: string;
  name: string;
}

export enum OnboardingTaskName {
  ROOFTOP_SETUP = 'RoofTop Setup',
  BRAND_REGISTRATION = 'CNAM Registration',
  USER_SETUP = 'User Setup',
  ROUTING_DIRECTORY = 'Employee Directory',
  AGENT_CUSTOMIZATION = 'Agent Customization',
  IMS_INTEGRATION = 'IMS Integration',
  CRM_INTEGRATION = 'CRM Integration',
  CAR_HISTORY_INTEGRATION = 'Vehicle History Integration',
  SERVICE_SCHEDULER_INTEGRATION = 'Service Scheduler',
  CONSENT_APPROVAL = 'Consent',
  COMPLIANCE_DOCUMENT_CHECK = 'Compliance Document',
  SPEED_TO_LEAD_CONFIGURATION = 'Speed To Lead',
  SMART_VIEW_SETUP = 'Smart View',
  AGENT_TESTING = 'Agent Testing',
  DEPLOY_AGENT = 'Deploy Agent',
}

export const OnboardingTaskOrder = {
  [OnboardingTaskName.ROOFTOP_SETUP]: 1,
  [OnboardingTaskName.BRAND_REGISTRATION]: 2,
  [OnboardingTaskName.USER_SETUP]: 3,
  [OnboardingTaskName.ROUTING_DIRECTORY]: 4,
  [OnboardingTaskName.AGENT_CUSTOMIZATION]: 5,
  [OnboardingTaskName.IMS_INTEGRATION]: 6,
  [OnboardingTaskName.CRM_INTEGRATION]: 7,
  [OnboardingTaskName.CAR_HISTORY_INTEGRATION]: 8,
  [OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION]: 9,
  [OnboardingTaskName.CONSENT_APPROVAL]: 10,
  [OnboardingTaskName.COMPLIANCE_DOCUMENT_CHECK]: 11,
  [OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION]: 12,
  [OnboardingTaskName.SMART_VIEW_SETUP]: 13,
  [OnboardingTaskName.AGENT_TESTING]: 14,
  [OnboardingTaskName.DEPLOY_AGENT]: 15,
};

export const updateOnboardingTaskAPI = async (
  payload: UpdateOnboardingTaskPayload,
  shouldCompleteTask: boolean = true
): Promise<UpdateOnboardingTaskResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/onboarding-tracker/update-onboarding-task`;

  const segmentName = `${payload.agentCallType}${StringUtils.toCapitalize(payload.agentType)}`;

  let payloadData: any = {
    productLineId: payload.productLineId,
    taskName: payload.taskName,
    segmentName,
  };

  if (shouldCompleteTask) {
    payloadData.isCompleted = true;
  }

  const response = await CentralAPIHandler.handlePostRequest(url, payloadData);

  return response;
};

export const getOnboardingProgressAPI = async (
  payload: GetOnboardingProgressPayload
): Promise<OnboardingProgressResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/onboarding-tracker/get-onboarding-tracker`;

  const queryParams = {
    teamId: payload.teamId,
    productLineId: payload.productLineId,
  };

  const response = await CentralAPIHandler.handleGetRequest(url, queryParams);

  return response;
};

export const getTeamOnboardingStageAPI = async (
  payload: GetTeamOnboardingStagePayload
): Promise<TeamOnboardingStageData[]> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/product-line/get-product-line-details-by-team`;

  const queryParams = {
    enterpriseId: payload.enterpriseId,
    teamId: payload.teamId,
  };

  const response = await CentralAPIHandler.handleGetRequest(url, queryParams);

  return response.data;
};

// File Upload Types
export interface FileUploadItem {
  fileName: string;
  fileType: string;
}

export interface PresignedUrlRequest {
  imageList: FileUploadItem[];
  bucketType: string;
}

export interface PresignedUrlData {
  fileName: string;
  fileType: string;
  presignedURL: string;
}

export interface PresignedUrlResponse {
  message: string;
  error: boolean;
  code: string;
  details: any;
  data: PresignedUrlData[];
}

// Get presigned URLs for file upload
export const getPresignedUrlsAPI = async (
  payload: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/util/gen-presigned`;

  const response = await CentralAPIHandler.handlePostRequest(url, payload);

  return response;
};

// Upload file to S3 using presigned URL
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<boolean> => {
  try {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
