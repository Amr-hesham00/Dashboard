import { getAuthHeaders } from './auth';

const API_BASE_URL = '/api';

export async function getAdSetsApi() {
  const response = await fetch(`${API_BASE_URL}/AdSet`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ad sets.');
  }
  return response.json();
}

export async function getAdSetByIdApi(id) {
  const response = await fetch(`${API_BASE_URL}/AdSet/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ad set details.');
  }
  return response.json();
}

export async function createAdSetApi(adSetDto) {
  const response = await fetch(`${API_BASE_URL}/AdSet`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(adSetDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create ad set.');
  }
  return data;
}

export async function updateAdSetApi(id, adSetDto) {
  const response = await fetch(`${API_BASE_URL}/AdSet/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(adSetDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update ad set.');
  }
  return data;
}

export async function deleteAdSetApi(id) {
  const response = await fetch(`${API_BASE_URL}/AdSet/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete ad set.');
  }
  return data;
}

export async function getAdSetStatusesApi() {
  const response = await fetch(`${API_BASE_URL}/AdSet/statuses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['Active', 'Paused', 'Completed', 'Draft'];
  return response.json();
}

export async function getAdSetGendersApi() {
  const response = await fetch(`${API_BASE_URL}/AdSet/genders`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['All', 'Male', 'Female'];
  return response.json();
}
