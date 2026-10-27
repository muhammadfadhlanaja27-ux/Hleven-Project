import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";
import { getStorageUrl } from "../../services/imageUrl";
import { getInitialSearchValues, fmtDateStr } from "../../services/searchStorage";

const SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

// Helper validasi token ketat
const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  return Boolean(
    token &&
    token !== "null" &&
    token !== "undefined" &&
    token.trim() !== ""
  );
};

const loadSnapScript = () =>
  new Promise((resolve, reject) => {
    if (window.snap) return resolve();

    const existingScript = document.querySelector(`script[src="${SNAP_URL}"]`);
    if (existingScript) {
      const check = setInterval(() => {
        if (window.snap) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("Snap load timeout"));
      }, 8000);
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

  const getLocalDateStr = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const searchParams = new URLSearchParams(location.search);
  const paramCheckIn = searchParams.get("checkIn") || searchParams.get("check_in");
  const paramCheckOut = searchParams.get("checkOut") || searchParams.get("check_out");

  const todayStr = getLocalDateStr();
  const next2Days = getLocalDateStr(new Date(Date.now() + 2 * 86400000));

  // Data States
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [priceQuote, setPriceQuote] = useState(null);
  const [priceQuoteError, setPriceQuoteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookerContact, setBookerContact] = useState({ name: '', email: '', phone: '' });

  // Synchronous submission locks
  const isSubmittingRef = useRef(false);
  const submitLockRef = useRef(false);
  const pollRef = useRef(null);
  const idempotencyKeyRef = useRef(null);

  // Form State: Pemesan Utama
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkInDate, setCheckInDate] = useState(paramCheckIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(paramCheckOut || next2Days);

  // Dynamic Guest & Room Input States
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
  const [roomQty, setRoomQty] = useState(1);

  // Modal States
  const [suggestionData, setSuggestionData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentScreen, setPaymentScreen] = useState("methods");
  const [orderId, setOrderId] = useState("HLVN-98234-AX");
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [qrisTimer, setQrisTimer] = useState(15 * 60 - 1);
  const [successModalData, setSuccessModalData] = useState(null);

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

  // Riwayat hanya bisa dimiliki akun login (user_bookings difilter user_id),
  // jadi paksa login dulu lalu kembali ke halaman booking ini.
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
    }
  }, [navigate, location.pathname, location.search]);

  const [bookingFor, setBookingFor] = useState("me");
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const handleBookingForSomeoneElseChange = (checked) => {
    setBookingFor(checked ? "someone_else" : "me");
    if (checked) {
      setFullName("");
      setEmail("");
      setPhone("");
      return;
    }
  };

  useEffect(() => {
    const fetchAndAutofillUser = async () => {
      let userData = null;

      // 1. Ambil data awal dari localStorage jika ada
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          userData = JSON.parse(savedUser);
        } catch (err) {
          console.error("Gagal membaca data user dari localStorage:", err);
        }
      }

      // 2. Ambil data profil terbaru dari API jika user sudah login (memiliki token)
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await api.get("/user/profile");
          const apiUser = res.data?.user || res.data?.data || res.data;
          if (apiUser) {
            userData = { ...userData, ...apiUser };
          }
        } catch (err) {
          console.warn("Gagal mengambil data profil dari API, menggunakan localStorage:", err);
        }
      }

      // 3. Set state nama, email, dan telepon
      if (userData) {
        const computedName =
          userData.name ||
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim();

        if (computedName) setFullName(computedName);
        if (userData.email) setEmail(userData.email);
        if (userData.phone) setPhone(userData.phone);

        setIsAutoFilled(true);
      }
    };

    fetchAndAutofillUser();
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
        const { data: responseData } = await cachedGet(
          `/hotels/${hotelId}`,
          {},
          false,
          TTL_2MENIT
        );
        if (responseData && responseData.data) {
          const apiHotel = responseData.data;
          const apiRooms = (apiHotel.room_types || apiHotel.roomTypes || []).filter((r) => r.is_active !== false);
          const matchedRoomType = apiRooms.find((r) => String(r.id) === String(roomId));

          if (matchedRoomType) {
            const thumbnailPhoto = matchedRoomType.photos && matchedRoomType.photos.length > 0
              ? (matchedRoomType.photos.find(p => p.is_thumbnail) || matchedRoomType.photos[0])
              : null;
            const roomPhotoPath = thumbnailPhoto ? (thumbnailPhoto.photo || thumbnailPhoto.url) : null;
            const roomImage = roomPhotoPath
              ? (roomPhotoPath.startsWith('http') ? roomPhotoPath : `http://localhost:8000/storage/${roomPhotoPath.replace(/^\//, '')}`)
              : null;

            const hotelThumbRaw = apiHotel.thumbnail;
            const hotelImage = hotelThumbRaw
              ? (typeof hotelThumbRaw === 'object'
                ? (hotelThumbRaw.photo || hotelThumbRaw.url || null)
                : (hotelThumbRaw.startsWith('http') ? hotelThumbRaw : `http://localhost:8000/storage/${String(hotelThumbRaw).replace(/^\//, '')}`))
              : null;

            const mappedRoom = {
              id: matchedRoomType.id,
              name: matchedRoomType.name,
              price: matchedRoomType.weekday_price,
              weekday_price: matchedRoomType.weekday_price,
              weekend_price: matchedRoomType.weekend_price,
              stock: matchedRoomType.stock ?? 10,
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
  }, [hotelId, roomId]);

  useEffect(() => {
    let timer = null;
    if (showPaymentModal && paymentScreen === "qris" && qrisTimer > 0) {
      timer = setInterval(() => {
        setQrisTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPaymentModal, paymentScreen, qrisTimer]);

  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  useEffect(() => {
    let active = true;

    const fetchPriceQuote = async () => {
      if (!hotelId || !room?.id || !checkInDate || !checkOutDate || !roomQty) {
        if (active) {
          setPriceQuote(null);
          setPriceQuoteError("");
        }
        return;
      }

      setPriceQuoteError("");
      try {
        const response = await api.post("/bookings/quote", {
          hotel_id: Number(hotelId),
          room_type_id: Number(room.id),
          check_in: checkInDate,
          check_out: checkOutDate,
          qty: Number(roomQty),
        });
        if (active) {
          setPriceQuote(response.data?.data || null);
          setPriceQuoteError("");
        }
      } catch (error) {
        if (active) {
          setPriceQuote(null);
          const responseData = error.response?.data;
          const validationMessage = responseData?.errors
            ? Object.values(responseData.errors).flat().find(Boolean)
            : null;
          setPriceQuoteError(
            responseData?.message ||
            validationMessage ||
            "Gagal memeriksa harga dan ketersediaan kamar."
          );
        }
      }
    };

    fetchPriceQuote();

    return () => {
      active = false;
    };
  }, [hotelId, room?.id, checkInDate, checkOutDate, roomQty]);

  const roomPrice = Number(room?.price || room?.weekday_price || 350000);
  const taxRate = Number(priceQuote?.tax_rate ?? hotel?.tax_rate ?? 5);
  const subtotalPrice = Number(priceQuote?.subtotal ?? roomPrice * nightsCount * roomQty);
  const taxAndFees = Number(priceQuote?.tax ?? (subtotalPrice * taxRate) / 100);
  const totalPrice = Number(priceQuote?.grand_total ?? subtotalPrice + taxAndFees);

  const dynamicQrUrl = useMemo(() => {
    const qrisPayload = `00020101021226670016ID.CO.QRIS.WWW01189360091100000000005204581253033605802ID5913HLEVEN HOTEL6007BANDUNG61054011562070703A016304|ORDER:${orderId}|TOTAL:${totalPrice}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrisPayload)}`;
  }, [orderId, totalPrice]);

  const handleOpenPaymentModal = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast.error("Harap lengkapi Data Tamu (Nama, Email, dan No. Telepon).");
      return;
    }

    const targetHotelId = hotel?.id || hotelId;
    const targetRoomTypeId = room?.id || roomId;

    if (!targetHotelId || !targetRoomTypeId) {
      toast.error("ID Hotel atau Tipe Kamar tidak valid.");
      return;
    }

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
      const res = await api.post("/user/bookings", payload);

      if (res.data && res.data.data) {
        invalidateCache("/user/bookings");
        const createdBooking = res.data.data.booking || res.data.data;
        // Riwayat memakai cache 30 detik; hapus agar booking baru langsung tampak
        invalidateCache("/user/bookings");
        const paymentData = res.data.data.payment || createdBooking?.payment;
        setOrderId(createdBooking.booking_code || `HLVN-${Math.floor(10000 + Math.random() * 90000)}-AX`);
        setCurrentBookingId(createdBooking.id || null);
        if (paymentData?.id) {
          setCurrentPaymentId(paymentData.id);
        }
        setPaymentScreen("methods");
        setShowPaymentModal(true);
      }
    } catch (err) {
      const responseData = err.response?.data;

      if (err.response?.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: location } });
      } else if (err.response?.status === 422) {
        const validationMessage = responseData?.errors
          ? Object.values(responseData.errors).flat().find(Boolean)
          : null;
        const errorMessage = responseData?.message || validationMessage || "Kamar tidak memenuhi kriteria pesanan.";
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

  const handleSelectPaymentMethod = (method) => {
    if (method === "qris") {
      setQrisTimer(15 * 60 - 1);
      setPaymentScreen("qris");
    } else {
      confirmPaymentSuccess(method);
    }
  };

  const confirmPaymentSuccess = async (methodName = "QRIS") => {
    setSubmitting(true);
    try {
      let paymentIdToMark = currentPaymentId;

      if (!paymentIdToMark && currentBookingId) {
        try {
          const checkRes = await api.get(`/bookings/${currentBookingId}`);
          paymentIdToMark = checkRes.data?.data?.payment?.id;
        } catch (_) { }
      }

      if (paymentIdToMark) {
        await api.post(`/payments/${paymentIdToMark}/mark-paid`, {
          payment_method: methodName,
        });
      }

      invalidateCache("/user/bookings");
      setShowPaymentModal(false);
      setSuccessModalData({
        orderId,
        hotelName: hotel?.name,
        roomName: room?.name,
        roomQty,
        fullName,
        methodName,
        totalPrice,
      });
      toast.success("Pembayaran berhasil dikonfirmasi!");
    } catch (err) {
      console.error("Gagal mengonfirmasi pembayaran:", err);
      toast.error(err.response?.data?.message || "Gagal mengonfirmasi pembayaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTimer = useMemo(() => {
    if (qrisTimer <= 0) return "Waktu Habis";
    const minutes = Math.floor(qrisTimer / 60);
    const seconds = qrisTimer % 60;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mStr}:${sStr}`;
  }, [qrisTimer]);

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-xl font-bold text-[#778873] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A1BC98]">person</span>
                  Data Tamu &amp; Jumlah Kamar
                </h2>
                {isAutoFilled && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-semibold rounded-full border border-[#4F6F52]/20">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Terisi dari profil Anda
                  </span>
                )}
              </div>

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
                    {submitting ? "Memeriksa Ketersediaan..." : "Lanjut ke Pembayaran"}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
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
                {priceQuoteError && (
                  <p role="alert" className="rounded-lg border border-[#ba1a1a]/20 bg-[#ba1a1a]/10 p-3 text-xs text-[#ba1a1a]">
                    {priceQuoteError}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span>
                    Tarif Kamar ({nightsCount} Malam x {roomQty} Kamar)
                    <span className="text-[#444842] text-xs block">Rp {roomPrice.toLocaleString("id-ID")} / malam</span>
                  </span>
                  <span className="font-semibold">Rp {subtotalPrice.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between items-center text-[#778873]">
                  <span>Pajak &amp; Pelayanan (21%)</span>
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
                {submitting ? "Memeriksa Ketersediaan..." : "Lanjut ke Pembayaran"}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>

              <p className="font-label-sm text-xs text-[#444842] text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">shield</span>
                Pembayaran aman dienkripsi
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1b16]/40 backdrop-blur-sm animate-in fade-in duration-200">
          {paymentScreen === "methods" ? (
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left border border-[#DCCFC0]/60 animate-in zoom-in-95 duration-200">
              <div className="bg-[#778873] text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-label-md text-sm font-bold">H'Leven Hospitality</h3>
                  <p className="font-label-sm text-xs opacity-80">Order ID: {orderId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:text-[#DCCFC0] transition-colors p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="p-4 bg-[#f4ede4] text-center border-b border-[#DCCFC0]/40">
                <p className="font-label-sm text-xs text-[#444842] uppercase tracking-wide mb-1">
                  Total Pembayaran
                </p>
                <p className="font-headline-md text-2xl font-bold text-[#2D332C]">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="p-5 overflow-y-auto max-h-[400px] space-y-3">
                <p className="font-label-md text-xs font-semibold text-[#2D332C] uppercase tracking-wider mb-2">
                  Pilih Metode Pembayaran
                </p>

                <div
                  onClick={() => handleSelectPaymentMethod("qris")}
                  className="border border-[#778873] bg-[#baccb4]/15 rounded-xl p-4 cursor-pointer hover:bg-[#baccb4]/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#778873] text-3xl">
                      qr_code_scanner
                    </span>
                    <div>
                      <p className="font-label-md text-sm font-bold text-[#2D332C]">QRIS</p>
                      <p className="font-label-sm text-xs text-[#444842]">GoPay, OVO, ShopeePay, m-BCA, dsb.</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#778873]">chevron_right</span>
                </div>
              </div>

              <div className="p-3 bg-[#faf3ea] border-t border-[#DCCFC0]/30 text-center">
                <p className="font-label-sm text-xs text-[#444842]">Secured by Midtrans Gateway</p>
              </div>
            </div>
          ) : (
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left border border-[#DCCFC0]/60 animate-in zoom-in-95 duration-200">
              <div className="bg-[#778873] text-white p-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setPaymentScreen("methods")}
                  className="text-white hover:text-[#DCCFC0] transition-colors flex items-center gap-1 text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                  Kembali
                </button>
                <h3 className="font-label-md text-sm font-bold">Pembayaran QRIS</h3>
                <div className="w-6"></div>
              </div>

              <div className="p-6 flex flex-col items-center justify-center bg-[#FDF6ED] text-center">
                <p className="font-label-md text-xs text-[#2D332C] mb-4">
                  Buka aplikasi e-wallet (GoPay, OVO, m-BCA, dll) dan scan QR Code di bawah.
                </p>

                <div className="bg-white border-2 border-[#778873] p-4 rounded-2xl shadow-sm mb-6 flex flex-col items-center">
                  <div className="w-48 h-48 bg-white border border-[#DCCFC0]/40 p-2 rounded-xl flex items-center justify-center">
                    <img
                      src={dynamicQrUrl}
                      alt={`QR Code QRIS - ${orderId}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="font-headline-md text-lg text-[#778873] font-bold tracking-widest mt-3">
                    QRIS
                  </p>
                </div>

                <div className="w-full bg-[#f4ede4] rounded-xl p-4 flex items-center justify-between border border-[#DCCFC0]/40 mb-4">
                  <span className="font-label-sm text-xs text-[#444842]">Sisa Waktu Pembayaran</span>
                  <span className="font-label-md text-sm font-bold text-[#ba1a1a] font-mono">
                    {formattedTimer}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => confirmPaymentSuccess("QRIS")}
                  className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {submitting ? "Memproses..." : "Saya Sudah Bayar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL SUKSES RESERVASI KUSTOM */}
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
                  <Link
                    to="/booking-history"
                    onClick={() => setSuccessModalData(null)}
                    className="font-bold text-[#778873] hover:text-[#50604d] underline flex items-center gap-1 transition-colors cursor-pointer group"
                    title="Buka Riwayat Pemesanan"
                  >
                    <span>{successModalData.orderId}</span>
                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                      open_in_new
                    </span>
                  </Link>
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
              <button
                type="button"
                onClick={() => {
                  setSuccessModalData(null);
                  navigate("/booking-history");
                }}
                className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">history</span>
                Lihat Pesanan Saya (Riwayat Pemesanan)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rekomendasi Kamar Alternatif */}
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