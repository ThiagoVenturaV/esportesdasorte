import React from 'react';
import { resolveShieldUrls } from '@/config/teamShields';

const betanoBadgeCache = new Map();
const sportsDbBadgeCache = new Map();
const MAX_BADGE_CACHE_ENTRIES = 250;

function cacheBadge(cache, key, value) {
  cache.set(key, value);
  while (cache.size > MAX_BADGE_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
}

const BETANO_API_CANDIDATES = [
  '/betano-api/api/sport/teams/search',
  '/betano-api/api/sport/search/teams',
  'https://www.betano.bet.br/api/sport/teams/search',
  'https://www.betano.bet.br/api/sport/search/teams',
];

function asAbsoluteBetanoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `https://www.betano.bet.br${url}`;
  return null;
}

function findLogoLikeField(payload) {
  if (!payload) return null;

  if (typeof payload === 'string') {
    if (/\.(png|svg|webp|jpg|jpeg)(\?|$)/i.test(payload)) {
      return asAbsoluteBetanoUrl(payload) || payload;
    }
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = findLogoLikeField(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof payload === 'object') {
    const keysByPriority = [
      'logo',
      'logoUrl',
      'logo_url',
      'crest',
      'crestUrl',
      'badge',
      'badgeUrl',
      'image',
      'imageUrl',
      'icon',
      'iconUrl',
    ];

    for (const key of keysByPriority) {
      const value = payload?.[key];
      const found = findLogoLikeField(value);
      if (found) return found;
    }

    for (const value of Object.values(payload)) {
      const found = findLogoLikeField(value);
      if (found) return found;
    }
  }

  return null;
}

async function fetchBetanoBadge(teamName) {
  const normalized = String(teamName || '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  if (betanoBadgeCache.has(normalized)) {
    return betanoBadgeCache.get(normalized);
  }

  for (const endpoint of BETANO_API_CANDIDATES) {
    try {
      const url = `${endpoint}?query=${encodeURIComponent(teamName)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const badge = findLogoLikeField(data);
      if (badge) {
        cacheBadge(betanoBadgeCache, normalized, badge);
        return badge;
      }
    } catch {
      // Keep trying the next known Betano endpoint candidate.
    }
  }

  cacheBadge(betanoBadgeCache, normalized, null);
  return null;
}

async function fetchSportsDbBadge(teamName) {
  const normalized = String(teamName || '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  if (sportsDbBadgeCache.has(normalized)) {
    return sportsDbBadgeCache.get(normalized);
  }

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      cacheBadge(sportsDbBadgeCache, normalized, null);
      return null;
    }

    const data = await response.json();
    const badge = data?.teams?.[0]?.strBadge || null;
    cacheBadge(sportsDbBadgeCache, normalized, badge);
    return badge;
  } catch {
    cacheBadge(sportsDbBadgeCache, normalized, null);
    return null;
  }
}

/**
 * TeamShield Component
 * Renders the team crest using centralized mapping (API-Futebol primary).
 *
 * @param {{ externalId: string, name: string, size?: number, className?: string }} props
 */
export default function TeamShield({ externalId, name, size = 48, className }) {
  // If size is explicitly null, we want it to be 100% to follow container CSS
  // Otherwise, we use the pixel size (default 40px)
  const finalWidth = size ? `${size}px` : '100%';
  const finalHeight = size ? `${size}px` : '100%';

  // Ordered list of possible logos (CDN by id first, then mapped fallback).
  const shieldUrls = React.useMemo(
    () => resolveShieldUrls(name, externalId),
    [name, externalId],
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [primarySourcesFailed, setPrimarySourcesFailed] = React.useState(false);
  const [betanoBadgeUrl, setBetanoBadgeUrl] = React.useState(null);
  const [sportsDbBadgeUrl, setSportsDbBadgeUrl] = React.useState(null);
  const [lookupAttempted, setLookupAttempted] = React.useState(false);

  React.useEffect(() => {
    setActiveIndex(0);
    setPrimarySourcesFailed(false);
    setBetanoBadgeUrl(null);
    setSportsDbBadgeUrl(null);
    setLookupAttempted(false);
  }, [shieldUrls]);

  const resolvedUrl = shieldUrls[activeIndex] || null;
  const effectiveUrl = primarySourcesFailed
    ? betanoBadgeUrl || sportsDbBadgeUrl
    : resolvedUrl;

  React.useEffect(() => {
    let cancelled = false;

    async function runLookup() {
      if (!primarySourcesFailed || !name || lookupAttempted) return;
      setLookupAttempted(true);

      const betanoBadge = await fetchBetanoBadge(name);
      if (!cancelled && betanoBadge) {
        setBetanoBadgeUrl(betanoBadge);
        return;
      }

      const badge = await fetchSportsDbBadge(name);
      if (!cancelled && badge) {
        setSportsDbBadgeUrl(badge);
      }
    }

    runLookup();
    return () => {
      cancelled = true;
    };
  }, [primarySourcesFailed, name, lookupAttempted]);

  if (!effectiveUrl) {
    return (
      <div
        className={className}
        style={{
          width: finalWidth,
          height: finalHeight,
          backgroundColor: '#333',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.5em',
          color: '#fff',
          flexShrink: 0,
        }}
        title={name}
      >
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }

  return (
    <img
      src={effectiveUrl}
      alt={name}
      loading="lazy"
      onError={() => {
        // Tries the next source if current CDN/url fails.
        if (activeIndex < shieldUrls.length - 1) {
          setActiveIndex((prev) => prev + 1);
        } else {
          setPrimarySourcesFailed(true);
        }
      }}
      className={className}
      style={{
        width: finalWidth,
        height: finalHeight,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  );
}
