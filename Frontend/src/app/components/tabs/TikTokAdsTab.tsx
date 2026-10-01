import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Client, formatCurrency, formatNumber, formatPercent, getROASBg, getCPABg } from '../../data/mockData';
import { RefreshCw, ExternalLink } from 'lucide-react';

const TIKTOK_RED = '#FF0050';
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border border-amber-200',
  ended: 'bg-slate-100 text-slate-500 border border-slate-200',
};

function KPICard({ title, value, subtext, highlight }: {
  title: string; value: string; subtext?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
      <p className="text-slate-500 text-xs mb-2" style={{ fontWeight: 500 }}>{title}</p>
      <p className={`text-xl ${highlight ? 'text-rose-700' : 'text-slate-800'}`} style={{ fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {subtext && <p className="text-slate-400 text-xs mt-1">{subtext}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, sym }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-slate-600 mb-2" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="text-slate-800" style={{ fontWeight: 600 }}>{sym}{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

function TikTokIcon() {
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#010101' }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.22 6.22 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.8 1.54V6.79a4.85 4.85 0 0 1-1.03-.1z" />
      </svg>
    </div>
  );
}

export default function TikTokAdsTab({ client }: { client: Client }) {
  const d = client.platforms.tiktok;
  const sym = client.currencySymbol;
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1600); };

  const kpis = [
    { title: 'Spend', value: formatCurrency(d.spend, sym), subtext: `${((d.spend / client.totalSpend) * 100).toFixed(0)}% of total` },
    { title: 'Revenue', value: formatCurrency(d.revenue, sym), subtext: client.mainConversionEvent },
    { title: 'ROAS', value: client.targetROAS === 0 ? 'N/A' : `${d.roas.toFixed(2)}×`, subtext: `Target: ${client.targetROAS}×` },
    { title: 'Impressions', value: formatNumber(d.impressions, true) },
    { title: 'Clicks', value: formatNumber(d.clicks, true) },
    { title: 'CTR', value: formatPercent(d.ctr), subtext: d.ctr >= 1.5 ? '✓ Strong' : d.ctr >= 0.8 ? '~ Average' : '↓ Low' },
    { title: 'eCPC', value: formatCurrency(d.cpc, sym), subtext: 'Efficient reach' },
    { title: 'Conversions', value: formatNumber(d.conversions), subtext: client.mainConversionEvent },
    { title: 'CPA', value: formatCurrency(d.cpa, sym), subtext: `Target: ${formatCurrency(client.targetCPA, sym)}` },
  ];

  return (
    <div className="space-y-5">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <TikTokIcon />
        <div>
          <h3 className="text-slate-800">TikTok Ads Performance</h3>
          <p className="text-slate-500 text-sm mt-0.5">In-Feed Ads · TopView · Spark Ads · April 2026</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-lg ${getROASBg(d.roas, client.targetROAS)}`} style={{ fontWeight: 600 }}>
            ROAS {client.targetROAS === 0 ? 'N/A' : `${d.roas.toFixed(1)}×`}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-lg ${getCPABg(d.cpa, client.targetCPA)}`} style={{ fontWeight: 600 }}>
            CPA {formatCurrency(d.cpa, sym)}
          </span>
          <button onClick={handleRefresh}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-all ${refreshing ? 'border-rose-300 text-rose-600 bg-rose-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span style={{ fontWeight: 500 }}>{refreshing ? 'Syncing…' : 'Refresh TikTok'}</span>
          </button>
          <a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-50 transition-all">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline" style={{ fontWeight: 500 }}>Open TikTok Ads</span>
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
        {kpis.map(k => <KPICard key={k.title} {...k} />)}
      </div>

      {/* Insights Banner */}
      <div className="bg-slate-900 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#FF0050' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.22 6.22 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.8 1.54V6.79a4.85 4.85 0 0 1-1.03-.1z" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm" style={{ fontWeight: 600 }}>TikTok Creative Tip</p>
          <p className="text-slate-400 text-xs mt-0.5">
            TikTok performs best with authentic, vertical-format UGC videos. Hook viewers in the first 3 seconds, use native captions, and test trending audio to improve video completion rates and CTR.
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="text-slate-800">Spend vs Revenue Trend</h3>
          <p className="text-slate-400 text-xs mt-0.5">TikTok Ads · 6-month history</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ttSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TIKTOK_RED} stopOpacity={0.2} />
                <stop offset="95%" stopColor={TIKTOK_RED} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ttRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip sym={sym} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="spend" name="Spend" stroke={TIKTOK_RED} strokeWidth={2}
              fill="url(#ttSpend)" dot={false} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8B5CF6" strokeWidth={2}
              fill="url(#ttRev)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-slate-800">Campaign Performance</h3>
          <p className="text-slate-400 text-xs mt-0.5">{d.campaigns.length} campaigns · April 2026</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Campaign', 'Status', 'Objective', 'Spend', 'Revenue', 'ROAS', 'Start Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.campaigns.map((camp, i) => (
                <tr key={camp.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === d.campaigns.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-slate-700 text-xs truncate" style={{ fontWeight: 500 }} title={camp.name}>{camp.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[camp.status]}`} style={{ fontWeight: 500 }}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{camp.objective}</td>
                  <td className="px-4 py-3 text-slate-700 text-sm">{formatCurrency(camp.spend, sym)}</td>
                  <td className="px-4 py-3 text-slate-700 text-sm">{formatCurrency(camp.revenue, sym)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${getROASBg(camp.roas, client.targetROAS)}`} style={{ fontWeight: 600 }}>
                      {client.targetROAS === 0 ? 'N/A' : `${camp.roas.toFixed(1)}×`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{camp.startDate || '01/07/26'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}