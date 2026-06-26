export function getItem(key, defaultValue = null) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from sessionStorage: ${error.message}`);
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item in sessionStorage: ${error.message}`);
    return false;
  }
}

export function removeItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from sessionStorage: ${error.message}`);
  }
}

export function clearAll() {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error(`Error clearing sessionStorage: ${error.message}`);
  }
}

export function hasItem(key) {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking item in sessionStorage: ${error.message}`);
    return false;
  }
}
