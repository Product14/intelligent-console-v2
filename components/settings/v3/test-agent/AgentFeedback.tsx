import { OnboardingStep } from '@/app-models-settings/Onboarding';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useOnboardingContext } from '@/contexts/settings/onboarding-context';
import {
  createFeedbackAPI,
  fetchFeedbacksAPI,
} from '@/services/settings/feedback.service';
import integrationsService from '@/services/settings/integrations.service';
import { OnboardedAgent } from '@/store-settings/models/agents.model';
import {
  FEEDBACK_ISSUE_LABELS,
  FeedbackAspect,
  FeedbackIssueType,
} from '@/types/settings/feedback';
import { Spinner } from '@spyne-console/design-system';

import React, { useEffect, useMemo, useState } from 'react';
import { IoArrowForward } from 'react-icons/io5';
import { RiThumbDownLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import AvatarGradient from '../common/AvatarGradient';
import DurationHolder from '../common/DurationHolder';
import { AgentSidebar } from './AgentSidebar';
import FeedbackRow from './feedback-row';

const allFeedbackOptions = [
  FeedbackIssueType.LACK_GENERAL_KNOWLEDGE,
  FeedbackIssueType.VOICEMAIL_DETECTION,
  FeedbackIssueType.RESPONSE_QUALITY,
  FeedbackIssueType.INTEGRATION_REQUIRED,
  FeedbackIssueType.OTHER,
];

// Helper to map aspect label back to enum type
const getIssueTypeFromLabel = (label: string): FeedbackIssueType | null => {
  const entry = Object.entries(FEEDBACK_ISSUE_LABELS).find(
    ([_, value]) => value === label
  );
  return entry ? (entry[0] as FeedbackIssueType) : null;
};

const AgentFeedback: React.FC<{ onTestAgain: () => void }> = ({
  onTestAgain,
}) => {
  const { activeAgentId } = useActiveAgent();
  const { availableAgents, isLoading } = useAgentsRedux({});
  const agent = availableAgents.find(
    (a) => a.teamAgentMappingId === activeAgentId
  );
  const { enterpriseId, teamId, userId } = useUserDetails();
  const [isIntegrationDone, setIsIntegrationDone] = useState(false);
  const [isCheckingIntegration, setIsCheckingIntegration] = useState(true);
  const { setActiveStep } = useOnboardingContext();
  if (!agent) {
    return null;
  }

  // Filter feedback options based on integration status
  const feedbackOptions = useMemo(() => {
    if (isIntegrationDone) {
      return allFeedbackOptions.filter(
        (option) => option !== FeedbackIssueType.INTEGRATION_REQUIRED
      );
    }
    return allFeedbackOptions;
  }, [isIntegrationDone]);

  const [feedbackState, setFeedbackState] = useState<
    Record<FeedbackIssueType, FeedbackAspect>
  >(
    allFeedbackOptions.reduce(
      (acc, option) => ({
        ...acc,
        [option]: {
          aspect: FEEDBACK_ISSUE_LABELS[option],
          satisfied: true,
          description: '',
        },
      }),
      {} as Record<FeedbackIssueType, FeedbackAspect>
    )
  );
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track which rows are expanded (all collapsed by default)
  const [expandedRows, setExpandedRows] = useState<
    Record<FeedbackIssueType, boolean>
  >(
    allFeedbackOptions.reduce(
      (acc, option) => ({
        ...acc,
        [option]: false,
      }),
      {} as Record<FeedbackIssueType, boolean>
    )
  );

  // Check if integration is done
  useEffect(() => {
    const checkIntegrationStatus = async () => {
      if (!enterpriseId || !teamId) {
        setIsCheckingIntegration(false);
        return;
      }
      try {
        const integrationData = await integrationsService.fetchEntityConfig({
          enterpriseID: enterpriseId,
          TeamId: teamId,
          entity: 'IMS',
        });
        const isDone = integrationsService.isIntegrationDone(integrationData);
        setIsIntegrationDone(isDone);
      } catch (error) {
        console.error('Error checking integration status:', error);
      } finally {
        setIsCheckingIntegration(false);
      }
    };
    checkIntegrationStatus();
  }, [enterpriseId, teamId]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!enterpriseId || !teamId || !agent.teamAgentMappingId) {
        return;
      }
      setIsLoadingFeedback(true);
      try {
        const response = await fetchFeedbacksAPI(
          enterpriseId,
          teamId,
          agent.teamAgentMappingId
        );
        if (response?.aspects && response.aspects.length > 0) {
          const fetchedAspects = response.aspects.reduce(
            (
              acc: Record<FeedbackIssueType, FeedbackAspect>,
              feedback: FeedbackAspect
            ) => {
              const issueType = getIssueTypeFromLabel(feedback.aspect);
              if (issueType) {
                acc[issueType] = feedback;
              }
              return acc;
            },
            {} as Record<FeedbackIssueType, FeedbackAspect>
          );

          // Merge fetched aspects with existing state to preserve unfetched options
          setFeedbackState((prev) => ({
            ...prev,
            ...fetchedAspects,
          }));

          // Update expanded rows based on satisfied state from API
          const expandedUpdates = response.aspects.reduce(
            (
              acc: Record<FeedbackIssueType, boolean>,
              feedback: FeedbackAspect
            ) => {
              const issueType = getIssueTypeFromLabel(feedback.aspect);
              if (issueType) {
                // Expand if not satisfied
                acc[issueType] = !feedback.satisfied;
              }
              return acc;
            },
            {} as Record<FeedbackIssueType, boolean>
          );

          setExpandedRows((prev) => ({
            ...prev,
            ...expandedUpdates,
          }));
        }
      } catch (error) {
        // toast.error('Error fetching feedbacks');
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    fetchFeedbacks();
  }, [enterpriseId, teamId, agent.teamAgentMappingId]);

  const handleToggleFeedback = (option: FeedbackIssueType) => {
    // Don't allow collapsing for reported/resolved issues
    const feedbackStatus = feedbackState[option]?.status;
    if (feedbackStatus === 'reported' || feedbackStatus === 'resolved') {
      return; // Keep expanded
    }

    setExpandedRows((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSatisfactionChange = (
    option: FeedbackIssueType,
    satisfied: boolean,
    shouldExpand?: boolean
  ) => {
    setFeedbackState((prev) => ({
      ...prev,
      [option]: {
        ...prev[option],
        satisfied,
      },
    }));

    // Only update expanded state if explicitly requested (e.g., when thumbs down is clicked)
    if (shouldExpand !== undefined) {
      setExpandedRows((prev) => ({
        ...prev,
        [option]: shouldExpand,
      }));
    }
  };

  const handleTextChange = (option: FeedbackIssueType, text: string) => {
    setFeedbackState((prev) => ({
      ...prev,
      [option]: {
        ...prev[option],
        description: text,
      },
    }));
  };

  const hasValidFeedback = feedbackOptions.some((option) => {
    const isExpanded = expandedRows[option];
    return isExpanded;
  });

  const handleOnContinue = async () => {
    if (!enterpriseId || !teamId || !agent.teamAgentMappingId) {
      toast.error('Missing required IDs for feedback submission');
      return;
    }

    // Check if any expanded row (except INTEGRATION_REQUIRED) has empty description
    const hasEmptyDescription = feedbackOptions.some((option) => {
      const data = feedbackState[option];
      const isExpanded = expandedRows[option];
      // Skip if not expanded or is integration required
      if (!isExpanded || option === FeedbackIssueType.INTEGRATION_REQUIRED) {
        return false;
      }
      // Check if description is empty
      return !data?.description?.trim();
    });

    if (hasEmptyDescription) {
      toast.error('Please provide a description for all reported issues');
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter and collect only aspects that are expanded (have issues)
      const aspects = feedbackOptions
        .filter((option) => expandedRows[option])
        .map((option) => ({
          aspect: FEEDBACK_ISSUE_LABELS[option],
          description: feedbackState[option].description,
          satisfied: feedbackState[option].satisfied,
        }));

      if (aspects.length === 0) {
        toast.error('No feedback to submit');
        return;
      }

      await createFeedbackAPI({
        enterpriseId,
        teamId,
        agentId: agent.teamAgentMappingId,
        aspects,
      });

      toast.success('Feedback submitted successfully');
      onTestAgain();
    } catch (error) {
      toast.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteIntegration = () => {
    // handleOnContinue();
    // setActiveStep(OnboardingStep.INTEGRATIONS);
  };

  return (
    <div className="flex h-full w-full gap-[42px] py-6 pr-12">
      <div className="flex h-full flex-1 flex-col gap-[42px]">
        <OnboardingStepHeader
          title="Share Feedback"
          description="This will help me to access your vehicle inventory to answer customer questions"
          avatarNode={<AvatarGradient agentImage={agent.imageUrl} />}
        >
          <DurationHolder />
        </OnboardingStepHeader>

        <div className="flex h-[calc(100%-248px)] flex-1 gap-5">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold leading-6 text-black/90">
                Which aspects of the call have issues?
              </h2>
              <p className="text-base font-normal leading-8 text-black/60">
                Our team will review and make adjustments within 24 hours.
              </p>
            </div>

            <div className="flex h-[calc(100%-84px)] flex-col gap-1.5 overflow-y-auto pr-2">
              {isLoadingFeedback || isCheckingIntegration ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                feedbackOptions.map((option) => (
                  <FeedbackRow
                    handleCompleteIntegration={
                      option === FeedbackIssueType.INTEGRATION_REQUIRED
                        ? handleCompleteIntegration
                        : undefined
                    }
                    key={option}
                    type={option}
                    feedbackData={feedbackState[option]}
                    isExpanded={expandedRows[option]}
                    onToggle={() => handleToggleFeedback(option)}
                    onSatisfactionChange={(satisfied, shouldExpand) =>
                      handleSatisfactionChange(option, satisfied, shouldExpand)
                    }
                    onTextChange={(text) => handleTextChange(option, text)}
                    isDisabled={isLoadingFeedback || isSubmitting}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <OnboardingFooter
          backLabel="Test Again"
          continueLabel={isSubmitting ? 'Saving...' : 'Done'}
          className="border-0 px-0 pb-0"
          onBack={onTestAgain}
          onContinue={handleOnContinue}
          disableBack={isSubmitting}
          disableContinue={isSubmitting || !hasValidFeedback}
        />
      </div>

      <AgentSidebar
        agent={agent}
        className="w-[501px]"
        onTestAgain={onTestAgain}
      />
    </div>
  );
};

export default AgentFeedback;
