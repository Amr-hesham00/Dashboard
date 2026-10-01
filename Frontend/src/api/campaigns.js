import { apiFetch } from './auth';
import { mockCampaigns } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function getCampaignsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Campaign`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockCampaigns
  }
  return mockCampaigns;
}

export async function getCampaignsByClientIdApi(clientId) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Campaign/Clients/${clientId}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall through
  }
  return mockCampaigns.filter((c) => String(c.clientId) === String(clientId));
}

export async function getCampaignByIdApi(id) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Campaign/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through to mockCampaigns
  }
  const found = mockCampaigns.find((c) => String(c.id) === String(id));
  if (found) return found;
  return mockCampaigns[0];
}

export async function createCampaignApi(campaignDto) {
  const response = await apiFetch(`${API_BASE_URL}/Campaign`, {
    method: 'POST',
    body: JSON.stringify(campaignDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create campaign.');
  }
  return data;
}

export async function updateCampaignApi(id, campaignDto) {
  const response = await apiFetch(`${API_BASE_URL}/Campaign/${id}`, {
    method: 'PUT',
    body: JSON.stringify(campaignDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update campaign.');
  }
  return data;
}

export async function deleteCampaignApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Campaign/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete campaign.');
  }
  return data;
}

export async function getCampaignStatusesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Campaign/statuses`);
  if (!response.ok) return ['Active', 'Paused', 'Completed', 'Draft'];
  return response.json();
}

export async function getCampaignObjectivesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Campaign/objectives`);
  if (!response.ok) return ['Awareness', 'Traffic', 'Engagement', 'Leads', 'Sales'];
  return response.json();
}

