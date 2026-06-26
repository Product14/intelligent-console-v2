import { OnboardingTaskName } from '@/services/onboarding.service';

import React from 'react';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FaShippingFast, FaUserCheck } from 'react-icons/fa';
import { GrServices } from 'react-icons/gr';
import { IoIosSettings } from 'react-icons/io';
import { IoDocumentsOutline } from 'react-icons/io5';
import { LiaBusinessTimeSolid } from 'react-icons/lia';
import {
  MdInventory,
  MdManageHistory,
  MdOutlineSmartButton,
} from 'react-icons/md';
import { RiContactsBook2Line } from 'react-icons/ri';

import { AgentProgressResult } from '@/hooks/use-onboarding-progress-redux';

import {
  AddUsersIcon,
  DeployAgentIcon,
  PersonaSelectionIcon,
  RooftopProfileIcon,
  TestAgentIcon,
} from './onboarding/onboardingIcons';

export enum OnboardingStep {
  NOT_STARTED = 'not-started',
  ROOFTOP_SETUP = 'rooftop-setup',
  CALLER_ID_REGISTRATION = 'caller-id-registration',
  INVITE_USERS = 'invite-users',
  ROUTING_DIRECTORY = 'routing-directory',
  AGENT_SETUP = 'agent-setup',
  IMS_INTEGRATION = 'ims-integration',
  CRM_INTEGRATION = 'crm-integration',
  CAR_HISTORY_INTEGRATION = 'car-history-integration',
  SERVICE_SCHEDULER_INTEGRATION = 'service-scheduler-integration',
  CONSENT_APPROVAL = 'consent-approval',
  COMPLIANCE_DOCUMENT_CHECK = 'compliance-document-check',
  SPEED_TO_LEAD_CONFIGURATION = 'speed-to-lead-configuration',
  SMART_VIEW_SETUP = 'smart-view-setup',
  TEST_AGENT = 'test-agent',
  DEPLOY_AGENT = 'deploy-agent',
  COMPLETED = 'completed',

  VINI_CONFIGURATION = 'vini-configuration',
}

export const OnboardingStepOrder = {
  [OnboardingStep.NOT_STARTED]: 0,
  [OnboardingStep.ROOFTOP_SETUP]: 1,
  [OnboardingStep.CALLER_ID_REGISTRATION]: 2,
  [OnboardingStep.INVITE_USERS]: 3,
  [OnboardingStep.ROUTING_DIRECTORY]: 4,
  [OnboardingStep.AGENT_SETUP]: 5,
  [OnboardingStep.IMS_INTEGRATION]: 6,
  [OnboardingStep.CRM_INTEGRATION]: 7,
  [OnboardingStep.CAR_HISTORY_INTEGRATION]: 8,
  [OnboardingStep.SERVICE_SCHEDULER_INTEGRATION]: 9,
  [OnboardingStep.CONSENT_APPROVAL]: 10,
  [OnboardingStep.COMPLIANCE_DOCUMENT_CHECK]: 11,
  [OnboardingStep.SPEED_TO_LEAD_CONFIGURATION]: 12,
  [OnboardingStep.SMART_VIEW_SETUP]: 13,
  [OnboardingStep.TEST_AGENT]: 14,
  [OnboardingStep.DEPLOY_AGENT]: 15,
  [OnboardingStep.COMPLETED]: 16,
};

export enum StepStatus {
  COMPLETED = 'completed',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
}

export interface OnboardingStepData {
  order: number;
  label: string;
  step: OnboardingStep;
  status: StepStatus;
  icon: React.ReactNode;
  color?: string;
}

export const OnboardingSteps: OnboardingStepData[] = [
  {
    order: 1,
    label: 'Rooftop Profile',
    step: OnboardingStep.ROOFTOP_SETUP,
    status: StepStatus.NOT_STARTED,
    icon: <RooftopProfileIcon />,
  },
  {
    order: 2,
    label: 'Brand Registration',
    step: OnboardingStep.CALLER_ID_REGISTRATION,
    status: StepStatus.NOT_STARTED,
    icon: <LiaBusinessTimeSolid className="size-6" />,
  },
  {
    order: 3,
    label: 'Add Users',
    step: OnboardingStep.INVITE_USERS,
    status: StepStatus.NOT_STARTED,
    icon: <AddUsersIcon />,
  },
  {
    order: 4,
    label: 'Routing Directory',
    step: OnboardingStep.ROUTING_DIRECTORY,
    status: StepStatus.NOT_STARTED,
    icon: <RiContactsBook2Line className="size-6" />,
  },
  {
    order: 4,
    label: 'Agent Setup',
    step: OnboardingStep.AGENT_SETUP,
    status: StepStatus.NOT_STARTED,
    icon: <PersonaSelectionIcon />,
  },
  {
    order: 5,
    label: 'IMS Integration',
    step: OnboardingStep.IMS_INTEGRATION,
    status: StepStatus.NOT_STARTED,
    icon: <MdInventory className="size-6" />,
  },
  {
    order: 6,
    label: 'CRM Integration',
    step: OnboardingStep.CRM_INTEGRATION,
    status: StepStatus.NOT_STARTED,
    icon: <AiOutlineDashboard className="size-6" />,
  },
  {
    order: 7,
    label: 'Car History Integration',
    step: OnboardingStep.CAR_HISTORY_INTEGRATION,
    status: StepStatus.NOT_STARTED,
    icon: <MdManageHistory className="size-6" />,
  },
  {
    order: 8,
    label: 'Service Scheduler Integration',
    step: OnboardingStep.SERVICE_SCHEDULER_INTEGRATION,
    status: StepStatus.NOT_STARTED,
    icon: <GrServices className="size-6" />,
  },
  {
    order: 9,
    label: 'Consent Approval',
    step: OnboardingStep.CONSENT_APPROVAL,
    status: StepStatus.NOT_STARTED,
    icon: <FaUserCheck className="size-6" />,
  },
  {
    order: 10,
    label: 'Compliance Document Check',
    step: OnboardingStep.COMPLIANCE_DOCUMENT_CHECK,
    status: StepStatus.NOT_STARTED,
    icon: <IoDocumentsOutline className="size-6" />,
  },
  {
    order: 11,
    label: 'Speed to Lead Configuration',
    step: OnboardingStep.SPEED_TO_LEAD_CONFIGURATION,
    status: StepStatus.NOT_STARTED,
    icon: <FaShippingFast className="size-6" />,
  },
  {
    order: 12,
    label: 'Smart View Setup',
    step: OnboardingStep.SMART_VIEW_SETUP,
    status: StepStatus.NOT_STARTED,
    icon: <MdOutlineSmartButton className="size-6" />,
  },
  {
    order: 13,
    label: 'Test Agent',
    step: OnboardingStep.TEST_AGENT,
    status: StepStatus.NOT_STARTED,
    icon: <TestAgentIcon />,
  },
  {
    order: 14,
    label: 'Deploy your agent',
    step: OnboardingStep.DEPLOY_AGENT,
    status: StepStatus.NOT_STARTED,
    icon: <DeployAgentIcon />,
  },

  {
    order: 99999,
    label: 'Dept. Details',
    step: OnboardingStep.VINI_CONFIGURATION,
    status: StepStatus.NOT_STARTED,
    icon: <IoIosSettings className="size-6" />,
  },
];

// Helper to map API status to StepStatus enum
const mapApiStatusToStepStatus = (apiStatus: string): StepStatus => {
  switch (apiStatus) {
    case 'COMPLETED':
      return StepStatus.COMPLETED;
    case 'INPROGRESS':
      return StepStatus.IN_PROGRESS;
    case 'PENDING':
    default:
      return StepStatus.NOT_STARTED;
  }
};

export const mapStepsForProgress = (
  progressStep: number
): OnboardingStepData[] => {
  return OnboardingSteps.map((step) => {
    const isCompleted = progressStep > step.order;
    const inProgress = progressStep === step.order;
    return {
      ...step,
      status: isCompleted
        ? StepStatus.COMPLETED
        : inProgress
          ? StepStatus.IN_PROGRESS
          : StepStatus.NOT_STARTED,
    };
  });
};

export const getOnboardingStepByTaskName = (
  onboardingTaskName: OnboardingTaskName
): OnboardingStep => {
  switch (onboardingTaskName) {
    case OnboardingTaskName.BRAND_REGISTRATION:
      return OnboardingStep.CALLER_ID_REGISTRATION;
    case OnboardingTaskName.USER_SETUP:
      return OnboardingStep.INVITE_USERS;
    case OnboardingTaskName.ROUTING_DIRECTORY:
      return OnboardingStep.ROUTING_DIRECTORY;
    case OnboardingTaskName.AGENT_CUSTOMIZATION:
      return OnboardingStep.AGENT_SETUP;
    case OnboardingTaskName.IMS_INTEGRATION:
      return OnboardingStep.IMS_INTEGRATION;
    case OnboardingTaskName.CRM_INTEGRATION:
      return OnboardingStep.CRM_INTEGRATION;
    case OnboardingTaskName.CAR_HISTORY_INTEGRATION:
      return OnboardingStep.CAR_HISTORY_INTEGRATION;
    case OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION:
      return OnboardingStep.SERVICE_SCHEDULER_INTEGRATION;
    case OnboardingTaskName.CONSENT_APPROVAL:
      return OnboardingStep.CONSENT_APPROVAL;
    case OnboardingTaskName.COMPLIANCE_DOCUMENT_CHECK:
      return OnboardingStep.COMPLIANCE_DOCUMENT_CHECK;
    case OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION:
      return OnboardingStep.SPEED_TO_LEAD_CONFIGURATION;
    case OnboardingTaskName.SMART_VIEW_SETUP:
      return OnboardingStep.SMART_VIEW_SETUP;
    case OnboardingTaskName.AGENT_TESTING:
      return OnboardingStep.TEST_AGENT;
    case OnboardingTaskName.DEPLOY_AGENT:
      return OnboardingStep.DEPLOY_AGENT;
    case OnboardingTaskName.ROOFTOP_SETUP:
    default:
      return OnboardingStep.ROOFTOP_SETUP;
  }
};

// ─── Reusable step groups ────────────────────────────────────────────────────

const BASE_STEPS: OnboardingStep[] = [
  OnboardingStep.ROOFTOP_SETUP,
  OnboardingStep.CALLER_ID_REGISTRATION,
  OnboardingStep.INVITE_USERS,
  OnboardingStep.ROUTING_DIRECTORY,
  OnboardingStep.AGENT_SETUP,
];

const SALES_INTEGRATION_STEPS: OnboardingStep[] = [
  OnboardingStep.IMS_INTEGRATION,
  OnboardingStep.CRM_INTEGRATION,
  OnboardingStep.CAR_HISTORY_INTEGRATION,
];

const OUTBOUND_COMPLIANCE_STEPS: OnboardingStep[] = [
  // OnboardingStep.CONSENT_APPROVAL,
  // OnboardingStep.COMPLIANCE_DOCUMENT_CHECK,
];

const CLOSING_STEPS: OnboardingStep[] = [
  OnboardingStep.TEST_AGENT,
  OnboardingStep.DEPLOY_AGENT,
];

// ─── Per-agent config (type-safe nested record) ───────────────────────────────

const AGENT_STEPS_CONFIG: Record<
  string,
  Partial<Record<string, OnboardingStep[]>>
> = {
  sales: {
    inbound: [
      ...BASE_STEPS,
      ...SALES_INTEGRATION_STEPS,
      OnboardingStep.SPEED_TO_LEAD_CONFIGURATION,
      OnboardingStep.SMART_VIEW_SETUP,
      ...CLOSING_STEPS,
    ],
    outbound: [
      ...BASE_STEPS,
      ...SALES_INTEGRATION_STEPS,
      ...OUTBOUND_COMPLIANCE_STEPS,
      ...CLOSING_STEPS,
    ],
  },
  service: {
    inbound: [
      ...BASE_STEPS,
      OnboardingStep.SERVICE_SCHEDULER_INTEGRATION,
      ...CLOSING_STEPS,
    ],
    outbound: [
      ...BASE_STEPS,
      OnboardingStep.SERVICE_SCHEDULER_INTEGRATION,
      ...OUTBOUND_COMPLIANCE_STEPS,
      ...CLOSING_STEPS,
    ],
  },
};

const buildStepData = (stepList: OnboardingStep[]): OnboardingStepData[] =>
  stepList.reduce<OnboardingStepData[]>((acc, stepEnum, index) => {
    const stepData = OnboardingSteps.find((s) => s.step === stepEnum);
    if (stepData) {
      acc.push({ ...stepData, order: index + 1 });
    }
    return acc;
  }, []);

export const getDefaultStepsForAgent = (
  agentType: string,
  agentCallType: string
): OnboardingStepData[] => {
  const normalizedType = agentType?.toLowerCase();
  const normalizedCallType = agentCallType?.toLowerCase();

  const stepList = AGENT_STEPS_CONFIG[normalizedType]?.[normalizedCallType];

  if (!stepList) {
    return buildStepData(OnboardingSteps.map((s) => s.step));
  }

  return buildStepData(stepList);
};

// ─── Edit-mode step config ────────────────────────────────────────────────────

const AGENT_EDIT_STEPS_CONFIG: Record<
  string,
  Partial<Record<string, OnboardingStep[]>>
> = {
  sales: {
    inbound: [
      OnboardingStep.VINI_CONFIGURATION,
      OnboardingStep.AGENT_SETUP,
      OnboardingStep.SPEED_TO_LEAD_CONFIGURATION,
      OnboardingStep.SMART_VIEW_SETUP,
    ],
    outbound: [OnboardingStep.VINI_CONFIGURATION, OnboardingStep.AGENT_SETUP],
  },
  service: {
    inbound: [OnboardingStep.VINI_CONFIGURATION, OnboardingStep.AGENT_SETUP],
    outbound: [OnboardingStep.VINI_CONFIGURATION, OnboardingStep.AGENT_SETUP],
  },
};

export const getEditStepsForAgent = (
  agentType: string,
  agentCallType: string
): OnboardingStepData[] => {
  const normalizedType = agentType?.toLowerCase();
  const normalizedCallType = agentCallType?.toLowerCase();

  const stepList =
    AGENT_EDIT_STEPS_CONFIG[normalizedType]?.[normalizedCallType];

  if (!stepList) {
    return buildStepData([OnboardingStep.AGENT_SETUP]);
  }

  return buildStepData(stepList);
};

const STEP_TO_TASK_NAME: Partial<Record<OnboardingStep, OnboardingTaskName>> = {
  [OnboardingStep.ROOFTOP_SETUP]: OnboardingTaskName.ROOFTOP_SETUP,
  [OnboardingStep.CALLER_ID_REGISTRATION]:
    OnboardingTaskName.BRAND_REGISTRATION,
  [OnboardingStep.INVITE_USERS]: OnboardingTaskName.USER_SETUP,
  [OnboardingStep.ROUTING_DIRECTORY]: OnboardingTaskName.ROUTING_DIRECTORY,
  [OnboardingStep.AGENT_SETUP]: OnboardingTaskName.AGENT_CUSTOMIZATION,
  [OnboardingStep.IMS_INTEGRATION]: OnboardingTaskName.IMS_INTEGRATION,
  [OnboardingStep.CRM_INTEGRATION]: OnboardingTaskName.CRM_INTEGRATION,
  [OnboardingStep.CAR_HISTORY_INTEGRATION]:
    OnboardingTaskName.CAR_HISTORY_INTEGRATION,
  [OnboardingStep.SERVICE_SCHEDULER_INTEGRATION]:
    OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION,
  [OnboardingStep.CONSENT_APPROVAL]: OnboardingTaskName.CONSENT_APPROVAL,
  [OnboardingStep.COMPLIANCE_DOCUMENT_CHECK]:
    OnboardingTaskName.COMPLIANCE_DOCUMENT_CHECK,
  [OnboardingStep.SPEED_TO_LEAD_CONFIGURATION]:
    OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION,
  [OnboardingStep.SMART_VIEW_SETUP]: OnboardingTaskName.SMART_VIEW_SETUP,
  [OnboardingStep.TEST_AGENT]: OnboardingTaskName.AGENT_TESTING,
  [OnboardingStep.DEPLOY_AGENT]: OnboardingTaskName.DEPLOY_AGENT,
};

export const getOnboardingStepByAgents = (
  progressData: AgentProgressResult | null,
  agentType?: string,
  agentCallType?: string
): OnboardingStepData[] => {
  const defaultSteps = getDefaultStepsForAgent(
    agentType ?? '',
    agentCallType ?? ''
  );

  if (!progressData?.progressSteps?.length) {
    return defaultSteps;
  }

  const taskStatusMap = new Map<OnboardingTaskName, StepStatus>();
  const availableTaskNames = new Set<OnboardingTaskName>();
  progressData.progressSteps.forEach((task) => {
    const taskName = task.taskName as OnboardingTaskName;
    availableTaskNames.add(taskName);
    taskStatusMap.set(taskName, mapApiStatusToStepStatus(task.status));
  });

  const filteredSteps = defaultSteps.filter((step) => {
    const taskName = STEP_TO_TASK_NAME[step.step];
    return taskName ? availableTaskNames.has(taskName) : false;
  });
  const stepsToReturn = filteredSteps.length ? filteredSteps : defaultSteps;

  return stepsToReturn.map((step) => {
    const taskName = STEP_TO_TASK_NAME[step.step];
    const status = taskName
      ? (taskStatusMap.get(taskName) ?? StepStatus.NOT_STARTED)
      : StepStatus.NOT_STARTED;
    return { ...step, status };
  });
};
