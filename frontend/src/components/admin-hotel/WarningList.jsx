import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const fmtDateTime = (str) => {
  if (!str) return '—';
  try {
    return new Date(str.replace(' ', 'T')).toLocaleString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return str; }
};

const warningBadge = (w) => {
  const s = (w.status || 'unread').toLowerCase();
  const base = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border";
  if (s === 'closed') return <span className={`${base} bg-[#E4EBE0] text-[#4A5D43] border-[#4A5D43]/20`}>Closed</span>;
  if (s === 'read') return <span className={`${base} bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]/20`}>Read</span>;
  return <span className={`${base} bg-[#FFDAD6] text-[#93000A] border-[#93000A]/20`}>Unread</span>;
};

const appealBadge = (status) => {
  const base = "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
  if (status === 'pending') return <span className={`${base} bg-amber-100 text-amber-800 border-amber-300`}>Appeal Review</span>;
  if (status === 'approved') return <span className={`${base} bg-green-100 text-green-800 border-green-300`}>Appeal Approved</span>;
  if (status === 'rejected') return <span className={`${base} bg-red-100 text-red-800 border-red-300`}>Appeal Rejected</span>;
  return null;
};

export default function WarningList() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [marking, setMarking] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  const fetchWarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/warnings');
      const list = res.data?.data || res.data || [];
      setWarnings(Array.isArray(list) ? list : []);
    } catch {
      setWarnings([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWarnings(); }, [fetchWarnings]);

  const markAsRead = useCallback(async (id) => {
    setMarking(true);
    try {
      const res = await api.patch(`/admin/warnings/${id}/read`);
      const updated = res.data?.data || null;
      setWarnings((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'read', read_at: updated?.read_at || new Date().toISOString() } : w)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: 'read', read_at: updated?.read_at || prev.read_at || new Date().toISOString() } : prev));
    } catch {
      toast.error('Failed to mark warning as read.');
    } finally { setMarking(false); }
  }, []);

  const openDetail = (w) => {
    setSelected(w);
    setShowAppealForm(false);
    setAppealReason('');
    if ((w.status || '').toLowerCase() === 'unread') markAsRead(w.id);
  };

  const handleSendAppeal = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!appealReason.trim() || appealReason.trim().length < 10) {
      toast.error('Appeal reason must be at least 10 characters.');
      return;
    }
    setSubmittingAppeal(true);
    try {
      await api.post('/admin/appeals', { warning_id: selected.id, reason: appealReason.trim() });
      toast.success('Appeal submitted successfully.');
      setShowAppealForm(false);
      setAppealReason('');
      fetchWarnings();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appeal.');
    } finally { setSubmittingAppeal(false); }
  };

  if (loading) return <div className="py-20 text-center text-sm text-[#6B6E6A]">Loading warnings...</div>;

  if (warnings.length === 0) {
    return <div className="bg-white border border-[#E5E1DA] rounded-2xl p-8 text-center text-sm text-[#6B6E6A] shadow-sm">No warning letters.</div>;
  }

  return (
    <div className="space-y-4">
      {warnings.map((w) => {
        const unread = (w.status || '').toLowerCase() === 'unread';
        const latestAppeal = Array.isArray(w.appeals) && w.appeals.length > 0 ? w.appeals[w.appeals.length - 1] : null;

        return (
          <button
            key={w.id}
            onClick={() => openDetail(w)}
            className={`w-full text-left bg-white border rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all ${unread ? 'border-amber-400' : 'border-[#E5E1DA]'}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${unread ? 'bg-amber-100 text-amber-700' : 'bg-[#F9F6F1] text-[#506147]'}`}>
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#2D312C] truncate">{w.title}</p>
                  <p className="text-xs text-[#6B6E6A] mt-1 line-clamp-1">{w.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-[#6B6E6A]/70">{fmtDateTime(w.created_at)}</span>
                    {latestAppeal && appealBadge(latestAppeal.status)}
                  </div>
                </div>
              </div>
              {warningBadge(w)}
            </div>
          </button>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] max-w-lg w-full z-10 animate-slideUp">
            <div className="bg-[#fcf9f5] px-6 py-5 border-b border-[#E5E1DA] flex justify-between items-start">
              <div>
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">{selected.title}</h3>
                <p className="text-xs text-[#6B6E6A] mt-1 font-medium">Issued: {fmtDateTime(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#6B6E6A] hover:text-[#2D312C] p-1"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="p-4 bg-[#F9F6F1] rounded-xl border border-[#E5E1DA] text-[#444840] leading-relaxed text-xs font-medium whitespace-pre-wrap">
                {selected.message}
              </div>

              {/* Status Banding */}
              {(() => {
                const cur = warnings.find((w) => w.id === selected.id) || selected;
                const latest = Array.isArray(cur.appeals) && cur.appeals.length > 0 ? cur.appeals[cur.appeals.length - 1] : null;
                if (!latest) return null;
                return (
                  <div className="p-4 rounded-xl bg-stone-50 border border-[#E5E1DA] text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#2D312C]">
                      <span>Appeal History:</span> {appealBadge(latest.status)}
                    </div>
                    <p className="text-[#6B6E6A] italic">"{latest.reason}"</p>
                    {latest.admin_note && <p className="text-[#2D312C] border-t pt-2">Super Admin Note: <span className="font-semibold">{latest.admin_note}</span></p>}
                  </div>
                );
              })()}

              {showAppealForm && (
                <form onSubmit={handleSendAppeal} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Appeal Form</h4>
                  <textarea rows={3} maxLength={2000} value={appealReason} onChange={(e) => setAppealReason(e.target.value)} placeholder="Write appeal reason..." className="w-full p-3 text-xs bg-white border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none" required />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAppealForm(false)} className="px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-300 rounded-lg">Cancel</button>
                    <button type="submit" disabled={submittingAppeal} className="px-4 py-1.5 text-xs font-bold bg-[#506147] text-white rounded-lg hover:bg-[#3b4b33]">Submit</button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-6 pt-0 border-t border-[#E5E1DA] flex justify-between items-center gap-2">
              {(() => {
                const cur = warnings.find((w) => w.id === selected.id) || selected;
                const isClosed = (cur.status || '').toLowerCase() === 'closed';
                const hasPendingAppeal = Array.isArray(cur.appeals) && cur.appeals.some((a) => a.status === 'pending');
                if (!isClosed && !hasPendingAppeal && !showAppealForm) return (
                  <button onClick={() => setShowAppealForm(true)} className="px-4 py-2.5 border border-[#8a6d00] text-[#8a6d00] rounded-xl text-xs font-bold hover:bg-[#8a6d00]/5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">gavel</span> Appeal
                  </button>
                );
                return <div />;
              })()}
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)} className="px-4 py-2.5 border border-[#E5E1DA] rounded-xl text-xs font-bold hover:bg-[#F9F6F1]">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
