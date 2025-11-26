/**
 * DishCore API Client
 * Unified interface for all backend communication
 * Supports both real API calls and mock mode for development
 */

import { API_BASE_URL, MOCK_MODE, ENDPOINTS, ERROR_MESSAGES, AUTH_CONFIG } from './config';
import { mockAPI } from './mockData';

/**
 * Get authentication token from storage
 */
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
};

/**
 * Base fetch wrapper with auth and error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  // Mock mode bypass
  if (MOCK_MODE) {
    console.log(`[MOCK MODE] ${options.method || 'GET'} ${endpoint}`);
    return mockAPI.handleRequest(endpoint, options);
  }

  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        window.location.href = '/login';
      }
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * API Client
 */
export const apiClient = {
  // ==================== Dashboard ====================
  getDashboard: async () => {
    return apiFetch(ENDPOINTS.DASHBOARD);
  },

  // ==================== Profile ====================
  getProfile: async () => {
    return apiFetch(ENDPOINTS.PROFILE);
  },

  updateProfile: async (data) => {
    return apiFetch(ENDPOINTS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ==================== Body Tracking ====================
  getMeasurements: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.BODY_MEASUREMENTS}?${query}`);
  },

  addMeasurement: async (data) => {
    return apiFetch(ENDPOINTS.BODY_MEASUREMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBodyGoals: async () => {
    return apiFetch(ENDPOINTS.BODY_GOALS);
  },

  saveBodyGoal: async (data) => {
    return apiFetch(ENDPOINTS.BODY_GOALS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getBodyProgress: async () => {
    return apiFetch(ENDPOINTS.BODY_PROGRESS);
  },

  // ==================== Meals & Nutrition ====================
  getMeals: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.MEALS}?${query}`);
  },

  logMeal: async (data) => {
    return apiFetch(ENDPOINTS.MEALS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMeal: async (id, data) => {
    return apiFetch(`${ENDPOINTS.MEALS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMeal: async (id) => {
    return apiFetch(`${ENDPOINTS.MEALS}/${id}`, {
      method: 'DELETE',
    });
  },

  getDishes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.DISHES}?${query}`);
  },

  getDish: async (id) => {
    return apiFetch(`${ENDPOINTS.DISHES}/${id}`);
  },

  getRecipes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.RECIPES}?${query}`);
  },

  // ==================== Menu Planning ====================
  getMenuPlans: async () => {
    return apiFetch(ENDPOINTS.MENU_PLANS);
  },

  saveMenuPlan: async (data) => {
    return apiFetch(ENDPOINTS.MENU_PLANS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteMenuPlan: async (id) => {
    return apiFetch(`${ENDPOINTS.MENU_PLANS}/${id}`, {
      method: 'DELETE',
    });
  },

  getGroceryLists: async () => {
    return apiFetch(ENDPOINTS.GROCERY_LISTS);
  },

  saveGroceryList: async (data) => {
    return apiFetch(ENDPOINTS.GROCERY_LISTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== Analytics & Reports ====================
  getAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.ANALYTICS}?${query}`);
  },

  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.REPORTS}?${query}`);
  },

  // ==================== AI Features ====================
  askAIAdvisor: async (message, context = {}) => {
    return apiFetch(ENDPOINTS.AI_ADVISOR, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  },

  generateRecipe: async (preferences) => {
    return apiFetch(ENDPOINTS.AI_RECIPE_GEN, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },

  scanFood: async (imageData) => {
    return apiFetch(ENDPOINTS.AI_FOOD_SCAN, {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },

  // ==================== Voice Coach ====================
  startVoiceSession: async (sessionData = {}) => {
    return apiFetch(ENDPOINTS.VOICE_START, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  stopVoiceSession: async (sessionId) => {
    return apiFetch(ENDPOINTS.VOICE_STOP, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  getVoiceStatus: async (sessionId) => {
    return apiFetch(`${ENDPOINTS.VOICE_STATUS}?sessionId=${sessionId}`);
  },

  // ==================== File Upload ====================
  getUploadUrl: async (fileType, purpose) => {
    return apiFetch(ENDPOINTS.UPLOAD_URL, {
      method: 'POST',
      body: JSON.stringify({ fileType, purpose }),
    });
  },

  uploadFile: async (file, purpose = 'general') => {
    // Step 1: Get pre-signed URL from backend
    const { uploadUrl, fileKey, publicUrl } = await apiClient.getUploadUrl(
      file.type,
      purpose
    );

    // Step 2: Upload directly to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Step 3: Confirm upload to backend
    await apiFetch(ENDPOINTS.UPLOAD_CONFIRM, {
      method: 'POST',
      body: JSON.stringify({ fileKey, publicUrl }),
    });

    return { fileKey, publicUrl };
  },

  // ==================== Email & Notifications ====================
  sendWeeklyReport: async () => {
    return apiFetch(ENDPOINTS.EMAIL_WEEKLY_REPORT, {
      method: 'POST',
    });
  },

  sendTestEmail: async (email) => {
    return apiFetch(ENDPOINTS.EMAIL_TEST, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getNotificationSettings: async () => {
    return apiFetch(ENDPOINTS.NOTIFICATION_SETTINGS);
  },

  updateNotificationSettings: async (settings) => {
    return apiFetch(ENDPOINTS.NOTIFICATION_SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // ==================== Community & Social ====================
  getCommunityFeed: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.COMMUNITY_FEED}?${query}`);
  },

  getCommunityGroups: async () => {
    return apiFetch(ENDPOINTS.COMMUNITY_GROUPS);
  },

  getSharedContent: async () => {
    return apiFetch(ENDPOINTS.SHARED_CONTENT);
  },

  // ==================== Wearables ====================
  getWearablesData: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${ENDPOINTS.WEARABLES_DATA}?${query}`);
  },

  syncWearables: async (deviceType) => {
    return apiFetch(ENDPOINTS.WEARABLES_SYNC, {
      method: 'POST',
      body: JSON.stringify({ deviceType }),
    });
  },
};

export default apiClient;