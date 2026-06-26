import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

const OnboardingStepper = ({ steps, className = '', onStepClick }) => {
  const containerRef = useRef(null);
  const portalRef = useRef(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on client-side for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Attach native listeners once the component is mounted on the client.
  // - Portal wheel: non-passive so we can preventDefault(), stopping the portal from
  //   scrolling its own content and forwarding the delta to containerRef instead.
  // - Container scroll: mirrors scrollTop into state so the portal labels stay aligned.
  useEffect(() => {
    if (!isMounted) return;

    const portal = portalRef.current;
    const container = containerRef.current;

    const onWheel = (e) => {
      e.preventDefault();
      container?.scrollBy({ top: e.deltaY });
    };

    const onScroll = () => setScrollTop(container.scrollTop);

    portal?.addEventListener('wheel', onWheel, { passive: false });
    container?.addEventListener('scroll', onScroll);

    return () => {
      portal?.removeEventListener('wheel', onWheel);
      container?.removeEventListener('scroll', onScroll);
    };
  }, [isMounted]);

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOverlayPosition({
        top: rect.top,
        left: rect.left,
      });
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Determine if a step is clickable based on navigation rules:
  // - completed steps: always clickable (any order)
  // - in_progress step: always clickable
  // - not_started step (index 0): always clickable
  // - not_started step (index > 0): only if the previous step is completed
  const isStepClickable = useCallback(
    (stepIndex) => {
      if (!onStepClick) return false;

      const step = steps[stepIndex];
      if (!step) return false;

      // DEALER-ONBOARDING FORK: all steps are freely skippable — clicking any
      // step in the left rail navigates to it (no "complete previous" gating).
      return true;
    },
    [steps, onStepClick]
  );

  const handleStepClick = useCallback(
    (step, stepIndex) => {
      if (onStepClick && isStepClickable(stepIndex)) {
        onStepClick(step.step || step.id);
      } else if (
        onStepClick &&
        !isStepClickable(stepIndex) &&
        step.status === 'not_started'
      ) {
        toast.info('Please complete the previous step before proceeding.');
      }
    },
    [onStepClick, isStepClickable]
  );

  const getStepIconClassName = (status) => {
    const baseClasses =
      'flex items-center justify-center w-12 h-12 rounded-full p-2 transition-all duration-300 relative z-[2] border-2';

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-[#E6FFF2] border-[#038A30]`;
      case 'in_progress':
        return `${baseClasses} bg-[#f8f4ff] border-[#e0d4ff] animate-pulse`;
      case 'not_started':
      default:
        return `${baseClasses} bg-white border-gray-300`;
    }
  };

  const getIconContentClassName = (status) => {
    const baseClasses = 'flex items-center justify-center w-6 h-6';

    switch (status) {
      case 'completed':
        return `${baseClasses} text-[#038A30]`;
      case 'in_progress':
        return `${baseClasses} text-[#813FED]`;
      case 'not_started':
      default:
        return `${baseClasses} text-gray-500`;
    }
  };

  const getIconClassName = (status) => {
    switch (status) {
      case 'completed':
        return 'text-[#038A30]';
      case 'in_progress':
        return 'text-[#813FED]';
      case 'not_started':
      default:
        return 'text-gray-500';
    }
  };

  const renderIcon = (icon, status) => {
    if (!React.isValidElement(icon)) return icon;

    const statusClassName = getIconClassName(status);
    const existingClassName = icon.props.className || '';

    return React.cloneElement(icon, {
      className: `${existingClassName} ${statusClassName}`.trim(),
    });
  };

  const getConnectorClassName = (currentStatus) => {
    const baseClasses = 'w-0.5 h-12 relative z-[1]';

    if (currentStatus === 'completed') {
      return `${baseClasses} bg-[#038A30]`;
    }

    if (currentStatus === 'in_progress') {
      return `${baseClasses} bg-gradient-to-b from-[#813fed] to-gray-300`;
    }

    return `${baseClasses} bg-gray-300`;
  };

  return (
    <div
      ref={containerRef}
      className={`group relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Original stepper - stays in normal document flow */}
      <div className="flex flex-col items-center gap-1">
        {steps.map((step, index) => {
          const clickable = isStepClickable(index);
          return (
            <div
              key={step.id || index}
              className="flex w-full flex-col items-center"
            >
              <div
                className={getConnectorClassName(
                  steps[index - 1]?.status || 'not_started'
                )}
              />

              {/* Step icon */}
              <div
                className={getStepIconClassName(step.status)}
                onClick={() => handleStepClick(step, index)}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
              >
                <div className={getIconContentClassName(step.status)}>
                  {renderIcon(step.icon, step.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover overlay - rendered via Portal directly to document.body to escape all stacking contexts */}
      {isMounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed h-[calc(100vh-56px)] overflow-hidden pr-10"
            style={{
              display: isHovered ? 'block' : 'none',
              top: '56px',
              left: overlayPosition.left,
              zIndex: 2147483647, // Maximum possible z-index
              maxHeight: 'calc(100vh - 56px)',
              background: 'white',
              // borderRadius: '10px',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="relative flex gap-3 rounded-xl"
              style={{ transform: `translateY(-${scrollTop}px)` }}
            >
              {/* Stepper column */}
              <div className="flex flex-col items-start gap-1">
                {steps.map((step, index) => {
                  const clickable = isStepClickable(index);
                  return (
                    <div
                      key={`hover-${step.id || index}`}
                      className="flex items-center justify-center gap-3"
                      onClick={() => handleStepClick(step, index)}
                      style={{
                        cursor: clickable ? 'pointer' : 'default',
                        opacity: clickable ? 1 : 0.6,
                      }}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : undefined}
                    >
                      <div className="flex w-full flex-col items-center">
                        {/* Top connector (except for first item) */}
                        <div
                          className={getConnectorClassName(
                            steps[index - 1]?.status || 'not_started'
                          )}
                        />
                        <div className={getStepIconClassName(step.status)}>
                          <div className={getIconContentClassName(step.status)}>
                            {step.icon}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col items-center">
                        {/* Top connector (except for first item) */}
                        <div
                          className={`${getConnectorClassName()} opacity-0`}
                        />
                        <div className="whitespace-nowrap text-[16px] font-medium leading-5 text-[#666]">
                          {step.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default OnboardingStepper;
