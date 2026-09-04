const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://coffeecodehub-final-fixed-1.onrender.com';
const BASE_URL = RAW_API_URL.replace(/\/+$/, ''); // trailing slash remove karega
const API = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export async function api(path, options = {}) {
  const token = (() => {
    try { return localStorage.getItem('cch_admin_token') || ''; } catch { return ''; }
  })();

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  // Ensure path starts with a clean single slash
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