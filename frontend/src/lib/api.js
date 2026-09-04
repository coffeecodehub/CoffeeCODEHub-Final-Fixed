// Clean base URL handling: ensures exactly one '/api' prefix without duplicate paths or slashes
const RAW_URL = (import.meta.env.VITE_API_URL || 'https://coffeecodehub-final-fixed-1.onrender.com').trim().replace(/\/+$/, '');
const API = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

export async function api(path, options = {}) {
  const token = (() => {
    try { 
      return localStorage.getItem('cch_admin_token') || ''; 
    } catch { 
      return ''; 
    }
  })();

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Ensure path starts with exactly one forward slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API}${cleanPath}`;

  const method = String(options.method || 'GET').toUpperCase();
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    cache: method === 'GET' ? 'no-store' : options.cache
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    if (response.status === 401 && cleanPath !== '/auth/login') {
      try {
        localStorage.removeItem('cch_admin_token');
        localStorage.removeItem('cch_admin_user');
      } catch (storageError) {
        void storageError;
      }
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  
  return data;
}

export { API };