import { apiFetch } from './auth';
import { invalidateClientsCache } from './clients';

const API_BASE_URL = '/api';

/**
 * Initiates the Google OAuth authorization flow for the authenticated Media Buyer.
 * The backend associates the session with the current user ID and returns the Google authorization URL.
 */
export async function connectGoogleAdsApi() {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/connect`, {
    method: 'POST',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to initiate Google Ads connection.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    error.alreadyConnected = data.alreadyConnected || data.errorCode === 'already_connected' || response.status === 409;
    throw error;
  }

  return data.authorizationUrl;
}

/**
 * Returns the authenticated user's Google Ads OAuth connection status and linked client accounts.
 */
export async function getGoogleAdsStatusApi() {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/status`, {
    method: 'GET',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to retrieve Google Ads connection status.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    throw error;
  }

  return data;
}

/**
 * Discovers accessible Google Ads customer and manager accounts for the authenticated user.
 */
export async function getGoogleAdsAccountsApi() {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/accounts`, {
    method: 'GET',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to retrieve accessible Google Ads accounts.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    error.connected = data.connected;
    throw error;
  }

  return data;
}

/**
 * Associates a selected Google Ads Advertiser account (Customer ID) with a Dashboard Client.
 */
export async function selectGoogleAdsAccountApi(clientId, customerId) {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/accounts/select`, {
    method: 'POST',
    body: JSON.stringify({
      clientId: Number(clientId),
      customerId: String(customerId).trim(),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to associate Google Ads account with client.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    throw error;
  }

  invalidateClientsCache();
  return data;
}

/**
 * Disconnects (deactivates) only the specified Dashboard Client's Google Ads account association,
 * without revoking or deleting the user's Google OAuth connection or affecting other clients.
 */
export async function disconnectClientGoogleAdsApi(clientId) {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/clients/${Number(clientId)}/disconnect`, {
    method: 'DELETE',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to disconnect Google Ads account from client.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    throw error;
  }

  invalidateClientsCache();
  return data;
}

/**
 * Disconnects the current authenticated user's Google Ads OAuth connection.
 */
export async function disconnectGoogleAdsApi() {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/disconnect`, {
    method: 'DELETE',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to disconnect Google Ads connection.');
    error.status = response.status;
    throw error;
  }

  invalidateClientsCache();
  return data;
}


/**
 * Synchronizes one specified Google Ads platform belonging to a Dashboard Client.
 * Retrieves account info, campaigns, ad groups, ads, and daily performance metrics.
 */
export async function syncGoogleAdsPlatformApi(clientId, platformId) {
  const response = await apiFetch(`${API_BASE_URL}/google-ads/clients/${Number(clientId)}/platforms/${Number(platformId)}/sync`, {
    method: 'POST',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to synchronize Google Ads data.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    error.inProgress = response.status === 409 || data.errorCode === 'sync_already_in_progress';
    throw error;
  }

  return data;
}
