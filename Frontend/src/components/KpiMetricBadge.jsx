import React from 'react';

/**
 * Renders an inline SVG icon appropriate for the given metric key.
 */
function MetricIcon({ iconKey, size = 18 }) {
  switch (iconKey) {
    // 1. Spend / Cost (Wallet)
    case 'wallet':
    case 'spend':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
          <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
        </svg>
      );

    // 2. Revenue / Dollar Coin (Matches Reference Image 2)
    case 'coin':
    case 'revenue':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1" />
          <path d="M12 7v10" />
        </svg>
      );

    // 3. Conversions / Orders / Purchases (Shopping Cart - Matches Reference Image 1)
    case 'cart':
    case 'conversions':
    case 'orders':
    case 'aov':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
          <path d="M17 17h-11v-14h-2" />
          <path d="M6 5l14 1l-1 7h-13" />
        </svg>
      );

    // 4. CPA / Cost Per Acquisition / User (User Profile Circle - Matches Reference Image 3)
    case 'user':
    case 'cpa':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="10" r="3" />
          <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
        </svg>
      );

    // 5. ROAS / Growth / Multiplier
    case 'roas':
    case 'growth':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="14 7 21 7 21 14" />
        </svg>
      );

    // 6. CTR / Click-Through Rate / Pointer
    case 'pointer':
    case 'ctr':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7 18l2.5 -6.5l6.5 -2.5z" />
          <path d="M13 13l6 6" />
        </svg>
      );

    // 7. Clicks / Mouse Click
    case 'mouse':
    case 'clicks':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="3" width="12" height="18" rx="4" />
          <line x1="12" y1="7" x2="12" y2="11" />
        </svg>
      );

    // 8. Impressions / Views / Eye
    case 'eye':
    case 'impressions':
    case 'reach':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
        </svg>
      );

    // 9. CPC / Cost Per Click / Tag
    case 'tag':
    case 'cpc':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-6.172a2 2 0 0 0 -2 2z" />
        </svg>
      );

    // 10. CPM / Layers / Stack
    case 'stack':
    case 'cpm':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4l-8 4l-8 -4z" />
          <path d="M4 10l8 4l8 -4" />
          <path d="M4 14l8 4l8 -4" />
          <path d="M4 18l8 4l8 -4" />
        </svg>
      );

    // 11. Conversion Rate / Percent
    case 'percent':
    case 'conversionrate':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 15l4 -6" />
          <circle cx="9.5" cy="9.5" r=".5" fill="currentColor" />
          <circle cx="14.5" cy="14.5" r=".5" fill="currentColor" />
        </svg>
      );

    // 12. Frequency / Repeat
    case 'repeat':
    case 'frequency':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
          <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
        </svg>
      );

    // 13. Video Views (Play)
    case 'play':
    case 'videoviews':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" />
        </svg>
      );

    // 14. Engagement Rate (Sparkles / Heart)
    case 'sparkles':
    case 'engagementrate':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
        </svg>
      );

    // 15. Swipe Ups (Arrow Up Circle)
    case 'swipeups':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="16" x2="12" y2="8" />
          <polyline points="8 12 12 8 16 12" />
        </svg>
      );

    // 16. Story Views (Flame)
    case 'storyviews':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -.643 -2.94 -1.5 -4c-1.077 1.545 -2.25 2.5 -4.5 1z" />
        </svg>
      );

    // 17. Search Impression Share (Search Pie)
    case 'searchimprshare':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <line x1="21" y1="21" x2="15" y2="15" />
          <line x1="10" y1="7" x2="10" y2="10" />
          <line x1="10" y1="10" x2="13" y2="10" />
        </svg>
      );

    // 18. Quality Score (Star)
    case 'avgqualityscore':
    case 'star':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
        </svg>
      );

    // Default Fallback: Activity / Chart Pulse
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="7 12 10 9 14 15 17 12" />
        </svg>
      );
  }
}

/**
 * Metric metadata definitions mapping each key to icon, color, and label.
 */
const METRIC_CONFIG = {
  totalspend: { icon: 'wallet', color: 'danger', label: 'Spend' },
  adspend: { icon: 'wallet', color: 'danger', label: 'Spend' },
  spend: { icon: 'wallet', color: 'danger', label: 'Spend' },
  totalrevenue: { icon: 'coin', color: 'success', label: 'Revenue' },
  revenue: { icon: 'coin', color: 'success', label: 'Revenue' },
  roas: { icon: 'roas', color: 'primary', label: 'ROAS' },
  conversions: { icon: 'cart', color: 'warning', label: 'Conversions' },
  purchases: { icon: 'cart', color: 'warning', label: 'Purchases' },
  orders: { icon: 'cart', color: 'warning', label: 'Orders' },
  cpa: { icon: 'user', color: 'info', label: 'CPA' },
  ctr: { icon: 'pointer', color: 'info', label: 'CTR' },
  linkctr: { icon: 'pointer', color: 'info', label: 'CTR' },
  clicks: { icon: 'mouse', color: 'primary', label: 'Clicks' },
  impressions: { icon: 'eye', color: 'info', label: 'Impressions' },
  reach: { icon: 'eye', color: 'info', label: 'Reach' },
  cpc: { icon: 'tag', color: 'warning', label: 'CPC' },
  aov: { icon: 'aov', color: 'primary', label: 'Average Order Value' },
  cpm: { icon: 'stack', color: 'secondary', label: 'CPM' },
  conversionrate: { icon: 'percent', color: 'success', label: 'Conversion Rate' },
  frequency: { icon: 'repeat', color: 'secondary', label: 'Frequency' },
  videoviews: { icon: 'play', color: 'danger', label: 'Video Views' },
  engagementrate: { icon: 'sparkles', color: 'success', label: 'Engagement Rate' },
  swipeups: { icon: 'swipeups', color: 'warning', label: 'Swipe-Ups' },
  storyviews: { icon: 'storyviews', color: 'info', label: 'Story & Lens Views' },
  searchimprshare: { icon: 'searchimprshare', color: 'info', label: 'Search Impr. Share' },
  avgqualityscore: { icon: 'star', color: 'primary', label: 'Quality Score' },
};

/**
 * Color styling tokens matching the user's reference shapes:
 * - Amber/brown circle for cart/warning (Reference 1)
 * - Forest green circle for coin/success (Reference 2)
 * - Navy/cyan circle for user/info (Reference 3)
 */
const COLOR_STYLES = {
  warning: {
    bgLight: 'rgba(245, 158, 11, 0.14)',
    bgDark: 'rgba(217, 119, 6, 0.22)',
    textLight: '#b45309',
    textDark: '#fbbf24',
    borderLight: 'rgba(245, 158, 11, 0.35)',
    borderDark: 'rgba(245, 158, 11, 0.3)',
  },
  success: {
    bgLight: 'rgba(16, 185, 129, 0.14)',
    bgDark: 'rgba(16, 185, 129, 0.22)',
    textLight: '#047857',
    textDark: '#34d399',
    borderLight: 'rgba(16, 185, 129, 0.35)',
    borderDark: 'rgba(16, 185, 129, 0.3)',
  },
  info: {
    bgLight: 'rgba(14, 165, 233, 0.14)',
    bgDark: 'rgba(14, 165, 233, 0.22)',
    textLight: '#0369a1',
    textDark: '#38bdf8',
    borderLight: 'rgba(14, 165, 233, 0.35)',
    borderDark: 'rgba(14, 165, 233, 0.3)',
  },
  primary: {
    bgLight: 'rgba(99, 102, 241, 0.14)',
    bgDark: 'rgba(99, 102, 241, 0.22)',
    textLight: '#4338ca',
    textDark: '#818cf8',
    borderLight: 'rgba(99, 102, 241, 0.35)',
    borderDark: 'rgba(99, 102, 241, 0.3)',
  },
  danger: {
    bgLight: 'rgba(239, 68, 68, 0.14)',
    bgDark: 'rgba(239, 68, 68, 0.22)',
    textLight: '#b91c1c',
    textDark: '#f87171',
    borderLight: 'rgba(239, 68, 68, 0.35)',
    borderDark: 'rgba(239, 68, 68, 0.3)',
  },
  secondary: {
    bgLight: 'rgba(100, 116, 139, 0.14)',
    bgDark: 'rgba(148, 163, 184, 0.2)',
    textLight: '#475569',
    textDark: '#cbd5e1',
    borderLight: 'rgba(100, 116, 139, 0.35)',
    borderDark: 'rgba(148, 163, 184, 0.3)',
  },
};

/**
 * KpiMetricBadge Component
 * Replaces the generic text badge in KPI cards with a dedicated circular icon shape badge.
 *
 * @param {string} metricKey - The metric identifier (e.g. 'totalSpend', 'conversions')
 * @param {string} [color] - Optional color theme override
 * @param {string} [label] - Optional tooltip label
 * @param {number} [size=34] - Diameter of the circular badge in px
 * @param {string} [className] - Additional CSS classes
 */
export default function KpiMetricBadge({
  metricKey = '',
  color,
  label,
  size = 34,
  className = '',
}) {
  const normalizedKey = String(metricKey || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const config = METRIC_CONFIG[normalizedKey] || {
    icon: normalizedKey,
    color: color || 'primary',
    label: label || metricKey,
  };

  const activeColor = color || config.color || 'primary';
  const colorToken = COLOR_STYLES[activeColor] || COLOR_STYLES.primary;
  const tooltipText = label || config.label || metricKey;
  const iconSize = Math.max(16, Math.round(size * 0.52));

  return (
    <div
      className={`kpi-metric-badge rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 shadow-sm ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        cursor: 'default',
      }}
      title={tooltipText}
    >
      <style>{`
        .kpi-metric-badge-${normalizedKey} {
          background-color: ${colorToken.bgLight};
          color: ${colorToken.textLight};
          border: 1px solid ${colorToken.borderLight};
        }
        [data-bs-theme="dark"] .kpi-metric-badge-${normalizedKey},
        .dark .kpi-metric-badge-${normalizedKey} {
          background-color: ${colorToken.bgDark};
          color: ${colorToken.textDark};
          border: 1px solid ${colorToken.borderDark};
        }
        .kpi-metric-badge:hover {
          transform: scale(1.08);
        }
      `}</style>
      <span className={`w-100 h-100 rounded-circle d-inline-flex align-items-center justify-content-center kpi-metric-badge-${normalizedKey}`}>
        <MetricIcon iconKey={config.icon} size={iconSize} />
      </span>
    </div>
  );
}
