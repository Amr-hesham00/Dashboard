import { apiFetch } from './auth';
import { mockPlatforms } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function getPlatformsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Platform`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockPlatforms
  }
  return mockPlatforms;
}

export async function createPlatformApi(platformDto) {
  const response = await apiFetch(`${API_BASE_URL}/Platform`, {
    method: 'POST',
    body: JSON.stringify(platformDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create platform.');
  }
  return data;
}

export async function updatePlatformApi(id, platformDto) {
  const response = await apiFetch(`${API_BASE_URL}/Platform/${id}`, {
    method: 'PUT',
    body: JSON.stringify(platformDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update platform.');
  }
  return data;
}

export async function deletePlatformApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Platform/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete platform.');
  }
  return data;
}

export async function getPlatformTypesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Platform/types`);
  if (!response.ok) return ['GoogleAds', 'FacebookAds', 'TikTokAds', 'LinkedInAds', 'InstagramAds'];
  return response.json();
}

export async function getPlatformStatusesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Platform/statuses`);
  if (!response.ok) return ['Active', 'Inactive', 'Pending'];
  return response.json();
}

export async function getPlatformCurrenciesApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Platform/currencies`);
    if (response.ok) return await response.json();
  } catch {
    // Fall through to default currencies
  }
  return ['USD', 'EUR', 'EGP', 'GBP', 'CAD', 'AUD', 'AED', 'SAR'];
}



/**
 * Refreshes / synchronizes only the specified Platform without affecting other platforms.
 */
export async function refreshPlatformApi(platformId, clientId = null) {
  const url = clientId 
    ? `${API_BASE_URL}/Platform/${Number(platformId)}/refresh?clientId=${Number(clientId)}`
    : `${API_BASE_URL}/Platform/${Number(platformId)}/refresh`;
  const response = await apiFetch(url, {
    method: 'POST',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to refresh platform data.');
    error.status = response.status;
    error.errorCode = data.errorCode;
    error.inProgress = response.status === 409 || data.errorCode === 'sync_already_in_progress';
    throw error;
  }

  return data;
}
