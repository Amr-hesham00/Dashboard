import { CheckCircle, AlertTriangle, XCircle, Lightbulb, TrendingUp, Target, Zap, ChevronRight } from 'lucide-react';
import { Client, Insight, InsightStatus, formatCurrency, formatPercent } from '../../data/mockData';

const STATUS_CONFIG: Record<InsightStatus, {
  bg: string; border: string; icon: React.ElementType;
  iconBg: string; iconColor: string; badge: string; label: string;
}> = {
  success: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle,
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700', label: 'On Track',
  },
  warning: {
    bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle,
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700', label: 'Needs Attention',
  },
  danger: {
    bg: 'bg-red-50', border: 'border-red-200', icon: XCircle,
    iconBg: 'bg-red-100', iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-700', label: 'Action Required',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  ROAS: 'bg-indigo-50 text-indigo-700',
  CPA: 'bg-blue-50 text-blue-700',
  CTR: 'bg-violet-50 text-violet-700',
  Budget: 'bg-orange-50 text-orange-700',
  Creative: 'bg-pink-50 text-pink-700',
  General: 'bg-slate-100 text-slate-600',
};

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = STATUS_CONFIG[insight.status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4 flex gap-4`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${cfg.iconColor}`} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`} style={{ fontWeight: 600 }}>
            {cfg.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[insight.category]}`} style={{ fontWeight: 500 }}>
            {insight.category}
          </span>
          <span className="text-slate-400 text-xs">{insight.platform}</span>
        </div>
        <h4 className="text-slate-800 text-sm mb-1" style={{ fontWeight: 600 }}>{insight.title}</h4>
        <p className="text-slate-600 text-xs leading-relaxed">{insight.description}</p>

        {(insight.currentValue || insight.targetValue) && (
          <div className="flex items-center gap-3 mt-2.5">
            {insight.currentValue && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs">Current:</span>
                <span className="text-slate-700 text-xs" style={{ fontWeight: 600 }}>{insight.currentValue}</span>
              </div>
            )}
            {insight.targetValue && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs">Target:</span>
                  <span className="text-slate-700 text-xs" style={{ fontWeight: 600 }}>{insight.targetValue}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 bg-white/60 rounded-lg p-2.5 border border-white/80">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs leading-relaxed">{insight.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const bg = score >= 75 ? 'bg-emerald-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50';
  const textColor = score >= 75 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-700';
  const dash = (score / 100) * 283;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${283 - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg ${textColor}`} style={{ fontWeight: 700 }}>{score}</span>
        </div>
      </div>
      <p className="text-slate-500 text-xs mt-2 text-center" style={{ fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function InsightsTab({ client }: { client: Client }) {
  const insights = client.insights;
  const successCount = insights.filter(i => i.status === 'success').length;
  const warningCount = insights.filter(i => i.status === 'warning').length;
  const dangerCount = insights.filter(i => i.status === 'danger').length;

  // Calculate a simple performance score
  const totalScore = Math.round(
    ((successCount * 100) + (warningCount * 60) + (dangerCount * 20)) / Math.max(insights.length, 1)
  );

  const roasScore = Math.min(100, Math.round((client.roas / Math.max(client.targetROAS, 0.1)) * 100));
  const cpaScore = client.targetCPA > 0 ? Math.min(100, Math.round((client.targetCPA / client.cpa) * 100)) : 75;
  const ctrScore = Math.min(100, Math.round((client.ctr / 3.0) * 100));

  const byCategory: Record<string, Insight[]> = {};
  insights.forEach(i => {
    if (!byCategory[i.category]) byCategory[i.category] = [];
    byCategory[i.category].push(i);
  });

  const successInsights = insights.filter(i => i.status === 'success');
  const warningInsights = insights.filter(i => i.status === 'warning');
  const dangerInsights = insights.filter(i => i.status === 'danger');

  const statusLabel = totalScore >= 75 ? 'Strong Performance' : totalScore >= 50 ? 'Needs Optimization' : 'Immediate Action Needed';
  const statusBg = totalScore >= 75 ? 'from-emerald-600 to-emerald-500' : totalScore >= 50 ? 'from-amber-600 to-amber-500' : 'from-red-600 to-red-500';

  return (
    <div className="space-y-6">
      {/* Performance Score Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${statusBg} p-5 text-white`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-1">Overall Performance Score</p>
            <h2 className="text-white" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{statusLabel}</h2>
            <p className="text-white/70 text-sm mt-1.5">
              Based on {insights.length} automated checks across all platforms · April 2026
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-white/90 text-sm">{successCount} on track</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-300" />
                <span className="text-white/90 text-sm">{warningCount} needs attention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-300" />
                <span className="text-white/90 text-sm">{dangerCount} action required</span>
              </div>
            </div>
          </div>
          {/* Score Rings */}
          <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
            <ScoreRing score={Math.min(100, roasScore)} label="ROAS Score" />
            <ScoreRing score={Math.min(100, cpaScore)} label="CPA Score" />
            <ScoreRing score={Math.min(100, ctrScore)} label="CTR Score" />
          </div>
        </div>
      </div>

      {/* Targets Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Target ROAS', current: client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(1)}×`,
            target: client.targetROAS === 0 ? 'Lead-gen' : `${client.targetROAS}×`,
            ok: client.targetROAS === 0 || client.roas >= client.targetROAS,
            icon: TrendingUp
          },
          {
            label: 'Target CPA', current: formatCurrency(client.cpa, client.currencySymbol),
            target: formatCurrency(client.targetCPA, client.currencySymbol),
            ok: client.targetCPA === 0 || client.cpa <= client.targetCPA,
            icon: Target
          },
          {
            label: 'Budget Utilized', current: `${Math.round((client.totalSpend / client.monthlyBudget) * 100)}%`,
            target: `${formatCurrency(client.monthlyBudget, client.currencySymbol)} budget`,
            ok: client.totalSpend <= client.monthlyBudget,
            icon: Zap
          },
          {
            label: 'CTR', current: formatPercent(client.ctr),
            target: '1.5%+ target',
            ok: client.ctr >= 1.5,
            icon: TrendingUp
          },
        ].map(({ label, current, target, ok, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-xs" style={{ fontWeight: 500 }}>{label}</p>
              <Icon className={`w-3.5 h-3.5 ${ok ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <p className={`text-xl ${ok ? 'text-emerald-700' : 'text-red-700'}`} style={{ fontWeight: 700, lineHeight: 1 }}>
              {current}
            </p>
            <p className="text-slate-500 text-xs mt-1">{target}</p>
          </div>
        ))}
      </div>

      {/* Action Required */}
      {dangerInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-slate-800">Action Required ({dangerInsights.length})</h3>
          </div>
          <div className="space-y-3">
            {dangerInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {warningInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-slate-800">Needs Attention ({warningInsights.length})</h3>
          </div>
          <div className="space-y-3">
            {warningInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}

      {/* On Track */}
      {successInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="text-slate-800">Performing Well ({successInsights.length})</h3>
          </div>
          <div className="space-y-3">
            {successInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
