import React, { useState, useEffect } from 'react';

/**
 * AdDetailsModal - Redesigned Ad Performance Modal
 * Matches app style & theme, wider layout (max-width: 680px),
 * clean copy section with "view source" media link, and comprehensive performance metrics.
 */
function getCurrencySymbol(curr) {
  if (!curr) return '$';
  switch (String(curr).toUpperCase()) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'AED': return 'AED ';
    case 'SAR': return 'SAR ';
    case 'CAD': return 'C$';
    case 'AUD': return 'A$';
    case 'EGP': return 'EGP ';
    default: return '$';
  }
}

export default function AdDetailsModal({ ad, currency, onClose }) {
  // Close on Escape key and prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (!ad) return null;

  // Title with any '(15s)' or variations removed
  const cleanTitle = (ad.name || '')
    .replace(/\s*\(\s*15s\s*\)/gi, '')
    .replace(/\s*-\s*15s\s*/gi, ' - ')
    .trim();

  // Normalized status
  const rawStatus = String(ad.status ?? '').toLowerCase();
  const statusLabel =
    rawStatus === '0' || rawStatus === 'active'
      ? 'active'
      : rawStatus === '1' || rawStatus === 'paused'
      ? 'paused'
      : rawStatus === '2' || rawStatus === 'completed'
      ? 'completed'
      : rawStatus || 'active';

  // Normalized media type
  const rawMediaType = String(ad.mediaType ?? '').toLowerCase();
  const isVideo =
    rawMediaType.includes('video') ||
    ad.mediaType === 1 ||
    (typeof ad.mediaURL === 'string' && /\.(mp4|webm|ogg|mov)($|\?)/i.test(ad.mediaURL));

  const isCarousel =
    rawMediaType.includes('carousel') ||
    ad.mediaType === 2;

  const mediaTypeLabel = isVideo ? 'video' : isCarousel ? 'carousel' : 'image';

  // Metrics calculation
  const spend = Number(ad.spend) || 0;
  const revenue = Number(ad.revenue) || 0;
  const impressions = Number(ad.impressions) || 0;
  const clicks = Number(ad.clicks) || 0;
  const conversions = Number(ad.conversions) || 0;
  const reach = Number(ad.reach) || (impressions > 0 ? Math.round(impressions * 0.85) : 0);
  const ctr = Number(ad.ctr) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
  const cpc = Number(ad.cpc) || (clicks > 0 ? spend / clicks : 0);
  const cpa = Number(ad.cpa) || (conversions > 0 ? spend / conversions : 0);
  const roas = Number(ad.roas) || (spend > 0 ? revenue / spend : 0);

  // Formatter helpers
  const currSymbol = getCurrencySymbol(ad.currency || currency || 'USD');

  const formatCompact = (val) => {
    if (val == null || isNaN(val)) return '0';
    const num = Number(val);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1060,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'linear-gradient(180deg, #1e2738 0%, #151d2a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px 22px',
          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          color: '#f1f5f9',
        }}
      >
        {/* ─── Header ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.35,
                letterSpacing: '-0.015em',
              }}
            >
              {cleanTitle}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {/* Status Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background:
                    statusLabel === 'active'
                      ? 'rgba(16, 185, 129, 0.14)'
                      : statusLabel === 'paused'
                      ? 'rgba(245, 158, 11, 0.14)'
                      : 'rgba(255, 255, 255, 0.07)',
                  color:
                    statusLabel === 'active'
                      ? '#34d399'
                      : statusLabel === 'paused'
                      ? '#fbbf24'
                      : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background:
                      statusLabel === 'active'
                        ? '#34d399'
                        : statusLabel === 'paused'
                        ? '#fbbf24'
                        : '#94a3b8',
                    display: 'inline-block',
                  }}
                />
                {statusLabel}
              </span>

              {/* Media Type Badge */}
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {mediaTypeLabel}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <i className="ti ti-x" style={{ fontSize: '16px' }} aria-hidden="true" />
          </button>
        </div>

        {/* ─── Top 3 Metric Cards ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginTop: '14px' }}>
          {/* Spend */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
              }}
            >
              <i className="ti ti-receipt-2" style={{ fontSize: '13px', color: '#fb7185' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Spend
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fb7185', marginTop: '2px', letterSpacing: '-0.02em' }}>
              {currSymbol}{spend >= 1000 ? spend.toLocaleString('en-US', { maximumFractionDigits: 0 }) : spend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Revenue */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
              }}
            >
              <i className="ti ti-cash" style={{ fontSize: '13px', color: '#34d399' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Revenue
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', marginTop: '2px', letterSpacing: '-0.02em' }}>
              {currSymbol}{revenue >= 1000 ? revenue.toLocaleString('en-US', { maximumFractionDigits: 0 }) : revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* ROAS */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(129, 140, 248, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
              }}
            >
              <i className="ti ti-chart-line" style={{ fontSize: '13px', color: '#a5b4fc' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              ROAS
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#a5b4fc', marginTop: '2px', letterSpacing: '-0.02em' }}>
              {roas.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '14px 0' }} />

        {/* ─── Ad Details Section (Headline, Description, View Source Link) ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '12px 16px',
          }}
        >
          {/* Headline */}
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Headline
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '2px', lineHeight: 1.35 }}>
              {ad.headline || ad.name}
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Description
            </div>
            <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '2px', lineHeight: 1.55 }}>
              {ad.description || 'No description provided.'}
            </div>
          </div>

          {/* Media URL / View Source */}
          {ad.mediaURL ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Media:
              </span>
              <a
                href={ad.mediaURL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6ee7b7';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#34d399';
                  e.currentTarget.style.textDecoration = 'none';
                }}
                title={ad.mediaURL}
              >
                <span>View source</span>
                <i className="ti ti-external-link" style={{ fontSize: '13px' }} aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '14px 0 10px' }} />

        {/* ─── Performance Breakdown ─── */}
        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '8px' }}>
          Performance Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
          {/* Impressions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-eye" style={{ fontSize: '15px', color: '#60a5fa' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>Impressions</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{formatCompact(impressions)}</span>
          </div>

          {/* Clicks */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-click" style={{ fontSize: '15px', color: '#a78bfa' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>Clicks</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{formatCompact(clicks)}</span>
          </div>

          {/* CTR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-percentage" style={{ fontSize: '15px', color: '#38bdf8' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>CTR</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{ctr.toFixed(2)}%</span>
          </div>

          {/* CPC */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-currency-dollar" style={{ fontSize: '15px', color: '#fbbf24' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>CPC</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{currSymbol}{cpc.toFixed(2)}</span>
          </div>

          {/* Conversions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-check" style={{ fontSize: '15px', color: '#34d399' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>Conversions</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{conversions.toLocaleString()}</span>
          </div>

          {/* CPA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-target" style={{ fontSize: '15px', color: '#f472b6' }} aria-hidden="true" />
              <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 500 }}>CPA</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{currSymbol}{cpa.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
