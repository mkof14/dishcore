/**
 * Mock Data for Development
 * Used when MOCK_MODE = true
 */

const mockUser = {
  id: 'mock-user-1',
  email: 'demo@dishcore.app',
  full_name: 'Demo User',
  role: 'user',
  created_date: '2024-01-01',
};

const mockProfile = {
  age: 30,
  sex: 'male',
  height: 175,
  weight: 75,
  goal: 'muscle_building',
  diet_type: 'balanced',
  target_calories: 2500,
  target_protein: 180,
  target_carbs: 250,
  target_fat: 70,
};

const mockMeals = [
  {
    id: 'meal-1',
    date: new Date().toISOString().split('T')[0],
    meal_type: 'breakfast',
    dish_name: 'Oatmeal with Berries',
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 8,
  },
  {
    id: 'meal-2',
    date: new Date().toISOString().split('T')[0],
    meal_type: 'lunch',
    dish_name: 'Grilled Chicken Salad',
    calories: 450,
    protein: 45,
    carbs: 30,
    fat: 15,
  },
];

const mockDishes = [
  {
    id: 'dish-1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    micronutrients: {
      vitamin_b6: 0.5,
      vitamin_b12: 0.3,
      iron: 1.5,
      zinc: 1.2,
    },
  },
  {
    id: 'dish-2',
    name: 'Brown Rice',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    fiber: 3.5,
    micronutrients: {
      magnesium: 86,
      vitamin_b6: 0.3,
    },
  },
];

const mockMeasurements = [
  {
    id: 'measure-1',
    date: new Date().toISOString().split('T')[0],
    weight: 75,
    waist: 85,
    body_fat_percentage: 18,
  },
];

const mockMenuPlans = [
  {
    id: 'plan-1',
    name: 'Weekly Muscle Building Plan',
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
    days: [],
  },
];

/**
 * Mock API Handler
 */
export const mockAPI = {
  handleRequest: async (endpoint, options = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const method = options.method || 'GET';
    
    // Dashboard
    if (endpoint === '/api/dashboard' && method === 'GET') {
      return {
        user: mockUser,
        todayMeals: mockMeals,
        todayCalories: mockMeals.reduce((sum, m) => sum + m.calories, 0),
        todayProtein: mockMeals.reduce((sum, m) => sum + m.protein, 0),
      };
    }

    // Profile
    if (endpoint === '/api/profile') {
      if (method === 'GET') return mockProfile;
      if (method === 'PUT') return { ...mockProfile, ...JSON.parse(options.body) };
    }

    // Meals
    if (endpoint.startsWith('/api/meals')) {
      if (method === 'GET') return mockMeals;
      if (method === 'POST') {
        const newMeal = { id: `meal-${Date.now()}`, ...JSON.parse(options.body) };
        return newMeal;
      }
    }

    // Dishes
    if (endpoint.startsWith('/api/dishes')) {
      if (method === 'GET') return mockDishes;
    }

    // Body Measurements
    if (endpoint === '/api/body/measurements') {
      if (method === 'GET') return mockMeasurements;
      if (method === 'POST') {
        const newMeasure = { id: `measure-${Date.now()}`, ...JSON.parse(options.body) };
        return newMeasure;
      }
    }

    // Menu Plans
    if (endpoint === '/api/menu-plans') {
      if (method === 'GET') return mockMenuPlans;
      if (method === 'POST') {
        const newPlan = { id: `plan-${Date.now()}`, ...JSON.parse(options.body) };
        return newPlan;
      }
    }

    // Analytics
    if (endpoint.startsWith('/api/analytics')) {
      return {
        period: 'week',
        averageCalories: 2200,
        averageProtein: 160,
        dishcoreScore: 78,
      };
    }

    // Voice Coach
    if (endpoint === '/api/voice/start') {
      return { sessionId: `session-${Date.now()}`, status: 'active' };
    }

    if (endpoint === '/api/voice/status') {
      return { status: 'active', transcript: 'Mock transcript...' };
    }

    // AI Advisor
    if (endpoint === '/api/ai/advisor') {
      const { message } = JSON.parse(options.body);
      return {
        response: `Mock AI response to: "${message}"`,
        suggestions: ['Try adding more vegetables', 'Increase protein intake'],
      };
    }

    // Upload
    if (endpoint === '/api/upload/get-url') {
      return {
        uploadUrl: 'https://mock-s3-url.com/upload',
        fileKey: `uploads/mock-${Date.now()}.jpg`,
        publicUrl: 'https://mock-cdn.com/mock-file.jpg',
      };
    }

    // Notifications
    if (endpoint === '/api/notifications/settings') {
      if (method === 'GET') {
        return {
          weeklyReport: true,
          dailyReminders: true,
          goalAlerts: true,
        };
      }
      if (method === 'PUT') {
        return { ...JSON.parse(options.body), updated: true };
      }
    }

    // Default response
    return { message: 'Mock API response', data: null };
  },
};