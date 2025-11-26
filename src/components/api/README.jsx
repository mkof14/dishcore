# DishCore API Architecture

## Overview
This directory contains the API client layer for DishCore, designed to be migration-ready for Vercel deployment.

## Structure

### config.js
- Central configuration for API endpoints
- Environment variables
- Feature flags
- Constants

### apiClient.js
- Unified interface for all backend communication
- Handles authentication tokens (Clerk JWT)
- Error handling and retry logic
- Supports both real API and mock mode

### mockData.js
- Mock data for development when backend is not available
- Simulates API responses
- Useful for UI development and testing

## Usage

```javascript
import apiClient from '@/components/api/apiClient';

// Get user profile
const profile = await apiClient.getProfile();

// Log a meal
await apiClient.logMeal({
  date: '2024-01-15',
  meal_type: 'lunch',
  dish_name: 'Chicken Salad',
  calories: 450,
});

// Upload file
const { publicUrl } = await apiClient.uploadFile(file, 'dish_image');
```

## Environment Variables

Create `.env.local` file:

```
REACT_APP_API_BASE_URL=https://api.dishcore.app
REACT_APP_MOCK_MODE=false
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
REACT_APP_S3_BUCKET=dishcore-uploads
REACT_APP_S3_REGION=us-east-1
```

## Migration to Vercel

1. **Backend Setup**:
   - Deploy Next.js API routes to Vercel
   - Connect to Neon PostgreSQL
   - Set up Clerk authentication
   - Configure AWS S3 for file storage

2. **Frontend Integration**:
   - Set `REACT_APP_MOCK_MODE=false`
   - Update `REACT_APP_API_BASE_URL` to production URL
   - Add Clerk provider at app root
   - Test all API endpoints

3. **Deployment Checklist**:
   - [ ] Environment variables configured
   - [ ] Database migrations run
   - [ ] S3 bucket configured
   - [ ] Clerk auth configured
   - [ ] API routes deployed
   - [ ] CORS configured
   - [ ] Rate limiting enabled
   - [ ] Monitoring setup

## API Endpoints

All endpoints are defined in `config.js` under `ENDPOINTS`:

- `/api/dashboard` - Dashboard data
- `/api/profile` - User profile (GET, PUT)
- `/api/body/measurements` - Body measurements
- `/api/meals` - Meal logging
- `/api/dishes` - Dish library
- `/api/menu-plans` - Menu planning
- `/api/analytics` - Analytics data
- `/api/ai/advisor` - AI advisor chat
- `/api/voice/*` - Voice coach endpoints
- `/api/upload/*` - File upload
- `/api/email/*` - Email notifications

## Authentication Flow

1. User logs in via Clerk
2. Clerk returns JWT token
3. Token stored in localStorage
4. `apiClient` attaches token to all requests
5. Backend validates token via Clerk
6. If token expired, redirect to login

## Error Handling

```javascript
try {
  const data = await apiClient.getProfile();
} catch (error) {
  // Error is already logged by apiClient
  // Show user-friendly message
  toast.error('Failed to load profile');
}
```

## Mock Mode

During development, set `MOCK_MODE=true` to use mock data without backend:

```javascript
// config.js
export const MOCK_MODE = true;

// All API calls will return mock data
const meals = await apiClient.getMeals(); // Returns mockMeals
```

## Adding New Endpoints

1. Add endpoint to `config.js`:
```javascript
export const ENDPOINTS = {
  // ...
  NEW_FEATURE: '/api/new-feature',
};
```

2. Add method to `apiClient.js`:
```javascript
export const apiClient = {
  // ...
  getNewFeature: async () => {
    return apiFetch(ENDPOINTS.NEW_FEATURE);
  },
};
```

3. Add mock data to `mockData.js`:
```javascript
if (endpoint === '/api/new-feature') {
  return { data: 'mock response' };
}
```

## Best Practices

- Always use `apiClient` instead of direct `fetch` calls
- Handle errors gracefully with try/catch
- Use mock mode during UI development
- Test with real API before production
- Keep sensitive keys in environment variables
- Never commit API keys or secrets

## Support

For questions about the API architecture, contact the development team or refer to the main project documentation.