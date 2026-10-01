export type Currency = 'USD' | 'AED' | 'SAR';
export type ClientStatus = 'active' | 'paused';
export type CampaignStatus = 'active' | 'paused' | 'ended';
export type InsightStatus = 'success' | 'warning' | 'danger';

export interface MonthlyData {
  month: string;
  spend: number;
  revenue: number;
  conversions: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: string;
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  startDate?: string;
}

export interface SearchTerm {
  term: string;
  matchType: 'Exact' | 'Phrase' | 'Broad';
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  conversions: number;
  convRate: number;
  spend: number;
}

export interface PlatformMetrics {
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  monthlyData: MonthlyData[];
  campaigns: Campaign[];
  searchTerms?: SearchTerm[];
}

export interface Insight {
  id: string;
  status: InsightStatus;
  platform: string;
  category: 'ROAS' | 'CPA' | 'CTR' | 'Budget' | 'Creative' | 'General';
  title: string;
  description: string;
  recommendation: string;
  currentValue?: string;
  targetValue?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  color: string;
  initials: string;
  status: ClientStatus;
  currency: Currency;
  currencySymbol: string;
  targetROAS: number;
  targetCPA: number;
  monthlyBudget: number;
  businessModel: string;
  mainConversionEvent: string;
  website: string;
  contactName: string;
  contactEmail: string;
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalImpressions: number;
  roas: number;
  cpa: number;
  ctr: number;
  monthlyData: MonthlyData[];
  platforms: {
    meta: PlatformMetrics;
    google: PlatformMetrics;
    snapchat: PlatformMetrics;
    tiktok: PlatformMetrics;
  };
  insights: Insight[];
}

// ─── CLIENT 1: TechStore Arabia ───────────────────────────────────────────────
const techstoreMonthly: MonthlyData[] = [
  { month: "Nov '25", spend: 13200, revenue: 50160, conversions: 980 },
  { month: "Dec '25", spend: 18500, revenue: 81400, conversions: 1480 },
  { month: "Jan '26", spend: 12800, revenue: 48640, conversions: 860 },
  { month: "Feb '26", spend: 14200, revenue: 56800, conversions: 1020 },
  { month: "Mar '26", spend: 15600, revenue: 67080, conversions: 1180 },
  { month: "Apr '26", spend: 15000, revenue: 64500, conversions: 1210 },
];

const techstoreMeta: PlatformMetrics = {
  spend: 5500, revenue: 23100, roas: 4.2, impressions: 1820000, clicks: 54600,
  ctr: 3.0, cpc: 0.10, conversions: 420, cpa: 13.1,
  monthlyData: [
    { month: "Nov '25", spend: 4800, revenue: 18240, conversions: 340 },
    { month: "Dec '25", spend: 6800, revenue: 29920, conversions: 520 },
    { month: "Jan '26", spend: 4500, revenue: 16650, conversions: 295 },
    { month: "Feb '26", spend: 5200, revenue: 20800, conversions: 368 },
    { month: "Mar '26", spend: 5700, revenue: 23940, conversions: 425 },
    { month: "Apr '26", spend: 5500, revenue: 23100, conversions: 420 },
  ],
  campaigns: [
    { id: 'm1', name: 'TechStore – Retargeting | Purchases', status: 'active', objective: 'Conversions', spend: 1800, revenue: 9000, roas: 5.0, impressions: 420000, clicks: 16800, ctr: 4.0, cpc: 0.11, conversions: 165, cpa: 10.9 },
    { id: 'm2', name: 'TechStore – Lookalike 1–3% | Electronics', status: 'active', objective: 'Conversions', spend: 2100, revenue: 8820, roas: 4.2, impressions: 780000, clicks: 23400, ctr: 3.0, cpc: 0.09, conversions: 186, cpa: 11.3 },
    { id: 'm3', name: 'TechStore – Broad | Mobile Devices', status: 'active', objective: 'Conversions', spend: 950, revenue: 3325, roas: 3.5, impressions: 520000, clicks: 10400, ctr: 2.0, cpc: 0.09, conversions: 52, cpa: 18.3 },
    { id: 'm4', name: 'TechStore – Brand Awareness | UAE', status: 'paused', objective: 'Reach', spend: 650, revenue: 1955, roas: 3.0, impressions: 100000, clicks: 4000, ctr: 4.0, cpc: 0.16, conversions: 17, cpa: 38.2 },
  ],
};

const techstoreGoogle: PlatformMetrics = {
  spend: 6200, revenue: 31620, roas: 5.1, impressions: 980000, clicks: 58800,
  ctr: 6.0, cpc: 0.11, conversions: 520, cpa: 11.9,
  monthlyData: [
    { month: "Nov '25", spend: 5500, revenue: 26400, conversions: 440 },
    { month: "Dec '25", spend: 8200, revenue: 43460, conversions: 680 },
    { month: "Jan '26", spend: 5100, revenue: 24480, conversions: 380 },
    { month: "Feb '26", spend: 5800, revenue: 29000, conversions: 460 },
    { month: "Mar '26", spend: 6600, revenue: 35640, conversions: 570 },
    { month: "Apr '26", spend: 6200, revenue: 31620, conversions: 520 },
  ],
  campaigns: [
    { id: 'g1', name: 'TechStore – Brand | Mobile Phones', status: 'active', objective: 'Search', spend: 1200, revenue: 7800, roas: 6.5, impressions: 180000, clicks: 14400, ctr: 8.0, cpc: 0.08, conversions: 148, cpa: 8.1 },
    { id: 'g2', name: 'TechStore – Shopping | Electronics', status: 'active', objective: 'Shopping', spend: 2800, revenue: 14560, roas: 5.2, impressions: 450000, clicks: 27000, ctr: 6.0, cpc: 0.10, conversions: 238, cpa: 11.8 },
    { id: 'g3', name: 'TechStore – Dynamic Search Ads', status: 'active', objective: 'Search', spend: 1400, revenue: 6440, roas: 4.6, impressions: 260000, clicks: 13000, ctr: 5.0, cpc: 0.11, conversions: 98, cpa: 14.3 },
    { id: 'g4', name: 'TechStore – Competitor Keywords', status: 'active', objective: 'Search', spend: 800, revenue: 2820, roas: 3.5, impressions: 90000, clicks: 4400, ctr: 4.9, cpc: 0.18, conversions: 36, cpa: 22.2 },
  ],
  searchTerms: [
    { term: 'buy iphone 16 pro online', matchType: 'Exact', impressions: 42000, clicks: 3780, ctr: 9.0, avgCpc: 0.14, conversions: 68, convRate: 1.8, spend: 529 },
    { term: 'samsung galaxy s25 price uae', matchType: 'Phrase', impressions: 38000, clicks: 2850, ctr: 7.5, avgCpc: 0.11, conversions: 52, convRate: 1.8, spend: 314 },
    { term: 'best laptop deals dubai', matchType: 'Broad', impressions: 56000, clicks: 2240, ctr: 4.0, avgCpc: 0.09, conversions: 28, convRate: 1.3, spend: 202 },
    { term: 'wireless earbuds under 200 aed', matchType: 'Phrase', impressions: 29000, clicks: 1740, ctr: 6.0, avgCpc: 0.08, conversions: 41, convRate: 2.4, spend: 139 },
    { term: 'macbook pro m4 buy', matchType: 'Exact', impressions: 18000, clicks: 1440, ctr: 8.0, avgCpc: 0.19, conversions: 22, convRate: 1.5, spend: 274 },
    { term: 'cheap smartphones online', matchType: 'Broad', impressions: 74000, clicks: 1480, ctr: 2.0, avgCpc: 0.07, conversions: 8, convRate: 0.5, spend: 104 },
    { term: 'apple watch series 10 price', matchType: 'Phrase', impressions: 22000, clicks: 1540, ctr: 7.0, avgCpc: 0.11, conversions: 29, convRate: 1.9, spend: 169 },
    { term: 'gaming laptop sale uae', matchType: 'Broad', impressions: 31000, clicks: 1240, ctr: 4.0, avgCpc: 0.12, conversions: 17, convRate: 1.4, spend: 149 },
    { term: 'techstore electronics', matchType: 'Exact', impressions: 9500, clicks: 1140, ctr: 12.0, avgCpc: 0.06, conversions: 38, convRate: 3.3, spend: 68 },
    { term: 'compare smartphones uae', matchType: 'Broad', impressions: 48000, clicks: 960, ctr: 2.0, avgCpc: 0.08, conversions: 4, convRate: 0.4, spend: 77 },
  ],
};

const techstoreSnapchat: PlatformMetrics = {
  spend: 1800, revenue: 5040, roas: 2.8, impressions: 2100000, clicks: 14700,
  ctr: 0.7, cpc: 0.12, conversions: 128, cpa: 14.1,
  monthlyData: [
    { month: "Nov '25", spend: 1500, revenue: 3900, conversions: 95 },
    { month: "Dec '25", spend: 2100, revenue: 6090, conversions: 148 },
    { month: "Jan '26", spend: 1600, revenue: 4160, conversions: 102 },
    { month: "Feb '26", spend: 1700, revenue: 4590, conversions: 112 },
    { month: "Mar '26", spend: 1800, revenue: 5220, conversions: 124 },
    { month: "Apr '26", spend: 1800, revenue: 5040, conversions: 128 },
  ],
  campaigns: [
    { id: 's1', name: 'TechStore – Snap Collection | Phones', status: 'active', objective: 'Conversions', spend: 900, revenue: 2700, roas: 3.0, impressions: 1100000, clicks: 8800, ctr: 0.8, cpc: 0.10, conversions: 72, cpa: 12.5 },
    { id: 's2', name: 'TechStore – Story Ads | Gadgets', status: 'active', objective: 'Traffic', spend: 600, revenue: 1560, roas: 2.6, impressions: 750000, clicks: 4500, ctr: 0.6, cpc: 0.13, conversions: 40, cpa: 15.0 },
    { id: 's3', name: 'TechStore – Awareness | UAE Youth', status: 'paused', objective: 'Awareness', spend: 300, revenue: 780, roas: 2.6, impressions: 250000, clicks: 1400, ctr: 0.6, cpc: 0.21, conversions: 16, cpa: 18.8 },
  ],
};

const techstoreTikTok: PlatformMetrics = {
  spend: 1500, revenue: 4800, roas: 3.2, impressions: 3400000, clicks: 34000,
  ctr: 1.0, cpc: 0.04, conversions: 142, cpa: 10.6,
  monthlyData: [
    { month: "Nov '25", spend: 1400, revenue: 3920, conversions: 115 },
    { month: "Dec '25", spend: 1400, revenue: 3920, conversions: 132 },
    { month: "Jan '26", spend: 1600, revenue: 4960, conversions: 143 },
    { month: "Feb '26", spend: 1500, revenue: 4500, conversions: 140 },
    { month: "Mar '26", spend: 1500, revenue: 5280, conversions: 161 },
    { month: "Apr '26", spend: 1500, revenue: 4800, conversions: 142 },
  ],
  campaigns: [
    { id: 't1', name: 'TechStore – Product Demo | Phones', status: 'active', objective: 'Conversions', spend: 750, revenue: 2625, roas: 3.5, impressions: 1800000, clicks: 19800, ctr: 1.1, cpc: 0.04, conversions: 82, cpa: 9.1 },
    { id: 't2', name: 'TechStore – Sale Campaign | All Products', status: 'active', objective: 'Conversions', spend: 480, revenue: 1440, roas: 3.0, impressions: 1100000, clicks: 10450, ctr: 0.95, cpc: 0.046, conversions: 44, cpa: 10.9 },
    { id: 't3', name: 'TechStore – UGC Ads | Accessories', status: 'active', objective: 'Traffic', spend: 270, revenue: 735, roas: 2.7, impressions: 500000, clicks: 3750, ctr: 0.75, cpc: 0.072, conversions: 16, cpa: 16.9 },
  ],
};

const techstoreInsights: Insight[] = [
  { id: 'i1', status: 'success', platform: 'Google Ads', category: 'ROAS', title: 'Google Ads Exceeding ROAS Target', description: 'Google Ads is delivering a ROAS of 5.1×, significantly above your target of 4.0×. Shopping campaigns are the top contributor.', recommendation: 'Consider increasing Google Ads budget by 10–15% to scale this strong performance.', currentValue: '5.1×', targetValue: '4.0×' },
  { id: 'i2', status: 'success', platform: 'Meta Ads', category: 'ROAS', title: 'Meta Ads Above ROAS Target', description: 'Meta Ads achieved a ROAS of 4.2×, just above your 4.0× target. Retargeting campaigns are the strongest performer at 5.0× ROAS.', recommendation: 'Expand the retargeting audience size and test new Lookalike audiences at 1–2%.', currentValue: '4.2×', targetValue: '4.0×' },
  { id: 'i3', status: 'warning', platform: 'TikTok Ads', category: 'ROAS', title: 'TikTok ROAS Approaching Target', description: 'TikTok is at 3.2× ROAS, 80% of your 4.0× target. Performance is improving month-over-month.', recommendation: 'Test new UGC creatives and optimize towards Purchase events rather than Traffic.', currentValue: '3.2×', targetValue: '4.0×' },
  { id: 'i4', status: 'danger', platform: 'Snapchat Ads', category: 'ROAS', title: 'Snapchat ROAS Below Target', description: 'Snapchat is at 2.8× ROAS, 70% of your 4.0× target. CTR is very low at 0.7%, indicating creative fatigue.', recommendation: 'Refresh creatives immediately. Consider pausing the Awareness campaign and reallocating budget to Meta.', currentValue: '2.8×', targetValue: '4.0×' },
  { id: 'i5', status: 'danger', platform: 'Snapchat Ads', category: 'CTR', title: 'Very Low CTR on Snapchat', description: 'Snapchat CTR is 0.7%, well below the platform average of 1.5–2%. This suggests ad creative is not resonating with the audience.', recommendation: 'A/B test new ad formats. Try Snap Collection ads with product catalogues.', currentValue: '0.7%', targetValue: '1.5%+' },
  { id: 'i6', status: 'success', platform: 'All Platforms', category: 'CPA', title: 'Overall CPA Well Below Target', description: 'Average CPA across all platforms is $12.5, 50% below your $25 target. Highly efficient spend.', recommendation: 'Scale budgets across top-performing platforms while maintaining CPA discipline.', currentValue: '$12.5', targetValue: '$25' },
  { id: 'i7', status: 'warning', platform: 'Google Ads', category: 'CTR', title: 'Competitor Keywords Efficiency', description: 'Competitor keyword campaign has a 3.5× ROAS vs your 4.0× target, with a CPC of $0.18 — the highest in your Google account.', recommendation: 'Review competitor keyword list, remove low-quality terms, and add negative keywords.', currentValue: '3.5×', targetValue: '4.0×' },
];

// ─── CLIENT 2: Luma Skincare ───────────────────────────────────────────────────
const lumaMonthly: MonthlyData[] = [
  { month: "Nov '25", spend: 38000, revenue: 129200, conversions: 1420 },
  { month: "Dec '25", spend: 52000, revenue: 192400, conversions: 2080 },
  { month: "Jan '26", spend: 36000, revenue: 118800, conversions: 1290 },
  { month: "Feb '26", spend: 41000, revenue: 147600, conversions: 1620 },
  { month: "Mar '26", spend: 44000, revenue: 163680, conversions: 1840 },
  { month: "Apr '26", spend: 45000, revenue: 163700, conversions: 1870 },
];

const lumaMeta: PlatformMetrics = {
  spend: 18000, revenue: 68400, roas: 3.8, impressions: 4200000, clicks: 100800,
  ctr: 2.4, cpc: 0.18, conversions: 780, cpa: 23.1,
  monthlyData: [
    { month: "Nov '25", spend: 15000, revenue: 51000, conversions: 580 },
    { month: "Dec '25", spend: 21000, revenue: 79800, conversions: 860 },
    { month: "Jan '26", spend: 14000, revenue: 46200, conversions: 510 },
    { month: "Feb '26", spend: 16500, revenue: 57750, conversions: 640 },
    { month: "Mar '26", spend: 17500, revenue: 66500, conversions: 740 },
    { month: "Apr '26", spend: 18000, revenue: 68400, conversions: 780 },
  ],
  campaigns: [
    { id: 'lm1', name: 'Luma – Retargeting | Purchase Intent', status: 'active', objective: 'Conversions', spend: 5500, revenue: 24750, roas: 4.5, impressions: 820000, clicks: 24600, ctr: 3.0, cpc: 0.22, conversions: 280, cpa: 19.6 },
    { id: 'lm2', name: 'Luma – Lookalike 1% | Skincare Buyers', status: 'active', objective: 'Conversions', spend: 6800, revenue: 26520, roas: 3.9, impressions: 1800000, clicks: 43200, ctr: 2.4, cpc: 0.16, conversions: 308, cpa: 22.1 },
    { id: 'lm3', name: 'Luma – Interest Targeting | Beauty', status: 'active', objective: 'Conversions', spend: 3800, revenue: 11400, roas: 3.0, impressions: 1100000, clicks: 26400, ctr: 2.4, cpc: 0.14, conversions: 152, cpa: 25.0 },
    { id: 'lm4', name: 'Luma – Video Views | Brand Story', status: 'paused', objective: 'Video Views', spend: 1900, revenue: 5700, roas: 3.0, impressions: 480000, clicks: 6600, ctr: 1.4, cpc: 0.29, conversions: 40, cpa: 47.5 },
  ],
};

const lumaGoogle: PlatformMetrics = {
  spend: 12000, revenue: 50400, roas: 4.2, impressions: 1240000, clicks: 74400,
  ctr: 6.0, cpc: 0.16, conversions: 580, cpa: 20.7,
  monthlyData: [
    { month: "Nov '25", spend: 9800, revenue: 35280, conversions: 440 },
    { month: "Dec '25", spend: 13500, revenue: 56700, conversions: 660 },
    { month: "Jan '26", spend: 9200, revenue: 33120, conversions: 380 },
    { month: "Feb '26", spend: 10800, revenue: 43200, conversions: 520 },
    { month: "Mar '26", spend: 11500, revenue: 48300, conversions: 560 },
    { month: "Apr '26", spend: 12000, revenue: 50400, conversions: 580 },
  ],
  campaigns: [
    { id: 'lg1', name: 'Luma – Brand | Skincare', status: 'active', objective: 'Search', spend: 2200, revenue: 11000, roas: 5.0, impressions: 210000, clicks: 16800, ctr: 8.0, cpc: 0.13, conversions: 148, cpa: 14.9 },
    { id: 'lg2', name: 'Luma – Shopping | All Products', status: 'active', objective: 'Shopping', spend: 5800, revenue: 24360, roas: 4.2, impressions: 680000, clicks: 40800, ctr: 6.0, cpc: 0.14, conversions: 280, cpa: 20.7 },
    { id: 'lg3', name: 'Luma – Non-Brand | Anti-Aging', status: 'active', objective: 'Search', spend: 2400, revenue: 8880, roas: 3.7, impressions: 280000, clicks: 14000, ctr: 5.0, cpc: 0.17, conversions: 112, cpa: 21.4 },
    { id: 'lg4', name: 'Luma – YouTube | Product Reviews', status: 'active', objective: 'Video', spend: 1600, revenue: 6160, roas: 3.85, impressions: 70000, clicks: 2800, ctr: 4.0, cpc: 0.57, conversions: 40, cpa: 40.0 },
  ],
  searchTerms: [
    { term: 'luma skincare', matchType: 'Exact', impressions: 28000, clicks: 2800, ctr: 10.0, avgCpc: 0.10, conversions: 78, convRate: 2.8, spend: 280 },
    { term: 'best anti-aging serum uae', matchType: 'Phrase', impressions: 42000, clicks: 2940, ctr: 7.0, avgCpc: 0.18, conversions: 64, convRate: 2.2, spend: 529 },
    { term: 'buy moisturizer online dubai', matchType: 'Phrase', impressions: 35000, clicks: 2450, ctr: 7.0, avgCpc: 0.15, conversions: 52, convRate: 2.1, spend: 368 },
    { term: 'vitamin c serum for face', matchType: 'Broad', impressions: 68000, clicks: 2720, ctr: 4.0, avgCpc: 0.14, conversions: 38, convRate: 1.4, spend: 381 },
    { term: 'korean skincare routine', matchType: 'Broad', impressions: 89000, clicks: 1780, ctr: 2.0, avgCpc: 0.12, conversions: 12, convRate: 0.7, spend: 214 },
    { term: 'hyaluronic acid cream buy', matchType: 'Phrase', impressions: 24000, clicks: 1680, ctr: 7.0, avgCpc: 0.16, conversions: 45, convRate: 2.7, spend: 269 },
  ],
};

const lumaSnapchat: PlatformMetrics = {
  spend: 8000, revenue: 23200, roas: 2.9, impressions: 5800000, clicks: 40600,
  ctr: 0.7, cpc: 0.20, conversions: 264, cpa: 30.3,
  monthlyData: [
    { month: "Nov '25", spend: 6500, revenue: 17550, conversions: 195 },
    { month: "Dec '25", spend: 9500, revenue: 28500, conversions: 295 },
    { month: "Jan '26", spend: 6000, revenue: 15600, conversions: 168 },
    { month: "Feb '26", spend: 7200, revenue: 20160, conversions: 232 },
    { month: "Mar '26", spend: 7800, revenue: 22620, conversions: 258 },
    { month: "Apr '26", spend: 8000, revenue: 23200, conversions: 264 },
  ],
  campaigns: [
    { id: 'ls1', name: 'Luma – Snap Collection | Serums', status: 'active', objective: 'Conversions', spend: 3500, revenue: 11200, roas: 3.2, impressions: 2400000, clicks: 19200, ctr: 0.8, cpc: 0.18, conversions: 128, cpa: 27.3 },
    { id: 'ls2', name: 'Luma – Story Swipe | Moisturizers', status: 'active', objective: 'Traffic', spend: 2800, revenue: 7840, roas: 2.8, impressions: 2100000, clicks: 15750, ctr: 0.75, cpc: 0.18, conversions: 94, cpa: 29.8 },
    { id: 'ls3', name: 'Luma – Filter Ads | Brand Awareness', status: 'active', objective: 'Awareness', spend: 1700, revenue: 4160, roas: 2.4, impressions: 1300000, clicks: 5650, ctr: 0.43, cpc: 0.30, conversions: 42, cpa: 40.5 },
  ],
};

const lumaTikTok: PlatformMetrics = {
  spend: 7000, revenue: 21700, roas: 3.1, impressions: 6500000, clicks: 65000,
  ctr: 1.0, cpc: 0.11, conversions: 246, cpa: 28.5,
  monthlyData: [
    { month: "Nov '25", spend: 6700, revenue: 20770, conversions: 228 },
    { month: "Dec '25", spend: 8000, revenue: 27400, conversions: 265 },
    { month: "Jan '26", spend: 6800, revenue: 23800, conversions: 238 },
    { month: "Feb '26", spend: 6500, revenue: 26000, conversions: 230 },
    { month: "Mar '26", spend: 7200, revenue: 26260, conversions: 282 },
    { month: "Apr '26", spend: 7000, revenue: 21700, conversions: 246 },
  ],
  campaigns: [
    { id: 'lt1', name: 'Luma – Skincare Routine | Tutorial UGC', status: 'active', objective: 'Conversions', spend: 3200, revenue: 10880, roas: 3.4, impressions: 3100000, clicks: 31000, ctr: 1.0, cpc: 0.10, conversions: 126, cpa: 25.4 },
    { id: 'lt2', name: 'Luma – Before & After | Serum Results', status: 'active', objective: 'Conversions', spend: 2400, revenue: 7440, roas: 3.1, impressions: 2200000, clicks: 22000, ctr: 1.0, cpc: 0.11, conversions: 85, cpa: 28.2 },
    { id: 'lt3', name: 'Luma – TopView | Brand Launch', status: 'ended', objective: 'Awareness', spend: 1400, revenue: 3380, roas: 2.4, impressions: 1200000, clicks: 12000, ctr: 1.0, cpc: 0.12, conversions: 35, cpa: 40.0 },
  ],
};

const lumaInsights: Insight[] = [
  { id: 'li1', status: 'success', platform: 'Google Ads', category: 'ROAS', title: 'Google Shopping Exceeding Target', description: 'Google Shopping campaigns are delivering 4.2× ROAS, exceeding your 3.5× target. Brand campaigns are the most efficient at 5.0×.', recommendation: 'Increase Google Shopping budget by 20% and enable Smart Bidding (Target ROAS) if not already active.', currentValue: '4.2×', targetValue: '3.5×' },
  { id: 'li2', status: 'success', platform: 'Meta Ads', category: 'ROAS', title: 'Meta Retargeting Performing Well', description: 'Meta retargeting campaigns are at 4.5× ROAS — well above your 3.5× target. Lookalike audiences are close to target.', recommendation: 'Expand retargeting window from 30 to 60 days and test Advantage+ Shopping campaigns.', currentValue: '3.8×', targetValue: '3.5×' },
  { id: 'li3', status: 'warning', platform: 'Snapchat Ads', category: 'ROAS', title: 'Snapchat Slightly Below Target', description: 'Snapchat is at 2.9× ROAS, slightly below your 3.5× target. The Awareness campaign has a high frequency causing creative fatigue.', recommendation: 'Pause the Awareness campaign, refresh creatives every 2 weeks, and focus budget on Collection ads.', currentValue: '2.9×', targetValue: '3.5×' },
  { id: 'li4', status: 'warning', platform: 'TikTok Ads', category: 'ROAS', title: 'TikTok Below Target But Improving', description: 'TikTok ROAS is 3.1×, below your 3.5× target. The brand launch TopView campaign (ended) dragged overall ROAS down.', recommendation: 'Scale the Tutorial UGC campaign which is performing at 3.4× ROAS. Test spark ads with influencer content.', currentValue: '3.1×', targetValue: '3.5×' },
  { id: 'li5', status: 'danger', platform: 'Snapchat Ads', category: 'CTR', title: 'Snapchat CTR Critically Low', description: 'Snapchat CTR is averaging 0.7%, well below the expected 1.5–2% for DTC beauty brands. The Filter Ads campaign is only 0.43% CTR.', recommendation: 'Immediate creative refresh needed. Test vertical video formats and swipe-up stories instead of filters.', currentValue: '0.7%', targetValue: '1.5%' },
  { id: 'li6', status: 'warning', platform: 'Meta Ads', category: 'Creative', title: 'Video Views Campaign Inefficient', description: 'The Brand Story video campaign has a CPA of AED 47.5, nearly double your AED 23.1 average. The campaign is currently paused.', recommendation: 'Redirect this budget to Lookalike 1% campaign which is proving more efficient.', currentValue: 'AED 47.5', targetValue: 'AED 23.1' },
];

// ─── CLIENT 3: Gulf Motors ─────────────────────────────────────────────────────
const gulfMonthly: MonthlyData[] = [
  { month: "Nov '25", spend: 26000, revenue: 78000, conversions: 72 },
  { month: "Dec '25", spend: 31000, revenue: 99200, conversions: 88 },
  { month: "Jan '26", spend: 24000, revenue: 67200, conversions: 64 },
  { month: "Feb '26", spend: 27500, revenue: 82500, conversions: 78 },
  { month: "Mar '26", spend: 29000, revenue: 87000, conversions: 83 },
  { month: "Apr '26", spend: 29500, revenue: 92350, conversions: 91 },
];

const gulfMeta: PlatformMetrics = {
  spend: 12000, revenue: 42000, roas: 3.5, impressions: 2400000, clicks: 48000,
  ctr: 2.0, cpc: 0.25, conversions: 42, cpa: 285.7,
  monthlyData: [
    { month: "Nov '25", spend: 10000, revenue: 32000, conversions: 32 },
    { month: "Dec '25", spend: 12500, revenue: 43750, conversions: 38 },
    { month: "Jan '26", spend: 9500, revenue: 28500, conversions: 28 },
    { month: "Feb '26", spend: 11000, revenue: 38500, conversions: 34 },
    { month: "Mar '26", spend: 11500, revenue: 40250, conversions: 38 },
    { month: "Apr '26", spend: 12000, revenue: 42000, conversions: 42 },
  ],
  campaigns: [
    { id: 'gm1', name: 'Gulf Motors – Lead Gen | SUV Lineup', status: 'active', objective: 'Lead Generation', spend: 4800, revenue: 20160, roas: 4.2, impressions: 980000, clicks: 21560, ctr: 2.2, cpc: 0.22, conversions: 19, cpa: 252.6 },
    { id: 'gm2', name: 'Gulf Motors – Lead Gen | Luxury Sedan', status: 'active', objective: 'Lead Generation', spend: 4200, revenue: 16800, roas: 4.0, impressions: 840000, clicks: 16800, ctr: 2.0, cpc: 0.25, conversions: 14, cpa: 300.0 },
    { id: 'gm3', name: 'Gulf Motors – Retargeting | Test Drive', status: 'active', objective: 'Lead Generation', spend: 2000, revenue: 8000, roas: 4.0, impressions: 380000, clicks: 7600, ctr: 2.0, cpc: 0.26, conversions: 7, cpa: 285.7 },
    { id: 'gm4', name: 'Gulf Motors – Brand Awareness | Video', status: 'paused', objective: 'Awareness', spend: 1000, revenue: 3040, roas: 3.0, impressions: 200000, clicks: 2040, ctr: 1.0, cpc: 0.49, conversions: 2, cpa: 500.0 },
  ],
};

const gulfGoogle: PlatformMetrics = {
  spend: 11000, revenue: 36300, roas: 3.3, impressions: 680000, clicks: 27200,
  ctr: 4.0, cpc: 0.40, conversions: 31, cpa: 354.8,
  monthlyData: [
    { month: "Nov '25", spend: 9200, revenue: 27600, conversions: 25 },
    { month: "Dec '25", spend: 11200, revenue: 39200, conversions: 31 },
    { month: "Jan '26", spend: 8800, revenue: 24640, conversions: 22 },
    { month: "Feb '26", spend: 10200, revenue: 30600, conversions: 28 },
    { month: "Mar '26", spend: 10800, revenue: 35640, conversions: 30 },
    { month: "Apr '26", spend: 11000, revenue: 36300, conversions: 31 },
  ],
  campaigns: [
    { id: 'gg1', name: 'Gulf Motors – Brand | Car Dealership KSA', status: 'active', objective: 'Search', spend: 3500, revenue: 14000, roas: 4.0, impressions: 210000, clicks: 10500, ctr: 5.0, cpc: 0.33, conversions: 12, cpa: 291.7 },
    { id: 'gg2', name: 'Gulf Motors – Non-Brand | Luxury Cars', status: 'active', objective: 'Search', spend: 4800, revenue: 14400, roas: 3.0, impressions: 320000, clicks: 12800, ctr: 4.0, cpc: 0.38, conversions: 13, cpa: 369.2 },
    { id: 'gg3', name: 'Gulf Motors – Display | Retargeting', status: 'active', objective: 'Display', spend: 2700, revenue: 7830, roas: 2.9, impressions: 150000, clicks: 3900, ctr: 2.6, cpc: 0.69, conversions: 6, cpa: 450.0 },
  ],
  searchTerms: [
    { term: 'new cars for sale saudi arabia', matchType: 'Phrase', impressions: 42000, clicks: 2940, ctr: 7.0, avgCpc: 0.38, conversions: 8, convRate: 0.27, spend: 1117 },
    { term: 'luxury suv ksa', matchType: 'Broad', impressions: 28000, clicks: 1960, ctr: 7.0, avgCpc: 0.42, conversions: 5, convRate: 0.26, spend: 823 },
    { term: 'toyota dealer riyadh', matchType: 'Exact', impressions: 18000, clicks: 1440, ctr: 8.0, avgCpc: 0.30, conversions: 4, convRate: 0.28, spend: 432 },
    { term: 'car showroom near me', matchType: 'Broad', impressions: 65000, clicks: 1950, ctr: 3.0, avgCpc: 0.44, conversions: 2, convRate: 0.1, spend: 858 },
    { term: 'buy bmw series 5 ksa', matchType: 'Phrase', impressions: 12000, clicks: 1080, ctr: 9.0, avgCpc: 0.55, conversions: 3, convRate: 0.28, spend: 594 },
  ],
};

const gulfSnapchat: PlatformMetrics = {
  spend: 4000, revenue: 9600, roas: 2.4, impressions: 3200000, clicks: 22400,
  ctr: 0.7, cpc: 0.18, conversions: 10, cpa: 400.0,
  monthlyData: [
    { month: "Nov '25", spend: 3500, revenue: 7350, conversions: 8 },
    { month: "Dec '25", spend: 4500, revenue: 10350, conversions: 11 },
    { month: "Jan '26", spend: 3200, revenue: 6400, conversions: 7 },
    { month: "Feb '26", spend: 3700, revenue: 8510, conversions: 9 },
    { month: "Mar '26", spend: 3800, revenue: 8740, conversions: 9 },
    { month: "Apr '26", spend: 4000, revenue: 9600, conversions: 10 },
  ],
  campaigns: [
    { id: 'gs1', name: 'Gulf Motors – Snap Video | SUV Launch', status: 'active', objective: 'Lead Generation', spend: 2500, revenue: 6250, roas: 2.5, impressions: 2000000, clicks: 14000, ctr: 0.7, cpc: 0.18, conversions: 6, cpa: 416.7 },
    { id: 'gs2', name: 'Gulf Motors – Story Ads | Car Finance', status: 'active', objective: 'Lead Generation', spend: 1500, revenue: 3350, roas: 2.2, impressions: 1200000, clicks: 8400, ctr: 0.7, cpc: 0.18, conversions: 4, cpa: 375.0 },
  ],
};

const gulfTikTok: PlatformMetrics = {
  spend: 2500, revenue: 4450, roas: 1.8, impressions: 4800000, clicks: 48000,
  ctr: 1.0, cpc: 0.052, conversions: 8, cpa: 312.5,
  monthlyData: [
    { month: "Nov '25", spend: 3300, revenue: 11550, conversions: 7 },
    { month: "Dec '25", spend: 2800, revenue: 5900, conversions: 8 },
    { month: "Jan '26", spend: 2500, revenue: 8500, conversions: 7 },
    { month: "Feb '26", spend: 2600, revenue: 4900, conversions: 7 },
    { month: "Mar '26", spend: 2900, revenue: 2370, conversions: 6 },
    { month: "Apr '26", spend: 2500, revenue: 4450, conversions: 8 },
  ],
  campaigns: [
    { id: 'gt1', name: 'Gulf Motors – Car Reveal | New Model', status: 'active', objective: 'Lead Generation', spend: 1600, revenue: 2880, roas: 1.8, impressions: 3200000, clicks: 32000, ctr: 1.0, cpc: 0.05, conversions: 5, cpa: 320.0 },
    { id: 'gt2', name: 'Gulf Motors – Testimonials | Happy Buyers', status: 'active', objective: 'Lead Generation', spend: 900, revenue: 1570, roas: 1.7, impressions: 1600000, clicks: 16000, ctr: 1.0, cpc: 0.056, conversions: 3, cpa: 300.0 },
  ],
};

const gulfInsights: Insight[] = [
  { id: 'gi1', status: 'success', platform: 'Meta Ads', category: 'CPA', title: 'Meta Ads CPA Below Target', description: 'Meta Ads CPA is SAR 285, 43% below your SAR 500 target. The SUV Lineup campaign is the most efficient at SAR 252 CPA.', recommendation: 'Increase Meta budget by 15–20% and test new lead form formats with fewer fields to improve conversion rate.', currentValue: 'SAR 285', targetValue: 'SAR 500' },
  { id: 'gi2', status: 'warning', platform: 'Google Ads', category: 'CPA', title: 'Google Ads CPA Within Acceptable Range', description: 'Google Ads CPA is SAR 354, within 30% of your SAR 500 target. Display retargeting is dragging down efficiency at SAR 450 CPA.', recommendation: 'Pause display retargeting and shift budget to brand search campaigns which are performing at SAR 291 CPA.', currentValue: 'SAR 354', targetValue: 'SAR 500' },
  { id: 'gi3', status: 'danger', platform: 'TikTok Ads', category: 'ROAS', title: 'TikTok ROAS Very Low', description: 'TikTok is achieving only 1.8× ROAS, far below your 2.0× target. The platform may not be well-suited for automotive lead gen with this audience.', recommendation: 'Consider pausing TikTok and reallocating the SAR 2,500 budget to Meta or Google. Test one more month before pausing.', currentValue: '1.8×', targetValue: '2.0×' },
  { id: 'gi4', status: 'warning', platform: 'Snapchat Ads', category: 'CPA', title: 'Snapchat CPA At Target Limit', description: 'Snapchat CPA is SAR 400, 20% below target but with very low conversion volumes. Only 10 leads generated this month.', recommendation: 'Test Snap Lead Generation forms natively (without redirecting to website) to improve conversion rates.', currentValue: 'SAR 400', targetValue: 'SAR 500' },
  { id: 'gi5', status: 'warning', platform: 'Google Ads', category: 'CTR', title: 'Display Campaign Low Performance', description: 'Google Display retargeting has a 2.6% CTR and a CPA of SAR 450. This is the least efficient campaign in the account.', recommendation: 'Refresh display ad creative with new car imagery and include a strong CTA (Book a Test Drive). Test responsive display ads.', currentValue: 'SAR 450 CPA', targetValue: 'SAR 300 CPA' },
];

// ─── CLIENT 4: EduPath Academy ─────────────────────────────────────────────────
const edupathMonthly: MonthlyData[] = [
  { month: "Nov '25", spend: 7200, revenue: 28800, conversions: 462 },
  { month: "Dec '25", spend: 6800, revenue: 23800, conversions: 408 },
  { month: "Jan '26", spend: 8200, revenue: 36900, conversions: 540 },
  { month: "Feb '26", spend: 7900, revenue: 34770, conversions: 512 },
  { month: "Mar '26", spend: 8000, revenue: 33600, conversions: 490 },
  { month: "Apr '26", spend: 0, revenue: 0, conversions: 0 },
];

const edupathMeta: PlatformMetrics = {
  spend: 3200, revenue: 14080, roas: 4.4, impressions: 1840000, clicks: 55200,
  ctr: 3.0, cpc: 0.058, conversions: 195, cpa: 16.4,
  monthlyData: [
    { month: "Nov '25", spend: 2800, revenue: 11200, conversions: 172 },
    { month: "Dec '25", spend: 2600, revenue: 9100, conversions: 148 },
    { month: "Jan '26", spend: 3400, revenue: 15300, conversions: 218 },
    { month: "Feb '26", spend: 3100, revenue: 13640, conversions: 204 },
    { month: "Mar '26", spend: 3200, revenue: 14080, conversions: 195 },
    { month: "Apr '26", spend: 0, revenue: 0, conversions: 0 },
  ],
  campaigns: [
    { id: 'em1', name: 'EduPath – Lead Gen | Free Trial | AE', status: 'paused', objective: 'Lead Generation', spend: 1400, revenue: 6440, roas: 4.6, impressions: 840000, clicks: 25200, ctr: 3.0, cpc: 0.056, conversions: 90, cpa: 15.6 },
    { id: 'em2', name: 'EduPath – Retargeting | Trial to Paid', status: 'paused', objective: 'Conversions', spend: 980, revenue: 4900, roas: 5.0, impressions: 580000, clicks: 17400, ctr: 3.0, cpc: 0.056, conversions: 64, cpa: 15.3 },
    { id: 'em3', name: 'EduPath – Lookalike | Student Buyers', status: 'paused', objective: 'Lead Generation', spend: 820, revenue: 2740, roas: 3.3, impressions: 420000, clicks: 12600, ctr: 3.0, cpc: 0.065, conversions: 41, cpa: 20.0 },
  ],
};

const edupathGoogle: PlatformMetrics = {
  spend: 2800, revenue: 11200, roas: 4.0, impressions: 620000, clicks: 37200,
  ctr: 6.0, cpc: 0.075, conversions: 156, cpa: 17.9,
  monthlyData: [
    { month: "Nov '25", spend: 2600, revenue: 9620, conversions: 140 },
    { month: "Dec '25", spend: 2400, revenue: 8160, conversions: 125 },
    { month: "Jan '26", spend: 3100, revenue: 13330, conversions: 178 },
    { month: "Feb '26", spend: 2900, revenue: 12760, conversions: 166 },
    { month: "Mar '26", spend: 2800, revenue: 11200, conversions: 156 },
    { month: "Apr '26", spend: 0, revenue: 0, conversions: 0 },
  ],
  campaigns: [
    { id: 'eg1', name: 'EduPath – Brand | Online Learning', status: 'paused', objective: 'Search', spend: 900, revenue: 4500, roas: 5.0, impressions: 180000, clicks: 14400, ctr: 8.0, cpc: 0.063, conversions: 65, cpa: 13.8 },
    { id: 'eg2', name: 'EduPath – Non-Brand | E-Learning Courses', status: 'paused', objective: 'Search', spend: 1400, revenue: 4760, roas: 3.4, impressions: 310000, clicks: 15500, ctr: 5.0, cpc: 0.090, conversions: 68, cpa: 20.6 },
    { id: 'eg3', name: 'EduPath – YouTube | Course Demos', status: 'paused', objective: 'Video', spend: 500, revenue: 1940, roas: 3.9, impressions: 130000, clicks: 7300, ctr: 5.6, cpc: 0.068, conversions: 23, cpa: 21.7 },
  ],
  searchTerms: [
    { term: 'edupath online courses', matchType: 'Exact', impressions: 22000, clicks: 2200, ctr: 10.0, avgCpc: 0.05, conversions: 48, convRate: 2.2, spend: 110 },
    { term: 'free online learning platform', matchType: 'Broad', impressions: 58000, clicks: 2320, ctr: 4.0, avgCpc: 0.08, conversions: 22, convRate: 0.95, spend: 186 },
    { term: 'online certificate courses uae', matchType: 'Phrase', impressions: 31000, clicks: 2170, ctr: 7.0, avgCpc: 0.09, conversions: 35, convRate: 1.6, spend: 195 },
    { term: 'learn coding online free trial', matchType: 'Phrase', impressions: 24000, clicks: 1680, ctr: 7.0, avgCpc: 0.07, conversions: 28, convRate: 1.7, spend: 118 },
    { term: 'best e-learning app', matchType: 'Broad', impressions: 74000, clicks: 1480, ctr: 2.0, avgCpc: 0.09, conversions: 8, convRate: 0.5, spend: 133 },
  ],
};

const edupathSnapchat: PlatformMetrics = {
  spend: 1200, revenue: 3720, roas: 3.1, impressions: 1400000, clicks: 9800,
  ctr: 0.7, cpc: 0.12, conversions: 60, cpa: 20.0,
  monthlyData: [
    { month: "Nov '25", spend: 1100, revenue: 3190, conversions: 54 },
    { month: "Dec '25", spend: 1000, revenue: 2700, conversions: 48 },
    { month: "Jan '26", spend: 1200, revenue: 3840, conversions: 64 },
    { month: "Feb '26", spend: 1100, revenue: 3410, conversions: 58 },
    { month: "Mar '26", spend: 1200, revenue: 3720, conversions: 60 },
    { month: "Apr '26", spend: 0, revenue: 0, conversions: 0 },
  ],
  campaigns: [
    { id: 'es1', name: 'EduPath – Snap Ads | Free Trial Promo', status: 'paused', objective: 'Lead Generation', spend: 700, revenue: 2240, roas: 3.2, impressions: 840000, clicks: 5880, ctr: 0.7, cpc: 0.12, conversions: 37, cpa: 18.9 },
    { id: 'es2', name: 'EduPath – Story Swipe | Courses', status: 'paused', objective: 'Traffic', spend: 500, revenue: 1480, roas: 3.0, impressions: 560000, clicks: 3920, ctr: 0.7, cpc: 0.13, conversions: 23, cpa: 21.7 },
  ],
};

const edupathTikTok: PlatformMetrics = {
  spend: 800, revenue: 1680, roas: 2.1, impressions: 2200000, clicks: 22000,
  ctr: 1.0, cpc: 0.036, conversions: 35, cpa: 22.9,
  monthlyData: [
    { month: "Nov '25", spend: 700, revenue: 2170, conversions: 96 },
    { month: "Dec '25", spend: 800, revenue: 3840, conversions: 87 },
    { month: "Jan '26", spend: 1500, revenue: 4500, conversions: 80 },
    { month: "Feb '26", spend: 800, revenue: 4960, conversions: 84 },
    { month: "Mar '26", spend: 800, revenue: 4600, conversions: 79 },
    { month: "Apr '26", spend: 0, revenue: 0, conversions: 0 },
  ],
  campaigns: [
    { id: 'et1', name: 'EduPath – TikTok Spark Ads | Student Story', status: 'paused', objective: 'Lead Generation', spend: 500, revenue: 1100, roas: 2.2, impressions: 1400000, clicks: 14000, ctr: 1.0, cpc: 0.036, conversions: 22, cpa: 22.7 },
    { id: 'et2', name: 'EduPath – In-Feed | Course Preview', status: 'paused', objective: 'Traffic', spend: 300, revenue: 580, roas: 1.9, impressions: 800000, clicks: 8000, ctr: 1.0, cpc: 0.038, conversions: 13, cpa: 23.1 },
  ],
};

const edupathInsights: Insight[] = [
  { id: 'ei1', status: 'warning', platform: 'All Platforms', category: 'General', title: 'Account Currently Paused', description: 'All campaigns have been paused since May 1, 2026. The metrics shown reflect the last active period (March 2026).', recommendation: 'Review budget and targeting before resuming. Consider starting with Meta and Google only at reduced budgets.', currentValue: 'Paused', targetValue: 'Active' },
  { id: 'ei2', status: 'success', platform: 'Meta Ads', category: 'CPA', title: 'Meta CPA Near Target (Last Period)', description: 'Last active period: Meta CPA was $16.4, close to your $15 target. Retargeting campaigns performed best at $15.3 CPA.', recommendation: 'When resuming, prioritize retargeting campaigns first and gradually scale lead gen.', currentValue: '$16.4', targetValue: '$15' },
  { id: 'ei3', status: 'success', platform: 'Google Ads', category: 'CPA', title: 'Google Brand Campaign Very Efficient', description: 'Brand search campaigns achieved a $13.8 CPA, below your $15 target. Strong performance before pause.', recommendation: 'Resume brand campaigns immediately when reactivating — highest efficiency, lowest risk.', currentValue: '$13.8', targetValue: '$15' },
  { id: 'ei4', status: 'danger', platform: 'TikTok Ads', category: 'CPA', title: 'TikTok CPA Above Target', description: 'TikTok CPA was $22.9, 53% above your $15 target. The platform was not converting efficiently.', recommendation: 'Consider keeping TikTok paused even after account resumes. Reallocate that budget to Google or Meta.', currentValue: '$22.9', targetValue: '$15' },
  { id: 'ei5', status: 'warning', platform: 'All Platforms', category: 'Budget', title: 'Budget Reallocation Opportunity', description: 'Pre-pause analysis shows Google (18%) and Meta (26%) are over-delivering on CPA goals, while TikTok (53%) is under-performing.', recommendation: 'Reallocate TikTok budget to Google: +$400 to Google, +$400 to Meta. This could reduce blended CPA by ~8%.', currentValue: '$18.6 blended CPA', targetValue: '$15' },
];

// ─── CLIENTS ARRAY ─────────────────────────────────────────────────────────────
export const clients: Client[] = [
  {
    id: 'techstore-arabia',
    name: 'TechStore Arabia',
    industry: 'E-commerce Electronics',
    color: '#3B82F6',
    initials: 'TA',
    status: 'active',
    currency: 'USD',
    currencySymbol: '$',
    targetROAS: 4.0,
    targetCPA: 25,
    monthlyBudget: 15000,
    businessModel: 'E-commerce',
    mainConversionEvent: 'Purchase',
    website: 'www.techstore.ae',
    contactName: 'Ahmed Al-Rashidi',
    contactEmail: 'ahmed@techstore.ae',
    totalSpend: 15000,
    totalRevenue: 64560,
    totalConversions: 1210,
    totalImpressions: 8300000,
    roas: 4.3,
    cpa: 12.4,
    ctr: 1.73,
    monthlyData: techstoreMonthly,
    platforms: { meta: techstoreMeta, google: techstoreGoogle, snapchat: techstoreSnapchat, tiktok: techstoreTikTok },
    insights: techstoreInsights,
  },
  {
    id: 'luma-skincare',
    name: 'Luma Skincare',
    industry: 'Beauty & Skincare',
    color: '#EC4899',
    initials: 'LS',
    status: 'active',
    currency: 'AED',
    currencySymbol: 'AED ',
    targetROAS: 3.5,
    targetCPA: 80,
    monthlyBudget: 45000,
    businessModel: 'DTC E-commerce',
    mainConversionEvent: 'Purchase',
    website: 'www.lumaskincare.com',
    contactName: 'Sara Khalil',
    contactEmail: 'sara@lumaskincare.com',
    totalSpend: 45000,
    totalRevenue: 163700,
    totalConversions: 1870,
    totalImpressions: 18500000,
    roas: 3.64,
    cpa: 24.1,
    ctr: 1.28,
    monthlyData: lumaMonthly,
    platforms: { meta: lumaMeta, google: lumaGoogle, snapchat: lumaSnapchat, tiktok: lumaTikTok },
    insights: lumaInsights,
  },
  {
    id: 'gulf-motors',
    name: 'Gulf Motors',
    industry: 'Automotive Dealership',
    color: '#F59E0B',
    initials: 'GM',
    status: 'active',
    currency: 'SAR',
    currencySymbol: 'SAR ',
    targetROAS: 2.0,
    targetCPA: 500,
    monthlyBudget: 30000,
    businessModel: 'Lead Generation',
    mainConversionEvent: 'Lead Form Submission',
    website: 'www.gulfmotors.sa',
    contactName: 'Khalid Al-Otaibi',
    contactEmail: 'khalid@gulfmotors.sa',
    totalSpend: 29500,
    totalRevenue: 92350,
    totalConversions: 91,
    totalImpressions: 10480000,
    roas: 3.13,
    cpa: 324.2,
    ctr: 1.39,
    monthlyData: gulfMonthly,
    platforms: { meta: gulfMeta, google: gulfGoogle, snapchat: gulfSnapchat, tiktok: gulfTikTok },
    insights: gulfInsights,
  },
  {
    id: 'edupath-academy',
    name: 'EduPath Academy',
    industry: 'EdTech / Online Learning',
    color: '#10B981',
    initials: 'EP',
    status: 'paused',
    currency: 'USD',
    currencySymbol: '$',
    targetROAS: 0,
    targetCPA: 15,
    monthlyBudget: 8000,
    businessModel: 'SaaS / Subscription',
    mainConversionEvent: 'Free Trial Signup',
    website: 'www.edupathacademy.com',
    contactName: 'Nour Hassan',
    contactEmail: 'nour@edupathacademy.com',
    totalSpend: 8000,
    totalRevenue: 30700,
    totalConversions: 446,
    totalImpressions: 5620000,
    roas: 3.84,
    cpa: 17.9,
    ctr: 1.77,
    monthlyData: edupathMonthly,
    platforms: { meta: edupathMeta, google: edupathGoogle, snapchat: edupathSnapchat, tiktok: edupathTikTok },
    insights: edupathInsights,
  },
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
export function formatCurrency(amount: number, symbol: string, compact = false): string {
  if (compact) {
    if (amount >= 1000000) return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`;
    return `${symbol}${amount.toFixed(0)}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatNumber(num: number, compact = false): string {
  if (compact) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  }
  return num.toLocaleString('en-US');
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function getROASColor(roas: number, target: number): string {
  if (target === 0) return 'text-slate-700';
  const ratio = roas / target;
  if (ratio >= 1.0) return 'text-emerald-600';
  if (ratio >= 0.85) return 'text-amber-600';
  return 'text-red-600';
}

export function getROASBg(roas: number, target: number): string {
  if (target === 0) return 'bg-slate-100 text-slate-700';
  const ratio = roas / target;
  if (ratio >= 1.0) return 'bg-emerald-50 text-emerald-700';
  if (ratio >= 0.85) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

export function getCPAColor(cpa: number, target: number): string {
  if (target === 0) return 'text-slate-700';
  const ratio = cpa / target;
  if (ratio <= 1.0) return 'text-emerald-600';
  if (ratio <= 1.2) return 'text-amber-600';
  return 'text-red-600';
}

export function getCPABg(cpa: number, target: number): string {
  if (target === 0) return 'bg-slate-100 text-slate-700';
  const ratio = cpa / target;
  if (ratio <= 1.0) return 'bg-emerald-50 text-emerald-700';
  if (ratio <= 1.2) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}
