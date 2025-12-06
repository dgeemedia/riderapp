// rider-expo/services/analytics.js
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (__DEV__) return; // Disable in development

    try {
      // Initialize Sentry
      Sentry.init({
        dsn: 'YOUR_SENTRY_DSN',
        environment: process.env.NODE_ENV,
      });

      // Initialize Firebase Analytics
      await analytics().setAnalyticsCollectionEnabled(true);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  trackScreen(screenName) {
    if (!this.isInitialized) return;
    
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  trackEvent(eventName, params = {}) {
    if (!this.isInitialized) return;
    
    analytics().logEvent(eventName, params);
  }

  setUserProperties(userId, properties = {}) {
    if (!this.isInitialized) return;
    
    Sentry.setUser({
      id: userId,
      ...properties,
    });
    
    analytics().setUserId(userId);
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, value);
    });
  }

  logError(error, context = {}) {
    if (!this.isInitialized) return;
    
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export default new AnalyticsService();