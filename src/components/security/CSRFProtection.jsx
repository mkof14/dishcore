import { useEffect, useState } from 'react';

// Generate CSRF token
export function generateCSRFToken() {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  sessionStorage.setItem('csrf-token', token);
  return token;
}

// Get CSRF token
export function getCSRFToken() {
  let token = sessionStorage.getItem('csrf-token');
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
}

// Validate CSRF token
export function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrf-token');
  return token === storedToken;
}

// React hook for CSRF protection
export function useCSRFToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const csrfToken = getCSRFToken();
    setToken(csrfToken);
  }, []);

  return token;
}

// CSRF protected fetch wrapper
export async function csrfFetch(url, options = {}) {
  const token = getCSRFToken();
  
  const headers = {
    ...options.headers,
    'X-CSRF-Token': token
  };

  return fetch(url, {
    ...options,
    headers
  });
}

// Form component with CSRF protection
export function CSRFInput() {
  const token = useCSRFToken();
  
  return (
    <input
      type="hidden"
      name="csrf_token"
      value={token}
    />
  );
}