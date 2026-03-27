import React from 'react';
import { resolveShieldUrl } from '@/config/teamShields';

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
  
  // Resolve URL using name or externalId hash
  const resolvedUrl = resolveShieldUrl(name, externalId);

  if (!resolvedUrl) {
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
          flexShrink: 0
        }}
        title={name}
      >
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={name}
      loading="lazy"
      className={className}
      style={{ 
        width: finalWidth, 
        height: finalHeight, 
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    />
  );
}
