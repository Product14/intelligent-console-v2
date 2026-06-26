import { getItem } from '@spyne-console/utils/local-storage';

// import { getItem as getSessionItem } from '@spyne-console/utils/session-storage';

// import { useQueryParams } from '../../hooks/src/index';

export default function showNewInventoryUi() {
  // const { queryParams } = useQueryParams();
  // const enterpriseTeamReducer = useSelector(
  //   (state) => state.enterpriseTeamReducer
  // );
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const inventoryCookieVersion = getCookie('inventory_version');
  const INVENTORY_VERSION_KEY = 'inventory_version';
  const newUiVersion = 'v4';
  const version =
    typeof window !== 'undefined'
      ? localStorage.getItem(INVENTORY_VERSION_KEY) || 'v2'
      : 'v2';

  const sessionVersion =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(INVENTORY_VERSION_KEY) || 'v2'
      : 'v2';

  const isSpyneOwner =
    getItem('permissionObject')?.user_role?.role_name === 'SPYNE_OWNER';
  // const enterpriseId =
  //   getSessionItem('selectedEnterprise')?.enterprise_id ||
  //   queryParams?.enterprise_id ||
  //   queryParams?.enterpriseId;

  const enabledEnterpriseIds = ['00e6652a1', '10bb841f8'];
  return (
    isSpyneOwner ||
    // enabledEnterpriseIds.includes(enterpriseId) ||
    version === newUiVersion ||
    sessionVersion === newUiVersion ||
    inventoryCookieVersion === newUiVersion ||
    false
  );
}
