// rider-expo/utils/deepLinking.js
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

const prefix = Linking.createURL('/');

const config = {
  screens: {
    Home: {
      screens: {
        Tasks: 'tasks',
        TaskDetail: 'task/:id',
      },
    },
    Call: 'call/:channel',
    Notification: 'notification/:id',
  },
};

export const linking = {
  prefixes: [prefix, 'https://driders.app', 'driders://'],
  config,
};

export const handleDeepLink = (url) => {
  const { path, queryParams } = Linking.parse(url);
  
  if (path === 'call') {
    // Navigate to call screen
    return { screen: 'Call', params: { channel: queryParams.channel } };
  }
  
  if (path === 'task') {
    // Navigate to task detail
    return { screen: 'TaskDetail', params: { id: queryParams.id } };
  }
  
  return null;
};

// In App.js
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { handleDeepLink } from './utils/deepLinking';

// Add to App component
useEffect(() => {
  const handleUrl = ({ url }) => {
    const route = handleDeepLink(url);
    if (route) {
      // Navigate to route
    }
  };

  Linking.addEventListener('url', handleUrl);
  
  // Check initial URL
  Linking.getInitialURL().then(url => {
    if (url) handleUrl({ url });
  });

  return () => {
    Linking.removeEventListener('url', handleUrl);
  };
}, []);