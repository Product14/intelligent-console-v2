import { useEffect, useState } from 'react';

function useSessionStorage(key, initialValue) {
  // Local state to store the value
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isClient, setIsClient] = useState(false);

  // Check if the code is running in the browser
  useEffect(() => {
    setIsClient(true); // This ensures the code only runs in the client
  }, []);

  // When component mounts and `window` is available
  useEffect(() => {
    if (isClient) {
      try {
        const item = window.sessionStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        } else {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error('Error reading from sessionStorage', error);
        setStoredValue(initialValue);
      }
    }
  }, [isClient, key, initialValue]);

  // Update sessionStorage whenever the stored value changes
  useEffect(() => {
    if (isClient && storedValue !== undefined) {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error('Error writing to sessionStorage', error);
      }
    }
  }, [isClient, key, storedValue]);

  // Function to update the value
  const setValue = (value) => {
    setStoredValue(value);
  };

  return [storedValue, setValue];
}

export default useSessionStorage;
