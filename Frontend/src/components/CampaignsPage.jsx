import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  getCampaignsApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
} from '../api/campaigns';
import { getPlatformsApi } from '../api/platforms';
import { getClientsApi } from '../api/clients';
import metaIcon from '../assets/meta-icon.webp';

// ─── Time Period Presets Helper ──────────────────────────────────────
const TIME_PERIODS = [
  { key: 'ALL', label: 'All Time' },
  { key: 'TODAY', label: 'Today' },
  { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'LAST_MONTH', label: 'Last Month' },
  { key: 'CUSTOM', label: 'Custom Range' },
];

function isCampaignInDateRange(camp, datePreset, startDateFrom, startDateTo) {
  if (!camp.startDate) return true;

  const campDate = new Date(camp.startDate.substring(0, 10));
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (datePreset === 'TODAY') {
    if (campDate < todayStart) return false;
  } else if (datePreset === 'LAST_7_DAYS') {
    const d7 = new Date(todayStart.getTime() - 7 * 86400000);
    if (campDate < d7) return false;
  } else if (datePreset === 'LAST_30_DAYS') {
    const d30 = new Date(todayStart.getTime() - 30 * 86400000);
    if (campDate < d30) return false;
  } else if (datePreset === 'THIS_MONTH') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (campDate < mStart) return false;
  } else if (datePreset === 'LAST_MONTH') {
    const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    if (campDate < lmStart || campDate > lmEnd) return false;
  }

  // Custom or explicit start and end date checks
  if (startDateFrom) {
    const fromDate = new Date(startDateFrom);
    if (campDate < fromDate) return false;
  }
  if (startDateTo) {
    const toDate = new Date(startDateTo + 'T23:59:59');
    if (campDate > toDate) return false;
  }

  return true;
}

const formatDateDDMMYY = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const INITIAL_FILTERS = {
  client: 'ALL',
  platform: 'ALL',
  objective: 'ALL',
  status: 'ALL',
  spendMin: '',
  spendMax: '',
  revenueMin: '',
  revenueMax: '',
  roasMin: '',
  roasMax: '',
  datePreset: 'ALL',
  startDateFrom: '',
  startDateTo: '',
  sortBy: 'startDate',
  sortDirection: 'desc',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick Live Search
  const [search, setSearch] = useState('');

  // Applied Filters State
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  // Filter Menu Dropdown State & Draft Filters
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const filterMenuRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowFilterMenu(false);
      }
    }

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFilterMenu]);

  // Sorting State - default to start date descending (most recently started first)
  const [sortColumn, setSortColumn] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Add / Edit Campaign Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    clientId: 'cli-101',
    objective: 0,
    status: 0,
    spend: 0,
    revenue: 0,
    roas: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    platformId: 1,
  });

  const objectiveNames = ['Awareness', 'Traffic', 'Engagement', 'Leads', 'Sales'];
  const statusNames = ['Active', 'Paused', 'Completed', 'Draft'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campData, platData, clientData] = await Promise.all([
        getCampaignsApi().catch(() => []),
        getPlatformsApi().catch(() => []),
        getClientsApi().catch(() => []),
      ]);
      setCampaigns(campData);
      setPlatforms(platData);
      setClients(clientData);
    } catch (err) {
      setError(err.message || 'Failed to load campaigns data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to get resolved client info
  const getClientInfo = (camp) => {
    if (camp.clientId) {
      const found = clients.find((cl) => String(cl.id) === String(camp.clientId));
      if (found) return { id: found.id, name: found.companyName || found.name };
    }
    if (camp.clientName) {
      return { id: camp.clientId || 'cli-101', name: camp.clientName };
    }
    return { id: 'cli-101', name: 'Acme Corporation' };
  };

  // Helper for dynamic client avatar gradient
  const getClientGradient = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getPlatformName = (pId) => {
    const found = platforms.find((p) => String(p.id) === String(pId));
    if (found) return found.name;
    if (String(pId) === '1' || String(pId) === 'plt-001') return 'Meta Ads';
    if (String(pId) === '2' || String(pId) === 'plt-002') return 'Google Ads';
    if (String(pId) === '3' || String(pId) === 'plt-003') return 'Snapchat Ads';
    if (String(pId) === '4' || String(pId) === 'plt-004') return 'TikTok Ads';
    return `Platform #${pId}`;
  };

  const getPlatformLogoById = (pId, size = 18) => {
    const name = getPlatformName(pId)?.toLowerCase() || '';
    if (name.includes('meta') || name.includes('facebook')) {
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
    }
    if (name.includes('google')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" title="Google Ads">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
      );
    }
    if (name.includes('snapchat') || name.includes('snap')) {
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
    }
    if (name.includes('tiktok')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" title="TikTok Ads">
          <rect width="24" height="24" rx="5.5" fill="#010101" />
          <g transform="translate(1.5, 1.5) scale(0.88)">
            <path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z"/>
            <path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z"/>
            <path fill="#FFFFFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z"/>
          </g>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h6v8h-6z"/><path d="M4 16h6v4h-6z"/><path d="M14 12h6v8h-6z"/><path d="M14 4h6v4h-6z"/>
      </svg>
    );
  };

  const getStatusBadge = (statusVal) => {
    const idx = typeof statusVal === 'number' ? statusVal : 0;
    switch (idx) {
      case 0:
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>;
      case 1:
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Paused</span>;
      case 2:
        return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Completed</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Draft</span>;
    }
  };

  // Filter & Sort Pipeline
  const filteredAndSortedCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        const clientInfo = getClientInfo(c);
        const platName = getPlatformName(c.platformId)?.toLowerCase() || '';

        // 1. Search Query
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          c.name?.toLowerCase().includes(q) ||
          clientInfo.name?.toLowerCase().includes(q) ||
          platName.includes(q);
        if (!matchesSearch) return false;

        // 2. Client Filter
        if (appliedFilters.client !== 'ALL') {
          if (String(clientInfo.id) !== String(appliedFilters.client) && clientInfo.name !== appliedFilters.client) {
            return false;
          }
        }

        // 3. Platform Filter
        if (appliedFilters.platform !== 'ALL') {
          if (String(c.platformId) !== String(appliedFilters.platform)) {
            return false;
          }
        }

        // 4. Objective Filter
        if (appliedFilters.objective !== 'ALL') {
          if (c.objective !== parseInt(appliedFilters.objective, 10)) {
            return false;
          }
        }

        // 5. Status Filter
        if (appliedFilters.status !== 'ALL') {
          if (c.status !== parseInt(appliedFilters.status, 10)) return false;
        }

        // 6. Spend Range Filter
        const spendVal = c.spend ?? 0;
        if (appliedFilters.spendMin !== '' && !isNaN(Number(appliedFilters.spendMin))) {
          if (spendVal < Number(appliedFilters.spendMin)) return false;
        }
        if (appliedFilters.spendMax !== '' && !isNaN(Number(appliedFilters.spendMax))) {
          if (spendVal > Number(appliedFilters.spendMax)) return false;
        }

        // 7. Revenue Range Filter
        const revVal = c.revenue ?? 0;
        if (appliedFilters.revenueMin !== '' && !isNaN(Number(appliedFilters.revenueMin))) {
          if (revVal < Number(appliedFilters.revenueMin)) return false;
        }
        if (appliedFilters.revenueMax !== '' && !isNaN(Number(appliedFilters.revenueMax))) {
          if (revVal > Number(appliedFilters.revenueMax)) return false;
        }

        // 8. ROAS Range Filter
        const roasVal = c.roas ?? 0;
        if (appliedFilters.roasMin !== '' && !isNaN(Number(appliedFilters.roasMin))) {
          if (roasVal < Number(appliedFilters.roasMin)) return false;
        }
        if (appliedFilters.roasMax !== '' && !isNaN(Number(appliedFilters.roasMax))) {
          if (roasVal > Number(appliedFilters.roasMax)) return false;
        }

        // 9. Start Date Range Filter
        const matchesDate = isCampaignInDateRange(
          c,
          appliedFilters.datePreset,
          appliedFilters.startDateFrom,
          appliedFilters.startDateTo
        );
        if (!matchesDate) return false;

        return true;
      })
      .sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (sortColumn === 'client') {
          aVal = getClientInfo(a).name;
          bVal = getClientInfo(b).name;
        } else if (sortColumn === 'platformId') {
          aVal = getPlatformName(a.platformId);
          bVal = getPlatformName(b.platformId);
        } else if (sortColumn === 'objective') {
          aVal = objectiveNames[a.objective] || '';
          bVal = objectiveNames[b.objective] || '';
        } else if (sortColumn === 'startDate') {
          aVal = a.startDate ? new Date(a.startDate).getTime() : 0;
          bVal = b.startDate ? new Date(b.startDate).getTime() : 0;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc'
          ? (aVal || 0) - (bVal || 0)
          : (bVal || 0) - (aVal || 0);
      });
  }, [
    campaigns,
    clients,
    platforms,
    search,
    appliedFilters,
    sortColumn,
    sortDirection,
  ]);

  // Active Applied Filters count (excluding search)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.client !== 'ALL') count++;
    if (appliedFilters.platform !== 'ALL') count++;
    if (appliedFilters.objective !== 'ALL') count++;
    if (appliedFilters.status !== 'ALL') count++;
    if (appliedFilters.spendMin !== '' || appliedFilters.spendMax !== '') count++;
    if (appliedFilters.revenueMin !== '' || appliedFilters.revenueMax !== '') count++;
    if (appliedFilters.roasMin !== '' || appliedFilters.roasMax !== '') count++;
    if (
      appliedFilters.datePreset !== 'ALL' ||
      appliedFilters.startDateFrom !== '' ||
      appliedFilters.startDateTo !== ''
    ) {
      count++;
    }
    return count;
  }, [appliedFilters]);

  const hasAnyFilterActive = search.trim() !== '' || activeFiltersCount > 0;

  // KPIs calculation (reacts cleanly to active filters)
  const displayCampaigns = hasAnyFilterActive ? filteredAndSortedCampaigns : campaigns;
  const kpiTotalCampaigns = displayCampaigns.length;
  const kpiActiveCount = displayCampaigns.filter((c) => Number(c.status) === 0).length;
  const kpiPausedCount = displayCampaigns.filter((c) => Number(c.status) === 1).length;
  const kpiTotalSpend = displayCampaigns.reduce((acc, curr) => acc + (Number(curr.spend) || 0), 0);
  const kpiTotalRevenue = displayCampaigns.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  const kpiRoas = kpiTotalSpend > 0
    ? (kpiTotalRevenue / kpiTotalSpend).toFixed(2)
    : (displayCampaigns.length
        ? (displayCampaigns.reduce((acc, curr) => acc + (Number(curr.roas) || 0), 0) / displayCampaigns.length).toFixed(2)
        : '0.00');
  const kpiConversions = displayCampaigns.reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
  const kpiImpressions = displayCampaigns.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
  const kpiClicks = displayCampaigns.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
  const kpiCtr = kpiImpressions > 0 ? ((kpiClicks / kpiImpressions) * 100).toFixed(2) : '0.00';
  const kpiNetProfit = kpiTotalRevenue - kpiTotalSpend;

  const formatKpiNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Clear all filters handler
  const clearAllFilters = () => {
    setSearch('');
    setAppliedFilters(INITIAL_FILTERS);
    setDraftFilters(INITIAL_FILTERS);
    setSortColumn('startDate');
    setSortDirection('desc');
  };

  // Toggle Filter Menu dropdown handler
  const handleToggleFilterMenu = () => {
    if (!showFilterMenu) {
      setDraftFilters({
        ...appliedFilters,
        sortBy: sortColumn,
        sortDirection: sortDirection,
      });
    }
    setShowFilterMenu((prev) => !prev);
  };

  // Apply Filters from Menu handler
  const handleApplyFilterMenu = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({ ...draftFilters });
    if (draftFilters.sortBy) setSortColumn(draftFilters.sortBy);
    if (draftFilters.sortDirection) setSortDirection(draftFilters.sortDirection);
    setShowFilterMenu(false);
  };

  // Reset Draft Filters in Menu
  const handleResetDraftFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
  };

  const handleSort = (column) => {
    const newDirection = sortColumn === column && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortColumn(column);
    setSortDirection(newDirection);
    setAppliedFilters((prev) => ({ ...prev, sortBy: column, sortDirection: newDirection }));
    setDraftFilters((prev) => ({ ...prev, sortBy: column, sortDirection: newDirection }));
  };

  const renderSortIndicator = (col) => {
    if (sortColumn !== col) {
      return (
        <span className="text-secondary opacity-25 ms-1" style={{ fontSize: '0.72rem' }}>
          ↕
        </span>
      );
    }
    return (
      <span className="text-primary ms-1 fw-bold" style={{ fontSize: '0.75rem' }}>
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Modal Handlers for Campaign Create/Edit
  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      clientId: clients[0]?.id || 'cli-101',
      objective: 0,
      status: 0,
      spend: 0,
      revenue: 0,
      roas: 0,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      platformId: platforms[0]?.id || 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setFormData({
      name: camp.name || '',
      clientId: camp.clientId || clients[0]?.id || 'cli-101',
      objective: typeof camp.objective === 'number' ? camp.objective : 0,
      status: typeof camp.status === 'number' ? camp.status : 0,
      spend: camp.spend || 0,
      revenue: camp.revenue || 0,
      roas: camp.roas || 0,
      startDate: camp.startDate ? camp.startDate.substring(0, 10) : '',
      endDate: camp.endDate ? camp.endDate.substring(0, 10) : '',
      platformId: camp.platformId || platforms[0]?.id || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedClient = clients.find((cl) => String(cl.id) === String(formData.clientId));
      const payload = {
        ...formData,
        clientName: selectedClient ? (selectedClient.companyName || selectedClient.name) : undefined,
        objective: parseInt(formData.objective, 10),
        status: parseInt(formData.status, 10),
        spend: parseFloat(formData.spend) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        roas: parseFloat(formData.roas) || 0,
        platformId: parseInt(formData.platformId, 10) || (platforms[0]?.id || 1),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingCampaign) {
        await updateCampaignApi(editingCampaign.id, payload);
      } else {
        await createCampaignApi(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving campaign.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignApi(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete campaign.');
      }
    }
  };

  // Unique clients present in client list or campaigns
  const uniqueClients = useMemo(() => {
    const map = new Map();
    clients.forEach((cl) => {
      map.set(String(cl.id), cl.companyName || cl.name);
    });
    campaigns.forEach((c) => {
      const info = getClientInfo(c);
      if (!map.has(String(info.id))) {
        map.set(String(info.id), info.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [clients, campaigns]);

  return (
    <DashboardLayout title="Campaigns Management | Dasher">
      <div className="container-fluid px-0">
        {/* ─── Breadcrumb ─── */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
              Campaigns
            </li>
          </ol>
        </nav>

        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="h4 mb-1 fw-bold text-dark">Campaigns Management</h2>
            <p className="text-secondary mb-0">Track and manage client marketing campaigns with channel-level precision.</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Campaign
          </button>
        </div>

        {/* ─── Modern Refactored KPI Section ─── */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 overflow-hidden">
          <div className="card-body p-3 p-md-3.5">
            <div className="row g-3">
              {/* 1. Campaigns */}
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column">
                  <span className="text-secondary small fw-medium text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    Campaigns
                  </span>
                  <div className="d-flex align-items-baseline gap-1 mt-0.5">
                    <span className="fs-4 fw-bold text-body-emphasis" style={{ letterSpacing: '-0.02em' }}>
                      {kpiTotalCampaigns}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 mt-1 flex-wrap">
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.68rem' }}>
                      ● {kpiActiveCount} Active
                    </span>
                    {kpiPausedCount > 0 && (
                      <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        · {kpiPausedCount} Paused
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Total Spend */}
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column border-start-md ps-md-3">
                  <span className="text-secondary small fw-medium text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    Total Spend
                  </span>
                  <div className="d-flex align-items-baseline gap-1 mt-0.5">
                    <span className="fs-4 fw-bold text-danger" style={{ letterSpacing: '-0.02em' }}>
                      ${kpiTotalSpend.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                    {kpiTotalCampaigns > 0 ? `$${Math.round(kpiTotalSpend / kpiTotalCampaigns).toLocaleString()} avg / camp` : 'No spend'}
                  </div>
                </div>
              </div>

              {/* 3. Total Revenue */}
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column border-start-md ps-md-3">
                  <span className="text-secondary small fw-medium text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    Total Revenue
                  </span>
                  <div className="d-flex align-items-baseline gap-1 mt-0.5">
                    <span className="fs-4 fw-bold text-success" style={{ letterSpacing: '-0.02em' }}>
                      ${kpiTotalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1" style={{ fontSize: '0.72rem' }}>
                    <span className={`fw-semibold ${kpiNetProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      {kpiNetProfit >= 0 ? `+$${kpiNetProfit.toLocaleString()}` : `-$${Math.abs(kpiNetProfit).toLocaleString()}`} Net
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Blended ROAS */}
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column border-start-md ps-md-3">
                  <span className="text-secondary small fw-medium text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    Blended ROAS
                  </span>
                  <div className="d-flex align-items-baseline gap-1.5 mt-0.5">
                    <span className="fs-4 fw-bold text-primary" style={{ letterSpacing: '-0.02em' }}>
                      {kpiRoas}x
                    </span>
                    <span
                      className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-1.5 py-0.5"
                      style={{ fontSize: '0.68rem' }}
                    >
                      Target: 3.5x
                    </span>
                  </div>
                  <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                    Overall efficiency
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Performance Strip */}
          <div className="bg-body-tertiary px-3 px-md-3.5 py-2 border-top">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 text-secondary small">
              <div className="d-flex flex-wrap align-items-center gap-3 gap-md-4">
                <div className="d-flex align-items-center gap-1.5">
                  <span className="text-secondary">Conversions:</span>
                  <strong className="text-body fw-semibold">{kpiConversions.toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="text-secondary">Impressions:</span>
                  <strong className="text-body fw-semibold">{formatKpiNumber(kpiImpressions)}</strong>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="text-secondary">Clicks:</span>
                  <strong className="text-body fw-semibold">{formatKpiNumber(kpiClicks)}</strong>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="text-secondary">Avg CTR:</span>
                  <strong className="text-body fw-semibold">{kpiCtr}%</strong>
                </div>
              </div>
              {hasAnyFilterActive && (
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                    Filtered ({kpiTotalCampaigns} of {campaigns.length})
                  </span>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="btn btn-link p-0 text-decoration-none text-secondary small"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Collapsed Toolbar (Search + Dropdown Filter Menu Trigger) */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2.5">
              {/* Live Search */}
              <div className="flex-grow-1" style={{ maxWidth: 420 }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  className="input-group"
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search campaigns, clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search campaigns"
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary border-end-0"
                      type="button"
                      onClick={() => setSearch('')}
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center px-3"
                    type="submit"
                    title="Search"
                    aria-label="Search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </form>
              </div>

              {/* Action Buttons with Relative Dropdown Menu */}
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative" ref={filterMenuRef}>
                  <button
                    type="button"
                    onClick={handleToggleFilterMenu}
                    className={`btn d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold ${
                      activeFiltersCount > 0 ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    title="Toggle filter menu"
                    aria-expanded={showFilterMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="badge bg-white text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Clean & Simple Dropdown Filter Menu */}
                  {showFilterMenu && (
                    <div
                      className="card border shadow-lg rounded-3 position-absolute end-0 mt-2 bg-body p-3"
                      style={{
                        width: 320,
                        maxWidth: '92vw',
                        zIndex: 1050,
                        boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                        <span className="fw-bold small text-body">Filters</span>
                        <button
                          type="button"
                          className="btn-close btn-close-xs"
                          onClick={() => setShowFilterMenu(false)}
                          aria-label="Close"
                          style={{ fontSize: '0.65rem' }}
                        ></button>
                      </div>

                      <form onSubmit={handleApplyFilterMenu}>
                        <div className="d-flex flex-column gap-2.5">
                          {/* 1. Client & Platform */}
                          <div className="row g-1.5">
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-secondary mb-1">Client</label>
                              <select
                                className="form-select form-select-sm text-truncate"
                                value={draftFilters.client}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, client: e.target.value }))}
                              >
                                <option value="ALL">All Clients</option>
                                {uniqueClients.map((cl) => (
                                  <option key={cl.id} value={cl.id}>
                                    {cl.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-secondary mb-1">Platform</label>
                              <select
                                className="form-select form-select-sm text-truncate"
                                value={draftFilters.platform}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, platform: e.target.value }))}
                              >
                                <option value="ALL">All Platforms</option>
                                <option value="1">Meta Ads</option>
                                <option value="2">Google Ads</option>
                                <option value="3">Snapchat Ads</option>
                                <option value="4">TikTok Ads</option>
                              </select>
                            </div>
                          </div>

                          {/* 2. Objective & Status */}
                          <div className="row g-1.5">
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-secondary mb-1">Objective</label>
                              <select
                                className="form-select form-select-sm text-truncate"
                                value={draftFilters.objective}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, objective: e.target.value }))}
                              >
                                <option value="ALL">All Objectives</option>
                                {objectiveNames.map((name, idx) => (
                                  <option key={idx} value={String(idx)}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-6">
                              <label className="form-label small fw-semibold text-secondary mb-1">Status</label>
                              <select
                                className="form-select form-select-sm text-truncate"
                                value={draftFilters.status}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
                              >
                                <option value="ALL">All Statuses</option>
                                <option value="0">Active</option>
                                <option value="1">Paused</option>
                                <option value="2">Completed</option>
                                <option value="3">Draft</option>
                              </select>
                            </div>
                          </div>

                          {/* 3. Spend */}
                          <div>
                            <label className="form-label small fw-semibold text-secondary mb-1">Spend ($)</label>
                            <div className="row g-1.5">
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Min $"
                                  value={draftFilters.spendMin}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, spendMin: val }));
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Max $"
                                  value={draftFilters.spendMax}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, spendMax: val }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 4. Revenue */}
                          <div>
                            <label className="form-label small fw-semibold text-secondary mb-1">Revenue ($)</label>
                            <div className="row g-1.5">
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Min $"
                                  value={draftFilters.revenueMin}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, revenueMin: val }));
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Max $"
                                  value={draftFilters.revenueMax}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, revenueMax: val }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 5. ROAS */}
                          <div>
                            <label className="form-label small fw-semibold text-secondary mb-1">ROAS (x)</label>
                            <div className="row g-1.5">
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Min x"
                                  value={draftFilters.roasMin}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, roasMin: val }));
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  className="form-control form-control-sm"
                                  placeholder="Max x"
                                  value={draftFilters.roasMax}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                      setDraftFilters((prev) => ({ ...prev, roasMax: val }));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 6. Start Date */}
                          <div>
                            <label className="form-label small fw-semibold text-secondary mb-1">Start Date</label>
                            <div className="row g-1.5">
                              <div className="col-6">
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  value={draftFilters.startDateFrom}
                                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDateFrom: e.target.value, datePreset: 'CUSTOM' }))}
                                />
                              </div>
                              <div className="col-6">
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  value={draftFilters.startDateTo}
                                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, startDateTo: e.target.value, datePreset: 'CUSTOM' }))}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="d-flex align-items-center justify-content-between pt-2 mt-1 border-top">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-bold"
                              onClick={handleResetDraftFilters}
                              title="Reset draft filters"
                            >
                              Reset
                            </button>
                            <div className="d-flex align-items-center gap-1.5">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary px-2.5 py-1"
                                onClick={() => setShowFilterMenu(false)}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-sm btn-primary fw-semibold px-3 py-1">
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {hasAnyFilterActive && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="btn btn-danger text-white d-inline-flex align-items-center gap-1.5 px-3 py-2 fw-semibold shadow-xs"
                    title="Reset all filters and search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    <span className="small fw-semibold">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Tag Row */}
            {hasAnyFilterActive && (
              <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="text-secondary small fw-medium">Active:</span>

                  {search && (
                    <span className="badge bg-light text-body border d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>Search: "{search}"</span>
                      <button type="button" className="btn-close btn-close-xs" onClick={() => setSearch('')} aria-label="Remove search filter" style={{ fontSize: '0.65rem' }}></button>
                    </span>
                  )}

                  {appliedFilters.client !== 'ALL' && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>
                        Client:{' '}
                        {uniqueClients.find((cl) => String(cl.id) === String(appliedFilters.client))?.name || appliedFilters.client}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, client: 'ALL' }))}
                        aria-label="Remove client filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {appliedFilters.platform !== 'ALL' && (
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>Platform: {getPlatformName(appliedFilters.platform)}</span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, platform: 'ALL' }))}
                        aria-label="Remove platform filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {appliedFilters.objective !== 'ALL' && (
                    <span
                      className="badge border d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small"
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.12)',
                        color: '#6d28d9',
                        borderColor: 'rgba(139, 92, 246, 0.25)',
                      }}
                    >
                      <span>Objective: {objectiveNames[parseInt(appliedFilters.objective, 10)] || appliedFilters.objective}</span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, objective: 'ALL' }))}
                        aria-label="Remove objective filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {appliedFilters.status !== 'ALL' && (
                    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>Status: {statusNames[parseInt(appliedFilters.status, 10)] || appliedFilters.status}</span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, status: 'ALL' }))}
                        aria-label="Remove status filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {(appliedFilters.spendMin !== '' || appliedFilters.spendMax !== '') && (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>
                        Spend:{' '}
                        {appliedFilters.spendMin !== '' && appliedFilters.spendMax !== ''
                          ? `$${Number(appliedFilters.spendMin).toLocaleString()} – $${Number(appliedFilters.spendMax).toLocaleString()}`
                          : appliedFilters.spendMin !== ''
                          ? `≥ $${Number(appliedFilters.spendMin).toLocaleString()}`
                          : `≤ $${Number(appliedFilters.spendMax).toLocaleString()}`}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, spendMin: '', spendMax: '' }))}
                        aria-label="Remove spend filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {(appliedFilters.revenueMin !== '' || appliedFilters.revenueMax !== '') && (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>
                        Revenue:{' '}
                        {appliedFilters.revenueMin !== '' && appliedFilters.revenueMax !== ''
                          ? `$${Number(appliedFilters.revenueMin).toLocaleString()} – $${Number(appliedFilters.revenueMax).toLocaleString()}`
                          : appliedFilters.revenueMin !== ''
                          ? `≥ $${Number(appliedFilters.revenueMin).toLocaleString()}`
                          : `≤ $${Number(appliedFilters.revenueMax).toLocaleString()}`}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, revenueMin: '', revenueMax: '' }))}
                        aria-label="Remove revenue filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {(appliedFilters.roasMin !== '' || appliedFilters.roasMax !== '') && (
                    <span className="badge bg-info-subtle text-info border border-info-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>
                        ROAS:{' '}
                        {appliedFilters.roasMin !== '' && appliedFilters.roasMax !== ''
                          ? `${appliedFilters.roasMin}x – ${appliedFilters.roasMax}x`
                          : appliedFilters.roasMin !== ''
                          ? `≥ ${appliedFilters.roasMin}x`
                          : `≤ ${appliedFilters.roasMax}x`}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, roasMin: '', roasMax: '' }))}
                        aria-label="Remove ROAS filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}

                  {(appliedFilters.datePreset !== 'ALL' || appliedFilters.startDateFrom !== '' || appliedFilters.startDateTo !== '') && (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1 small">
                      <span>
                        Date:{' '}
                        {appliedFilters.startDateFrom !== '' && appliedFilters.startDateTo !== ''
                          ? `${appliedFilters.startDateFrom} to ${appliedFilters.startDateTo}`
                          : appliedFilters.startDateFrom !== ''
                          ? `From ${appliedFilters.startDateFrom}`
                          : appliedFilters.startDateTo !== ''
                          ? `Up to ${appliedFilters.startDateTo}`
                          : TIME_PERIODS.find((p) => p.key === appliedFilters.datePreset)?.label || appliedFilters.datePreset}
                      </span>
                      <button
                        type="button"
                        className="btn-close btn-close-xs"
                        onClick={() => setAppliedFilters((prev) => ({ ...prev, datePreset: 'ALL', startDateFrom: '', startDateTo: '' }))}
                        aria-label="Remove date filter"
                        style={{ fontSize: '0.65rem' }}
                      ></button>
                    </span>
                  )}
                </div>

                <span className="text-secondary small">
                  Showing <strong>{filteredAndSortedCampaigns.length}</strong> of {campaigns.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center text-secondary">
                <div className="spinner-border text-primary me-2" role="status"></div>
                Loading campaigns...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-danger">{error}</div>
            ) : filteredAndSortedCampaigns.length === 0 ? (
              <div className="p-5 text-center text-secondary">
                <p className="mb-2 fw-medium">No campaigns match your filter criteria.</p>
                {hasAnyFilterActive && (
                  <button onClick={clearAllFilters} className="btn btn-sm btn-danger text-white mt-2 fw-semibold">
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0 w-100" style={{ tableLayout: 'auto' }}>
                  <thead className="table-light user-select-none">
                    <tr>
                      <th className="ps-4">Campaign Name</th>
                      <th>Client</th>
                      <th className="text-center" style={{ width: 80 }}>Platform</th>
                      <th>Objective</th>
                      <th>Status</th>
                      <th
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('spend')}
                        title="Sort by Spend (Ascending / Descending)"
                      >
                        <div className="d-inline-flex align-items-center gap-1">
                          <span>Spend</span>
                          {renderSortIndicator('spend')}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('revenue')}
                        title="Sort by Revenue (Ascending / Descending)"
                      >
                        <div className="d-inline-flex align-items-center gap-1">
                          <span>Revenue</span>
                          {renderSortIndicator('revenue')}
                        </div>
                      </th>
                      <th
                        className="pe-4 text-nowrap cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSort('startDate')}
                        title="Sort by Start Date (Ascending / Descending)"
                      >
                        <div className="d-inline-flex align-items-center gap-1">
                          <span>Start Date</span>
                          {renderSortIndicator('startDate')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedCampaigns.map((camp) => {
                      const platName = getPlatformName(camp.platformId)?.toLowerCase() || '';
                      const clientInfo = getClientInfo(camp);
                      return (
                        <tr key={camp.id}>
                          {/* 1. Campaign Name */}
                          <td className="ps-4">
                            <Link
                              to={`/clients/${clientInfo.id}/campaigns/${camp.id}`}
                              className="fw-bold text-body-emphasis text-decoration-none hover-primary"
                              style={{
                                fontSize: '0.92rem',
                                letterSpacing: '-0.01em',
                              }}
                              title={`View campaign details for ${camp.name}`}
                            >
                              {camp.name}
                            </Link>
                          </td>

                          {/* 2. Client Name */}
                          <td>
                            <Link
                              to={`/clients/${clientInfo.id}`}
                              className="d-inline-flex align-items-center gap-2 text-decoration-none text-body-emphasis hover-primary"
                              title={`View client details for ${clientInfo.name}`}
                            >
                              <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-2xs flex-shrink-0"
                                style={{
                                  width: 26,
                                  height: 26,
                                  fontSize: '0.72rem',
                                  background: getClientGradient(clientInfo.name),
                                }}
                              >
                                {clientInfo.name.charAt(0)}
                              </div>
                              <span className="fw-semibold text-truncate small" style={{ maxWidth: 160 }}>
                                {clientInfo.name}
                              </span>
                            </Link>
                          </td>

                          {/* 3. Platform Logo */}
                          <td className="text-center">
                            <div
                              className="d-inline-flex align-items-center justify-content-center rounded-2 border shadow-2xs"
                              style={{
                                width: 32,
                                height: 32,
                                backgroundColor:
                                  platName.includes('meta') || platName.includes('facebook')
                                    ? 'rgba(24, 119, 242, 0.08)'
                                    : platName.includes('google')
                                    ? 'rgba(234, 67, 53, 0.08)'
                                    : platName.includes('snap')
                                    ? 'rgba(234, 179, 8, 0.12)'
                                    : 'rgba(24, 24, 27, 0.08)',
                                borderColor:
                                  platName.includes('meta') || platName.includes('facebook')
                                    ? 'rgba(24, 119, 242, 0.2)'
                                    : platName.includes('google')
                                    ? 'rgba(234, 67, 53, 0.2)'
                                    : platName.includes('snap')
                                    ? 'rgba(234, 179, 8, 0.25)'
                                    : 'rgba(63, 63, 70, 0.2)',
                              }}
                              title={getPlatformName(camp.platformId)}
                              aria-label={getPlatformName(camp.platformId)}
                            >
                              {getPlatformLogoById(camp.platformId)}
                            </div>
                          </td>

                          {/* 4. Objective */}
                          <td>
                            <span className="badge bg-light text-body border px-2 py-1 small">
                              {objectiveNames[camp.objective] || 'Awareness'}
                            </span>
                          </td>

                          {/* 5. Status */}
                          <td>{getStatusBadge(camp.status)}</td>

                          {/* 6. Spend */}
                          <td className="fw-medium">${(camp.spend || 0).toLocaleString()}</td>

                          {/* 7. Revenue */}
                          <td className="fw-medium text-success">${(camp.revenue || 0).toLocaleString()}</td>

                          {/* 8. Start Date */}
                          <td className="pe-4 text-secondary small text-nowrap">
                            {formatDateDDMMYY(camp.startDate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ─── 2. Create / Edit Campaign Modal ─────────────────────────── */}
        {showModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
            tabIndex="-1"
            role="dialog"
            onClick={() => setShowModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-medium">Campaign Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Summer Sales Q3"
                      />
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Client *</label>
                        <select
                          className="form-select"
                          required
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        >
                          {uniqueClients.map((cl) => (
                            <option key={cl.id} value={cl.id}>
                              {cl.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Platform *</label>
                        <select
                          className="form-select"
                          required
                          value={formData.platformId}
                          onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                        >
                          {platforms.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Objective</label>
                        <select
                          className="form-select"
                          value={formData.objective}
                          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        >
                          {objectiveNames.map((name, idx) => (
                            <option key={idx} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          {statusNames.map((name, idx) => (
                            <option key={idx} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Spend ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.spend}
                          onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Revenue ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.revenue}
                          onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">ROAS</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.roas}
                          onChange={(e) => setFormData({ ...formData, roas: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer px-4 py-3 bg-light">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
