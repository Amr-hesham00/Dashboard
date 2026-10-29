import { apiFetch } from './auth';

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

  return data;
}
