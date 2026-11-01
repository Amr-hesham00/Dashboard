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
} from '../api/clients';
import {
  connectGoogleAdsApi,
  disconnectClientGoogleAdsApi,
  getGoogleAdsStatusApi,
  getGoogleAdsAccountsApi,
  selectGoogleAdsAccountApi,
} from '../api/googleAds';
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
  const [googleStatus, setGoogleStatus] = useState({ connected: false, linkedAccounts: [] });
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [googleToast, setGoogleToast] = useState(null);
  const [showGoogleAccountsModal, setShowGoogleAccountsModal] = useState(false);
  const [googleAccountsLoading, setGoogleAccountsLoading] = useState(false);
  const [googleAccountsError, setGoogleAccountsError] = useState('');
  const [googleAccounts, setGoogleAccounts] = useState([]);
  const [selectedGoogleCustomerId, setSelectedGoogleCustomerId] = useState('');
  const [selectedGoogleClientId, setSelectedGoogleClientId] = useState('');
  const [associatingGoogleAccount, setAssociatingGoogleAccount] = useState(false);
  const [pendingGoogleConfirm, setPendingGoogleConfirm] = useState(null);
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
    const clientObj =
      clientOrId && typeof clientOrId === 'object'
        ? clientOrId
        : clients.find((c) => String(c.id ?? c.clientId) === String(clientOrId)) || null;
    const clientId = clientObj ? (clientObj.id ?? clientObj.clientId) : clientOrId;

    const map = {
      meta: { connected: false, accountId: '', accountName: '' },
      google: { connected: false, accountId: '', accountName: '' },
      snapchat: { connected: false, accountId: '', accountName: '' },
      tiktok: { connected: false, accountId: '', accountName: '' },
    };

    if (clientObj && Array.isArray(clientObj.platforms)) {
      clientObj.platforms.forEach((p) => {
        const key = String(p.key || p.platformType || '').toLowerCase().replace('ads', '');
        if (!map[key]) return;
        const isConnected =
          key === 'google'
            ? Boolean(p.accountId && (p.connected ?? (p.status === 'Connected')))
            : Boolean(p.connected ?? (p.status === 'Connected'));
        const rawId = p.accountId || '';
        const formattedId =
          key === 'google' && rawId.length === 10 && !rawId.includes('-')
            ? `${rawId.slice(0, 3)}-${rawId.slice(3, 6)}-${rawId.slice(6)}`
            : rawId;
        map[key] = {
          connected: isConnected,
          accountId: isConnected ? formattedId : '',
          accountName: isConnected ? (p.accountName || '') : '',
        };
      });
    }

    if (clientId && googleStatus?.connected && Array.isArray(googleStatus.linkedAccounts)) {
      const linkedAssoc = googleStatus.linkedAccounts.find(
        (a) => String(a.clientId) === String(clientId)
      );
      if (linkedAssoc?.customerId) {
        map.google = {
          connected: true,
          accountId: linkedAssoc.formattedCustomerId || linkedAssoc.customerId,
          accountName: linkedAssoc.accountName || map.google.accountName || '',
        };
      }
    }

    return map;
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
  const [logoFile, setLogoFile] = useState(null);
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

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
    if (!allowed.includes(ext)) {
      setLogoUploadError('Unsupported file format. Supported formats: PNG, JPG, JPEG , GIF (max 5MB)');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (file.size === 0) {
      setLogoUploadError('Selected image file is empty.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Image size exceeds 5MB limit.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setFormData((prev) => ({ ...prev, logo: previewUrl }));
    setLogoUploadError('');
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
        getClientsApi(true),
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
    const spend = Number(client.spend) || 0;
    const revenue = Number(client.revenue) || 0;
    const conversions = Number(client.conversions) || 0;
    const activeCampaigns = Number(client.activeCampaigns) || 0;
    const targetRoas =
      Number(client.targetROAS) ||
      Number(client.targetRoas) ||
      Number(client.target?.targetROAS) ||
      0;
    const actualRoas = Number(client.roas) || 0;
    const targetRoasAchieved = Number(client.achievedROAS) || 0;
    const targetConversions =
      Number(client.targetConversions) ||
      Number(client.target?.targetConversions) ||
      0;

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

    // Check for Google OAuth callback redirect parameters
    const searchParams = new URLSearchParams(window.location.search);
    const googleAuth = searchParams.get('googleAuth');
    const errorCode = searchParams.get('errorCode');
    const callbackMessage = searchParams.get('message');

    getGoogleAdsStatusApi()
      .then((status) => {
        if (status) {
          setGoogleStatus({
            connected: Boolean(status.connected),
            linkedAccounts: status.linkedAccounts || [],
          });
        }
      })
      .catch(() => { });

    if (googleAuth === 'success') {
      setGoogleStatus((prev) => ({ ...prev, connected: true }));
      setGoogleToast({
        type: 'success',
        message: callbackMessage || 'Google Ads authorized successfully! Select a Google Ads advertiser account to associate with your Client.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      let pendingClientId = null;
      try {
        pendingClientId = sessionStorage.getItem('pending_google_client_id');
        sessionStorage.removeItem('pending_google_client_id');
      } catch { }
      openGoogleAccountsModal(pendingClientId ? { id: Number(pendingClientId) } : null);
    } else if (googleAuth === 'error') {
      if (errorCode === 'already_connected') {
        setGoogleStatus({ connected: true });
      }
      const errorMap = {
        already_connected: 'Your account is already connected to Google Ads. Reconnecting is not allowed.',
        access_denied: 'Google authorization was canceled or permission was declined.',
        missing_refresh_token: 'Google did not return a refresh token for this account. Please re-authorize and ensure consent is granted.',
        invalid_grant: 'The authorization code was invalid, expired, or already used. Please try connecting again.',
        invalid_state: 'Security verification failed (state mismatch or session expired). Please try connecting again.',
        scope_not_granted: 'The Google Ads permission was not granted. Please ensure the Google Ads scope is checked during consent.',
        not_configured: 'Google OAuth is not configured on the server.',
        redirect_uri_mismatch: 'Redirect URI mismatch with Google Cloud Console configuration.',
        admin_policy_enforced: 'Google Workspace policy prevented authorization.',
        org_internal: 'This application is restricted to internal organization accounts.',
        disallowed_useragent: 'This browser environment is not supported by Google OAuth.',
        deleted_client: 'The Google OAuth client is no longer available.',
      };
      setGoogleToast({
        type: 'error',
        message: callbackMessage || errorMap[errorCode] || 'Failed to complete Google Ads authorization. Please try again.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openCreateModal = () => {
    setEditClient(null);
    setLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
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
    setLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
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

    const cleanedPhone = (formData.phone || '').trim().replace(/\s+/g, '');
    const fullPhone = cleanedPhone.startsWith('+')
      ? cleanedPhone
      : `${formData.countryCode || '+1'}${cleanedPhone}`;

    if (fullPhone.length < 8 || fullPhone.length > 15) {
      setModalError('Phone number must be between 8 and 15 characters.');
      return;
    }

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
        logoFile: logoFile || null,
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
  const openGoogleAccountsModal = async (clientForAssociation = null) => {
    const defaultClientId =
      clientForAssociation?.id ??
      clientForAssociation?.clientId ??
      connectClient?.id ??
      connectClient?.clientId ??
      clients[0]?.id ??
      clients[0]?.clientId ??
      '';
    setSelectedGoogleClientId(defaultClientId ? String(defaultClientId) : '');
    setSelectedGoogleCustomerId('');
    setGoogleAccountsError('');
    setPendingGoogleConfirm(null);
    setShowGoogleAccountsModal(true);
    setGoogleAccountsLoading(true);

    try {
      const discovery = await getGoogleAdsAccountsApi();
      const accountsList = discovery?.accounts || [];
      setGoogleAccounts(accountsList);
      setGoogleStatus((prev) => ({ ...prev, connected: true }));

      // Pre-select the client's existing account if linked, or the first unlinked selectable Advertiser account
      const existingForClient = accountsList.find(
        (a) => !a.isManager && a.canSelect !== false && String(a.associatedClientId) === String(defaultClientId)
      );
      const firstUnlinkedAdvertiser = accountsList.find(
        (a) => !a.isManager && a.canSelect !== false && !a.associatedClientId
      );
      const firstAdvertiser =
        existingForClient ||
        firstUnlinkedAdvertiser ||
        accountsList.find((a) => !a.isManager && a.canSelect !== false);
      if (firstAdvertiser) {
        setSelectedGoogleCustomerId(firstAdvertiser.customerId);
      }
    } catch (err) {
      setGoogleAccountsError(err.message || 'Failed to discover accessible Google Ads accounts.');
    } finally {
      setGoogleAccountsLoading(false);
    }
  };

  // Step 1: Validate selection and open confirmation dialog containing Client name and Google Ads account ID
  const handleAssociateGoogleAdsAccount = (e) => {
    if (e) e.preventDefault();
    if (!selectedGoogleClientId) {
      setGoogleAccountsError('Please select a Dashboard Client.');
      return;
    }
    if (!selectedGoogleCustomerId) {
      setGoogleAccountsError('Please select a Google Ads Advertiser account.');
      return;
    }

    const chosenAccount = googleAccounts.find((a) => a.customerId === selectedGoogleCustomerId);
    if (chosenAccount?.isManager) {
      setGoogleAccountsError('Manager (MCC) accounts cannot be selected as an advertising client. Please select an Advertiser account.');
      return;
    }

    const targetClientObj =
      clients.find((c) => String(c.id) === String(selectedGoogleClientId)) ||
      (connectClient && String(connectClient.id) === String(selectedGoogleClientId) ? connectClient : null);

    const existingGooglePlat = targetClientObj?.platforms?.find(
      (p) => p.key === 'google' || p.platformType === 0 || p.platformType === 'GoogleAds'
    );
    const existingLinkedAssoc = googleStatus?.linkedAccounts?.find(
      (a) => String(a.clientId) === String(selectedGoogleClientId)
    );
    const existingAccountId =
      existingLinkedAssoc?.formattedCustomerId ||
      existingLinkedAssoc?.customerId ||
      existingGooglePlat?.accountId ||
      '';

    setGoogleAccountsError('');
    setPendingGoogleConfirm({
      clientId: Number(selectedGoogleClientId),
      clientName: targetClientObj?.companyName || `Client #${selectedGoogleClientId}`,
      customerId: selectedGoogleCustomerId,
      formattedCustomerId: chosenAccount?.formattedCustomerId || selectedGoogleCustomerId,
      accountName: chosenAccount?.descriptiveName || `Google Ads Account (${selectedGoogleCustomerId})`,
      existingAccountId:
        existingAccountId &&
        existingAccountId.replace(/-/g, '') !== String(selectedGoogleCustomerId).replace(/-/g, '')
          ? existingAccountId
          : null,
    });
  };

  // Step 2: Persist association only after explicit user confirmation
  const confirmAssociateGoogleAdsAccount = async () => {
    if (!pendingGoogleConfirm) return;
    setAssociatingGoogleAccount(true);
    setGoogleAccountsError('');
    try {
      const result = await selectGoogleAdsAccountApi(
        pendingGoogleConfirm.clientId,
        pendingGoogleConfirm.customerId
      );
      const assoc = result?.association;
      setPendingGoogleConfirm(null);
      setShowGoogleAccountsModal(false);
      await loadData();
      const status = await getGoogleAdsStatusApi().catch(() => null);
      if (status) {
        setGoogleStatus({
          connected: Boolean(status.connected),
          linkedAccounts: status.linkedAccounts || [],
        });
      }
      if (connectClient && String(connectClient.id) === String(pendingGoogleConfirm.clientId)) {
        setPlatformsState((prev) => ({
          ...prev,
          google: {
            ...(prev.google || {}),
            connected: true,
            accountId: assoc?.formattedCustomerId || assoc?.customerId || pendingGoogleConfirm.formattedCustomerId,
            accountName: assoc?.accountName || pendingGoogleConfirm.accountName,
            lastSync: 'Connected',
            autoSync: true,
          },
        }));
      }
      setGoogleToast({
        type: 'success',
        message:
          result?.message ||
          `Google Ads account ${assoc?.formattedCustomerId || pendingGoogleConfirm.formattedCustomerId} associated with ${assoc?.clientName || pendingGoogleConfirm.clientName}!`,
      });
    } catch (err) {
      setGoogleAccountsError(err.message || 'Failed to associate Google Ads account with the selected Client.');
      setPendingGoogleConfirm(null);
    } finally {
      setAssociatingGoogleAccount(false);
    }
  };

  const handleConnectGoogleAds = async (clientContext = null) => {
    const targetClient = clientContext || connectClient;
    if (googleStatus?.connected) {
      await openGoogleAccountsModal(targetClient);
      return;
    }
    setGoogleConnecting(true);
    setConnectingPlatform('google');
    setGoogleToast(null);
    try {
      if (targetClient?.id) {
        try {
          sessionStorage.setItem('pending_google_client_id', String(targetClient.id));
        } catch { }
      }
      const authUrl = await connectGoogleAdsApi();
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('No authorization URL returned from server.');
      }
    } catch (err) {
      if (err.alreadyConnected || err.errorCode === 'already_connected' || err.status === 409) {
        setGoogleStatus((prev) => ({ ...prev, connected: true }));
        setGoogleConnecting(false);
        setConnectingPlatform('');
        await openGoogleAccountsModal(targetClient);
        return;
      }
      setGoogleToast({
        type: 'error',
        message: err.message || 'Failed to start Google Ads authorization. Please try again.',
      });
      setGoogleConnecting(false);
      setConnectingPlatform('');
    }
  };

  const handleDisconnectGoogleAds = async (clientContext = null) => {
    const targetClient = clientContext || connectClient;
    const clientId = targetClient?.id ?? targetClient?.clientId;
    if (!clientId) return;

    setGoogleConnecting(true);
    setConnectingPlatform('google');
    setGoogleToast(null);
    try {
      await disconnectClientGoogleAdsApi(clientId);
      await loadData();
      const status = await getGoogleAdsStatusApi().catch(() => null);
      if (status) {
        setGoogleStatus({
          connected: Boolean(status.connected),
          linkedAccounts: status.linkedAccounts || [],
        });
      }
      setPlatformsState((prev) => ({
        ...prev,
        google: {
          connected: false,
          accountId: '',
          accountName: '',
        },
      }));
      setGoogleToast({
        type: 'success',
        message: `Google Ads account disconnected from ${targetClient.companyName}.`,
      });
    } catch (err) {
      setGoogleToast({
        type: 'error',
        message: err.message || 'Failed to disconnect Google Ads account from client. Please try again.',
      });
    } finally {
      setGoogleConnecting(false);
      setConnectingPlatform('');
    }
  };

  const openConnectModal = (client) => {
    setConnectClient(client);
    setPlatformsState(getClientPlatformsData(client));
  };

  const toggleConnectPlatform = async (platformKey) => {
    if (!connectClient) return;
    if (platformKey === 'google') {
      if (googleStatus?.connected) {
        await openGoogleAccountsModal(connectClient);
      } else {
        await handleConnectGoogleAds(connectClient);
      }
    }
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
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px !important;
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
          gap: 12px;
          padding: 10px 14px;
          width: 100%;
          border: none;
          background: transparent;
          border-radius: 8px;
          text-align: left;
          font-size: 0.88rem;
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
        .platform-chip-static {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--bs-border-color);
          background: var(--bs-body-bg);
          cursor: default;
          user-select: none;
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



        {/* Google OAuth Status Banner */}
        {googleToast && (
          <div className={`alert ${googleToast.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`} role="alert">
            {googleToast.message}
            <button type="button" className="btn-close" onClick={() => setGoogleToast(null)} aria-label="Close"></button>
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
                    const connectedPlatforms = AD_PLATFORMS.filter(
                      (p) => Boolean(clientPlatforms[p.key]?.connected)
                    );

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

                        {/* 2. Platforms (Actually Connected Only, Non-Clickable) */}
                        <td
                          style={{ cursor: 'default' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {connectedPlatforms.length > 0 ? (
                              connectedPlatforms.map((platform) => (
                                <div
                                  key={platform.key}
                                  className="platform-chip-static"
                                  title={
                                    clientPlatforms[platform.key]?.accountId
                                      ? `${platform.name} (${clientPlatforms[platform.key].accountId})`
                                      : platform.name
                                  }
                                >
                                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                                    {platform.icon}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-secondary small">Not connected</span>
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
            className={`position-fixed shadow-lg border rounded-3 action-menu-popup bg-body ${dropdownPos.openUp ? 'open-up' : ''}`}
            style={{
              zIndex: 1090,
              minWidth: 200,
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
              <span className="fw-semibold">Connect Platforms</span>
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
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom px-4 py-3 bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center shadow-xs" style={{ width: 42, height: 42 }}>
                      {editClient ? (
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
                        {editClient ? 'Edit Client Details' : 'Create New Client'}
                      </h5>
                      <small className="text-secondary" style={{ fontSize: '0.82rem' }}>
                        Update company portfolio, contacts, and account settings
                      </small>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger mb-3 py-2 px-3 small">{modalError}</div>}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>
                          Company Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>Company Logo</label>
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
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <input
                                type="file"
                                ref={logoInputRef}
                                className="d-none"
                                accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
                                onChange={handleLogoFileChange}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 rounded-2"
                                onClick={() => logoInputRef.current?.click()}
                              >
                                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{formData.logo ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                              </button>
                              {formData.logo && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-2"
                                  onClick={() => {
                                    setLogoFile(null);
                                    setFormData((prev) => ({ ...prev, logo: '' }));
                                    if (logoInputRef.current) logoInputRef.current.value = '';
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.78rem', letterSpacing: '0.01em' }}>
                              PNG, JPG, JPEG , GIF (max 5MB)
                            </div>
                            {logoUploadError && (
                              <div className="text-danger small mt-1">{logoUploadError}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>
                          Website <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://acme.com"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control rounded-3"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contact@acme.com"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>
                          Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <select
                            className="form-select rounded-start-3"
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
                            className="form-control rounded-end-3"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="555-0199"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>
                          Country <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United States"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>Business Model</label>
                        <select
                          className="form-select rounded-3"
                          value={formData.businessModel}
                          onChange={(e) => setFormData({ ...formData, businessModel: Number(e.target.value) })}
                        >
                          <option value={0}>E-Commerce</option>
                          <option value={1}>Lead Generation</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>Currency</label>
                        <select
                          className="form-select rounded-3"
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
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>Status</label>
                        <select
                          className="form-select rounded-3"
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
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.86rem' }}>Notes</label>
                        <textarea
                          className="form-control rounded-3"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes about client..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3 bg-light">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-3 rounded-2" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm px-4 rounded-2 d-inline-flex align-items-center gap-2" disabled={modalLoading}>
                      {modalLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Saving...</span>
                        </>
                      ) : (
                        editClient ? 'Save Changes' : 'Create Client'
                      )}
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
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', zIndex: 1060 }}
            tabIndex="-1"
            onClick={() => setConnectClient(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: 700 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom p-4">
                  <div className="d-flex align-items-center gap-3">
                    <ClientAvatar
                      logo={connectClient.logo}
                      name={connectClient.companyName}
                      size={48}
                      borderRadius={12}
                      fontSize="1rem"
                    />
                    <div>
                      <h5 className="modal-title fw-bold mb-0 text-body-emphasis">
                        {connectClient.companyName}
                      </h5>
                      <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Ad Platform Connections
                      </span>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setConnectClient(null)} aria-label="Close"></button>
                </div>

                <div className="modal-body p-4">
                  <div className="d-flex flex-column gap-3">
                    {AD_PLATFORMS.map((platform) => {
                      const state = platformsState[platform.key] || { connected: false, accountId: '', lastSync: 'Never', autoSync: true };
                      const isConnecting = connectingPlatform === platform.key;

                      return (
                        <div
                          key={platform.key}
                          className="border rounded-4 p-3.5 transition-all"
                          style={{
                            padding: '1.1rem 1.25rem',
                            backgroundColor: state.connected ? 'rgba(var(--bs-primary-rgb), 0.02)' : 'var(--bs-body-bg)',
                            borderColor: state.connected ? 'rgba(var(--bs-primary-rgb), 0.22)' : 'var(--bs-border-color)',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center gap-3">
                            {/* Left: Brand Icon + Name & Status */}
                            <div className="d-flex align-items-center gap-3 min-w-0">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                style={{
                                  backgroundColor: platform.bgSubtle,
                                  width: 52,
                                  height: 52,
                                }}
                              >
                                {platform.icon}
                              </div>
                              <div className="text-truncate">
                                <div className="d-flex align-items-center gap-2 mb-0.5">
                                  <span className="fw-bold text-body-emphasis" style={{ fontSize: '1.05rem' }}>
                                    {platform.name}
                                  </span>
                                  {state.connected && (
                                    <span
                                      className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2.5 py-1 rounded-pill"
                                      style={{ fontSize: '0.75rem' }}
                                    >
                                      Connected
                                    </span>
                                  )}
                                </div>
                                {state.connected ? (
                                  <div className="text-secondary text-truncate font-monospace" style={{ fontSize: '0.88rem' }}>
                                    {state.accountName ? `${state.accountName} (${state.accountId})` : `ID: ${state.accountId}`}
                                  </div>
                                ) : (
                                  <div className="text-secondary text-truncate" style={{ fontSize: '0.88rem' }}>
                                    Not connected
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                              {state.connected ? (
                                <>
                                  {platform.key === 'google' && googleStatus.connected && (
                                    <button
                                      className="btn btn-light border px-3 py-2 rounded-3"
                                      onClick={() => openGoogleAccountsModal(connectClient)}
                                      disabled={isConnecting || googleAccountsLoading}
                                    >
                                      <span className="fw-medium" style={{ fontSize: '0.88rem' }}>Change</span>
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-outline-danger px-3 py-2 rounded-3"
                                    onClick={() =>
                                      platform.key === 'google'
                                        ? handleDisconnectGoogleAds(connectClient)
                                        : toggleConnectPlatform(platform.key)
                                    }
                                    disabled={isConnecting}
                                  >
                                    {isConnecting ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <span className="fw-medium" style={{ fontSize: '0.88rem' }}>Disconnect</span>
                                    )}
                                  </button>
                                </>
                              ) : platform.key === 'google' && googleStatus.connected ? (
                                <button
                                  className="btn btn-primary px-3.5 py-2 rounded-3"
                                  onClick={() => openGoogleAccountsModal(connectClient)}
                                  disabled={isConnecting || googleAccountsLoading}
                                >
                                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Select Account</span>
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-primary px-3.5 py-2 rounded-3"
                                  onClick={() => toggleConnectPlatform(platform.key)}
                                  disabled={isConnecting}
                                >
                                  {isConnecting ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                                      <span style={{ fontSize: '0.9rem' }}>Connecting...</span>
                                    </>
                                  ) : (
                                    <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Connect</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end">
                  <button type="button" className="btn btn-primary px-4 py-2 rounded-3 fw-semibold" onClick={() => setConnectClient(null)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Google Ads Account Selection Modal ────────────────────── */}
        {showGoogleAccountsModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', zIndex: 1080 }}
            tabIndex="-1"
            onClick={() => !associatingGoogleAccount && setShowGoogleAccountsModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: 650 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 border bg-light flex-shrink-0"
                      style={{ width: 46, height: 46 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0 text-body-emphasis">
                        Select Google Ads Account
                      </h5>
                      <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        {connectClient?.companyName
                          ? `Link an account to ${connectClient.companyName}`
                          : 'Choose an account to link'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => !associatingGoogleAccount && setShowGoogleAccountsModal(false)}
                    aria-label="Close"
                  ></button>
                </div>

                <form onSubmit={handleAssociateGoogleAdsAccount}>
                  <div className="modal-body p-4" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                    {googleAccountsError && (
                      <div className="alert alert-danger d-flex align-items-center justify-content-between py-2.5 px-3 mb-3 rounded-3">
                        <span>{googleAccountsError}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-1 px-2.5 ms-2"
                          onClick={() => openGoogleAccountsModal(connectClient)}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {!connectClient && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary mb-1.5">
                          Client
                        </label>
                        <select
                          className="form-select rounded-3 py-2"
                          value={selectedGoogleClientId}
                          onChange={(e) => setSelectedGoogleClientId(e.target.value)}
                          required
                        >
                          <option value="">Select a client...</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.companyName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {googleAccountsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <div className="text-secondary">Loading Google Ads accounts...</div>
                      </div>
                    ) : googleAccounts.length === 0 ? (
                      <div className="text-center py-5 text-secondary">
                        No Google Ads accounts found for this Google account.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2.5">
                        {googleAccounts.map((acc) => {
                          const isSelected = selectedGoogleCustomerId === acc.customerId;
                          return (
                            <div
                              key={acc.customerId}
                              onClick={() => setSelectedGoogleCustomerId(acc.customerId)}
                              className={`border rounded-4 d-flex align-items-center justify-content-between gap-3 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary-subtle bg-opacity-10'
                                  : 'bg-body'
                              }`}
                              style={{ cursor: 'pointer', padding: '1rem 1.25rem' }}
                            >
                              <div className="d-flex align-items-center gap-3 min-w-0">
                                <input
                                  type="radio"
                                  name="googleAdsCustomerAccount"
                                  className="form-check-input mt-0 flex-shrink-0"
                                  style={{ width: '1.15rem', height: '1.15rem' }}
                                  checked={isSelected}
                                  onChange={() => setSelectedGoogleCustomerId(acc.customerId)}
                                />
                                <div className="text-truncate">
                                  <div className="fw-semibold text-body-emphasis text-truncate" style={{ fontSize: '1rem' }}>
                                    {acc.descriptiveName || `Account ${acc.formattedCustomerId}`}
                                  </div>
                                  {acc.associatedClientName && (
                                    <div className="text-primary mt-0.5" style={{ fontSize: '0.84rem' }}>
                                      Linked to {acc.associatedClientName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className="badge bg-light text-secondary border font-monospace fw-medium flex-shrink-0 px-3 py-2 rounded-3"
                                style={{ fontSize: '0.88rem' }}
                              >
                                {acc.formattedCustomerId || acc.customerId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-light border px-4 py-2 rounded-3"
                      onClick={() => {
                        setPendingGoogleConfirm(null);
                        setShowGoogleAccountsModal(false);
                      }}
                      disabled={associatingGoogleAccount}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
                      disabled={
                        associatingGoogleAccount ||
                        googleAccountsLoading ||
                        !selectedGoogleCustomerId ||
                        !selectedGoogleClientId
                      }
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ─── Confirmation Dialog Before Saving Association ─────────── */}
        {pendingGoogleConfirm && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1090 }}
            tabIndex="-1"
            onClick={() => !associatingGoogleAccount && setPendingGoogleConfirm(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: 520 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold mb-0 text-body-emphasis">
                    Confirm Account Link
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => !associatingGoogleAccount && setPendingGoogleConfirm(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="border rounded-4 p-3.5 bg-light" style={{ padding: '1.15rem 1.25rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <span className="text-secondary" style={{ fontSize: '0.92rem' }}>Client</span>
                      <span className="fw-bold text-body-emphasis" style={{ fontSize: '0.98rem' }}>{pendingGoogleConfirm.clientName}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <span className="text-secondary" style={{ fontSize: '0.92rem' }}>Account</span>
                      <span className="fw-semibold text-body-emphasis" style={{ fontSize: '0.98rem' }}>{pendingGoogleConfirm.accountName}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary" style={{ fontSize: '0.92rem' }}>Account ID</span>
                      <span className="font-monospace fw-semibold text-secondary" style={{ fontSize: '0.95rem' }}>
                        {pendingGoogleConfirm.formattedCustomerId}
                      </span>
                    </div>
                  </div>
                  {pendingGoogleConfirm.existingAccountId && (
                    <div className="alert alert-warning py-2.5 px-3 mt-3 mb-0 rounded-3" style={{ fontSize: '0.9rem' }}>
                      This will replace the current link (<code className="fw-bold">{pendingGoogleConfirm.existingAccountId}</code>).
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4 py-2 rounded-3"
                    onClick={() => setPendingGoogleConfirm(null)}
                    disabled={associatingGoogleAccount}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={confirmAssociateGoogleAdsAccount}
                    disabled={associatingGoogleAccount}
                  >
                    {associatingGoogleAccount ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Confirm</span>
                    )}
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
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
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
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target total ad spend allocated per month</small>
                      </div>

                      {/* Currency */}
                      <div className="col-md-5">
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
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Account reporting currency</small>
                      </div>
                    </div>

                    {/* ─── 2. Target ROAS & Target CPA ─── */}
                    <div className="row g-3 mb-4">
                      {/* Target ROAS */}
                      <div className="col-md-6">
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
                          <span className="input-group-text bg-body-tertiary fw-bold">x</span>
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Minimum return on ad spend goal</small>
                      </div>

                      {/* Target CPA */}
                      <div className="col-md-6">
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
                            min="0.1"
                            className="form-control fw-bold"
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
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target cost per conversion acquisition</small>
                      </div>
                    </div>

                    {/* ─── 3. Target Revenue & Target Conversions ─── */}
                    <div className="row g-3 mb-4">
                      {/* Target Revenue */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
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
                          />
                        </div>
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target monthly gross revenue</small>
                      </div>

                      {/* Target Conversions */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-body mb-1.5 d-block" style={{ fontSize: '0.88rem', letterSpacing: '0.15px' }}>
                          Target Conversions
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control"
                          value={targetFormData.targetConversions || ''}
                          onChange={(e) => setTargetFormData({ ...targetFormData, targetConversions: e.target.value })}
                        />
                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>Target total conversions required</small>
                      </div>
                    </div>

                    {/* ─── 4. Target Presets Toolbar ─── */}
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

                  <div className="modal-footer border-top p-3 bg-body-tertiary d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3 rounded-2"
                      onClick={() => setShowTargetModal(false)}
                      disabled={targetLoading}
                    >
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
