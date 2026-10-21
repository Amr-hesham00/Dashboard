import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import ClientAvatar from './ClientAvatar';
import {
  getClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  getClientStatusesApi,
  getClientCurrenciesApi,
  getUsersApi,
  getClientTargetsApi,
  updateClientTargetsApi,
  uploadClientLogoApi,
} from '../api/clients';
const DEFAULT_CLIENT_TARGETS = {
  targetRoas: 4.0,
  targetCpa: 50.0,
  monthlyBudget: 10000,
  targetRevenue: 40000,
  targetConversions: 200,
  targetCtr: 2.5,
  targetCpc: 1.5,
  currency: 'USD',
};
import metaIcon from '../assets/meta-icon.webp';

// ─── Supported Advertising Platforms ─────────────────────────────────
const AD_PLATFORMS = [
  {
    key: 'meta',
    name: 'Meta Ads',
    subtitle: 'Facebook & Instagram Campaigns',
    color: '#0866FF',
    bgSubtle: 'rgba(8, 102, 255, 0.08)',
    icon: (
      <img
        src={metaIcon}
        alt="Meta Ads"
        width={22}
        height={22}
        style={{ objectFit: 'contain', display: 'inline-block' }}
      />
    ),
    defaultAccount: 'act_948291048',
  },
  {
    key: 'google',
    name: 'Google Ads',
    subtitle: 'Search, YouTube & Performance Max',
    color: '#4285F4',
    bgSubtle: 'rgba(66, 133, 244, 0.08)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
      </svg>
    ),
    defaultAccount: '839-201-9482',
  },
  {
    key: 'snapchat',
    name: 'Snapchat Ads',
    subtitle: 'Snap Ads, Story & Spotlight',
    color: '#eab308',
    bgSubtle: 'rgba(234, 179, 8, 0.12)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
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
    defaultAccount: 'org_snap_88291',
  },
  {
    key: 'tiktok',
    name: 'TikTok Ads',
    subtitle: 'In-Feed & Spark Video Ads',
    color: '#010101',
    bgSubtle: 'rgba(1, 1, 1, 0.08)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="5.5" fill="#010101" />
        <g transform="translate(1.5, 1.5) scale(0.88)">
          <path fill="#25F4EE" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-2.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.75-1.92z" />
          <path fill="#FE2C55" d="M17.84 5.82A4.28 4.28 0 0 0 15.09 3.9v-.9h-.55v12.2a2.91 2.91 0 0 1-2.91 2.91 2.89 2.89 0 0 1-2.05-.85 2.9 2.9 0 0 0 2.96 2.05 2.91 2.91 0 0 0 2.91-2.91V7.81a6.37 6.37 0 0 0 3.73 1.2V6.84a4.28 4.28 0 0 1-1.34-1.02z" />
          <path fill="#FFFFFF" d="M17.24 5.82A4.28 4.28 0 0 0 14.54 3h-1.09v12.2a2.91 2.91 0 1 1-2.91-2.91c.36 0 .7.07 1.02.19V10.3a5.05 5.05 0 0 0-1.02-.1 5.08 5.08 0 1 0 5.08 5.08V8.71a6.37 6.37 0 0 0 3.73 1.2V7.74a4.28 4.28 0 0 1-2.1-1.92z" />
        </g>
      </svg>
    ),
    defaultAccount: 'tt_adv_7194819',
  },
];

export default function ClientsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [statuses, setStatuses] = useState(['Active', 'Inactive', 'Archived']);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR']);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ─── Connect Platforms State ─────────────────────────────────────
  const [connectClient, setConnectClient] = useState(null);
  const [platformsState, setPlatformsState] = useState({});
  const [connectingPlatform, setConnectingPlatform] = useState('');
  const [syncingPlatform, setSyncingPlatform] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [activeDropdownClient, setActiveDropdownClient] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownClient(null);
    const handleScrollOrResize = () => setActiveDropdownClient(null);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveDropdownClient(null);
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getClientPlatformsData = (clientOrId) => {
    if (clientOrId && typeof clientOrId === 'object' && Array.isArray(clientOrId.platforms) && clientOrId.platforms.length > 0) {
      const map = {};
      clientOrId.platforms.forEach((p) => {
        const key = (p.key || p.platformType || '').toLowerCase().replace('ads', '');
        map[key] = {
          connected: p.connected ?? (p.status === 'Connected'),
          accountId: p.accountId || '',
          lastSync: 'Active',
          autoSync: true,
        };
      });
      return map;
    }
    const clientId = typeof clientOrId === 'object' ? (clientOrId?.id ?? clientOrId?.clientId) : clientOrId;
    try {
      const saved = localStorage.getItem(`client_platforms_${clientId}`);
      return saved ? JSON.parse(saved) : getDefaultPlatforms();
    } catch {
      return getDefaultPlatforms();
    }
  };

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
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #581c87 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null); // null if creating
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const logoInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    countryCode: '+1',
    country: 'United States',
    currency: 0,
    status: 0,
    businessModel: 0,
    logo: '',
    notes: '',
    managerId: '',
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

  // Delete State
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Target Settings Modal State
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetClient, setTargetClient] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState('');
  const [targetFormData, setTargetFormData] = useState(DEFAULT_CLIENT_TARGETS);

  const getCurrencySymbol = (curr) => {
    if (!curr) return '$';
    switch (String(curr).toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      case 'SAR': return 'SAR ';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'EGP': return 'EGP ';
      case 'KWD': return 'KWD ';
      case 'QAR': return 'QAR ';
      default: return '$';
    }
  };

  const openTargetModal = async (client) => {
    setTargetClient(client);
    setTargetError('');
    setShowTargetModal(true);
    setTargetLoading(true);
    try {
      let currList = currencies;
      if (!Array.isArray(currList) || currList.length === 0) {
        currList = await getClientCurrenciesApi();
        if (Array.isArray(currList) && currList.length > 0) {
          setCurrencies(currList);
        }
      }

      const targets = await getClientTargetsApi(client.id);
      const rawCurr = targets?.currency || (typeof client.currency === 'string' ? client.currency : (Array.isArray(currList) ? currList[client.currency] : 'USD'));
      const validCurr = Array.isArray(currList) && currList.includes(rawCurr) ? rawCurr : (currList?.[0] || 'USD');

      setTargetFormData(targets ? { ...targets, currency: validCurr } : { ...DEFAULT_CLIENT_TARGETS, currency: validCurr });
    } catch {
      setTargetFormData({ ...DEFAULT_CLIENT_TARGETS, currency: currencies[0] || 'USD' });
    } finally {
      setTargetLoading(false);
    }
  };

  const handleSaveTargets = async (e) => {
    if (e) e.preventDefault();
    if (!targetClient) return;
    setTargetLoading(true);
    setTargetError('');

    if (!targetFormData.monthlyBudget || Number(targetFormData.monthlyBudget) <= 0) {
      setTargetError('Please specify a valid positive monthly budget.');
      setTargetLoading(false);
      return;
    }
    if (!targetFormData.targetRoas || Number(targetFormData.targetRoas) <= 0) {
      setTargetError('Please specify a valid positive target ROAS.');
      setTargetLoading(false);
      return;
    }
    if (!targetFormData.targetCpa || Number(targetFormData.targetCpa) <= 0) {
      setTargetError('Please specify a valid positive target CPA.');
      setTargetLoading(false);
      return;
    }

    try {
      const sanitizedTargets = {
        monthlyBudget: Number(targetFormData.monthlyBudget) || 0,
        currency: targetFormData.currency || currencies[0] || 'USD',
        targetRoas: Number(targetFormData.targetRoas) || 0,
        targetCpa: Number(targetFormData.targetCpa) || 0,
        targetRevenue: Number(targetFormData.targetRevenue) || 0,
        targetConversions: Number(targetFormData.targetConversions) || 0,
      };
      await updateClientTargetsApi(targetClient.id, sanitizedTargets);
      setShowTargetModal(false);
      setToastMsg(`Targets for ${targetClient.companyName} updated successfully!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setTargetError(err.message || 'Failed to save client target settings.');
    } finally {
      setTargetLoading(false);
    }
  };

  const applyTargetPreset = (presetType) => {
    const budget = Number(targetFormData.monthlyBudget) || 50000;
    const roas = Number(targetFormData.targetRoas) || 4.0;
    const cpa = Number(targetFormData.targetCpa) || 5.50;

    if (presetType === 'scale_10') {
      const newBudget = Math.round(budget * 1.1);
      setTargetFormData((prev) => ({
        ...prev,
        monthlyBudget: newBudget,
        targetRevenue: Math.round(newBudget * roas),
        targetConversions: Math.round(newBudget / Math.max(0.1, cpa)),
      }));
    } else if (presetType === 'scale_25') {
      const newBudget = Math.round(budget * 1.25);
      setTargetFormData((prev) => ({
        ...prev,
        monthlyBudget: newBudget,
        targetRevenue: Math.round(newBudget * (roas * 0.95)),
        targetConversions: Math.round(newBudget / Math.max(0.1, cpa * 1.05)),
      }));
    } else if (presetType === 'efficiency') {
      const newRoas = Number((roas + 0.5).toFixed(2));
      const newCpa = Number((cpa * 0.85).toFixed(2));
      setTargetFormData((prev) => ({
        ...prev,
        targetRoas: newRoas,
        targetCpa: newCpa,
        targetRevenue: Math.round(budget * newRoas),
        targetConversions: Math.round(budget / Math.max(0.1, newCpa)),
      }));
    } else if (presetType === 'default') {
      setTargetFormData({
        ...DEFAULT_CLIENT_TARGETS,
        currency: targetFormData.currency || 'USD',
      });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [clientList, userList, statusList, currList] = await Promise.all([
        getClientsApi(),
        getUsersApi().catch(() => []),
        getClientStatusesApi().catch(() => ['Active', 'Inactive', 'Archived']),
        getClientCurrenciesApi().catch(() => ['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR']),
      ]);

      const normalizedClients = (clientList || []).map((c) => ({
        ...c,
        id: c.id ?? c.clientId,
        clientId: c.clientId ?? c.id,
      }));

      setClients(normalizedClients);
      setUsers(userList || []);
      if (Array.isArray(statusList) && statusList.length) setStatuses(statusList);
      if (Array.isArray(currList) && currList.length) setCurrencies(currList);
    } catch (err) {
      setError(err.message || 'Failed to load client records.');
    } finally {
      setLoading(false);
    }
  };

  const getClientMetrics = (client) => {
    const spend = client.spend !== undefined && client.spend !== null
      ? Number(client.spend)
      : (Number(client.budget) || 0);

    const revenue = client.revenue !== undefined && client.revenue !== null
      ? Number(client.revenue)
      : (spend > 0 ? Math.round(spend * 4.0) : 0);

    const conversions = client.conversions !== undefined && client.conversions !== null
      ? Number(client.conversions)
      : (spend > 0 ? Math.round(spend / 65) : 0);

    const activeCampaigns = client.activeCampaigns !== undefined && client.activeCampaigns !== null
      ? Number(client.activeCampaigns)
      : 0;

    const targetRoas = Number(client.targetROAS) || Number(client.targetRoas) || Number(client.target?.targetROAS) || 4.0;

    const actualRoas = client.roas !== undefined && client.roas !== null
      ? Number(client.roas)
      : (spend > 0 ? (revenue / spend) : (Number(client.actualRoas) || 0));

    const targetRoasAchieved = client.achievedROAS !== undefined && client.achievedROAS !== null
      ? Number(client.achievedROAS)
      : (targetRoas > 0 ? Math.round((actualRoas * 100) / targetRoas) : 0);

    const targetConversions =
      Number(client.targetConversions) ||
      Number(client.target?.targetConversions) ||
      Math.max(conversions, 0);

    return {
      spend,
      revenue,
      conversions,
      targetConversions,
      activeCampaigns,
      totalCampaigns: Number(client.activeCampaigns || client.totalCampaigns || 0),
      targetRoas,
      actualRoas,
      targetRoasAchieved,
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditClient(null);
    setFormData({
      companyName: '',
      website: '',
      email: '',
      phone: '',
      countryCode: '+1',
      country: 'United States',
      currency: 0,
      status: 0,
      businessModel: 0,
      logo: '',
      notes: '',
      managerId: user?.id || user?.userId || users[0]?.id || '',
    });
    setModalError('');
    setLogoUploadError('');
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditClient(client);
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
      countryCode: '+1',
      country: client.country || 'United States',
      currency: clientCurrIdx,
      status: clientStatusIdx,
      businessModel: clientModelIdx,
      logo: client.logo || '',
      notes: client.notes || '',
      managerId: client.managerId || user?.id || user?.userId || '',
    });
    setModalError('');
    setLogoUploadError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.companyName?.trim()) {
      setModalError('Company Name is required.');
      return;
    }
    if (!formData.email?.trim()) {
      setModalError('Email is required.');
      return;
    }
    if (!formData.phone?.trim()) {
      setModalError('Phone is required.');
      return;
    }
    if (!formData.country?.trim()) {
      setModalError('Country is required.');
      return;
    }

    let formattedWebsite = (formData.website || '').trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const fullPhone = formData.phone.trim().startsWith('+')
      ? formData.phone.trim()
      : `${formData.countryCode || '+1'} ${formData.phone.trim()}`;

    setModalLoading(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        website: formattedWebsite || 'https://example.com',
        email: formData.email.trim(),
        phone: fullPhone,
        country: formData.country.trim(),
        currency: Number(formData.currency),
        status: Number(formData.status),
        businessModel: Number(formData.businessModel),
        logo: formData.logo?.trim() || null,
        notes: formData.notes?.trim() || null,
        managerId: formData.managerId || user?.id || user?.userId || users[0]?.id || '',
      };

      if (editClient) {
        await updateClientApi(editClient.id, payload);
      } else {
        await createClientApi(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to save client details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteClientApi(clientToDelete.id);
      setClientToDelete(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete client.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Platform Connect Handlers ──────────────────────────────────
  const getDefaultPlatforms = () => ({
    meta: { connected: true, accountId: 'act_948291048', lastSync: '10m ago', autoSync: true },
    google: { connected: true, accountId: '839-201-9482', lastSync: '25m ago', autoSync: true },
    snapchat: { connected: true, accountId: 'org_snap_88291', lastSync: '1h ago', autoSync: true },
    tiktok: { connected: true, accountId: 'tt_adv_7194819', lastSync: '40m ago', autoSync: true },
  });

  const openConnectModal = (client) => {
    setConnectClient(client);
    try {
      const saved = localStorage.getItem(`client_platforms_${client.id}`);
      setPlatformsState(saved ? JSON.parse(saved) : getDefaultPlatforms());
    } catch {
      setPlatformsState(getDefaultPlatforms());
    }
  };

  const toggleConnectPlatform = (platformKey) => {
    if (!connectClient) return;
    setConnectingPlatform(platformKey);
    setTimeout(() => {
      setPlatformsState((prev) => {
        const current = prev[platformKey] || { connected: false, accountId: '', lastSync: 'Never', autoSync: true };
        const updated = {
          ...prev,
          [platformKey]: {
            ...current,
            connected: !current.connected,
            lastSync: !current.connected ? 'Just now' : current.lastSync,
          },
        };
        try {
          localStorage.setItem(`client_platforms_${connectClient.id}`, JSON.stringify(updated));
        } catch { }
        return updated;
      });

      const plat = AD_PLATFORMS.find((p) => p.key === platformKey);
      const isNowConnected = !platformsState[platformKey]?.connected;
      setToastMsg(`${plat?.name || 'Platform'} ${isNowConnected ? 'connected successfully' : 'disconnected'} for ${connectClient.companyName}.`);
      setTimeout(() => setToastMsg(''), 3500);
      setConnectingPlatform('');
    }, 600);
  };

  const handleSyncPlatform = (platformKey) => {
    if (!connectClient) return;
    setSyncingPlatform(platformKey);
    setTimeout(() => {
      setPlatformsState((prev) => {
        const current = prev[platformKey] || {};
        const updated = {
          ...prev,
          [platformKey]: {
            ...current,
            lastSync: 'Just now',
          },
        };
        try {
          localStorage.setItem(`client_platforms_${connectClient.id}`, JSON.stringify(updated));
        } catch { }
        return updated;
      });

      const plat = AD_PLATFORMS.find((p) => p.key === platformKey);
      setToastMsg(`${plat?.name || 'Platform'} synced successfully!`);
      setTimeout(() => setToastMsg(''), 3000);
      setSyncingPlatform('');
    }, 800);
  };

  const handleUpdateAccountId = (platformKey, newId) => {
    if (!connectClient) return;
    setPlatformsState((prev) => {
      const current = prev[platformKey] || {};
      const updated = {
        ...prev,
        [platformKey]: {
          ...current,
          accountId: newId,
        },
      };
      try {
        localStorage.setItem(`client_platforms_${connectClient.id}`, JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  // Search and Filter Logic
  const [clientSortField, setClientSortField] = useState(null);
  const [clientSortDir, setClientSortDir] = useState('desc');

  const handleClientSort = (field) => {
    if (clientSortField === field) {
      setClientSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setClientSortField(field);
      setClientSortDir('desc');
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);

    const clientStatusStr = typeof c.status === 'number' ? statuses[c.status] : String(c.status);
    const matchesStatus = statusFilter === 'All' || clientStatusStr === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedClients = useMemo(() => {
    if (!clientSortField) return filteredClients;
    return [...filteredClients].sort((a, b) => {
      const getVal = (client, f) => {
        const metrics = getClientMetrics(client);
        if (f === 'spend') return Number(metrics.spend) || 0;
        if (f === 'revenue') return Number(metrics.revenue) || 0;
        if (f === 'conversions') return Number(metrics.conversions) || 0;
        if (f === 'roas') return Number(metrics.targetRoasAchieved) || 0;
        return 0;
      };
      const aVal = getVal(a, clientSortField);
      const bVal = getVal(b, clientSortField);
      return clientSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredClients, clientSortField, clientSortDir]);

  const renderClientSortTH = (field, label) => {
    const isActive = clientSortField === field;
    return (
      <th
        scope="col"
        className={`user-select-none text-nowrap ${isActive ? 'text-primary' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handleClientSort(field)}
        title={`Sort by ${label} (${isActive && clientSortDir === 'desc' ? 'Ascending' : 'Descending'})`}
      >
        <div className="d-inline-flex align-items-center gap-1">
          <span>{label}</span>
          <span className={`small ${isActive ? 'text-primary fw-bold' : 'text-secondary opacity-50'}`} style={{ fontSize: '0.7rem' }}>
            {isActive ? (clientSortDir === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };


  return (
    <DashboardLayout title="Client Portfolios | Dasher" pageTitle="Clients">
      <style>{`
        .kpi-stat-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .kpi-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
        }
        .action-dots-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--bs-border-color);
          background: var(--bs-body-bg);
          color: var(--bs-secondary-color);
          transition: all 0.18s ease;
        }
        .action-dots-btn:hover,
        .action-dots-btn.active {
          background: var(--bs-tertiary-bg);
          border-color: var(--bs-primary);
          color: var(--bs-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .action-menu-popup {
          animation: actionMenuFade 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
          box-shadow: 0 10px 28px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06) !important;
        }
        .action-menu-popup.open-up {
          animation: actionMenuFadeUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom right;
        }
        @keyframes actionMenuFade {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes actionMenuFadeUp {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .action-menu-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          width: 100%;
          border: none;
          background: transparent;
          border-radius: 8px;
          text-align: left;
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--bs-body-color);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-menu-row .avatar {
          transition: transform 0.15s ease;
        }
        .action-menu-row:hover {
          background-color: var(--bs-primary-subtle);
          color: var(--bs-primary-emphasis) !important;
          transform: translateX(2px);
        }
        .action-menu-row:hover .avatar {
          transform: scale(1.08);
        }
        .action-menu-row.danger-row:hover {
          background-color: var(--bs-danger-subtle);
          color: var(--bs-danger) !important;
        }
        .platform-chip-btn {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--bs-border-color);
          background: var(--bs-body-bg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .platform-chip-btn:hover {
          transform: translateY(-2px) scale(1.1);
          border-color: var(--bs-primary) !important;
          box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.25) !important;
          background: var(--bs-tertiary-bg);
        }
        .platform-chip-btn:active {
          transform: translateY(0) scale(0.95);
        }
      `}</style>

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
              Clients
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="h2 mb-1">Client Portfolios</h1>
            <p className="text-secondary mb-0">Manage active clients, contact information, and assigned managers.</p>
          </div>
          <div>
            <button className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-3 px-3 py-2" onClick={openCreateModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
          </div>
        )}



        {/* Search & Filter Controls */}
        <div className="card mb-4 border-0 shadow-sm rounded-3 mt-2 mt-lg-3">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-8 col-12">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search clients by company name, email, phone, or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4 col-12">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive" style={{ minHeight: 280 }}>
            <table className="table align-middle text-nowrap mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">Client</th>
                  <th scope="col">Platforms</th>
                  {renderClientSortTH('spend', 'Spend')}
                  {renderClientSortTH('revenue', 'Revenue')}
                  {renderClientSortTH('conversions', 'Conversions')}
                  <th scope="col">Status</th>
                  {renderClientSortTH('roas', 'Achieved ROAS')}
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading clients...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-secondary">
                      No clients found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  sortedClients.map((client, index) => {
                    const statusName =
                      typeof client.status === 'number'
                        ? statuses[client.status] || 'Active'
                        : String(client.status);

                    const badgeClass =
                      statusName === 'Active' || statusName === '0'
                        ? 'badge text-success-emphasis bg-success-subtle'
                        : statusName === 'Inactive' || statusName === '1'
                          ? 'badge text-secondary-emphasis bg-secondary-subtle'
                          : 'badge text-info-emphasis bg-info-subtle';

                    const clientPlatforms = getClientPlatformsData(client);
                    const connectedCount = AD_PLATFORMS.filter(
                      (p) => clientPlatforms[p.key]?.connected !== false
                    ).length;

                    const metrics = getClientMetrics(client);
                    const currSymbol = getCurrencySymbol(client.currency);

                    return (
                      <tr
                        key={client.id}
                        className="client-table-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        title={`Click to view ${client.companyName} details`}
                      >
                        {/* 1. Company */}
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <ClientAvatar
                              logo={client.logo}
                              name={client.companyName}
                              size={42}
                              borderRadius={12}
                              fontSize="0.9rem"
                            />
                            <div>
                              <h6 className="mb-0 fs-6 fw-semibold text-body-emphasis">{client.companyName}</h6>
                              <div className="text-secondary small mt-0.5 opacity-75" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.03em' }}>
                                {(() => {
                                  const isLead =
                                    client.model === 'Lead' ||
                                    client.businessModel === 'Lead' ||
                                    client.businessModel === 'lead_generation' ||
                                    client.model === 1 ||
                                    client.businessModel === 1;
                                  return isLead ? 'LEAD' : 'E-COMMERCE';
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Platforms (Only Connected with Clickable Cues) */}
                        <td>
                          <div className="d-flex align-items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {connectedCount > 0 ? (
                              AD_PLATFORMS.filter(
                                (platform) => clientPlatforms[platform.key]?.connected !== false
                              ).map((platform) => (
                                <button
                                  key={platform.key}
                                  type="button"
                                  className="platform-chip-btn p-0 border-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const tabName = platform.key === 'meta' ? 'Meta' : platform.key === 'tiktok' ? 'TikTok' : platform.key === 'google' ? 'Google' : 'Snapchat';
                                    navigate(`/clients/${client.id}/${tabName}`);
                                  }}
                                  title={`View ${client.companyName} ${platform.name} tab`}
                                  aria-label={`View ${platform.name} tab`}
                                >
                                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                                    {platform.icon}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-primary rounded-pill py-1 px-2.5 small d-inline-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                                style={{ fontSize: '0.72rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConnectModal(client);
                                }}
                                title="Click to connect ad platforms"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span>Connect</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 3. Spend */}
                        <td>
                          <span className="fw-semibold text-danger">
                            {currSymbol}{metrics.spend.toLocaleString()}
                          </span>
                        </td>

                        {/* 4. Revenue */}
                        <td>
                          <span className="fw-semibold text-success">
                            {currSymbol}{metrics.revenue.toLocaleString()}
                          </span>
                        </td>

                        {/* 5. Conversions */}
                        <td>
                          <div className="d-inline-flex align-items-baseline gap-1">
                            <span className="fw-semibold text-body-emphasis">
                              {metrics.conversions.toLocaleString()}
                            </span>
                            <span className="text-secondary small">
                              / {metrics.targetConversions.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* 6. Status */}
                        <td>
                          <span className={badgeClass}>{statusName}</span>
                        </td>

                        {/* 7. Achieved ROAS */}
                        <td>
                          <div className="d-flex flex-column gap-1" style={{ minWidth: 125, maxWidth: 145 }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className={`fw-bold small ${metrics.targetRoasAchieved >= 100
                                ? 'text-success'
                                : metrics.targetRoasAchieved >= 80
                                  ? 'text-primary'
                                  : metrics.targetRoasAchieved >= 60
                                    ? 'text-warning'
                                    : 'text-danger'
                                }`}>
                                {metrics.targetRoasAchieved}%
                              </span>
                              <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                                {metrics.actualRoas.toFixed(1)}x / {metrics.targetRoas.toFixed(1)}x
                              </span>
                            </div>
                            <div className="progress" style={{ height: 4, borderRadius: 2 }}>
                              <div
                                className={`progress-bar ${metrics.targetRoasAchieved >= 100
                                  ? 'bg-success'
                                  : metrics.targetRoasAchieved >= 80
                                    ? 'bg-primary'
                                    : metrics.targetRoasAchieved >= 60
                                      ? 'bg-warning'
                                      : 'bg-danger'
                                  }`}
                                role="progressbar"
                                style={{ width: `${Math.min(100, Math.max(5, metrics.targetRoasAchieved))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 10. Actions (Ellipses Trigger Button) */}
                        <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`action-dots-btn ${activeDropdownClient?.id === client.id ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeDropdownClient?.id === client.id) {
                                setActiveDropdownClient(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const isLastTwo = index >= filteredClients.length - 2;
                                const isNearBottom = (window.innerHeight - rect.bottom) < 195;
                                const openUp = isLastTwo || isNearBottom;

                                setDropdownPos({
                                  top: openUp ? 'auto' : rect.bottom + 6,
                                  bottom: openUp ? (window.innerHeight - rect.top + 6) : 'auto',
                                  right: window.innerWidth - rect.right,
                                  openUp,
                                });
                                setActiveDropdownClient(client);
                              }
                            }}
                            title="More Options"
                            aria-label="More Options"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1.3" />
                              <circle cx="12" cy="5" r="1.3" />
                              <circle cx="12" cy="19" r="1.3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Floating Actions Dropdown Menu (Rendered Outside Table) ─── */}
        {activeDropdownClient && (
          <div
            className={`position-fixed shadow-lg border rounded-3 p-1.5 action-menu-popup bg-body ${dropdownPos.openUp ? 'open-up' : ''}`}
            style={{
              zIndex: 1090,
              minWidth: 175,
              top: dropdownPos.top,
              bottom: dropdownPos.bottom,
              right: dropdownPos.right,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Connect */}
            <button
              className="action-menu-row text-body-emphasis"
              onClick={() => {
                const c = activeDropdownClient;
                setActiveDropdownClient(null);
                openConnectModal(c);
              }}
            >
              <div className="avatar bg-success-subtle text-success rounded-2 p-1.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span className="fw-semibold">Connect</span>
            </button>

            {/* 2. View Details */}
            <button
              className="action-menu-row text-body-emphasis"
              onClick={() => {
                const c = activeDropdownClient;
                setActiveDropdownClient(null);
                navigate(`/clients/${c.id}`);
              }}
            >
              <div className="avatar bg-primary-subtle text-primary rounded-2 p-1.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2" />
                  <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
                </svg>
              </div>
              <span className="fw-semibold">View Details</span>
            </button>

            {/* 3. Target Settings */}
            <button
              className="action-menu-row text-body-emphasis"
              onClick={() => {
                const c = activeDropdownClient;
                setActiveDropdownClient(null);
                navigate(`/clients/${c.id}?openTargets=true`, { state: { openTargets: true } });
              }}
            >
              <div className="avatar bg-success-subtle text-success rounded-2 p-1.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span className="fw-semibold">Target Settings</span>
            </button>

            {/* 3. Edit Client */}
            <button
              className="action-menu-row text-body-emphasis"
              onClick={() => {
                const c = activeDropdownClient;
                setActiveDropdownClient(null);
                openEditModal(c);
              }}
            >
              <div className="avatar bg-secondary-subtle text-secondary-emphasis rounded-2 p-1.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                  <path d="M13.5 6.5l4 4" />
                </svg>
              </div>
              <span className="fw-semibold">Edit Client</span>
            </button>

            <hr className="my-1 opacity-25" style={{ borderColor: 'var(--bs-border-color)' }} />

            {/* 4. Delete Client */}
            <button
              className="action-menu-row danger-row text-danger"
              onClick={() => {
                const c = activeDropdownClient;
                setActiveDropdownClient(null);
                setClientToDelete(c);
              }}
            >
              <div className="avatar bg-danger-subtle text-danger rounded-2 p-1.5 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 28, height: 28 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </div>
              <span className="fw-semibold">Delete Client</span>
            </button>
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            onClick={() => setShowModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editClient ? 'Edit Client' : 'Create New Client'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">
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

                      <div className="col-12">
                        <label className="form-label fw-semibold small">Company Logo</label>
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
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                        <label className="form-label fw-semibold small">
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
                        <label className="form-label fw-semibold small">
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
                        <label className="form-label fw-semibold small">
                          Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <select
                            className="form-select"
                            style={{ maxWidth: '105px' }}
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
                            <option value="+965">🇰🇼 +965</option>
                            <option value="+974">🇶🇦 +974</option>
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

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">
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
                        <label className="form-label fw-semibold small">Business Model</label>
                        <select
                          className="form-select"
                          value={formData.businessModel}
                          onChange={(e) => setFormData({ ...formData, businessModel: Number(e.target.value) })}
                        >
                          <option value={0}>E-Commerce</option>
                          <option value={1}>Lead Generation</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Currency</label>
                        <select
                          className="form-select"
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: Number(e.target.value) })}
                        >
                          {currencies.map((curr, idx) => (
                            <option key={curr || idx} value={idx}>
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                        >
                          {statuses.map((st, idx) => (
                            <option key={st || idx} value={idx}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-semibold small">Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes about client..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                      {modalLoading ? 'Saving...' : 'Save Client'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {clientToDelete && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            onClick={() => setClientToDelete(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Client</h5>
                  <button type="button" className="btn-close" onClick={() => setClientToDelete(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="mb-0">
                    Are you sure you want to delete client <strong>{clientToDelete.companyName}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setClientToDelete(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connect Platforms Modal */}
        {connectClient && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
            tabIndex="-1"
            onClick={() => setConnectClient(null)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom p-4">
                  <div className="d-flex align-items-center gap-3">
                    <ClientAvatar
                      logo={connectClient.logo}
                      name={connectClient.companyName}
                      size={44}
                      borderRadius={12}
                      fontSize="0.95rem"
                    />
                    <div>
                      <h5 className="modal-title fw-bold mb-0">Connect Ad Platforms &middot; {connectClient.companyName}</h5>
                      <small className="text-secondary">Integrate live advertising channels to sync campaign analytics and ROAS data</small>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setConnectClient(null)} aria-label="Close"></button>
                </div>

                <div className="modal-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-secondary small fw-semibold text-uppercase">Supported Ad Channels</span>
                    <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2.5 py-1 fw-semibold">
                      {Object.values(platformsState).filter((p) => p?.connected).length} of {AD_PLATFORMS.length} Connected
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {AD_PLATFORMS.map((platform) => {
                      const state = platformsState[platform.key] || { connected: false, accountId: platform.defaultAccount, lastSync: 'Never', autoSync: true };
                      const isConnecting = connectingPlatform === platform.key;
                      const isSyncing = syncingPlatform === platform.key;

                      return (
                        <div
                          key={platform.key}
                          className="card border rounded-3 p-3 transition-all"
                          style={{
                            backgroundColor: state.connected ? 'rgba(var(--bs-primary-rgb), 0.02)' : 'var(--bs-body-bg)',
                            borderColor: state.connected ? 'rgba(var(--bs-primary-rgb), 0.22)' : 'var(--bs-border-color)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            {/* Left: Brand Icon + Info */}
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-3 p-2.5 flex-shrink-0 shadow-xs"
                                style={{
                                  backgroundColor: platform.bgSubtle,
                                  width: 48,
                                  height: 48,
                                  opacity: state.connected ? 1 : 0.85,
                                }}
                              >
                                {platform.icon}
                              </div>
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <h6 className="mb-0 fw-bold fs-6">{platform.name}</h6>
                                  {state.connected ? (
                                    <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-0.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                                      <span className="d-inline-block rounded-circle bg-success me-1" style={{ width: 6, height: 6 }}></span>
                                      Connected
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle px-2 py-0.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
                                      <span className="d-inline-block rounded-circle bg-secondary me-1" style={{ width: 6, height: 6 }}></span>
                                      Disconnected
                                    </span>
                                  )}
                                </div>
                                <small className="text-secondary d-block mt-0.5">{platform.subtitle}</small>
                              </div>
                            </div>

                            {/* Right: Info Column + Action Buttons */}
                            <div className="d-flex align-items-center gap-3 flex-wrap justify-content-md-end">
                              {/* Account Info Column */}
                              <div className="d-none d-sm-flex flex-column text-md-end">
                                {state.connected ? (
                                  <>
                                    <span className="text-body-emphasis small fw-semibold font-monospace">{state.accountId || platform.defaultAccount}</span>
                                    <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                                      <span className="text-success">&bull;</span> Synced {state.lastSync || 'Recently'}
                                    </small>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-secondary small fw-medium font-monospace">{platform.defaultAccount}</span>
                                    <small className="text-body-tertiary" style={{ fontSize: '0.72rem' }}>
                                      <span className="text-secondary">&bull;</span> Not linked
                                    </small>
                                  </>
                                )}
                              </div>

                              {/* Buttons Column */}
                              <div className="d-flex align-items-center gap-2">
                                {state.connected ? (
                                  <>
                                    <button
                                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2"
                                      onClick={() => handleSyncPlatform(platform.key)}
                                      disabled={isSyncing}
                                      title="Sync platform metrics now"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={isSyncing ? 'spin-icon' : ''}>
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                      </svg>
                                      <span className="small">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2"
                                      onClick={() => toggleConnectPlatform(platform.key)}
                                      disabled={isConnecting}
                                      title="Disconnect platform"
                                    >
                                      {isConnecting ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm" role="status"></span>
                                          <span className="small">Updating...</span>
                                        </>
                                      ) : (
                                        <span className="small">Disconnect</span>
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-2"
                                      disabled
                                      title="Sync unavailable while disconnected"
                                      style={{ opacity: 0.45 }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                      </svg>
                                      <span className="small">Sync</span>
                                    </button>

                                    <button
                                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
                                      onClick={() => toggleConnectPlatform(platform.key)}
                                      disabled={isConnecting}
                                      title="Connect this platform"
                                    >
                                      {isConnecting ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm" role="status"></span>
                                          <span className="small">Connecting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                          </svg>
                                          <span className="small fw-semibold">Connect</span>
                                        </>
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-footer border-top p-3 bg-light d-flex justify-content-between">
                  <span className="text-secondary small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                    OAuth 2.0 secured API tokens &middot; Auto-sync active
                  </span>
                  <button type="button" className="btn btn-primary btn-sm px-4" onClick={() => setConnectClient(null)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Target Settings Modal ─────────────────────────────────── */}
        {showTargetModal && targetClient && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1070 }}
            tabIndex="-1"
            onClick={() => setShowTargetModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                {/* Modal Header */}
                <div className="modal-header border-bottom p-4 bg-body-tertiary">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar bg-primary text-white rounded-3 p-2.5 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 44, height: 44 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0 text-body-emphasis">Client Target Settings</h5>
                      <small className="text-secondary">Configure growth targets, budget pacing, and conversion benchmarks for <strong className="text-body-emphasis">{targetClient.companyName}</strong></small>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowTargetModal(false)} aria-label="Close"></button>
                </div>

                <form onSubmit={handleSaveTargets}>
                  <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                    {targetError && <div className="alert alert-danger mb-3 py-2 px-3 small">{targetError}</div>}

                    {/* ─── 1. Budget & Currency Row ─── */}
                    <div className="row g-3 mb-4">
                      {/* Monthly Budget */}
                      <div className="col-md-7">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Monthly Ad Budget ({getCurrencySymbol(targetFormData.currency)}) <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-body-tertiary fw-semibold">
                            {getCurrencySymbol(targetFormData.currency)}
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="form-control fw-bold text-body-emphasis"
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
                            placeholder="50000"
                            required
                          />
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target total ad spend allocated per month</small>
                      </div>

                      {/* Currency */}
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Currency <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select fw-semibold"
                          value={targetFormData.currency || (currencies[0] || 'USD')}
                          onChange={(e) => setTargetFormData({ ...targetFormData, currency: e.target.value })}
                        >
                          {currencies.map((curr) => (
                            <option key={curr} value={curr}>
                              {curr} ({getCurrencySymbol(curr).trim()})
                            </option>
                          ))}
                        </select>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Account reporting currency</small>
                      </div>
                    </div>

                    {/* ─── 4. Target ROAS & Target CPA ─── */}
                    <div className="row g-3 mb-4">
                      {/* Target ROAS */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Target ROAS (x) <span className="text-danger">*</span>
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
                            placeholder="4.00"
                            required
                          />
                          <span className="input-group-text bg-body-tertiary fw-bold">x</span>
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Minimum return on ad spend goal</small>
                      </div>

                      {/* Target CPA */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Target CPA ({getCurrencySymbol(targetFormData.currency)}) <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-body-tertiary fw-semibold">
                            {getCurrencySymbol(targetFormData.currency)}
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            className="form-control fw-bold text-body-emphasis"
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
                            placeholder="5.50"
                            required
                          />
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target cost per conversion acquisition</small>
                      </div>
                    </div>

                    {/* ─── 5. Projected Revenue & Projected Conversions ─── */}
                    <div className="row g-3 mb-4">
                      {/* Target Revenue */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Target Revenue ({getCurrencySymbol(targetFormData.currency)})
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-body-tertiary fw-semibold">
                            {getCurrencySymbol(targetFormData.currency)}
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="form-control"
                            value={targetFormData.targetRevenue || ''}
                            onChange={(e) => setTargetFormData({ ...targetFormData, targetRevenue: e.target.value })}
                            placeholder="e.g. 200000"
                          />
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Projected monthly gross revenue</small>
                      </div>

                      {/* Target Conversions */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body-emphasis">
                          Target Conversions
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control"
                          value={targetFormData.targetConversions || ''}
                          onChange={(e) => setTargetFormData({ ...targetFormData, targetConversions: e.target.value })}
                          placeholder="e.g. 9000"
                        />
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Estimated total conversions required</small>
                      </div>
                    </div>

                    {/* ─── 6. Target Presets Toolbar ─── */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-1 border-top mt-3 pt-3">
                      <span className="small text-secondary fw-semibold" style={{ fontSize: '0.74rem' }}>Quick Presets:</span>
                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1 small"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => applyTargetPreset('scale_10')}
                          title="Increase budget by 10% for scaling"
                        >
                          +10% Growth
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1 small"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => applyTargetPreset('scale_25')}
                          title="Increase budget by 25% for aggressive scale"
                        >
                          +25% Aggressive
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-success rounded-pill px-2 py-1 small"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => applyTargetPreset('efficiency')}
                          title="Increase target ROAS and tighten CPA"
                        >
                          High Efficiency
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger rounded-pill px-2 py-1 small"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => applyTargetPreset('default')}
                          title="Reset to default targets"
                        >
                          Reset Defaults
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="modal-footer border-top p-3 bg-body-tertiary d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3 rounded-2" onClick={() => setShowTargetModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm px-4 rounded-2 d-inline-flex align-items-center gap-2 fw-semibold shadow-xs" disabled={targetLoading}>
                      {targetLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Target Settings</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1090 }}>
            <div className="alert alert-success d-flex align-items-center gap-2 shadow-lg mb-0 rounded-3 py-2 px-3 small">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span>{toastMsg}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
