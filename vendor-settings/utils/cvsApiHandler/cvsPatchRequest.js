import axios from 'axios';
import { v4 as uuid } from 'uuid';

import { Logout, generateBearerToken } from '@spyne-console/utils/config';

export const handlePatchRequest = (
  URL,
  callParams,
  headers = {},
  cancelToken = axios.CancelToken.source(),
  bodyData = {}
) => {
  let bearerToken = '';
  bearerToken = generateBearerToken({ additionalPayload: headers });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async function (error) {
      if (error && error.response?.status === 401) {
        await Logout({ skipBackendLogout: true });
      }
      return Promise.reject(error);
    }
  );

  let handlePatchPromise = new Promise((resolve, reject) => {
    axios({
      method: 'PATCH',
      url: URL,
      params: callParams ? { ...callParams } : {},
      headers: { authorization: bearerToken, 'X-Request-Id': uuid() },
      cancelToken: cancelToken
        ? cancelToken.token
        : axios.CancelToken.source().token,
      data: bodyData,
    })
      .then((res) => {
        if (res?.data?.error) {
          reject(res?.message || 'unknown error occurred');
        } else {
          resolve(res?.data);
        }
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

  return handlePatchPromise;
};
