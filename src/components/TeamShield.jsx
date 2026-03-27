import React from 'react';
import { resolveShieldUrls } from '@/config/teamShields';

const sportsDbBadgeCache = new Map();

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
      sportsDbBadgeCache.set(normalized, null);
      return null;
    }

    const data = await response.json();
    const badge = data?.teams?.[0]?.strBadge || null;
    sportsDbBadgeCache.set(normalized, badge);
    return badge;
  } catch {
    sportsDbBadgeCache.set(normalized, null);
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
  const [sportsDbBadgeUrl, setSportsDbBadgeUrl] = React.useState(null);
  const [lookupAttempted, setLookupAttempted] = React.useState(false);

  React.useEffect(() => {
    setActiveIndex(0);
    setPrimarySourcesFailed(false);
    setSportsDbBadgeUrl(null);
    setLookupAttempted(false);
  }, [shieldUrls]);

  const resolvedUrl = shieldUrls[activeIndex] || null;
  const effectiveUrl = primarySourcesFailed ? sportsDbBadgeUrl : resolvedUrl;

  React.useEffect(() => {
    let cancelled = false;

    async function runLookup() {
      if (!primarySourcesFailed || !name || lookupAttempted) return;
      setLookupAttempted(true);
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
