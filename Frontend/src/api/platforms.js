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

