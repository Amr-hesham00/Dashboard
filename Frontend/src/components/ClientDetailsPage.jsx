import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import ApexCharts from 'apexcharts';
import DashboardLayout from './DashboardLayout';
import ClientAvatar from './ClientAvatar';
import {
  getClientByIdApi,
  getUsersApi,
  updateClientApi,
  getClientStatusesApi,
  getClientCurrenciesApi,
  getClientTargetsApi,
  updateClientTargetsApi,
  uploadClientLogoApi,
} from '../api/clients';
import {
  getCampaignsByClientIdApi,
  getClientOverviewPageDataApi,
  getCampaignsByPlatformApi,
} from '../api/campaigns';
import {
  availableKPIs,
  defaultPinnedKPIs,
  aggregateTimeSeriesByMonth,
} from '../mock/mockData';
import metaIcon from '../assets/meta-icon.webp';
import KpiMetricBadge from './KpiMetricBadge';
import PeriodSelector, { getPresetDates } from './PeriodSelector';

// ─── ApexCharts React Wrapper ───────────────────────────────────────
function ApexChart({ options, series, type, height = 310 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const prevOptionsJsonRef = useRef('');

  useEffect(() => {
    if (!chartRef.current) return;

    const mergedOptions = {
      ...options,
      legend: { ...(options?.legend || {}), show: false },
      chart: {
        ...(options?.chart || {}),
        type,
        height,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      series: series || [],
    };

    const optionsJson = JSON.stringify({ ...mergedOptions, series: undefined });

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, mergedOptions);
      chartInstance.current.render().catch(() => { });
      prevOptionsJsonRef.current = optionsJson;
    } else {
      if (prevOptionsJsonRef.current !== optionsJson) {
        prevOptionsJsonRef.current = optionsJson;
        chartInstance.current.updateOptions(mergedOptions, false, true, true);
      } else if (series) {
        chartInstance.current.updateSeries(series, true);
      }
    }
  }, [options, series, type, height]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
        } catch {
          // ignore
        }
        chartInstance.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} />;
}

// ─── SVG Icon Helpers ───────────────────────────────────────────────
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /></svg>
);
const IconShare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><line x1="8.7" y1="10.7" x2="15.3" y2="7.3" /><line x1="8.7" y1="13.3" x2="15.3" y2="16.7" /></svg>
);
const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15l2 -2l2 2l2 -2" /></svg>
);
const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'spin-icon' : ''}><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
);
const IconGear = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.573 1.066c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.066 -2.573c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.573 -1.066z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7l7 0l0 7" /></svg>
);
const IconDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6l4 -4l8 8" /><path d="M21 10l0 7l-7 0" /></svg>
);
const IconPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" /><line x1="9" y1="15" x2="4.5" y2="19.5" /><line x1="14.5" y1="4" x2="20" y2="9.5" /></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><line x1="10" y1="14" x2="21" y2="3" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>
);

function getPlatformLogo(platformKey, size = 20) {
  switch (platformKey?.toLowerCase()) {
    case 'meta':
      return (
        <img
          src={metaIcon}
          alt="Meta Ads"
          width={size}
          height={size}
          style={{ objectFit: 'contain', display: 'inline-block' }}
          title="Meta Ads"
        />
      );
    case 'google':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" title="Google Ads">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" title="Snapchat Ads">
          <rect width="24" height="24" rx="5.5" fill="#FFFC00" />
          <path
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1.1"
            strokeLinejoin="round"
            d="M12 4.3c-2.9 0-4.7 2.1-4.7 4.5 0 .6.1 1.2.2 1.7.1.3-.1.4-.2.5-.5.2-1.2.4-1.2 1.2 0 .5.4.8 1 .9.3 0 .4.2.3.4-.1.6-.5 1.6-1.3 1.9-.3.1-.4.4-.4.6 0 .3.3.5.8.7 1.1.3 2.3-.1 2.8-.3.3-.1.5 0 .5.2.3.9 1.2 1 2.1 1s1.8-.1 2.1-1c.1-.2.3-.3.5-.2.5.2 1.7.6 2.8.3.5-.2.8-.4.8-.7 0-.2-.1-.5-.4-.6-.8-.3-1.2-1.3-1.3-1.9-.1-.2.1-.3.3-.4.6-.1 1-.4 1-.9 0-.8-.7-1-1.2-1.2-.2-.1-.3-.2-.2-.5.1-.5.2-1.1.2-1.7C16.7 6.4 14.9 4.3 12 4.3z"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" title="TikTok Ads">
          <rect width="24" height="24" rx="5.5" fill="#010101" />
          <g transform="translate(1.5, 1.5) scale(0.88)">
            <path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z" />
            <path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z" />
            <path fill="#FFFFFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

// ─── Currency Helpers ──────────────────────────────────────────────
function getCurrencyName(currency) {
  if (!currency && currency !== 0) return 'USD';
  if (typeof currency === 'string') return currency;
  const list = ['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR'];
  return list[currency] || 'USD';
}

function getCurrencySymbol(currency) {
  if (!currency && currency !== 0) return '$';
  const c = typeof currency === 'number' ? getCurrencyName(currency) : String(currency).toUpperCase();
  switch (c) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'AED': return 'AED ';
    case 'SAR': return 'SAR ';
    case 'CAD': return 'C$';
    case 'AUD': return 'A$';
    case 'EGP':
    case 'EGY': return 'EGP ';
    case 'KWD': return 'KWD ';
    case 'QAR': return 'QAR ';
    default: return `${c} `;
  }
}

// ─── KPI Formatter ──────────────────────────────────────────────────
function formatKPIValue(value, format, currency = 'USD') {
  if (value == null) return '—';
  const sym = getCurrencySymbol(currency);
  switch (format) {
    case 'currency':
      return `${sym}${value >= 100 ? Math.round(value).toLocaleString('en-US') : Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent': return `${value.toFixed(2)}%`;
    case 'multiplier': return `${value.toFixed(2)}x`;
    case 'number': return value >= 1000000 ? `${(value / 1000000).toFixed(2)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
    case 'decimal': return value.toFixed(2);
    default: return String(value);
  }
}

// ─── Tab Definitions (Descriptive Icons & Clean Titles) ─────────────
const TABS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="8" rx="1" /><rect x="4" y="16" width="6" height="4" rx="1" /><rect x="14" y="12" width="6" height="8" rx="1" /><rect x="14" y="4" width="6" height="4" rx="1" /></svg>
    ),
  },
  {
    key: 'meta',
    label: 'Meta Ads',
    icon: (
      <img
        src={metaIcon}
        alt="Meta Ads"
        width={20}
        height={20}
        style={{ objectFit: 'contain', display: 'inline-block' }}
      />
    ),
  },
  {
    key: 'google',
    label: 'Google Ads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
      </svg>
    ),
  },
  {
    key: 'snapchat',
    label: 'Snapchat Ads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="5.5" fill="#FFFC00" />
        <path
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1.1"
          strokeLinejoin="round"
          d="M12 4.3c-2.9 0-4.7 2.1-4.7 4.5 0 .6.1 1.2.2 1.7.1.3-.1.4-.2.5-.5.2-1.2.4-1.2 1.2 0 .5.4.8 1 .9.3 0 .4.2.3.4-.1.6-.5 1.6-1.3 1.9-.3.1-.4.4-.4.6 0 .3.3.5.8.7 1.1.3 2.3-.1 2.8-.3.3-.1.5 0 .5.2.3.9 1.2 1 2.1 1s1.8-.1 2.1-1c.1-.2.3-.3.5-.2.5.2 1.7.6 2.8.3.5-.2.8-.4.8-.7 0-.2-.1-.5-.4-.6-.8-.3-1.2-1.3-1.3-1.9-.1-.2.1-.3.3-.4.6-.1 1-.4 1-.9 0-.8-.7-1-1.2-1.2-.2-.1-.3-.2-.2-.5.1-.5.2-1.1.2-1.7C16.7 6.4 14.9 4.3 12 4.3z"
        />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok Ads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="5.5" fill="#010101" />
        <g transform="translate(1.5, 1.5) scale(0.88)">
          <path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z" />
          <path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z" />
          <path fill="#FFFFFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z" />
        </g>
      </svg>
    ),
  },
  {
    key: 'insights',
    label: 'Insights & Recommendations',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
        <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
        <path d="M9.7 17l4.6 0" />
      </svg>
    ),
  },
  {
    key: 'notes',
    label: 'Notes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 14h6" /><path d="M9 17h4" /></svg>
    ),
  },
];

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'];

export const TAB_ROUTE_MAP = {
  meta: 'Meta',
  tiktok: 'TikTok',
  google: 'Google',
  snapchat: 'Snapchat',
  insights: 'Insights',
  notes: 'Notes',
};

export const ROUTE_TAB_MAP = {
  meta: 'meta',
  tiktok: 'tiktok',
  google: 'google',
  snapchat: 'snapchat',
  insights: 'insights',
  notes: 'notes',
  overview: 'overview',
};

const CAMPAIGN_STATUSES = ['Draft', 'PendingReview', 'Active', 'Paused', 'Completed', 'Rejected', 'Archived'];
const getCampaignStatusName = (status) => typeof status === 'number' ? CAMPAIGN_STATUSES[status] || 'Active' : String(status || 'Active');

const CAMPAIGN_OBJECTIVES = ['Awareness', 'Traffic', 'Engagement', 'Leads', 'AppPromotion', 'Sales'];
const getCampaignObjectiveName = (obj) => typeof obj === 'number' ? CAMPAIGN_OBJECTIVES[obj] || 'Sales' : String(obj || 'Sales');

const mapPlatformTypeToKey = (type, name) => {
  const checkStr = (val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower.includes('google')) return 'google';
      if (lower.includes('facebook') || lower.includes('meta')) return 'meta';
      if (lower.includes('tiktok')) return 'tiktok';
      if (lower.includes('snapchat') || lower.includes('snap')) return 'snapchat';
    }
    return null;
  };
  const fromType = checkStr(type);
  if (fromType) return fromType;
  const fromName = checkStr(name);
  if (fromName) return fromName;

  switch (Number(type)) {
    case 0: return 'google';
    case 1: return 'meta';
    case 2: return 'tiktok';
    case 3: return 'snapchat';
    default: return 'meta';
  }
};

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════

export default function ClientDetailsPage() {
  const { id: paramId, clientId: paramClientId, tab } = useParams();
  const id = paramClientId || paramId || null;
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Core Data ──────────────────────────────────────────────────
  const [client, setClient] = useState(null);
  const [manager, setManager] = useState(null);
  const [realCampaigns, setRealCampaigns] = useState([]);
  const [overviewPoints, setOverviewPoints] = useState([]);
  const [overviewPlatformRows, setOverviewPlatformRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Edit Client Modal State ─────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const logoInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState(['Active', 'Inactive', 'Lead', 'Archived']);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR']);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    currency: 0,
    status: 0,
    notes: '',
    managerId: '',
    logo: '',
    countryCode: '+1',
  });

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, SVG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Image size exceeds 5MB limit.');
      return;
    }

    try {
      setLogoUploading(true);
      setLogoUploadError('');
      const res = await uploadClientLogoApi(file);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, logo: res.url }));
      }
    } catch (err) {
      setLogoUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // ─── UI State ───────────────────────────────────────────────────
  const searchTab = new URLSearchParams(location.search).get('tab');
  const getInitialTab = () => {
    if (tab) {
      const lower = tab.toLowerCase();
      if (ROUTE_TAB_MAP[lower]) return ROUTE_TAB_MAP[lower];
      if (lower === 'tabs') return 'meta';
    }
    if (searchTab && ROUTE_TAB_MAP[searchTab.toLowerCase()]) {
      return ROUTE_TAB_MAP[searchTab.toLowerCase()];
    }
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (tab) {
      const lower = tab.toLowerCase();
      if (ROUTE_TAB_MAP[lower]) {
        setActiveTab(ROUTE_TAB_MAP[lower]);
        return;
      }
      if (lower === 'tabs') {
        setActiveTab('meta');
        return;
      }
    }
    const qTab = new URLSearchParams(location.search).get('tab');
    if (qTab && ROUTE_TAB_MAP[qTab.toLowerCase()]) {
      setActiveTab(ROUTE_TAB_MAP[qTab.toLowerCase()]);
    } else if (!tab) {
      setActiveTab('overview');
    }
  }, [tab, location.pathname, location.search]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'overview') {
      navigate(`/clients/${id}`);
    } else {
      const routeSegment = TAB_ROUTE_MAP[key] || key;
      navigate(`/clients/${id}/${routeSegment}`);
    }
  };
  const [periodConfig, setPeriodConfig] = useState(() => getPresetDates('Last 30 Days'));
  const dateRange = periodConfig.label;
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // ─── Spend vs Revenue Chart Selectable Metrics State ──────────────
  const [selectedMetrics, setSelectedMetrics] = useState(['spend', 'revenue']);

  const CHART_METRICS = {
    spend: { label: 'Spend', color: '#e11d48', type: 'currency' },
    revenue: { label: 'Revenue', color: '#00a76f', type: 'currency' },
    conversions: { label: 'Conversions', color: '#8b5cf6', type: 'number' },
    impressions: { label: 'Impressions', color: '#06b6d4', type: 'number' },
    clicks: { label: 'Clicks', color: '#f59e0b', type: 'number' },
    roas: { label: 'ROAS', color: '#0d9488', type: 'ratio' },
  };

  const handleMetricToggle = (key) => {
    const isFinancial = key === 'spend' || key === 'revenue';
    setSelectedMetrics((prev) => {
      const hasNonFinancial = prev.some((m) => m !== 'spend' && m !== 'revenue');
      if (isFinancial) {
        if (hasNonFinancial) {
          return key === 'spend' ? ['spend', 'revenue'] : ['revenue', 'spend'];
        }
        if (prev.includes(key)) {
          if (prev.length === 1) return prev;
          return prev.filter((m) => m !== key);
        } else {
          return ['spend', 'revenue'];
        }
      } else {
        return [key];
      }
    });
  };

  // ─── KPI State ──────────────────────────────────────────────────
  const storageKey = `pinnedKPIs_${id}`;
  const [pinnedKPIs, setPinnedKPIs] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return defaultPinnedKPIs;
      const parsed = JSON.parse(saved);
      return parsed.map((k) => (k === 'totalSpend' ? 'spend' : k === 'totalRevenue' ? 'revenue' : k));
    } catch {
      return defaultPinnedKPIs;
    }
  });
  const [showKPISelector, setShowKPISelector] = useState(false);

  // ─── Target Settings State ─────────────────────────────────────
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetSettings, setTargetSettings] = useState({
    monthlyBudget: 50000,
    targetRoas: 4.0,
    targetCpa: 5.5,
    currency: 'USD',
    targetRevenue: 200000,
    targetConversions: 9000,
  });
  const [targetFormData, setTargetFormData] = useState(targetSettings);
  const [targetSaving, setTargetSaving] = useState(false);
  const [targetError, setTargetError] = useState('');

  // ─── Platform Connection State ──────────────────────────────────
  const getDefaultPlatforms = () => ({
    meta: { connected: true, accountId: 'act_948291048', lastSync: '10m ago', lastSyncDate: 'Aug 18, 2026, 04:30 PM' },
    google: { connected: true, accountId: '839-201-9482', lastSync: '25m ago', lastSyncDate: 'Aug 18, 2026, 04:15 PM' },
    snapchat: { connected: true, accountId: 'org_snap_88291', lastSync: '1h ago', lastSyncDate: 'Aug 18, 2026, 03:40 PM' },
    tiktok: { connected: true, accountId: 'tt_adv_7194819', lastSync: '40m ago', lastSyncDate: 'Aug 18, 2026, 04:00 PM' },
  });

  const overviewSyncStorageKey = `client_overview_sync_${id}`;
  const [overviewLastSync, setOverviewLastSync] = useState(() => {
    try {
      const saved = localStorage.getItem(overviewSyncStorageKey);
      return saved ? JSON.parse(saved) : { lastSync: '10m ago', lastSyncDate: 'Aug 18, 2026, 04:30 PM' };
    } catch {
      return { lastSync: '10m ago', lastSyncDate: 'Aug 18, 2026, 04:30 PM' };
    }
  });

  const platformsStorageKey = `client_platforms_${id}`;
  const [platformsState, setPlatformsState] = useState(() => {
    try {
      const saved = localStorage.getItem(platformsStorageKey);
      return saved ? JSON.parse(saved) : getDefaultPlatforms();
    } catch {
      return getDefaultPlatforms();
    }
  });
  const [platformRefreshing, setPlatformRefreshing] = useState({});

  // ─── Tab-Level Caching & Independent Fetching State ──────────────
  // Cache dictionary scoped by `${id}_${tabKey}_${startDate || ''}_${endDate || ''}`
  const tabDataCacheRef = useRef({});
  const inFlightRequestsRef = useRef({});

  // Platform tab states: loading, error, data per platformKey ('meta', 'google', 'snapchat', 'tiktok')
  const [platformTabState, setPlatformTabState] = useState({});

  // ─── Fetch Shared Client Info (Header, targets, static options) ────
  const sharedClientLoadedRef = useRef(null);

  const loadSharedClientInfo = useCallback(async (clientIdToLoad, explicitClientData = null) => {
    if (!clientIdToLoad || clientIdToLoad === 'cli-101') return null;
    try {
      const [statusList, currList, usersList] = await Promise.all([
        getClientStatusesApi().catch(() => ['Active', 'Inactive', 'Lead', 'Archived']),
        getClientCurrenciesApi().catch(() => ['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR']),
        getUsersApi().catch(() => []),
      ]);

      if (Array.isArray(statusList) && statusList.length) setStatuses(statusList);
      if (Array.isArray(currList) && currList.length) setCurrencies(currList);
      if (Array.isArray(usersList)) setUsers(usersList);

      const clientData = explicitClientData;
      if (clientData) {
        const rawClientObj = clientData?.client || clientData;
        const normalized = {
          ...rawClientObj,
          id: rawClientObj?.id ?? rawClientObj?.clientId ?? clientIdToLoad,
          clientId: rawClientObj?.clientId ?? rawClientObj?.id ?? clientIdToLoad,
          companyName: rawClientObj?.companyName || rawClientObj?.name || '',
          platforms: clientData.platforms || rawClientObj?.platforms || [],
        };
        setClient((prev) => ({
          ...(prev || {}),
          ...normalized,
          platforms: normalized.platforms || prev?.platforms || [],
        }));

        const found = usersList?.find((u) => String(u.id) === String(normalized?.managerId));
        setManager(found || (normalized?.managerId ? { id: normalized.managerId, userName: normalized.managerName || 'Account Manager', email: '', firstName: '', lastName: '' } : null));

        if (normalized?.notes) {
          setNotes([
            {
              id: 'note-1',
              text: normalized.notes,
              author: normalized.managerName || 'Account Manager',
              role: 'Manager',
              date: normalized.createdAt ? new Date(normalized.createdAt).toLocaleDateString() : 'Initial Note',
            },
          ]);
        }
        return normalized;
      }
      return null;
    } catch (err) {
      console.error('Failed to load shared client info:', err);
      return null;
    }
  }, []);

  // ─── Fetch Overview Tab Data ─────────────────────────────────────
  const loadOverviewData = useCallback(async (forceRefresh = false) => {
    if (!id || id === 'cli-101') return;
    const startDate = periodConfig.startDate || null;
    const endDate = periodConfig.endDate || null;
    const cacheKey = `${id}_overview_${startDate || ''}_${endDate || ''}`;

    if (!forceRefresh && tabDataCacheRef.current[cacheKey]) {
      const cached = tabDataCacheRef.current[cacheKey];
      setClient((prev) => ({ ...(prev || {}), ...cached.client }));
      setRealCampaigns(cached.realCampaigns || []);
      setOverviewPoints(cached.overviewPoints || []);
      setOverviewPlatformRows(cached.overviewPlatformRows || []);
      if (cached.target) {
        setTargetSettings(cached.target);
        setTargetFormData(cached.target);
      }
      return;
    }

    if (inFlightRequestsRef.current[cacheKey]) {
      return inFlightRequestsRef.current[cacheKey];
    }

    const fetchPromise = (async () => {
      try {
        setLoading(true);
        setError('');
        const overviewData = await getClientOverviewPageDataApi(id, startDate, endDate).catch(() => null);

        let finalClient = overviewData?.client || null;
        if (!finalClient) {
          setError(`Client with ID ${id} not found.`);
          setClient(null);
          return;
        }

        if (overviewData?.client) {
          loadSharedClientInfo(id, overviewData.client);
        }

        const rawClientObj = (overviewData?.client) || (finalClient?.client) || finalClient;
        const normalizedClient = {
          ...rawClientObj,
          id: rawClientObj?.id ?? rawClientObj?.clientId ?? id,
          clientId: rawClientObj?.clientId ?? rawClientObj?.id ?? id,
          companyName: rawClientObj?.companyName || rawClientObj?.name || '',
          spend: overviewData?.spend ?? rawClientObj?.spend ?? 0,
          revenue: overviewData?.revenue ?? rawClientObj?.revenue ?? 0,
          impressions: overviewData?.impressions ?? rawClientObj?.impressions ?? 0,
          clicks: overviewData?.clicks ?? rawClientObj?.clicks ?? 0,
          conversions: overviewData?.conversions ?? rawClientObj?.conversions ?? 0,
          roas: overviewData?.roas ?? rawClientObj?.roas ?? 0,
          actualROAS: overviewData?.roas ?? rawClientObj?.actualROAS ?? rawClientObj?.roas ?? 0,
          ctr: overviewData?.ctr ?? rawClientObj?.ctr ?? 0,
          cpc: overviewData?.cpc ?? rawClientObj?.cpc ?? 0,
          cpm: overviewData?.cpm ?? rawClientObj?.cpm ?? 0,
          cpa: overviewData?.cpa ?? rawClientObj?.cpa ?? 0,
          conversionRate: overviewData?.conversionRate ?? rawClientObj?.conversionRate ?? 0,
          currency: overviewData?.currency ?? rawClientObj?.currency ?? 0,
        };

        let mappedCampaigns = [];
        let mappedPoints = [];
        let mappedPlatformRows = [];

        if (overviewData) {
          if (Array.isArray(overviewData.campRow)) {
            mappedCampaigns = overviewData.campRow.map((c) => ({
              ...c,
              id: c.campaignId ?? c.id,
              name: c.campaignName ?? c.name,
              platformType: c.platform != null ? c.platform : c.platformType,
              platformName: c.platform != null ? c.platform : c.platformName,
            }));
          }
          if (Array.isArray(overviewData.points)) mappedPoints = overviewData.points;
          if (Array.isArray(overviewData.platformRow)) mappedPlatformRows = overviewData.platformRow;
          if (overviewData.target) {
            setTargetSettings(overviewData.target);
            setTargetFormData(overviewData.target);
          }
        }

        setClient((prev) => ({
          ...(prev || {}),
          ...normalizedClient,
          platforms: prev?.platforms || normalizedClient.platforms || [],
        }));
        setRealCampaigns(mappedCampaigns);
        setOverviewPoints(mappedPoints);
        setOverviewPlatformRows(mappedPlatformRows);

        tabDataCacheRef.current[cacheKey] = {
          client: normalizedClient,
          realCampaigns: mappedCampaigns,
          overviewPoints: mappedPoints,
          overviewPlatformRows: mappedPlatformRows,
          target: overviewData?.target || null,
        };
      } catch (err) {
        setError(err.message || 'Failed to load client overview.');
      } finally {
        setLoading(false);
        delete inFlightRequestsRef.current[cacheKey];
      }
    })();

    inFlightRequestsRef.current[cacheKey] = fetchPromise;
    return fetchPromise;
  }, [id, periodConfig.startDate, periodConfig.endDate]);

  const clientRef = useRef(client);
  clientRef.current = client;

  const overviewPlatformRowsRef = useRef(overviewPlatformRows);
  overviewPlatformRowsRef.current = overviewPlatformRows;

  // ─── Fetch Platform Tab Data (Meta, Google, Snapchat, TikTok) ────
  const loadPlatformData = useCallback(async (platformKey, forceRefresh = false) => {
    if (!id || id === 'cli-101' || !['meta', 'google', 'snapchat', 'tiktok'].includes(platformKey)) return;

    const startDate = periodConfig.startDate || null;
    const endDate = periodConfig.endDate || null;
    const cacheKey = `${id}_${platformKey}_${startDate || ''}_${endDate || ''}`;

    if (!forceRefresh && tabDataCacheRef.current[cacheKey]) {
      const cached = tabDataCacheRef.current[cacheKey];
      setPlatformTabState((prev) => ({
        ...prev,
        [platformKey]: { loading: false, error: null, data: cached },
      }));
      return;
    }

    if (inFlightRequestsRef.current[cacheKey]) {
      return inFlightRequestsRef.current[cacheKey];
    }

    // Set loading state for this tab only
    setPlatformTabState((prev) => ({
      ...prev,
      [platformKey]: {
        loading: true,
        error: null,
        data: prev[platformKey]?.data || null,
      },
    }));

    const fetchPromise = (async () => {
      try {
        // Resolve platformId from client.platforms or overviewPlatformRows or fetch client details if missing
        let currentClient = clientRef.current;
        let platformRecord = currentClient?.platforms?.find((p) => {
          const k = mapPlatformTypeToKey(p.platformType || p.key, p.platformName);
          return k === platformKey;
        });

        let platformId = platformRecord?.id ?? platformRecord?.platformId;

        // Check overviewPlatformRows if not found in currentClient.platforms
        if (!platformId && Array.isArray(overviewPlatformRowsRef.current)) {
          const row = overviewPlatformRowsRef.current.find((r) => {
            const k = mapPlatformTypeToKey(r.platformName ?? r.platformType);
            return k === platformKey;
          });
          if (row) {
            platformId = row.platformId;
            platformRecord = platformRecord || {
              id: row.platformId,
              platformId: row.platformId,
              platformName: row.platformName,
              platformType: row.platformName,
              connected: true,
            };
          }
        }

        // If still not resolved, attempt to load full client details from backend
        if (!platformId) {
          currentClient = await loadSharedClientInfo(id);
          platformRecord = currentClient?.platforms?.find((p) => {
            const k = mapPlatformTypeToKey(p.platformType || p.key, p.platformName);
            return k === platformKey;
          });
          platformId = platformRecord?.id ?? platformRecord?.platformId;
        }

        if (!platformId) {
          // If no platform ID exists, fallback to empty / not configured
          const emptyData = {
            currency: 'USD',
            campaigns: [],
            kpis: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, cpc: 0, cpm: 0, conversionRate: 0 },
            connected: platformRecord?.connected ?? false,
          };
          tabDataCacheRef.current[cacheKey] = emptyData;
          setPlatformTabState((prev) => ({
            ...prev,
            [platformKey]: { loading: false, error: null, data: emptyData },
          }));
          return;
        }

        const pData = await getCampaignsByPlatformApi(id, platformId, startDate, endDate);

        if (!pData) {
          throw new Error(`Failed to load ${platformKey} data.`);
        }

        // Map backend PlatformPageDTO to platform structure
        const mappedCampaigns = Array.isArray(pData.campRow)
          ? pData.campRow.map((c) => ({
            ...c,
            id: c.campaignId ?? c.id,
            name: c.campaignName ?? c.name,
            platformType: c.platform != null ? c.platform : c.platformType,
            platformName: c.platform != null ? c.platform : c.platformName,
            status: c.status,
            objective: c.objective,
            spend: Number(c.spend) || 0,
            revenue: Number(c.revenue) || 0,
            roas: Number(c.roas) || 0,
            startDate: c.startDate,
          }))
          : [];

        const currencyName = getCurrencyName(pData.currency);

        const structuredData = {
          currency: currencyName,
          platformId,
          connected: platformRecord?.connected ?? (platformRecord?.status === 'Connected'),
          campaigns: mappedCampaigns,
          kpis: {
            spend: Number(pData.spend) || 0,
            revenue: Number(pData.revenue) || 0,
            roas: Number(pData.roas) || 0,
            impressions: Number(pData.impressions) || 0,
            clicks: Number(pData.clicks) || 0,
            ctr: Number(pData.ctr) || 0,
            cpc: Number(pData.cpc) || 0,
            cpm: Number(pData.cpm) || 0,
            cpa: Number(pData.cpa) || 0,
            conversions: Number(pData.conversions) || 0,
            conversionRate: Number(pData.conversionRate) || 0,
          },
        };

        tabDataCacheRef.current[cacheKey] = structuredData;
        setPlatformTabState((prev) => ({
          ...prev,
          [platformKey]: { loading: false, error: null, data: structuredData },
        }));
      } catch (err) {
        setPlatformTabState((prev) => ({
          ...prev,
          [platformKey]: { loading: false, error: err.message || 'Failed to fetch platform data', data: null },
        }));
      } finally {
        delete inFlightRequestsRef.current[cacheKey];
      }
    })();

    inFlightRequestsRef.current[cacheKey] = fetchPromise;
    return fetchPromise;
  }, [id, periodConfig.startDate, periodConfig.endDate, loadSharedClientInfo]);

  // Initial client load & reload on id change
  useEffect(() => {
    if (id && sharedClientLoadedRef.current !== id) {
      sharedClientLoadedRef.current = id;
      loadSharedClientInfo(id);
    }
  }, [id, loadSharedClientInfo]);

  // ─── Lazy Loading Effect: only load active tab's data ─────────────
  useEffect(() => {
    if (!id || id === 'cli-101') return;
    if (activeTab === 'overview') {
      loadOverviewData();
    } else if (['meta', 'google', 'snapchat', 'tiktok'].includes(activeTab)) {
      loadPlatformData(activeTab);
    }
  }, [activeTab, id, periodConfig.startDate, periodConfig.endDate, loadOverviewData, loadPlatformData]);

  const handleRefreshPlatform = async (platformKey) => {
    setPlatformRefreshing((prev) => ({ ...prev, [platformKey]: true }));
    try {
      await loadPlatformData(platformKey, true);
      const now = 'Just now';
      const nowDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      setPlatformsState((prev) => {
        const current = prev[platformKey] || {};
        const updated = {
          ...prev,
          [platformKey]: {
            ...current,
            connected: true,
            lastSync: now,
            lastSyncDate: nowDate,
          },
        };
        try { localStorage.setItem(platformsStorageKey, JSON.stringify(updated)); } catch { }
        return updated;
      });
      const platformLabel = TABS.find((t) => t.key === platformKey)?.label || platformKey;
      setToastMsg(`${platformLabel} data refreshed successfully!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch {
      setToastMsg(`Failed to refresh ${platformKey} data.`);
    } finally {
      setPlatformRefreshing((prev) => ({ ...prev, [platformKey]: false }));
    }
  };

  const handleReconnectPlatform = (platformKey) => {
    setPlatformsState((prev) => {
      const current = prev[platformKey] || {};
      const updated = {
        ...prev,
        [platformKey]: {
          ...current,
          connected: true,
          lastSync: 'Just now',
          lastSyncDate: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
      };
      try {
        localStorage.setItem(platformsStorageKey, JSON.stringify(updated));
      } catch { }
      return updated;
    });
    const platformLabel = TABS.find((t) => t.key === platformKey)?.label || platformKey;
    setToastMsg(`${platformLabel} reconnected successfully!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // ─── Notes & Overview Campaigns State ───────────────────────────
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('');
  const [overviewStatusFilter, setOverviewStatusFilter] = useState('all');

  // ─── Overview Campaigns Table Filter Menu State ──────────────────
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  const [overviewFilters, setOverviewFilters] = useState({
    platform: 'ALL',
    status: 'ALL',
    objective: 'ALL',
  });

  const [draftOverviewFilters, setDraftOverviewFilters] = useState({
    platform: 'ALL',
    status: 'ALL',
    objective: 'ALL',
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleFilterMenu = () => {
    if (!showFilterMenu) {
      setDraftOverviewFilters({
        platform: overviewFilters.platform,
        status: overviewFilters.status !== 'ALL' ? overviewFilters.status : overviewStatusFilter !== 'all' ? overviewStatusFilter : 'ALL',
        objective: overviewFilters.objective,
      });
    }
    setShowFilterMenu((prev) => !prev);
  };

  const handleApplyFilterMenu = (e) => {
    if (e) e.preventDefault();
    setOverviewFilters({ ...draftOverviewFilters });
    if (draftOverviewFilters.status !== undefined) setOverviewStatusFilter(draftOverviewFilters.status.toLowerCase());
    setShowFilterMenu(false);
  };

  const handleResetFilterMenu = () => {
    const reset = { platform: 'ALL', status: 'ALL', objective: 'ALL' };
    setDraftOverviewFilters(reset);
    setOverviewFilters(reset);
    setOverviewSearchQuery('');
    setOverviewStatusFilter('all');
    setShowFilterMenu(false);
  };

  const activeOverviewFiltersCount = [
    overviewFilters.platform !== 'ALL' ? 1 : 0,
    (overviewFilters.status !== 'ALL' || overviewStatusFilter !== 'all') ? 1 : 0,
    overviewFilters.objective !== 'ALL' ? 1 : 0,
    overviewSearchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ─── Overview Campaigns Table Sorting State ─────────────────────
  const [overviewSortField, setOverviewSortField] = useState('spend'); // 'spend' | 'revenue' | 'roas' | 'startDate'
  const [overviewSortOrder, setOverviewSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleOverviewSort = (field) => {
    if (overviewSortField === field) {
      setOverviewSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOverviewSortField(field);
      setOverviewSortOrder('desc');
    }
  };

  const renderSortIndicator = (field) => {
    const isActive = overviewSortField === field;
    if (!isActive) return null;

    return (
      <span className="d-inline-flex align-items-center ms-1 text-primary">
        {overviewSortOrder === 'asc' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        )}
      </span>
    );
  };

  // ─── Tabs Navigation Drag, Wheel & Scroll Handlers ──────────────
  const tabsContainerRef = useRef(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const hasMovedDragRef = useRef(false);

  const handleTabScroll = (direction) => {
    if (tabsContainerRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleTabsMouseDown = (e) => {
    if (!tabsContainerRef.current || e.button !== 0) return;
    isMouseDownRef.current = true;
    hasMovedDragRef.current = false;
    dragStartXRef.current = e.pageX - tabsContainerRef.current.offsetLeft;
    dragScrollLeftRef.current = tabsContainerRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e) => {
    if (!isMouseDownRef.current || !tabsContainerRef.current) return;
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasMovedDragRef.current = true;
      if (!isDraggingTabs) setIsDraggingTabs(true);
      e.preventDefault();
      tabsContainerRef.current.scrollLeft = dragScrollLeftRef.current - walk;
    }
  };

  const handleTabsMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    if (isDraggingTabs) {
      setTimeout(() => {
        setIsDraggingTabs(false);
        hasMovedDragRef.current = false;
      }, 50);
    }
  };

  const handleTabsWheel = (e) => {
    if (!tabsContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      e.preventDefault();
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };



  const targetSettingsRef = useRef(targetSettings);
  targetSettingsRef.current = targetSettings;

  // Open targets modal if redirected with openTargets parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('openTargets') === 'true' || location.state?.openTargets) {
      handleOpenTargetModal();
    }
  }, [location.search, location.state]);

  // Click outside handlers for main page dropdowns
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Check KPI selector
      if (showKPISelector) {
        const kpiBtn = e.target.closest('.kpi-selector-container');
        if (!kpiBtn) setShowKPISelector(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [showKPISelector]);

  // ─── Persist pinned KPIs ────────────────────────────────────────
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(pinnedKPIs)); }, [pinnedKPIs, storageKey]);

  // ─── Get KPI values & Trend Data for this client ─────────────────
  const clientKPIs = useMemo(() => {
    // Consume backend-calculated metrics directly from client
    if (client) {
      const sp = Number(client.spend) || 0;
      const rev = Number(client.revenue) || 0;
      const clk = Number(client.clicks) || 0;
      const imp = Number(client.impressions) || 0;
      const conv = Number(client.conversions) || 0;
      const ctrVal = Number(client.ctr) || (imp > 0 ? (clk / imp) * 100 : 0);
      const cpcVal = Number(client.cpc) || (clk > 0 ? sp / clk : 0);
      const cpmVal = Number(client.cpm) || (imp > 0 ? (sp / imp) * 1000 : 0);
      const cpaVal = Number(client.cpa) || (conv > 0 ? sp / conv : 0);
      const convRateVal = Number(client.conversionRate) || (clk > 0 ? (conv / clk) * 100 : 0);
      const roasVal = client.roas !== undefined && client.roas !== null
        ? Number(client.roas)
        : (sp > 0 ? rev / sp : (Number(client.actualROAS) || 0));

      return {
        spend: { value: sp, change: 0 },
        totalSpend: { value: sp, change: 0 },
        revenue: { value: rev, change: 0 },
        totalRevenue: { value: rev, change: 0 },
        roas: { value: roasVal, change: 0 },
        impressions: { value: imp, change: 0 },
        clicks: { value: clk, change: 0 },
        conversions: { value: conv, change: 0 },
        ctr: { value: ctrVal, change: 0 },
        cpc: { value: cpcVal, change: 0 },
        cpm: { value: cpmVal, change: 0 },
        cpa: { value: cpaVal, change: 0 },
        conversionRate: { value: convRateVal, change: 0 },
      };
    }
    return {
      spend: { value: 0, change: 0 },
      totalSpend: { value: 0, change: 0 },
      revenue: { value: 0, change: 0 },
      totalRevenue: { value: 0, change: 0 },
      roas: { value: 0, change: 0 },
      impressions: { value: 0, change: 0 },
      clicks: { value: 0, change: 0 },
      conversions: { value: 0, change: 0 },
      ctr: { value: 0, change: 0 },
      cpc: { value: 0, change: 0 },
      cpm: { value: 0, change: 0 },
      cpa: { value: 0, change: 0 },
      conversionRate: { value: 0, change: 0 },
    };
  }, [client]);

  // ─── Spend vs Revenue Chart Config ──────────────────────────────
  const isMoreThanMonth = periodConfig.days > 31;
  const timeSeries = useMemo(() => {
    if (Array.isArray(overviewPoints) && overviewPoints.length > 0) {
      return overviewPoints.map((p) => {
        const d = new Date(p.date);
        return {
          date: p.date,
          day: isNaN(d.getDate()) ? 1 : d.getDate(),
          monthShort: isNaN(d.getTime()) ? 'Aug' : d.toLocaleString('en-US', { month: 'short' }),
          monthNum: isNaN(d.getTime()) ? '08' : String(d.getMonth() + 1).padStart(2, '0'),
          spend: Number(p.spend) || 0,
          revenue: Number(p.revenue) || 0,
          conversions: Number(p.conversions) || 0,
          roas: Number(p.roas) || 0,
          cpa: Number(p.cpa) || 0,
          ctr: Number(p.ctr) || 0,
          impressions: Number(p.impressions) || 0,
          clicks: Number(p.clicks) || 0,
        };
      });
    }
    return [];
  }, [overviewPoints]);

  const chartData = useMemo(() => {
    return isMoreThanMonth ? aggregateTimeSeriesByMonth(timeSeries) : timeSeries;
  }, [isMoreThanMonth, timeSeries]);

  const hasMultipleMonths = useMemo(() => {
    return new Set(timeSeries.map((d) => d.monthShort)).size > 1;
  }, [timeSeries]);

  // Horizontal axis categories: Months if > 31 days, else just day numbers
  const chartCategories = useMemo(() => {
    return isMoreThanMonth
      ? chartData.map((d) => d.monthShort)
      : chartData.map((d) => d.day);
  }, [isMoreThanMonth, chartData]);

  const fullMonthText = useMemo(() => {
    if (isMoreThanMonth) {
      if (periodConfig.label === 'This Year') return '2026';
      if (chartData.length > 0) {
        const first = chartData[0];
        const last = chartData[chartData.length - 1];
        if (first.year === last.year) {
          return `${first.monthShort} – ${last.monthShort} ${last.year}`;
        }
        return `${first.monthShort} ${first.year} – ${last.monthShort} ${last.year}`;
      }
      return '2026';
    }
    if (!timeSeries || !timeSeries.length) return 'August 2026';
    const target = timeSeries[timeSeries.length - 1] || timeSeries[0];
    const m = target.month || 'August';
    const y = target.year || 2026;
    if (hasMultipleMonths) {
      const first = timeSeries[0];
      return `${first.monthShort} – ${target.monthShort} ${y}`;
    }
    return `${m} ${y}`;
  }, [isMoreThanMonth, periodConfig.label, chartData, timeSeries, hasMultipleMonths]);

  const spendVsRevenueSeries = useMemo(() => {
    return selectedMetrics.map((key) => ({
      name: CHART_METRICS[key]?.label || key,
      data: chartData.map((d) => d[key] || 0),
    }));
  }, [selectedMetrics, chartData]);

  const activeColors = selectedMetrics.map((key) => CHART_METRICS[key]?.color || '#00a76f');
  const primaryMetric = selectedMetrics[0] || 'revenue';
  const metricType = CHART_METRICS[primaryMetric]?.type || 'currency';

  const spendVsRevenueOptions = useMemo(() => ({
    chart: {
      type: 'area',
      height: 310,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: spendVsRevenueSeries.map(() => 2.5) },
    colors: activeColors,
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: { colors: '#64748b', fontSize: '11px' },
        rotate: 0,
        rotateAlways: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          const sym = getCurrencySymbol(client?.currency);
          if (metricType === 'currency') return `${sym}${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`;
          if (metricType === 'ratio') return `${val}x`;
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
          return val;
        },
        style: { colors: '#64748b', fontSize: '11px' },
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
        formatter: (val, opts) => {
          const idx = opts?.dataPointIndex;
          const point = chartData[idx];
          return point?.fullDate || (point?.date ? `${point.date}, 2026` : val);
        },
      },
      y: {
        formatter: (val) => {
          const sym = getCurrencySymbol(client?.currency);
          if (metricType === 'currency') return `${sym}${val.toLocaleString()}`;
          if (metricType === 'ratio') return `${Number(val).toFixed(2)}x`;
          return val.toLocaleString();
        },
      },
    },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,0.06)',
      strokeDashArray: 3,
    },
  }), [spendVsRevenueSeries, activeColors, chartCategories, isMoreThanMonth, metricType, chartData, client?.currency]);

  const clientPlatformPerformance = useMemo(() => {
    const platforms = {
      meta: { label: 'Meta Ads', currency: client?.currency || 'USD', campaigns: [], kpis: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, cpc: 0, cpm: 0 } },
      google: { label: 'Google Ads', currency: client?.currency || 'EUR', campaigns: [], searchTerms: [], kpis: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, cpc: 0, cpm: 0 } },
      tiktok: { label: 'TikTok Ads', currency: client?.currency || 'EGP', campaigns: [], kpis: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, cpc: 0, cpm: 0 } },
      snapchat: { label: 'Snapchat Ads', currency: client?.currency || 'SAR', campaigns: [], kpis: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, cpa: 0, cpc: 0, cpm: 0 } },
    };

    if (Array.isArray(overviewPlatformRows) && overviewPlatformRows.length > 0) {
      overviewPlatformRows.forEach((row) => {
        const pKey = mapPlatformTypeToKey(row.platformName ?? row.platformType);
        if (platforms[pKey]) {
          platforms[pKey].platformId = row.platformId;
          platforms[pKey].currency = row.currency ? (typeof row.currency === 'string' ? row.currency : client?.currency || 'USD') : client?.currency || 'USD';
          platforms[pKey].kpis = {
            spend: Number(row.spend) || 0,
            revenue: Number(row.revenue) || 0,
            roas: Number(row.roas) || 0,
            impressions: Number(row.impressions) || 0,
            clicks: Number(row.clicks) || 0,
            ctr: Number(row.ctr) || 0,
            conversions: Number(row.conversions) || 0,
            cpa: Number(row.cpa) || 0,
            cpc: row.clicks > 0 ? Number((row.spend / row.clicks).toFixed(2)) : 0,
            cpm: row.impressions > 0 ? Number(((row.spend / row.impressions) * 1000).toFixed(2)) : 0,
          };
        }
      });
    } else if (client && Array.isArray(client.platforms)) {
      client.platforms.forEach((p) => {
        const pKey = mapPlatformTypeToKey(p.platformType || p.key, p.platformName);
        if (platforms[pKey]) {
          platforms[pKey].platformId = p.id ?? p.platformId;
          platforms[pKey].currency = p.currency || client.currency || platforms[pKey].currency;
          platforms[pKey].connected = p.connected ?? (p.status === 'Connected');
          if (p.spend !== undefined) {
            platforms[pKey].kpis = {
              spend: Number(p.spend) || 0,
              revenue: Number(p.revenue) || 0,
              roas: Number(p.roas) || 0,
              impressions: Number(p.impressions) || 0,
              clicks: Number(p.clicks) || 0,
              ctr: Number(p.ctr) || 0,
              conversions: Number(p.conversions) || 0,
              cpa: Number(p.cpa) || 0,
              cpc: Number(p.cpc) || 0,
              cpm: Number(p.cpm) || 0,
            };
          }
        }
      });
    }

    if (Array.isArray(realCampaigns) && realCampaigns.length > 0) {
      realCampaigns.forEach((c) => {
        const pKey = mapPlatformTypeToKey(c.platformType, c.platformName);
        if (platforms[pKey]) {
          platforms[pKey].campaigns.push(c);
          if (!overviewPlatformRows || overviewPlatformRows.length === 0) {
            const k = platforms[pKey].kpis;
            k.spend += Number(c.spend) || 0;
            k.revenue += Number(c.revenue) || 0;
            k.conversions += Number(c.conversions) || 0;
            k.impressions += Number(c.impressions) || 0;
            k.clicks += Number(c.clicks) || 0;
          }
        }
      });
      if (!overviewPlatformRows || overviewPlatformRows.length === 0) {
        Object.values(platforms).forEach((plat) => {
          const k = plat.kpis;
          if (k.spend > 0) {
            k.roas = Number((k.revenue / k.spend).toFixed(2));
          }
          if (k.impressions > 0) {
            k.ctr = Number(((k.clicks / k.impressions) * 100).toFixed(2));
            k.cpm = Number(((k.spend / k.impressions) * 1000).toFixed(2));
          }
          if (k.clicks > 0) {
            k.cpc = Number((k.spend / k.clicks).toFixed(2));
          }
          if (k.conversions > 0) {
            k.cpa = Number((k.spend / k.conversions).toFixed(2));
          }
        });
      }
    }

    return platforms;
  }, [client, realCampaigns, overviewPlatformRows]);

  // ─── ROAS by Platform Chart Config ──────────────────────────────
  const platformKeys = useMemo(() => Object.keys(clientPlatformPerformance), [clientPlatformPerformance]);
  const roasCategories = useMemo(() => platformKeys.map((k) => clientPlatformPerformance[k].label), [platformKeys, clientPlatformPerformance]);
  const roasValues = useMemo(() => platformKeys.map((k) => clientPlatformPerformance[k].kpis.roas), [platformKeys, clientPlatformPerformance]);

  const roasChartOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      height: 310,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '42%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(2)}x`,
      offsetY: -20,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#334155'],
      },
    },
    colors: ['#1877f2', '#ea4335', '#f59e0b', '#000000'],
    xaxis: {
      categories: roasCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
    },
    yaxis: {
      title: { text: 'ROAS', style: { color: '#64748b', fontSize: '11px' } },
      labels: {
        formatter: (val) => `${val.toFixed(1)}x`,
        style: { colors: '#64748b', fontSize: '11px' },
      },
    },
    annotations: {
      yaxis: [
        {
          y: 3.0,
          borderColor: '#10b981',
          strokeDashArray: 4,
          label: {
            borderColor: '#10b981',
            style: { color: '#fff', background: '#10b981', fontSize: '10px' },
            text: 'Target 3.0x',
          },
        },
      ],
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)}x ROAS`,
      },
    },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,0.06)',
      strokeDashArray: 3,
    },
  }), [roasCategories]);

  const roasChartSeries = useMemo(() => [
    { name: 'ROAS', data: roasValues },
  ], [roasValues]);

  // ─── Platform Comparison Totals ─────────────────────────────────
  const [platCompSortField, setPlatCompSortField] = useState(null);
  const [platCompSortDir, setPlatCompSortDir] = useState('desc');

  const handlePlatCompSort = (field) => {
    if (platCompSortField === field) {
      setPlatCompSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setPlatCompSortField(field);
      setPlatCompSortDir('desc');
    }
  };

  const renderPlatCompSortTH = (field, label, isLast = false) => {
    const isActive = platCompSortField === field;
    return (
      <th
        className={`text-body fw-bold user-select-none text-nowrap ${isLast ? 'pe-4' : ''} ${isActive ? 'text-primary' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handlePlatCompSort(field)}
        title={`Sort by ${label} (${isActive && platCompSortDir === 'desc' ? 'Ascending' : 'Descending'})`}
      >
        <div className="d-inline-flex align-items-center gap-1">
          <span>{label}</span>
          <span className={`small ${isActive ? 'text-primary fw-bold' : 'text-secondary opacity-50'}`} style={{ fontSize: '0.7rem' }}>
            {isActive ? (platCompSortDir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  const platformEntries = Object.entries(clientPlatformPerformance);
  const sortedPlatformEntries = useMemo(() => {
    if (!platCompSortField) return platformEntries;
    return [...platformEntries].sort((a, b) => {
      const platA = a[1]?.kpis || {};
      const platB = b[1]?.kpis || {};
      const aVal = Number(platA[platCompSortField]) || 0;
      const bVal = Number(platB[platCompSortField]) || 0;
      return platCompSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [platformEntries, platCompSortField, platCompSortDir]);
  const connectedPlatformsCount = platformEntries.filter(([k]) => platformsState[k]?.connected !== false).length;
  const disconnectedPlatformsCount = platformEntries.length - connectedPlatformsCount;

  const totalSpend = Number(client?.spend) || 0;
  const totalRevenue = Number(client?.revenue) || 0;
  const totalImpressions = Number(client?.impressions) || 0;
  const totalClicks = Number(client?.clicks) || 0;
  const totalConversions = Number(client?.conversions) || 0;

  const totalRoas = Number(client?.actualROAS) || 0;
  const totalCtr = Number(client?.ctr) || 0;
  const totalCpa = Number(client?.cpa) || 0;

  // ─── Client's All Campaigns for Overview ────────────────────────────
  const allOverviewCampaigns = useMemo(() => {
    if (realCampaigns && realCampaigns.length > 0) {
      return realCampaigns.map((camp) => {
        const platformKey = mapPlatformTypeToKey(camp.platformType, camp.platformName);
        const platformLabel = platformKey === 'meta' ? 'Meta Ads' : platformKey === 'google' ? 'Google Ads' : platformKey === 'tiktok' ? 'TikTok Ads' : 'Snapchat Ads';
        const status = getCampaignStatusName(camp.status);
        const objective = getCampaignObjectiveName(camp.objective);
        const startDate = camp.startDate ? new Date(camp.startDate).toLocaleDateString('en-GB') : '01/07/26';
        const roas = Number(camp.roas) || 0;

        return {
          ...camp,
          platformKey,
          platformLabel,
          status,
          objective,
          startDate,
          roas,
          spend: Number(camp.spend) || 0,
          revenue: Number(camp.revenue) || 0,
          impressions: Number(camp.impressions) || 0,
          clicks: Number(camp.clicks) || 0,
          conversions: Number(camp.conversions) || 0,
          ctr: camp.ctr != null ? Number(camp.ctr) : 0,
          cpc: camp.cpc != null ? Number(camp.cpc) : 0,
          cpa: camp.cpa != null ? Number(camp.cpa) : 0,
        };
      });
    }

    return Object.entries(clientPlatformPerformance)
      .flatMap(([platformKey, platformData]) =>
        (platformData.campaigns || []).map((camp, idx) => {
          const defaultObjectives = ['Sales', 'Traffic', 'Awareness', 'Leads', 'Conversions'];
          const defaultDates = ['01/07/26', '10/07/26', '15/06/26', '22/05/26', '04/04/26', '18/03/26'];
          const objective = camp.objective || defaultObjectives[idx % defaultObjectives.length];
          const startDate = camp.startDate || defaultDates[idx % defaultDates.length];

          return {
            ...camp,
            platformKey,
            platformLabel: platformData.label,
            objective,
            startDate,
          };
        })
      );
  }, [realCampaigns, clientPlatformPerformance]);

  const filteredOverviewCampaigns = allOverviewCampaigns.filter((c) => {
    const matchPlatform = overviewFilters.platform === 'ALL' || c.platformKey === overviewFilters.platform.toLowerCase();
    const effectiveStatus = overviewFilters.status !== 'ALL' ? overviewFilters.status : overviewStatusFilter;
    const matchStatus = effectiveStatus === 'ALL' || effectiveStatus === 'all' || String(c.status).toLowerCase() === effectiveStatus.toLowerCase();
    const matchObjective = overviewFilters.objective === 'ALL' || String(c.objective).toLowerCase() === overviewFilters.objective.toLowerCase();
    const matchSearch = !overviewSearchQuery || c.name.toLowerCase().includes(overviewSearchQuery.toLowerCase());
    return matchPlatform && matchStatus && matchObjective && matchSearch;
  });

  const sortedOverviewCampaigns = [...filteredOverviewCampaigns].sort((a, b) => {
    let valA = a[overviewSortField];
    let valB = b[overviewSortField];

    if (overviewSortField === 'startDate') {
      const parseDate = (dStr) => {
        if (!dStr) return 0;
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            const yr = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            return new Date(`${yr}-${parts[1]}-${parts[0]}`).getTime();
          }
        }
        return new Date(dStr).getTime();
      };
      valA = parseDate(valA);
      valB = parseDate(valB);
    } else {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }

    if (overviewSortOrder === 'asc') {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });

  const visibleCampaigns = sortedOverviewCampaigns;

  // ─── Client Goals & Targets Calculations ─────────────────────────
  const currentRevenue = Number(client?.revenue) || 0;
  const targetRevenue = Number(targetSettings?.targetRevenue) || 0;
  const revenuePct = targetRevenue > 0 ? Math.round((currentRevenue * 100) / targetRevenue) : (Number(client?.revenueProgress) || 0);

  const currentSpend = Number(client?.spend) || 0;
  const targetMonthlyBudget = Number(targetSettings?.monthlyBudget) || 0;
  const budgetPct = targetMonthlyBudget > 0 ? Math.round((currentSpend * 100) / targetMonthlyBudget) : (Number(client?.budgetProgress) || 0);

  const currentRoas = Number(client?.actualROAS ?? client?.roas) || 0;
  const targetRoas = Number(targetSettings?.targetRoas ?? targetSettings?.targetROAS) || 0;
  const roasPct = targetRoas > 0 ? Math.round((currentRoas * 100) / targetRoas) : (Number(client?.achievedROAS) || 0);

  const currentConversions = Number(client?.conversions) || 0;
  const targetConversions = Number(targetSettings?.targetConversions) || 0;
  const conversionsPct = targetConversions > 0 ? Math.round((currentConversions * 100) / targetConversions) : (Number(client?.conversionsProgress) || 0);

  const currentCpa = Number(client?.cpa) || 0;
  const targetCpa = Number(targetSettings?.targetCpa ?? targetSettings?.targetCPA) || 0;
  const cpaPct = targetCpa > 0 ? Math.round((currentCpa * 100) / targetCpa) : (Number(client?.cpaProgress) || 0);

  // ─── Action Handlers ────────────────────────────────────────────
  const handleOpenTargetModal = async () => {
    let currList = currencies;
    if (!Array.isArray(currList) || currList.length === 0) {
      currList = await getClientCurrenciesApi();
      if (Array.isArray(currList) && currList.length > 0) {
        setCurrencies(currList);
      }
    }

    const budget = Number(targetSettings?.monthlyBudget) || 0;
    const roas = Number(targetSettings?.targetRoas) || 0;
    const cpa = Number(targetSettings?.targetCpa) || 0;
    const revenue = Number(targetSettings?.targetRevenue) || 0;
    const conversions = Number(targetSettings?.targetConversions) || 0;

    const rawCurr = targetSettings?.currency || (typeof client?.currency === 'string' ? client.currency : (Array.isArray(currList) ? currList[client?.currency] : 'USD'));
    const validCurr = Array.isArray(currList) && currList.includes(rawCurr) ? rawCurr : (currList?.[0] || 'USD');

    setTargetFormData({
      monthlyBudget: budget,
      targetRoas: roas,
      targetCpa: cpa,
      currency: validCurr,
      targetRevenue: revenue,
      targetConversions: conversions,
    });
    setTargetError('');
    setShowTargetModal(true);
  };

  const handleSaveTargets = async (e) => {
    e.preventDefault();
    try {
      setTargetSaving(true);
      setTargetError('');
      const sanitizedTargets = {
        monthlyBudget: Number(targetFormData.monthlyBudget) || 0,
        currency: targetFormData.currency || currencies[0] || 'USD',
        targetRoas: Number(targetFormData.targetRoas) || 0,
        targetCpa: Number(targetFormData.targetCpa) || 0,
        targetRevenue: Number(targetFormData.targetRevenue) || 0,
        targetConversions: Number(targetFormData.targetConversions) || 0,
      };
      const updated = await updateClientTargetsApi(id, sanitizedTargets);
      setTargetSettings(updated || sanitizedTargets);
      setShowTargetModal(false);
      setToastMsg('Client targets updated successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      setTargetError(err.message || 'Failed to save targets.');
    } finally {
      setTargetSaving(false);
    }
  };

  const openEditModal = () => {
    if (!client) return;
    const clientCurrIdx = typeof client.currency === 'number'
      ? client.currency
      : currencies.indexOf(client.currency) >= 0
        ? currencies.indexOf(client.currency)
        : 0;

    const clientStatusIdx = typeof client.status === 'number'
      ? client.status
      : statuses.indexOf(client.status) >= 0
        ? statuses.indexOf(client.status)
        : 0;

    const clientModelIdx = typeof client.model === 'number'
      ? client.model
      : (client.model === 'Lead' || client.businessModel === 'Lead' || client.businessModel === 1)
        ? 1
        : 0;

    setFormData({
      companyName: client.companyName || '',
      website: client.website || '',
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || 'United States',
      currency: clientCurrIdx,
      status: clientStatusIdx,
      businessModel: clientModelIdx,
      notes: client.notes || '',
      managerId: client.managerId || users[0]?.id || '',
      logo: client.logo || '',
      countryCode: '+1',
    });
    setEditError('');
    setLogoUploadError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!formData.companyName?.trim() || !formData.email?.trim() || !formData.phone?.trim() || !formData.website?.trim()) {
      setEditError('Please fill in all required fields (Company Name, Website, Email, Phone).');
      return;
    }

    let formattedWebsite = (formData.website || '').trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    try {
      setEditLoading(true);
      const payload = {
        ...formData,
        website: formattedWebsite,
        currency: Number(formData.currency),
        status: Number(formData.status),
        businessModel: Number(formData.businessModel),
        managerId: formData.managerId || client.managerId || '',
      };
      const updated = await updateClientApi(client.id, payload);
      setClient((prev) => ({ ...(prev || {}), ...(updated || payload) }));
      setShowEditModal(false);
      setToastMsg('Client details updated successfully!');
      setTimeout(() => setToastMsg(''), 3000);
      tabDataCacheRef.current = {};
      await loadSharedClientInfo(id);
      if (activeTab === 'overview') {
        await loadOverviewData(true);
      } else if (['meta', 'google', 'snapchat', 'tiktok'].includes(activeTab)) {
        await loadPlatformData(activeTab, true);
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update client.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    tabDataCacheRef.current = {};
    const now = 'Just now';
    const nowDate = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedOverview = { lastSync: now, lastSyncDate: nowDate };
    setOverviewLastSync(updatedOverview);
    try { localStorage.setItem(overviewSyncStorageKey, JSON.stringify(updatedOverview)); } catch { }

    setPlatformsState((prev) => {
      const updated = {};
      Object.keys(prev).forEach((k) => {
        updated[k] = { ...prev[k], lastSync: now, lastSyncDate: nowDate };
      });
      try { localStorage.setItem(platformsStorageKey, JSON.stringify(updated)); } catch { }
      return updated;
    });

    try {
      await loadSharedClientInfo(id);
      if (activeTab === 'overview') {
        await loadOverviewData(true);
      } else if (['meta', 'google', 'snapchat', 'tiktok'].includes(activeTab)) {
        await loadPlatformData(activeTab, true);
      }
      setToastMsg('Data refreshed successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch {
      setToastMsg('Failed to refresh data.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleShareReport = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setToastMsg('Report link copied to clipboard!');
      setTimeout(() => setToastMsg(''), 3000);
    }).catch(() => {
      setToastMsg('Could not copy link.');
      setTimeout(() => setToastMsg(''), 3000);
    });
  };

  const handleExportPDF = () => { window.print(); };

  const toggleKPI = (key) => {
    setPinnedKPIs((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 6) return prev;
      return [...prev, key];
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      clientId: id,
      author: 'You',
      authorAvatar: 'Y',
      timestamp: new Date().toISOString(),
      content: newNote.trim(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote('');
  };

  // ─── Client Avatar Helpers ─────────────────────────────────────
  const getClientInitials = (name) => {
    if (!name) return 'CL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getClientGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', // Indigo -> Violet
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', // Sky -> Blue
      'linear-gradient(135deg, #059669 0%, #047857 100%)', // Emerald -> Green
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)', // Amber -> Warm
      'linear-gradient(135deg, #db2777 0%, #be185d 100%)', // Pink -> Rose
      'linear-gradient(135deg, #7c3aed 0%, #581c87 100%)', // Violet -> Deep Purple
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // ─── Status Badge ───────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const statuses = ['Active', 'Inactive', 'Lead', 'Archived'];
    const name = typeof status === 'number' ? statuses[status] || 'Active' : String(status || 'Active');
    let badgeClass = 'bg-success-subtle text-success-emphasis border-success-subtle';

    if (name === 'Inactive') {
      badgeClass = 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle';
    } else if (name === 'Lead') {
      badgeClass = 'bg-info-subtle text-info-emphasis border-info-subtle';
    } else if (name === 'Archived') {
      badgeClass = 'bg-dark-subtle text-dark-emphasis border-dark-subtle';
    }

    return (
      <span className={`badge rounded-pill border px-2.5 py-1 fw-semibold ${badgeClass}`} style={{ fontSize: '0.78rem' }}>
        {name}
      </span>
    );
  };

  // ─── Loading / Error ────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Loading... | Dasher">
        <div className="d-flex align-items-center justify-content-center py-10 w-100">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}><span className="visually-hidden">Loading...</span></div>
        </div>
      </DashboardLayout>
    );
  }
  if (error || !client) {
    return (
      <DashboardLayout title="Error | Dasher">
        <div className="p-4">
          <div className="alert alert-danger" role="alert">{error || 'Client details not found.'}</div>
          <button className="btn btn-outline-primary" onClick={() => navigate('/clients')}>Back to Clients</button>
        </div>
      </DashboardLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const dynamicClientName = client?.companyName || client?.name || 'Client';
  const clientReportingCurrency = getCurrencyName(client?.currency);
  const clientCurrSymbol = getCurrencySymbol(clientReportingCurrency);

  return (
    <DashboardLayout
      title={`${dynamicClientName} | Dasher`}
      pageTitle={dynamicClientName}
      clientSwitcher={{ currentClientId: client?.id || id, currentClientName: dynamicClientName }}
    >
      {/* Micro-animations & custom styling */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.8s linear infinite; }
        .kpi-card { 
          transition: transform 0.18s ease, box-shadow 0.18s ease; 
        }
        .kpi-card:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; 
        }
        .kpi-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (max-width: 1200px) {
          .kpi-grid-5 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .kpi-grid-5 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .kpi-grid-5 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        @media (min-width: 1200px) {
          .border-end-xl {
            border-right: 1px solid var(--bs-border-color-translucent, rgba(0, 0, 0, 0.08)) !important;
          }
        }
        .tab-btn { 
          border-bottom: 3px solid transparent; 
          transition: all 0.18s ease; 
          font-size: 0.975rem !important; 
          font-weight: 600 !important; 
          padding: 0.85rem 1.35rem !important; 
        }
        .tab-btn.active { 
          border-bottom: 3px solid var(--bs-primary) !important; 
          color: var(--bs-primary) !important; 
          font-weight: 700 !important; 
        }
        .tab-btn:hover { 
          color: var(--bs-primary) !important; 
        }
        .tab-scroll-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bs-body-bg);
          border: 1px solid var(--bs-border-color);
          color: var(--bs-body-color);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          cursor: pointer;
          z-index: 2;
        }
        .tab-scroll-btn:hover {
          background: var(--bs-primary-subtle);
          color: var(--bs-primary);
          border-color: var(--bs-primary-subtle);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.22);
        }
        .tab-scroll-btn:active {
          transform: scale(0.92);
        }
        .insight-card { border-left: 4px solid transparent; transition: all 0.15s ease; }
        .insight-card:hover { transform: translateX(4px); }
        .insight-card.priority-high { border-left-color: var(--bs-danger); }
        .insight-card.priority-medium { border-left-color: var(--bs-warning); }
        .insight-card.priority-low { border-left-color: var(--bs-info); }
        .platform-row { transition: background-color 0.15s ease; }
        .platform-row:hover { background-color: rgba(var(--bs-primary-rgb), 0.04) !important; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div className="container-fluid px-0">

        {/* ─── Top Bar: Breadcrumb + Action Buttons (In Parallel) ─── */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2 no-print">
          {/* Left: Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">
                  Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/clients" className="text-decoration-none fw-semibold text-secondary hover-primary">
                  Clients
                </Link>
              </li>
              {activeTab === 'overview' ? (
                <li
                  className="breadcrumb-item active text-success fw-semibold"
                  aria-current="page"
                >
                  {dynamicClientName}
                </li>
              ) : (
                <>
                  <li className="breadcrumb-item">
                    <Link to={`/clients/${id}`} className="text-decoration-none fw-semibold text-secondary hover-primary">
                      {dynamicClientName}
                    </Link>
                  </li>
                  <li
                    className="breadcrumb-item active text-success fw-semibold"
                    aria-current="page"
                  >
                    {TABS.find((t) => t.key === activeTab)?.label || activeTab}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Right: action buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Period / Date Range Dropdown */}
            <PeriodSelector
              value={periodConfig.label}
              onChange={(cfg) => setPeriodConfig(cfg)}
            />

            <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={handleShareReport}>
              <IconShare /> <span className="d-none d-md-inline">Share</span>
            </button>
            <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={handleExportPDF}>
              <IconPdf /> <span className="d-none d-md-inline">Export PDF</span>
            </button>
            <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={handleRefresh} disabled={refreshing}>
              <IconRefresh spinning={refreshing} /> <span className="d-none d-md-inline">{refreshing ? 'Refreshing...' : 'Refresh all'}</span>
            </button>
          </div>
        </div>

        {/* ─── Client Identity Header (Modern & Intuitive) ───────── */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center p-2 rounded-circle no-print shadow-sm"
              onClick={() => navigate('/clients')}
              title="Back to Clients"
              aria-label="Back to Clients"
            >
              <IconBack />
            </button>

            {/* Modern Gradient Avatar with Squircle & Initials / Logo */}
            <ClientAvatar
              logo={client.logo}
              name={client.companyName}
              size={52}
              borderRadius={14}
              fontSize="1.15rem"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            />

            {/* Client Name & Header Action */}
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h1 className="h3 mb-0 fw-bold text-body-emphasis me-1">{client.companyName}</h1>
                {getStatusBadge(client.status)}
                <button
                  className="btn btn-sm btn-outline-secondary rounded-2 d-inline-flex align-items-center gap-1.5 px-2.5 py-1 no-print ms-1"
                  onClick={openEditModal}
                  title="Edit Client Information"
                  aria-label="Edit Client"
                  style={{ fontSize: '0.78rem' }}
                >
                  <IconEdit />
                  <span>Edit</span>
                </button>
              </div>

              {/* Subheader Metadata Spans (Email, Currency, Website) */}
              <div className="d-flex align-items-center gap-3 text-secondary small flex-wrap" style={{ fontSize: '0.80rem' }}>
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-body-secondary text-decoration-none d-inline-flex align-items-center gap-2"
                    title="Email Client"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-body-tertiary flex-shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    <span>{client.email}</span>
                  </a>
                )}

                {(client.currency != null && client.currency !== '') ? (
                  <>
                    {client.email && <span className="text-body-tertiary opacity-75 mx-1">&bull;</span>}
                    <span className="badge bg-body-tertiary text-body-secondary border rounded-2 px-2.5 py-0.5 fw-semibold" style={{ fontSize: '0.74rem' }}>
                      {getCurrencyName(client.currency)}
                    </span>
                  </>
                ) : null}

                {client.website && (
                  <>
                    <span className="text-body-tertiary opacity-75 mx-1">&bull;</span>
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-decoration-none d-inline-flex align-items-center gap-2 fw-medium"
                      title="Open Website"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                      <span>{client.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-0.5 flex-shrink-0" style={{ opacity: 0.7 }}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Client Goals & Target Tracking Bar (Linear Progress Under Stats) ───── */}
        <div className="card border shadow-xs rounded-3 mb-3.5 bg-body-tertiary bg-opacity-40">
          <div className="card-body py-2 px-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 gap-xl-3">
              {/* 1. Monthly Budget (Indigo Theme) */}
              <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 150 }}>
                <div className="d-flex align-items-baseline justify-content-between mb-1">
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fw-semibold text-body-secondary small" style={{ fontSize: '0.76rem' }}>Budget:</span>
                    <span className="fw-bold small" style={{ fontSize: '0.84rem', color: '#6366f1' }}>
                      {clientCurrSymbol}{currentSpend >= 1000 ? `${(currentSpend / 1000).toFixed(1)}k` : currentSpend.toLocaleString()}
                    </span>
                    <span className="text-body-secondary small fw-medium" style={{ fontSize: '0.74rem', opacity: 0.85 }}>/{clientCurrSymbol}{targetMonthlyBudget >= 1000 ? `${(targetMonthlyBudget / 1000).toFixed(targetMonthlyBudget % 1000 !== 0 ? 1 : 0)}k` : targetMonthlyBudget.toLocaleString()}</span>
                  </div>
                  <span
                    className="badge rounded-pill px-2 py-0.5 fw-bold ms-2"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.16)',
                      color: '#6366f1',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {budgetPct}%
                  </span>
                </div>
                <div className="progress rounded-pill bg-body-secondary w-100" style={{ height: 4 }}>
                  <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${Math.min(100, budgetPct)}%`, backgroundColor: '#6366f1' }}></div>
                </div>
              </div>

              <div className="d-none d-xxl-block vr opacity-25 align-self-stretch my-1" style={{ width: 1 }}></div>

              {/* 2. Revenue (Green Theme) */}
              <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 150 }}>
                <div className="d-flex align-items-baseline justify-content-between mb-1">
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fw-semibold text-body-secondary small" style={{ fontSize: '0.76rem' }}>Revenue:</span>
                    <span className="fw-bold small" style={{ fontSize: '0.84rem', color: '#00a76f' }}>
                      {clientCurrSymbol}{currentRevenue >= 1000 ? `${(currentRevenue / 1000).toFixed(1)}k` : currentRevenue.toLocaleString()}
                    </span>
                    <span className="text-body-secondary small fw-medium" style={{ fontSize: '0.74rem', opacity: 0.85 }}>/{clientCurrSymbol}{targetRevenue >= 1000 ? `${(targetRevenue / 1000).toFixed(targetRevenue % 1000 !== 0 ? 1 : 0)}k` : targetRevenue.toLocaleString()}</span>
                  </div>
                  <span
                    className="badge rounded-pill px-2 py-0.5 fw-bold ms-2"
                    style={{
                      backgroundColor: 'rgba(0, 167, 111, 0.16)',
                      color: '#00a76f',
                      border: '1px solid rgba(0, 167, 111, 0.35)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {revenuePct}%
                  </span>
                </div>
                <div className="progress rounded-pill bg-body-secondary w-100" style={{ height: 4 }}>
                  <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${Math.min(100, revenuePct)}%`, backgroundColor: '#00a76f' }}></div>
                </div>
              </div>

              <div className="d-none d-xxl-block vr opacity-25 align-self-stretch my-1" style={{ width: 1 }}></div>

              {/* 3. ROAS (Green Theme) */}
              <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 145 }}>
                <div className="d-flex align-items-baseline justify-content-between mb-1">
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fw-semibold text-body-secondary small" style={{ fontSize: '0.76rem' }}>ROAS:</span>
                    <span className="fw-bold small" style={{ fontSize: '0.84rem', color: '#00a76f' }}>
                      {(Number(currentRoas) || 0).toFixed(2)}x
                    </span>
                    <span className="text-body-secondary small fw-medium" style={{ fontSize: '0.74rem', opacity: 0.85 }}>/{(Number(targetRoas) || 4.0).toFixed(1)}x</span>
                  </div>
                  <span
                    className="badge rounded-pill px-2 py-0.5 fw-bold ms-2"
                    style={{
                      backgroundColor: 'rgba(0, 167, 111, 0.16)',
                      color: '#00a76f',
                      border: '1px solid rgba(0, 167, 111, 0.35)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {roasPct}%
                  </span>
                </div>
                <div className="progress rounded-pill bg-body-secondary w-100" style={{ height: 4 }}>
                  <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${Math.min(100, roasPct)}%`, backgroundColor: '#00a76f' }}></div>
                </div>
              </div>

              <div className="d-none d-xxl-block vr opacity-25 align-self-stretch my-1" style={{ width: 1 }}></div>

              {/* 4. Conversions (Cyan Theme) */}
              <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 155 }}>
                <div className="d-flex align-items-baseline justify-content-between mb-1">
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fw-semibold text-body-secondary small" style={{ fontSize: '0.76rem' }}>Conversions:</span>
                    <span className="fw-bold small" style={{ fontSize: '0.84rem', color: '#0284c7' }}>
                      {currentConversions >= 1000 ? `${(currentConversions / 1000).toFixed(1)}k` : currentConversions.toLocaleString()}
                    </span>
                    <span className="text-body-secondary small fw-medium" style={{ fontSize: '0.74rem', opacity: 0.85 }}>/{targetConversions >= 1000 ? `${(targetConversions / 1000).toFixed(targetConversions % 1000 !== 0 ? 1 : 0)}k` : targetConversions.toLocaleString()}</span>
                  </div>
                  <span
                    className="badge rounded-pill px-2 py-0.5 fw-bold ms-2"
                    style={{
                      backgroundColor: 'rgba(2, 132, 199, 0.16)',
                      color: '#0284c7',
                      border: '1px solid rgba(2, 132, 199, 0.35)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {conversionsPct}%
                  </span>
                </div>
                <div className="progress rounded-pill bg-body-secondary w-100" style={{ height: 4 }}>
                  <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${Math.min(100, conversionsPct)}%`, backgroundColor: '#0284c7' }}></div>
                </div>
              </div>

              <div className="d-none d-xxl-block vr opacity-25 align-self-stretch my-1" style={{ width: 1 }}></div>

              {/* 5. CPA (Danger Red Theme) */}
              <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 145 }}>
                <div className="d-flex align-items-baseline justify-content-between mb-1">
                  <div className="d-flex align-items-baseline gap-1">
                    <span className="fw-semibold text-body-secondary small" style={{ fontSize: '0.76rem' }}>CPA:</span>
                    <span className="fw-bold small" style={{ fontSize: '0.84rem', color: '#ef4444' }}>
                      {clientCurrSymbol}{(Number(currentCpa) || 0).toFixed(2)}
                    </span>
                    <span className="text-body-secondary small fw-medium" style={{ fontSize: '0.74rem', opacity: 0.85 }}>/{clientCurrSymbol}{(Number(targetCpa) || 5.50).toFixed(2)}</span>
                  </div>
                  <span
                    className="badge rounded-pill px-2 py-0.5 fw-bold ms-2"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.16)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {cpaPct}%
                  </span>
                </div>
                <div className="progress rounded-pill bg-body-secondary w-100" style={{ height: 4 }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{ width: `${Math.min(100, cpaPct)}%`, backgroundColor: '#ef4444' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Edit Targets Action Button Under Stats */}
            <div className="d-flex align-items-center justify-content-between pt-1 mt-2 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span
                  className="badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{
                    backgroundColor: (client?.model === 'Lead' || client?.businessModel === 1 || client?.businessModel === 'Lead') ? 'rgba(2, 132, 199, 0.14)' : 'rgba(0, 167, 111, 0.14)',
                    color: (client?.model === 'Lead' || client?.businessModel === 1 || client?.businessModel === 'Lead') ? '#0284c7' : '#00a76f',
                    border: (client?.model === 'Lead' || client?.businessModel === 1 || client?.businessModel === 'Lead') ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(0, 167, 111, 0.3)',
                    fontSize: '0.74rem',
                  }}
                >
                  {(client?.model === 'Lead' || client?.businessModel === 1 || client?.businessModel === 'Lead') ? '🎯 Lead Gen' : '🛍️ E-Commerce'}
                </span>

                <span
                  className="badge bg-body text-body-emphasis border rounded-pill px-2.5 py-1 fw-medium d-inline-flex align-items-center gap-1 shadow-2xs"
                  style={{ fontSize: '0.75rem' }}
                >
                  <span className="text-secondary fw-normal">Currency:</span>
                  <span className="fw-bold ms-1" style={{ color: '#0284c7' }}>
                    {targetSettings?.currency || client?.currency || 'USD'}
                  </span>
                </span>
              </div>
              <button
                type="button"
                className="btn btn-xs btn-outline-primary d-inline-flex align-items-center px-2.5 py-1 rounded-2 shadow-2xs fw-semibold no-print"
                style={{ fontSize: '0.74rem' }}
                onClick={handleOpenTargetModal}
                title="Edit Client Target Settings"
              >
                Edit Targets
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tab Navigation (with Smooth Navigation Handlers) ──── */}
        <div className="d-flex align-items-center border-bottom mb-4 no-print position-relative gap-2">
          {/* Left Arrow Handler Button */}
          <button
            className="tab-scroll-btn"
            onClick={() => handleTabScroll('left')}
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Scrollable Tabs List with Drag & Wheel Support */}
          <div
            ref={tabsContainerRef}
            className="flex-grow-1"
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUpOrLeave}
            onMouseLeave={handleTabsMouseUpOrLeave}
            onWheel={handleTabsWheel}
            style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: isDraggingTabs ? 'grabbing' : 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'pan-x',
            }}
          >
            <div className="d-inline-flex gap-1" style={{ pointerEvents: isDraggingTabs ? 'none' : 'auto' }}>
              {TABS.map((tab) => {
                const isPlatform = ['meta', 'google', 'snapchat', 'tiktok'].includes(tab.key);
                const isDisconnected = isPlatform && platformsState[tab.key]?.connected === false;

                return (
                  <button
                    key={tab.key}
                    className={`btn btn-link text-decoration-none rounded-0 tab-btn d-inline-flex align-items-center gap-2 ${activeTab === tab.key ? 'active' : 'text-secondary'}`}
                    onClick={() => {
                      if (!hasMovedDragRef.current && !isDraggingTabs) {
                        handleTabChange(tab.key);
                      }
                    }}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {isDisconnected && (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-1.5 py-0.5 ms-0.5" style={{ fontSize: '0.66rem' }}>
                        Disconnected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Handler Button */}
          <button
            className="tab-scroll-btn"
            onClick={() => handleTabScroll('right')}
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ─── Tab Content ───────────────────────────────────────── */}

        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <div className="d-flex flex-column gap-4">

            {/* ─── Client KPIs & Interval Bar with Customize KPIs Button ─── */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="d-inline-flex align-items-center gap-1.5 text-secondary small fw-semibold">
                    <IconCalendar /> <span>{dateRange}</span>
                  </span>
                  <span className="text-body-tertiary opacity-75 d-none d-sm-inline">&bull;</span>
                  <span
                    className="badge bg-body-tertiary text-secondary border px-2.5 py-1 small d-inline-flex align-items-center gap-1.5 shadow-2xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                    </svg>
                    <span>Last synced: <strong className="text-body-emphasis">{overviewLastSync?.lastSync || 'Just now'}</strong></span>
                  </span>
                </div>
                <div className="position-relative no-print kpi-selector-container">
                  <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2" onClick={() => setShowKPISelector(!showKPISelector)}>
                    <IconGear /> <span className="fw-semibold">Customize KPIs</span>
                  </button>
                  {showKPISelector && (
                    <div className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-lg p-3" style={{ zIndex: 1050, minWidth: 260 }}>
                      <h6 className="fw-bold small mb-2">Select KPIs to pin (max 5)</h6>
                      <div className="d-flex flex-column gap-1">
                        {availableKPIs.map((kpi) => {
                          const isPinned = pinnedKPIs.includes(kpi.key);
                          return (
                            <label key={kpi.key} className={`d-flex align-items-center gap-2 px-2 py-1 rounded-2 cursor-pointer ${isPinned ? 'bg-primary-subtle' : 'bg-transparent'}`} style={{ cursor: 'pointer' }}>
                              <input type="checkbox" className="form-check-input m-0" checked={isPinned} onChange={() => toggleKPI(kpi.key)} disabled={!isPinned && pinnedKPIs.length >= 5} />
                              <span className="small">{kpi.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <button className="btn btn-sm btn-primary w-100 mt-2" onClick={() => setShowKPISelector(false)}>Done</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="kpi-grid-5">
                {pinnedKPIs.slice(0, 5).map((key) => {
                  const kpiDef = availableKPIs.find((k) => k.key === key || (key === 'spend' && k.key === 'totalSpend') || (key === 'revenue' && k.key === 'totalRevenue'));
                  const kpiData = clientKPIs[key] || (key === 'spend' ? clientKPIs.totalSpend : key === 'revenue' ? clientKPIs.totalRevenue : null);
                  if (!kpiDef || !kpiData) return null;
                  const isPositive = kpiData.change >= 0;
                  // For cost KPIs, decrease is good
                  const isCostKPI = ['cpc', 'cpm', 'cpa', 'spend', 'totalSpend'].includes(key);
                  const isGood = isCostKPI ? !isPositive : isPositive;

                  return (
                    <div key={key}>
                      <div className="card border-0 shadow-sm rounded-3 kpi-card h-100">
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-secondary fw-semibold small text-truncate" title={kpiDef.label}>{kpiDef.label}</span>
                            <KpiMetricBadge metricKey={kpiDef.key} color={kpiDef.color} label={kpiDef.label} size={34} />
                          </div>
                          <div className="fs-3 fw-bold text-body-emphasis my-1 text-truncate">
                            {formatKPIValue(kpiData.value, kpiDef.format, clientReportingCurrency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1. Spend vs Revenue & ROAS by Platform Charts */}
            <div className="row g-4">
              {/* Spend vs Revenue Line Chart */}
              <div className="col-xl-7 col-12">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1 fw-bold">Metrics Chart</h5>
                      <small className="text-secondary">Performance trend comparison over time</small>
                    </div>
                    <span className="badge bg-primary-subtle text-primary-emphasis px-2.5 py-1.5 rounded-pill fw-semibold shadow-xs" style={{ fontSize: '0.8rem' }}>
                      {fullMonthText}
                    </span>
                  </div>
                  <div className="card-body p-4">
                    {/* Selectable Metric Legend Buttons */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      {Object.entries(CHART_METRICS).map(([key, cfg]) => {
                        const isSelected = selectedMetrics.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleMetricToggle(key)}
                            className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 rounded-pill transition-all ${isSelected
                              ? 'bg-body-tertiary border text-body-emphasis fw-semibold shadow-xs'
                              : 'bg-transparent border text-body-secondary'
                              }`}
                            style={{
                              fontSize: '0.78rem',
                              borderColor: isSelected ? cfg.color : 'rgba(0,0,0,0.12)',
                              backgroundColor: isSelected ? `${cfg.color}15` : 'transparent',
                            }}
                          >
                            <span
                              className="rounded-circle d-inline-block"
                              style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: cfg.color,
                                opacity: isSelected ? 1 : 0.35,
                              }}
                            />
                            <span>{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <ApexChart
                      options={spendVsRevenueOptions}
                      series={spendVsRevenueSeries}
                      type="area"
                      height={300}
                    />
                  </div>
                </div>
              </div>

              {/* ROAS by Platform Bar Chart */}
              <div className="col-xl-5 col-12">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1 fw-bold">ROAS by Platform</h5>
                      <small className="text-secondary">Return on ad spend across channels</small>
                    </div>
                    <span className="badge bg-success-subtle text-success-emphasis px-2.5 py-1">Target: 3.0x</span>
                  </div>
                  <div className="card-body p-4">
                    <ApexChart
                      options={roasChartOptions}
                      series={roasChartSeries}
                      type="bar"
                      height={300}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Platforms Barrier / Section Divider ─── */}
            <div className="d-flex align-items-center gap-3 my-2 no-print">
              <div className="flex-grow-1 border-top" style={{ borderColor: 'var(--bs-border-color)', opacity: 0.6 }}></div>
              <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-body-tertiary border rounded-pill text-body-secondary small fw-semibold shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                <span className="text-uppercase tracking-wider" style={{ fontSize: '0.72rem', letterSpacing: '0.6px' }}>
                  Platforms Breakdown
                </span>
              </div>
              <div className="flex-grow-1 border-top" style={{ borderColor: 'var(--bs-border-color)', opacity: 0.6 }}></div>
            </div>

            {/* 2. Platforms Comparison Table with Totals */}
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1 fw-bold text-body-emphasis">Platforms Comparison</h5>
                  <small className="text-secondary">Full cross-platform metrics breakdown with summary aggregate</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-body-tertiary text-body border px-2.5 py-1">
                    {connectedPlatformsCount} of {platformEntries.length} Connected
                  </span>
                  {disconnectedPlatformsCount > 0 && (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1">
                      {disconnectedPlatformsCount} Disconnected
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle text-nowrap mb-0 table-hover">
                    <thead className="table-light bg-body-tertiary">
                      <tr>
                        <th className="ps-4 text-body fw-bold">Platform</th>
                        {renderPlatCompSortTH('spend', 'Spend')}
                        {renderPlatCompSortTH('revenue', 'Revenue')}
                        {renderPlatCompSortTH('roas', 'ROAS')}
                        {renderPlatCompSortTH('impressions', 'Impressions')}
                        {renderPlatCompSortTH('clicks', 'Clicks')}
                        {renderPlatCompSortTH('ctr', 'CTR')}
                        {renderPlatCompSortTH('conversions', 'Conversions')}
                        {renderPlatCompSortTH('cpa', 'CPA', true)}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlatformEntries.map(([key, plat]) => {
                        const isConnected = platformsState[key]?.connected !== false;
                        const isRef = !!platformRefreshing[key];
                        return (
                          <tr
                            key={key}
                            className={`platform-row ${!isConnected ? 'table-light-subtle opacity-75' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTabChange(key)}
                            title={`Click to view detailed ${plat.label} tab${!isConnected ? ' (Disconnected)' : ''}`}
                          >
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <span className={`badge rounded-circle p-1.5 ${key === 'meta' ? 'bg-primary' : key === 'google' ? 'bg-danger' : key === 'snapchat' ? 'bg-warning' : 'bg-dark'}`}>
                                  <span className="visually-hidden">{plat.label}</span>
                                </span>
                                <span className="fw-bold text-body-emphasis fs-6">{plat.label}</span>
                                {!isConnected ? (
                                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-0.5 d-inline-flex align-items-center gap-1 ms-1" style={{ fontSize: '0.68rem' }}>
                                    <span className="d-inline-block rounded-circle bg-danger" style={{ width: 5, height: 5 }}></span>
                                    Disconnected
                                  </span>
                                ) : (
                                  <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-1.5 py-0.5 d-inline-flex align-items-center gap-1 ms-1" style={{ fontSize: '0.68rem' }}>
                                    <span className="d-inline-block rounded-circle bg-success" style={{ width: 5, height: 5 }}></span>
                                    Active
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="fw-semibold text-body-emphasis">
                              {isConnected ? `${clientCurrSymbol}${plat.kpis.spend.toLocaleString()}` : <span className="text-secondary">{clientCurrSymbol}{plat.kpis.spend.toLocaleString()}</span>}
                            </td>
                            <td className="text-success fw-bold">
                              {isConnected ? `${clientCurrSymbol}${plat.kpis.revenue.toLocaleString()}` : <span className="text-secondary">{clientCurrSymbol}{plat.kpis.revenue.toLocaleString()}</span>}
                            </td>
                            <td>
                              <span className={`badge ${isConnected ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-body-secondary text-secondary border'} fw-bold px-2.5 py-1 fs-6`}>
                                {plat.kpis.roas.toFixed(2)}x
                              </span>
                            </td>
                            <td className="text-body fw-medium">{plat.kpis.impressions.toLocaleString()}</td>
                            <td className="text-body fw-medium">{plat.kpis.clicks.toLocaleString()}</td>
                            <td>
                              <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-semibold px-2 py-1">
                                {plat.kpis.ctr.toFixed(2)}%
                              </span>
                            </td>
                            <td className="fw-bold text-body-emphasis">{plat.kpis.conversions.toLocaleString()}</td>
                            <td className="pe-4 fw-semibold text-body-emphasis">{clientCurrSymbol}{plat.kpis.cpa.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light bg-body-tertiary border-top border-2 border-secondary-subtle">
                      <tr className="fw-bold">
                        <td className="ps-4 text-body-emphasis fs-6">Total / Aggregate</td>
                        <td className="text-body-emphasis fs-6 fw-bold">{clientCurrSymbol}{totalSpend.toLocaleString()}</td>
                        <td className="text-success fs-6 fw-bold">{clientCurrSymbol}{totalRevenue.toLocaleString()}</td>
                        <td>
                          <span className="badge bg-success text-white fw-bold px-2.5 py-1 fs-6 shadow-sm">
                            {totalRoas.toFixed(2)}x
                          </span>
                        </td>
                        <td className="text-body-emphasis fw-bold">{totalImpressions.toLocaleString()}</td>
                        <td className="text-body-emphasis fw-bold">{totalClicks.toLocaleString()}</td>
                        <td>
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-bold px-2 py-1">
                            {totalCtr.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-body-emphasis fs-6 fw-bold">{totalConversions.toLocaleString()}</td>
                        <td className="pe-4 text-body-emphasis fs-6 fw-bold">{clientCurrSymbol}{totalCpa.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* ─── Barrier / Section Divider ─── */}
            <div className="d-flex align-items-center gap-3 my-2 no-print">
              <div className="flex-grow-1 border-top" style={{ borderColor: 'var(--bs-border-color)', opacity: 0.6 }}></div>
              <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-body-tertiary border rounded-pill text-body-secondary small fw-semibold shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
                <span className="text-uppercase tracking-wider" style={{ fontSize: '0.72rem', letterSpacing: '0.6px' }}>
                  Campaigns Breakdown
                </span>
              </div>
              <div className="flex-grow-1 border-top" style={{ borderColor: 'var(--bs-border-color)', opacity: 0.6 }}></div>
            </div>

            {/* 3. Campaign Performance Table */}
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-header bg-transparent border-bottom p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0 fw-bold text-body-emphasis">Campaign Performance</h5>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-0.5 small fw-semibold">
                        {filteredOverviewCampaigns.length} of {allOverviewCampaigns.length} Campaigns
                      </span>
                    </div>
                    <small className="text-secondary">
                      All advertising campaigns for {client?.companyName || 'this client'} across active channels
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap pt-3 border-top">
                  {/* Search Input */}
                  <div className="position-relative flex-grow-1" style={{ minWidth: 200, maxWidth: 360 }}>
                    <input
                      type="text"
                      className="form-control form-control-sm ps-4 rounded-2"
                      placeholder="Search campaign name..."
                      value={overviewSearchQuery}
                      onChange={(e) => setOverviewSearchQuery(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="position-absolute start-0 top-50 translate-middle-y ms-2.5 text-secondary"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {overviewSearchQuery && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none p-0 me-2"
                        onClick={() => setOverviewSearchQuery('')}
                        style={{ fontSize: '0.75rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Right-aligned Status Dropdown & Filter Menu */}
                  <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
                    {/* Status Filter */}
                    <select
                      className="form-select form-select-sm rounded-2 text-secondary fw-semibold"
                      value={overviewStatusFilter}
                      onChange={(e) => setOverviewStatusFilter(e.target.value)}
                      style={{ width: 'auto', fontSize: '0.82rem' }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Filter Menu Dropdown Button */}
                    <div className="position-relative" ref={filterMenuRef}>
                      <button
                        type="button"
                        onClick={handleToggleFilterMenu}
                        className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-1.5 fw-semibold rounded-2 ${activeOverviewFiltersCount > 0 ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                          }`}
                        title="Toggle filter menu"
                        aria-expanded={showFilterMenu}
                        style={{ fontSize: '0.82rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span>Filters</span>
                        {activeOverviewFiltersCount > 0 && (
                          <span className="badge bg-white text-primary rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                            {activeOverviewFiltersCount}
                          </span>
                        )}
                      </button>

                      {/* Dropdown Filter Menu Popover */}
                      {showFilterMenu && (
                        <div
                          className="card border shadow-lg rounded-3 position-absolute end-0 mt-2 bg-body p-3"
                          style={{
                            width: 290,
                            maxWidth: '90vw',
                            zIndex: 1050,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                              </svg>
                              <span className="fw-bold text-body-emphasis small mb-0">Filter Campaigns</span>
                            </div>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowFilterMenu(false)}
                              aria-label="Close"
                              style={{ fontSize: '0.65rem' }}
                            ></button>
                          </div>

                          <form onSubmit={handleApplyFilterMenu}>
                            <div className="d-flex flex-column gap-2.5">
                              {/* 1. Platform Filter */}
                              <div>
                                <label className="form-label small fw-semibold text-secondary mb-1">Platform</label>
                                <select
                                  className="form-select form-select-sm rounded-2 text-body"
                                  value={draftOverviewFilters.platform}
                                  onChange={(e) => setDraftOverviewFilters((prev) => ({ ...prev, platform: e.target.value }))}
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  <option value="ALL">All Platforms</option>
                                  <option value="meta">Meta Ads</option>
                                  <option value="google">Google Ads</option>
                                  <option value="snapchat">Snapchat Ads</option>
                                  <option value="tiktok">TikTok Ads</option>
                                </select>
                              </div>

                              {/* 2. Status Filter */}
                              <div>
                                <label className="form-label small fw-semibold text-secondary mb-1">Status</label>
                                <select
                                  className="form-select form-select-sm rounded-2 text-body"
                                  value={draftOverviewFilters.status}
                                  onChange={(e) => setDraftOverviewFilters((prev) => ({ ...prev, status: e.target.value }))}
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  <option value="ALL">All Statuses</option>
                                  <option value="active">Active</option>
                                  <option value="paused">Paused</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>

                              {/* 3. Objective Filter */}
                              <div>
                                <label className="form-label small fw-semibold text-secondary mb-1">Objective</label>
                                <select
                                  className="form-select form-select-sm rounded-2 text-body"
                                  value={draftOverviewFilters.objective}
                                  onChange={(e) => setDraftOverviewFilters((prev) => ({ ...prev, objective: e.target.value }))}
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  <option value="ALL">All Objectives</option>
                                  <option value="Sales">Sales</option>
                                  <option value="Traffic">Traffic</option>
                                  <option value="Awareness">Awareness</option>
                                  <option value="Leads">Leads</option>
                                  <option value="Conversions">Conversions</option>
                                </select>
                              </div>

                              {/* Action Buttons */}
                              <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-secondary text-decoration-none p-0 fw-semibold"
                                  onClick={handleResetFilterMenu}
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  Reset all
                                </button>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border px-2.5 rounded-2"
                                    onClick={() => setShowFilterMenu(false)}
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="btn btn-sm btn-primary px-3 rounded-2 fw-semibold"
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Filter Chips Bar */}
                {(overviewSearchQuery || overviewStatusFilter !== 'all' || overviewFilters.platform !== 'ALL' || overviewFilters.status !== 'ALL' || overviewFilters.objective !== 'ALL') && (
                  <div className="d-flex align-items-center gap-2 flex-wrap pt-2 mt-2 border-top no-print" style={{ fontSize: '0.8rem' }}>
                    <span className="fw-semibold text-secondary small">Active Filters:</span>

                    {/* Platform Tag */}
                    {overviewFilters.platform !== 'ALL' && (
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                        <span>Platform: {overviewFilters.platform === 'meta' ? 'Meta' : overviewFilters.platform === 'google' ? 'Google' : overviewFilters.platform === 'snapchat' ? 'Snap' : 'TikTok'}</span>
                        <button
                          type="button"
                          className="btn-close btn-close-xs ms-1"
                          style={{ fontSize: '0.55rem' }}
                          onClick={() => setOverviewFilters((prev) => ({ ...prev, platform: 'ALL' }))}
                          aria-label="Remove platform filter"
                        ></button>
                      </span>
                    )}

                    {/* Status Tag */}
                    {(overviewStatusFilter !== 'all' || overviewFilters.status !== 'ALL') && (
                      <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                        <span className="d-inline-block rounded-circle bg-success" style={{ width: 6, height: 6 }}></span>
                        <span>Status: {overviewFilters.status !== 'ALL' ? overviewFilters.status : overviewStatusFilter}</span>
                        <button
                          type="button"
                          className="btn-close btn-close-xs ms-1"
                          style={{ fontSize: '0.55rem' }}
                          onClick={() => {
                            setOverviewStatusFilter('all');
                            setOverviewFilters((prev) => ({ ...prev, status: 'ALL' }));
                          }}
                          aria-label="Remove status filter"
                        ></button>
                      </span>
                    )}

                    {/* Objective Tag */}
                    {overviewFilters.objective !== 'ALL' && (
                      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                        <span>Objective: {overviewFilters.objective}</span>
                        <button
                          type="button"
                          className="btn-close btn-close-xs ms-1"
                          style={{ fontSize: '0.55rem' }}
                          onClick={() => setOverviewFilters((prev) => ({ ...prev, objective: 'ALL' }))}
                          aria-label="Remove objective filter"
                        ></button>
                      </span>
                    )}

                    {/* Search Tag */}
                    {overviewSearchQuery && (
                      <span className="badge bg-body-tertiary text-body border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                        <span>"{overviewSearchQuery}"</span>
                        <button
                          type="button"
                          className="btn-close btn-close-xs ms-1"
                          style={{ fontSize: '0.55rem' }}
                          onClick={() => setOverviewSearchQuery('')}
                          aria-label="Remove search filter"
                        ></button>
                      </span>
                    )}

                    {/* Clear All Link */}
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-auto fw-semibold"
                      style={{ fontSize: '0.78rem' }}
                      onClick={handleResetFilterMenu}
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0 table-hover w-100">
                    <thead className="table-light bg-body-tertiary">
                      <tr>
                        <th className="ps-4 text-body fw-bold" style={{ minWidth: 180, maxWidth: 260 }}>Campaign</th>
                        <th className="text-body fw-bold" style={{ width: 80 }}>Platform</th>
                        <th className="text-body fw-bold" style={{ width: 100 }}>Status</th>
                        <th className="text-body fw-bold" style={{ width: 110 }}>Objective</th>

                        {/* Spend Header (Click to Sort) */}
                        <th
                          className={`fw-bold user-select-none text-nowrap ${overviewSortField === 'spend' ? 'text-primary' : 'text-body'}`}
                          style={{ cursor: 'pointer', width: 100 }}
                          onClick={() => handleOverviewSort('spend')}
                          title="Click to sort by Spend"
                        >
                          <div className="d-inline-flex align-items-center gap-1">
                            <span>Spend</span>
                            {renderSortIndicator('spend')}
                          </div>
                        </th>

                        {/* Revenue Header (Click to Sort) */}
                        <th
                          className={`fw-bold user-select-none text-nowrap ${overviewSortField === 'revenue' ? 'text-primary' : 'text-body'}`}
                          style={{ cursor: 'pointer', width: 100 }}
                          onClick={() => handleOverviewSort('revenue')}
                          title="Click to sort by Revenue"
                        >
                          <div className="d-inline-flex align-items-center gap-1">
                            <span>Revenue</span>
                            {renderSortIndicator('revenue')}
                          </div>
                        </th>

                        {/* ROAS Header (Click to Sort) */}
                        <th
                          className={`fw-bold user-select-none text-nowrap ${overviewSortField === 'roas' ? 'text-primary' : 'text-body'}`}
                          style={{ cursor: 'pointer', width: 80 }}
                          onClick={() => handleOverviewSort('roas')}
                          title="Click to sort by ROAS"
                        >
                          <div className="d-inline-flex align-items-center gap-1">
                            <span>ROAS</span>
                            {renderSortIndicator('roas')}
                          </div>
                        </th>

                        {/* Start Date Header (Click to Sort) */}
                        <th
                          className={`text-center fw-bold user-select-none text-nowrap ${overviewSortField === 'startDate' ? 'text-primary' : 'text-body'}`}
                          style={{ cursor: 'pointer', width: 110 }}
                          onClick={() => handleOverviewSort('startDate')}
                          title="Click to sort by Start Date"
                        >
                          <div className="d-inline-flex align-items-center gap-1 justify-content-center w-100">
                            <span>Start Date</span>
                            {renderSortIndicator('startDate')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-secondary">
                            No campaigns match your search or selected filters.
                          </td>
                        </tr>
                      ) : (
                        visibleCampaigns.map((camp) => {
                          const statusBadge =
                            camp.status === 'Active'
                              ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                              : camp.status === 'Paused'
                                ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
                                : 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle';

                          return (
                            <tr
                              key={camp.id}
                              className="platform-row cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/Campaigns/${camp.id}`, { state: { clientId: id } })}
                              title={`Click to view ${camp.name} details`}
                            >
                              {/* 1. Campaign Name */}
                              <td className="ps-4" style={{ maxWidth: 260 }}>
                                <span
                                  className="fw-bold text-primary text-truncate d-block"
                                  style={{
                                    fontSize: '0.88rem',
                                    letterSpacing: '-0.01em',
                                    maxWidth: 240,
                                  }}
                                  title={camp.name}
                                >
                                  {camp.name}
                                </span>
                              </td>

                              {/* 2. Platform */}
                              <td>
                                <div
                                  className="d-inline-flex align-items-center justify-content-center rounded-2 border shadow-2xs"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor:
                                      camp.platformKey === 'meta'
                                        ? 'rgba(24, 119, 242, 0.08)'
                                        : camp.platformKey === 'google'
                                          ? 'rgba(234, 67, 53, 0.08)'
                                          : camp.platformKey === 'snapchat'
                                            ? 'rgba(234, 179, 8, 0.12)'
                                            : 'rgba(24, 24, 27, 0.08)',
                                    borderColor:
                                      camp.platformKey === 'meta'
                                        ? 'rgba(24, 119, 242, 0.2)'
                                        : camp.platformKey === 'google'
                                          ? 'rgba(234, 67, 53, 0.2)'
                                          : camp.platformKey === 'snapchat'
                                            ? 'rgba(234, 179, 8, 0.25)'
                                            : 'rgba(63, 63, 70, 0.2)',
                                  }}
                                  title={camp.platformLabel}
                                  aria-label={camp.platformLabel}
                                >
                                  {getPlatformLogo(camp.platformKey)}
                                </div>
                              </td>

                              {/* 3. Status */}
                              <td>
                                <span className={`badge rounded-pill border px-2 py-0.5 fw-semibold d-inline-flex align-items-center gap-1 ${statusBadge}`} style={{ fontSize: '0.72rem' }}>
                                  <span className={`d-inline-block rounded-circle ${camp.status === 'Active' ? 'bg-success' : camp.status === 'Paused' ? 'bg-warning' : 'bg-secondary'}`} style={{ width: 5, height: 5 }}></span>
                                  {camp.status}
                                </span>
                              </td>

                              {/* 4. Objective */}
                              <td>
                                <span className="badge bg-body-tertiary text-body border fw-semibold px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                                  {camp.objective || 'Conversions'}
                                </span>
                              </td>

                              {/* 5. Spend (danger) */}
                              <td className="fw-bold text-danger text-nowrap" style={{ fontSize: '0.92rem' }}>
                                {clientCurrSymbol}{camp.spend.toLocaleString()}
                              </td>

                              {/* 6. Revenue (success) */}
                              <td className="fw-bold text-success text-nowrap" style={{ fontSize: '0.92rem' }}>
                                {clientCurrSymbol}{camp.revenue.toLocaleString()}
                              </td>

                              {/* 7. ROAS */}
                              <td className="text-nowrap">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2.5 py-1 fs-6">
                                  {camp.roas.toFixed(1)}x
                                </span>
                              </td>

                              {/* 8. Start Date */}
                              <td className="text-center fw-medium text-body-secondary text-nowrap" style={{ fontSize: '0.85rem' }}>
                                {camp.startDate || '01/07/26'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-secondary small">
                  Showing {visibleCampaigns.length} campaigns for {client?.companyName || 'this client'}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* === PLATFORM TABS (Meta, Google, Snapchat, TikTok) === */}
        {['meta', 'google', 'snapchat', 'tiktok'].includes(activeTab) && (
          <PlatformTabContent
            platform={platformTabState[activeTab]?.data}
            platformKey={activeTab}
            isLoading={!!platformTabState[activeTab]?.loading}
            errorMessage={platformTabState[activeTab]?.error}
            connectionState={platformsState[activeTab] || { connected: true, accountId: 'act_948291048', lastSync: '10m ago', lastSyncDate: 'Aug 18, 2026, 04:30 PM' }}
            onReconnect={() => handleReconnectPlatform(activeTab)}
            onRefresh={() => handleRefreshPlatform(activeTab)}
            isRefreshing={!!platformRefreshing[activeTab]}
            dateRange={dateRange}
            clientName={client?.companyName}
            clientId={id}
            clientMultiplier={1}
          />
        )}

        {/* === INSIGHTS TAB === */}
        {activeTab === 'insights' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">AI-Powered Insights & Recommendations</h5>
              <span className="badge bg-secondary-subtle text-secondary-emphasis">0 insights</span>
            </div>
            <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
              <div className="text-secondary fw-medium">No insights available for this client.</div>
            </div>
          </div>
        )}

        {/* === NOTES TAB === */}
        {activeTab === 'notes' && (
          <div>
            <h5 className="fw-bold mb-4">Client Notes</h5>

            {/* Add Note Form */}
            <div className="card border-0 shadow-sm rounded-3 mb-4 no-print">
              <div className="card-body p-4">
                <div className="d-flex gap-3">
                  <div className="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, minWidth: 40 }}>Y</div>
                  <div className="flex-grow-1">
                    <textarea
                      className="form-control border-0 bg-light rounded-3 mb-2"
                      rows={3}
                      placeholder="Add a note about this client..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <div className="text-end">
                      <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={handleAddNote} disabled={!newNote.trim()}>
                        <IconSend /> Post Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Timeline */}
            <div className="d-flex flex-column gap-3">
              {notes.length === 0 ? (
                <div className="text-center py-5 text-secondary">No notes yet. Be the first to add one!</div>
              ) : notes.map((note) => (
                <div key={note.id} className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-4">
                    <div className="d-flex gap-3">
                      <div className="avatar bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, minWidth: 40 }}>
                        {note.authorAvatar}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold small">{note.author}</span>
                          <span className="text-secondary small">{new Date(note.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="mb-0 small text-dark" style={{ lineHeight: 1.7 }}>{note.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── Edit Client Modal ──────────────────────────────────── */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          tabIndex="-1"
          onClick={() => setShowEditModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom p-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar bg-primary-subtle text-primary rounded-2 p-2 d-flex align-items-center justify-content-center">
                    <IconEdit />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Edit Client Information</h5>
                    <small className="text-secondary">Update company portfolio, contacts, and manager details</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  {editError && <div className="alert alert-danger mb-3 py-2 px-3 small">{editError}</div>}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Website <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://acme.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@acme.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: '110px' }}
                          value={formData.countryCode || '+1'}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+20">🇪🇬 +20</option>
                        </select>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="555-0199"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Company Logo</label>
                      <div className="p-3 rounded-3 border bg-light d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                        <div
                          className="position-relative d-flex align-items-center justify-content-center rounded-3 border bg-white flex-shrink-0 shadow-sm"
                          style={{ width: 56, height: 56, overflow: 'hidden' }}
                        >
                          {formData.logo ? (
                            <img
                              src={formData.logo}
                              alt="Logo preview"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center text-muted fw-bold" style={{ fontSize: '1.1rem' }}>
                              {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : '🏢'}
                            </div>
                          )}
                          {logoUploading && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                              <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                            </div>
                          )}
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <input
                              type="file"
                              ref={logoInputRef}
                              className="d-none"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                              onChange={handleLogoFileChange}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={logoUploading}
                            >
                              {logoUploading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{formData.logo ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                                </>
                              )}
                            </button>
                            {formData.logo && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                                disabled={logoUploading}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Supports PNG, JPG, WebP, SVG, GIF (max 5MB)
                          </div>
                          {logoUploadError && (
                            <div className="text-danger small mt-1">{logoUploadError}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Country <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="United States"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Business Model</label>
                      <select
                        className="form-select"
                        value={formData.businessModel}
                        onChange={(e) => setFormData({ ...formData, businessModel: parseInt(e.target.value, 10) })}
                      >
                        <option value={0}>E-Commerce</option>
                        <option value={1}>Lead Generation</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Currency</label>
                      <select
                        className="form-select"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: parseInt(e.target.value, 10) })}
                      >
                        {currencies.map((curr, idx) => (
                          <option key={curr || idx} value={idx}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                      >
                        {statuses.map((st, idx) => (
                          <option key={st || idx} value={idx}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label small fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional details, strategic directives..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 d-inline-flex align-items-center gap-2" disabled={editLoading}>
                    {editLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Target Settings Modal (Modern, Simple & Streamlined) ── */}
      {showTargetModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 540 }}>
            <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header border-bottom px-4 py-3 bg-body-tertiary">
                <div className="d-flex align-items-center" style={{ gap: '14px' }}>
                  <div className="avatar bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: 36, height: 36, marginRight: '2px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-body-emphasis" style={{ fontSize: '1.05rem' }}>Edit Targets</h5>
                    <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>{client?.companyName}</div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowTargetModal(false)} aria-label="Close"></button>
              </div>

              <form onSubmit={handleSaveTargets}>
                <div className="modal-body px-4 py-3.5 d-flex flex-column" style={{ gap: '16px' }}>
                  {targetError && <div className="alert alert-danger mb-0 py-2 px-3 small rounded-3">{targetError}</div>}

                  {/* ─── Monthly Budget & Currency ─── */}
                  <div className="row g-2.5">
                    <div className="col-sm-7">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Monthly Budget ({getCurrencySymbol(targetFormData.currency)}) <span className="text-danger ms-1 small">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary fw-semibold">
                          {getCurrencySymbol(targetFormData.currency)}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control fw-bold"
                          value={targetFormData.monthlyBudget}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val) || 0;
                            const roas = Number(targetFormData.targetRoas) || 4.0;
                            const cpa = Number(targetFormData.targetCpa) || 5.5;
                            setTargetFormData({
                              ...targetFormData,
                              monthlyBudget: val,
                              targetRevenue: Math.round(num * roas),
                              targetConversions: Math.round(num / Math.max(0.1, cpa)),
                            });
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Currency <span className="text-danger ms-1 small">*</span>
                      </label>
                      <select
                        className="form-select fw-semibold"
                        value={targetFormData.currency || (currencies[0] || 'USD')}
                        onChange={(e) => setTargetFormData({ ...targetFormData, currency: e.target.value })}
                      >
                        {currencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ─── Target ROAS & Target CPA ─── */}
                  <div className="row g-2.5">
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Target ROAS (x) <span className="text-danger ms-1 small">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          className="form-control fw-bold text-success"
                          value={targetFormData.targetRoas}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val) || 0;
                            const budget = Number(targetFormData.monthlyBudget) || 50000;
                            setTargetFormData({
                              ...targetFormData,
                              targetRoas: val,
                              targetRevenue: Math.round(budget * num),
                            });
                          }}
                          required
                        />
                        <span className="input-group-text bg-body-tertiary fw-semibold">x</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Target CPA ({getCurrencySymbol(targetFormData.currency)}) <span className="text-danger ms-1 small">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary fw-semibold">
                          {getCurrencySymbol(targetFormData.currency)}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          className="form-control fw-bold text-danger"
                          value={targetFormData.targetCpa}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = Number(val) || 0;
                            const budget = Number(targetFormData.monthlyBudget) || 50000;
                            setTargetFormData({
                              ...targetFormData,
                              targetCpa: val,
                              targetConversions: Math.round(budget / Math.max(0.1, num)),
                            });
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─── Target Revenue & Target Conversions (Editable Inputs) ─── */}
                  <div className="row g-2.5">
                    {/* Target Revenue Input */}
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Target Revenue ({getCurrencySymbol(targetFormData.currency)})
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-body-tertiary fw-semibold text-success">
                          {getCurrencySymbol(targetFormData.currency)}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control fw-bold text-success"
                          value={targetFormData.targetRevenue}
                          onChange={(e) => setTargetFormData({ ...targetFormData, targetRevenue: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Target Conversions Input */}
                    <div className="col-sm-6">
                      <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                        Target Conversions
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-control fw-bold text-info"
                        value={targetFormData.targetConversions}
                        onChange={(e) => setTargetFormData({ ...targetFormData, targetConversions: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer border-top px-4 py-2.5 bg-body-tertiary d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3 rounded-2"
                    onClick={() => setShowTargetModal(false)}
                    disabled={targetSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" disabled={targetSaving}>
                    {targetSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1.5" role="status" aria-hidden="true"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Targets</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast Notification ─────────────────────────────────── */}
      {toastMsg && (
        <div className="position-fixed bottom-0 end-0 m-4 no-print" style={{ zIndex: 1090 }}>
          <div className="alert alert-success d-flex align-items-center gap-2 shadow-lg mb-0 rounded-3 py-2 px-3 small">
            <IconCheck /> {toastMsg}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


// ════════════════════════════════════════════════════════════════════
// PLATFORM TAB SUB-COMPONENT
// ════════════════════════════════════════════════════════════════════

function PlatformTabContent({ platform, platformKey, isLoading, errorMessage, connectionState, onReconnect, onRefresh, isRefreshing, dateRange, clientName, clientId, clientMultiplier = 1 }) {
  const navigate = useNavigate();
  const [platCampSortField, setPlatCampSortField] = useState('spend');
  const [platCampSortDir, setPlatCampSortDir] = useState('desc');

  // Fixed default pinned KPIs for any platform
  const defaultPinnedMap = {
    meta: ['spend', 'revenue', 'roas', 'ctr', 'conversions'],
    google: ['spend', 'revenue', 'roas', 'ctr', 'conversions'],
    tiktok: ['spend', 'revenue', 'roas', 'ctr', 'conversions'],
    snapchat: ['spend', 'revenue', 'roas', 'ctr', 'conversions'],
  };

  const [showKPISelector, setShowKPISelector] = useState(false);
  const [pinnedKPIs, setPinnedKPIs] = useState(() => defaultPinnedMap[platformKey] || ['spend', 'revenue', 'roas', 'ctr', 'conversions']);

  // Click outside handler for platform KPI selector dropdown
  useEffect(() => {
    if (!showKPISelector) return;
    const handleOutsideClick = (e) => {
      const selector = e.target.closest('.platform-kpi-selector-container');
      if (!selector) setShowKPISelector(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showKPISelector]);

  if (isLoading) {
    return (
      <div className="card border-0 shadow-sm rounded-3 p-5 text-center my-4">
        <div className="d-flex flex-column align-items-center justify-content-center py-4">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading platform data...</span>
          </div>
          <span className="text-secondary fw-semibold">Loading {platformKey ? (platformKey.charAt(0).toUpperCase() + platformKey.slice(1)) : ''} Ads data...</span>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="card border-0 shadow-sm rounded-3 p-5 text-center my-4">
        <div className="d-flex flex-column align-items-center justify-content-center py-3">
          <div className="text-danger mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h6 className="fw-bold text-body-emphasis mb-1">Failed to load platform data</h6>
          <p className="text-secondary small mb-3">{errorMessage}</p>
          <button
            type="button"
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
            onClick={onRefresh}
          >
            <IconRefresh spinning={isRefreshing} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!platform) return <div className="text-center py-5 text-secondary">No data available for this platform.</div>;

  const isConnected = connectionState?.connected !== false;
  const rawKpis = platform.kpis || {};
  const isSnapchat = platformKey === 'snapchat';
  const isTikTok = platformKey === 'tiktok';
  const isGoogle = platformKey === 'google';
  const isMeta = platformKey === 'meta';

  const handlePlatCampSort = (field) => {
    if (platCampSortField === field) {
      setPlatCampSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setPlatCampSortField(field);
      setPlatCampSortDir('desc');
    }
  };

  const sortedPlatformCampaigns = [...(platform.campaigns || [])].sort((a, b) => {
    if (!platCampSortField) return 0;
    const getVal = (item, f) => {
      if (f === 'spend') return Number(item.spend) || 0;
      if (f === 'revenue') return Number(item.revenue) || 0;
      if (f === 'roas') {
        if (item.roas !== undefined && item.roas !== null) return Number(item.roas) || 0;
        const sp = Number(item.spend) || 0;
        const rev = Number(item.revenue) || 0;
        return sp > 0 ? rev / sp : 0;
      }
      if (f === 'startDate') {
        const d = item.startDate ? new Date(item.startDate).getTime() : 0;
        return isNaN(d) ? 0 : d;
      }
      return Number(item[f]) || 0;
    };
    const aVal = getVal(a, platCampSortField);
    const bVal = getVal(b, platCampSortField);
    return platCampSortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const renderPlatCampSortTH = (field, label, align = 'start', width, extraClass = '') => {
    const isActive = platCampSortField === field;
    return (
      <th
        className={`text-body fw-bold user-select-none text-nowrap ${align === 'center' ? 'text-center' : align === 'end' ? 'text-end' : ''} ${extraClass} ${isActive ? 'text-primary' : ''}`}
        style={{ cursor: 'pointer', width }}
        onClick={() => handlePlatCampSort(field)}
        title={`Sort by ${label} (${isActive && platCampSortDir === 'desc' ? 'Ascending' : 'Descending'})`}
      >
        <div className={`d-inline-flex align-items-center gap-1 ${align === 'center' ? 'justify-content-center' : align === 'end' ? 'justify-content-end' : ''}`}>
          <span>{label}</span>
          <span className={`small ${isActive ? 'text-primary fw-bold' : 'text-secondary opacity-50'}`} style={{ fontSize: '0.7rem' }}>
            {isActive ? (platCampSortDir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  // Platform metrics (direct from backend / platform object with reliable fallbacks)
  const spendVal = Number(rawKpis.spend) || 0;
  const conversionsVal = Number(rawKpis.conversions) || 0;
  const clicksVal = Number(rawKpis.clicks) || 0;
  const impressionsVal = Number(rawKpis.impressions) || 0;
  const roasVal = Number(rawKpis.roas) || 0;
  const revenueVal = Number(rawKpis.revenue) || (spendVal && roasVal ? spendVal * roasVal : 0);
  const ctrVal = Number(rawKpis.ctr) || (impressionsVal > 0 ? (clicksVal / impressionsVal) * 100 : 0);
  const cpcVal = Number(rawKpis.cpc) || (clicksVal > 0 ? spendVal / clicksVal : 0);
  const cpmVal = Number(rawKpis.cpm) || (impressionsVal > 0 ? (spendVal / impressionsVal) * 1000 : 0);
  const cpaVal = Number(rawKpis.cpa) || (conversionsVal > 0 ? spendVal / conversionsVal : 0);
  const conversionRateVal = Number(rawKpis.conversionRate) || (clicksVal > 0 ? (conversionsVal / clicksVal) * 100 : 0);

  const kpis = {
    spend: spendVal,
    revenue: revenueVal,
    roas: roasVal,
    ctr: ctrVal,
    cpc: cpcVal,
    cpm: cpmVal,
    impressions: impressionsVal,
    clicks: clicksVal,
    conversions: conversionsVal,
    cpa: cpaVal,
    conversionRate: conversionRateVal,
  };

  // Fixed KPI metrics across any platform tab: Spend, Revenue, ROAS, CTR, CPC, CPM, Impressions, Clicks, Conversions, CPA, Conversion Rate
  const platformKpiChanges = {
    meta: { spend: 6.4, revenue: 8.2, roas: 3.8, ctr: 8.5, cpc: -4.5, cpm: -2.8, impressions: 9.3, clicks: 12.0, conversions: 14.2, cpa: -4.1, conversionRate: 5.2 },
    google: { spend: 5.1, revenue: 9.4, roas: 7.2, ctr: 5.8, cpc: -3.2, cpm: -1.9, impressions: 8.1, clicks: 10.4, conversions: 11.8, cpa: -6.2, conversionRate: 4.8 },
    tiktok: { spend: 12.8, revenue: 15.6, roas: 4.0, ctr: 6.1, cpc: -5.1, cpm: -3.4, impressions: 18.2, clicks: 15.2, conversions: 18.5, cpa: -7.4, conversionRate: 6.0 },
    snapchat: { spend: 4.2, revenue: 6.8, roas: 2.1, ctr: 4.3, cpc: -2.8, cpm: -1.5, impressions: 14.5, clicks: 8.6, conversions: 9.4, cpa: -5.0, conversionRate: 3.7 },
  };

  const changes = platformKpiChanges[platformKey] || platformKpiChanges.meta;
  const availablePlatformKPIs = [
    { key: 'spend', label: 'Spend', format: 'currency', color: 'danger', change: changes.spend ?? 5.0 },
    { key: 'revenue', label: 'Revenue', format: 'currency', color: 'success', change: changes.revenue ?? 7.5 },
    { key: 'roas', label: 'ROAS', format: 'multiplier', color: 'primary', change: changes.roas ?? 3.5 },
    { key: 'ctr', label: 'CTR', format: 'percent', color: 'info', change: changes.ctr ?? 5.5 },
    { key: 'cpc', label: 'CPC', format: 'currency', color: 'warning', change: changes.cpc ?? -4.0 },
    { key: 'cpm', label: 'CPM', format: 'currency', color: 'secondary', change: changes.cpm ?? -2.5 },
    { key: 'impressions', label: 'Impressions', format: 'number', color: 'info', change: changes.impressions ?? 8.5 },
    { key: 'clicks', label: 'Clicks', format: 'number', color: 'primary', change: changes.clicks ?? 10.0 },
    { key: 'conversions', label: 'Conversions', format: 'number', color: 'success', change: changes.conversions ?? 12.0 },
    { key: 'cpa', label: 'CPA', format: 'currency', color: 'warning', change: changes.cpa ?? -5.0 },
    { key: 'conversionRate', label: 'Conversion Rate', format: 'percent', color: 'success', change: changes.conversionRate ?? 4.5 },
  ];

  const toggleKPI = (key) => {
    setPinnedKPIs((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 5) return prev;
      return [...prev, key];
    });
  };

  const platformCurrency = platform.currency || (platformKey === 'google' ? 'EUR' : platformKey === 'snapchat' ? 'SAR' : platformKey === 'tiktok' ? 'EGP' : 'USD');
  const currSymbol = getCurrencySymbol(platformCurrency);

  const formatValue = (val, format) => {
    if (val === undefined || val === null) return '—';
    switch (format) {
      case 'currency': return `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: val % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
      case 'multiplier': return `${Number(val).toFixed(2)}x`;
      case 'percent': return `${Number(val).toFixed(2)}%`;
      case 'score': return `${Number(val).toFixed(1)} / 10`;
      case 'millions': return `${(Number(val) / 1000000).toFixed(2)}M`;
      case 'number': return Number(val).toLocaleString();
      default: return String(val);
    }
  };

  return (
    <div>
      {/* Simple, Friendly Disconnection Notice */}
      {!isConnected && (
        <div className="alert bg-warning-subtle border-0 rounded-3 p-3 p-md-4 mb-4 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-warning bg-opacity-25 text-warning-emphasis d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 44, height: 44 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h6 className="fw-bold mb-1 text-body-emphasis">{platform.label} is currently disconnected for {clientName}</h6>
                <p className="text-secondary small mb-0">
                  Showing saved results from your last sync ({connectionState?.lastSyncDate || connectionState?.lastSync || 'earlier'}). Reconnect your account anytime to fetch live updates.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                className="btn btn-warning btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-2 shadow-xs"
                onClick={onReconnect}
                title={`Reconnect ${platform.label}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Reconnect Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Platform KPIs & Interval Bar with Customize KPIs Button & Platform Refresh Button ─── */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="d-inline-flex align-items-center gap-1.5 text-secondary small fw-semibold">
              <IconCalendar /> <span>{dateRange || 'Last 30 Days'}</span>
            </span>
            <span className="text-body-tertiary opacity-75 d-none d-sm-inline">&bull;</span>
            <span className="badge bg-body-tertiary text-secondary border px-2.5 py-1 small d-inline-flex align-items-center gap-1.5 shadow-2xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
              </svg>
              <span>Last synced: <strong className="text-body-emphasis">{connectionState?.lastSync || 'Just now'}</strong></span>
            </span>
            <span className="text-body-tertiary opacity-75 d-none d-sm-inline">&bull;</span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 small d-inline-flex align-items-center gap-1.5 shadow-2xs">
              <span>Currency: <strong className="text-primary-emphasis">{getCurrencyName(platformCurrency)} ({currSymbol.trim()})</strong></span>
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 no-print">
            <button
              type="button"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-2 shadow-sm fw-semibold"
              onClick={onRefresh}
              disabled={isRefreshing}
              title={`Refresh ${platform.label} data`}
              aria-label={`Refresh ${platform.label} data`}
            >
              <IconRefresh spinning={isRefreshing} />
              <span>{isRefreshing ? 'Syncing...' : `Refresh ${platform.label ? platform.label.replace(/\s+Ads$/i, '') : ''}`}</span>
            </button>
            <div className="position-relative platform-kpi-selector-container">
              <button
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
                onClick={() => setShowKPISelector(!showKPISelector)}
              >
                <IconGear /> <span className="fw-semibold">Customize KPIs</span>
              </button>
              {showKPISelector && (
                <div className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-lg p-3" style={{ zIndex: 1050, minWidth: 280 }}>
                  <h6 className="fw-bold small mb-2">Select {platform.label} KPIs (max 5)</h6>
                  <div className="d-flex flex-column gap-1">
                    {availablePlatformKPIs.map((kpi) => {
                      const isPinned = pinnedKPIs.includes(kpi.key);
                      return (
                        <label
                          key={kpi.key}
                          className={`d-flex align-items-center gap-2 px-2 py-1 rounded-2 cursor-pointer ${isPinned ? 'bg-primary-subtle' : 'bg-transparent'}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input m-0"
                            checked={isPinned}
                            onChange={() => toggleKPI(kpi.key)}
                            disabled={!isPinned && pinnedKPIs.length >= 5}
                          />
                          <span className="small">{kpi.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button className="btn btn-sm btn-primary w-100 mt-2" onClick={() => setShowKPISelector(false)}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic KPI Cards Grid (Strictly platform-specific to this client) */}
        <div className="kpi-grid-5">
          {pinnedKPIs.slice(0, 5).map((key) => {
            const kpiDef = availablePlatformKPIs.find((k) => k.key === key);
            if (!kpiDef) return null;
            const rawVal = kpis[key];
            const isCostKPI = ['cpc', 'cpm', 'cpa', 'spend'].includes(key);
            const mockChange = kpiDef.change || 4.2;
            const isPositive = mockChange >= 0;
            const isGood = isCostKPI ? !isPositive : isPositive;

            return (
              <div key={key}>
                <div className="card border-0 shadow-sm rounded-3 kpi-card h-100">
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary fw-semibold small text-truncate" title={kpiDef.label}>
                        {kpiDef.label}
                      </span>
                      <KpiMetricBadge metricKey={kpiDef.key} color={kpiDef.color} label={kpiDef.label} size={34} />
                    </div>
                    <div className="fs-3 fw-bold text-body-emphasis my-1 text-truncate">
                      {formatValue(rawVal, kpiDef.format)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0 fw-bold">Campaigns ({platform.campaigns.length})</h6>
            {!isConnected && (
              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle small px-2 py-0.5">
                Last Synced Records
              </span>
            )}
          </div>
          {!isConnected && (
            <span className="text-secondary small">
              Snapshot as of {connectionState?.lastSyncDate || connectionState?.lastSync || 'Aug 18, 2026'}
            </span>
          )}
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle text-nowrap mb-0 table-hover">
              <thead className="table-light bg-body-tertiary">
                <tr>
                  <th className="ps-4 text-body fw-bold" style={{ minWidth: 180, maxWidth: 260 }}>Campaign</th>
                  <th className="text-body fw-bold" style={{ width: 100 }}>Status</th>
                  <th className="text-body fw-bold" style={{ width: 110 }}>Objective</th>
                  {renderPlatCampSortTH('spend', 'Spend', 'start', 110)}
                  {renderPlatCampSortTH('revenue', 'Revenue', 'start', 110)}
                  {renderPlatCampSortTH('roas', 'ROAS', 'start', 90)}
                  {renderPlatCampSortTH('startDate', 'Start Date', 'center', 110, 'pe-4')}
                </tr>
              </thead>
              <tbody>
                {sortedPlatformCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">
                      No campaigns found for this platform.
                    </td>
                  </tr>
                ) : (
                  sortedPlatformCampaigns.map((camp, idx) => {
                    const defaultObjectives = ['Sales', 'Traffic', 'Awareness', 'Leads', 'Conversions'];
                    const defaultDates = ['01/07/26', '10/07/26', '15/06/26', '22/05/26', '04/04/26', '18/03/26'];

                    const statusName = typeof camp.status === 'number'
                      ? (getCampaignStatusName(camp.status) || 'Active')
                      : (camp.status || 'Active');

                    const statusBadge =
                      statusName === 'Active'
                        ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                        : statusName === 'Paused'
                          ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
                          : 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle';

                    const objectiveName = typeof camp.objective === 'number'
                      ? (getCampaignObjectiveName(camp.objective) || 'Conversions')
                      : (camp.objective || defaultObjectives[idx % defaultObjectives.length]);

                    const startDateDisplay = camp.startDate
                      ? (new Date(camp.startDate).toLocaleDateString('en-GB') !== 'Invalid Date'
                        ? new Date(camp.startDate).toLocaleDateString('en-GB')
                        : camp.startDate)
                      : defaultDates[idx % defaultDates.length];

                    const roasVal = Number(camp.roas || 0);

                    return (
                      <tr
                        key={camp.id || idx}
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/Campaigns/${camp.id}`, { state: { clientId } })}
                        title={`Click to view ${camp.name} details`}
                      >
                        {/* 1. Campaign Name */}
                        <td className="ps-4" style={{ maxWidth: 260 }}>
                          <span
                            className="fw-bold text-primary text-truncate d-block"
                            style={{
                              fontSize: '0.88rem',
                              letterSpacing: '-0.01em',
                              maxWidth: 240,
                            }}
                            title={camp.name}
                          >
                            {camp.name}
                          </span>
                        </td>

                        {/* 2. Status */}
                        <td>
                          <span className={`badge rounded-pill border px-2 py-0.5 fw-semibold d-inline-flex align-items-center gap-1 ${statusBadge}`} style={{ fontSize: '0.72rem' }}>
                            <span className={`d-inline-block rounded-circle ${statusName === 'Active' ? 'bg-success' : statusName === 'Paused' ? 'bg-warning' : 'bg-secondary'}`} style={{ width: 5, height: 5 }}></span>
                            {statusName}
                          </span>
                        </td>

                        {/* 3. Objective */}
                        <td>
                          <span className="badge bg-body-tertiary text-body border fw-semibold px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                            {objectiveName}
                          </span>
                        </td>

                        {/* 4. Spend */}
                        <td className="fw-bold text-danger text-nowrap" style={{ fontSize: '0.92rem' }}>
                          {currSymbol}{Number(camp.spend || 0).toLocaleString()}
                        </td>

                        {/* 5. Revenue */}
                        <td className="fw-bold text-success text-nowrap" style={{ fontSize: '0.92rem' }}>
                          {currSymbol}{Number(camp.revenue || 0).toLocaleString()}
                        </td>

                        {/* 6. ROAS */}
                        <td className="text-nowrap">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2.5 py-1 fs-6">
                            {roasVal.toFixed(1)}x
                          </span>
                        </td>

                        {/* 7. Start Date */}
                        <td className="text-center fw-medium text-body-secondary text-nowrap pe-4" style={{ fontSize: '0.85rem' }}>
                          {startDateDisplay}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
