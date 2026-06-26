const INVENTORY_VERSION_KEY = 'inventory_version';
const V5_VERSION = 'v5';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function readVersionFromStorage() {
  if (typeof window === 'undefined') return null;

  const fromLocal = localStorage.getItem(INVENTORY_VERSION_KEY);
  if (fromLocal) return fromLocal;

  const fromSession = sessionStorage.getItem(INVENTORY_VERSION_KEY);
  if (fromSession) return fromSession;

  return getCookie(INVENTORY_VERSION_KEY);
}

function readEnterpriseVersion() {
  if (typeof window === 'undefined') return null;

  const enterpriseId = new URLSearchParams(window.location.search).get(
    'enterprise_id'
  );
  if (!enterpriseId) return null;

  const cookieKey = `${INVENTORY_VERSION_KEY}${enterpriseId}`;
  const fromCookie = getCookie(cookieKey);
  if (fromCookie) return fromCookie;

  return (
    localStorage.getItem(cookieKey) || sessionStorage.getItem(cookieKey) || null
  );
}

/** True when inventory_version is v5 (matches inventory middleware). */
export default function isInventoryV5() {
  const version = readEnterpriseVersion() || readVersionFromStorage();
  return version === V5_VERSION;
}
