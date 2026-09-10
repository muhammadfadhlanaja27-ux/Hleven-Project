import { useState, useEffect } from "react";
import { cachedGet } from "../services/apiCache";
import api from "../services/api";

const ReviewSection = ({ hotelId, roomTypes = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [roomTypeId, setRoomTypeId] = useState("all");

  // Form
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [form, setForm] = useState({ booking_id: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hotels/${hotelId}/reviews`, {
        params: { page, limit: 10, search, rating, roomTypeId },
      });
      setReviews(res.data.data.data || []);
      setTotalPages(res.data.data.last_page || 1);
      setStats(res.data.stats || { average_rating: 0, total_reviews: 0 });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchEligibleBookings = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get(`/hotels/${hotelId}/eligible-bookings`);
      setEligibleBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [hotelId, page, search, rating, roomTypeId]);

  useEffect(() => {
    fetchEligibleBookings();
  }, [hotelId, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.booking_id) return alert("Pilih pesanan yang ingin di-review.");
    setSubmitting(true);
    try {
      await api.post(`/hotels/${hotelId}/reviews`, form);
      alert("Review berhasil dikirim!");
      setForm({ booking_id: "", rating: 5, comment: "" });
      fetchEligibleBookings();
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengirim review");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16 pt-10 border-t border-[#DCCFC0]/40">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#778873] mb-1">
            Ulasan Tamu
          </h2>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#A0522D]">star</span>
            <span className="font-bold text-lg">{Number(stats.average_rating).toFixed(1)}</span>
            <span className="text-sm text-[#444842]">({stats.total_reviews} Ulasan)</span>
          </div>
        </div>
      </div>

      {isAuthenticated && eligibleBookings.length > 0 && (
        <div className="bg-[#DCCFC0]/20 border border-[#DCCFC0]/60 rounded-2xl p-5 mb-8">
          <h3 className="font-label-md text-sm font-bold text-[#778873] uppercase mb-4">Tulis Ulasan Anda</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={form.booking_id}
              onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
              className="w-full border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] text-sm"
              required
            >
              <option value="">-- Pilih Pesanan (Completed) --</option>
              {eligibleBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Booking #{b.booking_code} - {b.booking_rooms?.map(r => r.room_type?.name).join(', ')}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2 items-center">
              <label className="text-sm font-semibold">Rating:</label>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className="material-symbols-outlined cursor-pointer text-xl"
                  style={{ color: star <= form.rating ? '#A0522D' : '#DCCFC0' }}
                  onClick={() => setForm({ ...form, rating: star })}
                >
                  star
                </span>
              ))}
            </div>

            <textarea
              placeholder="Bagikan pengalaman menginap Anda..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] text-sm h-24"
              required
            />
            <button type="submit" disabled={submitting} className="bg-[#778873] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#50604d]">
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari ulasan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] text-sm w-full"
        />
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] text-sm w-full">
          <option value="all">Semua Bintang</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>Bintang {r}</option>)}
        </select>
        <select value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)} className="border border-[#DCCFC0] rounded-xl p-3 bg-[#FDF6ED] text-sm w-full">
          <option value="all">Semua Tipe Kamar</option>
          {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? <p className="text-sm">Memuat...</p> : reviews.length === 0 ? <p className="text-sm text-gray-500">Belum ada ulasan.</p> : reviews.map((review) => {
          const roomNames = review.booking?.booking_rooms?.map(r => r.room_type?.name).join(', ') || 'Kamar';
          const nights = review.booking?.total_night || 0;
          const guests = review.booking?.guests?.length || 0;
          
          return (
            <div key={review.id} className="bg-[#faf3ea] rounded-2xl p-5 border border-[#DCCFC0]/40">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-[#1e1b16]">{review.user?.name || 'User'}</h4>
                  <p className="text-xs text-[#444842]">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex text-[#A0522D]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#DCCFC0]/30 text-[#444842] px-2 py-1 rounded text-[10px] font-semibold">{roomNames}</span>
                <span className="bg-[#DCCFC0]/30 text-[#444842] px-2 py-1 rounded text-[10px] font-semibold">{nights} Malam</span>
                <span className="bg-[#DCCFC0]/30 text-[#444842] px-2 py-1 rounded text-[10px] font-semibold">{guests} Tamu</span>
              </div>
              <p className="text-sm text-[#1e1b16]">{review.comment}</p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-[#778873] rounded text-sm disabled:opacity-50">‹</button>
          <span className="px-3 py-1 text-sm font-bold">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border border-[#778873] rounded text-sm disabled:opacity-50">›</button>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
