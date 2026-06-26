import { useState } from 'react';

const useCookies = () => {
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find((c) => c.trim().startsWith(name + '='));

    if (!cookie) return null;

    return cookie.split('=')[1];
  };

  const setCookie = (name, value, options = {}) => {
    if (typeof document === 'undefined') return;

    const defaultOptions = {
      path: '/',
      expires: new Date(Date.now() + 86400000).toUTCString(), // 1 day
      ...options,
    };

    let cookieString = `${name}=${value}`;

    Object.entries(defaultOptions).forEach(([key, val]) => {
      cookieString += `; ${key}=${val}`;
    });

    document.cookie = cookieString;
  };

  return {
    getCookie,
    setCookie,
  };
};

export default useCookies;
