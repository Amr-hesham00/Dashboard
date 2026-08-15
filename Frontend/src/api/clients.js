import { getAuthHeaders } from './auth';

const API_BASE_URL = '/api';

export async function getClientsApi() {
  const response = await fetch(`${API_BASE_URL}/Client`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch clients list.');
  }
  return response.json();
}

export async function getClientByIdApi(id) {
  const response = await fetch(`${API_BASE_URL}/Client/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch client with ID ${id}.`);
  }
  return response.json();
}

export async function createClientApi(clientDto) {
  const response = await fetch(`${API_BASE_URL}/Client`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create client.');
  }
  return data;
}

export async function updateClientApi(id, clientDto) {
  const response = await fetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update client.');
  }
  return data;
}

export async function deleteClientApi(id) {
  const response = await fetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete client.');
  }
  return data;
}

export async function getClientStatusesApi() {
  const response = await fetch(`${API_BASE_URL}/Client/statuses`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['Active', 'Inactive', 'Lead', 'Archived'];
  return response.json();
}

export async function getClientCurrenciesApi() {
  const response = await fetch(`${API_BASE_URL}/Client/currencies`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  return response.json();
}

export async function getUsersApi() {
  const response = await fetch(`${API_BASE_URL}/User`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return [];
  return response.json();
}
