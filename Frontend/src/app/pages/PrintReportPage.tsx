import { useEffect } from 'react';
import { useParams } from 'react-router';
import { BarChart3 } from 'lucide-react';
import { clients, formatCurrency, formatNumber, formatPercent } from '../data/mockData';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  meta: '#1877F2', google: '#4285F4', snapchat: '#FFB800', tiktok: '#FF0050',
};
const PLATFORM_LABELS: Record<string, string> = {
  meta: 'Meta Ads', google: 'Google Ads', snapchat: 'Snapchat Ads', tiktok: 'TikTok Ads',
};

export default function PrintReportPage() {
  const { id } = useParams<{ id: string }>();
  const client = clients.find(c => c.id === id);

  useEffect(() => {
    if (client) {
      // Delay print to let charts render
      const timer = setTimeout(() => window.print(), 1200);
      return () => clearTimeout(timer);
    }
  }, [client]);

  if (!client) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Client not found.</div>;
  }

  const sym = client.currencySymbol;
  const platformRows = ['meta', 'google', 'snapchat', 'tiktok'].map(p => ({
    platform: p,
    label: PLATFORM_LABELS[p],
    color: PLATFORM_COLORS[p],
    ...client.platforms[p as keyof typeof client.platforms],
  }));

  const roasData = platformRows.map(p => ({
    name: p.label.replace(' Ads', ''),
    ROAS: parseFloat(p.roas.toFixed(2)),
    fill: p.color,
  }));

  return (
    <div className="print-report bg-white min-h-screen">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page { margin: 15mm; size: A4; }
        }
        .print-report { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      {/* Cover / Header */}
      <div className="p-8 border-b-4 border-indigo-600 flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: 'rgb(99,102,241)', fontWeight: 700 }}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>PerformDesk</p>
              <p className="text-slate-400 text-xs">Performance Marketing Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: client.color, fontWeight: 700, fontSize: '1.1rem' }}>
              {client.initials}
            </div>
            <div>
              <h1 className="text-slate-900" style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>
                {client.name}
              </h1>
              <p className="text-slate-500 text-sm">{client.industry} · {client.businessModel}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">Performance Report</p>
          <p className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>April 2026</p>
          <p className="text-slate-400 text-xs mt-1">Generated: May 4, 2026</p>
          <div className="mt-2 flex justify-end">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${client.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'}`}
              style={{ fontWeight: 500 }}>
              {client.status === 'active' ? '● Active' : '○ Paused'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8">
        {/* KPI Summary */}
        <section className="mb-8">
          <h2 className="text-slate-800 mb-3" style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            Performance Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Total Spend', value: formatCurrency(client.totalSpend, sym), target: `Budget: ${formatCurrency(client.monthlyBudget, sym)}` },
              { label: 'Total Revenue', value: formatCurrency(client.totalRevenue, sym), target: client.mainConversionEvent },
              { label: 'Overall ROAS', value: client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(2)}×`, target: `Target: ${client.targetROAS === 0 ? 'N/A' : `${client.targetROAS}×`}` },
              { label: 'Total Conversions', value: formatNumber(client.totalConversions), target: client.mainConversionEvent },
              { label: 'Avg. CPA', value: formatCurrency(client.cpa, sym), target: `Target: ${formatCurrency(client.targetCPA, sym)}` },
              { label: 'Total Impressions', value: formatNumber(client.totalImpressions, true), target: `CTR: ${formatPercent(client.ctr)}` },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>{kpi.label}</p>
                <p style={{ color: '#0F172A', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ color: '#94A3B8', fontSize: '11px', marginTop: '4px' }}>{kpi.target}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spend vs Revenue Chart */}
        <section className="mb-8">
          <h2 className="text-slate-800 mb-3" style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            Spend vs Revenue — 6 Month Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={client.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="printSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="printRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${sym}${(v / 1000).toFixed(0)}K`} />
              <Tooltip />
              <Area type="monotone" dataKey="spend" name="Spend" stroke="#6366F1" strokeWidth={2} fill="url(#printSpend)" dot={false} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#printRevenue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Platform Comparison Table */}
        <section className="mb-8">
          <h2 className="text-slate-800 mb-3" style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            Platform Performance Breakdown
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Platform', 'Spend', 'Revenue', 'ROAS', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'CPA'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 600, fontSize: '11px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformRows.map((p, i) => (
                <tr key={p.platform} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
                      {p.label}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px' }}>{formatCurrency(p.spend, sym)}</td>
                  <td style={{ padding: '8px 12px' }}>{formatCurrency(p.revenue, sym)}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: p.roas >= client.targetROAS ? '#10B981' : '#EF4444' }}>
                    {client.targetROAS === 0 ? 'N/A' : `${p.roas.toFixed(1)}×`}
                  </td>
                  <td style={{ padding: '8px 12px' }}>{formatNumber(p.impressions, true)}</td>
                  <td style={{ padding: '8px 12px' }}>{formatNumber(p.clicks, true)}</td>
                  <td style={{ padding: '8px 12px' }}>{formatPercent(p.ctr)}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{formatNumber(p.conversions)}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: p.cpa <= client.targetCPA ? '#10B981' : '#EF4444' }}>
                    {formatCurrency(p.cpa, sym)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0', fontWeight: 700 }}>
                <td style={{ padding: '8px 12px' }}>Total</td>
                <td style={{ padding: '8px 12px' }}>{formatCurrency(client.totalSpend, sym)}</td>
                <td style={{ padding: '8px 12px' }}>{formatCurrency(client.totalRevenue, sym)}</td>
                <td style={{ padding: '8px 12px', color: client.roas >= client.targetROAS ? '#10B981' : '#EF4444' }}>
                  {client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(1)}×`}
                </td>
                <td style={{ padding: '8px 12px' }}>{formatNumber(client.totalImpressions, true)}</td>
                <td style={{ padding: '8px 12px' }}>—</td>
                <td style={{ padding: '8px 12px' }}>{formatPercent(client.ctr)}</td>
                <td style={{ padding: '8px 12px' }}>{formatNumber(client.totalConversions)}</td>
                <td style={{ padding: '8px 12px', color: client.cpa <= client.targetCPA ? '#10B981' : '#EF4444' }}>
                  {formatCurrency(client.cpa, sym)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Insights */}
        <section className="mb-8 page-break">
          <h2 className="text-slate-800 mb-3" style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
            Key Insights & Recommendations
          </h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {client.insights.map(ins => {
              const colors = {
                success: { bg: '#F0FDF4', border: '#BBF7D0', dot: '#10B981', label: 'On Track' },
                warning: { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', label: 'Needs Attention' },
                danger: { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', label: 'Action Required' },
              }[ins.status];
              return (
                <div key={ins.id} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.dot, marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: colors.dot }}>{colors.label}</span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>{ins.platform}</span>
                    </div>
                    <p style={{ color: '#0F172A', fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>{ins.title}</p>
                    <p style={{ color: '#475569', fontSize: '11px', lineHeight: 1.5, marginBottom: '6px' }}>{ins.description}</p>
                    <p style={{ color: '#6366F1', fontSize: '11px', fontWeight: 500 }}>→ {ins.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Campaign Tables per Platform */}
        {['meta', 'google', 'snapchat', 'tiktok'].map(p => {
          const platform = client.platforms[p as keyof typeof client.platforms];
          return (
            <section key={p} className="mb-8">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '2px solid #E2E8F0', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: PLATFORM_COLORS[p], display: 'inline-block' }} />
                {PLATFORM_LABELS[p]} — Campaign Performance
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Campaign', 'Status', 'Objective', 'Spend', 'Revenue', 'ROAS', 'Start Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 10px', color: '#64748B', fontWeight: 600, fontSize: '10px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {platform.campaigns.map((camp, i) => (
                    <tr key={camp.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                      <td style={{ padding: '7px 10px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={camp.name}>{camp.name}</td>
                      <td style={{ padding: '7px 10px', textTransform: 'capitalize', color: camp.status === 'active' ? '#10B981' : '#94A3B8', fontWeight: 500 }}>{camp.status}</td>
                      <td style={{ padding: '7px 10px', color: '#64748B' }}>{camp.objective || 'Conversions'}</td>
                      <td style={{ padding: '7px 10px' }}>{formatCurrency(camp.spend, sym)}</td>
                      <td style={{ padding: '7px 10px' }}>{formatCurrency(camp.revenue, sym)}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: camp.roas >= client.targetROAS ? '#10B981' : '#EF4444' }}>
                        {client.targetROAS === 0 ? 'N/A' : `${camp.roas.toFixed(1)}×`}
                      </td>
                      <td style={{ padding: '7px 10px', color: '#64748B' }}>{camp.startDate || '01/07/26'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 style={{ width: '12px', height: '12px', color: 'white' }} />
            </div>
            <span style={{ color: '#64748B', fontSize: '11px' }}>Powered by <strong>PerformDesk</strong></span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '11px' }}>Confidential · Generated May 4, 2026</p>
        </div>
      </div>

      {/* No-print button */}
      <div className="no-print fixed bottom-6 right-6">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 text-white text-sm rounded-xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 600 }}>
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
