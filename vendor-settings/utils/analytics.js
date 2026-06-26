import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';
import ReactGA4 from 'react-ga4';

const analyticsProviders = {
  mixpanel: {
    init: (token) => {
      if (typeof window !== 'undefined') {
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
  if (providerArr.length === 0) {
    return;
  } else {
    for (let i = 0; i < providerArr.length; i++) {
      if (analyticsProviders[providerArr[i].name]) {
        analyticsProviders[providerArr[i].name].init(providerArr[i].token);
        activeProviders.push(providerArr[i].name);
      }
    }
  }
};

export const trackEvent = (event, properties, allToolFlag) => {
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
      }
    });
  }
};
