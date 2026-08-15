/**
 * Mock Data Module for Dashboard Testing
 * Location: Frontend/src/mock/mockData.js
 * 
 * Contains sample mock datasets for every table/entity in the domain schema:
 * - Users
 * - Clients
 * - Platforms
 * - Campaigns
 * - AdSets
 * - Ads
 * - AssociateProfiles
 * - AssociateTeams
 * - Assignments
 */

export const mockUsers = [
  {
    id: "usr-001",
    userName: "amr",
    email: "amr@example.com",
    firstName: "Amr",
    lastName: "El-Sayed",
    role: "Admin",
    phoneNumber: "+1 (555) 234-5678",
    profileImage: "/assets/images/avatar/avatar-1.jpg"
  },
  {
    id: "usr-002",
    userName: "sarah_m",
    email: "sarah.miller@dashboard.com",
    firstName: "Sarah",
    lastName: "Miller",
    role: "Manager",
    phoneNumber: "+1 (555) 876-5432",
    profileImage: "/assets/images/avatar/avatar-2.jpg"
  },
  {
    id: "usr-003",
    userName: "johndoe",
    email: "john.doe@dashboard.com",
    firstName: "John",
    lastName: "Doe",
    role: "Associate",
    phoneNumber: "+1 (555) 345-6789",
    profileImage: "/assets/images/avatar/avatar-3.jpg"
  }
];

export const mockClients = [
  {
    id: "cli-101",
    name: "Acme Global Tech",
    companyName: "Acme Corporation",
    email: "contact@acmeglobal.com",
    phone: "+1 (800) 555-0199",
    category: "E-Commerce & Tech",
    status: "Active",
    budget: 45000,
    managerId: "usr-002",
    createdAt: "2026-01-15T10:30:00Z"
  },
  {
    id: "cli-102",
    name: "Nexus Fashion Apparel",
    companyName: "Nexus Wear Ltd.",
    email: "marketing@nexusfashion.com",
    phone: "+1 (800) 555-0244",
    category: "Retail & Apparel",
    status: "Active",
    budget: 32000,
    managerId: "usr-002",
    createdAt: "2026-02-01T14:15:00Z"
  },
  {
    id: "cli-103",
    name: "Starlight Media Group",
    companyName: "Starlight Entertainment",
    email: "hello@starlightmedia.io",
    phone: "+1 (800) 555-0377",
    category: "Media & Entertainment",
    status: "Pending",
    budget: 18500,
    managerId: "usr-001",
    createdAt: "2026-03-10T09:00:00Z"
  },
  {
    id: "cli-104",
    name: "BioHealth Nutrition",
    companyName: "BioHealth Labs Inc.",
    email: "support@biohealth.com",
    phone: "+1 (800) 555-0811",
    category: "Health & Fitness",
    status: "Active",
    budget: 54000,
    managerId: "usr-002",
    createdAt: "2026-03-22T11:45:00Z"
  }
];

export const mockPlatforms = [
  {
    id: "plt-001",
    name: "Meta Ads (Facebook & Instagram)",
    code: "META",
    status: "Active",
    activeCampaignsCount: 14,
    monthlySpend: 62500
  },
  {
    id: "plt-002",
    name: "Google Search & Shopping",
    code: "GOOG",
    status: "Active",
    activeCampaignsCount: 18,
    monthlySpend: 84000
  },
  {
    id: "plt-003",
    name: "TikTok Ads Manager",
    code: "TT",
    status: "Active",
    activeCampaignsCount: 9,
    monthlySpend: 28000
  },
  {
    id: "plt-004",
    name: "LinkedIn Marketing Solutions",
    code: "LNKD",
    status: "Active",
    activeCampaignsCount: 5,
    monthlySpend: 19500
  }
];

export const mockCampaigns = [
  {
    id: 1,
    name: "Summer Mega Sales 2026",
    clientId: "cli-101",
    platformId: "plt-001",
    status: "Active",
    spend: 24500,
    revenue: 98000,
    roas: 4.0,
    impressions: 450000,
    clicks: 18400,
    ctr: 4.09,
    startDate: "2026-05-01",
    endDate: "2026-08-31"
  },
  {
    id: 2,
    name: "Black Friday Early Bird Retargeting",
    clientId: "cli-102",
    platformId: "plt-002",
    status: "Active",
    spend: 18200,
    revenue: 63700,
    roas: 3.5,
    impressions: 320000,
    clicks: 14200,
    ctr: 4.43,
    startDate: "2026-06-15",
    endDate: "2026-09-30"
  },
  {
    id: 3,
    name: "Brand Awareness & Viral TikTok Push",
    clientId: "cli-104",
    platformId: "plt-003",
    status: "Active",
    spend: 12000,
    revenue: 38400,
    roas: 3.2,
    impressions: 890000,
    clicks: 31200,
    ctr: 3.51,
    startDate: "2026-07-01",
    endDate: "2026-10-15"
  },
  {
    id: 4,
    name: "B2B SaaS Lead Generation Push",
    clientId: "cli-103",
    platformId: "plt-004",
    status: "Paused",
    spend: 8500,
    revenue: 21250,
    roas: 2.5,
    impressions: 95000,
    clicks: 3800,
    ctr: 4.0,
    startDate: "2026-04-10",
    endDate: "2026-07-10"
  }
];

export const mockAdSets = [
  {
    id: "ads-101",
    name: "Lookalike 1% - Top Purchasers 90D",
    campaignId: 1,
    bidStrategy: "Lowest Cost",
    dailyBudget: 500,
    targetAudience: "US & CA, 25-54, High Income",
    status: "Active"
  },
  {
    id: "ads-102",
    name: "Retargeting - Cart Abandoners 14D",
    campaignId: 1,
    bidStrategy: "Cost Cap",
    dailyBudget: 350,
    targetAudience: "Website Visitors, Cart Abandoners",
    status: "Active"
  },
  {
    id: "ads-103",
    name: "Search Keywords - High Intent Purchase",
    campaignId: 2,
    bidStrategy: "Target CPA",
    dailyBudget: 600,
    targetAudience: "Exact Match Keywords (Fashion, Apparel)",
    status: "Active"
  }
];

export const mockAds = [
  {
    id: "ad-001",
    name: "Video Ad - 15s Summer Product Showcase",
    adSetId: "ads-101",
    format: "Video (1080x1080)",
    clicks: 8400,
    conversions: 320,
    cpa: 15.5,
    status: "Active"
  },
  {
    id: "ad-002",
    name: "Carousel Ad - Top 5 Trending Items",
    adSetId: "ads-102",
    format: "Carousel",
    clicks: 6200,
    conversions: 245,
    cpa: 14.2,
    status: "Active"
  },
  {
    id: "ad-003",
    name: "Responsive Search Ad - Promo Offer",
    adSetId: "ads-103",
    format: "Text & Image Extension",
    clicks: 14200,
    conversions: 510,
    cpa: 12.8,
    status: "Active"
  }
];

export const mockAssociateProfiles = [
  {
    id: "asp-001",
    userId: "usr-003",
    title: "Senior Media Buyer & Growth Specialist",
    skills: ["Meta Ads", "Google Ads", "Conversion Rate Optimization"],
    assignedClientsCount: 3,
    performanceRating: 4.9
  },
  {
    id: "asp-002",
    userId: "usr-002",
    title: "Account Director",
    skills: ["Client Management", "Campaign Strategy", "Team Leadership"],
    assignedClientsCount: 4,
    performanceRating: 4.8
  }
];

export const mockAssociateTeams = [
  {
    id: "tm-001",
    name: "Alpha Growth Marketing Team",
    managerId: "usr-002",
    membersCount: 5,
    focusArea: "E-Commerce Growth & Performance Scaling"
  },
  {
    id: "tm-002",
    name: "Beta B2B & Lead Gen Team",
    managerId: "usr-001",
    membersCount: 4,
    focusArea: "Enterprise SaaS & High-Ticket Lead Gen"
  }
];

export const mockAssignments = [
  {
    id: "asg-001",
    associateProfileId: "asp-001",
    clientId: "cli-101",
    assignedRole: "Primary Media Buyer",
    assignedDate: "2026-01-20"
  },
  {
    id: "asg-002",
    associateProfileId: "asp-001",
    clientId: "cli-102",
    assignedRole: "Optimization Specialist",
    assignedDate: "2026-02-05"
  }
];

/**
 * Returns complete combined mock dashboard summary
 */
export function getMockDashboardSummary() {
  const totalRevenue = mockCampaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalSpend = mockCampaigns.reduce((acc, c) => acc + c.spend, 0);
  const avgRoas = (mockCampaigns.reduce((acc, c) => acc + c.roas, 0) / mockCampaigns.length).toFixed(2);

  return {
    campaigns: mockCampaigns,
    clients: mockClients,
    platforms: mockPlatforms,
    adSets: mockAdSets,
    ads: mockAds,
    users: mockUsers,
    associateProfiles: mockAssociateProfiles,
    associateTeams: mockAssociateTeams,
    assignments: mockAssignments,
    kpis: {
      totalCampaigns: mockCampaigns.length,
      totalRevenue: totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      totalSpend: totalSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
      avgRoas: `${avgRoas}x`,
      totalClients: mockClients.length,
      activeClients: mockClients.filter(c => c.status === 'Active').length,
      totalAds: mockAds.length,
      totalPlatforms: mockPlatforms.length
    }
  };
}
