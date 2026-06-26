import { captureEvent } from '@spyne-console/utils/config';
import { useState, useEffect } from 'react';

const useCapturePerformance = (eventName, additionalData = {}) => {
  const [startTime, setStartTime] = useState(0);

  const getPerformanceReport = (endTime) => {
    const timeToRender = endTime - startTime;
    const logMessage = `${timeToRender.toFixed(0)} milliseconds`;
    return logMessage;
  };

  useEffect(() => {
    // Start the timer when the component mounts
    const start = performance.now();
    setStartTime(start);

    // Handle render complete
    const handleRenderComplete = () => {
      const endTime = performance.now();
      const renderTime = getPerformanceReport(endTime);

      // Capture the event
      captureEvent(
        eventName,
        {
          ...additionalData,
          "loading_time": renderTime,
        },
        true
      );
    };
    handleRenderComplete();
  }, []); 
};

export default useCapturePerformance;
