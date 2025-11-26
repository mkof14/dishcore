/**
 * DishCore API Configuration
 * Centralized config for Vercel migration
 */

// Environment Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.dishcore.app';
export const MOCK_MODE = process.env.REACT_APP_MOCK_MODE === 'true' || true; // Default to mock during development
export const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';

// API Endpoints
export const ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/api/dashboard',
  
  // Profile
  PROFILE: '/api/profile',
  
  // Body Tracking
  BODY_MEASUREMENTS: '/api/body/measurements',
  BODY_GOALS: '/api/body/goals',
  BODY_PROGRESS: '/api/body/progress',
  
  // Meals & Nutrition
  MEALS: '/api/meals',
  DISHES: '/api/dishes',
  RECIPES: '/api/recipes',
  
  // Menu Planning
  MENU_PLANS: '/api/menu-plans',
  GROCERY_LISTS: '/api/grocery-lists',
  
  // Analytics & Reports
  ANALYTICS: '/api/analytics',
  REPORTS: '/api/reports',
  
  // AI Features
  AI_ADVISOR: '/api/ai/advisor',
  AI_RECIPE_GEN: '/api/ai/recipe-generator',
  AI_FOOD_SCAN: '/api/ai/food-scanner',
  
  // Voice Coach
  VOICE_START: '/api/voice/start',
  VOICE_STOP: '/api/voice/stop',
  VOICE_STATUS: '/api/voice/status',
  
  // File Upload
  UPLOAD_URL: '/api/upload/get-url',
  UPLOAD_CONFIRM: '/api/upload/confirm',
  
  // Email & Notifications
  EMAIL_WEEKLY_REPORT: '/api/email/weekly-report',
  EMAIL_TEST: '/api/email/test',
  NOTIFICATION_SETTINGS: '/api/notifications/settings',
  
  // Community & Social
  COMMUNITY_FEED: '/api/community/feed',
  COMMUNITY_GROUPS: '/api/community/groups',
  SHARED_CONTENT: '/api/community/shared',
  
  // Wearables
  WEARABLES_DATA: '/api/wearables/data',
  WEARABLES_SYNC: '/api/wearables/sync',
};

// Storage Configuration (AWS S3)
export const STORAGE_CONFIG = {
  BUCKET_NAME: process.env.REACT_APP_S3_BUCKET || 'dishcore-uploads',
  REGION: process.env.REACT_APP_S3_REGION || 'us-east-1',
  // S3 access is handled via backend pre-signed URLs only
};

// Feature Flags
export const FEATURES = {
  VOICE_COACH: true,
  LIVE_CHAT: true,
  WEARABLES: true,
  COMMUNITY: true,
  EMAIL_REPORTS: true,
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'clerk_jwt',
  REFRESH_TOKEN_KEY: 'clerk_refresh_token',
  USER_KEY: 'dishcore_user',
};

// UI Configuration
export const UI_CONFIG = {
  WEBSITE_URL: 'https://dishcore.com',
  SUPPORT_URL: 'https://dishcore.com/support',
  DOCS_URL: 'https://docs.dishcore.com',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
};