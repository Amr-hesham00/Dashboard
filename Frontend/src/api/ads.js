import { apiFetch } from './auth';
import { mockAds } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function getAdsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Ad`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockAds
  }
  return mockAds;
}

export async function getAdByIdApi(id) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Ad/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through to mockAds
  }
  const found = mockAds.find((a) => String(a.id) === String(id));
  if (found) return found;
  return mockAds[0];
}

export async function getAdsByAdSetIdApi(adSetId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiFetch(`${API_BASE_URL}/Ad/adset/${adSetId}${query}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.adRow) && data.adRow.length > 0) return data.adRow;
    }
  } catch {
    // Fall through
  }
  return mockAds.filter((a) => String(a.adSetId) === String(adSetId));
}

export async function getAdSetPageDataApi(adSetId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiFetch(`${API_BASE_URL}/Ad/adset/${adSetId}${query}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through
  }
  return null;
}

export async function getAdsByClientIdApi(clientId) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Ad/Clients/${clientId}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall through
  }
  return mockAds.filter((a) => String(a.clientId) === String(clientId));
}

export async function createAdApi(adDto) {
  const response = await apiFetch(`${API_BASE_URL}/Ad`, {
    method: 'POST',
    body: JSON.stringify(adDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create ad.');
  }
  return data;
}

export async function updateAdApi(id, adDto) {
  const response = await apiFetch(`${API_BASE_URL}/Ad/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update ad.');
  }
  return data;
}

export async function deleteAdApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Ad/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete ad.');
  }
  return data;
}

export async function getAdStatusesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Ad/statuses`);
  if (!response.ok) return ['Active', 'Paused', 'Archived', 'Draft'];
  return response.json();
}
