// DishCore App Configuration - Standalone vs Integrated mode

const APP_CONFIG = {
  mode: 'standalone', // 'standalone' or 'integrated'
  version: '1.0.0',
  website: 'https://biomathcore.com'
};

export const getAppMode = () => {
  return localStorage.getItem('dishcore-app-mode') || APP_CONFIG.mode;
};

export const setAppMode = (mode) => {
  if (['standalone', 'integrated'].includes(mode)) {
    localStorage.setItem('dishcore-app-mode', mode);
    APP_CONFIG.mode = mode;
  }
};

export const isStandaloneMode = () => getAppMode() === 'standalone';
export const isIntegratedMode = () => getAppMode() === 'integrated';

export default APP_CONFIG;