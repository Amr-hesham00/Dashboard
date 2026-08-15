import { getAuthHeaders } from './auth';

const API_BASE_URL = '/api';

export async function getPlatformsApi() {
  const response = await fetch(`${API_BASE_URL}/Platform`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch platforms list.');
  }
  return response.json();
}

export async function createPlatformApi(platformDto) {
  const response = await fetch(`${API_BASE_URL}/Platform`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(platformDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create platform.');
  }
  return data;
}

export async function updatePlatformApi(id, platformDto) {
  const response = await fetch(`${API_BASE_URL}/Platform/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(platformDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update platform.');
  }
  return data;
}

export async function deletePlatformApi(id) {
  const response = await fetch(`${API_BASE_URL}/Platform/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete platform.');
  }
  return data;
}

export async function getPlatformTypesApi() {
  const response = await fetch(`${API_BASE_URL}/Platform/types`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['GoogleAds', 'FacebookAds', 'TikTokAds', 'LinkedInAds', 'InstagramAds'];
  return response.json();
}

export async function getPlatformStatusesApi() {
  const response = await fetch(`${API_BASE_URL}/Platform/statuses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['Active', 'Inactive', 'Pending'];
  return response.json();
}
