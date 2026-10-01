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
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client/statuses`);
    if (response.ok) return await response.json();
  } catch {
    // Fall through to default statuses
  }
  return ['Active', 'Inactive', 'Lead', 'Archived'];
}

export async function getClientCurrenciesApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Client/currencies`);
    if (response.ok) return await response.json();
  } catch {
    // Fall through to default currencies
  }
  return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
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
    const numId = Number(clientId);
    if (!isNaN(numId) && numId > 0) {
      const response = await apiFetch(`${API_BASE_URL}/ClientTarget/client/${numId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          return {
            targetRoas: data.targetROAS ?? data.targetRoas ?? 4.0,
            targetCpa: data.targetCPA ?? data.targetCpa ?? 5.5,
            monthlyBudget: data.monthlyBudget ?? 50000,
            targetRevenue: data.targetRevenue ?? 200000,
            targetConversions: data.targetConversions ?? 9000,
            targetCtr: data.targetCTR ?? data.targetCtr ?? 2.5,
            targetCpc: data.targetCPC ?? data.targetCpc ?? 1.5,
            businessModel: data.businessModel || 'ecommerce',
            mainConversionEvent: data.mainConversionEvent || 'Purchases',
            currency: data.currency || 'USD',
          };
        }
      }
    }
  } catch {
    // Fallback to local storage / mock
  }
  return getClientTargets(clientId);
}

export async function updateClientTargetsApi(clientId, targets) {
  try {
    const numId = Number(clientId);
    if (!isNaN(numId) && numId > 0) {
      const payload = {
        targetROAS: targets.targetRoas != null ? Number(targets.targetRoas) : undefined,
        targetCPA: targets.targetCpa != null ? Number(targets.targetCpa) : undefined,
        monthlyBudget: targets.monthlyBudget != null ? Number(targets.monthlyBudget) : undefined,
        targetRevenue: targets.targetRevenue != null ? Number(targets.targetRevenue) : undefined,
        targetConversions: targets.targetConversions != null ? Number(targets.targetConversions) : undefined,
        targetCTR: targets.targetCtr != null ? Number(targets.targetCtr) : undefined,
        targetCPC: targets.targetCpc != null ? Number(targets.targetCpc) : undefined,
      };
      const response = await apiFetch(`${API_BASE_URL}/ClientTarget/client/${numId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const resData = await response.json();
        const data = resData.target || resData;
        const normalized = {
          ...targets,
          targetRoas: data.targetROAS ?? data.targetRoas ?? targets.targetRoas,
          targetCpa: data.targetCPA ?? data.targetCpa ?? targets.targetCpa,
          monthlyBudget: data.monthlyBudget ?? targets.monthlyBudget,
          targetRevenue: data.targetRevenue ?? targets.targetRevenue,
          targetConversions: data.targetConversions ?? targets.targetConversions,
        };
        saveClientTargets(clientId, normalized);
        return normalized;
      }
    }
  } catch {
    // Fallback to local storage / mock
  }
  return saveClientTargets(clientId, targets);
}

