import { apiFetch } from './auth';

const API_BASE_URL = '/api';

export async function getSearchTermsByAdSetIdApi(adSetId, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiFetch(`${API_BASE_URL}/SearchTerm/AdSet/${adSetId}${query}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Failed to fetch search terms from API:', err);
  }
  return [];
}
