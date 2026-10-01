import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Client, formatCurrency, formatNumber, formatPercent, getROASBg, getCPABg } from '../../data/mockData';
import { RefreshCw, ExternalLink } from 'lucide-react';

const SNAP_YELLOW = '#FFB800';
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border border-amber-200',
  ended: 'bg-slate-100 text-slate-500 border border-slate-200',
};

function KPICard({ title, value, subtext, highlight }: {
  title: string; value: string; subtext?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'}`}>
      <p className="text-slate-500 text-xs mb-2" style={{ fontWeight: 500 }}>{title}</p>
      <p className={`text-xl ${highlight ? 'text-yellow-700' : 'text-slate-800'}`} style={{ fontWeight: 700, lineHeight: 1 }}>{value}</p>
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

export default function SnapchatAdsTab({ client }: { client: Client }) {
  const d = client.platforms.snapchat;
  const sym = client.currencySymbol;
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1600); };

  const kpis = [
    { title: 'Spend', value: formatCurrency(d.spend, sym), subtext: `${((d.spend / client.totalSpend) * 100).toFixed(0)}% of total` },
    { title: 'Revenue', value: formatCurrency(d.revenue, sym), subtext: client.mainConversionEvent },
    { title: 'ROAS', value: client.targetROAS === 0 ? 'N/A' : `${d.roas.toFixed(2)}×`, subtext: `Target: ${client.targetROAS}×`, highlight: false },
    { title: 'Impressions', value: formatNumber(d.impressions, true) },
    { title: 'Swipe-Ups', value: formatNumber(d.clicks, true) },
    { title: 'Swipe-Up Rate', value: formatPercent(d.ctr), subtext: d.ctr >= 1.5 ? '✓ Good' : d.ctr >= 0.8 ? '~ Average' : '↓ Low' },
    { title: 'eCPC', value: formatCurrency(d.cpc, sym) },
    { title: 'Conversions', value: formatNumber(d.conversions), subtext: client.mainConversionEvent },
    { title: 'CPA', value: formatCurrency(d.cpa, sym), subtext: `Target: ${formatCurrency(client.targetCPA, sym)}` },
  ];

  return (
    <div className="space-y-5">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: SNAP_YELLOW }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M12.166 2C9.093 2 7.167 3.778 7.167 6.737v.41c0 .197-.013.393-.039.587l-.584.102C5.95 7.98 5.4 8.19 5.4 8.756c0 .465.393.82.972.82.099 0 .198-.013.296-.026L6.53 9.78c-.098 1.11-.59 2.12-1.356 2.845-.275.256-.59.47-.934.618-.197.085-.23.203-.23.308 0 .302.344.587.879.751.157.05.26.124.291.22.046.154-.039.362-.217.512-.131.112-.217.23-.217.354 0 .27.308.45.635.45.125 0 .25-.026.362-.065.381-.138.687-.217.946-.217.23 0 .427.046.632.138a5.36 5.36 0 0 0 .797.282c.578.131 1.28.21 2.059.21 1.56 0 2.716-.433 3.327-.776a5.04 5.04 0 0 0 .806-.282c.21-.092.407-.138.636-.138.26 0 .566.08.946.217.112.039.237.065.362.065.328 0 .635-.18.635-.45 0-.124-.085-.242-.217-.354-.178-.15-.263-.358-.217-.512.033-.098.134-.17.29-.22.536-.164.88-.45.88-.75 0-.106-.033-.224-.23-.309a3.374 3.374 0 0 1-.935-.618c-.765-.725-1.258-1.735-1.356-2.845l-.138-.23c.099.013.198.026.296.026.58 0 .972-.355.972-.82 0-.566-.549-.776-1.144-.92l-.584-.102a4.063 4.063 0 0 1-.039-.587v-.41C17.166 3.778 15.24 2 12.166 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-slate-800">Snapchat Ads Performance</h3>
          <p className="text-slate-500 text-sm mt-0.5">Snap Ads · Collection Ads · Story Ads · April 2026</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-lg ${getROASBg(d.roas, client.targetROAS)}`} style={{ fontWeight: 600 }}>
            ROAS {client.targetROAS === 0 ? 'N/A' : `${d.roas.toFixed(1)}×`}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-lg ${getCPABg(d.cpa, client.targetCPA)}`} style={{ fontWeight: 600 }}>
            CPA {formatCurrency(d.cpa, sym)}
          </span>
          <button onClick={handleRefresh}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-all ${refreshing ? 'border-yellow-300 text-yellow-700 bg-yellow-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span style={{ fontWeight: 500 }}>{refreshing ? 'Syncing…' : 'Refresh Snap'}</span>
          </button>
          <a href="https://ads.snapchat.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-50 transition-all">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline" style={{ fontWeight: 500 }}>Open Snap Ads</span>
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
        {kpis.map(k => <KPICard key={k.title} {...k} />)}
      </div>

      {/* CTR Warning Banner */}
      {d.ctr < 1.0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-600 text-xs" style={{ fontWeight: 700 }}>!</span>
          </div>
          <div>
            <p className="text-red-700 text-sm" style={{ fontWeight: 600 }}>Low Swipe-Up Rate Detected</p>
            <p className="text-red-600 text-xs mt-0.5">
              Current Swipe-Up Rate is {formatPercent(d.ctr)}, below the recommended 1.5%+ for the platform.
              Consider refreshing ad creatives and reviewing your CTA placement.
            </p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="text-slate-800">Spend vs Revenue Trend</h3>
          <p className="text-slate-400 text-xs mt-0.5">Snapchat Ads · 6-month history</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="snapSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SNAP_YELLOW} stopOpacity={0.25} />
                <stop offset="95%" stopColor={SNAP_YELLOW} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="snapRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip sym={sym} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="spend" name="Spend" stroke={SNAP_YELLOW} strokeWidth={2}
              fill="url(#snapSpend)" dot={false} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#F97316" strokeWidth={2}
              fill="url(#snapRev)" dot={false} activeDot={{ r: 4 }} />
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
                  <td className="px-4 py-3 text-slate-500 text-xs">{camp.objective}</td>
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