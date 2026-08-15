import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { BarChart3, Printer, Calendar, ChevronDown } from 'lucide-react';
import { clients } from '../data/mockData';
import OverviewTab from '../components/tabs/OverviewTab';
import MetaAdsTab from '../components/tabs/MetaAdsTab';
import GoogleAdsTab from '../components/tabs/GoogleAdsTab';
import SnapchatAdsTab from '../components/tabs/SnapchatAdsTab';
import TikTokAdsTab from '../components/tabs/TikTokAdsTab';
import InsightsTab from '../components/tabs/InsightsTab';

type TabId = 'overview' | 'meta' | 'google' | 'snapchat' | 'tiktok' | 'insights';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'meta', label: 'Meta Ads' },
  { id: 'google', label: 'Google Ads' },
  { id: 'snapchat', label: 'Snapchat Ads' },
  { id: 'tiktok', label: 'TikTok Ads' },
  { id: 'insights', label: 'Insights' },
];

const DATE_RANGES = ['Last 30 days', 'Apr 1 – Apr 30, 2026', 'Last 3 months', 'Q1 2026'];

export default function ClientReportPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [dateRange, setDateRange] = useState('Apr 1 – Apr 30, 2026');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const client = clients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-slate-600 mb-2">Report Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">This report link may have expired or is invalid.</p>
        <Link to="/login" className="text-indigo-600 text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.open(`/print/${client.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header — No internal data */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Client Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                style={{ backgroundColor: client.color, fontWeight: 700 }}>
                {client.initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-slate-900 truncate">{client.name}</h1>
                <p className="text-slate-500 text-xs mt-0.5">Performance Report · {dateRange}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Date Range */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:border-indigo-300 bg-white transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span style={{ fontWeight: 500 }}>{dateRange}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDateDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 min-w-[180px]">
                    {DATE_RANGES.map(r => (
                      <button key={r} onClick={() => { setDateRange(r); setShowDateDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 ${dateRange === r ? 'text-indigo-600' : 'text-slate-700'}`}
                        style={{ fontWeight: dateRange === r ? 600 : 400 }}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Print/PDF */}
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 bg-white transition-all"
                style={{ fontWeight: 500 }}>
                <Printer className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Performance Summary Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-5">
          {[
            { label: 'Total Spend', value: `${client.currencySymbol}${client.totalSpend.toLocaleString()}` },
            { label: 'Total Revenue', value: `${client.currencySymbol}${client.totalRevenue.toLocaleString()}` },
            { label: 'ROAS', value: client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(1)}×` },
            { label: 'Conversions', value: client.totalConversions.toLocaleString() },
            { label: 'Avg. CPA', value: `${client.currencySymbol}${client.cpa.toFixed(1)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">{label}:</span>
              <span className="text-slate-800 text-xs" style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
              style={{ fontWeight: 500 }}>
              {client.status === 'active' ? '● Active' : '○ Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex px-4 md:px-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3.5 text-sm border-b-2 transition-all ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {client.status === 'paused' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-5">
            <span className="text-amber-600 text-sm" style={{ fontWeight: 600 }}>⏸ Account Paused</span>
            <span className="text-amber-600 text-xs">Data shown reflects the last active period (March 2026).</span>
          </div>
        )}
        {activeTab === 'overview' && <OverviewTab client={client} />}
        {activeTab === 'meta' && <MetaAdsTab client={client} />}
        {activeTab === 'google' && <GoogleAdsTab client={client} />}
        {activeTab === 'snapchat' && <SnapchatAdsTab client={client} />}
        {activeTab === 'tiktok' && <TikTokAdsTab client={client} />}
        {activeTab === 'insights' && <InsightsTab client={client} />}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-500 text-xs">Powered by <span style={{ fontWeight: 600 }}>PerformDesk</span></span>
          </div>
          <p className="text-slate-400 text-xs">Report generated · May 4, 2026 · Internal use only</p>
        </div>
      </footer>
    </div>
  );
}
