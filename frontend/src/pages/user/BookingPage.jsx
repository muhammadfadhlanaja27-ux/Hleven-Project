import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet } from "../../services/apiCache";
import { getStorageUrl } from "../../services/imageUrl";
import { getInitialSearchValues, fmtDateStr } from "../../services/searchStorage";

const SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

const loadSnapScript = () =>
  new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    if (document.querySelector(`script[src="${SNAP_URL}"]`)) {
      const check = setInterval(() => {
        if (window.snap) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error("Snap load timeout")); }, 8000);
      return;
    }
    const s = document.createElement("script");
    s.src = SNAP_URL;
    s.setAttribute("data-client-key", CLIENT_KEY || "");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.body.appendChild(s);
  });

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const init = useMemo(() => getInitialSearchValues(searchParams), [searchParams]);

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");


  const [phone, setPhone] = useState('');
  const [bookingFor, setBookingFor] = useState('me');
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkInDate, setCheckInDate] = useState(init.checkInStr);
  const [checkOutDate, setCheckOutDate] = useState(init.checkOutStr);

  const [adults, setAdults] = useState(init.adults);
  const [children, setChildren] = useState(init.children);
  const [roomQty, setRoomQty] = useState(init.rooms);

  const [suggestionData, setSuggestionData] = useState(null);
  const [orderId, setOrderId] = useState("HLVN-98234-AX");
  const [paymentId, setPaymentId] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const pollRef = useRef(null);
  const wasGuestRef = useRef(false);

  const minRequiredRooms = useMemo(() => {
    const capacity = room?.capacity_adult || 2;
    return Math.max(1, Math.ceil(adults / capacity));
  }, [adults, room]);

  const maxAvailableStock = useMemo(() => {
    return Math.max(1, room?.stock ?? 10);
  }, [room]);

  useEffect(() => {
    if (roomQty < minRequiredRooms) {
      setRoomQty(minRequiredRooms);
    } else if (roomQty > maxAvailableStock) {
      setRoomQty(maxAvailableStock);
    }
  }, [minRequiredRooms, maxAvailableStock, roomQty]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      } catch (err) {
        console.error("Gagal membaca data user:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);

      if (!hotelId || !roomId) {
        setHotel(null);
        setRoom(null);
        setLoading(false);
        return;
      }

      try {
        const TTL_2MENIT = 2 * 60 * 1000;
        const { data: responseData, fromCache } = await cachedGet(
          `/hotels/${hotelId}`,
          {},
          false,
          TTL_2MENIT
        );
        if (responseData && responseData.data) {
          const apiHotel = responseData.data;
          const apiRooms = (apiHotel.room_types || []).filter((r) => r.is_active !== false);
          const matchedRoomType = apiRooms.find((r) => String(r.id) === String(roomId));

          if (matchedRoomType) {
            const thumbnailPhoto = matchedRoomType.photos && matchedRoomType.photos.length > 0
              ? (matchedRoomType.photos.find(p => p.is_thumbnail) || matchedRoomType.photos[0])
              : null;
            const roomPhotoPath = thumbnailPhoto ? (thumbnailPhoto.photo || thumbnailPhoto.url) : null;
            const roomImage = roomPhotoPath ? getStorageUrl(roomPhotoPath) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23ccc'%3E%3Crect width='400' height='300' fill='%23ccc'/%3E%3Ctext x='200' y='160' font-family='sans-serif' font-size='18' fill='%23666' text-anchor='middle'%3ENo Photo Available%3C/text%3E%3C/svg%3E";

            const hotelThumbRaw = apiHotel.thumbnail;
            const hotelImage = hotelThumbRaw
              ? (typeof hotelThumbRaw === 'object'
                  ? (hotelThumbRaw.photo || hotelThumbRaw.url ? getStorageUrl(hotelThumbRaw.photo || hotelThumbRaw.url) : null)
                  : getStorageUrl(hotelThumbRaw))
              : null;
            let liveStock = null;
            if (checkInDate && checkOutDate) {
              try {
                const ci = checkInDate instanceof Date ? fmtDateStr(checkInDate) : String(checkInDate).split('T')[0];
                const co = checkOutDate instanceof Date ? fmtDateStr(checkOutDate) : String(checkOutDate).split('T')[0];
                const { data: liveResponse } = await cachedGet(`/hotels/${hotelId}/rooms`, { params: { check_in: ci, check_out: co } });
                const liveRooms = liveResponse?.data || [];
                const liveRoom = liveRooms.find(r => String(r.id) === String(matchedRoomType.id));
                if (liveRoom && liveRoom.available_stock !== undefined) liveStock = liveRoom.available_stock;
              } catch (e) {}
            }
            const mappedRoom = {
              id: matchedRoomType.id,
              name: matchedRoomType.name,
              price: matchedRoomType.weekday_price,
              weekday_price: matchedRoomType.weekday_price,
              weekend_price: matchedRoomType.weekend_price,
              stock: liveStock ?? matchedRoomType.stock ?? 10,
              capacity: `${matchedRoomType.capacity_adult || 2} Dewasa, ${matchedRoomType.capacity_child || 0} Anak`,
              capacity_adult: matchedRoomType.capacity_adult || 2,
              capacity_child: matchedRoomType.capacity_child || 0,
              description: matchedRoomType.description,
              is_refundable: matchedRoomType.is_refundable !== undefined ? matchedRoomType.is_refundable : true,
              thumbnail: roomImage,
            };

            setHotel({ ...apiHotel, thumbnail: hotelImage });
            setRoom(mappedRoom);
          } else {
            setHotel(apiHotel);
            setRoom(null);
          }
        } else {
          setHotel(null);
          setRoom(null);
        }
      } catch (err) {
        console.error("Backend Error / Gagal memuat data booking:", err);
        setHotel(null);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [hotelId, roomId, checkInDate, checkOutDate]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  const roomPrice = Number(room?.price || room?.weekday_price || 3500000);
  const subtotalPrice = roomPrice * nightsCount * roomQty;
  const taxAndFees = Math.round(subtotalPrice * 0.05);
  const totalPrice = subtotalPrice + taxAndFees;

  const showSuccess = (oid, methodName = "Midtrans", bookingId = null) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setSuccessModalData({
      orderId: oid,
      bookingId,
      hotelName: hotel?.name,
      roomName: room?.name,
      roomQty,
      fullName,
      email,
      methodName,
      totalPrice,
      wasGuest: wasGuestRef.current,
    });
  };

  const startPolling = (pid, oid, bookingId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      if (attempts > 40) {
        clearInterval(pollRef.current);
        toast("Pembayaran belum terkonfirmasi. Cek Transaction History → Sync.", { icon: "ℹ️" });
        return;
      }
      try {
        try { await api.post(`/payments/${pid}/sync`); } catch {}
        const res = await api.get(`/payments/${pid}/status`);
        const ps = res.data?.data?.payment_status;
        const bs = res.data?.data?.booking_status;
        if (ps === "success" || bs === "paid" || bs === "confirmed") {
          clearInterval(pollRef.current);
          showSuccess(oid, res.data?.data?.payment_method || "Midtrans", bookingId);
          toast.success("Pembayaran terkonfirmasi!");
        }
      } catch {}
    }, 3000);
    setTimeout(() => { if (pollRef.current) clearInterval(pollRef.current); }, 120000);
  };

  const handleDownloadETicket = async (bookingId, bookingCode) => {
    try {
      const response = await api.get(`/user/bookings/${bookingId}/e-ticket`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `E-Ticket-${bookingCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("E-Tiket PDF berhasil diunduh.");
    } catch (err) {
      toast.error("E-Tiket belum tersedia — cek email Anda.");
    }
  };

  const payWithSnap = async (token, pid, oid, bookingId) => {
    try {
      await loadSnapScript();
    } catch (e) {
      toast.error(e.message);
      return;
    }
    if (!window.snap) {
      toast.error("Midtrans Snap belum siap");
      return;
    }
    startPolling(pid, oid, bookingId);
    window.snap.pay(token, {
      onSuccess: async () => {
        try { await api.post(`/payments/${pid}/sync`); } catch {}
        try {
          const res = await api.get(`/payments/${pid}/status`);
          showSuccess(oid, res.data?.data?.payment_method || "Midtrans", bookingId);
        } catch { showSuccess(oid, "Midtrans", bookingId); }
        toast.success("Pembayaran berhasil!");
      },
      onPending: () => {
        toast("Menunggu pembayaran — polling cek status...", { icon: "⏳" });
      },
      onError: () => {
        if (pollRef.current) clearInterval(pollRef.current);
        toast.error("Pembayaran gagal");
      },
      onClose: () => {
        toast("Popup ditutup — status tetap dipolling 2 menit", { icon: "ℹ️" });
      },
    });
  };

  const handleOpenPaymentModal = (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast.error("Harap lengkapi Data Tamu (Nama, Email, dan No. Telepon).");
      return;
    }

    if (!CLIENT_KEY) {
      toast.error("VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi");
      return;
    }

    const targetHotelId = hotel?.id || hotelId;
    const targetRoomTypeId = room?.id || roomId;

    if (!targetHotelId || !targetRoomTypeId) {
      toast.error("ID Hotel atau Tipe Kamar tidak valid.");
      return;
    }

    wasGuestRef.current = !localStorage.getItem('token');
    if (wasGuestRef.current) {
      setConfirmData({ targetHotelId, targetRoomTypeId });
    } else {
      doBooking(targetHotelId, targetRoomTypeId);
    }
  };

  const confirmBooking = async () => {
    const { targetHotelId, targetRoomTypeId } = confirmData || {};
    if (!targetHotelId || !targetRoomTypeId) return;
    setConfirmData(null);
    doBooking(targetHotelId, targetRoomTypeId);
  };

  const doBooking = async (targetHotelId, targetRoomTypeId) => {
    setSubmitting(true);
    const payload = {
      hotel_id: Number(targetHotelId),
      room_type_id: Number(targetRoomTypeId),
      check_in: checkInDate,
      check_out: checkOutDate,
      qty: Number(roomQty),
      adults: Number(adults),
      children: Number(children),
      guest_name: fullName,
      guest_email: email,
      guest_phone: phone,
      special_request: specialRequests,
      special_requests: specialRequests,
    };

    try {
      let res;
      try {
        res = await api.post("/bookings", payload);
      } catch (firstErr) {
        if (firstErr.response?.status === 405) {
          res = await api.post("/user/bookings", payload);
        } else {
          throw firstErr;
        }
      }

        if (res.data && res.data.data) {
            const createdBooking = res.data.data.booking || res.data.data;
            const bookingCode = createdBooking.booking_code || createdBooking.order_id || `HLVN-${Math.floor(10000 + Math.random() * 90000)}-AX`;
            const bookingId = createdBooking.id || null;
            const pid = createdBooking.payment?.id || createdBooking.payment_id;
            setOrderId(bookingCode);
            if (pid) setPaymentId(pid);

            // Save auto-generated token only for true guests (never clobber existing session)
            if (res.data.data.token && !localStorage.getItem('token')) {
                localStorage.setItem('token', res.data.data.token);
            }

        let token = null;
        if (pid) {
          try {
            const snapRes = await api.post(`/payments/${pid}/snap-token`);
            token = snapRes.data?.data?.snap_token || snapRes.data?.snap_token;
          } catch (snapErr) {
            console.error("Gagal ambil snap token:", snapErr);
            toast.error(snapErr.response?.data?.message || snapErr.response?.data?.error || "Gagal membuat sesi pembayaran Midtrans");
            return;
          }
        }

        if (!token) {
          toast.error("Snap token tidak tersedia");
          return;
        }

        payWithSnap(token, pid, bookingCode, bookingId);
      }
    } catch (err) {
      const responseData = err.response?.data;

      if (err.response?.status === 422) {
        const errorMessage = responseData?.message || "Kamar tidak memenuhi kriteria pesanan.";
        toast.error(errorMessage);

        if (responseData?.suggestions) {
          setSuggestionData({
            message: errorMessage,
            type: responseData.suggestions.type,
            rooms: responseData.suggestions.rooms || [],
          });
        }
      } else {
        const errorMessage = responseData?.message || "Terjadi kesalahan saat memproses pesanan.";
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-8 bg-[#DCCFC0]/40 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#DCCFC0]/40 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-[#DCCFC0]/40 rounded-2xl"></div>
          <div className="lg:col-span-5 h-96 bg-[#DCCFC0]/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="w-full max-w-[1280px] mx-auto py-20 text-center">
        <h2 className="font-headline-md text-2xl font-bold mb-4 text-[#1e1b16]">
          Kamar Tidak Tersedia
        </h2>
        <p className="font-body-md text-sm text-[#444842] mb-6">
          Tipe kamar atau hotel ini sedang tidak aktif dan tidak dapat dipesan saat ini.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#778873] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#50604d] transition-colors cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-16 text-left">
        <div className="mb-8">
          <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#778873] mb-2 leading-tight">
            Selesaikan Pemesanan Anda
          </h1>
          <p className="font-body-lg text-base md:text-lg text-[#444842]">
            Lengkapi detail di bawah ini untuk mengonfirmasi reservasi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-2xl p-6 border border-[#DCCFC0]/50 shadow-sm">
              <h2 className="font-headline-md text-xl font-bold text-[#778873] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A1BC98]">person</span>
                Data Tamu &amp; Jumlah Kamar
              </h2>

              <form onSubmit={handleOpenPaymentModal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="fullName">
                      Nama Lengkap *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Sesuai KTP / Paspor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="email">
                      Alamat Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Untuk konfirmasi pemesanan"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="phone">
                    Nomor Telepon *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+62 8xx xxxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors"
                  />
                </div>

                <div>
                  <span className="block font-label-md text-xs font-semibold text-[#444842] mb-2">Is this for you or someone else?</span>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" name="bookingFor" value="me" checked={bookingFor === 'me'} onChange={(e) => setBookingFor(e.target.value)} className="form-radio text-[#778873]" />
                      <span className="ml-2">For me</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="bookingFor" value="someone_else" checked={bookingFor === 'someone_else'} onChange={(e) => setBookingFor(e.target.value)} className="form-radio text-[#778873]" />
                      <span className="ml-2">For someone else</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF6F0] rounded-xl border border-[#DCCFC0]/60 flex items-center justify-between">
                  <div>
                    <span className="block font-label-md text-sm font-bold text-[#2D332C]">
                      Jumlah Kamar
                    </span>
                    <span className="font-label-sm text-xs text-[#778873]">
                      Minimal {minRequiredRooms} kamar untuk {adults} dewasa (Tersedia: {maxAvailableStock})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={Number(roomQty) <= minRequiredRooms}
                      onClick={() => setRoomQty((prev) => Math.max(minRequiredRooms, Number(prev) - 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-[#DCCFC0] flex items-center justify-center font-bold text-lg text-[#2D332C] hover:bg-[#e8e2d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-headline-md text-lg font-bold text-[#2D332C] min-w-[20px] text-center">
                      {roomQty}
                    </span>
                    <button
                      type="button"
                      disabled={Number(roomQty) >= maxAvailableStock}
                      onClick={() => setRoomQty((prev) => Math.min(maxAvailableStock, Number(prev) + 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-[#DCCFC0] flex items-center justify-center font-bold text-lg text-[#2D332C] hover:bg-[#e8e2d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-xs font-semibold text-[#444842] mb-2" htmlFor="requests">
                    Permintaan Khusus (Opsional)
                  </label>
                  <textarea
                    id="requests"
                    rows={3}
                    placeholder="Misal: Ranjang tambahan, preferensi lantai atas, check-in terlambat..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-xl px-4 py-3 font-body-md text-sm text-[#1e1b16] focus:outline-none focus:border-[#778873] focus:ring-1 focus:ring-[#778873] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:hidden bg-[#778873] text-white font-label-md text-sm font-semibold py-4 rounded-xl hover:bg-[#50604d] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Memeriksa Ketersediaan..." : "Bayar Sekarang"}
                    <span className="material-symbols-outlined text-base">payments</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-[#e8e2d9] rounded-2xl p-6 flex flex-col gap-5 border border-[#DCCFC0]/60 shadow-md shadow-[#778873]/5">
              <h3 className="font-headline-md text-xl font-bold text-[#778873]">
                Rincian Pemesanan
              </h3>

              <div className="bg-white rounded-xl overflow-hidden flex border border-[#DCCFC0]/40">
                {(room?.thumbnail || hotel?.thumbnail) ? (
                  <img
                    src={room?.thumbnail || hotel?.thumbnail}
                    alt={room?.name}
                    className="w-1/3 object-cover min-h-[90px]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-1/3 min-h-[90px] bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#778873] text-4xl opacity-60">no_photography</span>
                  </div>
                )}
                <div className="p-3 flex flex-col justify-center w-2/3 text-left">
                  <span className="font-label-sm text-[11px] font-bold text-[#778873] uppercase tracking-wider mb-0.5">
                    {hotel?.name || "H'Leven Resort"}
                  </span>
                  <h4 className="font-label-md text-sm font-bold text-[#2D332C] line-clamp-2 leading-tight">
                    {room?.name || "Executive Suite"}
                  </h4>
                  <span className="font-label-sm text-xs text-[#444842] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {adults} Dewasa, {children} Anak ({roomQty} Kamar)
                  </span>
                </div>
              </div>

              {room?.is_refundable ? (
                <div className="p-3 rounded-xl bg-[#4F6F52]/10 border border-[#4F6F52]/20 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#4F6F52] text-[18px] mt-0.5 flex-shrink-0">verified</span>
                  <div className="text-left">
                    <p className="font-label-md text-xs font-bold text-[#4F6F52] uppercase tracking-wider">
                      Reservasi Bisa Direfund
                    </p>
                    <p className="font-body-md text-[11px] text-[#444842] mt-0.5 leading-snug">
                      Pembatalan gratis &amp; pengembalian dana penuh tersedia sampai H-3 sebelum check-in.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] mt-0.5 flex-shrink-0">block</span>
                  <div className="text-left">
                    <p className="font-label-md text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                      Non-Refundable
                    </p>
                    <p className="font-body-md text-[11px] text-[#444842] mt-0.5 leading-snug">
                      Kamar ini tidak dapat dikembalikan dananya apabila Anda membatalkan pesanan.
                    </p>
                  </div>
                </div>
              )}

              <hr className="border-t border-[#DCCFC0]/50" />

              <div className="space-y-3 font-body-md text-sm text-[#2D332C]">
                <div className="flex justify-between items-center">
                  <span>
                    Tarif Kamar ({nightsCount} Malam x {roomQty} Kamar)
                    <span className="text-[#444842] text-xs block">Rp {roomPrice.toLocaleString("id-ID")} / malam</span>
                  </span>
                  <span className="font-semibold">Rp {subtotalPrice.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between items-center text-[#778873]">
                  <span>Pajak &amp; Pelayanan (5%)</span>
                  <span className="font-semibold">Rp {taxAndFees.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <hr className="border-t border-[#DCCFC0]/50" />

              <div className="flex justify-between items-end mb-2">
                <span className="font-headline-md text-lg font-bold text-[#2D332C]">Total</span>
                <span className="font-headline-lg text-2xl font-bold text-[#778873]">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenPaymentModal}
                disabled={submitting}
                className="w-full bg-[#778873] text-white font-label-md text-sm font-semibold py-4 rounded-xl hover:bg-[#50604d] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Bayar Sekarang"}
                <span className="material-symbols-outlined text-base">payments</span>
              </button>

              <p className="font-label-sm text-xs text-[#444842] text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">shield</span>
                Pembayaran aman via Midtrans
              </p>
            </div>
          </div>
        </div>
      </main>

      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#DCCFC0]/60 animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4 text-left font-body-md text-sm text-[#2D332C]">
              <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">Cek Data Tamu</h3>
              <div className="bg-[#faf3ea] rounded-xl p-4 space-y-2.5 border border-[#DCCFC0]/40">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Nama:</span>
                  <span className="font-semibold">{fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Email:</span>
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">No. HP:</span>
                  <span className="font-semibold">{phone}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#ffde5c]/20 border border-[#ffde5c] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#8a6d00] text-[20px] mt-0.5 flex-shrink-0">warning</span>
                <p className="font-body-md text-xs text-[#1e1b16] leading-snug">
                  Pastikan <span className="font-bold">No. HP dan Email sudah benar</span> — E-Tiket hanya dikirim ke email tersebut.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmData(null)}
                  className="flex-1 py-3.5 rounded-xl font-label-md text-sm font-semibold border border-[#DCCFC0] text-[#444842] hover:bg-[#faf3ea] transition-all cursor-pointer active:scale-95"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={confirmBooking}
                  className="flex-1 py-3.5 rounded-xl font-label-md text-sm font-semibold bg-[#778873] text-white hover:bg-[#50604d] transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Sudah Benar, Lanjut Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#DCCFC0]/60 text-center animate-in zoom-in-95 duration-200">
            <div className="bg-[#778873] text-white p-6 flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl mb-2">check_circle</span>
              <h3 className="font-headline-md text-2xl font-bold">Reservasi Berhasil!</h3>
              <p className="font-body-md text-xs opacity-90 mt-1">Terima kasih telah memilih H'Leven</p>
            </div>
            <div className="p-6 space-y-4 text-left font-body-md text-sm text-[#2D332C]">
              <div className="bg-[#faf3ea] rounded-xl p-4 space-y-2.5 border border-[#DCCFC0]/40">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Order ID:</span>
                  <span className="font-bold text-[#778873]">{successModalData.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Hotel:</span>
                  <span className="font-semibold text-right">{successModalData.hotelName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Kamar:</span>
                  <span className="font-semibold text-right">{successModalData.roomName} ({successModalData.roomQty} kamar)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Tamu Utama:</span>
                  <span className="font-semibold">{successModalData.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#444842]">Pembayaran:</span>
                  <span className="font-semibold">{successModalData.methodName}</span>
                </div>
                <hr className="border-t border-[#DCCFC0]/60 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#444842]">Total Dibayar:</span>
                  <span className="font-bold text-lg text-[#778873]">Rp {successModalData.totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
              {successModalData.wasGuest && (
              <div className="p-3 rounded-xl bg-[#ffde5c]/20 border border-[#ffde5c] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#8a6d00] text-[20px] mt-0.5 flex-shrink-0">mail</span>
                <p className="font-body-md text-xs text-[#1e1b16] leading-snug text-left">
                  Pesanan selesai! E-Tiket dikirim ke <span className="font-bold">{successModalData.email}</span> — cek Inbox/Spam.
                </p>
              </div>
              )}
              {successModalData.wasGuest ? (
                <>
                  {successModalData.bookingId && (
                    <button
                      type="button"
                      onClick={() => handleDownloadETicket(successModalData.bookingId, successModalData.orderId)}
                      className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      Download E-Tiket (PDF)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessModalData(null);
                      navigate("/");
                    }}
                    className="w-full py-3.5 rounded-xl font-label-md text-sm font-semibold border border-[#DCCFC0] text-[#444842] hover:bg-[#faf3ea] transition-all cursor-pointer active:scale-95"
                  >
                    Kembali ke Beranda
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalData(null);
                    navigate("/profile", { state: { defaultTab: "history" } });
                  }}
                  className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Lihat Pesanan Saya
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 border border-[#DCCFC0]/60 space-y-4 text-left">
            <div className="flex justify-between items-start border-b border-[#DCCFC0]/60 pb-3">
              <div>
                <h3 className="font-headline-md text-xl font-bold text-[#2D312C]">
                  Kamar Tidak Tersedia
                </h3>
                <p className="text-xs font-semibold text-[#ba1a1a] mt-1">{suggestionData.message}</p>
              </div>
              <button
                onClick={() => setSuggestionData(null)}
                className="text-[#6B6E6A] hover:text-[#2D312C] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="font-body-md text-xs text-[#444842]">
              {suggestionData.rooms && suggestionData.rooms.length > 0
                ? (suggestionData.type === "same_hotel"
                    ? "Pilihan kamar lain yang muat dan tersedia di hotel ini:"
                    : "Semua kamar di hotel ini penuh. Berikut opsi kamar di hotel lain sekitar kota ini:")
                : "Tidak ada opsi kamar alternatif yang tersedia untuk tanggal dan kapasitas tamu yang Anda pilih."}
            </p>

            {suggestionData.rooms && suggestionData.rooms.length > 0 && (
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto p-1">
                {suggestionData.rooms.map((altRoom) => (
                  <div
                    key={altRoom.id}
                    className="p-4 border border-[#DCCFC0] rounded-xl flex justify-between items-center bg-[#faf3ea] hover:border-[#778873] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-headline-sm text-sm font-bold text-[#2D332C]">{altRoom.name}</p>
                      <p className="font-label-sm text-xs text-[#444842]">
                        Kapasitas: {altRoom.capacity_adult} Dewasa, {altRoom.capacity_child || 0} Anak
                      </p>
                      <p className="font-label-md text-xs font-bold text-[#778873]">
                        Rp {Number(altRoom.weekday_price || altRoom.price || 0).toLocaleString("id-ID")} / malam
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSuggestionData(null);
                        navigate(`/booking/${altRoom.hotel_id || hotelId}/${altRoom.id}?checkIn=${checkInDate}&checkOut=${checkOutDate}&adults=${adults}&children=${children}`);
                      }}
                      className="px-4 py-2 bg-[#778873] text-white rounded-xl text-xs font-bold hover:bg-[#50604d] transition-colors shadow-xs cursor-pointer"
                    >
                      Pilih Kamar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
