import { apiFetch, isAdmin, getStoredUser } from './auth';

const API_BASE_URL = '/api';

// Currency enum mapping (matches backend Dashboard.Domain.Enums.Currency order)
const CURRENCY_ENUM = ['USD', 'EUR', 'EGP', 'AED', 'SAR', 'KWD', 'QAR'];

function resolveCurrencyName(val) {
  if (val == null) return null;
  if (typeof val === 'string') return val;
  return CURRENCY_ENUM[val] || null;
}

let clientsCache = null;
let clientsInFlightPromise = null;
let clientLookupCache = null;
let clientLookupInFlightPromise = null;

export function invalidateClientsCache() {
  clientsCache = null;
  clientsInFlightPromise = null;
  clientLookupCache = null;
  clientLookupInFlightPromise = null;
}

/**
 * Lightweight endpoint to fetch client id and name for dropdown / switcher.
 */
export async function getClientLookupApi(forceRefresh = false) {
  if (!forceRefresh && clientLookupCache) {
    return clientLookupCache;
  }
  if (!forceRefresh && clientLookupInFlightPromise) {
    return clientLookupInFlightPromise;
  }

  clientLookupInFlightPromise = (async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/Client/lookup`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load client lookup (${response.status}).`);
      }
      const data = await response.json();
      const result = Array.isArray(data)
        ? data.map((c) => ({
          id: c.clientId ?? c.id,
          name: c.companyName ?? c.name,
          companyName: c.companyName ?? c.name,
        }))
        : [];
      clientLookupCache = result;
      return result;
    } finally {
      clientLookupInFlightPromise = null;
    }
  })();

  return clientLookupInFlightPromise;
}

/**
 * Load clients for the current authenticated user (role-based).
 * Backend returns { totalClients, activeCampaigns, row: [...] }.
 * Deduplicates concurrent calls and caches results to avoid redundant network hits.
 */
export async function getClientsApi(forceRefresh = false) {
  if (!forceRefresh && clientsCache) {
    return clientsCache;
  }
  if (!forceRefresh && clientsInFlightPromise) {
    return clientsInFlightPromise;
  }

  clientsInFlightPromise = (async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/Client`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load clients (${response.status}).`);
      }
      const data = await response.json();
      let result = [];
      if (Array.isArray(data)) result = data;
      else if (data && Array.isArray(data.row)) result = data.row;
      clientsCache = result;
      return result;
    } finally {
      clientsInFlightPromise = null;
    }
  })();

  return clientsInFlightPromise;
}

/**
 * Load a single client by ID. Returns null for 404.
 */
export async function getClientByIdApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Client/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Failed to load client (${response.status}).`);
  }
  return await response.json();
}

/**
 * Create a new client.
 */
export async function createClientApi(clientDto) {
  const response = await apiFetch(`${API_BASE_URL}/Client`, {
    method: 'POST',
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create client.');
  }
  invalidateClientsCache();
  return data;
}

/**
 * Update an existing client.
 */
export async function updateClientApi(id, clientDto) {
  const response = await apiFetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update client.');
  }
  invalidateClientsCache();
  return data;
}

/**
 * Delete a client by ID.
 */
export async function deleteClientApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete client.');
  }
  invalidateClientsCache();
  return data;
}

/**
 * Client statuses — static list matching backend ClientStatus enum.
 * No backend endpoint exists for this.
 */
export function getClientStatusesApi() {
  return Promise.resolve(['Active', 'Inactive', 'Archived']);
}

/**
 * Client currencies — static list matching backend Currency enum.
 * No backend endpoint exists for this.
 */
export function getClientCurrenciesApi() {
  return Promise.resolve(CURRENCY_ENUM);
}

/**
 * Load users list.
 * Only calls backend /api/User if current user has the Admin role,
 * completely avoiding 403 Forbidden console errors for Managers and Associates.
 */
export async function getUsersApi() {
  const currentUser = getStoredUser();
  if (!isAdmin(currentUser)) {
    return [];
  }
  const response = await apiFetch(`${API_BASE_URL}/User`);
  if (!response.ok) {
    if (response.status === 403) {
      return [];
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to load users.');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Load target settings for a client.
 * Returns null when no targets are configured (404).
 */
export async function getClientTargetsApi(clientId) {
  const numId = Number(clientId);
  if (isNaN(numId) || numId <= 0) return null;

  const response = await apiFetch(`${API_BASE_URL}/ClientTarget/client/${numId}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to load target settings.');
  }

  const data = await response.json();
  if (!data) return null;

  return {
    id: data.id,
    targetRoas: data.targetROAS ?? data.targetRoas ?? null,
    targetCpa: data.targetCPA ?? data.targetCpa ?? null,
    monthlyBudget: data.monthlyBudget ?? null,
    targetRevenue: data.targetRevenue ?? null,
    targetConversions: data.targetConversions ?? null,
    targetCtr: data.targetCTR ?? data.targetCtr ?? null,
    targetCpc: data.targetCPC ?? data.targetCpc ?? null,
    currency: resolveCurrencyName(data.currency),
  };
}

/**
 * Create or update target settings for a client (upsert).
 */
export async function updateClientTargetsApi(clientId, targets) {
  const numId = Number(clientId);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid client ID for target update.');
  }

  const payload = {
    targetROAS: targets.targetRoas != null ? Number(targets.targetRoas) : undefined,
    targetCPA: targets.targetCpa != null ? Number(targets.targetCpa) : undefined,
    monthlyBudget: targets.monthlyBudget != null ? Number(targets.monthlyBudget) : undefined,
    targetRevenue: targets.targetRevenue != null ? Number(targets.targetRevenue) : undefined,
    targetConversions: targets.targetConversions != null ? Number(targets.targetConversions) : undefined,
    targetCTR: targets.targetCtr != null ? Number(targets.targetCtr) : undefined,
    targetCPC: targets.targetCpc != null ? Number(targets.targetCpc) : undefined,
  };

  const response = await apiFetch(`${API_BASE_URL}/ClientTarget/client/${numId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to save target settings.');
  }

  const resData = await response.json();
  const data = resData.target || resData;

  return {
    id: data.id,
    targetRoas: data.targetROAS ?? data.targetRoas ?? targets.targetRoas,
    targetCpa: data.targetCPA ?? data.targetCpa ?? targets.targetCpa,
    monthlyBudget: data.monthlyBudget ?? targets.monthlyBudget,
    targetRevenue: data.targetRevenue ?? targets.targetRevenue,
    targetConversions: data.targetConversions ?? targets.targetConversions,
    targetCtr: data.targetCTR ?? data.targetCtr ?? targets.targetCtr,
    targetCpc: data.targetCPC ?? data.targetCpc ?? targets.targetCpc,
    currency: resolveCurrencyName(data.currency) ?? targets.currency,
  };
}

/**
 * Upload a logo image file for a client.
 * Returns { url: '/Logos/{fileName}', fileName: '...' }
 */
export async function uploadClientLogoApi(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch(`${API_BASE_URL}/Client/upload-logo`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to upload logo image.');
  }

  return await response.json();
}
