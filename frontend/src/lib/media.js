const RAW_API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/$/, '');

const API_ORIGIN = (() => {
  try { return new URL(RAW_API).origin; }
  catch { return window.location.origin; }
})();

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

export function mediaUrl(value) {
  if (!value) return '';
  // Be tolerant of media objects returned by storage providers.
  if (typeof value === 'object') {
    value = value.secure_url || value.url || value.path || '';
  }
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';

  // Repair records created by older builds that stored /api/uploads/... URLs.
  if (raw.startsWith('/api/uploads/')) return `${API_ORIGIN}${raw.slice(4)}`;
  if (raw.startsWith('api/uploads/')) return `${API_ORIGIN}/${raw.slice(4)}`;
  if (raw.startsWith('/uploads/')) return `${API_ORIGIN}${raw}`;
  if (raw.startsWith('uploads/')) return `${API_ORIGIN}/${raw}`;

  try {
    const url = new URL(raw, window.location.origin);
    if (url.pathname.startsWith('/api/uploads/')) {
      return `${API_ORIGIN}${url.pathname.slice(4)}${url.search}${url.hash}`;
    }
    if (url.pathname.startsWith('/uploads/') && isLocalHost(url.hostname)) {
      return `${API_ORIGIN}${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export { API_ORIGIN };
