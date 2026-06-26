import { useEffect, useState } from 'react';

import axios from 'axios';

async function fetchCloningConfig(enterpriseId, teamId) {
  const URL = `${process.env.BACKEND_BASEURL}/central-config/v1/product`;
  try {
    const response = await axios.get(URL, {
      params: {
        enterpriseId,
        teamId,
        domain: 'product',
        entity: 'Media-Cloning',
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error('Error getting cloning config:', error);
    return null;
  }
}

const useCloningConfig = (enterpriseId, teamId) => {
  const [cloningConfig, setCloningConfig] = useState(null);
  const [isCloningConfigLoading, setIsCloningConfigLoading] = useState(false);

  useEffect(() => {
    if (!enterpriseId || !teamId) return;

    setIsCloningConfigLoading(true);
    fetchCloningConfig(enterpriseId, teamId)
      .then((data) => {
        setCloningConfig(data);
      })
      .catch((error) => {
        console.error('Error getting cloning config:', error);
      })
      .finally(() => {
        setIsCloningConfigLoading(false);
      });
  }, [enterpriseId, teamId]);

  return { cloningConfig, isCloningConfigLoading };
};

export default useCloningConfig;
