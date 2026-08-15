import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Search, ExternalLink, Edit2, Trash2, TrendingUp, TrendingDown,
  DollarSign, Target, ChevronRight, X, Users, AlertCircle
} from 'lucide-react';
import { clients as initialClients, Client, formatCurrency, formatNumber } from '../data/mockData';

const CURRENCIES = ['USD', 'AED', 'SAR', 'EUR', 'GBP'];
const BUSINESS_MODELS = ['E-commerce', 'DTC E-commerce', 'Lead Generation', 'SaaS / Subscription', 'B2B'];
const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', AED: 'AED ', SAR: 'SAR ', EUR: '€', GBP: '£' };

const emptyForm = {
  name: '', industry: '', website: '', contactName: '', contactEmail: '',
  currency: 'USD', monthlyBudget: '', targetROAS: '', targetCPA: '',
  businessModel: 'E-commerce', mainConversionEvent: '',
};

type FormData = typeof emptyForm;

function ClientCard({ client, onEdit, onDelete, onClick }: {
  client: Client;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
  onClick: (c: Client) => void;
}) {
  const roasOk = client.roas >= client.targetROAS;
  const cpaOk = client.targetCPA > 0 ? client.cpa <= client.targetCPA : null;

  const platformColors: Record<string, string> = {
    meta: '#1877F2', google: '#4285F4', snapchat: '#FFB800', tiktok: '#FF0050',
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group cursor-pointer overflow-hidden"
      onClick={() => onClick(client)}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ backgroundColor: client.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
              style={{ backgroundColor: client.color, fontWeight: 700 }}>
              {client.initials}
            </div>
            <div>
              <h3 className="text-slate-800 text-sm leading-tight" style={{ fontWeight: 600 }}>
                {client.name}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">{client.industry}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs ${client.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
              style={{ fontWeight: 500 }}>
              {client.status === 'active' ? '● Active' : '○ Paused'}
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-slate-500 text-xs mb-0.5">Spend</p>
            <p className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              {formatCurrency(client.totalSpend, client.currencySymbol, true)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-slate-500 text-xs mb-0.5">Revenue</p>
            <p className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              {formatCurrency(client.totalRevenue, client.currencySymbol, true)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-slate-500 text-xs mb-0.5">ROAS</p>
            <p className={`text-sm ${roasOk ? 'text-emerald-600' : 'text-red-600'}`} style={{ fontWeight: 600 }}>
              {client.targetROAS === 0 ? 'N/A' : `${client.roas.toFixed(1)}×`}
            </p>
          </div>
        </div>

        {/* Target indicators */}
        <div className="flex items-center gap-2 mb-4">
          {client.targetROAS > 0 && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${roasOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {roasOk ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>ROAS {roasOk ? '▲' : '▼'} {client.targetROAS}× target</span>
            </div>
          )}
          {client.targetCPA > 0 && cpaOk !== null && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${cpaOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <Target className="w-3 h-3" />
              <span>CPA {cpaOk ? '✓' : '↑'}</span>
            </div>
          )}
        </div>

        {/* Platform dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Object.entries(platformColors).map(([platform, color]) => (
              <div key={platform}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: color, fontSize: '8px', fontWeight: 700 }}
                title={platform}>
                {platform[0].toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onEdit(client); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(client); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onClick(client); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onSave }: {
  client: Client | null;
  onClose: () => void;
  onSave: (data: FormData, isEdit: boolean, id?: string) => void;
}) {
  const isEdit = !!client;
  const [form, setForm] = useState<FormData>(client ? {
    name: client.name, industry: client.industry,
    website: client.website, contactName: client.contactName,
    contactEmail: client.contactEmail, currency: client.currency,
    monthlyBudget: String(client.monthlyBudget), targetROAS: String(client.targetROAS),
    targetCPA: String(client.targetCPA), businessModel: client.businessModel,
    mainConversionEvent: client.mainConversionEvent,
  } : { ...emptyForm });

  const set = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-slate-800" style={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Section: Client Info */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Client Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Client Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. TechStore Arabia" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Industry</label>
                <input value={form.industry} onChange={e => set('industry', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. E-commerce Electronics" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Website</label>
                <input value={form.website} onChange={e => set('website', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="www.example.com" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Contact Name</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@client.com" />
              </div>
            </div>
          </div>

          {/* Section: Targets */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>Target Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Monthly Budget ({CURRENCY_SYMBOLS[form.currency]})</label>
                <input type="number" value={form.monthlyBudget} onChange={e => set('monthlyBudget', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Target ROAS (0 = N/A)</label>
                <input type="number" value={form.targetROAS} onChange={e => set('targetROAS', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 4.0" step="0.1" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Target CPA ({CURRENCY_SYMBOLS[form.currency]})</label>
                <input type="number" value={form.targetCPA} onChange={e => set('targetCPA', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 25" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Business Model</label>
                <select value={form.businessModel} onChange={e => set('businessModel', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {BUSINESS_MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1" style={{ fontWeight: 500 }}>Main Conversion Event</label>
                <input value={form.mainConversionEvent} onChange={e => set('mainConversionEvent', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Purchase" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
            style={{ fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={() => onSave(form, isEdit, client?.id)}
            className="px-4 py-2 text-sm text-white rounded-lg transition-all hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 500 }}>
            {isEdit ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ client, onClose, onConfirm }: {
  client: Client;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-slate-800 mb-2" style={{ fontWeight: 600 }}>Delete Client</h3>
        <p className="text-slate-500 text-sm mb-6">
          Are you sure you want to delete <span className="text-slate-800" style={{ fontWeight: 500 }}>{client.name}</span>?
          This action cannot be undone and all associated data will be removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
            style={{ fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            style={{ fontWeight: 500 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsListPage() {
  const navigate = useNavigate();
  const [clientList, setClientList] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const filtered = clientList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form: FormData, isEdit: boolean, id?: string) => {
    if (isEdit && id) {
      setClientList(prev => prev.map(c => c.id === id ? {
        ...c,
        name: form.name, industry: form.industry, website: form.website,
        contactName: form.contactName, contactEmail: form.contactEmail,
        currency: form.currency as any,
        currencySymbol: CURRENCY_SYMBOLS[form.currency] || '$',
        monthlyBudget: Number(form.monthlyBudget),
        targetROAS: Number(form.targetROAS),
        targetCPA: Number(form.targetCPA),
        businessModel: form.businessModel,
        mainConversionEvent: form.mainConversionEvent,
      } : c));
      setEditClient(null);
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        name: form.name || 'New Client',
        industry: form.industry || 'Unknown',
        color: '#6366F1',
        initials: (form.name || 'NC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        status: 'active',
        currency: form.currency as any,
        currencySymbol: CURRENCY_SYMBOLS[form.currency] || '$',
        targetROAS: Number(form.targetROAS) || 0,
        targetCPA: Number(form.targetCPA) || 0,
        monthlyBudget: Number(form.monthlyBudget) || 0,
        businessModel: form.businessModel,
        mainConversionEvent: form.mainConversionEvent,
        website: form.website,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        totalSpend: 0, totalRevenue: 0, totalConversions: 0, totalImpressions: 0,
        roas: 0, cpa: 0, ctr: 0,
        monthlyData: [],
        platforms: {
          meta: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, conversions: 0, cpa: 0, monthlyData: [], campaigns: [] },
          google: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, conversions: 0, cpa: 0, monthlyData: [], campaigns: [], searchTerms: [] },
          snapchat: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, conversions: 0, cpa: 0, monthlyData: [], campaigns: [] },
          tiktok: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, conversions: 0, cpa: 0, monthlyData: [], campaigns: [] },
        },
        insights: [],
      };
      setClientList(prev => [...prev, newClient]);
      setAddModal(false);
    }
  };

  const handleDelete = () => {
    if (deleteClient) {
      setClientList(prev => prev.filter(c => c.id !== deleteClient.id));
      setDeleteClient(null);
    }
  };

  const totalSpend = clientList.filter(c => c.status === 'active').reduce((s, c) => s + c.totalSpend, 0);
  const activeCount = clientList.filter(c => c.status === 'active').length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {clientList.length} clients · {activeCount} active
          </p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg hover:shadow-md transition-all self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Clients', value: String(clientList.length), icon: Users, color: 'indigo' },
          { label: 'Active Clients', value: String(activeCount), icon: TrendingUp, color: 'emerald' },
          { label: 'Active Monthly Spend', value: `$${(totalSpend / 1000).toFixed(0)}K+`, icon: DollarSign, color: 'blue' },
          { label: 'Avg. Client ROAS', value: `${(clientList.filter(c => c.targetROAS > 0).reduce((s, c) => s + c.roas, 0) / clientList.filter(c => c.targetROAS > 0).length).toFixed(1)}×`, icon: Target, color: 'violet' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-xs">{label}</p>
              <div className={`w-7 h-7 rounded-lg bg-${color}-50 flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-500`} />
              </div>
            </div>
            <p className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients by name or industry…"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No clients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={setEditClient}
              onDelete={setDeleteClient}
              onClick={c => navigate(`/clients/${c.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {(addModal || editClient) && (
        <ClientModal
          client={editClient}
          onClose={() => { setAddModal(false); setEditClient(null); }}
          onSave={handleSave}
        />
      )}
      {deleteClient && (
        <DeleteModal
          client={deleteClient}
          onClose={() => setDeleteClient(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
