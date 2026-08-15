export interface AdAccount {
  platform: 'meta' | 'google' | 'snapchat' | 'tiktok';
  connected: boolean;
  accountId: string;
  accountName: string;
  timezone: string;
  currency: string;
  status: 'active' | 'paused' | 'limited' | 'disabled';
  lastSynced: string;
  monthlySpendCap?: number;
  // Platform-specific IDs
  businessManagerId?: string;
  businessManagerName?: string;
  customerId?: string;
  mccAccountId?: string;
  organizationId?: string;
  businessCenterId?: string;
  advertiserId?: string;
}

const SYNCED_TODAY = 'Today, 09:30 AM';

export const clientAdAccounts: Record<string, AdAccount[]> = {
  'techstore-arabia': [
    {
      platform: 'meta', connected: true, status: 'active',
      accountId: 'act_2847361058293',
      accountName: 'TechStore Arabia – Main',
      businessManagerId: '1029384756201',
      businessManagerName: 'DigitalEdge Agency BM',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 20000,
      lastSynced: SYNCED_TODAY,
    },
    {
      platform: 'google', connected: true, status: 'active',
      accountId: '814-293-0571',
      accountName: 'TechStore Arabia',
      customerId: '814-293-0571',
      mccAccountId: '000-111-2349',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 22000,
      lastSynced: 'Today, 09:28 AM',
    },
    {
      platform: 'snapchat', connected: true, status: 'active',
      accountId: 'adacc_e7f21b9c4a038d5',
      accountName: 'TechStore Arabia Snap',
      organizationId: 'org_b3c891fa720de4a',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 5000,
      lastSynced: 'Today, 09:25 AM',
    },
    {
      platform: 'tiktok', connected: true, status: 'active',
      accountId: '7123456789012345678',
      accountName: 'TechStore Arabia TT',
      businessCenterId: '7098765432109876543',
      advertiserId: '7123456789012345678',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 5000,
      lastSynced: 'Today, 09:22 AM',
    },
  ],

  'luma-skincare': [
    {
      platform: 'meta', connected: true, status: 'active',
      accountId: 'act_5591836204710',
      accountName: 'Luma Skincare Official',
      businessManagerId: '3847261059382',
      businessManagerName: 'DigitalEdge Agency BM',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'AED',
      monthlySpendCap: 55000,
      lastSynced: SYNCED_TODAY,
    },
    {
      platform: 'google', connected: true, status: 'active',
      accountId: '293-841-7650',
      accountName: 'Luma Skincare',
      customerId: '293-841-7650',
      mccAccountId: '000-111-2349',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'AED',
      monthlySpendCap: 40000,
      lastSynced: 'Today, 09:26 AM',
    },
    {
      platform: 'snapchat', connected: true, status: 'limited',
      accountId: 'adacc_c4a9e2f71b038d6',
      accountName: 'Luma Skincare Snap',
      organizationId: 'org_f1a892bc730de5b',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'AED',
      monthlySpendCap: 12000,
      lastSynced: 'Today, 09:20 AM',
    },
    {
      platform: 'tiktok', connected: true, status: 'active',
      accountId: '7234567890123456789',
      accountName: 'Luma Skincare TT',
      businessCenterId: '7109876543210987654',
      advertiserId: '7234567890123456789',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'AED',
      monthlySpendCap: 10000,
      lastSynced: 'Today, 09:18 AM',
    },
  ],

  'gulf-motors': [
    {
      platform: 'meta', connected: true, status: 'active',
      accountId: 'act_8374920163847',
      accountName: 'Gulf Motors KSA',
      businessManagerId: '5629381047293',
      businessManagerName: 'DigitalEdge Agency BM',
      timezone: 'Asia/Riyadh (GMT+3)',
      currency: 'SAR',
      monthlySpendCap: 18000,
      lastSynced: SYNCED_TODAY,
    },
    {
      platform: 'google', connected: true, status: 'active',
      accountId: '472-930-1856',
      accountName: 'Gulf Motors Saudi Arabia',
      customerId: '472-930-1856',
      mccAccountId: '000-111-2349',
      timezone: 'Asia/Riyadh (GMT+3)',
      currency: 'SAR',
      monthlySpendCap: 15000,
      lastSynced: 'Today, 09:24 AM',
    },
    {
      platform: 'snapchat', connected: true, status: 'active',
      accountId: 'adacc_a1b2c3d4e5f6g7h8',
      accountName: 'Gulf Motors Snap',
      organizationId: 'org_h8g7f6e5d4c3b2a1',
      timezone: 'Asia/Riyadh (GMT+3)',
      currency: 'SAR',
      monthlySpendCap: 6000,
      lastSynced: 'Today, 09:15 AM',
    },
    {
      platform: 'tiktok', connected: false, status: 'disabled',
      accountId: '—',
      accountName: 'Not Connected',
      timezone: '—',
      currency: 'SAR',
      lastSynced: 'Never',
    },
  ],

  'edupath-academy': [
    {
      platform: 'meta', connected: true, status: 'paused',
      accountId: 'act_6192837465019',
      accountName: 'EduPath Academy – Main',
      businessManagerId: '8374619205847',
      businessManagerName: 'DigitalEdge Agency BM',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 10000,
      lastSynced: 'May 1, 2026 08:00 AM',
    },
    {
      platform: 'google', connected: true, status: 'paused',
      accountId: '651-029-3847',
      accountName: 'EduPath Academy',
      customerId: '651-029-3847',
      mccAccountId: '000-111-2349',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 10000,
      lastSynced: 'May 1, 2026 08:00 AM',
    },
    {
      platform: 'snapchat', connected: true, status: 'paused',
      accountId: 'adacc_z9y8x7w6v5u4t3s2',
      accountName: 'EduPath Academy Snap',
      organizationId: 'org_s2t3u4v5w6x7y8z9',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 2000,
      lastSynced: 'May 1, 2026 08:00 AM',
    },
    {
      platform: 'tiktok', connected: true, status: 'paused',
      accountId: '7345678901234567890',
      accountName: 'EduPath Academy TT',
      businessCenterId: '7210987654321098765',
      advertiserId: '7345678901234567890',
      timezone: 'Asia/Dubai (GMT+4)',
      currency: 'USD',
      monthlySpendCap: 1500,
      lastSynced: 'May 1, 2026 08:00 AM',
    },
  ],
};
