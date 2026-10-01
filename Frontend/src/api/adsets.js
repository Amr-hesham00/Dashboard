import { apiFetch } from './auth';
import { mockAdSets } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function getAdSetsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/AdSet`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockAdSets
  }
  return mockAdSets;
}

export async function getAdSetsByCampaignIdApi(campId) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/AdSet/Campaigns/${campId}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall through
  }
  return mockAdSets.filter((a) => String(a.campaignId) === String(campId));
}

export async function getAdSetsByClientIdApi(clientId) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/AdSet/Clients/${clientId}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall through
  }
  return mockAdSets.filter((a) => String(a.clientId) === String(clientId));
}

export async function getAdSetByIdApi(id) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/AdSet/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through to mockAdSets
  }
  const found = mockAdSets.find((a) => String(a.id) === String(id));
  if (found) return found;
  return mockAdSets[0];
}

export async function createAdSetApi(adSetDto) {
  const response = await apiFetch(`${API_BASE_URL}/AdSet`, {
    method: 'POST',
    body: JSON.stringify(adSetDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create ad set.');
  }
  return data;
}

export async function updateAdSetApi(id, adSetDto) {
  const response = await apiFetch(`${API_BASE_URL}/AdSet/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adSetDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update ad set.');
  }
  return data;
}

export async function deleteAdSetApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/AdSet/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete ad set.');
  }
  return data;
}

export async function getAdSetStatusesApi() {
  const response = await apiFetch(`${API_BASE_URL}/AdSet/statuses`);
  if (!response.ok) return ['Active', 'Paused', 'Completed', 'Draft'];
  return response.json();
}

export async function getAdSetGendersApi() {
  const response = await apiFetch(`${API_BASE_URL}/AdSet/genders`);
  if (!response.ok) return ['All', 'Male', 'Female'];
  return response.json();
}

