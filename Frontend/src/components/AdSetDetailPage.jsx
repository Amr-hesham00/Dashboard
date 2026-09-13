import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApexCharts from 'apexcharts';
import DashboardLayout from './DashboardLayout';
import { getClientByIdApi } from '../api/clients';
import { getCampaignByIdApi } from '../api/campaigns';
import { getAdSetByIdApi } from '../api/adsets';
import { getAdsByAdSetIdApi } from '../api/ads';
import {
  resolveClientAndCampaign,
  getCampaignAdSets,
  getAdSetAds,
  availableAdSetKPIs,
  defaultAdSetPinnedKPIs,
  generateAdSetTimeSeries,
  aggregateTimeSeriesByMonth,
} from '../mock/mockData';
import metaIcon from '../assets/meta-icon.webp';
import KpiMetricBadge from './KpiMetricBadge';
import PeriodSelector from './PeriodSelector';

// ─── ApexCharts React Wrapper ───────────────────────────────────────
function ApexChart({ options, series, type, height = 310 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
    const mergedOptions = { ...options, legend: { ...(options.legend || {}), show: false }, chart: { ...(options.chart || {}), type, height, toolbar: { show: false }, fontFamily: 'inherit' }, series };
    chartInstance.current = new ApexCharts(chartRef.current, mergedOptions);
    chartInstance.current.render();
    return () => { if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; } };
  }, [options, series, type, height]);
  return <div ref={chartRef} />;
}

// ─── Platform Logo ──────────────────────────────────────────────────
function renderPlatformLogo(platformKey) {
  const key = String(platformKey || '').toLowerCase();
  if (key === 'meta') return <img src={metaIcon} alt="Meta" width={18} height={18} style={{ objectFit: 'contain' }} />;
  if (key === 'google') return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" /><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" /><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" /><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" /></svg>);
  if (key === 'snapchat') return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#FFFC00" /><path fill="#FFF" stroke="#000" strokeWidth="1.1" strokeLinejoin="round" d="M12 4.3c-2.9 0-4.7 2.1-4.7 4.5 0 .6.1 1.2.2 1.7.1.3-.1.4-.2.5-.5.2-1.2.4-1.2 1.2 0 .5.4.8 1 .9.3 0 .4.2.3.4-.1.6-.5 1.6-1.3 1.9-.3.1-.4.4-.4.6 0 .3.3.5.8.7 1.1.3 2.3-.1 2.8-.3.3-.1.5 0 .5.2.3.9 1.2 1 2.1 1s1.8-.1 2.1-1c.1-.2.3-.3.5-.2.5.2 1.7.6 2.8.3.5-.2.8-.4.8-.7 0-.2-.1-.5-.4-.6-.8-.3-1.2-1.3-1.3-1.9-.1-.2.1-.3.3-.4.6-.1 1-.4 1-.9 0-.8-.7-1-1.2-1.2-.2-.1-.3-.2-.2-.5.1-.5.2-1.1.2-1.7C16.7 6.4 14.9 4.3 12 4.3z" /></svg>);
  if (key === 'tiktok') return (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#010101" /><g transform="translate(1.5, 1.5) scale(0.88)"><path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z" /><path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z" /><path fill="#FFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z" /></g></svg>);
  return null;
}

// ─── SVG Icons ──────────────────────────────────────────────────────
const IconUp = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7l7 0l0 7" /></svg>);
const IconDown = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6l4 -4l8 8" /><path d="M21 10l0 7l-7 0" /></svg>);
const IconGear = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconCalendar = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /></svg>);
const IconShare = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><line x1="8.7" y1="10.7" x2="15.3" y2="7.3" /><line x1="8.7" y1="13.3" x2="15.3" y2="16.7" /></svg>);
const IconPdf = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15l2 -2l2 2l2 -2" /></svg>);
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'spin-icon' : ''}><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
);

// ─── Helpers ────────────────────────────────────────────────────────
const OBJECTIVES_MAP = { 0: 'Awareness', 1: 'Traffic', 2: 'Engagement', 3: 'Leads', 4: 'Sales' };
const PLATFORMS_MAP = { 1: 'Meta', 2: 'Google', 3: 'Snapchat', 4: 'TikTok' };
const PLATFORM_KEYS_MAP = { 1: 'meta', 2: 'google', 3: 'snapchat', 4: 'tiktok' };

function formatKPIValue(value, format) {
  if (value == null) return '—';
  switch (format) {
    case 'currency': return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value >= 100 ? 0 : 2 });
    case 'percent': return `${value.toFixed(2)}%`;
    case 'multiplier': return `${value.toFixed(2)}x`;
    case 'number': return value >= 1000000 ? `${(value / 1000000).toFixed(2)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
    case 'decimal': return value.toFixed(2);
    default: return String(value);
  }
}

function normalizeStatus(status) {
  if (status === 0 || String(status).toLowerCase() === 'active') return 'Active';
  if (status === 1 || String(status).toLowerCase() === 'paused') return 'Paused';
  if (status === 2 || String(status).toLowerCase() === 'completed') return 'Completed';
  return String(status || 'Active');
}

function normalizeMediaType(mediaType) {
  if (mediaType === 1 || String(mediaType).toLowerCase().includes('video')) return 'Video';
  if (mediaType === 2 || String(mediaType).toLowerCase().includes('carousel')) return 'Carousel';
  if (mediaType === 0 || String(mediaType).toLowerCase().includes('image')) return 'Image';
  return String(mediaType || 'Image');
}

function formatDateRange(startDate, endDate) {
  const fmt = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// ─── Ad Thumbnail ───────────────────────────────────────────────────
function AdThumbnail({ src, name, mediaType }) {
  const [error, setError] = useState(false);
  const isVideo = mediaType === 1 || String(mediaType || '').toLowerCase().includes('video');
  useEffect(() => { setError(false); }, [src]);
  if (error || !src) {
    return (
      <div className="rounded-2 border bg-body-tertiary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44 }} title={name}>
        {isVideo ? (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>)}
      </div>
    );
  }
  return (
    <div className="position-relative flex-shrink-0" style={{ width: 44, height: 44 }}>
      <img src={src} alt={name} width={44} height={44} className="rounded-2 border shadow-2xs" style={{ objectFit: 'cover' }} onError={() => setError(true)} />
      {isVideo && (<span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 16, height: 16, fontSize: '0.55rem' }} title="Video">▶</span>)}
    </div>
  );
}

// ─── Ad Details Modal ───────────────────────────────────────────────
function AdDetailsModal({ ad, onClose }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = orig; };
  }, [onClose]);
  useEffect(() => { setImgError(false); }, [ad?.mediaURL]);

  if (!ad) return null;
  const normStatus = normalizeStatus(ad.status);
  const normMediaType = normalizeMediaType(ad.mediaType);
  const spend = Number(ad.spend) || 0;
  const revenue = Number(ad.revenue) || 0;
  const impressions = Number(ad.impressions) || 0;
  const clicks = Number(ad.clicks) || 0;
  const conversions = Number(ad.conversions) || 0;
  const reach = Number(ad.reach) || impressions;
  const ctr = Number(ad.ctr) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
  const cpc = Number(ad.cpc) || (clicks > 0 ? spend / clicks : 0);
  const cpa = Number(ad.cpa) || (conversions > 0 ? spend / conversions : 0);
  const roas = Number(ad.roas) || (spend > 0 ? revenue / spend : 0);

  const heroMetrics = [
    { label: 'Spend', value: `$${spend.toLocaleString()}`, icon: '↗', accent: '#e11d48', bg: 'rgba(225,29,72,0.08)' },
    { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: '↗', accent: '#00a76f', bg: 'rgba(0,167,111,0.08)' },
    { label: 'ROAS', value: `${roas.toFixed(2)}x`, icon: '⚡', accent: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  ];

  const detailMetrics = [
    { label: 'Impressions', value: impressions >= 1000 ? `${(impressions / 1000).toFixed(1)}K` : impressions.toLocaleString() },
    { label: 'Clicks', value: clicks >= 1000 ? `${(clicks / 1000).toFixed(1)}K` : clicks.toLocaleString() },
    { label: 'CTR', value: `${ctr.toFixed(2)}%` },
    { label: 'CPC', value: `$${cpc.toFixed(2)}` },
    { label: 'Conversions', value: conversions.toLocaleString() },
    { label: 'CPA', value: `$${cpa.toFixed(2)}` },
    { label: 'Reach', value: reach >= 1000 ? `${(reach / 1000).toFixed(1)}K` : reach.toLocaleString() },
  ];

  const hasMedia = ad.mediaURL && !imgError;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1060 }} tabIndex="-1" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--bs-border-color-translucent)' }}>
            <div className="d-flex align-items-start justify-content-between mb-1">
              <h5 className="fw-bold text-body-emphasis mb-0 text-truncate pe-3" title={ad.name} style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>{ad.name}</h5>
              <button type="button" className="btn-close flex-shrink-0 mt-1" onClick={onClose} aria-label="Close" />
            </div>
            <div className="d-flex align-items-center gap-1.5 pb-2">
              <span className={`badge rounded-pill border px-2 py-0.5 fw-semibold ${normStatus === 'Active' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : normStatus === 'Paused' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.7rem' }}>
                <span className="d-inline-block rounded-circle me-1" style={{ width: 6, height: 6, backgroundColor: normStatus === 'Active' ? '#00a76f' : normStatus === 'Paused' ? '#f59e0b' : '#94a3b8', verticalAlign: 'middle' }} />{normStatus}
              </span>
              <span className="badge bg-body-secondary text-secondary border rounded-pill px-2 py-0.5 fw-medium" style={{ fontSize: '0.7rem' }}>{normMediaType}</span>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div style={{ overflowY: 'auto', flex: 1 }}>

            {/* ── Hero Metrics Strip ── */}
            <div className="d-flex border-bottom" style={{ gap: 0 }}>
              {heroMetrics.map((m, i) => (
                <div key={i} className="flex-fill text-center py-3 px-2" style={{ borderRight: i < 2 ? '1px solid var(--bs-border-color-translucent)' : 'none' }}>
                  <div className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.04em', marginBottom: 2 }}>{m.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.15rem', color: m.accent }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* ── Creative + Copy Section ── */}
            <div className="p-4 pb-3">
              <div className="d-flex gap-3" style={{ alignItems: 'flex-start' }}>
                {/* Media Preview */}
                {hasMedia && (
                  <div className="flex-shrink-0" style={{ width: 180, minHeight: 140 }}>
                    <img
                      src={ad.mediaURL}
                      alt={ad.name}
                      className="rounded-3 border w-100"
                      style={{ height: 160, objectFit: 'cover' }}
                      onError={() => setImgError(true)}
                    />
                  </div>
                )}
                {/* Ad Copy */}
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  {ad.headline && (
                    <div className="mb-2">
                      <div className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.62rem', letterSpacing: '0.05em', marginBottom: 3 }}>Headline</div>
                      <p className="fw-semibold text-body-emphasis mb-0" style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>{ad.headline}</p>
                    </div>
                  )}
                  {ad.description && (
                    <div className="mb-2">
                      <div className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.62rem', letterSpacing: '0.05em', marginBottom: 3 }}>Description</div>
                      <p className="text-body-secondary mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>{ad.description}</p>
                    </div>
                  )}
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}>CTA</span>
                    <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.72rem' }}>{ad.cta || 'Learn More'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Detailed Metrics ── */}
            <div className="px-4 pb-4">
              <div className="text-secondary text-uppercase fw-semibold mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Performance Breakdown</div>
              <div className="rounded-3 border overflow-hidden">
                {detailMetrics.map((m, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center justify-content-between px-3 py-2"
                    style={{
                      borderBottom: i < detailMetrics.length - 1 ? '1px solid var(--bs-border-color-translucent)' : 'none',
                      backgroundColor: i % 2 === 0 ? 'var(--bs-tertiary-bg)' : 'transparent',
                      fontSize: '0.84rem',
                    }}
                  >
                    <span className="text-body-secondary fw-medium">{m.label}</span>
                    <span className="fw-bold text-body-emphasis">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chart Metrics ──────────────────────────────────────────────────
const PERF_CHART_METRICS = {
  spend: { label: 'Spend', color: '#e11d48', type: 'currency' },
  revenue: { label: 'Revenue', color: '#00a76f', type: 'currency' },
  roas: { label: 'ROAS', color: '#0d9488', type: 'ratio' },
  cpa: { label: 'CPA', color: '#f59e0b', type: 'currency' },
  ctr: { label: 'CTR', color: '#06b6d4', type: 'percent' },
  conversions: { label: 'Conversions', color: '#8b5cf6', type: 'number' },
  frequency: { label: 'Frequency', color: '#64748b', type: 'decimal' },
};

// ─── Main Component ─────────────────────────────────────────────────
export default function AdSetDetailPage() {
  const { clientId, campaignId, adSetId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [adSet, setAdSet] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adSearch, setAdSearch] = useState('');
  const [adStatusFilter, setAdStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('spend');
  const [sortDir, setSortDir] = useState('desc');

  // KPI State
  const kpiStorageKey = `adSetPinnedKPIs_${adSetId}`;
  const [pinnedKPIs, setPinnedKPIs] = useState(() => {
    try { const saved = localStorage.getItem(kpiStorageKey); return saved ? JSON.parse(saved) : defaultAdSetPinnedKPIs; } catch { return defaultAdSetPinnedKPIs; }
  });
  const [showKPISelector, setShowKPISelector] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['spend', 'revenue']);
  const [periodConfig, setPeriodConfig] = useState({
    label: 'Last 30 Days',
    days: 30,
    isCustom: false,
    startDate: '2026-08-02',
    endDate: '2026-08-31',
  });

  useEffect(() => { localStorage.setItem(kpiStorageKey, JSON.stringify(pinnedKPIs)); }, [pinnedKPIs, kpiStorageKey]);

  useEffect(() => {
    if (!showKPISelector) return;
    const handler = (e) => {
      if (!e.target.closest('.kpi-selector-container')) setShowKPISelector(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showKPISelector]);

  const toggleKPI = (key) => {
    setPinnedKPIs((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 5) return prev;
      return [...prev, key];
    });
  };

  const handleMetricToggle = (key) => {
    const isFinancial = key === 'spend' || key === 'revenue';
    setSelectedMetrics((prev) => {
      const hasNonFinancial = prev.some((m) => m !== 'spend' && m !== 'revenue');
      if (isFinancial) {
        if (hasNonFinancial) return key === 'spend' ? ['spend', 'revenue'] : ['revenue', 'spend'];
        if (prev.includes(key)) { if (prev.length === 1) return prev; return prev.filter((m) => m !== key); }
        return ['spend', 'revenue'];
      }
      return [key];
    });
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [clientRes, campaignApiRes] = await Promise.all([
          getClientByIdApi(clientId).catch(() => null),
          getCampaignByIdApi(campaignId).catch(() => null),
        ]);
        const resolved = resolveClientAndCampaign(clientId, campaignId);
        const finalClient = clientRes || resolved.client;
        const finalCampaign = (campaignApiRes && String(campaignApiRes.id) === String(campaignId))
          ? { ...campaignApiRes, platformKey: resolved.platformKey, platformLabel: resolved.campaign?.platformLabel || 'Platform' }
          : resolved.campaign;
        if (!finalCampaign) throw new Error('Campaign not found.');

        const allAdSets = getCampaignAdSets(campaignId, finalCampaign);
        const foundAdSet = allAdSets.find((a) => String(a.id) === String(adSetId));
        if (!foundAdSet) throw new Error(`Ad Set '${adSetId}' not found.`);

        const apiAds = await getAdsByAdSetIdApi(adSetId).catch(() => []);
        const finalAds = apiAds.length > 0 ? apiAds : getAdSetAds(adSetId, foundAdSet, finalCampaign);

        if (isMounted) { setClient(finalClient); setCampaign(finalCampaign); setAdSet(foundAdSet); setAds(finalAds); }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load ad set data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [clientId, campaignId, adSetId]);

  const handleRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }, []);

  // Generate time series data for charts based on selected period
  const timeSeries = adSet
    ? generateAdSetTimeSeries(
        adSet,
        periodConfig.days,
        periodConfig.endDate || null,
        periodConfig.startDate || null
      )
    : [];

  // Compute metrics scaled to selected period
  const asSpend = timeSeries.length ? timeSeries.reduce((s, d) => s + d.spend, 0) : (Number(adSet?.spend) || 0);
  const asRevenue = timeSeries.length ? timeSeries.reduce((s, d) => s + d.revenue, 0) : (Number(adSet?.revenue) || 0);
  const asRoas = asSpend > 0 ? asRevenue / asSpend : 0;
  const asImpressions = timeSeries.length ? timeSeries.reduce((s, d) => s + d.impressions, 0) : (Number(adSet?.impressions) || 0);
  const asClicks = timeSeries.length ? timeSeries.reduce((s, d) => s + d.clicks, 0) : (Number(adSet?.clicks) || 0);
  const asCtr = asImpressions > 0 ? (asClicks / asImpressions) * 100 : 0;
  const asConversions = timeSeries.length ? timeSeries.reduce((s, d) => s + d.conversions, 0) : (Number(adSet?.conversions) || 0);
  const asCpa = asConversions > 0 ? asSpend / asConversions : 0;
  const asReach = timeSeries.length ? timeSeries.reduce((s, d) => s + (d.reach || 0), 0) : Math.round(asImpressions * 0.72);
  const asFrequency = asReach > 0 ? asImpressions / asReach : 1;
  const asCpm = asImpressions > 0 ? (asSpend / asImpressions) * 1000 : 0;
  const asDailyBudget = Number(adSet?.dailyBudget) || Math.round(asSpend / Math.max(1, periodConfig.days));
  const asTotalBudget = asDailyBudget * periodConfig.days;
  const budgetUtil = asTotalBudget > 0 ? Math.min(100, (asSpend / asTotalBudget) * 100) : 0;

  const kpiDataMap = {
    spend: { value: asSpend, change: 6.4 },
    revenue: { value: asRevenue, change: 10.2 },
    roas: { value: asRoas, change: 2.8 },
    reach: { value: asReach, change: 12.1 },
    frequency: { value: asFrequency, change: 3.5 },
    ctr: { value: asCtr, change: 1.8 },
    conversions: { value: asConversions, change: 11.9 },
    cpa: { value: asCpa, change: -4.7 },
  };

  // Filter & sort ads
  const filteredAds = ads.filter((ad) => {
    const matchSearch = !adSearch || (ad.name || '').toLowerCase().includes(adSearch.toLowerCase());
    const matchStatus = adStatusFilter === 'ALL' || normalizeStatus(ad.status) === adStatusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    const aVal = Number(a[sortField]) || 0;
    const bVal = Number(b[sortField]) || 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Targeting data
  const targeting = [];
  if (adSet?.audienceType) targeting.push({ label: 'Audience Type', value: adSet.audienceType });
  if (adSet?.ageRange) targeting.push({ label: 'Age Range', value: adSet.ageRange });
  if (adSet?.gender) targeting.push({ label: 'Gender', value: adSet.gender });
  if (adSet?.location) targeting.push({ label: 'Location', value: adSet.location });
  if (adSet?.placements) targeting.push({ label: 'Placements', value: adSet.placements });
  if (adSet?.bidStrategy) targeting.push({ label: 'Bid Strategy', value: adSet.bidStrategy });
  if (adSet?.targetAudience) targeting.push({ label: 'Target Audience', value: adSet.targetAudience });

  // Loading/Error
  if (loading) {
    return (<DashboardLayout><div className="container-fluid py-5 text-center"><div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}><span className="visually-hidden">Loading...</span></div><p className="text-secondary fw-medium">Loading Ad Set details...</p></div></DashboardLayout>);
  }
  if (error || !adSet) {
    return (<DashboardLayout><div className="container-fluid py-5"><div className="card border-0 shadow-sm rounded-3 mx-auto p-5 text-center" style={{ maxWidth: 540 }}><div className="mb-3 text-warning"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div><h4 className="fw-bold mb-2">Ad Set Not Found</h4><p className="text-secondary mb-4">{error || 'Could not load ad set.'}</p><Link to={`/clients/${clientId}/campaigns/${campaignId}`} className="btn btn-primary px-4 rounded-2">Back to Campaign</Link></div></div></DashboardLayout>);
  }

  const clientName = client?.companyName || 'Client';
  const campName = campaign?.name || 'Campaign';
  const asStatus = normalizeStatus(adSet.status);
  const campObjective = OBJECTIVES_MAP[campaign?.objective] || 'Campaign';
  const platformLabel = PLATFORMS_MAP[campaign?.platformId] || campaign?.platformLabel || 'Platform';
  const platformKey = PLATFORM_KEYS_MAP[campaign?.platformId] || campaign?.platformKey || 'meta';
  const campaignLifetime = formatDateRange(campaign?.startDate, campaign?.endDate);

  // Period-aware chart data: Aggregate by month if period > 31 days
  const isMoreThanMonth = periodConfig.days > 31;
  const chartData = isMoreThanMonth ? aggregateTimeSeriesByMonth(timeSeries) : timeSeries;
  const hasMultipleMonths = new Set(timeSeries.map((d) => d.monthShort)).size > 1;

  // Performance chart
  const perfChartSeries = selectedMetrics.map((key) => ({ name: PERF_CHART_METRICS[key]?.label || key, data: chartData.map((d) => d[key] || 0) }));
  const perfChartColors = selectedMetrics.map((key) => PERF_CHART_METRICS[key]?.color || '#00a76f');

  const getMonthBadgeText = () => {
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
  };
  const monthBadgeText = getMonthBadgeText();

  // Horizontal axis categories: Months if > 31 days, else days corresponding to selected period
  const perfChartCategories = isMoreThanMonth
    ? chartData.map((d) => d.monthShort)
    : chartData.map((d) => (hasMultipleMonths ? `${d.day}/${d.monthNum || '08'}` : d.day));

  const primaryMetric = selectedMetrics[0] || 'spend';
  const metricType = PERF_CHART_METRICS[primaryMetric]?.type || 'currency';

  const perfChartOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: perfChartColors,
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 95, 100] } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: perfChartCategories,
      labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: '#94a3b8' }, formatter: (val) => {
          if (metricType === 'currency') return '$' + (val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0));
          if (metricType === 'ratio') return val.toFixed(1) + 'x';
          if (metricType === 'percent') return val.toFixed(1) + '%';
          if (metricType === 'decimal') return val.toFixed(1);
          return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0);
        }
      }
    },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    tooltip: {
      x: {
        formatter: (val, opts) => {
          const idx = opts?.dataPointIndex;
          const point = chartData[idx];
          if (point?.fullDate) return point.fullDate;
          if (point?.date) return `${point.date}, 2026`;
          return val;
        },
      },
      y: {
        formatter: (val) => {
          if (metricType === 'currency') return '$' + val.toLocaleString();
          if (metricType === 'ratio') return val.toFixed(2) + 'x';
          if (metricType === 'percent') return val.toFixed(2) + '%';
          if (metricType === 'decimal') return val.toFixed(2);
          return val.toLocaleString();
        }
      }
    },
    legend: { show: false },
  };

  // Sort arrow helper
  const SortTH = ({ field, label, align = 'end' }) => {
    const isActive = sortField === field;
    return (
      <th className={`text-body fw-bold user-select-none ${align === 'center' ? 'text-center' : 'text-end'}`} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => handleSort(field)} title={`Sort by ${label}`}>
        <div className={`d-inline-flex align-items-center gap-1 ${align === 'end' ? 'justify-content-end' : ''}`}>
          <span>{label}</span>
          <span className={`small ${isActive ? 'text-primary fw-bold' : 'text-secondary opacity-50'}`} style={{ fontSize: '0.7rem' }}>{isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
        </div>
      </th>
    );
  };

  return (
    <DashboardLayout
      pageTitle={clientName}
      title={`${adSet.name} - Ad Set Details | Dasher`}
      clientSwitcher={{ currentClientId: clientId, currentClientName: clientName }}
    >
      <div className="w-100 py-3">
        <style>{`
          .kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
          .kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
          @media (max-width: 1200px) { .kpi-grid-5 { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 768px) { .kpi-grid-5 { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 480px) { .kpi-grid-5 { grid-template-columns: 1fr; } }
          .ad-clickable-row { cursor: pointer; transition: background-color 0.15s ease-in-out; }
          .ad-clickable-row:hover { background-color: var(--bs-tertiary-bg, rgba(0,0,0,0.025)) !important; }
          .spin-icon { animation: spin 0.8s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .budget-progress { height: 8px; border-radius: 4px; background-color: rgba(0,0,0,0.06); overflow: hidden; }
          .budget-progress-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
        `}</style>

        {/* ─── Top Bar: Breadcrumb + Action Buttons (In Parallel) ─── */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2 no-print">
          {/* Left: Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/clients" className="text-decoration-none fw-semibold text-secondary hover-primary">Clients</Link></li>
              <li className="breadcrumb-item text-truncate" style={{ maxWidth: 220 }}>
                <Link to={`/clients/${clientId}`} className="text-decoration-none fw-semibold text-secondary hover-primary" title={clientName}>
                  {clientName}
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/clients/${clientId}/campaigns/${campaignId}`} className="text-decoration-none fw-semibold text-secondary hover-primary">
                  Campaigns
                </Link>
              </li>
              <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">Ad Sets</li>
            </ol>
          </nav>

          {/* Right: action buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Period / Date Range Dropdown */}
            <PeriodSelector
              value={periodConfig.label}
              onChange={(cfg) => setPeriodConfig(cfg)}
            />

            <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              <IconShare /> <span className="d-none d-md-inline">Share</span>
            </button>
            <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={() => window.print()}>
              <IconPdf /> <span className="d-none d-md-inline">Export PDF</span>
            </button>
            <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3" onClick={handleRefresh} disabled={refreshing}>
              <IconRefresh spinning={refreshing} /> <span className="d-none d-md-inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* ─── Ad Set Identity Header (Clear, Simple, Easy to Scan) ───────── */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center p-2 rounded-circle no-print shadow-sm"
              onClick={() => navigate(`/clients/${clientId}/campaigns/${campaignId}`)}
              title="Back to Campaign"
              aria-label="Back to Campaign"
            >
              <IconBack />
            </button>

            {/* Platform Icon Squircle */}
            <div
              className="d-flex align-items-center justify-content-center shadow-sm flex-shrink-0 bg-white border"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              {renderPlatformLogo(platformKey, 26)}
            </div>

            {/* Ad Set Name & Details */}
            <div className="d-flex flex-column gap-1.5">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="h3 mb-0 fw-bold text-body-emphasis me-1">{adSet.name}</h1>
                <span className={`badge rounded-pill border px-2.5 py-1 fw-bold small ${asStatus === 'Active' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : asStatus === 'Paused' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}>{asStatus}</span>
                <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle rounded-pill px-2.5 py-1 fw-semibold small">{campObjective}</span>
              </div>

              {/* Subheader Metadata Spans (Platform, Budget, Date Range) */}
              <div className="d-flex align-items-center gap-2 text-secondary small flex-wrap" style={{ fontSize: '0.80rem' }}>
                <span className="fw-medium text-body-secondary">
                  {platformLabel}
                </span>
                <span className="text-body-tertiary opacity-75 mx-1">&bull;</span>
                <span className="fw-semibold text-body-secondary">
                  Budget: ${asDailyBudget.toLocaleString()}/day
                </span>
                <span className="text-body-tertiary opacity-75 mx-1">&bull;</span>
                <span className="d-inline-flex align-items-center gap-1.5 text-body-secondary">
                  <IconCalendar /> {campaignLifetime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. KPI Cards ─── */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <span className="d-inline-flex align-items-center gap-1.5 text-secondary small fw-semibold"><IconCalendar /> <span>{periodConfig.label}</span></span>
            <div className="position-relative no-print kpi-selector-container">
              <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2" onClick={() => setShowKPISelector(!showKPISelector)}><IconGear /> <span className="fw-semibold">Customize KPIs</span></button>
              {showKPISelector && (
                <div className="position-absolute end-0 mt-1 bg-white border rounded-3 shadow-lg p-3" style={{ zIndex: 1050, minWidth: 260 }}>
                  <h6 className="fw-bold small mb-2">Select KPIs to pin (max 5)</h6>
                  <div className="d-flex flex-column gap-1">
                    {availableAdSetKPIs.map((kpi) => {
                      const isPinned = pinnedKPIs.includes(kpi.key);
                      return (<label key={kpi.key} className={`d-flex align-items-center gap-2 px-2 py-1 rounded-2 cursor-pointer ${isPinned ? 'bg-primary-subtle' : 'bg-transparent'}`} style={{ cursor: 'pointer' }}><input type="checkbox" className="form-check-input m-0" checked={isPinned} onChange={() => toggleKPI(kpi.key)} disabled={!isPinned && pinnedKPIs.length >= 5} /><span className="small">{kpi.label}</span></label>);
                    })}
                  </div>
                  <button className="btn btn-sm btn-primary w-100 mt-2" onClick={() => setShowKPISelector(false)}>Done</button>
                </div>
              )}
            </div>
          </div>
          <div className="kpi-grid-5">
            {pinnedKPIs.slice(0, 5).map((key) => {
              const kpiDef = availableAdSetKPIs.find((k) => k.key === key);
              const kpiData = kpiDataMap[key];
              if (!kpiDef || !kpiData) return null;
              const isPositive = kpiData.change >= 0;
              const isCostKPI = ['cpa', 'spend'].includes(key);
              const isGood = isCostKPI ? !isPositive : isPositive;
              return (
                <div key={key}>
                  <div className="card border-0 shadow-sm rounded-3 kpi-card h-100">
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary fw-semibold small text-truncate" title={kpiDef.label}>{kpiDef.label}</span>
                        <KpiMetricBadge metricKey={kpiDef.key} color={kpiDef.color} label={kpiDef.label} size={34} />
                      </div>
                      <div className="fs-3 fw-bold text-body-emphasis my-1 text-truncate">{formatKPIValue(kpiData.value, kpiDef.format)}</div>
                      <div className="d-flex align-items-center justify-content-between pt-1 border-top border-light-subtle mt-1">
                        <div className={`d-flex align-items-center gap-1 fw-semibold small ${isGood ? 'text-success' : 'text-danger'}`}>{isPositive ? <IconUp /> : <IconDown />}<span>{Math.abs(kpiData.change).toFixed(1)}%</span></div>
                        <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>vs prev</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. Performance Chart ─── */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-transparent border-bottom p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div><h5 className="mb-1 fw-bold">Performance Over Time</h5><small className="text-secondary">Ad set trend by selected metric</small></div>
              <span className="badge bg-primary-subtle text-primary-emphasis px-2.5 py-1.5 rounded-pill fw-semibold shadow-xs" style={{ fontSize: '0.8rem' }}>
                {monthBadgeText}
              </span>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {Object.entries(PERF_CHART_METRICS).map(([key, cfg]) => {
                const isSelected = selectedMetrics.includes(key);
                return (<button key={key} type="button" onClick={() => handleMetricToggle(key)} className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 rounded-pill transition-all ${isSelected ? 'bg-body-tertiary border text-body-emphasis fw-semibold shadow-xs' : 'bg-transparent border text-body-secondary'}`} style={{ fontSize: '0.78rem', borderColor: isSelected ? cfg.color : 'rgba(0,0,0,0.12)' }}><span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, backgroundColor: isSelected ? cfg.color : '#cbd5e1' }} />{cfg.label}</button>);
              })}
            </div>
          </div>
          <div className="card-body p-4">
            <ApexChart options={perfChartOptions} series={perfChartSeries} type="area" height={310} />
          </div>
        </div>



        {/* ─── 5. Ads Performance Table ─── */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-transparent border-bottom p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div><h5 className="mb-1 fw-bold">Ads Performance</h5><div className="text-secondary small">Click an ad to view creative details and metrics</div></div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap pt-3 mt-2 border-top">
              <div className="position-relative flex-grow-1" style={{ minWidth: 200, maxWidth: 360 }}>
                <input type="text" className="form-control form-control-sm ps-4 rounded-2" placeholder="Filter ads by name..." value={adSearch} onChange={(e) => setAdSearch(e.target.value)} style={{ fontSize: '0.82rem' }} />
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="position-absolute start-0 top-50 translate-middle-y ms-2 text-secondary"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <select className="form-select form-select-sm rounded-2 text-secondary fw-medium ms-auto" value={adStatusFilter} onChange={(e) => setAdStatusFilter(e.target.value)} style={{ width: 'auto', fontSize: '0.82rem' }}>
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover w-100">
                <thead className="table-light bg-body-tertiary">
                  <tr>
                    <th className="ps-4 text-body fw-bold" style={{ minWidth: 240 }}>Ad</th>
                    <th className="text-body fw-bold text-center" style={{ width: 80 }}>Status</th>
                    <SortTH field="spend" label="Spend" />
                    <SortTH field="impressions" label="Impr." />
                    <SortTH field="clicks" label="Clicks" />
                    <SortTH field="ctr" label="CTR" />
                    <SortTH field="conversions" label="Conv." />
                    <SortTH field="cpa" label="CPA" />
                    <SortTH field="revenue" label="Revenue" />
                    <SortTH field="roas" label="ROAS" align="center" />
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.length === 0 ? (
                    <tr><td colSpan="10" className="text-center py-4 text-secondary small">No ads match your criteria.</td></tr>
                  ) : (
                    filteredAds.map((ad) => {
                      const adSpend = Number(ad.spend) || 0;
                      const adRevenue = Number(ad.revenue) || 0;
                      const adImpr = Number(ad.impressions) || 0;
                      const adClicks = Number(ad.clicks) || 0;
                      const adConv = Number(ad.conversions) || 0;
                      const adCtr = Number(ad.ctr) || (adImpr > 0 ? (adClicks / adImpr) * 100 : 0);
                      const adCpa = Number(ad.cpa) || (adConv > 0 ? adSpend / adConv : 0);
                      const adRoas = Number(ad.roas) || (adSpend > 0 ? adRevenue / adSpend : 0);
                      const adStatus = normalizeStatus(ad.status);
                      return (
                        <tr key={ad.id} className="ad-clickable-row" onClick={() => setSelectedAd(ad)}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-2">
                              <AdThumbnail src={ad.mediaURL} name={ad.name} mediaType={ad.mediaType} />
                              <div className="d-flex flex-column overflow-hidden">
                                <span className="fw-bold text-body-emphasis text-truncate" style={{ maxWidth: 280, fontSize: '0.88rem' }}>{ad.name}</span>
                                <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>{normalizeMediaType(ad.mediaType)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center"><span className={`badge rounded-pill border px-2 py-0.5 fw-semibold ${adStatus === 'Active' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.72rem' }}>{adStatus}</span></td>
                          <td className="text-end fw-bold text-danger text-nowrap" style={{ fontSize: '0.88rem' }}>${adSpend.toLocaleString()}</td>
                          <td className="text-end text-body fw-medium" style={{ fontSize: '0.85rem' }}>{adImpr >= 1000 ? (adImpr / 1000).toFixed(0) + 'K' : adImpr}</td>
                          <td className="text-end text-body fw-medium" style={{ fontSize: '0.85rem' }}>{adClicks >= 1000 ? (adClicks / 1000).toFixed(1) + 'K' : adClicks}</td>
                          <td className="text-end text-body fw-semibold" style={{ fontSize: '0.85rem' }}>{adCtr.toFixed(2)}%</td>
                          <td className="text-end text-body-emphasis fw-bold" style={{ fontSize: '0.88rem' }}>{adConv.toLocaleString()}</td>
                          <td className="text-end text-body fw-semibold" style={{ fontSize: '0.85rem' }}>${adCpa.toFixed(2)}</td>
                          <td className="text-end fw-semibold text-success text-nowrap" style={{ fontSize: '0.88rem' }}>${adRevenue.toLocaleString()}</td>
                          <td className="text-center"><span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2 py-0.5" style={{ fontSize: '0.78rem' }}>{adRoas.toFixed(1)}x</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Ad Details Modal */}
        {selectedAd && <AdDetailsModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
      </div>
    </DashboardLayout>
  );
}
