export function getItem(key, defaultValue = null) {
  try {
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        const value = cookie.substring(name.length);
        return value ? JSON.parse(value) : defaultValue;
      }
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error getting cookie: ${error.message}`);
    return defaultValue;
  }
}

export function setItem(key, value, options = {}) {
  try {
    const {
      days = 7,
      path = '/',
      sameSite = 'strict',
      secure = true,
    } = options;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue = encodeURIComponent(JSON.stringify(value));

    let cookie = `${key}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=${path}; sameSite=${sameSite}`;

    if (secure) {
      cookie += '; secure';
    }

    document.cookie = cookie;
    return true;
  } catch (error) {
    console.error(`Error setting cookie: ${error.message}`);
    return false;
  }
}

export function removeItem(key) {
  try {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.error(`Error removing cookie: ${error.message}`);
  }
}

export function clearAll() {
  try {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      removeItem(name);
    }
  } catch (error) {
    console.error(`Error clearing cookies: ${error.message}`);
  }
}

export function hasItem(key) {
  try {
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error checking cookie: ${error.message}`);
    return false;
  }
}
