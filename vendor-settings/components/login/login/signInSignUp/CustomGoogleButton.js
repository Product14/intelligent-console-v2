import React, { useEffect } from 'react';

const CustomGoogleButton = ({ clientId }) => {
  useEffect(() => {
    // Load the Google API library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.onload = () => initGoogleSignIn();
    document.body.appendChild(script);
  }, []);

  // Initialize the Google Sign-In client
  const initGoogleSignIn = () => {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: clientId,
      });
    });
  };

  // Handle the sign-in action
  const handleSignIn = async () => {
    try {
        const auth2 = window.gapi.auth2.getAuthInstance();
        // debugger;
        const googleUser = await auth2.signIn();
      // Here you would handle the sign-in token or user information
      console.log(googleUser, '====');
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  // Render the custom button
  return (
    <button onClick={handleSignIn}>
      Continue with Google
    </button>
  );
};

export default CustomGoogleButton;