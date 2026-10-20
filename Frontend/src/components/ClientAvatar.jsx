import React, { useState, useEffect } from 'react';

/**
 * Returns 2-letter uppercase initials for client company name
 */
export function getClientInitials(name) {
  if (!name) return 'CL';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Returns a consistent modern gradient based on the client name
 */
export function getClientGradient(name) {
  const gradients = [
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
  ];
  let hash = 0;
  const str = name || 'client';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

/**
 * ClientAvatar: Displays either client logo image OR default gradient avatar.
 * Guarantees never displaying both at once.
 */
export default function ClientAvatar({
  logo,
  name,
  size = 42,
  borderRadius = 12,
  fontSize = '0.9rem',
  style = {},
  className = '',
}) {
  const [imgError, setImgError] = useState(false);

  // If logo prop changes, reset error state
  useEffect(() => {
    setImgError(false);
  }, [logo]);

  const hasValidLogo = Boolean(logo && typeof logo === 'string' && logo.trim().length > 0 && !imgError);

  if (hasValidLogo) {
    return (
      <img
        src={logo}
        alt={name || 'Client logo'}
        className={`shadow-sm flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius,
          objectFit: 'contain',
          backgroundColor: '#fff',
          border: '1px solid rgba(0,0,0,0.08)',
          padding: '2px',
          ...style,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: getClientGradient(name),
        fontSize,
        letterSpacing: '0.5px',
        ...style,
      }}
    >
      {getClientInitials(name)}
    </div>
  );
}
