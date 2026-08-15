import { getAuthHeaders } from './auth';

const API_BASE_URL = '/api';

export async function getCampaignsApi() {
  const response = await fetch(`${API_BASE_URL}/Campaign`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns.');
  }
  return response.json();
}

export async function getCampaignByIdApi(id) {
  const response = await fetch(`${API_BASE_URL}/Campaign/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch campaign details.');
  }
  return response.json();
}

export async function createCampaignApi(campaignDto) {
  const response = await fetch(`${API_BASE_URL}/Campaign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(campaignDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create campaign.');
  }
  return data;
}

export async function updateCampaignApi(id, campaignDto) {
  const response = await fetch(`${API_BASE_URL}/Campaign/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(campaignDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update campaign.');
  }
  return data;
}

export async function deleteCampaignApi(id) {
  const response = await fetch(`${API_BASE_URL}/Campaign/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete campaign.');
  }
  return data;
}

export async function getCampaignStatusesApi() {
  const response = await fetch(`${API_BASE_URL}/Campaign/statuses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['Active', 'Paused', 'Completed', 'Draft'];
  return response.json();
}

export async function getCampaignObjectivesApi() {
  const response = await fetch(`${API_BASE_URL}/Campaign/objectives`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['Awareness', 'Traffic', 'Engagement', 'Leads', 'Sales'];
  return response.json();
}
