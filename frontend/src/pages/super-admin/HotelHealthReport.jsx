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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Laporan Kesehatan Hotel</h2>
      <input
        type="text"
        placeholder="Cari hotel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Nama Hotel</th>
              <th className="p-3">Health Score</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Cancel Rate</th>
              <th className="p-3">Lost Revenue</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((h) => (
              <tr key={h.hotel_id} className="border-t">
                <td className="p-3 font-medium">{h.hotel_name}</td>
                <td className="p-3">{h.health_score}</td>
                <td className="p-3">{h.average_rating}</td>
                <td className="p-3">{h.cancellation_rate}</td>
                <td className="p-3">Rp{h.lost_revenue.toLocaleString()}</td>
                <td className={`p-3 font-bold ${h.status === 'critical' ? 'text-red-600' : h.status === 'warning' ? 'text-orange-500' : 'text-green-600'}`}>
                  {h.status.toUpperCase()}
                </td>
                <td className="p-3">
                  <button onClick={() => setSelectedHotel(h)} className="text-blue-600 hover:underline font-medium">
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedHotel(null)}>
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{selectedHotel.hotel_name} - Detail</h3>
            <div className="space-y-2 mb-6">
              <p><strong>Health Score:</strong> {selectedHotel.health_score}</p>
              <p><strong>Potensi Kerugian:</strong> Rp{selectedHotel.lost_revenue.toLocaleString()}</p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-bold mb-2">Kirim Peringatan</h4>
              <input 
                type="text" 
                placeholder="Judul peringatan" 
                className="w-full p-2 border rounded mb-2" 
                value={warningTitle}
                onChange={(e) => setWarningTitle(e.target.value)}
              />
              <textarea 
                placeholder="Pesan peringatan..." 
                className="w-full p-2 border rounded mb-4" 
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-gray-200 rounded" onClick={() => setSelectedHotel(null)}>Tutup</button>
                <button 
                  className="flex-1 p-2 bg-red-600 text-white rounded disabled:bg-red-400" 
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
