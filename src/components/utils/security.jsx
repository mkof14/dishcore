// Security utilities

// Encrypt data for localStorage
export function encryptData(data, key = 'dishcore-key') {
  try {
    const jsonString = JSON.stringify(data);
    // Simple XOR encryption (for basic protection)
    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
      encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

// Decrypt data from localStorage
export function decryptData(encryptedData, key = 'dishcore-key') {
  try {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Secure localStorage wrapper
export const secureStorage = {
  setItem(key, value) {
    try {
      const encrypted = encryptData(value);
      if (encrypted) {
        localStorage.setItem(key, encrypted);
      }
    } catch (error) {
      console.error('SecureStorage setItem failed:', error);
    }
  },

  getItem(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decryptData(encrypted);
    } catch (error) {
      console.error('SecureStorage getItem failed:', error);
      return null;
    }
  },

  removeItem(key) {
    localStorage.removeItem(key);
  }
};

// Input validation helpers
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  number: (value, min = 0, max = Infinity) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },
  
  text: (text, minLength = 0, maxLength = 1000) => {
    return typeof text === 'string' && 
           text.length >= minLength && 
           text.length <= maxLength;
  },
  
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

// Sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Audit logging
export function logSecurityEvent(eventType, details = {}) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };
  
  console.log('[Security Event]', event);
  
  // In production, send to backend
  if (process.env.NODE_ENV === 'production') {
    // Send to your logging service
    // fetch('/api/security-log', { method: 'POST', body: JSON.stringify(event) });
  }
}

// Session timeout handler
let sessionTimeout;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export function initSessionTimeout(onTimeout) {
  const resetTimer = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
      logSecurityEvent('session_timeout');
      if (onTimeout) onTimeout();
    }, SESSION_DURATION);
  };

  // Reset timer on user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });

  resetTimer();
}

// CSRF token generation (basic)
export function generateCSRFToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Check if running over HTTPS
export function enforceHTTPS() {
  if (typeof window !== 'undefined' && 
      window.location.protocol === 'http:' && 
      window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
}