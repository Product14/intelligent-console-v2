export function getItem(key, defaultValue = null) {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error.message}`);
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    if (typeof window !== 'undefined') {
      const valueToStore =
        typeof value === 'string' &&
        (value.startsWith('{') || value.startsWith('['))
          ? value
          : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error.message}`);
    return false;
  }
}

export function removeItem(key) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error.message}`);
  }
}

export function clearAll() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  } catch (error) {
    console.error(`Error clearing localStorage: ${error.message}`);
  }
}

export function hasItem(key) {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) !== null;
    }
    return false;
  } catch (error) {
    console.error(`Error checking item in localStorage: ${error.message}`);
    return false;
  }
}
