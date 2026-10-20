import { apiFetch } from './auth';

const API_BASE_URL = '/api';

export async function getCampaignsApi() {
  try {
    const response = await apiFetch(`${API_BASE_URL}/Campaign`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fall through
  }
  return [];
}

/**
 * Get full client overview page data (KPIs, chart points, platform rows, campaigns table)
 */
export async function getClientOverviewPageDataApi(clientId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await apiFetch(`${API_BASE_URL}/Campaign/Clients/${clientId}${query}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to get client overview page data:', err);
  }
  return null;
}

/**
 * Get campaigns for a specific client (overview tab)
 */
export async function getCampaignsByClientIdApi(clientId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await apiFetch(`${API_BASE_URL}/Campaign/Clients/${clientId}${query}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.campRow)) {
        return data.campRow.map((c) => ({
          ...c,
          id: c.campaignId ?? c.id,
          name: c.campaignName ?? c.name,
          platformType: c.platform != null ? c.platform : c.platformType,
          platformName: c.platform != null ? c.platform : c.platformName,
        }));
      }
    }
  } catch {
    // Fall through
  }
  return [];
}

/**
 * Get campaigns and platform metrics for a specific client within a specific platform.
 * Backend route: GET /api/Campaign/Clients/{clientId:int}/{platformid:int}?startDate=...&endDate=...
 */
export async function getCampaignsByPlatformApi(clientId, platformId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await apiFetch(`${API_BASE_URL}/Campaign/Clients/${clientId}/${platformId}${query}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to get campaigns by platform:', err);
  }
  return null;
}

/**
 * Get campaign by ID.
 * Queries backend endpoint /api/AdSet/Campaigns/{id} which returns CampPageDTO.
 * Falls back to mockCampaigns if not found or endpoint unavailable.
 */
export async function getCampaignByIdApi(id, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await apiFetch(`${API_BASE_URL}/AdSet/Campaigns/${id}${query}`);
    if (response.ok) {
      const data = await response.json();
      if (data && (data.campName || data.name)) {
        return {
          id: Number(id),
          clientId: data.clientId ? Number(data.clientId) : null,
          clientName: data.clientName || '',
          name: data.campName || data.name,
          status: data.status,
          platformLabel: data.campPlatform || 'Platform',
          platformKey: String(data.campPlatform || 'meta').toLowerCase().replace('ads', ''),
          spend: data.spend,
          revenue: data.revenue,
          impressions: data.impressions,
          clicks: data.clicks,
          conversions: data.conversions,
          cpa: data.cpa,
          roas: data.roas,
          cpc: data.cpc,
          cpm: data.cpm,
          conversionRate: data.conversionRate,
          aov: data.aov,
          points: data.points,
          adsetRows: data.adsetRows,
        };
      }
    }
  } catch {
    // Fall through
  }
  return null;
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

