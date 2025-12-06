// rider-expo/config/web.config.js
// Web-specific overrides for React Native Web

// Mock native modules for web
if (typeof window !== 'undefined') {
  // Mock AsyncStorage for web
  const mockAsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
    clear: async () => {},
  };

  // Mock Platform.OS
  if (!window.navigator.product) {
    window.navigator.product = 'ReactNative';
  }
}

// Web-specific polyfills
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

export const webConfig = {
  // Web-specific configuration
};