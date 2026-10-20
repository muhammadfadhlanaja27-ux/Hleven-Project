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
      .catch(() => toast.error("Gagal memuat daftar kamar."));
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
      toast.error(err.response?.data?.message || "Gagal memuat kalender.");
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
      toast.error(err.response?.data?.message || "Gagal menyimpan perubahan.");
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Newsreader',serif] text-3xl font-semibold text-[#2D312C]">
          Kalender &amp; Harga Kamar
        </h1>
        <p className="text-sm text-[#6B6E6A] mt-1">
          Atur harga khusus dan tutup tanggal tertentu. Tanggal yang ditutup tidak dapat dipesan tamu.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="p-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
        >
          {rooms.length === 0 && <option value="">Tidak ada kamar</option>}
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => shiftMonth(-1)}
            className="w-9 h-9 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#F5F3EF] text-[#2D312C]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-sm font-semibold text-[#2D312C] w-40 text-center capitalize">
            {monthLabel}
          </span>
          <button
            onClick={() => shiftMonth(1)}
            className="w-9 h-9 rounded-lg border border-[#E5E0D8] bg-white hover:bg-[#F5F3EF] text-[#2D312C]"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {room && (
        <div className="mb-4 text-xs text-[#6B6E6A]">
          Harga dasar: weekday <strong>{rupiah(room.weekday_price)}</strong> / weekend{" "}
          <strong>{rupiah(room.weekend_price)}</strong> — stok {room.stock} kamar.
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-4">
        {loading ? (
          <p className="text-sm text-[#6B6E6A] p-6">Memuat kalender...</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B6E6A] py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((day) => {
                const full = day.available_stock <= 0;
                const tone = day.is_closed
                  ? "bg-red-50 border-red-200 text-red-700"
                  : full
                    ? "bg-gray-100 border-gray-200 text-gray-500"
                    : "bg-white border-[#E5E1DA] hover:border-[#506147] text-[#2D312C]";
                return (
                  <button
                    key={day.date}
                    onClick={() => openEdit(day)}
                    className={`text-left rounded-lg border p-2 min-h-[74px] transition-colors ${tone}`}
                  >
                    <div className="text-sm font-semibold">{Number(day.date.slice(-2))}</div>
                    <div className="text-[11px] mt-1">{rupiah(day.price)}</div>
                    {day.is_closed ? (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase">Tutup</span>
                    ) : full ? (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase">Penuh</span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] text-[#6B6E6A]">
                        sisa {day.available_stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-[#2D312C] mb-1">Atur Tanggal</h2>
            <p className="text-xs text-[#6B6E6A] mb-4">
              {new Date(`${editing.date}T00:00:00`).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Harga khusus (kosongkan untuk harga dasar)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={String(Math.round(editing.base_price))}
                className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm focus:outline-none focus:border-[#506147]"
              />
              <button
                type="button"
                onClick={() => setPrice("")}
                className="self-start text-[11px] text-[#506147] font-semibold hover:underline"
              >
                Pakai harga dasar ({rupiah(editing.base_price)})
              </button>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
                className="w-4 h-4 accent-[#506147]"
              />
              <span className="text-sm text-[#2D312C]">Tutup tanggal ini (tidak bisa dipesan)</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-semibold text-[#434842] hover:bg-[#F5F3EF] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-[#506147] text-white text-sm font-semibold hover:bg-[#3b4b33] disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
