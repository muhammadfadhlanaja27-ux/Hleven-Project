import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmtDateTime = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return str; }
};

const badge = (w) => {
  const s = (w.status || 'unread').toLowerCase();
  if (s === 'closed') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Selesai</span>;
  if (s === 'read') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Sudah Dibaca</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Belum Dibaca</span>;
};

export default function WarningList() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [marking, setMarking] = useState(false);

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
      toast.error('Gagal menandai peringatan dibaca.');
    } finally { setMarking(false); }
  }, []);

  const openDetail = (w) => {
    setSelected(w);
    if ((w.status || '').toLowerCase() === 'unread') markAsRead(w.id);
  };

  if (loading) return <p className="text-sm text-[#6B6E6A]">Memuat peringatan...</p>;

  if (warnings.length === 0) {
    return (
      <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 text-center text-sm text-[#6B6E6A]">
        Tidak ada surat peringatan dari Super Admin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((w) => {
        const unread = (w.status || '').toLowerCase() === 'unread';
        return (
          <button
            key={w.id}
            onClick={() => openDetail(w)}
            className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow transition-shadow ${unread ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#E5E1DA]'}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${unread ? 'bg-amber-100 text-amber-700' : 'bg-[#E4EBE0] text-[#506147]'}`}>
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2D312C] truncate">{w.title}</p>
                  <p className="text-xs text-[#6B6E6A] truncate mt-0.5">{w.message}</p>
                  <p className="text-[11px] text-[#6B6E6A]/70 mt-1">{fmtDateTime(w.created_at)}</p>
                </div>
              </div>
              {badge(w)}
            </div>
          </button>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-[#E5E1DA] max-w-lg w-full z-10 p-6">
            <div className="flex justify-between items-start gap-2 pb-4 border-b border-[#E5E1DA]">
              <div>
                <h3 className="font-semibold text-[#2D312C]">{selected.title}</h3>
                <p className="text-[11px] text-[#6B6E6A] mt-0.5">Diterbitkan: {fmtDateTime(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#6B6E6A] hover:text-[#2D312C] p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm">
              <div className="p-3.5 bg-[#F9F6F1] rounded-xl border border-[#E5E1DA] text-[#2D312C] whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>
              <div className="flex items-center justify-between">
                {badge({ ...selected, status: (warnings.find((w) => w.id === selected.id)?.status || selected.status) })}
                {selected.read_at && <span className="text-[11px] text-[#6B6E6A]">Dibaca: {fmtDateTime(selected.read_at)}</span>}
              </div>
            </div>
            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-2">
              {(warnings.find((w) => w.id === selected.id)?.status || selected.status) === 'unread' && (
                <button
                  onClick={() => markAsRead(selected.id)}
                  disabled={marking}
                  className="px-4 py-2 bg-[#506147] text-white rounded-xl text-sm font-semibold hover:bg-[#3b4b33] disabled:opacity-50 transition-colors"
                >
                  {marking ? 'Memproses...' : 'Tandai Dibaca'}
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border border-[#E5E1DA] text-[#434842] hover:bg-[#F9F6F1] rounded-xl text-sm font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
