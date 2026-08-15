import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Eye, ShoppingCart, BarChart2 } from 'lucide-react';
import { Client, formatCurrency, formatNumber, formatPercent, getROASBg, getCPABg } from '../../data/mockData';

const PLATFORM_COLORS: Record<string, string> = {
  meta: '#1877F2',
  google: '#4285F4',
  snapchat: '#FFB800',
  tiktok: '#FF0050',
};

const PLATFORM_LABELS: Record<string, string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  snapchat: 'Snapchat',
  tiktok: 'TikTok',
};

function KPICard({ title, value, change, icon: Icon, color, subtext }: {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-xs" style={{ fontWeight: 500 }}>{title}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-slate-800 text-2xl mb-1" style={{ fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {subtext && <p className="text-slate-400 text-xs">{subtext}</p>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span style={{ fontWeight: 500 }}>{positive ? '+' : ''}{change.toFixed(1)}% vs last month</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-slate-600 mb-2" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="text-slate-800" style={{ fontWeight: 600 }}>
            {currencySymbol}{formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const ROASTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="text-slate-600 mb-1" style={{ fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-800" style={{ fontWeight: 600 }}>{p.value.toFixed(2)}×</span>
        </div>
      ))}
    </div>
  );
};

export default function OverviewTab({ client }: { client: Client }) {
  const sym = client.currencySymbol;

  const platformComparison = ['meta', 'google', 'snapchat', 'tiktok'].map(p => {
    const d = client.platforms[p as keyof typeof client.platforms];
    return { platform: p, label: PLATFORM_LABELS[p], color: PLATFORM_COLORS[p], ...d };
  });

  const roasChartData = platformComparison.map(p => ({
    name: p.label.replace(' Ads', ''),
    ROAS: parseFloat(p.roas.toFixed(2)),
    fill: p.color,
  }));

  const kpis = [
    {
      title: 'Total Spend', value: formatCurrency(client.totalSpend, sym),
      change: 3.8, icon: DollarSign, color: '#6366F1',
      subtext: `Budget: ${formatCurrency(client.monthlyBudget, sym)}`
    },
    {
      title: 'Total Revenue', value: formatCurrency(client.totalRevenue, sym),
      change: 7.2, icon: TrendingUp, color: '#10B981',
      subtext: client.mainConversionEvent
    },
    {
      title: 'Overall ROAS', value: client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(2)}×`,
      change: 4.1, icon: BarChart2, color: client.roas >= client.targetROAS ? '#10B981' : '#EF4444',
      subtext: client.targetROAS > 0 ? `Target: ${client.targetROAS}×` : 'Lead-gen model'
    },
    {
      title: 'Total Conversions', value: formatNumber(client.totalConversions),
      change: 5.6, icon: ShoppingCart, color: '#F59E0B',
      subtext: client.mainConversionEvent
    },
    {
      title: 'Avg. CPA', value: formatCurrency(client.cpa, sym),
      change: -2.3, icon: Target, color: client.cpa <= client.targetCPA ? '#10B981' : '#EF4444',
      subtext: `Target: ${formatCurrency(client.targetCPA, sym)}`
    },
    {
      title: 'Total Impressions', value: formatNumber(client.totalImpressions, true),
      change: 8.1, icon: Eye, color: '#3B82F6',
      subtext: `CTR: ${formatPercent(client.ctr)}`
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(kpi => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Spend vs Revenue */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800">Spend vs Revenue</h3>
              <p className="text-slate-400 text-xs mt-0.5">6-month trend (all platforms combined)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-indigo-400" />Spend
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />Revenue
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={client.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip currencySymbol={sym} />} />
              <Area type="monotone" dataKey="spend" name="Spend" stroke="#6366F1" strokeWidth={2}
                fill="url(#spendGrad)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2}
                fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS by Platform */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-4">
            <h3 className="text-slate-800">ROAS by Platform</h3>
            <p className="text-slate-400 text-xs mt-0.5">Current period</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={roasChartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}×`} domain={[0, 'auto']} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={60} />
              {client.targetROAS > 0 && (
                <ReferenceLine x={client.targetROAS} stroke="#EF4444" strokeDasharray="4 4"
                  label={{ value: `Target ${client.targetROAS}×`, fontSize: 10, fill: '#EF4444', position: 'top' }} />
              )}
              <Tooltip content={<ROASTooltip />} />
              <Bar dataKey="ROAS" radius={[0, 6, 6, 0]} maxBarSize={32}>
                {roasChartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-slate-800">Platform Comparison</h3>
          <p className="text-slate-400 text-xs mt-0.5">April 2026 · All active platforms</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Platform', 'Spend', 'Revenue', 'ROAS', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'CPA'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformComparison.map((p, i) => (
                <tr key={p.platform} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i === platformComparison.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: p.color, fontSize: '10px', fontWeight: 700 }}>
                        {p.label[0]}
                      </div>
                      <span className="text-slate-700 text-sm whitespace-nowrap" style={{ fontWeight: 500 }}>
                        {p.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-sm">{formatCurrency(p.spend, sym)}</td>
                  <td className="px-4 py-3 text-slate-700 text-sm">{formatCurrency(p.revenue, sym)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md ${getROASBg(p.roas, client.targetROAS)}`} style={{ fontWeight: 600 }}>
                      {client.targetROAS === 0 ? 'N/A' : `${p.roas.toFixed(1)}×`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{formatNumber(p.impressions, true)}</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{formatNumber(p.clicks, true)}</td>
                  <td className="px-4 py-3 text-slate-600 text-sm">{formatPercent(p.ctr)}</td>
                  <td className="px-4 py-3 text-slate-700 text-sm" style={{ fontWeight: 500 }}>
                    {formatNumber(p.conversions)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md ${getCPABg(p.cpa, client.targetCPA)}`} style={{ fontWeight: 600 }}>
                      {formatCurrency(p.cpa, sym)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-700" style={{ fontWeight: 600 }}>Total</td>
                <td className="px-4 py-3 text-sm text-slate-800" style={{ fontWeight: 600 }}>
                  {formatCurrency(client.totalSpend, sym)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800" style={{ fontWeight: 600 }}>
                  {formatCurrency(client.totalRevenue, sym)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md ${getROASBg(client.roas, client.targetROAS)}`} style={{ fontWeight: 700 }}>
                    {client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(1)}×`}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700" style={{ fontWeight: 600 }}>
                  {formatNumber(client.totalImpressions, true)}
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm">—</td>
                <td className="px-4 py-3 text-sm text-slate-700" style={{ fontWeight: 600 }}>
                  {formatPercent(client.ctr)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800" style={{ fontWeight: 600 }}>
                  {formatNumber(client.totalConversions)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md ${getCPABg(client.cpa, client.targetCPA)}`} style={{ fontWeight: 700 }}>
                    {formatCurrency(client.cpa, sym)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}