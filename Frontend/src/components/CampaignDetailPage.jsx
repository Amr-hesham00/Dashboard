import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import ApexCharts from 'apexcharts';
import DashboardLayout from './DashboardLayout';
import { getClientByIdApi } from '../api/clients';
import { getCampaignByIdApi } from '../api/campaigns';
import { getAdSetsApi } from '../api/adsets';
import {
  availableCampaignKPIs,
  defaultCampaignPinnedKPIs,
  aggregateTimeSeriesByMonth,
} from '../mock/mockData';
import metaIcon from '../assets/meta-icon.webp';
import KpiMetricBadge from './KpiMetricBadge';
import PeriodSelector, { getPresetDates } from './PeriodSelector';

// ─── ApexCharts React Wrapper ───────────────────────────────────────
function ApexChart({ options, series, type, height = 310 }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    const mergedOptions = {
      ...options,
      legend: { ...(options.legend || {}), show: false },
      chart: { ...(options.chart || {}), type, height, toolbar: { show: false }, fontFamily: 'inherit' },
      series,
    };
    chartInstance.current = new ApexCharts(chartRef.current, mergedOptions);
    chartInstance.current.render();
    return () => {
      if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
    };
  }, [options, series, type, height]);

  return <div ref={chartRef} />;
}

// ─── Platform Logo Renderer ─────────────────────────────────────────
function renderPlatformLogo(platformKey) {
  const key = String(platformKey || '').toLowerCase();
  if (key === 'meta') return <img src={metaIcon} alt="Meta" width={18} height={18} style={{ objectFit: 'contain' }} />;
  if (key === 'google') return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );
  if (key === 'snapchat') return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#FFFC00" />
      <path fill="#FFFFFF" stroke="#000000" strokeWidth="1.1" strokeLinejoin="round" d="M12 4.3c-2.9 0-4.7 2.1-4.7 4.5 0 .6.1 1.2.2 1.7.1.3-.1.4-.2.5-.5.2-1.2.4-1.2 1.2 0 .5.4.8 1 .9.3 0 .4.2.3.4-.1.6-.5 1.6-1.3 1.9-.3.1-.4.4-.4.6 0 .3.3.5.8.7 1.1.3 2.3-.1 2.8-.3.3-.1.5 0 .5.2.3.9 1.2 1 2.1 1s1.8-.1 2.1-1c.1-.2.3-.3.5-.2.5.2 1.7.6 2.8.3.5-.2.8-.4.8-.7 0-.2-.1-.5-.4-.6-.8-.3-1.2-1.3-1.3-1.9-.1-.2.1-.3.3-.4.6-.1 1-.4 1-.9 0-.8-.7-1-1.2-1.2-.2-.1-.3-.2-.2-.5.1-.5.2-1.1.2-1.7C16.7 6.4 14.9 4.3 12 4.3z" />
    </svg>
  );
  if (key === 'tiktok') return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#010101" />
      <g transform="translate(1.5, 1.5) scale(0.88)">
        <path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z" />
        <path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z" />
        <path fill="#FFFFFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z" />
      </g>
    </svg>
  );
  return null;
}

// ─── SVG Icon Helpers ───────────────────────────────────────────────
const IconUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7l7 0l0 7" /></svg>
);
const IconDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6l4 -4l8 8" /><path d="M21 10l0 7l-7 0" /></svg>
);
const IconGear = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /></svg>
);
const IconShare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><line x1="8.7" y1="10.7" x2="15.3" y2="7.3" /><line x1="8.7" y1="13.3" x2="15.3" y2="16.7" /></svg>
);
const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15l2 -2l2 2l2 -2" /></svg>
);
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconRefresh = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'spin-icon' : ''}><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// ─── Helpers ────────────────────────────────────────────────────────
const PLATFORMS_MAP = { 1: 'Meta', 2: 'Google', 3: 'Snapchat', 4: 'TikTok' };
const PLATFORM_KEYS_MAP = { 1: 'meta', 2: 'google', 3: 'snapchat', 4: 'tiktok' };

function getCurrencySymbol(currency) {
  if (!currency) return '$';
  const c = String(currency).toUpperCase();
  switch (c) {
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

function formatKPIValue(value, format, currency = 'USD') {
  if (value == null) return '—';
  const sym = getCurrencySymbol(currency);
  switch (format) {
    case 'currency': return `${sym}${value >= 100 ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent': return `${value.toFixed(2)}%`;
    case 'multiplier': return `${value.toFixed(2)}x`;
    case 'number': return value >= 1000000 ? `${(value / 1000000).toFixed(2)}M` : value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
    case 'decimal': return value.toFixed(2);
    default: return String(value);
  }
}

function formatDateRange(startDate, endDate) {
  const fmt = (d) => {
    if (!d) return 'N/A';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

function normalizeStatus(status) {
  if (status === 0 || String(status).toLowerCase() === 'active') return 'Active';
  if (status === 1 || String(status).toLowerCase() === 'paused') return 'Paused';
  if (status === 2 || String(status).toLowerCase() === 'completed') return 'Completed';
  return String(status || 'Active');
}

// ─── Chart Metric Definitions ───────────────────────────────────────
const PERF_CHART_METRICS = {
  spend: { label: 'Spend', color: '#e11d48', type: 'currency' },
  revenue: { label: 'Revenue', color: '#00a76f', type: 'currency' },
  roas: { label: 'ROAS', color: '#0d9488', type: 'ratio' },
  conversions: { label: 'Conversions', color: '#8b5cf6', type: 'number' },
  cpa: { label: 'CPA', color: '#f59e0b', type: 'currency' },
  cpm: { label: 'CPM', color: '#ea580c', type: 'currency' },
  ctr: { label: 'CTR', color: '#06b6d4', type: 'percent' },
};

// ─── Main Component ─────────────────────────────────────────────────
export default function CampaignDetailPage() {
  const { clientId: paramClientId, campaignId: paramCampaignId, campId, CampId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const campaignId = campId || CampId || paramCampaignId;
  const initialClientId = paramClientId || location.state?.clientId;

  const [client, setClient] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [adSets, setAdSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adSetSearch, setAdSetSearch] = useState('');
  const [adSetStatusFilter, setAdSetStatusFilter] = useState('ALL');
  const [adSetSortField, setAdSetSortField] = useState('spend');
  const [adSetSortDir, setAdSetSortDir] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);

  // KPI State
  const kpiStorageKey = `campaignPinnedKPIs_${campaignId}`;
  const [pinnedKPIs, setPinnedKPIs] = useState(() => {
    try {
      const saved = localStorage.getItem(kpiStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
      return defaultCampaignPinnedKPIs.slice(0, 5);
    } catch {
      return defaultCampaignPinnedKPIs.slice(0, 5);
    }
  });
  const [showKPISelector, setShowKPISelector] = useState(false);
  const [periodConfig, setPeriodConfig] = useState(() => getPresetDates('Last 30 Days'));

  // Chart State
  const [selectedMetrics, setSelectedMetrics] = useState(['spend', 'revenue']);

  useEffect(() => { localStorage.setItem(kpiStorageKey, JSON.stringify(pinnedKPIs)); }, [pinnedKPIs, kpiStorageKey]);

  // Close KPI selector on outside click
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

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const finalCampaign = await getCampaignByIdApi(campaignId, periodConfig.startDate, periodConfig.endDate);
        if (!finalCampaign) throw new Error(`Campaign with ID '${campaignId}' was not found.`);

        const targetClientId = finalCampaign?.clientId || initialClientId;
        let finalClient = null;

        if (finalCampaign?.clientId && finalCampaign?.clientName) {
          finalClient = {
            id: finalCampaign.clientId,
            companyName: finalCampaign.clientName,
            name: finalCampaign.clientName,
          };
        } else if (targetClientId) {
          try {
            finalClient = await getClientByIdApi(targetClientId);
          } catch {
            // fallback
          }
        }

        let finalAdSets = [];
        if (Array.isArray(finalCampaign?.adsetRows) && finalCampaign.adsetRows.length > 0) {
          finalAdSets = finalCampaign.adsetRows.map((as) => ({
            ...as,
            id: as.id || `adset-${as.name}`,
            name: as.name,
            status: as.status,
            spend: Number(as.spend) || 0,
            impressions: Number(as.impressions) || 0,
            clicks: Number(as.clicks) || 0,
            conversions: Number(as.conversions) || 0,
            cpa: Number(as.cpa) || 0,
            revenue: Number(as.revenue) || 0,
            roas: Number(as.roas) || 0,
            campaignId: Number(campaignId),
          }));
        }

        if (isMounted) {
          setClient(finalClient);
          setCampaign(finalCampaign);
          setAdSets(finalAdSets);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load campaign data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [initialClientId, campaignId, periodConfig.startDate, periodConfig.endDate]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleAdSetSort = (field) => {
    if (adSetSortField === field) {
      setAdSetSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setAdSetSortField(field);
      setAdSetSortDir('desc');
    }
  };

  // Filter & sort Ad Sets
  const filteredAdSets = adSets
    .filter((as) => {
      const matchSearch =
        !adSetSearch ||
        as.name.toLowerCase().includes(adSetSearch.toLowerCase()) ||
        (as.audienceType && as.audienceType.toLowerCase().includes(adSetSearch.toLowerCase()));
      const matchStatus = adSetStatusFilter === 'ALL' || String(as.status).toLowerCase() === adSetStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (!adSetSortField) return 0;
      const getVal = (item, f) => {
        if (f === 'cpa') {
          if (item.cpa !== undefined && item.cpa !== null) return Number(item.cpa) || 0;
          const conv = Number(item.conversions) || 0;
          const sp = Number(item.spend) || 0;
          return conv > 0 ? sp / conv : 0;
        }
        if (f === 'roas') {
          if (item.roas !== undefined && item.roas !== null) return Number(item.roas) || 0;
          const sp = Number(item.spend) || 0;
          const rev = Number(item.revenue) || 0;
          return sp > 0 ? rev / sp : 0;
        }
        return Number(item[f]) || 0;
      };
      const aVal = getVal(a, adSetSortField);
      const bVal = getVal(b, adSetSortField);
      return adSetSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

  // Generate time series data for charts based on selected period
  const timeSeries = campaign?.points?.length
    ? campaign.points.map((p) => {
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
    })
    : [];

  // Compute campaign metrics scaled to selected period
  const cSpend = timeSeries.length ? timeSeries.reduce((s, d) => s + d.spend, 0) : (Number(campaign?.spend) || 0);
  const cRevenue = timeSeries.length ? timeSeries.reduce((s, d) => s + d.revenue, 0) : (Number(campaign?.revenue) || 0);
  const cRoas = cSpend > 0 ? cRevenue / cSpend : 0;
  const cImpressions = timeSeries.length ? timeSeries.reduce((s, d) => s + d.impressions, 0) : (Number(campaign?.impressions) || 0);
  const cClicks = timeSeries.length ? timeSeries.reduce((s, d) => s + d.clicks, 0) : (Number(campaign?.clicks) || 0);
  const cCtr = cImpressions > 0 ? (cClicks / cImpressions) * 100 : 0;
  const cConversions = timeSeries.length ? timeSeries.reduce((s, d) => s + d.conversions, 0) : (Number(campaign?.conversions) || 0);
  const cCpa = cConversions > 0 ? cSpend / cConversions : 0;
  const cCpc = cClicks > 0 ? cSpend / cClicks : 0;
  const cAov = cConversions > 0 ? cRevenue / cConversions : 0;
  const cCpm = cImpressions > 0 ? (cSpend / cImpressions) * 1000 : 0;
  const cConversionRate = cClicks > 0 ? (cConversions / cClicks) * 100 : 0;
  const resolvedClientId = client?.id || initialClientId || campaign?.clientId || null;

  // KPI data map (value + simulated change)
  const kpiDataMap = {
    spend: { value: cSpend, change: 8.1 },
    revenue: { value: cRevenue, change: 12.4 },
    roas: { value: cRoas, change: 3.2 },
    impressions: { value: cImpressions, change: 15.7 },
    clicks: { value: cClicks, change: 18.2 },
    ctr: { value: cCtr, change: 2.1 },
    conversions: { value: cConversions, change: 14.6 },
    cpa: { value: cCpa, change: -5.8 },
    cpc: { value: cCpc, change: -3.4 },
    aov: { value: cAov, change: 4.5 },
    cpm: { value: cCpm, change: -2.3 },
    conversionRate: { value: cConversionRate, change: 3.1 },
  };

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container-fluid py-5 text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading campaign details...</span>
          </div>
          <p className="text-secondary mt-3 fw-medium">Loading campaign performance data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <div className="container-fluid py-5">
          <div className="card border-0 shadow-sm rounded-3 mx-auto p-5 text-center" style={{ maxWidth: 540 }}>
            <div className="mb-3 text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h4 className="fw-bold mb-2">Campaign Not Found</h4>
            <p className="text-secondary mb-4">{error || 'This campaign does not belong to the specified client.'}</p>
            {resolvedClientId ? (
              <Link to={`/clients/${resolvedClientId}`} className="btn btn-primary px-4 rounded-2">Return to Client</Link>
            ) : (
              <Link to="/clients" className="btn btn-primary px-4 rounded-2">Return to Clients</Link>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const clientName = client?.companyName || client?.name || campaign?.clientName || 'Client';
  const campStatus = normalizeStatus(campaign.status);
  const platformLabel = PLATFORMS_MAP[campaign.platformId] || campaign.platformLabel || 'Platform';
  const platformKey = PLATFORM_KEYS_MAP[campaign.platformId] || campaign.platformKey || 'meta';
  const campaignLifetime = formatDateRange(campaign.startDate, campaign.endDate);
  const campCurrency = campaign?.currency || client?.currency || (platformKey === 'google' ? 'EUR' : platformKey === 'snapchat' ? 'SAR' : platformKey === 'tiktok' ? 'EGP' : 'USD');
  const currSymbol = getCurrencySymbol(campCurrency);

  // Period-aware chart data: Aggregate by month if period > 31 days
  const isMoreThanMonth = periodConfig.days > 31;
  const chartData = isMoreThanMonth ? aggregateTimeSeriesByMonth(timeSeries) : timeSeries;
  const hasMultipleMonths = new Set(timeSeries.map((d) => d.monthShort)).size > 1;

  // Horizontal axis categories: Months if > 31 days, else just day numbers
  const perfChartCategories = isMoreThanMonth
    ? chartData.map((d) => d.monthShort)
    : chartData.map((d) => d.day);

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

  // Performance Chart
  const activeSelectedMetrics = selectedMetrics.filter((key) => PERF_CHART_METRICS[key]);
  const currentChartMetrics = activeSelectedMetrics.length > 0 ? activeSelectedMetrics : ['spend', 'revenue'];

  const perfChartSeries = currentChartMetrics.map((key) => ({
    name: PERF_CHART_METRICS[key]?.label || key,
    data: chartData.map((d) => d[key] || 0),
  }));
  const perfChartColors = currentChartMetrics.map((key) => PERF_CHART_METRICS[key]?.color || '#00a76f');
  const primaryMetric = currentChartMetrics[0] || 'spend';
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
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: '#94a3b8' },
        formatter: (val) => {
          if (metricType === 'currency') return currSymbol + (val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0));
          if (metricType === 'ratio') return val.toFixed(1) + 'x';
          if (metricType === 'percent') return val.toFixed(1) + '%';
          return val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0);
        },
      },
    },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
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
          if (metricType === 'currency') return currSymbol + val.toLocaleString();
          if (metricType === 'ratio') return val.toFixed(2) + 'x';
          if (metricType === 'percent') return val.toFixed(2) + '%';
          return val.toLocaleString();
        },
      },
    },
    legend: { show: false },
  };

  // Spend vs Revenue Bar Chart
  const barChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#e11d48', '#00a76f'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: perfChartCategories,
      labels: {
        style: { fontSize: '10px', colors: '#94a3b8' },
        rotate: isMoreThanMonth ? 0 : -45,
        rotateAlways: !isMoreThanMonth && perfChartCategories.length > 15,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#94a3b8' }, formatter: (val) => currSymbol + (val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0)) } },
    grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
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
      y: { formatter: (val) => currSymbol + val.toLocaleString() },
    },
    legend: { show: false },
  };
  const renderAdSetSortTH = (field, label, align = 'end', width) => {
    const isActive = adSetSortField === field;
    return (
      <th
        className={`text-body fw-bold user-select-none ${align === 'center' ? 'text-center' : 'text-end'} ${isActive ? 'text-primary' : ''}`}
        style={{ cursor: 'pointer', whiteSpace: 'nowrap', width }}
        onClick={() => handleAdSetSort(field)}
        title={`Sort by ${label} (${isActive && adSetSortDir === 'desc' ? 'Ascending' : 'Descending'})`}
      >
        <div className={`d-inline-flex align-items-center gap-1 ${align === 'center' ? 'justify-content-center' : 'justify-content-end'}`}>
          <span>{label}</span>
          <span className={`small ${isActive ? 'text-primary fw-bold' : 'text-secondary opacity-50'}`} style={{ fontSize: '0.7rem' }}>
            {isActive ? (adSetSortDir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  return (
    <DashboardLayout
      pageTitle={clientName}
      title={`${campaign.name} - Campaign Details | Dasher`}
      clientSwitcher={{ currentClientId: resolvedClientId, currentClientName: clientName }}
    >
      <div className="w-100 py-3">
        <style>{`
          .kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
          .kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
          @media (max-width: 1200px) { .kpi-grid-5 { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 768px) { .kpi-grid-5 { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 480px) { .kpi-grid-5 { grid-template-columns: 1fr; } }
          .adset-clickable-row { cursor: pointer; transition: background-color 0.15s ease-in-out; }
          .adset-clickable-row:hover { background-color: var(--bs-tertiary-bg, rgba(0, 0, 0, 0.025)) !important; }
          .adset-clickable-row:hover .adset-chevron { transform: translateX(3px); color: var(--bs-primary) !important; }
          .adset-chevron { transition: transform 0.15s ease-in-out, color 0.15s ease-in-out; }
          .spin-icon { animation: spin 0.8s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

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
              {resolvedClientId ? (
                <li className="breadcrumb-item text-truncate" style={{ maxWidth: 220 }}>
                  <Link to={`/clients/${resolvedClientId}`} className="text-decoration-none fw-semibold text-secondary hover-primary" title={clientName}>
                    {clientName}
                  </Link>
                </li>
              ) : null}
              <li className="breadcrumb-item active text-success fw-semibold" aria-current="page" title={campaign?.name || 'Campaign'}>
                Campaigns
              </li>
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

        {/* ─── Campaign Identity Header (Clear, Simple, Easy to Scan) ───────── */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center p-2 rounded-circle no-print shadow-sm"
              onClick={() => {
                if (resolvedClientId) {
                  navigate(`/clients/${resolvedClientId}`);
                } else {
                  navigate('/clients');
                }
              }}
              title="Back to Client"
              aria-label="Back to Client"
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

            {/* Campaign Name & Details */}
            <div className="d-flex flex-column gap-1.5">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="h3 mb-0 fw-bold text-body-emphasis me-1">{campaign.name}</h1>
                <span className={`badge rounded-pill border px-2.5 py-1 fw-bold small ${campStatus === 'Active' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : campStatus === 'Paused' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}>
                  {campStatus}
                </span>
              </div>

              {/* Subheader Metadata Spans (Platform, Date Range) */}
              <div className="d-flex align-items-center gap-2 text-secondary small flex-wrap" style={{ fontSize: '0.80rem' }}>
                <span className="fw-medium text-body-secondary">
                  {platformLabel}
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
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="d-inline-flex align-items-center gap-1.5 text-secondary small fw-semibold">
                <IconCalendar /> <span>{periodConfig.label}</span>
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
                    {availableCampaignKPIs.map((kpi) => {
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
              const kpiDef = availableCampaignKPIs.find((k) => k.key === key);
              const kpiData = kpiDataMap[key];
              if (!kpiDef || !kpiData) return null;
              const isPositive = kpiData.change >= 0;
              const isCostKPI = ['cpa', 'cpc', 'spend', 'cpm'].includes(key);
              const isGood = isCostKPI ? !isPositive : isPositive;
              return (
                <div key={key}>
                  <div className="card border-0 shadow-sm rounded-3 kpi-card h-100">
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary fw-semibold small text-truncate" title={kpiDef.label}>{kpiDef.label}</span>
                        <KpiMetricBadge metricKey={kpiDef.key} color={kpiDef.color} label={kpiDef.label} size={34} />
                      </div>
                      <div className="fs-3 fw-bold text-body-emphasis my-1 text-truncate">{formatKPIValue(kpiData.value, kpiDef.format, campCurrency)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. Charts Row ─── */}
        {/* ─── 4. Performance Chart ─── */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-transparent border-bottom p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h5 className="mb-1 fw-bold">Performance Over Time</h5>
                <small className="text-secondary">Campaign trend by selected metric</small>
              </div>
              <span className="badge px-2.5 py-1.5 rounded-pill fw-semibold shadow-xs" style={{ fontSize: '0.8rem', backgroundColor: 'rgba(28, 37, 46, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                {monthBadgeText}
              </span>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {Object.entries(PERF_CHART_METRICS).map(([key, cfg]) => {
                const isSelected = selectedMetrics.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMetricToggle(key)}
                    className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 rounded-pill transition-all ${isSelected ? 'bg-body-tertiary border text-body-emphasis fw-semibold shadow-xs' : 'bg-transparent border text-body-secondary'}`}
                    style={{ fontSize: '0.78rem', borderColor: isSelected ? cfg.color : 'rgba(0,0,0,0.12)' }}
                  >
                    <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, backgroundColor: isSelected ? cfg.color : '#cbd5e1' }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card-body p-4">
            <ApexChart options={perfChartOptions} series={perfChartSeries} type="area" height={310} />
          </div>
        </div>

        {/* ─── 5. Ad Sets Performance Table ─── */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-transparent border-bottom p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h5 className="mb-1 fw-bold">Ad Sets Performance</h5>
                <div className="text-secondary small">Select an ad set to drill down into its targeting and ads</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap pt-3 mt-2 border-top">
              <div className="position-relative flex-grow-1" style={{ minWidth: 200, maxWidth: 360 }}>
                <input type="text" className="form-control form-control-sm ps-4 rounded-2" placeholder="Filter ad sets by name or audience..." value={adSetSearch} onChange={(e) => setAdSetSearch(e.target.value)} style={{ fontSize: '0.82rem' }} />
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="position-absolute start-0 top-50 translate-middle-y ms-2 text-secondary"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div className="ms-auto d-flex align-items-center gap-2">
                <select className="form-select form-select-sm rounded-2 text-secondary fw-medium" value={adSetStatusFilter} onChange={(e) => setAdSetStatusFilter(e.target.value)} style={{ width: 'auto', fontSize: '0.82rem' }}>
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover w-100">
                <thead className="table-light bg-body-tertiary">
                  <tr>
                    <th className="ps-4 text-body fw-bold" style={{ minWidth: 260 }}>Ad Set</th>
                    <th className="text-body fw-bold text-center" style={{ width: 80 }}>Status</th>
                    {renderAdSetSortTH('spend', 'Spend', 'end', 100)}
                    {renderAdSetSortTH('impressions', 'Impressions', 'end', 110)}
                    {renderAdSetSortTH('clicks', 'Clicks', 'end', 80)}
                    {renderAdSetSortTH('conversions', 'Conversions', 'end', 100)}
                    {renderAdSetSortTH('cpa', 'CPA', 'end', 80)}
                    {renderAdSetSortTH('revenue', 'Revenue', 'end', 100)}
                    {renderAdSetSortTH('roas', 'ROAS', 'center', 80)}
                    <th className="pe-4 text-end text-body fw-bold" style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdSets.length === 0 ? (
                    <tr><td colSpan="10" className="text-center py-4 text-secondary small">No ad sets match your criteria.</td></tr>
                  ) : (
                    filteredAdSets.map((as) => (
                      <tr key={as.id} className="adset-clickable-row" onClick={() => navigate(`/Adsets/${as.id}`, { state: { clientId: resolvedClientId, campaignId } })} title={`Open ${as.name} details`}>
                        <td className="ps-4">
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-primary text-truncate" style={{ maxWidth: 350, fontSize: '0.9rem' }}>{as.name}</span>
                            <span className="text-secondary small" style={{ fontSize: '0.74rem' }}>{as.audienceType || 'Lookalike'} &bull; {as.ageRange || '25-54'} &bull; {as.gender || 'All'}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill border px-2 py-0.5 fw-semibold ${as.status === 'Active' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.72rem' }}>{as.status}</span>
                        </td>
                        <td className="text-end fw-bold text-danger text-nowrap" style={{ fontSize: '0.88rem' }}>{currSymbol}{as.spend.toLocaleString()}</td>
                        <td className="text-end text-body fw-medium" style={{ fontSize: '0.85rem' }}>{(as.impressions / 1000).toFixed(0)}K</td>
                        <td className="text-end text-body fw-medium" style={{ fontSize: '0.85rem' }}>{(as.clicks / 1000).toFixed(1)}K</td>
                        <td className="text-end text-body-emphasis fw-bold" style={{ fontSize: '0.88rem' }}>{as.conversions.toLocaleString()}</td>
                        <td className="text-end text-body fw-semibold" style={{ fontSize: '0.85rem' }}>{currSymbol}{Number(as.cpa).toFixed(2)}</td>
                        <td className="text-end fw-semibold text-success text-nowrap" style={{ fontSize: '0.88rem' }}>{currSymbol}{as.revenue.toLocaleString()}</td>
                        <td className="text-center">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2 py-0.5" style={{ fontSize: '0.78rem' }}>{Number(as.roas).toFixed(1)}x</span>
                        </td>
                        <td className="pe-4 text-end">
                          <span className="adset-chevron d-inline-flex align-items-center text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
