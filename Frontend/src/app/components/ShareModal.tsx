import { useState } from 'react';
import { X, Copy, Check, Link2, Eye, EyeOff, Lock, Globe, Clock, Shield, Share2, ExternalLink } from 'lucide-react';
import { Client } from '../data/mockData';

const EXPIRY_OPTIONS = ['7 days', '30 days', '90 days', 'Never'];

interface Props {
  client: Client;
  onClose: () => void;
}

export default function ShareModal({ client, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState('30 days');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const token = `pk_${client.id.replace(/-/g, '').slice(0, 6)}_${Math.random().toString(36).slice(2, 8)}`;
  const reportUrl = `${window.location.origin}/report/${client.id}`;
  const displayUrl = `app.performdesk.io/report/${client.id}?token=${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPreview = () => {
    window.open(reportUrl, '_blank');
  };

  const clientCanSee = [
    { item: 'Overview KPIs & Charts', visible: true },
    { item: 'Meta Ads Performance', visible: true },
    { item: 'Google Ads Performance', visible: true },
    { item: 'Snapchat Ads Performance', visible: true },
    { item: 'TikTok Ads Performance', visible: true },
    { item: `Insights & Recommendations`, visible: includeInsights },
    { item: 'Internal Notes', visible: false },
    { item: 'Ad Account IDs', visible: false },
    { item: 'Agency Details', visible: false },
    { item: 'Target Settings', visible: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>Share Client Report</h3>
              <p className="text-slate-400 text-xs">{client.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Link Box */}
          <div>
            <p className="text-xs text-slate-500 mb-2" style={{ fontWeight: 500 }}>Client Report Link</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-slate-600 text-xs font-mono truncate">{displayUrl}</span>
              <button onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                style={{ fontWeight: 500 }}>
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>

          {/* Link Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Link Expiry</p>
              <div className="flex flex-wrap gap-1.5">
                {EXPIRY_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setExpiry(opt)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${expiry === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    style={{ fontWeight: expiry === opt ? 600 : 400 }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Include in Report</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setIncludeInsights(!includeInsights)}
                  className={`w-8 h-4.5 rounded-full relative transition-all cursor-pointer ${includeInsights ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  style={{ height: '18px', width: '32px' }}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${includeInsights ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-xs text-slate-600">Insights tab</span>
              </label>
            </div>
          </div>

          {/* Password Protection */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-700 text-xs" style={{ fontWeight: 500 }}>Password Protection</span>
                <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Phase 2</span>
              </div>
              <label className="cursor-pointer">
                <div onClick={() => setRequirePassword(!requirePassword)}
                  className={`w-8 rounded-full relative transition-all cursor-pointer ${requirePassword ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  style={{ height: '18px', width: '32px' }}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${requirePassword ? 'left-4' : 'left-0.5'}`} />
                </div>
              </label>
            </div>
            {requirePassword && (
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Set a password for this report"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* What Client Can See */}
          <div>
            <p className="text-xs text-slate-500 mb-2" style={{ fontWeight: 500 }}>What the client will see</p>
            <div className="grid grid-cols-2 gap-1.5">
              {clientCanSee.map(({ item, visible }) => (
                <div key={item} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${visible ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                  {visible
                    ? <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    : <X className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Preview Button */}
          <button onClick={handleOpenPreview}
            className="w-full flex items-center justify-center gap-2 text-sm border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-xl py-2.5 hover:bg-indigo-100 transition-all"
            style={{ fontWeight: 500 }}>
            <ExternalLink className="w-4 h-4" />
            Preview Client Report
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>This link opens a read-only, client-safe view. Full link authentication coming in Phase 2.</span>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50">
          <p className="text-xs text-slate-400 text-center">
            🔒 Full shareable link system with token auth & email delivery — Phase 2
          </p>
        </div>
      </div>
    </div>
  );
}
