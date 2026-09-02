import { apiFetch } from './auth';
import { getMockDashboardSummary } from '../mock/mockData';

const API_BASE_URL = '/api';

export async function fetchDashboardSummary() {
  try {
    const [campaignsRes, clientsRes, adsRes, platformsRes] = await Promise.allSettled([
      apiFetch(`${API_BASE_URL}/Campaign`),
      apiFetch(`${API_BASE_URL}/Client`),
      apiFetch(`${API_BASE_URL}/Ad`),
      apiFetch(`${API_BASE_URL}/Platform`),
    ]);

    const campaigns = campaignsRes.status === 'fulfilled' && campaignsRes.value.ok ? await campaignsRes.value.json() : [];
    const clients = clientsRes.status === 'fulfilled' && clientsRes.value.ok ? await clientsRes.value.json() : [];
    const ads = adsRes.status === 'fulfilled' && adsRes.value.ok ? await adsRes.value.json() : [];
    const platforms = platformsRes.status === 'fulfilled' && platformsRes.value.ok ? await platformsRes.value.json() : [];

    // If backend returned actual data, use it; otherwise fallback to mock summary
    if (campaigns.length > 0 || clients.length > 0) {
      const totalCampaigns = campaigns.length;
      const totalRevenue = campaigns.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
      const totalSpend = campaigns.reduce((acc, curr) => acc + (curr.spend || 0), 0);
      
      const avgRoas = campaigns.length > 0
        ? (campaigns.reduce((acc, curr) => acc + (curr.roas || 0), 0) / campaigns.length).toFixed(2)
        : '0.00';

      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'Active' || c.status === 1 || c.status === 0).length;

      return {
        campaigns,
        clients,
        ads,
        platforms,
        kpis: {
          totalCampaigns,
          totalRevenue: totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
          totalSpend: totalSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
          rawRevenue: totalRevenue,
          rawSpend: totalSpend,
          avgRoas: `${avgRoas}x`,
          totalClients,
          activeClients,
          totalAds: ads.length,
        },
      };
    }
  } catch {
    // Fall through to mock summary
  }

  return getMockDashboardSummary();
}
