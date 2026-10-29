import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const HotelHealthReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [warningTitle, setWarningTitle] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get("/super-admin/dashboard/hotel-health");
        setData(res.data.data);
      } catch (e) {
        toast.error("Gagal memuat laporan kesehatan hotel.");
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleSendWarning = async () => {
    if (!warningTitle || !warningMessage) {
      toast.error("Judul dan pesan peringatan harus diisi.");
      return;
    }
    setSendingWarning(true);
    try {
      await api.post("/super-admin/warnings", {
        hotel_id: selectedHotel.hotel_id,
        title: warningTitle,
        message: warningMessage,
      });
      toast.success("Peringatan berhasil dikirim.");
      setSelectedHotel(null);
      setWarningTitle("");
      setWarningMessage("");
    } catch (e) {
      toast.error("Gagal mengirim peringatan.");
    } finally {
      setSendingWarning(false);
    }
  };

  const filteredData = data.filter((h) =>
    h.hotel_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-hanken">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-newsreader text-[32px] font-semibold text-[#4f604f] tracking-[-0.02em] leading-tight font-['Newsreader',serif]">
            Laporan Kesehatan Hotel
          </h2>
          <p className="font-hanken text-[14px] text-[#747872] mt-1">
            Pantau performa operasional, pembatalan, dan potensi risiko tiap hotel mitra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747872] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Cari nama hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E0D8] rounded-lg font-hanken text-[14px] text-[#191c1b] placeholder-[#747872] focus:outline-none focus:border-[#768875] focus:ring-2 focus:ring-[#768875]/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Card Table */}
      <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(47,50,49,0.06)] border border-[#E5E0D8] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[#E5E0D8] border-t-[#768875] rounded-full animate-spin"></div>
            <p className="font-hanken text-[14px] text-[#747872]">Memuat laporan kesehatan hotel...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F6F1] border-b border-[#E5E0D8] font-hanken text-[12px] font-semibold leading-[1] text-[#434842] uppercase tracking-[0.05em]">
                  <th className="py-4 px-6">Nama Hotel</th>
                  <th className="py-4 px-6">Health Score</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Cancel Rate</th>
                  <th className="py-4 px-6">Lost Revenue</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-hanken text-[14px] text-[#191c1b] divide-y divide-[#E5E0D8]">
                {filteredData.length > 0 ? (
                  filteredData.map((h) => {
                    const statusStr = (h.status || "").toLowerCase();
                    let badgeClass = "bg-[#d1eac9] text-[#0c200c]";
                    if (statusStr === "critical") badgeClass = "bg-[#ffdad6] text-[#93000a]";
                    else if (statusStr === "warning") badgeClass = "bg-amber-100 text-amber-900";

                    return (
                      <tr key={h.hotel_id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-[#191c1b]">{h.hotel_name}</td>
                        <td className="py-4 px-6 font-semibold">{h.health_score}</td>
                        <td className="py-4 px-6">{h.average_rating || "-"}</td>
                        <td className="py-4 px-6">{h.cancellation_rate || "0%"}</td>
                        <td className="py-4 px-6 font-semibold">Rp {(h.lost_revenue || 0).toLocaleString("id-ID")}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-hanken text-[11px] font-semibold tracking-[0.05em] uppercase ${badgeClass}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedHotel(h)}
                            className="font-hanken text-[13px] font-semibold text-[#768875] hover:text-[#4f604f] transition-colors border border-[#768875] px-3 py-1.5 rounded-lg hover:bg-[#768875]/5 active:scale-95"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#747872] font-hanken text-[14px]">
                      Tidak ada data hotel yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail / Kirim Warning */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedHotel(null)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-[0_12px_40px_rgba(47,50,49,0.12)] p-7 border border-[#E5E0D8] z-10 font-hanken">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-newsreader text-[24px] font-semibold text-[#4f604f] font-['Newsreader',serif]">
                  {selectedHotel.hotel_name}
                </h3>
                <p className="font-hanken text-[13px] text-[#747872] mt-1">Laporan Kesehatan &amp; Risiko</p>
              </div>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-[#747872] hover:text-[#191c1b] p-1.5 rounded-lg hover:bg-[#F9F6F1] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-3 bg-[#F9F6F1] rounded-lg border border-[#E5E0D8]">
                <span className="text-xs text-[#747872] block uppercase font-semibold">Health Score</span>
                <span className="text-lg font-bold text-[#191c1b]">{selectedHotel.health_score}</span>
              </div>
              <div className="p-3 bg-[#F9F6F1] rounded-lg border border-[#E5E0D8]">
                <span className="text-xs text-[#747872] block uppercase font-semibold">Potensi Kerugian</span>
                <span className="text-lg font-bold text-[#ba1a1a]">Rp {(selectedHotel.lost_revenue || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="border-t border-[#E5E0D8] pt-4 space-y-3">
              <h4 className="font-semibold text-[#191c1b] text-sm">Kirim Peringatan</h4>
              <input
                type="text"
                placeholder="Judul peringatan..."
                value={warningTitle}
                onChange={(e) => setWarningTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#E5E0D8] rounded-lg text-sm font-hanken text-[#191c1b] focus:outline-none focus:border-[#768875]"
              />
              <textarea
                placeholder="Pesan peringatan..."
                rows={3}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#E5E0D8] rounded-lg text-sm font-hanken text-[#191c1b] focus:outline-none focus:border-[#768875]"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHotel(null)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-sm font-semibold text-[#434842] hover:bg-[#F9F6F1]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSendWarning}
                  disabled={sendingWarning}
                  className="px-5 py-2 bg-[#ba1a1a] text-white rounded-lg text-sm font-semibold hover:bg-[#93000a] disabled:opacity-50"
                >
                  {sendingWarning ? "Mengirim..." : "Kirim Peringatan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelHealthReport;
