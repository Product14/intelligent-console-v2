export const sendEventToIOS = (messageData) => {
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.iOSHandler
  ) {
    try {
      window.webkit.messageHandlers.iOSHandler.postMessage(messageData);
      console.log('iOS message sent successfully', messageData);
    } catch (error) {
      console.error('Error sending message to iOS:', error);
    }
  } else {
    console.warn('iOS message handler not found');
  }
};

export const sendEventToAndroid = (messageData) => {
  if (window.AndroidHandler && window.AndroidHandler.onButtonClicked) {
    try {
      window.AndroidHandler.onButtonClicked(JSON.stringify(messageData));
      console.log('Android message sent successfully', messageData);
    } catch (error) {
      console.error('Error sending message to Android:', error);
    }
  } else {
    console.warn('Android message handler not found');
  }
};

export const sendEventToApp = (messageData) => {
  console.log('Attempting to send message to mobile app:', messageData);
  sendEventToIOS(messageData);
  sendEventToAndroid(messageData);
};
