import { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Tag, Filter, Clock, User, AlertTriangle, StickyNote, ChevronDown } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  timestamp: number;
}

const CATEGORIES = [
  { id: 'general', label: 'General', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'strategy', label: 'Strategy', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'budget', label: 'Budget', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'creative', label: 'Creative', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'call-notes', label: 'Call Notes', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'issue', label: 'Issue', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'action-item', label: 'Action Item', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

const SAMPLE_NOTES: Note[] = [
  {
    id: 'n1',
    content: 'Client called to discuss Q2 strategy. They want to increase budget by 20% for Eid season (May–June). Approved to test new campaign structures in Meta before scaling. Follow up on creative assets by next week.',
    category: 'call-notes',
    author: 'Agency Admin',
    createdAt: 'Apr 28, 2026 · 2:30 PM',
    timestamp: 1745848200000,
  },
  {
    id: 'n2',
    content: 'Snapchat CTR has been consistently low for 3 months. Discussed with client — agreed to pause Snapchat after May 15 if no improvement in CTR above 1.2%. Reallocate $800/month to Meta retargeting.',
    category: 'strategy',
    author: 'Agency Admin',
    createdAt: 'Apr 22, 2026 · 11:15 AM',
    timestamp: 1745244900000,
  },
  {
    id: 'n3',
    content: 'Google Shopping feed has duplicate products causing impression share loss. Merchant Center issue raised with client\'s dev team. Expected fix by Apr 30. Monitor Shopping ROAS closely.',
    category: 'issue',
    author: 'Agency Admin',
    createdAt: 'Apr 18, 2026 · 4:00 PM',
    timestamp: 1744988400000,
  },
  {
    id: 'n4',
    content: 'New product launch planned for May 10 — Premium laptop collection. Need 5 new Meta creatives (video + static) and updated Shopping feed. Client sending product images by May 5.',
    category: 'action-item',
    author: 'Agency Admin',
    createdAt: 'Apr 15, 2026 · 9:45 AM',
    timestamp: 1744706700000,
  },
];

function getCategoryConfig(id: string) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function InternalNotesTab({ clientId }: { clientId: string }) {
  const storageKey = `pd_notes_${clientId}`;
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : SAMPLE_NOTES;
    } catch {
      return SAMPLE_NOTES;
    }
  });
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {}
  }, [notes, storageKey]);

  const handleAddNote = () => {
    if (!newContent.trim()) return;
    const now = new Date();
    const note: Note = {
      id: `note-${Date.now()}`,
      content: newContent.trim(),
      category: newCategory,
      author: 'Agency Admin',
      createdAt: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
    setNotes(prev => [note, ...prev]);
    setNewContent('');
    setNewCategory('general');
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filtered = filterCategory === 'all' ? notes : notes.filter(n => n.category === filterCategory);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Internal Warning Banner */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-amber-800 text-sm" style={{ fontWeight: 600 }}>Internal Only — Not Visible to Clients</p>
          <p className="text-amber-700 text-xs mt-0.5">
            These notes are private to your agency. They will never appear in shared client reports or PDF exports.
          </p>
        </div>
      </div>

      {/* Add Note Area */}
      {adding ? (
        <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>New Internal Note</span>
          </div>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Write your note here… e.g. Client called about Q2 budget, strategy decisions, issues to track, action items…"
            rows={4}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
            autoFocus
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-xs">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => setNewCategory(cat.id)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${newCategory === cat.id ? cat.color : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    style={{ fontWeight: newCategory === cat.id ? 600 : 400 }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => { setAdding(false); setNewContent(''); }}
                className="text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleAddNote} disabled={!newContent.trim()}
                className="text-xs text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 500 }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
          <Plus className="w-4 h-4" />
          Add internal note…
        </button>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => setFilterCategory('all')}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${filterCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          style={{ fontWeight: filterCategory === 'all' ? 600 : 400 }}>
          All ({notes.length})
        </button>
        {CATEGORIES.filter(cat => notes.some(n => n.category === cat.id)).map(cat => (
          <button key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${filterCategory === cat.id ? cat.color : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            style={{ fontWeight: filterCategory === cat.id ? 600 : 400 }}>
            {cat.label} ({notes.filter(n => n.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Notes List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Add your first internal note above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => {
            const cat = getCategoryConfig(note.category);
            return (
              <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.color}`} style={{ fontWeight: 500 }}>
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <User className="w-3 h-3" />
                      <span className="text-xs">{note.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{note.createdAt}</span>
                    </div>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400 italic">{formatRelativeTime(note.timestamp)}</span>
                  </div>
                  <button onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{note.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-400 py-2">
          {filtered.length} note{filtered.length !== 1 ? 's' : ''} · Stored locally in this browser
        </p>
      )}
    </div>
  );
}
