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

const warningBadge = (w) => {
  const s = (w.status || 'unread').toLowerCase();
  if (s === 'closed') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Selesai</span>;
  if (s === 'read') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Sudah Dibaca</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Belum Dibaca</span>;
};

const appealBadge = (status) => {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Banding Menunggu Review</span>;
  if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">Banding Disetujui</span>;
  if (status === 'rejected') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">Banding Ditolak</span>;
  return null;
};

export default function WarningList() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [marking, setMarking] = useState(false);

  // Form State untuk Banding Warning
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
      toast.error('Gagal menandai peringatan dibaca.');
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
      toast.error('Alasan banding minimal 10 karakter.');
      return;
    }
    setSubmittingAppeal(true);
    try {
      await api.post('/admin/appeals', {
        warning_id: selected.id,
        reason: appealReason.trim(),
      });
      toast.success('Banding atas peringatan berhasil diajukan ke Super Admin!');
      setShowAppealForm(false);
      setAppealReason('');
      fetchWarnings();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan banding.');
    } finally {
      setSubmittingAppeal(false);
    }
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
        const latestAppeal = Array.isArray(w.appeals) && w.appeals.length > 0
          ? w.appeals[w.appeals.length - 1]
          : null;

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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#2D312C] truncate">{w.title}</p>
                    {latestAppeal && appealBadge(latestAppeal.status)}
                  </div>
                  <p className="text-xs text-[#6B6E6A] truncate mt-0.5">{w.message}</p>
                  <p className="text-[11px] text-[#6B6E6A]/70 mt-1">{fmtDateTime(w.created_at)}</p>
                </div>
              </div>
              {warningBadge(w)}
            </div>
          </button>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-[#E5E1DA] max-w-lg w-full z-10 p-6 animate-fadeIn">
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
              <div className="p-3.5 bg-[#F9F6F1] rounded-xl border border-[#E5E1DA] text-[#2D312C] whitespace-pre-wrap leading-relaxed text-xs">
                {selected.message}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {warningBadge({ ...selected, status: (warnings.find((w) => w.id === selected.id)?.status || selected.status) })}
                {selected.read_at && <span className="text-[11px] text-[#6B6E6A]">Dibaca: {fmtDateTime(selected.read_at)}</span>}
              </div>

              {/* Status Banding jika ada */}
              {(() => {
                const cur = warnings.find((w) => w.id === selected.id) || selected;
                const latestAppeal = Array.isArray(cur.appeals) && cur.appeals.length > 0
                  ? cur.appeals[cur.appeals.length - 1]
                  : null;

                if (latestAppeal) {
                  return (
                    <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-[#E5E1DA] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#2D312C]">Riwayat Banding Peringatan:</span>
                        {appealBadge(latestAppeal.status)}
                      </div>
                      <p className="text-[#6B6E6A] italic">&ldquo;{latestAppeal.reason}&rdquo;</p>
                      {latestAppeal.admin_note && (
                        <p className="text-[#2D312C] pt-1">
                          Catatan Super Admin: <span className="font-medium">{latestAppeal.admin_note}</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Form Aju Banding Peringatan */}
              {showAppealForm && (
                <form onSubmit={handleSendAppeal} className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-900">Form Pengajuan Banding Peringatan</h4>
                  <p className="text-[11px] text-amber-800">
                    Sampaikan argumen atau bukti perbaikan untuk meminta pembatalan surat peringatan ini.
                  </p>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Tuliskan alasan banding secara jelas (minimal 10 karakter)..."
                    className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                  <div className="flex justify-between items-center text-[10px] text-amber-800">
                    <span>{appealReason.length}/2000 karakter</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAppealForm(false)}
                        className="px-3 py-1 text-xs border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAppeal || appealReason.trim().length < 10}
                        className="px-3.5 py-1 text-xs bg-[#506147] text-white font-semibold rounded-lg hover:bg-[#3b4b33] disabled:opacity-50"
                      >
                        {submittingAppeal ? 'Mengirim...' : 'Kirim Banding'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-between items-center gap-2">
              <div>
                {/* Tombol Buka Form Banding jika warning belum closed dan belum ada pending appeal */}
                {(() => {
                  const cur = warnings.find((w) => w.id === selected.id) || selected;
                  const isClosed = (cur.status || '').toLowerCase() === 'closed';
                  const hasPendingAppeal = Array.isArray(cur.appeals) && cur.appeals.some((a) => a.status === 'pending');

                  if (!isClosed && !hasPendingAppeal && !showAppealForm) {
                    return (
                      <button
                        type="button"
                        onClick={() => setShowAppealForm(true)}
                        className="px-3.5 py-2 border border-[#8a6d00] text-[#8a6d00] hover:bg-[#8a6d00]/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        <span>Aju Banding Peringatan</span>
                      </button>
                    );
                  }
                  return <div />;
                })()}
              </div>

              <div className="flex gap-2">
                {(warnings.find((w) => w.id === selected.id)?.status || selected.status) === 'unread' && (
                  <button
                    onClick={() => markAsRead(selected.id)}
                    disabled={marking}
                    className="px-4 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold hover:bg-[#3b4b33] disabled:opacity-50 transition-colors"
                  >
                    {marking ? 'Memproses...' : 'Tandai Dibaca'}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 border border-[#E5E1DA] text-[#434842] hover:bg-[#F9F6F1] rounded-xl text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
