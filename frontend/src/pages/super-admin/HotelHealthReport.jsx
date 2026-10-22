import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const HotelHealthReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((h) => (
              <tr key={h.hotel_id} className="border-t">
                <td className="p-3 font-medium">{h.hotel_name}</td>
                <td className="p-3">{h.health_score}</td>
                <td className="p-3">{h.average_rating}</td>
                <td className="p-3">{h.cancellation_rate}</td>
                <td className={`p-3 font-bold ${h.status === 'critical' ? 'text-red-600' : h.status === 'warning' ? 'text-orange-500' : 'text-green-600'}`}>
                  {h.status.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotelHealthReport;
