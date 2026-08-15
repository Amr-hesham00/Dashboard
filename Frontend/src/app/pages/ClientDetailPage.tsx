import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft, Share2, RefreshCw, ChevronDown, Calendar,
  Target, ExternalLink, FileText, Lock, Server, Printer,
  TrendingUp, DollarSign, Zap
} from 'lucide-react';
import { clients, formatCurrency, formatPercent } from '../data/mockData';
import OverviewTab from '../components/tabs/OverviewTab';
import MetaAdsTab from '../components/tabs/MetaAdsTab';
import GoogleAdsTab from '../components/tabs/GoogleAdsTab';
import SnapchatAdsTab from '../components/tabs/SnapchatAdsTab';
import TikTokAdsTab from '../components/tabs/TikTokAdsTab';
import InsightsTab from '../components/tabs/InsightsTab';
import AccountDetailsTab from '../components/tabs/AccountDetailsTab';
import InternalNotesTab from '../components/tabs/InternalNotesTab';
import ShareModal from '../components/ShareModal';

type TabId = 'overview' | 'meta' | 'google' | 'snapchat' | 'tiktok' | 'insights' | 'accounts' | 'notes';

const TABS: { id: TabId; label: string; shortLabel?: string; icon?: React.ElementType; internal?: boolean }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'meta', label: 'Meta Ads', shortLabel: 'Meta' },
  { id: 'google', label: 'Google Ads', shortLabel: 'Google' },
  { id: 'snapchat', label: 'Snapchat Ads', shortLabel: 'Snap' },
  { id: 'tiktok', label: 'TikTok Ads', shortLabel: 'TikTok' },
  { id: 'insights', label: 'Insights & Recs', shortLabel: 'Insights' },
  { id: 'accounts', label: 'Account Details', shortLabel: 'Accounts', icon: Server },
  { id: 'notes', label: 'Internal Notes', shortLabel: 'Notes', icon: Lock, internal: true },
];

const PLATFORM_COLORS: Record<string, string> = {
  meta: '#1877F2', google: '#4285F4', snapchat: '#FFB800', tiktok: '#FF0050',
};

const DATE_RANGES = [
  { label: 'Last 7 days', sublabel: 'Apr 27 – May 3' },
  { label: 'Last 30 days', sublabel: 'Apr 4 – May 3' },
  { label: 'April 2026', sublabel: 'Apr 1 – Apr 30' },
  { label: 'March 2026', sublabel: 'Mar 1 – Mar 31' },
  { label: 'Last 3 months', sublabel: 'Feb 1 – Apr 30' },
  { label: 'Last 6 months', sublabel: 'Nov 2025 – Apr 2026' },
];

function BudgetPaceBar({ spent, budget, sym }: { spent: number; budget: number; sym: string }) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const isOverpacing = pct > 95;
  const isUnderpacing = pct < 70;
  const color = isOverpacing ? 'bg-amber-500' : isUnderpacing ? 'bg-red-400' : 'bg-emerald-500';
  const textColor = isOverpacing ? 'text-amber-700' : isUnderpacing ? 'text-red-600' : 'text-emerald-700';
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs flex-shrink-0 ${textColor}`} style={{ fontWeight: 600 }}>
        {pct}% used
      </span>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[2]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const client = clients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
        <p className="mb-4">Client not found.</p>
        <Link to="/clients" className="text-indigo-600 text-sm hover:underline">← Back to Clients</Link>
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleExportPDF = () => {
    window.open(`/print/${client.id}`, '_blank');
  };

  const successInsights = client.insights.filter(i => i.status === 'success').length;
  const warningInsights = client.insights.filter(i => i.status === 'warning').length;
  const dangerInsights = client.insights.filter(i => i.status === 'danger').length;

  const budgetPct = Math.round((client.totalSpend / client.monthlyBudget) * 100);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 pt-4 pb-0 flex-shrink-0">

        {/* Breadcrumb Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/clients')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Clients</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 text-xs" style={{ fontWeight: 500 }}>{client.name}</span>
          </div>

          {/* Top-right Actions */}
          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all bg-white"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span style={{ fontWeight: 500 }}>{selectedRange.label}</span>
                <span className="text-slate-400 hidden sm:inline">· {selectedRange.sublabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 min-w-[220px]">
                  <p className="px-4 pt-1 pb-2 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1" style={{ fontWeight: 600 }}>
                    Date Range
                  </p>
                  {DATE_RANGES.map(range => (
                    <button key={range.label}
                      onClick={() => { setSelectedRange(range); setShowDateDropdown(false); }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedRange.label === range.label ? 'text-indigo-600' : 'text-slate-700'}`}
                    >
                      <span className="text-xs" style={{ fontWeight: selectedRange.label === range.label ? 600 : 400 }}>
                        {range.label}
                      </span>
                      <span className="text-slate-400 text-xs">{range.sublabel}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors" style={{ fontWeight: 500 }}>
                      + Custom Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share Report */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all bg-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline" style={{ fontWeight: 500 }}>Share Report</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all bg-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline" style={{ fontWeight: 500 }}>Export PDF</span>
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 transition-all ${refreshing ? 'border-indigo-300 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline" style={{ fontWeight: 500 }}>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Client Identity Row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: client.color, fontWeight: 700, fontSize: '0.95rem' }}>
              {client.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-slate-900 truncate">{client.name}</h1>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${client.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                  style={{ fontWeight: 500 }}>
                  {client.status === 'active' ? '● Active' : '○ Paused'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-500">
                <span>{client.industry}</span>
                <span className="text-slate-300">·</span>
                <span>{client.businessModel}</span>
                {client.website && (
                  <>
                    <span className="text-slate-300">·</span>
                    <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-500 flex items-center gap-0.5 hover:text-indigo-700">
                      {client.website}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Insight Summary Chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {dangerInsights > 0 && (
              <button onClick={() => setActiveTab('insights')}
                className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-all"
                style={{ fontWeight: 500 }}>
                🔴 {dangerInsights} Action{dangerInsights !== 1 ? 's' : ''} Required
              </button>
            )}
            {warningInsights > 0 && (
              <button onClick={() => setActiveTab('insights')}
                className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-all"
                style={{ fontWeight: 500 }}>
                🟡 {warningInsights} Warning{warningInsights !== 1 ? 's' : ''}
              </button>
            )}
            {successInsights > 0 && dangerInsights === 0 && (
              <button onClick={() => setActiveTab('insights')}
                className="flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
                style={{ fontWeight: 500 }}>
                🟢 {successInsights} On Track
              </button>
            )}
          </div>
        </div>

        {/* Target Settings & Budget Pacing Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 px-3 bg-slate-50 rounded-xl mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Target ROAS:</span>
            <span className="text-slate-800" style={{ fontWeight: 600 }}>
              {client.targetROAS === 0 ? 'N/A' : `${client.targetROAS}×`}
            </span>
            {client.targetROAS > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded text-xs ${client.roas >= client.targetROAS ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`} style={{ fontWeight: 600 }}>
                {client.roas >= client.targetROAS ? `✓ ${client.roas.toFixed(1)}×` : `↓ ${client.roas.toFixed(1)}×`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Target CPA:</span>
            <span className="text-slate-800" style={{ fontWeight: 600 }}>
              {client.currencySymbol}{client.targetCPA}
            </span>
            <span className={`ml-0.5 px-1.5 py-0.5 rounded text-xs ${client.cpa <= client.targetCPA ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`} style={{ fontWeight: 600 }}>
              {client.cpa <= client.targetCPA ? `✓ ${client.currencySymbol}${client.cpa.toFixed(0)}` : `↑ ${client.currencySymbol}${client.cpa.toFixed(0)}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Budget Pacing:</span>
            <span className="text-slate-800" style={{ fontWeight: 600 }}>
              {client.currencySymbol}{client.totalSpend.toLocaleString()} / {client.currencySymbol}{client.monthlyBudget.toLocaleString()}
            </span>
          </div>
          <BudgetPaceBar spent={client.totalSpend} budget={client.monthlyBudget} sym={client.currencySymbol} />

          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Conversion:</span>
            <span className="text-slate-800" style={{ fontWeight: 600 }}>{client.mainConversionEvent}</span>
          </div>

          {/* Platform dots */}
          <div className="flex items-center gap-2 ml-auto">
            {Object.entries(PLATFORM_COLORS).map(([p, c]) => (
              <div key={p} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-slate-400 capitalize hidden lg:inline">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6 no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3.5 text-sm border-b-2 transition-all ${isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : tab.internal
                    ? 'border-transparent text-slate-400 hover:text-amber-600 hover:border-amber-300'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel || tab.label}</span>
                {tab.internal && !isActive && (
                  <span className="hidden lg:inline text-xs bg-amber-100 text-amber-600 px-1 py-0.5 rounded ml-0.5" style={{ fontWeight: 500 }}>
                    Private
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Paused Banner */}
        {client.status === 'paused' && activeTab !== 'insights' && activeTab !== 'accounts' && activeTab !== 'notes' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-sm" style={{ fontWeight: 700 }}>���</span>
            </div>
            <div>
              <p className="text-amber-700 text-sm" style={{ fontWeight: 600 }}>Account Paused</p>
              <p className="text-amber-600 text-xs mt-0.5">
                All campaigns are currently paused. Data shown reflects the last active period (March 2026).
              </p>
            </div>
          </div>
        )}

        {/* Refresh Indicator */}
        {refreshing && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-4 py-2.5 rounded-xl mb-4">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span style={{ fontWeight: 500 }}>Refreshing all platform data… This may take a moment.</span>
          </div>
        )}

        {activeTab === 'overview' && <OverviewTab client={client} />}
        {activeTab === 'meta' && <MetaAdsTab client={client} />}
        {activeTab === 'google' && <GoogleAdsTab client={client} />}
        {activeTab === 'snapchat' && <SnapchatAdsTab client={client} />}
        {activeTab === 'tiktok' && <TikTokAdsTab client={client} />}
        {activeTab === 'insights' && <InsightsTab client={client} />}
        {activeTab === 'accounts' && <AccountDetailsTab client={client} />}
        {activeTab === 'notes' && <InternalNotesTab clientId={client.id} />}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal client={client} onClose={() => setShowShareModal(false)} />
      )}

      {/* Close dropdowns on outside click */}
      {showDateDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
      )}
    </div>
  );
}
