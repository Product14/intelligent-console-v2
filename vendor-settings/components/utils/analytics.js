import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';
import ReactGA4 from 'react-ga4';

const analyticsProviders = {
  mixpanel: {
    init: (token) => {
      if (typeof window !== 'undefined') {
        console.log('Initializing Mixpanel with token:', token);
        // Initialize Mixpanel
        // (token, { debug: true }) for mixpanel debugging
        mixpanel.init(token);
      }
    },
    track: (event, properties) => {
      if (typeof window !== 'undefined') {
        mixpanel.track(event, properties);
      }
    },
  },
  googleAnalytics: {
    init: (token) => {
      if (typeof window !== 'undefined') {
        console.log('Initializing Google Analytics with token:', token);
        ReactGA4.initialize(token);
      }
    },
    track: (event, properties) => {
      if (typeof window !== 'undefined') {
        ReactGA4.event(event, properties);
      }
    },
  },
  amplitude: {
    init: (token) => {
      if (typeof window !== 'undefined') {
        console.log('Initializing Amplitude with token:', token);
        amplitude.init(token);
      }
    },
    track: (event, properties) => {
      if (typeof window !== 'undefined') {
        amplitude.track(event, properties);
      }
    },
  },
};

let activeProviders = [];

export const initAnalytics = (providerArr = []) => {
  console.log('Initializing analytics with providers:', providerArr);
  if (providerArr.length === 0) {
    console.error(`No analytics provider provided`);
  } else {
    for (let i = 0; i < providerArr.length; i++) {
      if (analyticsProviders[providerArr[i].name]) {
        console.log(`Initializing provider ${providerArr[i].name}`);
        analyticsProviders[providerArr[i].name].init(providerArr[i].token);
        activeProviders.push(providerArr[i].name);
        console.log(`Active providers after adding ${providerArr[i].name}:`, activeProviders);
      } else {
        console.error(
          `Analytics provider "${providerArr[i].name}" is not supported.`,
        );
      }
    }
  }
  //   if (analyticsProviders[provider]) {
  //     activeProvider = provider;
  //     analyticsProviders[provider].init(config);
  //   } else {
  //     console.error(`Analytics provider "${provider}" is not supported.`);
  //   }
};

export const trackEvent = (event, properties, allToolFlag) => {
  console.log('Tracking event:', event, 'with properties:', properties, 'allToolFlag:', allToolFlag);
  console.log('Current active providers:', activeProviders);
  if (activeProviders.length != 0) {
    activeProviders.forEach((element) => {
      if (analyticsProviders[element]) {
        if (
          (element === 'mixpanel' || element === 'amplitude') &&
          allToolFlag === false
        ) {
          analyticsProviders[element].track(event, properties);
        } else if (element !== 'mixpanel' && element !== 'amplitude') {
          analyticsProviders[element].track(event, properties);
        }
      } else {
        console.error(`Analytics provider "${element}" is not supported.`);
      }
    });
  } else {
    console.error('No analytics provider initialized.');
  }
};
