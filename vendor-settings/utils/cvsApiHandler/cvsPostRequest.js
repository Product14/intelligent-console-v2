import * as amplitude from '@amplitude/analytics-browser';

import axios from 'axios';
import mixpanel from 'mixpanel-browser';
import { v4 as uuid } from 'uuid';

import { Logout, generateBearerToken } from '@spyne-console/utils/config';

export const handlePostRequest = (
  URL,
  callBody,
  headers = {},
  cancelToken = axios.CancelToken.source(),
  createEnterpriseSignUp = false,
  useUpperCaseID = false
) => {
  let bearerToken = '';
  bearerToken = generateBearerToken(
    { additionalPayload: headers },
    createEnterpriseSignUp
  );

  axios.interceptors.response.use(
    (response) => {
      try {
        if (
          response?.config?.url?.includes('user-management/v1/user/login') ||
          response?.config?.url?.includes('user-management/v1/user/signup')
        ) {
          mixpanel.identify(response?.data?.data?.userData?.userId);
          amplitude.setUserId(response?.data?.data?.userData?.userId);
        }
        if (response?.config?.url.includes('/user-management/v1/user/logout')) {
          mixpanel.reset();
          amplitude.setUserId(null);
          mixpanel.track('User Logged Out');
        }
      } catch (e) {
        console.error('Error while tracking user activity MIXPANEL:', e);
      }

      return response;
    },
    async function (error) {
      if (error && error.response?.status === 401) {
        await Logout({ skipBackendLogout: true });
      }
      return Promise.reject(error);
    }
  );

  let handlePostPromise = new Promise((resolve, reject) => {
    let requestId = useUpperCaseID ? 'X-Request-ID' : 'X-Request-Id';
    let headersObject = {
      authorization: bearerToken,
      [requestId]: uuid(),
    };

    const config = {
      url: URL,
      method: 'POST',
      data: callBody,
      headers: headersObject,
      cancelToken: cancelToken?.token,
    };

    axios(config)
      .then((res) => {
        if (res?.data?.error) {
          reject(res?.message || 'unknown error occurred');
        } else {
          resolve(res?.data);
        }
        // if (res?.data?.status >= 400 && res?.data?.status <= 599)
        //     reject(res.data);
        // else if (res.data?.status === 200)
        //     resolve(res.data);
        // else if (res.status >= 200 && res.status <= 299)
        //     resolve(res.data)
        // else
        //     reject(res.data['message'] || res.data);
      })
      .catch((err) => {
        if (err?.response?.data?.problems) {
          return reject({
            message: 'Either not a valid permission or missing input params',
          });
        }
        reject(err);
      });
  });

  return handlePostPromise;
};
