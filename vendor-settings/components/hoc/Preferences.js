import { LOGIN_DATA } from '@spyne-console/common-config/login';
import { useDispatch, useSelector } from '@spyne-console/store';
import { updateResellerData } from '@spyne-console/store';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import dynamic from 'next/dynamic';

import { translations } from '../../public/translations/translations';
import CentralAPIHandler from '../components/centralAPIHandler/centralAPIHandler';
import Skeleton from '../components/common/skeleton&spinner/Skeleton';
import Spinner from '../components/common/skeleton&spinner/Spinner';
import i18n from '../ni18n.config';
import { cookie } from '../utils/config';

const ApiTimeoutError = dynamic(
  () => import('../components/common/ApiTimeoutError/ApiTimeoutError'),
  {
    ssr: false,
  }
);

function Preferences(props) {
  const [selectedLng, setSelectedLng] = useState('en');
  const { t, ready } = useTranslation();
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const queryParams = new URLSearchParams(window.location.search);
  const enterpriseId =
    queryParams.get('enterprise_id') ||
    enterpriseTeamReducer?.enterprise?.enterprise_id;

  const authReducer = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (enterpriseId && enterpriseId.trim() !== '') {
      setIsFetching(true);
      fetchResellerDetails(enterpriseId);
    }

    const savedLanguage = cookie('language');
    if (document && savedLanguage && savedLanguage !== 'en') {
      const savedTranslations = localStorage.getItem(`i18n_${savedLanguage}`);
      if (savedTranslations) {
        i18n.addResourceBundle(
          savedLanguage,
          'translation',
          JSON.parse(savedTranslations),
          true,
          true
        );
      }
      fetchTranslationFile(savedLanguage);
      setSelectedLng(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      i18n.changeLanguage('en');
    }
  }, [enterpriseId]);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = authReducer?.resellerData?.favicon_url;
  }, [authReducer?.resellerData?.favicon_url]);

  const defaultConsoleData = {
    is_reseller: false,
    logo_url: LOGIN_DATA?.logoImage,
    favicon_url: LOGIN_DATA?.favicon,
  };

  const fetchTranslationFile = async (language) => {
    if (language && language !== 'en') {
      try {
        const URL = `${process.env.BACKEND_BASEURL}/api/nv1/multilingual/language/data`;
        const res = await CentralAPIHandler.handleGetRequest(URL, {
          lang_code: language,
        });

        localStorage.setItem(`i18n_${language}`, JSON.stringify(res));
        i18n.addResourceBundle(language, 'translation', res, true, true);
        i18n.changeLanguage(language);
      } catch (err) {
        console.error('Error fetching translation:', err);
      }
    }
  };

  const fetchResellerDetails = async (enterpriseId) => {
    try {
      // host name format will be <ent_id>.ourDOmain check if process.env.consoledomain exist in hostname
      // const location = window.location
      // setIsError(false)
      // if(process.env.consoleDomain.includes(location.origin)){
      //     dispatch(updateResellerData(defaultConsoleData))
      //     return
      // }

      const URL = `${process.env.BACKEND_BASEURL}/console/v1/whitelabel/get-data`;

      const res = await CentralAPIHandler.handleGetRequest(
        URL,
        {
          enterprise_id: enterpriseId,
        },
        {},
        {},
        5000
      );

      const resellerDataConfig = {
        name: res?.name,
        enterprise_id: res?.enterprise_id,
        name: res?.name,
        logo_url: res?.logo_url,
        is_reseller: res?.reseller_config?.is_active,
        favicon_url: res?.fav_icon_url,
        adminEmail: res?.support_email,
        term_condition_html: {
          html: res?.reseller_config?.website_data?.term_condition_html?.html,
          html2: res?.reseller_config?.website_data?.term_condition_html?.html2,
        },
        cookie_policy: res?.reseller_config?.website_data?.cookie_policy,
        privacy_policy: res?.reseller_config?.website_data?.privacy_policy,
        terms_and_condition_policy:
          res?.reseller_config?.website_data?.terms_and_condition_policy,
        whitelabel_domain: res?.whitelabel_domain || null,
      };
      dispatch(updateResellerData(resellerDataConfig));
    } catch (error) {
      console.log('error in fetching reseller details', error);
      // setIsError(true)
    } finally {
      setIsFetching(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (isError) {
    return <ApiTimeoutError />;
  } else if (ready) {
    return <>{props.children}</>;
  } else {
    return <Skeleton />;
  }
}

export default Preferences;
