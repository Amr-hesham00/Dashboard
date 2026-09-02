import { apiFetch } from './auth';
import { mockClients, mockUsers, getClientTargets, saveClientTargets } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function getClientsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockClients
  }
  return mockClients;
}

export async function getClientByIdApi(id) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fall through to mockClients
  }
  const found = mockClients.find((c) => String(c.id) === String(id));
  if (found) return found;
  return mockClients[0];
}

export async function createClientApi(clientDto) {
  const response = await apiFetch(`${API_BASE_URL}/Client`, {
    method: 'POST',
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create client.');
  }
  return data;
}

export async function updateClientApi(id, clientDto) {
  const response = await apiFetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientDto),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update client.');
  }
  return data;
}

export async function deleteClientApi(id) {
  const response = await apiFetch(`${API_BASE_URL}/Client/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete client.');
  }
  return data;
}

export async function getClientStatusesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Client/statuses`);
  if (!response.ok) return ['Active', 'Inactive', 'Lead', 'Archived'];
  return response.json();
}

export async function getClientCurrenciesApi() {
  const response = await apiFetch(`${API_BASE_URL}/Client/currencies`);
  if (!response.ok) return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  return response.json();
}

export async function getUsersApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/User`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fall through to mockUsers
  }
  return mockUsers;
}

export async function getClientTargetsApi(clientId) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client/${clientId}/targets`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to local storage / mock
  }
  return getClientTargets(clientId);
}

export async function updateClientTargetsApi(clientId, targets) {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client/${clientId}/targets`, {
      method: 'PUT',
      body: JSON.stringify(targets),
    });
    if (response.ok) {
      const data = await response.json();
      saveClientTargets(clientId, data);
      return data;
    }
  } catch {
    // Fallback to local storage / mock
  }
  return saveClientTargets(clientId, targets);
}

