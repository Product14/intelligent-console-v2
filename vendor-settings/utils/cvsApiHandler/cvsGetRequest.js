import axios from 'axios';
import { v4 as uuid } from 'uuid';

import { Logout, generateBearerToken } from '@spyne-console/utils/config';

export const handleGetRequest = (
  URL,
  callParams,
  headers = {},
  cancelToken = axios.CancelToken.source(),
  timeout = 0
) => {
  let bearerToken = '';
  bearerToken = generateBearerToken({ additionalPayload: headers });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async function (error) {
      if (
        error &&
        !window.location.href.includes('/verify') &&
        error.response?.status === 401
      ) {
        await Logout({ skipBackendLogout: true });
      }
      return Promise.reject(error);
    }
  );

  let handleGetPromise = new Promise((resolve, reject) => {
    const requestConfig = {
      method: 'GET',
      url: URL,
      params: callParams ? { ...callParams } : {},
      headers: { authorization: bearerToken, 'X-Request-Id': uuid() },
      cancelToken: cancelToken.token,
      ...(timeout ? { timeout: timeout } : {}),
    };

    axios(requestConfig)
      .then((res) => {
        if (res?.data?.error) {
          console.error('get API returned error:', JSON.stringify(res?.data));
          reject(res?.message || 'unknown error occurred');
        } else {
          resolve(res?.data);
        }
      })
      .catch((err) => {
        console.error('Axios get request error:', JSON.stringify(err));

        if (err?.response?.data?.problems) {
          return reject({
            message: 'Either not a valid permission or missing input params',
          });
        }
        reject(err?.response?.data || err);
      });
  });

  return handleGetPromise;
};
