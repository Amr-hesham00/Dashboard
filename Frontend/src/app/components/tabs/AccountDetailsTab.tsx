import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Copy, Check, Settings, Globe, Mail, Phone, User, DollarSign, Target, Zap, Calendar, Edit2, Save, X } from 'lucide-react';
import { Client, formatCurrency } from '../../data/mockData';
import { clientAdAccounts, AdAccount } from '../../data/adAccounts';

const PLATFORM_META = {
  color: '#1877F2',
  bg: 'bg-blue-50',
  border: 'border-blue-200',
  label: 'Meta Ads',
  icon: () => (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ backgroundColor: '#1877F2', fontWeight: 800 }}>f</div>
  ),
};
const PLATFORM_GOOGLE = {
  color: '#4285F4',
  bg: 'bg-blue-50',
  border: 'border-sky-200',
  label: 'Google Ads',
  icon: () => (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: 'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)', fontWeight: 800 }}>G</div>
  ),
};
const PLATFORM_SNAP = {
  color: '#FFB800',
  bg: 'bg-yellow-50',
  border: 'border-yellow-200',
  label: 'Snapchat Ads',
  icon: () => (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFB800' }}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M12.166 2C9.093 2 7.167 3.778 7.167 6.737v.41c0 .197-.013.393-.039.587l-.584.102C5.95 7.98 5.4 8.19 5.4 8.756c0 .465.393.82.972.82.099 0 .198-.013.296-.026L6.53 9.78c-.098 1.11-.59 2.12-1.356 2.845-.275.256-.59.47-.934.618-.197.085-.23.203-.23.308 0 .302.344.587.879.751.157.05.26.124.291.22.046.154-.039.362-.217.512-.131.112-.217.23-.217.354 0 .27.308.45.635.45.125 0 .25-.026.362-.065.381-.138.687-.217.946-.217.23 0 .427.046.632.138.25.105.52.207.797.282.578.131 1.28.21 2.059.21 1.56 0 2.716-.433 3.327-.776.253-.14.524-.245.806-.282.21-.092.407-.138.636-.138.26 0 .566.08.946.217.112.039.237.065.362.065.328 0 .635-.18.635-.45 0-.124-.085-.242-.217-.354-.178-.15-.263-.358-.217-.512.033-.098.134-.17.29-.22.536-.164.88-.45.88-.75 0-.106-.033-.224-.23-.309a3.374 3.374 0 0 1-.935-.618c-.765-.725-1.258-1.735-1.356-2.845l-.138-.23c.099.013.198.026.296.026.58 0 .972-.355.972-.82 0-.566-.549-.776-1.144-.92l-.584-.102a4.063 4.063 0 0 1-.039-.587v-.41C17.166 3.778 15.24 2 12.166 2z" />
      </svg>
    </div>
  ),
};
const PLATFORM_TIKTOK = {
  color: '#FF0050',
  bg: 'bg-rose-50',
  border: 'border-rose-200',
  label: 'TikTok Ads',
  icon: () => (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#010101' }}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.22 6.22 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.8 1.54V6.79a4.85 4.85 0 0 1-1.03-.1z" />
      </svg>
    </div>
  ),
};

const PLATFORM_CONFIGS = {
  meta: PLATFORM_META,
  google: PLATFORM_GOOGLE,
  snapchat: PLATFORM_SNAP,
  tiktok: PLATFORM_TIKTOK,
};

const STATUS_CONFIG = {
  active: { label: 'Connected & Active', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: 'Connected – Paused', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  limited: { label: 'Connected – Limited', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  disabled: { label: 'Not Connected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 text-red-700 border-red-200' },
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value || value === '—') {
    return (
      <div>
        <p className="text-slate-400 text-xs mb-0.5">{label}</p>
        <p className="text-slate-400 text-sm">—</p>
      </div>
    );
  }
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5 group">
        <p className="text-slate-700 text-sm font-mono" style={{ fontWeight: 500 }}>{value}</p>
        <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600">
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

function AccountCard({ account }: { account: AdAccount }) {
  const cfg = PLATFORM_CONFIGS[account.platform];
  const statusCfg = STATUS_CONFIG[account.status];
  const StatusIcon = statusCfg.icon;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden`}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <cfg.icon />
          <div>
            <p className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>{cfg.label}</p>
            <p className="text-slate-400 text-xs">{account.accountName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusCfg.bg}`} style={{ fontWeight: 500 }}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
          <button
            onClick={handleRefresh}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Refresh account data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <CopyField label="Account ID" value={account.accountId} />
        {account.businessManagerId && <CopyField label="Business Manager ID" value={account.businessManagerId} />}
        {account.businessManagerName && (
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Business Manager</p>
            <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{account.businessManagerName}</p>
          </div>
        )}
        {account.mccAccountId && <CopyField label="MCC Account" value={account.mccAccountId} />}
        {account.organizationId && <CopyField label="Organization ID" value={account.organizationId} />}
        {account.businessCenterId && <CopyField label="Business Center ID" value={account.businessCenterId} />}
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Timezone</p>
          <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{account.timezone}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Account Currency</p>
          <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{account.currency}</p>
        </div>
        {account.monthlySpendCap && (
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Monthly Spend Cap</p>
            <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>
              {account.currency} {account.monthlySpendCap.toLocaleString()}
            </p>
          </div>
        )}
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Last Synced</p>
          <p className={`text-sm ${refreshing ? 'text-indigo-600' : 'text-slate-700'}`} style={{ fontWeight: 500 }}>
            {refreshing ? 'Syncing…' : account.lastSynced}
          </p>
        </div>
      </div>

      {!account.connected && (
        <div className="px-5 pb-4">
          <button className="flex items-center gap-2 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 hover:bg-indigo-100 transition-all" style={{ fontWeight: 500 }}>
            <Zap className="w-3.5 h-3.5" />
            Connect Account (Phase 2)
          </button>
        </div>
      )}
    </div>
  );
}

const CURRENCIES = ['USD', 'AED', 'SAR', 'EUR', 'GBP'];
const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', AED: 'AED ', SAR: 'SAR ', EUR: '€', GBP: '£' };
const BUSINESS_MODELS = ['E-commerce', 'DTC E-commerce', 'Lead Generation', 'SaaS / Subscription', 'B2B'];

export default function AccountDetailsTab({ client }: { client: Client }) {
  const accounts = clientAdAccounts[client.id] || [];
  const [editingSettings, setEditingSettings] = useState(false);
  const [settings, setSettings] = useState({
    name: client.name,
    industry: client.industry,
    website: client.website,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    currency: client.currency,
    monthlyBudget: client.monthlyBudget,
    targetROAS: client.targetROAS,
    targetCPA: client.targetCPA,
    businessModel: client.businessModel,
    mainConversionEvent: client.mainConversionEvent,
  });

  const connectedCount = accounts.filter(a => a.connected && a.status === 'active').length;

  const Field = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) => (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Platform Connections Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-800">Ad Platform Connections</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {connectedCount} of {accounts.length} platforms active
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(accounts.length)].map((_, i) => {
              const acc = accounts[i];
              const cfg = PLATFORM_CONFIGS[acc.platform];
              return (
                <div key={i} className={`w-3 h-3 rounded-full ${acc.status === 'active' ? 'bg-emerald-500' : acc.status === 'paused' ? 'bg-amber-400' : acc.status === 'limited' ? 'bg-orange-400' : 'bg-slate-300'}`}
                  title={`${cfg.label}: ${STATUS_CONFIG[acc.status].label}`} />
              );
            })}
            <span className="text-xs text-slate-500 ml-1">{connectedCount}/{accounts.length} active</span>
          </div>
        </div>

        {/* Platform status bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {accounts.map(acc => {
            const cfg = PLATFORM_CONFIGS[acc.platform];
            const statusCfg = STATUS_CONFIG[acc.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={acc.platform} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                <cfg.icon />
                <div className="min-w-0">
                  <p className="text-slate-700 text-xs truncate" style={{ fontWeight: 500 }}>{cfg.label}</p>
                  <div className={`flex items-center gap-1 ${statusCfg.color}`}>
                    <StatusIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs capitalize">{acc.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Account Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {accounts.map(account => (
          <AccountCard key={account.platform} account={account} />
        ))}
      </div>

      {/* Client Profile & Settings */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <h3 className="text-slate-800">Client Profile & Target Settings</h3>
          </div>
          {editingSettings ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditingSettings(false)}
                className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-all">
                <X className="w-3 h-3" /> Cancel
              </button>
              <button onClick={() => setEditingSettings(false)}
                className="flex items-center gap-1.5 text-xs text-white rounded-lg px-3 py-1.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 500 }}>
                <Save className="w-3 h-3" /> Save Changes
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingSettings(true)}
              className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-all">
              <Edit2 className="w-3 h-3" /> Edit Settings
            </button>
          )}
        </div>

        <div className="p-5">
          {editingSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Client Name', key: 'name', type: 'text' },
                { label: 'Industry', key: 'industry', type: 'text' },
                { label: 'Website', key: 'website', type: 'text' },
                { label: 'Contact Name', key: 'contactName', type: 'text' },
                { label: 'Contact Email', key: 'contactEmail', type: 'email' },
                { label: 'Main Conversion Event', key: 'mainConversionEvent', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>{label}</label>
                  <input
                    type={type}
                    value={(settings as any)[key]}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Currency</label>
                <select value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Business Model</label>
                <select value={settings.businessModel} onChange={e => setSettings(s => ({ ...s, businessModel: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {BUSINESS_MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Monthly Budget ({CURRENCY_SYMBOLS[settings.currency]})</label>
                <input type="number" value={settings.monthlyBudget}
                  onChange={e => setSettings(s => ({ ...s, monthlyBudget: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Target ROAS (0 = N/A)</label>
                <input type="number" value={settings.targetROAS} step="0.1"
                  onChange={e => setSettings(s => ({ ...s, targetROAS: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Target CPA ({CURRENCY_SYMBOLS[settings.currency]})</label>
                <input type="number" value={settings.targetCPA}
                  onChange={e => setSettings(s => ({ ...s, targetCPA: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Profile */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Client Profile</p>
                <div className="space-y-3">
                  <Field label="Client Name" value={settings.name} icon={User} />
                  <Field label="Industry" value={settings.industry} icon={Globe} />
                  <Field label="Website" value={settings.website} icon={Globe} />
                  <Field label="Contact Name" value={settings.contactName} icon={User} />
                  <Field label="Contact Email" value={settings.contactEmail} icon={Mail} />
                  <Field label="Business Model" value={settings.businessModel} icon={Settings} />
                </div>
              </div>

              {/* Target Settings */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Target Settings</p>
                <div className="space-y-3">
                  <Field label="Currency" value={settings.currency} icon={DollarSign} />
                  <Field label="Monthly Budget"
                    value={`${CURRENCY_SYMBOLS[settings.currency]}${settings.monthlyBudget.toLocaleString()}`}
                    icon={DollarSign} />
                  <Field label="Target ROAS"
                    value={settings.targetROAS === 0 ? 'N/A (Lead-gen)' : `${settings.targetROAS}×`}
                    icon={Target} />
                  <Field label="Target CPA"
                    value={`${CURRENCY_SYMBOLS[settings.currency]}${settings.targetCPA}`}
                    icon={Target} />
                  <Field label="Main Conversion Event" value={settings.mainConversionEvent} icon={Zap} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-800">Report Preferences</h3>
          <span className="ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Phase 2</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Report Frequency', value: 'Monthly (1st of each month)', icon: Calendar },
            { label: 'Report Recipients', value: `${settings.contactEmail}`, icon: Mail },
            { label: 'Report Language', value: 'English', icon: Globe },
            { label: 'Include Internal Notes', value: 'No (internal only)', icon: Settings },
            { label: 'Include Account IDs', value: 'No (hidden from client)', icon: Settings },
            { label: 'Default Date Range', value: 'Last 30 days', icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
