/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Location Updates
  LOCATION_UPDATE: 'location:update',
  RIDER_STATUS_CHANGE: 'rider:status_change',
  
  // Task Management
  TASK_CREATED: 'task:created',
  TASK_ASSIGNED: 'task:assigned',
  TASK_ACCEPTED: 'task:accepted',
  TASK_PICKED_UP: 'task:picked_up',
  TASK_DELIVERED: 'task:delivered',
  TASK_CANCELLED: 'task:cancelled',
  
  // Call Management
  CALL_INITIATED: 'call:initiated',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECTED: 'call:rejected',
  CALL_ENDED: 'call:ended',
  
  // System Events
  SYSTEM_ALERT: 'system:alert',
  NOTIFICATION: 'notification',
};

// Task Status Constants
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Rider Status Constants
export const RIDER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  AWAY: 'away',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  RIDER_ALERT: 'rider_alert',
  SYSTEM_UPDATE: 'system_update',
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [9.0765, 7.3986], // Default to Lagos, Nigeria
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
};

// Color Palette
export const COLORS = {
  PRIMARY: '#7c3aed',
  PRIMARY_DARK: '#5b21b6',
  PRIMARY_LIGHT: '#8b5cf6',
  SECONDARY: '#06b6d4',
  SECONDARY_DARK: '#0891b2',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  
  // Status Colors
  STATUS_ONLINE: '#10b981',
  STATUS_OFFLINE: '#64748b',
  STATUS_BUSY: '#f59e0b',
  STATUS_AWAY: '#ef4444',
  
  // Task Status Colors
  TASK_PENDING: '#f59e0b',
  TASK_ASSIGNED: '#3b82f6',
  TASK_ACCEPTED: '#8b5cf6',
  TASK_PICKED_UP: '#8b5cf6',
  TASK_DELIVERED: '#10b981',
  TASK_CANCELLED: '#ef4444',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  USER_PREFERENCES: 'admin_preferences',
  NOTIFICATIONS: 'admin_notifications',
  RECENT_SEARCHES: 'recent_searches',
  THEME_PREFERENCE: 'theme_preference',
  AUTO_REFRESH: 'auto_refresh_enabled',
};

// Dashboard Statistics
export const DASHBOARD_STATS = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 60000, // 1 minute
  MAX_LOG_ENTRIES: 100,
  MAX_NOTIFICATIONS: 50,
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  XS: 375,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Icon Sizes
export const ICON_SIZES = {
  XS: { mobile: 'w-3 h-3', tablet: 'sm:w-4 sm:h-4', desktop: 'md:w-5 md:h-5' },
  SM: { mobile: 'w-4 h-4', tablet: 'sm:w-5 sm:h-5', desktop: 'md:w-6 md:h-6' },
  MD: { mobile: 'w-5 h-5', tablet: 'sm:w-6 sm:h-6', desktop: 'md:w-7 md:h-7' },
  LG: { mobile: 'w-6 h-6', tablet: 'sm:w-7 sm:h-7', desktop: 'md:w-8 md:h-8' },
  XL: { mobile: 'w-8 h-8', tablet: 'sm:w-9 sm:h-9', desktop: 'md:w-10 md:h-10' },
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Export all constants
export default {
  API_CONFIG,
  SOCKET_EVENTS,
  TASK_STATUS,
  RIDER_STATUS,
  NOTIFICATION_TYPES,
  MAP_CONFIG,
  COLORS,
  STORAGE_KEYS,
  DASHBOARD_STATS,
  BREAKPOINTS,
  ICON_SIZES,
  VALIDATION_RULES,
  DATE_FORMATS,
};