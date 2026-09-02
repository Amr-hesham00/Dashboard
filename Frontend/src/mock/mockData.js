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
    conversions: 480,
    targetConversions: 500,
    targetAchievement: 112,
    roas: 4.20,
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
    conversions: 400,
    targetConversions: 400,
    targetAchievement: 100,
    roas: 3.85,
    managerId: "usr-002",
    createdAt: "2026-02-01T14:15:00Z"
  },
  {
    id: "cli-103",
    name: "Zenith Health Systems",
    companyName: "Zenith Health Systems",
    email: "contact@zenithhealth.org",
    phone: "+1 (800) 555-0377",
    category: "Health & Wellness",
    status: "Active",
    budget: 28000,
    conversions: 225,
    targetConversions: 300,
    targetAchievement: 75,
    roas: 2.45,
    managerId: "usr-001",
    createdAt: "2026-03-10T09:00:00Z"
  },
  {
    id: "cli-104",
    name: "Aura Beauty Co.",
    companyName: "Aura Beauty Co.",
    email: "support@aurabeauty.com",
    phone: "+1 (800) 555-0811",
    category: "Cosmetics & Beauty",
    status: "Active",
    budget: 54000,
    conversions: 275,
    targetConversions: 500,
    targetAchievement: 55,
    roas: 5.10,
    managerId: "usr-002",
    createdAt: "2026-03-22T11:45:00Z"
  },
  {
    id: "cli-105",
    name: "Starlight Media Group",
    companyName: "Starlight Media Group",
    email: "hello@starlightmedia.io",
    phone: "+1 (800) 555-0922",
    category: "Media & Entertainment",
    status: "Active",
    budget: 18500,
    conversions: 125,
    targetConversions: 250,
    targetAchievement: 50,
    roas: 3.15,
    managerId: "usr-001",
    createdAt: "2026-04-05T16:00:00Z"
  }
];

export const mockPlatforms = [
  {
    id: 1,
    name: "Meta Ads",
    code: "META",
    status: "Active",
    activeCampaignsCount: 14,
    monthlySpend: 62500
  },
  {
    id: 2,
    name: "Google Ads",
    code: "GOOG",
    status: "Active",
    activeCampaignsCount: 18,
    monthlySpend: 84000
  },
  {
    id: 3,
    name: "Snapchat Ads",
    code: "SNAP",
    status: "Active",
    activeCampaignsCount: 8,
    monthlySpend: 19500
  },
  {
    id: 4,
    name: "TikTok Ads",
    code: "TT",
    status: "Active",
    activeCampaignsCount: 9,
    monthlySpend: 28000
  }
];

export const mockCampaigns = [
  {
    id: 1,
    name: "Summer Mega Sales 2026",
    objective: 4,
    status: 0,
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    createdAt: "2026-04-20T10:00:00Z",
    platformId: 1,
    impressions: 450000,
    clicks: 18400,
    conversions: 1420,
    spend: 24500,
    revenue: 98000
  },
  {
    id: 2,
    name: "Black Friday Early Bird Retargeting",
    objective: 4,
    status: 0,
    startDate: "2026-06-15T00:00:00Z",
    endDate: "2026-09-30T23:59:59Z",
    createdAt: "2026-06-01T12:30:00Z",
    platformId: 2,
    impressions: 320000,
    clicks: 14200,
    conversions: 980,
    spend: 18200,
    revenue: 63700
  },
  {
    id: 3,
    name: "Brand Awareness & Viral TikTok Push",
    objective: 0,
    status: 0,
    startDate: "2026-07-01T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    createdAt: "2026-06-25T08:15:00Z",
    platformId: 4,
    impressions: 890000,
    clicks: 31200,
    conversions: 1650,
    spend: 12000,
    revenue: 38400
  },
  {
    id: 4,
    name: "Dynamic Catalog Product Feed",
    objective: 4,
    status: 0,
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-09-01T23:59:59Z",
    createdAt: "2026-05-28T14:00:00Z",
    platformId: 1,
    impressions: 920000,
    clicks: 38640,
    conversions: 2420,
    spend: 6800,
    revenue: 28560
  },
  {
    id: 5,
    name: "Search — High-Intent Brand Keywords",
    objective: 3,
    status: 0,
    startDate: "2026-05-15T00:00:00Z",
    endDate: "2026-08-30T23:59:59Z",
    createdAt: "2026-05-10T11:45:00Z",
    platformId: 2,
    impressions: 900000,
    clicks: 42400,
    conversions: 3100,
    spend: 11000,
    revenue: 44800
  },
  {
    id: 6,
    name: "Snap Ads — AR Lens & Story Promo",
    objective: 1,
    status: 1,
    startDate: "2026-07-10T00:00:00Z",
    endDate: "2026-09-10T23:59:59Z",
    createdAt: "2026-07-01T09:20:00Z",
    platformId: 3,
    impressions: 3960000,
    clicks: 86700,
    conversions: 1890,
    spend: 5600,
    revenue: 15600
  },
  {
    id: 7,
    name: "Spark Ads — Creator UGC Viral",
    objective: 2,
    status: 0,
    startDate: "2026-06-20T00:00:00Z",
    endDate: "2026-09-20T23:59:59Z",
    createdAt: "2026-06-12T16:10:00Z",
    platformId: 4,
    impressions: 5360000,
    clicks: 128640,
    conversions: 4200,
    spend: 8400,
    revenue: 26880
  },
  {
    id: 8,
    name: "Search — Competitor Keywords High Intent",
    objective: 3,
    status: 2,
    startDate: "2026-04-01T00:00:00Z",
    endDate: "2026-07-01T23:59:59Z",
    createdAt: "2026-03-25T13:00:00Z",
    platformId: 2,
    impressions: 580000,
    clicks: 23200,
    conversions: 1750,
    spend: 6800,
    revenue: 23800
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
    name: "Interest Stack - Streetwear & Sneakers",
    campaignId: 1,
    bidStrategy: "Cost Cap",
    dailyBudget: 350,
    targetAudience: "Global, 18-34, Fashion Lovers",
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
    id: 1,
    name: "Video Ad - 15s Summer Product Showcase",
    headline: "Unleash Summer Fashion - Up to 40% Off",
    description: "Discover our premium seasonal collection with fast express delivery.",
    cta: "Shop Now",
    mediaURL: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    mediaType: 1,
    status: 0,
    impressions: 245000,
    clicks: 8400,
    conversions: 320,
    spend: 4960,
    revenue: 19840,
    createdAt: "2026-05-02T10:00:00Z",
    adSetId: 1
  },
  {
    id: 2,
    name: "Carousel Ad - Top 5 Trending Items",
    headline: "Top Trending Styles Picked for You",
    description: "Swipe through the season's bestselling wardrobe essentials.",
    cta: "Explore Collection",
    mediaURL: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800",
    mediaType: 0,
    status: 0,
    impressions: 180000,
    clicks: 6200,
    conversions: 245,
    spend: 3480,
    revenue: 13920,
    createdAt: "2026-05-05T14:30:00Z",
    adSetId: 1
  },
  {
    id: 3,
    name: "Responsive Search Ad - Promo Offer",
    headline: "Official Store - Exclusive Summer Offers",
    description: "Shop high-performance apparel designed for comfort and elegance.",
    cta: "Get Offer",
    mediaURL: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    mediaType: 0,
    status: 0,
    impressions: 390000,
    clicks: 14200,
    conversions: 510,
    spend: 6520,
    revenue: 26080,
    createdAt: "2026-06-16T11:00:00Z",
    adSetId: 2
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

// ========== CLIENT DETAILS PAGE — Extended Mock Data ==========

/**
 * All available KPIs that can be pinned per client.
 * Each KPI has: key, label, format, icon color.
 */
export const availableKPIs = [
  { key: 'totalSpend', label: 'Total Spend', format: 'currency', color: 'danger' },
  { key: 'totalRevenue', label: 'Total Revenue', format: 'currency', color: 'success' },
  { key: 'roas', label: 'ROAS', format: 'multiplier', color: 'primary' },
  { key: 'ctr', label: 'CTR', format: 'percent', color: 'info' },
  { key: 'cpc', label: 'CPC', format: 'currency', color: 'warning' },
  { key: 'cpm', label: 'CPM', format: 'currency', color: 'secondary' },
  { key: 'impressions', label: 'Impressions', format: 'number', color: 'info' },
  { key: 'clicks', label: 'Clicks', format: 'number', color: 'primary' },
  { key: 'conversions', label: 'Conversions', format: 'number', color: 'success' },
  { key: 'cpa', label: 'CPA', format: 'currency', color: 'warning' },
  { key: 'conversionRate', label: 'Conversion Rate', format: 'percent', color: 'success' },
  { key: 'frequency', label: 'Frequency', format: 'decimal', color: 'secondary' },
];

/** Default pinned KPI keys (5 cards) */
export const defaultPinnedKPIs = ['totalSpend', 'totalRevenue', 'roas', 'ctr', 'conversions'];

/**
 * Per-client KPI values (keyed by client ID).
 * Each value includes: current value, previous value (for change %), period label.
 */
export const mockClientKPIs = {
  'cli-101': {
    totalSpend: { value: 45200, prev: 41800, change: 8.1 },
    totalRevenue: { value: 186400, prev: 172100, change: 8.3 },
    roas: { value: 4.12, prev: 4.11, change: 0.2 },
    ctr: { value: 4.35, prev: 3.92, change: 11.0 },
    cpc: { value: 1.24, prev: 1.31, change: -5.3 },
    cpm: { value: 8.72, prev: 9.10, change: -4.2 },
    impressions: { value: 5184000, prev: 4592000, change: 12.9 },
    clicks: { value: 225504, prev: 180000, change: 25.3 },
    conversions: { value: 8420, prev: 7230, change: 16.5 },
    cpa: { value: 5.37, prev: 5.78, change: -7.1 },
    conversionRate: { value: 3.73, prev: 4.02, change: -7.2 },
    frequency: { value: 2.14, prev: 1.98, change: 8.1 },
  },
  'cli-102': {
    totalSpend: { value: 32100, prev: 28900, change: 11.1 },
    totalRevenue: { value: 112350, prev: 98000, change: 14.6 },
    roas: { value: 3.50, prev: 3.39, change: 3.2 },
    ctr: { value: 3.88, prev: 3.62, change: 7.2 },
    cpc: { value: 1.56, prev: 1.62, change: -3.7 },
    cpm: { value: 10.24, prev: 10.82, change: -5.4 },
    impressions: { value: 3135000, prev: 2670000, change: 17.4 },
    clicks: { value: 121700, prev: 96700, change: 25.9 },
    conversions: { value: 5840, prev: 4920, change: 18.7 },
    cpa: { value: 5.50, prev: 5.87, change: -6.3 },
    conversionRate: { value: 4.80, prev: 5.09, change: -5.7 },
    frequency: { value: 1.87, prev: 1.72, change: 8.7 },
  },
  'cli-103': {
    totalSpend: { value: 18500, prev: 16200, change: 14.2 },
    totalRevenue: { value: 46250, prev: 38880, change: 19.0 },
    roas: { value: 2.50, prev: 2.40, change: 4.2 },
    ctr: { value: 2.95, prev: 2.78, change: 6.1 },
    cpc: { value: 2.12, prev: 2.28, change: -7.0 },
    cpm: { value: 12.60, prev: 13.15, change: -4.2 },
    impressions: { value: 1468250, prev: 1231800, change: 19.2 },
    clicks: { value: 43314, prev: 34245, change: 26.5 },
    conversions: { value: 1620, prev: 1380, change: 17.4 },
    cpa: { value: 11.42, prev: 11.74, change: -2.7 },
    conversionRate: { value: 3.74, prev: 4.03, change: -7.2 },
    frequency: { value: 2.45, prev: 2.18, change: 12.4 },
  },
  'cli-104': {
    totalSpend: { value: 54000, prev: 48700, change: 10.9 },
    totalRevenue: { value: 172800, prev: 155600, change: 11.1 },
    roas: { value: 3.20, prev: 3.19, change: 0.3 },
    ctr: { value: 3.51, prev: 3.22, change: 9.0 },
    cpc: { value: 1.73, prev: 1.85, change: -6.5 },
    cpm: { value: 9.45, prev: 9.92, change: -4.7 },
    impressions: { value: 5714280, prev: 4908700, change: 16.4 },
    clicks: { value: 200570, prev: 158060, change: 26.9 },
    conversions: { value: 7120, prev: 6040, change: 17.9 },
    cpa: { value: 7.58, prev: 8.06, change: -6.0 },
    conversionRate: { value: 3.55, prev: 3.82, change: -7.1 },
    frequency: { value: 1.95, prev: 1.78, change: 9.6 },
  },
};

/**
 * Per-Client Target Settings.
 * Configurable targets including:
 * - targetRoas: Target ROAS (multiplier, e.g. 4.0x)
 * - targetCpa: Target Cost Per Acquisition (currency, e.g. $5.50)
 * - monthlyBudget: Monthly Ad Spend Budget (currency, e.g. $50,000)
 * - currency: Currency code ('USD', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD')
 * - businessModel: 'ecommerce' | 'lead_generation'
 * - mainConversionEvent: Main event name (e.g. 'Purchases', 'Form Submissions', 'Qualified Leads', 'Book Demo')
 * - targetRevenue: Target total revenue
 * - targetConversions: Target total conversions
 * - targetCtr: Target Click-Through Rate (%)
 * - targetCpc: Target Cost Per Click
 */
export const defaultClientTargets = {
  targetRoas: 4.0,
  targetCpa: 5.50,
  monthlyBudget: 50000,
  currency: 'USD',
  businessModel: 'ecommerce',
  mainConversionEvent: 'Purchases',
  targetRevenue: 200000,
  targetConversions: 9000,
  targetCtr: 3.5,
  targetCpc: 1.20,
};

export const mockClientTargets = {
  'cli-101': {
    targetRoas: 4.20,
    targetCpa: 5.50,
    monthlyBudget: 45000,
    currency: 'USD',
    businessModel: 'ecommerce',
    mainConversionEvent: 'Purchases',
    targetRevenue: 189000,
    targetConversions: 500,
    targetAchievement: 112,
    targetCtr: 4.0,
    targetCpc: 1.25,
  },
  'cli-102': {
    targetRoas: 3.85,
    targetCpa: 5.50,
    monthlyBudget: 32000,
    currency: 'USD',
    businessModel: 'ecommerce',
    mainConversionEvent: 'Purchases',
    targetRevenue: 123200,
    targetConversions: 400,
    targetAchievement: 100,
    targetCtr: 3.8,
    targetCpc: 1.50,
  },
  'cli-103': {
    targetRoas: 2.45,
    targetCpa: 12.00,
    monthlyBudget: 28000,
    currency: 'USD',
    businessModel: 'lead_generation',
    mainConversionEvent: 'Form Submissions',
    targetRevenue: 68600,
    targetConversions: 300,
    targetAchievement: 75,
    targetCtr: 3.0,
    targetCpc: 2.10,
  },
  'cli-104': {
    targetRoas: 5.10,
    targetCpa: 7.50,
    monthlyBudget: 54000,
    currency: 'USD',
    businessModel: 'ecommerce',
    mainConversionEvent: 'Purchases',
    targetRevenue: 275400,
    targetConversions: 500,
    targetAchievement: 55,
    targetCtr: 3.5,
    targetCpc: 1.70,
  },
  'cli-105': {
    targetRoas: 3.15,
    targetCpa: 9.00,
    monthlyBudget: 18500,
    currency: 'USD',
    businessModel: 'entertainment',
    mainConversionEvent: 'Subscribers',
    targetRevenue: 58275,
    targetConversions: 250,
    targetAchievement: 50,
    targetCtr: 3.6,
    targetCpc: 1.45,
  },
};

export const getClientTargets = (clientId) => {
  let targets = mockClientTargets[clientId] || { ...defaultClientTargets };
  try {
    const saved = localStorage.getItem(`client_targets_${clientId}`);
    if (saved) targets = JSON.parse(saved);
  } catch (e) {
    console.error('Error reading client targets from storage', e);
  }
  return {
    ...defaultClientTargets,
    ...targets,
    monthlyBudget: Number(targets?.monthlyBudget) || 50000,
    targetRoas: Number(targets?.targetRoas) || 4.0,
    targetCpa: Number(targets?.targetCpa) || 5.5,
    targetRevenue: Number(targets?.targetRevenue) || 200000,
    targetConversions: Number(targets?.targetConversions) || 9000,
  };
};

export const saveClientTargets = (clientId, targets) => {
  const sanitized = {
    ...targets,
    monthlyBudget: Number(targets?.monthlyBudget) || 50000,
    targetRoas: Number(targets?.targetRoas) || 4.0,
    targetCpa: Number(targets?.targetCpa) || 5.5,
    targetRevenue: Number(targets?.targetRevenue) || Math.round((Number(targets?.monthlyBudget) || 50000) * (Number(targets?.targetRoas) || 4.0)),
    targetConversions: Number(targets?.targetConversions) || Math.round((Number(targets?.monthlyBudget) || 50000) / Math.max(0.1, Number(targets?.targetCpa) || 5.5)),
  };
  try {
    localStorage.setItem(`client_targets_${clientId}`, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving client targets to storage', e);
  }
  mockClientTargets[clientId] = { ...sanitized };
  return sanitized;
};

/**
 * Per-platform performance mock data.
 * Each platform has campaigns, KPI summary, and top-performing creatives.
 */
/**
 * Per-client and per-platform performance & campaign datasets.
 * Each client has their own dedicated campaigns across Meta, Google, Snapchat, and TikTok.
 */
export const mockClientPlatformPerformance = {
  'cli-101': {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: 'c101-m1', name: 'Acme Cloud Suite — Lookalike 1% High LTV', status: 'Active', spend: 8400, revenue: 33600, roas: 4.0, impressions: 1240000, clicks: 52080, ctr: 4.20, conversions: 1890, cpa: 4.44 },
        { id: 'c101-m2', name: 'Acme Pro Hardware — DPA Dynamic Catalog Feed', status: 'Active', spend: 6800, revenue: 28560, roas: 4.2, impressions: 920000, clicks: 38640, ctr: 4.20, conversions: 1580, cpa: 4.30 },
        { id: 'c101-m3', name: 'Software Free Trial — Cart & Form Retargeting 14D', status: 'Active', spend: 5200, revenue: 18720, roas: 3.6, impressions: 680000, clicks: 23800, ctr: 3.50, conversions: 1020, cpa: 5.10 },
      ],
      kpis: { spend: 20400, revenue: 80880, roas: 3.96, impressions: 2840000, clicks: 114520, ctr: 4.03, conversions: 4490, cpa: 4.54 },
      placements: [
        { name: 'Facebook Feed', spend: 9800, impressions: 1920000, clicks: 72960, ctr: 3.80 },
        { name: 'Instagram Stories', spend: 6200, impressions: 1340000, clicks: 40200, ctr: 3.00 },
        { name: 'Instagram Reels', spend: 4500, impressions: 980000, clicks: 27440, ctr: 2.80 },
        { name: 'Audience Network', spend: 3000, impressions: 450000, clicks: 10920, ctr: 2.43 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: 'c101-g1', name: 'Acme Search — High-Intent Brand & Product Keywords', status: 'Active', spend: 5800, revenue: 34800, roas: 6.0, impressions: 410000, clicks: 28700, ctr: 7.00, conversions: 1620, cpa: 3.58, qualityScore: 9.4 },
        { id: 'c101-g2', name: 'Google Shopping — Enterprise Cloud Devices', status: 'Active', spend: 5400, revenue: 27000, roas: 5.0, impressions: 440000, clicks: 17600, ctr: 4.00, conversions: 1320, cpa: 4.09, qualityScore: 8.4 },
        { id: 'c101-g3', name: 'Search — Competitor Software High Intent', status: 'Active', spend: 4200, revenue: 14700, roas: 3.5, impressions: 360000, clicks: 14400, ctr: 4.00, conversions: 980, cpa: 4.29, qualityScore: 7.2 },
        { id: 'c101-g4', name: 'Performance Max — B2B Lead Acquisition', status: 'Paused', spend: 3800, revenue: 12160, roas: 3.2, impressions: 310000, clicks: 10850, ctr: 3.50, conversions: 480, cpa: 7.92, qualityScore: 6.8 },
      ],
      kpis: { spend: 19200, revenue: 88660, roas: 4.62, impressions: 1520000, clicks: 71550, ctr: 4.71, conversions: 4400, cpa: 4.36, avgQualityScore: 8.2, searchImprShare: 72.4 },
      searchTerms: [
        { id: 'st1', term: 'acme global tech buy online', matchType: 'Exact', impressions: 45200, clicks: 3840, ctr: 8.50, avgCpc: 1.15, conversions: 345, convRate: 8.98, spend: 4416.00 },
        { id: 'st2', term: 'best enterprise cloud automation 2026', matchType: 'Phrase', impressions: 92400, clicks: 5082, ctr: 5.50, avgCpc: 1.42, conversions: 294, convRate: 5.78, spend: 7216.44 },
        { id: 'st3', term: 'acme corporation customer support', matchType: 'Exact', impressions: 31000, clicks: 2790, ctr: 9.00, avgCpc: 0.65, conversions: 195, convRate: 6.99, spend: 1813.50 },
        { id: 'st4', term: 'top b2b software solutions', matchType: 'Broad', impressions: 148000, clicks: 4736, ctr: 3.20, avgCpc: 1.85, conversions: 142, convRate: 3.00, spend: 8761.60 },
        { id: 'st5', term: 'acme global official website', matchType: 'Exact', impressions: 28900, clicks: 3612, ctr: 12.50, avgCpc: 0.48, conversions: 410, convRate: 11.35, spend: 1733.76 },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: 'c101-s1', name: 'Snap Ads — Acme Annual Tech Summit 2026', status: 'Active', spend: 3200, revenue: 9600, roas: 3.0, impressions: 1820000, clicks: 54600, swipeUps: 41200, storyViews: 980000, ctr: 3.00, conversions: 620, cpa: 5.16 },
        { id: 'c101-s2', name: 'Story Ads — Enterprise Customer Success Stories', status: 'Active', spend: 2400, revenue: 6480, roas: 2.7, impressions: 1420000, clicks: 28400, swipeUps: 24200, storyViews: 1120000, ctr: 2.00, conversions: 390, cpa: 6.15 },
        { id: 'c101-s3', name: 'AR Lens — Virtual Cloud Server Interactive', status: 'Paused', spend: 1800, revenue: 3960, roas: 2.2, impressions: 1560000, clicks: 21840, swipeUps: 18200, storyViews: 1120000, ctr: 1.40, conversions: 210, cpa: 8.57 },
      ],
      kpis: { spend: 7400, revenue: 20040, roas: 2.71, impressions: 4800000, clicks: 104840, swipeUps: 83600, storyViews: 3220000, ctr: 2.18, conversions: 1220, cpa: 6.07 },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: 'c101-t1', name: 'Spark Ads — Engineering Hacks & Desk Setup UGC', status: 'Active', spend: 4800, revenue: 16800, roas: 3.5, impressions: 3240000, clicks: 97200, videoViews: 2860000, engagementRate: 8.4, ctr: 3.00, conversions: 1240, cpa: 3.87 },
        { id: 'c101-t2', name: 'In-Feed — Acme Workflow Speed Comparison', status: 'Active', spend: 3600, revenue: 11520, roas: 3.2, impressions: 2680000, clicks: 64320, videoViews: 2140000, engagementRate: 7.2, ctr: 2.40, conversions: 860, cpa: 4.19 },
        { id: 'c101-t3', name: 'TopView — Summer Product Launch Premiere', status: 'Completed', spend: 8200, revenue: 20500, roas: 2.5, impressions: 5420000, clicks: 108400, videoViews: 4880000, engagementRate: 6.8, ctr: 2.00, conversions: 1420, cpa: 5.77 },
      ],
      kpis: { spend: 16600, revenue: 48820, roas: 2.94, impressions: 11340000, clicks: 269920, videoViews: 9880000, engagementRate: 7.47, ctr: 2.38, conversions: 3520, cpa: 4.72 },
    },
  },

  'cli-102': {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: 'c102-m1', name: 'Nexus Summer Drop — Lookalike 2% Fashion Buyers', status: 'Active', spend: 7200, revenue: 28800, roas: 4.0, impressions: 1080000, clicks: 43200, ctr: 4.00, conversions: 1440, cpa: 5.00 },
        { id: 'c102-m2', name: 'Abandoned Cart & Wishlist Retargeting 7D', status: 'Active', spend: 4600, revenue: 19320, roas: 4.2, impressions: 620000, clicks: 24800, ctr: 4.00, conversions: 920, cpa: 5.00 },
        { id: 'c102-m3', name: 'DPA — Urban Streetwear & Footwear Catalog Feed', status: 'Active', spend: 4200, revenue: 15120, roas: 3.6, impressions: 580000, clicks: 20300, ctr: 3.50, conversions: 780, cpa: 5.38 },
      ],
      kpis: { spend: 16000, revenue: 63240, roas: 3.95, impressions: 2280000, clicks: 88300, ctr: 3.87, conversions: 3140, cpa: 5.10 },
      placements: [
        { name: 'Instagram Stories', spend: 6800, impressions: 1100000, clicks: 45000, ctr: 4.09 },
        { name: 'Instagram Reels', spend: 5200, impressions: 780000, clicks: 28000, ctr: 3.59 },
        { name: 'Facebook Feed', spend: 4000, impressions: 400000, clicks: 15300, ctr: 3.83 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: 'c102-g1', name: 'Google Shopping — Smart Bidding Apparel Collection', status: 'Active', spend: 5100, revenue: 22950, roas: 4.5, impressions: 460000, clicks: 23000, ctr: 5.00, conversions: 1020, cpa: 5.00, qualityScore: 8.8 },
        { id: 'c102-g2', name: 'Search — Nexus Wear Official Brand & Trademark', status: 'Active', spend: 3400, revenue: 17680, roas: 5.2, impressions: 280000, clicks: 19600, ctr: 7.00, conversions: 850, cpa: 4.00, qualityScore: 9.6 },
        { id: 'c102-g3', name: 'Search — Premium Organic Cotton Hoodies & Tees', status: 'Active', spend: 2800, revenue: 9800, roas: 3.5, impressions: 320000, clicks: 12800, ctr: 4.00, conversions: 490, cpa: 5.71, qualityScore: 7.6 },
      ],
      kpis: { spend: 11300, revenue: 50430, roas: 4.46, impressions: 1060000, clicks: 55400, ctr: 5.23, conversions: 2360, cpa: 4.79, avgQualityScore: 8.7, searchImprShare: 78.2 },
      searchTerms: [
        { id: 'st102-1', term: 'nexus fashion streetwear online', matchType: 'Exact', impressions: 38000, clicks: 3420, ctr: 9.00, avgCpc: 0.98, conversions: 290, convRate: 8.48, spend: 3351.60 },
        { id: 'st102-2', term: 'best oversized hoodies 2026', matchType: 'Phrase', impressions: 72000, clicks: 3960, ctr: 5.50, avgCpc: 1.25, conversions: 210, convRate: 5.30, spend: 4950.00 },
        { id: 'st102-3', term: 'buy nexus wear jackets uae', matchType: 'Phrase', impressions: 24000, clicks: 2160, ctr: 9.00, avgCpc: 0.85, conversions: 180, convRate: 8.33, spend: 1836.00 },
        { id: 'st102-4', term: 'organic cotton graphic tees shop', matchType: 'Broad', impressions: 94000, clicks: 3290, ctr: 3.50, avgCpc: 1.10, conversions: 115, convRate: 3.50, spend: 3619.00 },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: 'c102-s1', name: 'AR Lens — 3D Virtual Try-On Sunglasses & Hats', status: 'Active', spend: 2900, revenue: 8700, roas: 3.0, impressions: 2450000, clicks: 49000, swipeUps: 38200, storyViews: 1680000, ctr: 2.00, conversions: 580, cpa: 5.00 },
        { id: 'c102-s2', name: 'Snap Ads — Flash Weekend Sale 30% Off Swipe Up', status: 'Active', spend: 2100, revenue: 5880, roas: 2.8, impressions: 1620000, clicks: 35640, swipeUps: 28900, storyViews: 1100000, ctr: 2.20, conversions: 380, cpa: 5.53 },
        { id: 'c102-s3', name: 'Story Ads — Autumn/Winter Collection Lookbook', status: 'Paused', spend: 1400, revenue: 3220, roas: 2.3, impressions: 980000, clicks: 15680, swipeUps: 12400, storyViews: 680000, ctr: 1.60, conversions: 190, cpa: 7.37 },
      ],
      kpis: { spend: 6400, revenue: 17800, roas: 2.78, impressions: 5050000, clicks: 100320, swipeUps: 79500, storyViews: 3460000, ctr: 1.99, conversions: 1150, cpa: 5.57 },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: 'c102-t1', name: 'Viral OOTD Street Style Lookbook Series', status: 'Active', spend: 4100, revenue: 14760, roas: 3.6, impressions: 3820000, clicks: 114600, videoViews: 3240000, engagementRate: 9.2, ctr: 3.00, conversions: 980, cpa: 4.18 },
        { id: 'c102-t2', name: 'Spark Ads — Micro-Influencer Unboxing & Hauls', status: 'Active', spend: 3200, revenue: 10560, roas: 3.3, impressions: 2940000, clicks: 76440, videoViews: 2480000, engagementRate: 8.1, ctr: 2.60, conversions: 710, cpa: 4.51 },
        { id: 'c102-t3', name: 'In-Feed — Summer Festival Outfit Inspiration', status: 'Active', spend: 2400, revenue: 7200, roas: 3.0, impressions: 1880000, clicks: 45120, videoViews: 1520000, engagementRate: 7.4, ctr: 2.40, conversions: 480, cpa: 5.00 },
      ],
      kpis: { spend: 9700, revenue: 32520, roas: 3.35, impressions: 8640000, clicks: 236160, videoViews: 7240000, engagementRate: 8.23, ctr: 2.73, conversions: 2170, cpa: 4.47 },
    },
  },

  'cli-103': {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: 'c103-m1', name: 'Zenith Preventive Care — Family Health Packages', status: 'Active', spend: 4800, revenue: 16800, roas: 3.5, impressions: 640000, clicks: 22400, ctr: 3.50, conversions: 480, cpa: 10.00 },
        { id: 'c103-m2', name: 'Specialist Booking Form — Cardiology & Orthopedics', status: 'Active', spend: 3600, revenue: 11520, roas: 3.2, impressions: 420000, clicks: 14700, ctr: 3.50, conversions: 320, cpa: 11.25 },
        { id: 'c103-m3', name: 'Telehealth App Download & First Consult Free', status: 'Active', spend: 2800, revenue: 8400, roas: 3.0, impressions: 380000, clicks: 11400, ctr: 3.00, conversions: 280, cpa: 10.00 },
      ],
      kpis: { spend: 11200, revenue: 36720, roas: 3.28, impressions: 1440000, clicks: 48500, ctr: 3.37, conversions: 1080, cpa: 10.37 },
      placements: [
        { name: 'Facebook Feed', spend: 6200, impressions: 820000, clicks: 28000, ctr: 3.41 },
        { name: 'Instagram Stories', spend: 3400, impressions: 410000, clicks: 13500, ctr: 3.29 },
        { name: 'Audience Network', spend: 1600, impressions: 210000, clicks: 7000, ctr: 3.33 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: 'c103-g1', name: 'Search — Zenith Urgent Care Clinic Near Me', status: 'Active', spend: 5600, revenue: 28000, roas: 5.0, impressions: 320000, clicks: 22400, ctr: 7.00, conversions: 700, cpa: 8.00, qualityScore: 9.4 },
        { id: 'c103-g2', name: 'Search — Pediatric & Family Doctor Appointments', status: 'Active', spend: 3900, revenue: 16380, roas: 4.2, impressions: 260000, clicks: 15600, ctr: 6.00, conversions: 420, cpa: 9.29, qualityScore: 8.6 },
        { id: 'c103-g3', name: 'Local Call-Only Ads — Emergency Health Hotline', status: 'Active', spend: 2400, revenue: 8400, roas: 3.5, impressions: 180000, clicks: 9000, ctr: 5.00, conversions: 240, cpa: 10.00, qualityScore: 8.0 },
      ],
      kpis: { spend: 11900, revenue: 52780, roas: 4.44, impressions: 760000, clicks: 47000, ctr: 6.18, conversions: 1360, cpa: 8.75, avgQualityScore: 8.7, searchImprShare: 84.1 },
      searchTerms: [
        { id: 'st103-1', term: 'urgent care clinic open now near me', matchType: 'Phrase', impressions: 42000, clicks: 3780, ctr: 9.00, avgCpc: 1.45, conversions: 310, convRate: 8.20, spend: 5481.00 },
        { id: 'st103-2', term: 'zenith health doctors appointment', matchType: 'Exact', impressions: 28000, clicks: 3360, ctr: 12.00, avgCpc: 0.95, conversions: 285, convRate: 8.48, spend: 3192.00 },
        { id: 'st103-3', term: 'best pediatrician hospital in city', matchType: 'Phrase', impressions: 36000, clicks: 2160, ctr: 6.00, avgCpc: 1.30, conversions: 140, convRate: 6.48, spend: 2808.00 },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: 'c103-s1', name: 'Snap Ads — Student Health & Dental Check Promo', status: 'Active', spend: 1600, revenue: 4000, roas: 2.5, impressions: 1120000, clicks: 16800, swipeUps: 12400, storyViews: 680000, ctr: 1.50, conversions: 160, cpa: 10.00 },
        { id: 'c103-s2', name: 'Story Ads — 5 Daily Habits for Heart Health', status: 'Active', spend: 1200, revenue: 2640, roas: 2.2, impressions: 840000, clicks: 10080, swipeUps: 7900, storyViews: 520000, ctr: 1.20, conversions: 110, cpa: 10.91 },
      ],
      kpis: { spend: 2800, revenue: 6640, roas: 2.37, impressions: 1960000, clicks: 26880, swipeUps: 20300, storyViews: 1200000, ctr: 1.37, conversions: 270, cpa: 10.37 },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: 'c103-t1', name: 'Doctor Q&A — Mental Wellness & Sleep Hygiene UGC', status: 'Active', spend: 2400, revenue: 7200, roas: 3.0, impressions: 2140000, clicks: 64200, videoViews: 1820000, engagementRate: 7.8, ctr: 3.00, conversions: 290, cpa: 8.28 },
        { id: 'c103-t2', name: 'In-Feed — 30-Day Healthy Living Challenge 2026', status: 'Active', spend: 1800, revenue: 5040, roas: 2.8, impressions: 1560000, clicks: 37440, videoViews: 1240000, engagementRate: 6.9, ctr: 2.40, conversions: 210, cpa: 8.57 },
      ],
      kpis: { spend: 4200, revenue: 12240, roas: 2.91, impressions: 3700000, clicks: 101640, videoViews: 3060000, engagementRate: 7.35, ctr: 2.75, conversions: 500, cpa: 8.40 },
    },
  },

  'cli-104': {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: 'c104-m1', name: 'HydraGlow Peptide Serum — Lookalike 1% VIP Buyers', status: 'Active', spend: 11200, revenue: 58240, roas: 5.2, impressions: 1840000, clicks: 92000, ctr: 5.00, conversions: 2800, cpa: 4.00 },
        { id: 'c104-m2', name: 'DPA — Clean Skincare & Glow Routine Bundles', status: 'Active', spend: 8400, revenue: 42000, roas: 5.0, impressions: 1420000, clicks: 63900, ctr: 4.50, conversions: 1980, cpa: 4.24 },
        { id: 'c104-m3', name: 'Beauty Quiz Funnel — Personalized Skincare Routine', status: 'Active', spend: 6200, revenue: 28520, roas: 4.6, impressions: 980000, clicks: 44100, ctr: 4.50, conversions: 1420, cpa: 4.37 },
      ],
      kpis: { spend: 25800, revenue: 128760, roas: 4.99, impressions: 4240000, clicks: 200000, ctr: 4.72, conversions: 6200, cpa: 4.16 },
      placements: [
        { name: 'Instagram Stories', spend: 11400, impressions: 2100000, clicks: 105000, ctr: 5.00 },
        { name: 'Instagram Reels', spend: 9200, impressions: 1450000, clicks: 68000, ctr: 4.69 },
        { name: 'Facebook Feed', spend: 5200, impressions: 690000, clicks: 27000, ctr: 3.91 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: 'c104-g1', name: 'Google Shopping — Organic Vegan Skincare Line', status: 'Active', spend: 7800, revenue: 42120, roas: 5.4, impressions: 620000, clicks: 37200, ctr: 6.00, conversions: 1820, cpa: 4.29, qualityScore: 9.1 },
        { id: 'c104-g2', name: 'Search — Aura Beauty Official Clean Cosmetics', status: 'Active', spend: 4600, revenue: 27600, roas: 6.0, impressions: 380000, clicks: 30400, ctr: 8.00, conversions: 1350, cpa: 3.41, qualityScore: 9.8 },
        { id: 'c104-g3', name: 'Search — Non-Toxic Vitamin C Brightening Serum', status: 'Active', spend: 3800, revenue: 18240, roas: 4.8, impressions: 410000, clicks: 20500, ctr: 5.00, conversions: 890, cpa: 4.27, qualityScore: 8.2 },
      ],
      kpis: { spend: 16200, revenue: 87960, roas: 5.43, impressions: 1410000, clicks: 88100, ctr: 6.25, conversions: 4060, cpa: 3.99, avgQualityScore: 9.0, searchImprShare: 81.3 },
      searchTerms: [
        { id: 'st104-1', term: 'aura beauty hydraglow serum buy', matchType: 'Exact', impressions: 48000, clicks: 4800, ctr: 10.00, avgCpc: 0.85, conversions: 460, convRate: 9.58, spend: 4080.00 },
        { id: 'st104-2', term: 'best vegan skincare for sensitive skin', matchType: 'Phrase', impressions: 84000, clicks: 5460, ctr: 6.50, avgCpc: 1.15, conversions: 310, convRate: 5.68, spend: 6279.00 },
        { id: 'st104-3', term: 'organic vitamin c serum dermatologist tested', matchType: 'Phrase', impressions: 56000, clicks: 3360, ctr: 6.00, avgCpc: 1.20, conversions: 240, convRate: 7.14, spend: 4032.00 },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: 'c104-s1', name: 'AR Lens — Real-Time Glow Makeup & Lipstick Filter', status: 'Active', spend: 4200, revenue: 15120, roas: 3.6, impressions: 3100000, clicks: 68200, swipeUps: 54100, storyViews: 2240000, ctr: 2.20, conversions: 980, cpa: 4.29 },
        { id: 'c104-s2', name: 'Snap Ads — Limited Edition Holiday Lip Kit Swipe Up', status: 'Active', spend: 3100, revenue: 10230, roas: 3.3, impressions: 2100000, clicks: 46200, swipeUps: 37400, storyViews: 1480000, ctr: 2.20, conversions: 680, cpa: 4.56 },
        { id: 'c104-s3', name: 'Story Ads — Glass Skin Routine 3-Step Guide', status: 'Active', spend: 2200, revenue: 6600, roas: 3.0, impressions: 1450000, clicks: 26100, swipeUps: 21200, storyViews: 980000, ctr: 1.80, conversions: 460, cpa: 4.78 },
      ],
      kpis: { spend: 9500, revenue: 31950, roas: 3.36, impressions: 6650000, clicks: 140500, swipeUps: 112700, storyViews: 4700000, ctr: 2.11, conversions: 2120, cpa: 4.48 },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: 'c104-t1', name: 'Viral #AuraGlowChallenge Creator Collaboration', status: 'Active', spend: 6800, revenue: 27200, roas: 4.0, impressions: 5800000, clicks: 197200, videoViews: 5120000, engagementRate: 9.8, ctr: 3.40, conversions: 1840, cpa: 3.70 },
        { id: 'c104-t2', name: 'Spark Ads — 7-Day Skincare Transformation UGC', status: 'Active', spend: 4900, revenue: 18620, roas: 3.8, impressions: 3950000, clicks: 126400, videoViews: 3410000, engagementRate: 8.6, ctr: 3.20, conversions: 1280, cpa: 3.83 },
        { id: 'c104-t3', name: 'TopView — Global Beauty Influencer Takeover Day', status: 'Completed', spend: 5400, revenue: 18900, roas: 3.5, impressions: 4200000, clicks: 126000, videoViews: 3820000, engagementRate: 8.1, ctr: 3.00, conversions: 1410, cpa: 3.83 },
      ],
      kpis: { spend: 17100, revenue: 64720, roas: 3.78, impressions: 13950000, clicks: 449600, videoViews: 12350000, engagementRate: 8.85, ctr: 3.22, conversions: 4530, cpa: 3.77 },
    },
  },

  'cli-105': {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: 'c105-m1', name: 'Summer Blockbuster Premiere — Ticket Presales', status: 'Active', spend: 4200, revenue: 13440, roas: 3.2, impressions: 720000, clicks: 28800, ctr: 4.00, conversions: 840, cpa: 5.00 },
        { id: 'c105-m2', name: 'Streaming 30-Day Free Trial — Acquisition Push', status: 'Active', spend: 3400, revenue: 10880, roas: 3.2, impressions: 580000, clicks: 23200, ctr: 4.00, conversions: 680, cpa: 5.00 },
        { id: 'c105-m3', name: 'Original Series Release — Fan Community Retargeting', status: 'Active', spend: 2200, revenue: 6600, roas: 3.0, impressions: 420000, clicks: 14700, ctr: 3.50, conversions: 410, cpa: 5.37 },
      ],
      kpis: { spend: 9800, revenue: 30920, roas: 3.16, impressions: 1720000, clicks: 66700, ctr: 3.88, conversions: 1930, cpa: 5.08 },
      placements: [
        { name: 'Instagram Reels', spend: 4800, impressions: 840000, clicks: 35000, ctr: 4.17 },
        { name: 'Facebook Feed', spend: 3200, impressions: 560000, clicks: 21000, ctr: 3.75 },
        { name: 'Instagram Stories', spend: 1800, impressions: 320000, clicks: 10700, ctr: 3.34 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: 'c105-g1', name: 'Search — Starlight Movies & Cinema Showtime Booking', status: 'Active', spend: 3600, revenue: 14400, roas: 4.0, impressions: 310000, clicks: 18600, ctr: 6.00, conversions: 750, cpa: 4.80, qualityScore: 8.8 },
        { id: 'c105-g2', name: 'YouTube Video Ads — Official Teaser Trailers 4K', status: 'Active', spend: 2800, revenue: 9520, roas: 3.4, impressions: 480000, clicks: 19200, ctr: 4.00, conversions: 560, cpa: 5.00, qualityScore: 8.2 },
        { id: 'c105-g3', name: 'Search — Watch Exclusive Sci-Fi Series Online', status: 'Active', spend: 1800, revenue: 5580, roas: 3.1, impressions: 220000, clicks: 9900, ctr: 4.50, conversions: 340, cpa: 5.29, qualityScore: 7.5 },
      ],
      kpis: { spend: 8200, revenue: 29500, roas: 3.60, impressions: 1010000, clicks: 47700, ctr: 4.72, conversions: 1650, cpa: 4.97, avgQualityScore: 8.2, searchImprShare: 71.8 },
      searchTerms: [
        { id: 'st105-1', term: 'starlight movies tickets booking online', matchType: 'Exact', impressions: 34000, clicks: 3400, ctr: 10.00, avgCpc: 0.90, conversions: 310, convRate: 9.12, spend: 3060.00 },
        { id: 'st105-2', term: 'stream new sci-fi movie hd free trial', matchType: 'Phrase', impressions: 52000, clicks: 3120, ctr: 6.00, avgCpc: 1.10, conversions: 190, convRate: 6.09, spend: 3432.00 },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: 'c105-s1', name: 'AR Lens — Superhero Helmet & Sound Effects Game', status: 'Active', spend: 2100, revenue: 5460, roas: 2.6, impressions: 1840000, clicks: 36800, swipeUps: 29400, storyViews: 1220000, ctr: 2.00, conversions: 380, cpa: 5.53 },
        { id: 'c105-s2', name: 'Snap Ads — VIP Premiere Pass Sweepstakes Swipe Up', status: 'Active', spend: 1500, revenue: 3750, roas: 2.5, impressions: 1260000, clicks: 25200, swipeUps: 19800, storyViews: 840000, ctr: 2.00, conversions: 260, cpa: 5.77 },
      ],
      kpis: { spend: 3600, revenue: 9210, roas: 2.56, impressions: 3100000, clicks: 62000, swipeUps: 49200, storyViews: 2060000, ctr: 2.00, conversions: 640, cpa: 5.63 },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: 'c105-t1', name: 'Viral Sound & Lip-Sync Movie Audio Challenge', status: 'Active', spend: 2900, revenue: 9280, roas: 3.2, impressions: 2980000, clicks: 89400, videoViews: 2540000, engagementRate: 8.5, ctr: 3.00, conversions: 640, cpa: 4.53 },
        { id: 'c105-t2', name: 'Spark Ads — Cast Reactions & Exclusive Bloopers UGC', status: 'Active', spend: 2100, revenue: 6300, roas: 3.0, impressions: 2120000, clicks: 55120, videoViews: 1780000, engagementRate: 7.6, ctr: 2.60, conversions: 420, cpa: 5.00 },
      ],
      kpis: { spend: 5000, revenue: 15580, roas: 3.12, impressions: 5100000, clicks: 144520, videoViews: 4320000, engagementRate: 8.05, ctr: 2.83, conversions: 1060, cpa: 4.72 },
    },
  },
};

/**
 * Returns platform performance with client-specific campaigns for any given client.
 * If specific data isn't pre-defined, dynamically generates tailored campaigns.
 */
export function getClientPlatformPerformance(clientId, clientName = '', category = '', multiplier = 1) {
  if (mockClientPlatformPerformance[clientId]) {
    return mockClientPlatformPerformance[clientId];
  }

  const name = clientName || `Client ${clientId}`;
  const m = Math.max(0.2, multiplier || 1);

  return {
    meta: {
      label: 'Meta Ads',
      campaigns: [
        { id: `${clientId}-m1`, name: `${name} — High-Value Prospecting | LAL 1%`, status: 'Active', spend: Math.round(7500 * m), revenue: Math.round(30000 * m), roas: 4.0, impressions: Math.round(1100000 * m), clicks: Math.round(44000 * m), ctr: 4.00, conversions: Math.round(1500 * m), cpa: 5.00 },
        { id: `${clientId}-m2`, name: `${name} — DPA Catalog & Retargeting 14D`, status: 'Active', spend: Math.round(4800 * m), revenue: Math.round(19200 * m), roas: 4.0, impressions: Math.round(720000 * m), clicks: Math.round(28800 * m), ctr: 4.00, conversions: Math.round(960 * m), cpa: 5.00 },
        { id: `${clientId}-m3`, name: `${name} — Brand & Social Proof Carousel`, status: 'Active', spend: Math.round(3200 * m), revenue: Math.round(11200 * m), roas: 3.5, impressions: Math.round(480000 * m), clicks: Math.round(16800 * m), ctr: 3.50, conversions: Math.round(640 * m), cpa: 5.00 },
      ],
      kpis: {
        spend: Math.round(15500 * m),
        revenue: Math.round(60400 * m),
        roas: 3.90,
        impressions: Math.round(2300000 * m),
        clicks: Math.round(89600 * m),
        ctr: 3.90,
        conversions: Math.round(3100 * m),
        cpa: 5.00,
      },
      placements: [
        { name: 'Instagram Stories', spend: Math.round(6500 * m), impressions: Math.round(1000000 * m), clicks: Math.round(40000 * m), ctr: 4.00 },
        { name: 'Instagram Reels', spend: Math.round(5000 * m), impressions: Math.round(750000 * m), clicks: Math.round(28000 * m), ctr: 3.73 },
        { name: 'Facebook Feed', spend: Math.round(4000 * m), impressions: Math.round(550000 * m), clicks: Math.round(21600 * m), ctr: 3.93 },
      ],
    },
    google: {
      label: 'Google Ads',
      campaigns: [
        { id: `${clientId}-g1`, name: `${name} — Official Search & Trademark`, status: 'Active', spend: Math.round(5200 * m), revenue: Math.round(28600 * m), roas: 5.5, impressions: Math.round(380000 * m), clicks: Math.round(26600 * m), ctr: 7.00, conversions: Math.round(1100 * m), cpa: 4.73, qualityScore: 9.2 },
        { id: `${clientId}-g2`, name: `${name} — High-Intent Product Shopping`, status: 'Active', spend: Math.round(4400 * m), revenue: Math.round(19800 * m), roas: 4.5, impressions: Math.round(420000 * m), clicks: Math.round(18900 * m), ctr: 4.50, conversions: Math.round(920 * m), cpa: 4.78, qualityScore: 8.5 },
        { id: `${clientId}-g3`, name: `${name} — Performance Max Cross-Channel`, status: 'Active', spend: Math.round(3100 * m), revenue: Math.round(11780 * m), roas: 3.8, impressions: Math.round(310000 * m), clicks: Math.round(12400 * m), ctr: 4.00, conversions: Math.round(620 * m), cpa: 5.00, qualityScore: 7.8 },
      ],
      kpis: {
        spend: Math.round(12700 * m),
        revenue: Math.round(60180 * m),
        roas: 4.74,
        impressions: Math.round(1110000 * m),
        clicks: Math.round(57900 * m),
        ctr: 5.22,
        conversions: Math.round(2640 * m),
        cpa: 4.81,
        avgQualityScore: 8.5,
        searchImprShare: 74.0,
      },
      searchTerms: [
        { id: `${clientId}-st1`, term: `${name.toLowerCase()} buy online`, matchType: 'Exact', impressions: Math.round(32000 * m), clicks: Math.round(3200 * m), ctr: 10.00, avgCpc: 1.10, conversions: Math.round(280 * m), convRate: 8.75, spend: Math.round(3520 * m) },
        { id: `${clientId}-st2`, term: `best ${category ? category.toLowerCase() : 'service'} 2026`, matchType: 'Phrase', impressions: Math.round(58000 * m), clicks: Math.round(3480 * m), ctr: 6.00, avgCpc: 1.30, conversions: Math.round(210 * m), convRate: 6.03, spend: Math.round(4524 * m) },
      ],
    },
    snapchat: {
      label: 'Snapchat Ads',
      campaigns: [
        { id: `${clientId}-s1`, name: `${name} — Interactive AR Lens & Try-On`, status: 'Active', spend: Math.round(2800 * m), revenue: Math.round(8400 * m), roas: 3.0, impressions: Math.round(2100000 * m), clicks: Math.round(42000 * m), swipeUps: Math.round(33600 * m), storyViews: Math.round(1450000 * m), ctr: 2.00, conversions: Math.round(560 * m), cpa: 5.00 },
        { id: `${clientId}-s2`, name: `${name} — Story Ads Direct Swipe-Up Promo`, status: 'Active', spend: Math.round(1900 * m), revenue: Math.round(5130 * m), roas: 2.7, impressions: Math.round(1350000 * m), clicks: Math.round(27000 * m), swipeUps: Math.round(21600 * m), storyViews: Math.round(920000 * m), ctr: 2.00, conversions: Math.round(380 * m), cpa: 5.00 },
      ],
      kpis: {
        spend: Math.round(4700 * m),
        revenue: Math.round(13530 * m),
        roas: 2.88,
        impressions: Math.round(3450000 * m),
        clicks: Math.round(69000 * m),
        swipeUps: Math.round(55200 * m),
        storyViews: Math.round(2370000 * m),
        ctr: 2.00,
        conversions: Math.round(940 * m),
        cpa: 5.00,
      },
    },
    tiktok: {
      label: 'TikTok Ads',
      campaigns: [
        { id: `${clientId}-t1`, name: `${name} — Spark Ads Creator Collaboration UGC`, status: 'Active', spend: Math.round(3800 * m), revenue: Math.round(13300 * m), roas: 3.5, impressions: Math.round(3200000 * m), clicks: Math.round(96000 * m), videoViews: Math.round(2800000 * m), engagementRate: 8.8, ctr: 3.00, conversions: Math.round(890 * m), cpa: 4.27 },
        { id: `${clientId}-t2`, name: `${name} — In-Feed Viral Product Spotlight`, status: 'Active', spend: Math.round(2600 * m), revenue: Math.round(8320 * m), roas: 3.2, impressions: Math.round(2200000 * m), clicks: Math.round(57200 * m), videoViews: Math.round(1850000 * m), engagementRate: 7.6, ctr: 2.60, conversions: Math.round(620 * m), cpa: 4.19 },
      ],
      kpis: {
        spend: Math.round(6400 * m),
        revenue: Math.round(21620 * m),
        roas: 3.38,
        impressions: Math.round(5400000 * m),
        clicks: Math.round(153200 * m),
        videoViews: Math.round(4650000 * m),
        engagementRate: 8.31,
        ctr: 2.84,
        conversions: Math.round(1510 * m),
        cpa: 4.24,
      },
    },
  };
}

export const mockPlatformPerformance = mockClientPlatformPerformance['cli-101'];

/**
 * Daily / interval spend vs revenue trend data per client.
 */
export const mockClientTrends = {
  'cli-101': {
    dates: ['Aug 01', 'Aug 04', 'Aug 07', 'Aug 10', 'Aug 13', 'Aug 16', 'Aug 19', 'Aug 22', 'Aug 25', 'Aug 28', 'Aug 31'],
    spend: [3800, 4200, 3900, 4400, 4100, 4600, 4300, 4500, 4200, 4500, 2700],
    revenue: [15200, 17800, 16400, 18200, 17100, 19500, 18400, 19800, 17900, 19200, 11900],
    conversions: [730, 810, 750, 850, 790, 890, 830, 870, 810, 865, 520],
    impressions: [532000, 588000, 546000, 616000, 574000, 644000, 602000, 630000, 588000, 630000, 378000],
    clicks: [20520, 22680, 21060, 23760, 22140, 24840, 23220, 24300, 22680, 24300, 14580],
    roas: [4.0, 4.24, 4.21, 4.14, 4.17, 4.24, 4.28, 4.4, 4.26, 4.27, 4.41],
  },
  'cli-102': {
    dates: ['Aug 01', 'Aug 04', 'Aug 07', 'Aug 10', 'Aug 13', 'Aug 16', 'Aug 19', 'Aug 22', 'Aug 25', 'Aug 28', 'Aug 31'],
    spend: [2600, 2900, 2800, 3100, 3000, 3300, 3100, 3400, 3200, 3100, 1600],
    revenue: [9100, 10200, 9800, 11200, 10500, 11900, 10800, 12400, 11200, 11150, 6100],
    conversions: [490, 540, 520, 580, 560, 610, 570, 630, 590, 580, 310],
    impressions: [364000, 406000, 392000, 434000, 420000, 462000, 434000, 476000, 448000, 434000, 224000],
    clicks: [14040, 15660, 15120, 16740, 16200, 17820, 16740, 18360, 17280, 16740, 8640],
    roas: [3.5, 3.52, 3.5, 3.61, 3.5, 3.61, 3.48, 3.65, 3.5, 3.6, 3.81],
  },
  'cli-103': {
    dates: ['Aug 01', 'Aug 04', 'Aug 07', 'Aug 10', 'Aug 13', 'Aug 16', 'Aug 19', 'Aug 22', 'Aug 25', 'Aug 28', 'Aug 31'],
    spend: [1500, 1700, 1600, 1800, 1750, 1900, 1800, 1950, 1850, 1750, 900],
    revenue: [3750, 4250, 4000, 4500, 4375, 4750, 4500, 4875, 4625, 4375, 2250],
    conversions: [280, 310, 290, 330, 320, 350, 330, 360, 340, 320, 160],
    impressions: [210000, 238000, 224000, 252000, 245000, 266000, 252000, 273000, 259000, 245000, 126000],
    clicks: [8100, 9180, 8640, 9720, 9450, 10260, 9720, 10530, 9990, 9450, 4860],
    roas: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
  },
  'cli-104': {
    dates: ['Aug 01', 'Aug 04', 'Aug 07', 'Aug 10', 'Aug 13', 'Aug 16', 'Aug 19', 'Aug 22', 'Aug 25', 'Aug 28', 'Aug 31'],
    spend: [4500, 5100, 4800, 5300, 5000, 5600, 5200, 5500, 5100, 5300, 2600],
    revenue: [14400, 16320, 15360, 16960, 16000, 17920, 16640, 17600, 16320, 16960, 8320],
    conversions: [820, 930, 870, 960, 910, 1020, 945, 1000, 930, 960, 470],
    impressions: [630000, 714000, 672000, 742000, 700000, 784000, 728000, 770000, 714000, 742000, 364000],
    clicks: [24300, 27540, 25920, 28620, 27000, 30240, 28080, 29700, 27540, 28620, 14040],
    roas: [3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2],
  },
};

/**
 * AI-generated insights & recommendations per client.
 */
export const mockClientInsights = [
  {
    id: 'ins-1',
    priority: 'High',
    category: 'Budget Optimization',
    title: 'Reallocate Meta Budget to Top Performers',
    description: 'Your "DPA — Product Catalog Feed" campaign shows a 4.2x ROAS, significantly above your account average of 3.78x. Consider shifting 15-20% of budget from the paused "Brand Awareness" campaign to scale this high performer.',
    impact: 'Estimated +$4,200 monthly revenue',
    platform: 'meta',
  },
  {
    id: 'ins-2',
    priority: 'High',
    category: 'Audience Targeting',
    title: 'Expand Google Shopping Smart Campaigns',
    description: 'Your Shopping campaigns maintain a 5.0x ROAS with a Quality Score of 8.4. The search impression share is only 68.5%, meaning you\'re missing 31.5% of available impressions. Increasing budget by 25% could capture significant incremental revenue.',
    impact: 'Estimated +$6,750 monthly revenue',
    platform: 'google',
  },
  {
    id: 'ins-3',
    priority: 'Medium',
    category: 'Creative Performance',
    title: 'TikTok Spark Ads Outperforming In-Feed',
    description: 'Creator UGC content in Spark Ads shows 7.2% engagement rate vs 6.8% for TopView despite 56% less spend. Test allocating more budget to authentic creator content for better efficiency.',
    impact: 'Estimated 12% CPA reduction',
    platform: 'tiktok',
  },
  {
    id: 'ins-4',
    priority: 'Medium',
    category: 'Bidding Strategy',
    title: 'Switch Google Display to Target ROAS',
    description: 'Your Display Remarketing campaign has the lowest ROAS (2.8x) and Quality Score (6.8). Consider switching from manual CPC to Target ROAS bidding to let the algorithm optimize for conversions.',
    impact: 'Estimated 18% ROAS improvement',
    platform: 'google',
  },
  {
    id: 'ins-5',
    priority: 'Low',
    category: 'Platform Expansion',
    title: 'Test Snapchat AR Lens for Product Discovery',
    description: 'The AR Lens campaign shows strong Story Views (1.42M) despite lower direct conversions. Consider using it as a top-of-funnel awareness driver paired with Meta retargeting for full-funnel attribution.',
    impact: 'Better brand awareness funnel',
    platform: 'snapchat',
  },
  {
    id: 'ins-6',
    priority: 'Low',
    category: 'Frequency Management',
    title: 'Monitor Ad Frequency Across Meta',
    description: 'Your current frequency of 2.14 is approaching the saturation point. Consider refreshing creatives or expanding your target audience to maintain performance and avoid ad fatigue.',
    impact: 'Prevent performance decline',
    platform: 'meta',
  },
];

/**
 * Notes per client — timestamped with author.
 */
export const mockClientNotes = [
  {
    id: 'note-1',
    clientId: 'cli-101',
    author: 'Sarah Miller',
    authorAvatar: 'S',
    timestamp: '2026-08-15T14:30:00Z',
    content: 'Client approved a 15% budget increase for Q3. Focus on scaling Meta DPA campaigns and Google Shopping. They want to see TikTok performance review by end of month.',
  },
  {
    id: 'note-2',
    clientId: 'cli-101',
    author: 'Amr El-Sayed',
    authorAvatar: 'A',
    timestamp: '2026-08-10T09:15:00Z',
    content: 'Quarterly business review completed. Client is happy with overall ROAS of 4.12x. Main concerns: rising CPMs on Meta and need for creative refresh. Scheduled creative workshop for next week.',
  },
  {
    id: 'note-3',
    clientId: 'cli-101',
    author: 'John Doe',
    authorAvatar: 'J',
    timestamp: '2026-08-05T16:45:00Z',
    content: 'New product line launching September 1st. Need to prepare campaign assets across all platforms. Client provided brand guidelines and product photography. Coordinate with design team.',
  },
  {
    id: 'note-4',
    clientId: 'cli-102',
    author: 'Sarah Miller',
    authorAvatar: 'S',
    timestamp: '2026-08-12T11:00:00Z',
    content: 'Fashion season transition — need to swap out summer creatives for fall collection by August 25th. Client sending new lookbook assets this week.',
  },
];

/**
 * Reports generated per client.
 */
export const mockReports = [
  {
    id: 'rep-001',
    title: 'Q2 Comprehensive Multi-Platform Performance',
    client: 'Acme Corporation',
    period: 'Apr 1 - Jun 30, 2026',
    generatedDate: 'Aug 15, 2026',
    format: 'PDF',
    size: '3.4 MB',
    status: 'Ready',
  },
  {
    id: 'rep-002',
    title: 'Meta Ads Retargeting & Creative Audit',
    client: 'Nexus Wear Ltd.',
    period: 'Jul 1 - Jul 31, 2026',
    generatedDate: 'Aug 10, 2026',
    format: 'PDF',
    size: '2.1 MB',
    status: 'Ready',
  },
  {
    id: 'rep-003',
    title: 'Weekly Cross-Channel Executive Summary',
    client: 'Zenith Health Systems',
    period: 'Aug 4 - Aug 10, 2026',
    generatedDate: 'Aug 11, 2026',
    format: 'CSV',
    size: '480 KB',
    status: 'Ready',
  },
  {
    id: 'rep-004',
    title: 'Google Ads Search Impression Share & CPA Breakdown',
    client: 'Aura Beauty Co.',
    period: 'Jul 15 - Aug 15, 2026',
    generatedDate: 'Aug 16, 2026',
    format: 'PDF',
    size: '4.8 MB',
    status: 'Ready',
  },
  {
    id: 'rep-005',
    title: 'TikTok Spark Ads & Viral UGC Performance Analysis',
    client: 'Starlight Media Group',
    period: 'Jul 1 - Jul 31, 2026',
    generatedDate: 'Aug 05, 2026',
    format: 'Excel',
    size: '1.2 MB',
    status: 'Ready',
  },
];

/**
 * Agency team members with skills and assigned clients.
 */
export const mockTeamMembers = [
  {
    id: 'usr-001',
    name: 'Amr El-Sayed',
    email: 'amr@example.com',
    role: 'Agency Director & Lead Strategist',
    skills: ['Campaign Strategy', 'Multi-Channel Scaling', 'Client Leadership'],
    assignedClients: ['Acme Corporation', 'Nexus Wear Ltd.'],
    rating: 4.95,
    status: 'Active',
  },
  {
    id: 'usr-002',
    name: 'Sarah Miller',
    email: 'sarah.miller@dashboard.com',
    role: 'Senior Media Buyer (Meta & TikTok)',
    skills: ['Meta Ads', 'TikTok Spark Ads', 'Creative Testing', 'CRO'],
    assignedClients: ['Aura Beauty Co.', 'Starlight Media Group'],
    rating: 4.88,
    status: 'Active',
  },
  {
    id: 'usr-003',
    name: 'John Doe',
    email: 'john.doe@dashboard.com',
    role: 'PPC & Search Specialist',
    skills: ['Google Ads', 'Shopping Smart Campaigns', 'Keyword Attribution'],
    assignedClients: ['Zenith Health Systems', 'Acme Corporation'],
    rating: 4.92,
    status: 'Active',
  },
  {
    id: 'usr-004',
    name: 'Elena Rostova',
    email: 'elena.r@dashboard.com',
    role: 'Analytics & Attribution Engineer',
    skills: ['Server-Side Tracking', 'Looker Studio', 'ROAS Attribution'],
    assignedClients: ['Nexus Wear Ltd.', 'Zenith Health Systems'],
    rating: 4.85,
    status: 'Active',
  },
];

/**
 * Returns complete combined mock dashboard summary
 */
export function getMockDashboardSummary() {
  const totalRevenue = mockCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const totalSpend = mockCampaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '4.26';
  const totalConversions = mockClients.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const totalTargetConversions = mockClients.reduce((acc, c) => acc + (c.targetConversions || 0), 0);
  const targetAchievement = totalTargetConversions > 0 ? Math.round((totalConversions / totalTargetConversions) * 100) : 94;

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
      totalConversions: totalConversions.toLocaleString('en-US'),
      targetAchievement: `${targetAchievement}%`,
      totalClients: mockClients.length,
      activeClients: mockClients.filter(c => c.status === 'Active').length,
      totalAds: mockAds.length,
      totalPlatforms: mockPlatforms.length
    }
  };
}

