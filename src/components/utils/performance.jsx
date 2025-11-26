/**
 * Performance optimization utilities for DishCore
 */

// Cache management
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CacheManager = {
  /**
   * Get cached data or fetch new
   */
  async getOrFetch(key, fetchFn, duration = CACHE_DURATION) {
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  },

  /**
   * Invalidate cache entry
   */
  invalidate(key) {
    cache.delete(key);
  },

  /**
   * Clear all cache
   */
  clear() {
    cache.clear();
  },

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: cache.size,
      keys: Array.from(cache.keys())
    };
  }
};

// Image lazy loading
export const lazyLoadImage = (imgElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  observer.observe(imgElement);
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Batch API requests
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

// Local storage with expiry
export const LocalStorage = {
  set(key, value, expiryMinutes = 60) {
    const item = {
      value,
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

// Performance monitoring
export const PerformanceMonitor = {
  marks: {},

  start(label) {
    this.marks[label] = performance.now();
  },

  end(label) {
    if (!this.marks[label]) return null;
    const duration = performance.now() - this.marks[label];
    delete this.marks[label];
    console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  },

  measure(label, fn) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  },

  async measureAsync(label, fn) {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
};

// Image optimization
export const optimizeImageUrl = (url, width = 800) => {
  if (!url) return '';
  
  // For Supabase storage URLs
  if (url.includes('supabase.co/storage')) {
    return `${url}?width=${width}&quality=80`;
  }
  
  return url;
};

// Prefetch resources
export const prefetchResource = (url, type = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

export default {
  CacheManager,
  lazyLoadImage,
  debounce,
  throttle,
  batchRequests,
  LocalStorage,
  PerformanceMonitor,
  optimizeImageUrl,
  prefetchResource
};