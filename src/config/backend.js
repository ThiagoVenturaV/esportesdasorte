const DEFAULT_PRODUCTION_BACKEND =
  'https://esportesdasorteback-production.up.railway.app';

const DEFAULT_BACKEND_URL = import.meta.env.PROD
  ? DEFAULT_PRODUCTION_BACKEND
  : 'http://localhost:8000';

function normalizeBackendUrl(rawUrl) {
  const fallback = DEFAULT_BACKEND_URL.replace(/\/$/, '');
  const value = String(rawUrl || '').trim();
  if (!value) return fallback;

  try {
    const parsed = new URL(value);

    // Railway exposes public HTTPS without needing :8080 in the browser URL.
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('up.railway.app') &&
      parsed.port === '8080'
    ) {
      parsed.port = '';
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return value.replace(/\/$/, '');
  }
}

export const BACKEND_URL = normalizeBackendUrl(
  import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL,
);
