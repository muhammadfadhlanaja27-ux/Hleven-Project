import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const rupiah = (v) => "Rp " + Number(v || 0).toLocaleString("id-ID");
const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const pad = (n) => String(n).padStart(2, "0");

export default function RoomCalendar() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [room, setRoom] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [price, setPrice] = useState("");
  const [closed, setClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/rooms")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const arr = Array.isArray(list) ? list : [];
        setRooms(arr);
        if (arr.length) setRoomId(String(arr[0].id));
      })
       .catch(() => toast.error("Failed to load room list."));
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/rooms/${roomId}/calendar`, { params: { month } });
      const data = res.data?.data || {};
      setRoom(data.room_type || null);
      setDays(data.days || []);
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  }, [roomId, month]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const shiftMonth = (delta) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const openEdit = (day) => {
    setEditing(day);
    setPrice(day.price ? String(Math.round(day.price)) : "");
    setClosed(!!day.is_closed);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/admin/rooms/${roomId}/calendar`, {
        days: [
          {
            date: editing.date,
            price: price === "" ? null : Number(price),
            is_closed: closed,
          },
        ],
      });
      toast.success("Tanggal diperbarui.");
      setEditing(null);
      loadCalendar();
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const firstDate = days.length ? new Date(`${days[0].date}T00:00:00`) : null;
  const leadingBlanks = firstDate ? (firstDate.getDay() + 6) % 7 : 0;
  const monthLabel = firstDate
    ? firstDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : month;

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
              Kalender & Harga Kamar
            </h2>
            <p className="text-base text-[#6B6E6A] mt-1">
              Atur harga khusus dan kelola ketersediaan kamar pada tanggal tertentu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadCalendar()}
              disabled={loading}
              className="px-4 py-2 rounded bg-[#506147] text-white text-xs font-semibold hover:bg-[#53634a] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-[#a2ba9c]"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Pilih Tipe Kamar</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-10 px-3 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all min-w-[240px]"
            >
               {rooms.length === 0 && <option value="">No rooms</option>}
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="w-10 h-10 rounded-full border border-[#E5E0D8] bg-white hover:bg-[#f0ede9] text-[#2D312C] transition-colors flex items-center justify-center shadow-xs"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="bg-[#f0ede9] px-6 py-2 rounded-full min-w-[160px] text-center">
                <span className="text-sm font-bold text-[#2D312C] capitalize">
                  {monthLabel}
                </span>
              </div>
              <button
                onClick={() => shiftMonth(1)}
                className="w-10 h-10 rounded-full border border-[#E5E0D8] bg-white hover:bg-[#f0ede9] text-[#2D312C] transition-colors flex items-center justify-center shadow-xs"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Legend */}
        {room && (
          <div className="flex flex-wrap items-center gap-6 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Harga Dasar:</span>
              <div className="flex gap-3 text-xs font-semibold text-[#2D312C]">
                <span className="px-2 py-1 bg-[#E4EBE0] text-[#506147] rounded">Weekday {rupiah(room.weekday_price)}</span>
                <span className="px-2 py-1 bg-[#F2EBE1] text-[#7A5C3C] rounded">Weekend {rupiah(room.weekend_price)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Kapasitas Stok:</span>
              <span className="text-xs font-semibold text-[#2D312C] bg-white border border-[#E5E1DA] px-2 py-1 rounded">{room.stock} Kamar</span>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-[0px_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#E5E1DA] bg-[#F9F6F1]">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-4 text-center text-[12px] font-bold uppercase tracking-[0.1em] text-[#757870]">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-4 border-[#E5E1DA] border-t-[#506147] rounded-full animate-spin"></div>
              <p className="text-[#6B6E6A] text-sm">Menyelaraskan data kalender...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} className="bg-[#fcf9f5]/30 border-b border-r border-[#F0EDE9]" />
              ))}
              {days.map((day, idx) => {
                const full = day.available_stock <= 0;
                const isWeekend = (leadingBlanks + idx + 1) % 7 === 6 || (leadingBlanks + idx + 1) % 7 === 0;
                
                let bgColor = "bg-white";
                let borderColor = "border-[#F0EDE9]";
                let textColor = "text-[#2D312C]";
                let stockColor = "text-[#6B6E6A]";

                if (day.is_closed) {
                  bgColor = "bg-[#FFDAD6]/30";
                  textColor = "text-[#93000A]";
                  stockColor = "text-[#93000A]/70";
                } else if (full) {
                  bgColor = "bg-[#F0EDE9]/50";
                  textColor = "text-[#6B6E6A]";
                  stockColor = "text-[#6B6E6A]";
                } else if (isWeekend) {
                  bgColor = "bg-[#FBFBFA]";
                }

                return (
                  <button
                    key={day.date}
                    onClick={() => openEdit(day)}
                    className={`group relative text-left p-3 min-h-[110px] border-b border-r transition-all hover:bg-[#A8BBA2]/5 ${bgColor} ${borderColor} ${textColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold opacity-60">{Number(day.date.slice(-2))}</span>
                      {day.is_closed && (
                        <span className="material-symbols-outlined text-[16px] text-[#93000A]">block</span>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-[13px] font-bold tracking-tight">
                        {rupiah(day.price)}
                      </div>
                      <div className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${stockColor}`}>
                        {day.is_closed ? "Tutup" : full ? "Penuh" : `Sisa ${day.available_stock}`}
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[18px] text-[#506147]">edit</span>
                    </div>
                  </button>
                );
              })}
              {/* Fill blanks at the end */}
              {Array.from({ length: (7 - (leadingBlanks + days.length) % 7) % 7 }).map((_, i) => (
                <div key={`end-blank-${i}`} className="bg-[#fcf9f5]/30 border-b border-r border-[#F0EDE9]" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Standardized Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm animate-fadeIn" onClick={() => setEditing(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] max-w-md w-full z-10 overflow-hidden animate-slideUp">
            
            <div className="bg-[#fcf9f5] px-6 py-5 border-b border-[#E5E1DA] flex justify-between items-start">
              <div>
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">Atur Tanggal</h3>
                <p className="text-xs text-[#6B6E6A] mt-1 font-medium">
                  {new Date(`${editing.date}T00:00:00`).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button onClick={() => setEditing(null)} className="text-[#6B6E6A] hover:text-[#2D312C] transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider block">
                  Harga Khusus (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={String(Math.round(editing.base_price))}
                    className="w-full h-12 pl-4 pr-12 bg-white border border-[#E5E0D8] rounded-xl text-sm font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-4 focus:ring-[#506147]/5 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6E6A] text-xs font-bold">IDR</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrice("")}
                  className="text-[11px] text-[#506147] font-bold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Gunakan Harga Dasar ({rupiah(editing.base_price)})
                </button>
              </div>

              <div className="p-4 bg-[#FFDAD6]/20 border border-[#BA1A1A]/10 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={closed}
                    onChange={(e) => setClosed(e.target.checked)}
                    className="w-5 h-5 accent-[#BA1A1A] rounded-md border-[#BA1A1A]"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#93000A]">Tutup Penjualan Kamar</span>
                    <p className="text-[11px] text-[#93000A]/80 mt-0.5">Tamu tidak akan bisa melakukan booking pada tanggal ini.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="flex-1 h-11 rounded-xl border border-[#E5E0D8] text-sm font-bold text-[#434842] hover:bg-[#F9F6F1] transition-all disabled:opacity-50"
              >
                 Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 h-11 rounded-xl bg-[#506147] text-white text-sm font-bold hover:bg-[#3b4b33] transition-all shadow-sm active:scale-[0.98] disabled:bg-[#a2ba9c]"
              >
                {saving ? "Memproses..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
