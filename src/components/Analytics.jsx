import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Initialize Google Analytics
export function initGA(measurementId) {
  if (typeof window === 'undefined' || !measurementId) return;

  // Google Analytics 4
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false // We'll send manually
  });
}

// Initialize Facebook Pixel
export function initFacebookPixel(pixelId) {
  if (typeof window === 'undefined' || !pixelId) return;

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

// Track page views
export function trackPageView(path) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title
    });
  }
  
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
}

// Track custom events
export function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
  
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
}

// Track conversions
export function trackConversion(conversionType, value = 0) {
  const eventMap = {
    'goal_achieved': 'Purchase',
    'meal_plan_created': 'AddToCart',
    'dish_viewed': 'ViewContent',
    'signup': 'CompleteRegistration'
  };

  if (window.fbq && eventMap[conversionType]) {
    window.fbq('track', eventMap[conversionType], { value, currency: 'USD' });
  }

  if (window.gtag) {
    window.gtag('event', 'conversion', {
      conversion_type: conversionType,
      value: value
    });
  }
}

// Analytics Hook
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return {
    trackEvent,
    trackConversion,
    trackPageView
  };
}

// Rate Limiter for API calls
class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  canMakeRequest(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  getRemainingRequests(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

export const aiRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

// Input Sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Safe HTML rendering (for user-generated content)
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}