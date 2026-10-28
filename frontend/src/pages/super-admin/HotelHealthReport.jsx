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

  const filteredData = data.filter(h =>
    h.hotel_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="p-6">Memuat laporan...</p>;

  return (
    <div className="p-lg">
      <h2 className="font-headline-lg text-on-surface mb-md">Laporan Kesehatan Hotel</h2>
      <input
        type="text"
        placeholder="Cari hotel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-md p-sm border border-outline bg-surface rounded-md w-full focus:border-primary outline-none"
      />
      <div className="overflow-x-auto bg-surface-container-lowest rounded-lg border border-outline-variant shadow-card">
        <table className="w-full text-left font-body-md">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="p-sm font-label-lg uppercase tracking-wider">Nama Hotel</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Health Score</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Rating</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Cancel Rate</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Lost Revenue</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Status</th>
              <th className="p-sm font-label-lg uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((h) => (
              <tr key={h.hotel_id} className="border-b border-outline-variant last:border-0 h-[56px] hover:bg-surface-container-low transition-colors">
                <td className="p-sm font-medium text-on-surface">{h.hotel_name}</td>
                <td className="p-sm text-on-surface">{h.health_score}</td>
                <td className="p-sm text-on-surface">{h.average_rating}</td>
                <td className="p-sm text-on-surface">{h.cancellation_rate}</td>
                <td className="p-sm text-on-surface">Rp{h.lost_revenue.toLocaleString()}</td>
                <td className={`p-sm font-bold ${h.status === 'critical' ? 'text-error' : h.status === 'warning' ? 'text-tertiary' : 'text-primary'}`}>
                  {h.status.toUpperCase()}
                </td>
                <td className="p-sm">
                  <button onClick={() => setSelectedHotel(h)} className="text-primary hover:underline font-semibold text-sm">
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm flex items-center justify-center p-md z-50" onClick={() => setSelectedHotel(null)}>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-modal w-full max-w-lg border border-outline-variant" onClick={e => e.stopPropagation()}>
            <h3 className="font-headline-md text-on-surface mb-md">{selectedHotel.hotel_name} - Detail</h3>
            <div className="space-y-xs mb-lg font-body-md text-on-surface-variant">
              <p><span className="font-semibold text-on-surface">Health Score:</span> {selectedHotel.health_score}</p>
              <p><span className="font-semibold text-on-surface">Potensi Kerugian:</span> Rp{selectedHotel.lost_revenue.toLocaleString()}</p>
            </div>
            
            <div className="border-t border-outline-variant pt-md">
              <h4 className="font-label-lg uppercase tracking-wider mb-sm text-primary">Kirim Peringatan</h4>
              <input 
                type="text" 
                placeholder="Judul peringatan" 
                className="w-full p-sm border border-outline bg-surface rounded-md mb-sm focus:border-primary outline-none" 
                value={warningTitle}
                onChange={(e) => setWarningTitle(e.target.value)}
              />
              <textarea 
                placeholder="Pesan peringatan..." 
                className="w-full p-sm border border-outline bg-surface rounded-md mb-md focus:border-primary outline-none" 
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
              />
              <div className="flex gap-sm">
                <button className="flex-1 p-sm bg-surface-container hover:bg-surface-container-high rounded-md transition-colors" onClick={() => setSelectedHotel(null)}>Tutup</button>
                <button 
                  className="flex-1 p-sm bg-primary text-on-primary rounded-md hover:bg-primary-container transition-colors disabled:opacity-50" 
                  onClick={handleSendWarning}
                  disabled={sendingWarning}
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
