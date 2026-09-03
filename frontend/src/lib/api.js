const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = (() => {
    try { return localStorage.getItem('cch_admin_token') || ''; } catch { return ''; }
  })();

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  const method = String(options.method || 'GET').toUpperCase();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: method === 'GET' ? 'no-store' : options.cache
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
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
