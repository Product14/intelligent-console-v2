import { useDispatch, useSelector } from '@spyne-console/store';
import {
  resetAuth,
  resetAuthExceptResellersData,
  setAuth,
  updateAuthProp,
  updateResellerData,
} from '@spyne-console/store';

import { localStorageKeys } from '../../utils/config';

export const useAuthActions = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.authReducer);

  const updateAuthDetailsInRedux = (
    loginResponseData,
    defaultEnterpriseObj
  ) => {
    try {
      let defaultEnterprise =
        loginResponseData?.defaultEnterprise || defaultEnterpriseObj;
      localStorage.setItem(localStorageKeys?.guestLogin, false);
      dispatch(
        updateAuthProp([
          { key: 'loginModalTrigger', value: false },
          { key: 'loggedIn', value: true },
          { key: 'guestLogin', value: false },
          { key: 'authKey', value: loginResponseData?.authKey },
          { key: 'userId', value: loginResponseData?.userData?.userId },
          { key: 'emailId', value: loginResponseData?.userData?.emailId },
          { key: 'userName', value: loginResponseData?.userData?.name },
          { key: 'contact', value: loginResponseData?.userData?.contact },
          { key: 'defaultEnterprise', value: defaultEnterprise },
          {
            key: 'permissionObject',
            value: loginResponseData?.permissionObject,
          },
          {
            key: 'resellerData',
            value: loginResponseData?.resellerData || auth?.resellerData, //To preserve previous reseller data
          },
        ])
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    auth,
    updateAuthProp: (props) => dispatch(updateAuthProp(props)),
    resetAuth: (options) => dispatch(resetAuth(options)),
    setAuth: (props) => dispatch(setAuth(props)),
    updateResellerData: (props) => dispatch(updateResellerData(props)),
    resetAuthExceptResellersData: () =>
      dispatch(resetAuthExceptResellersData()),
    updateAuthDetailsInRedux,
  };
};
