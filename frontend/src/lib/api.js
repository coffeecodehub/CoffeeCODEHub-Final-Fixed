// Central API helper for both local development and production.
// VITE_API_URL may be either:
//   https://example.onrender.com
// or
//   https://example.onrender.com/api

const RAW_URL = (
  import.meta.env.VITE_API_URL ||
  'https://coffeecodehub-final-fixed-1.onrender.com/api'
)
  .trim()
  .replace(/\/+$/, '');

export const API = RAW_URL.endsWith('/api')
  ? RAW_URL
  : `${RAW_URL}/api`;

function getStoredToken() {
  try {
    return localStorage.getItem('cch_admin_token') || '';
  } catch {
    return '';
  }
}

function buildHeaders(options = {}) {
  const token = getStoredToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function clearAdminSession() {
  try {
    localStorage.removeItem('cch_admin_token');
    localStorage.removeItem('cch_admin_user');
  } catch {
    // Ignore storage errors.
  }
}

function cleanPath(path = '') {
  return path.startsWith('/') ? path : `/${path}`;
}

export async function api(path, options = {}) {
  const clean = cleanPath(path);
  const method = String(options.method || 'GET').toUpperCase();

  const forceFresh =
    clean === '/projects' ||
    clean.startsWith('/projects/') ||
    clean === '/blogs' ||
    clean.startsWith('/blogs/') ||
    clean.includes('/admin') ||
    method !== 'GET';

  const response = await fetch(`${API}${clean}`, {
    ...options,
    headers: buildHeaders(options),
    cache: options.cache || (forceFresh ? 'no-store' : (method === 'GET' ? 'default' : undefined)),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && clean !== '/auth/login') {
      clearAdminSession();
    }

    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

// Use this for endpoints that return files instead of JSON.
export async function apiBlob(path, options = {}) {
  const clean = cleanPath(path);
  const method = String(options.method || 'GET').toUpperCase();

  const forceFresh =
    clean === '/projects' ||
    clean.startsWith('/projects/') ||
    clean === '/blogs' ||
    clean.startsWith('/blogs/') ||
    clean.includes('/admin') ||
    method !== 'GET';

  const response = await fetch(`${API}${clean}`, {
    ...options,
    headers: buildHeaders(options),
    cache: options.cache || (forceFresh ? 'no-store' : (method === 'GET' ? 'default' : undefined)),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // The response may be a non-JSON error page.
    }

    if (response.status === 401 && clean !== '/auth/login') {
      clearAdminSession();
    }

    throw new Error(message);
  }

  return response.blob();
}

export { getStoredToken };

// Default export taake Review.jsx mein 'import api from ...' chale
export default api;