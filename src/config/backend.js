const DEFAULT_PRODUCTION_BACKEND =
  'https://esportesdasorteback-production.up.railway.app';
const DEFAULT_PRODUCTION_BACKEND_FALLBACK =
  'https://esportesdasorteback.onrender.com';

const DEFAULT_BACKEND_URL = import.meta.env.PROD
  ? DEFAULT_PRODUCTION_BACKEND
  : 'http://localhost:8000';

const DEFAULT_BACKEND_FALLBACK_URL = import.meta.env.PROD
  ? DEFAULT_PRODUCTION_BACKEND_FALLBACK
  : '';

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

export const BACKEND_FALLBACK_URL = normalizeBackendUrl(
  import.meta.env.VITE_BACKEND_URL_FALLBACK || DEFAULT_BACKEND_FALLBACK_URL,
);

function buildBackendCandidates() {
  const candidates = [BACKEND_URL, BACKEND_FALLBACK_URL].filter(Boolean);
  return Array.from(new Set(candidates));
}

export function buildBackendUrl(pathOrUrl) {
  const input = String(pathOrUrl || '').trim();
  if (!input) return BACKEND_URL;
  if (/^https?:\/\//i.test(input)) return input;
  const path = input.startsWith('/') ? input : `/${input}`;
  return `${BACKEND_URL}${path}`;
}

export async function fetchWithBackendFallback(pathOrUrl, options = {}) {
  const input = String(pathOrUrl || '').trim();
  const method = String(options?.method || 'GET').toUpperCase();
  const shouldRetryOnFailure =
    method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  // Absolute URLs keep their original behavior (no endpoint fallback rewrite).
  if (/^https?:\/\//i.test(input)) {
    return fetch(input, options);
  }

  const path = input.startsWith('/') ? input : `/${input}`;
  const candidates = buildBackendCandidates();

  let lastNetworkError = null;
  for (let i = 0; i < candidates.length; i += 1) {
    const base = candidates[i];
    const url = `${base}${path}`;

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      const canTryNext =
        shouldRetryOnFailure &&
        response.status >= 500 &&
        i < candidates.length - 1;
      if (!canTryNext) {
        return response;
      }
    } catch (error) {
      lastNetworkError = error;
      if (!shouldRetryOnFailure || i === candidates.length - 1) {
        throw error;
      }
    }
  }

  if (lastNetworkError) {
    throw lastNetworkError;
  }

  return fetch(`${BACKEND_URL}${path}`, options);
}
