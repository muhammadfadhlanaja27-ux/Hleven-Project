import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { getStorageUrl } from "../../services/imageUrl";

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
const dateInputValue = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const normalizeBooking = (b) => {
  const rawStatus = (b.status || "unpaid").toLowerCase();
  // Nilai enum bookings.status dari backend: unpaid, pending, paid, checked_in,
  // checked_out, cancelled, expired, refunded, refund_pending
  const bookingStatusMap = {
    unpaid: "Pending",
    pending: "Pending",
    paid: "Confirmed",
    confirmed: "Confirmed",
    checked_in: "Checked In",
    checked_out: "Checked Out",
    completed: "Checked Out",
    cancelled: "Cancelled",
    expired: "Expired",
    refund_pending: "Refund Pending",
    refunded: "Refunded",
  };

  const firstRoom =
    b.booking_rooms?.[0]?.room_type ||
    b.bookingRooms?.[0]?.roomType ||
    b.booking_rooms?.[0]?.roomType ||
    {};
  const payment = b.payment || {};
  const guest = b.guests?.[0] || {};
  // Nilai enum payments.payment_status: pending, success, failed, expired, cancelled
  const isPaid =
    payment.payment_status === "success" ||
    b.payment_status === "success" ||
    rawStatus === "paid" ||
    rawStatus === "checked_in" ||
    rawStatus === "checked_out" ||
    rawStatus === "refund_pending";

  const total = Number(
    b.total_price ||
      b.total_amount ||
      payment.amount ||
      payment.gross_amount ||
      0
  );

  return {
    id: b.id,
    bookingCode: b.booking_code || `BK-${b.id}`,
    bookingDate: b.created_at
      ? new Date(b.created_at).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    guest: {
      name: guest.name || b.guest_name || b.user?.name || "Guest",
      email: guest.email || b.guest_email || b.user?.email || "-",
      phone: guest.phone || b.guest_phone || b.user?.phone || "-",
      identityNumber: guest.identity_number || b.user?.identity_number || "-",
      gender: guest.gender || b.user?.gender || "Male",
    },
    room: {
      id: firstRoom.id || 1,
      name: firstRoom.name || "Room",
      type: firstRoom.name?.toLowerCase().includes("suite")
        ? "Suite"
        : firstRoom.name?.toLowerCase().includes("deluxe")
        ? "Deluxe"
        : "Standard",
      capacity: firstRoom.capacity_adult || 2,
      weekdayPrice: Number(firstRoom.weekday_price || 0),
      weekendPrice: Number(firstRoom.weekend_price || 0),
    },
    checkIn: b.check_in_date || b.check_in || "-",
    checkOut: b.check_out_date || b.check_out || "-",
    nights: Number(b.nights || 1),
    childrenCount: Number(b.children_count ?? b.children ?? 0),
    weekdayNights: Number(b.weekday_nights || 1),
    weekendNights: Number(b.weekend_nights || 0),
    roomPriceSum: total,
    additionalCharges: 0,
    discount: 0,
    totalAmount: total,
    bookingStatus: bookingStatusMap[rawStatus] || "Pending",
    rawStatus: rawStatus,
    canCheckIn: ["paid", "confirmed"].includes(rawStatus),
    canCheckOut: rawStatus === "checked_in",
    canCancel: ["pending", "unpaid", "paid", "confirmed"].includes(rawStatus),
    canExtend: ["paid", "confirmed", "checked_in"].includes(rawStatus),
    paymentStatus: isPaid ? "Paid" : "Pending",
    paymentMethod: payment.payment_method || "Payment Gateway",
    transactionId: payment.transaction_id || `TRX-${b.id}`,
    bookingSource: "Website",
    timeline: [
      { event: "Booking Created", timestamp: b.created_at || "Recent" },
      ...(rawStatus === "paid" ||
      rawStatus === "confirmed" ||
      rawStatus === "checked_in" ||
      rawStatus === "checked_out"
        ? [{ event: "Booking Confirmed", timestamp: "Confirmed" }]
        : []),
      ...(rawStatus === "checked_in" || rawStatus === "checked_out"
        ? [{ event: "Checked In", timestamp: "Checked In" }]
        : []),
      ...(rawStatus === "checked_out"
        ? [{ event: "Checked Out", timestamp: "Completed" }]
        : []),
      ...(rawStatus === "cancelled" || rawStatus === "expired"
        ? [{ event: "Booking Cancelled", timestamp: "Cancelled" }]
        : []),
    ],
  };
};

export default function BookingList() {
  // State Management
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState("bookingDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [viewingBooking, setViewingBooking] = useState(null);
  const [confirmCheckInBooking, setConfirmCheckInBooking] = useState(null);
  const [confirmCheckOutBooking, setConfirmCheckOutBooking] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);
  const [confirmRefundApprove, setConfirmRefundApprove] = useState(null);
  const [confirmRefundReject, setConfirmRefundReject] = useState(null);
  const [showCheckInCode, setShowCheckInCode] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [manualBookingCode, setManualBookingCode] = useState("");
  const [manualForm, setManualForm] = useState(() => ({
    room_type_id: "",
    check_in: dateInputValue(),
    check_out: dateInputValue(1),
    qty: 1,
    adults: 1,
    children: 0,
    guest_name: "",
    guest_phone: "",
    payment_method: "cash",
  }));
  const selectedManualRoom = rooms.find(
    (room) => String(room.id) === String(manualForm.room_type_id)
  );
  const selectedManualRoomPhoto = selectedManualRoom?.photos?.find(
    (photo) => photo.is_thumbnail
  ) || selectedManualRoom?.photos?.[0];
  const selectedManualFacilities = (selectedManualRoom?.facilities || [])
    .map((facility) => typeof facility === "string" ? facility : facility.name || facility.title)
    .filter(Boolean);
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [extensionType, setExtensionType] = useState("hours");
  const [extensionDuration, setExtensionDuration] = useState(1);
  const [extensionNotes, setExtensionNotes] = useState("");
  const AUTO_CHECKOUT_KEY = "hleven_bookings_auto_checkout";
  const [autoCheckout, setAutoCheckout] = useState(() => {
    try { return localStorage.getItem(AUTO_CHECKOUT_KEY) === "true"; } catch { return false; }
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    try { localStorage.setItem(AUTO_CHECKOUT_KEY, String(autoCheckout)); } catch {}
  }, [autoCheckout]);

  useEffect(() => {
    if (!autoCheckout || !bookings.length) return;
    const now = new Date();
    bookings.forEach((b) => {
      if (b.rawStatus !== "checked_in") return;
      const out = new Date(b.checkOut + "T12:00:00");
      if (now >= out) {
        api.patch(`/admin/bookings/${b.id}/status`, { status: "checked_out" }).catch(() => {});
      }
    });
  }, [autoCheckout, bookings]);

  const handleExtendBooking = async () => {
    if (!extendingBooking) return;
    if (extensionDuration < 1) { toast.error("Durasi minimal 1"); return; }
    setIsProcessing(true);
    try {
      const res = await api.post(`/admin/bookings/${extendingBooking.id}/extend`, {
        type: extensionType,
        duration: Number(extensionDuration),
        notes: extensionNotes || undefined,
      });
      toast.success(res.data?.message || "Booking diperpanjang");
      const fresh = res.data?.data ? normalizeBooking(res.data.data) : null;
      if (fresh && viewingBooking && viewingBooking.id === fresh.id) setViewingBooking(fresh);
      setExtendingBooking(null);
      setExtensionDuration(1);
      setExtensionNotes("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperpanjang booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, roomsRes] = await Promise.allSettled([
        api.get("/admin/bookings"),
        api.get("/hotel/room-types"),
      ]);

      if (bookingsRes.status === "fulfilled" && bookingsRes.value.data) {
        const raw =
          bookingsRes.value.data.data || bookingsRes.value.data || [];
        setBookings(Array.isArray(raw) ? raw.map(normalizeBooking) : []);
      }
      if (roomsRes.status === "fulfilled" && roomsRes.value.data) {
        const rawRooms =
          roomsRes.value.data.data || roomsRes.value.data || [];
        setRooms(Array.isArray(rawRooms) ? rawRooms : []);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Gagal memuat data reservasi dari server.");
    } finally {
      setLoading(false);
    }
  };

  // Calculated Stats for Summary Cards
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === "Pending").length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === "Confirmed").length;
  const checkedInCount = bookings.filter((b) => b.bookingStatus === "Checked In").length;
  const checkedOutCount = bookings.filter((b) => b.bookingStatus === "Checked Out").length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === "Cancelled").length;
  const refundPendingCount = bookings.filter((b) => b.bookingStatus === "Refund Pending").length;
  const paidRevenueTotal = bookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    // Search Query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(q) ||
      b.guest.name.toLowerCase().includes(q) ||
      b.guest.phone.toLowerCase().includes(q) ||
      b.room.name.toLowerCase().includes(q);

    // Booking Status
    const matchesBookingStatus =
      bookingStatusFilter === "all"
        ? true
        : b.bookingStatus.toLowerCase() === bookingStatusFilter.toLowerCase();

    // Payment Status
    const matchesPaymentStatus =
      paymentStatusFilter === "all"
        ? true
        : b.paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase();

    // Room Type
    const matchesRoomType =
      roomTypeFilter === "all"
        ? true
        : b.room.type.toLowerCase() === roomTypeFilter.toLowerCase();

    // Date Filter
    let matchesDate = true;
    if (dateFilter === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      matchesDate = b.checkIn === todayStr;
    }

    return (
      matchesSearch &&
      matchesBookingStatus &&
      matchesPaymentStatus &&
      matchesRoomType &&
      matchesDate
    );
  });

  // Sorting Logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "guestName") {
      aVal = a.guest.name;
      bVal = b.guest.name;
    }

    if (typeof aVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage) || 1;
  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Check In Handler
  const handleConfirmCheckIn = async () => {
    if (!confirmCheckInBooking) return;

    setIsProcessing(true);
    try {
      await api.patch(`/admin/bookings/${confirmCheckInBooking.id}/status`, {
        status: "checked_in",
      });
      toast.success("Guest checked in successfully.");
      setConfirmCheckInBooking(null);
      if (viewingBooking && viewingBooking.id === confirmCheckInBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Checked In",
        }));
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses check in.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckInByCode = async (event) => {
    event.preventDefault();
    if (!checkInCode.trim()) return;

    setIsProcessing(true);
    try {
      const response = await api.post("/admin/verify-qr", {
        booking_code: checkInCode.trim(),
      });
      toast.success(response.data?.message || "Check-in berhasil.");
      setCheckInCode("");
      setShowCheckInCode(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Kode booking tidak valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualBooking = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const response = await api.post("/admin/bookings/manual", {
        ...manualForm,
        qty: Number(manualForm.qty),
        adults: Number(manualForm.adults),
        children: Number(manualForm.children),
      });
      const bookingCode = response.data?.data?.booking_code;
      setManualBookingCode(bookingCode || "");
      toast.success(`Booking ${bookingCode || "manual"} berhasil dibuat.`);
      loadData();
    } catch (err) {
      const validationMessage = Object.values(err.response?.data?.errors || {}).flat()[0];
      toast.error(err.response?.data?.message || validationMessage || "Gagal membuat booking manual.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check Out Handler
  const handleConfirmCheckOut = async () => {
    if (!confirmCheckOutBooking) return;

    setIsProcessing(true);
    try {
      await api.patch(`/admin/bookings/${confirmCheckOutBooking.id}/status`, {
        status: "checked_out",
      });
      toast.success("Guest checked out successfully.");
      setConfirmCheckOutBooking(null);
      if (viewingBooking && viewingBooking.id === confirmCheckOutBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Checked Out",
        }));
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses check out.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel Handler
  const handleConfirmCancel = async () => {
    if (!confirmCancelBooking) return;

    setIsProcessing(true);
    try {
      await api.patch(`/admin/bookings/${confirmCancelBooking.id}/status`, {
        status: "cancelled",
      });
      toast.success("Booking cancelled successfully.");
      setConfirmCancelBooking(null);
      if (viewingBooking && viewingBooking.id === confirmCancelBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Cancelled",
        }));
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal membatalkan reservasi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefundDecision = async (booking, action) => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/admin/bookings/${booking.id}/refund-approval`, { action });
      toast.success(res.data?.message || (action === "approve" ? "Refund disetujui. Stok dikembalikan." : "Refund ditolak. Status kembali Paid."));
      setConfirmRefundApprove(null);
      setConfirmRefundReject(null);
      if (viewingBooking && viewingBooking.id === booking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: action === "approve" ? "Refunded" : "Confirmed",
          rawStatus: action === "approve" ? "refunded" : "paid",
        }));
      }
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses refund.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#506147]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Bookings
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Manage and monitor hotel reservations and guest check-ins.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCheckInCode(true)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E1DA] rounded-xl text-sm font-semibold text-[#2D312C] hover:border-[#506147] transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">key</span>
            Input Kode Hotel
          </button>
          <button
            type="button"
            onClick={() => {
              setManualBookingCode("");
              setShowManualBooking(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-3 bg-[#506147] border border-[#506147] rounded-xl text-sm font-semibold text-white hover:bg-[#3b4b33] transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">add</span>
            Manual Booking
          </button>
          <label className="flex items-center gap-3 bg-white border border-[#E5E1DA] rounded-2xl px-5 py-3.5 shadow-sm cursor-pointer select-none">
          <span className="text-xs font-bold text-[#2D312C] whitespace-nowrap">Auto Check-Out</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${autoCheckout ? "bg-[#E4EBE0] text-[#4A5D43]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>{autoCheckout ? "ON" : "OFF"}</span>
          <span className="relative inline-flex items-center">
            <input type="checkbox" checked={autoCheckout} onChange={(e) => setAutoCheckout(e.target.checked)} className="sr-only peer" />
            <span className="w-11 h-6 bg-[#D1CCC5] rounded-full peer peer-checked:bg-[#506147] transition-colors" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
          </span>
          </label>
        </div>
      </div>

      {/* SUMMARY CARDS DASHBOARD HEADER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total */}
        <div
          onClick={() => {
            setBookingStatusFilter("all");
            setPaymentStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "all" && paymentStatusFilter === "all"
              ? "bg-[#506147] text-white border-[#506147] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#506147]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Total
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {totalBookingsCount}
          </p>
        </div>

        {/* Card 2: Pending */}
        <div
          onClick={() => {
            setBookingStatusFilter("Pending");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Pending"
              ? "bg-[#D48C45] text-white border-[#D48C45] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#D48C45]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Pending
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {pendingCount}
          </p>
        </div>

        {/* Card 3: Confirmed */}
        <div
          onClick={() => {
            setBookingStatusFilter("Confirmed");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Confirmed"
              ? "bg-[#69795f] text-white border-[#69795f] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#69795f]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Confirmed
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {confirmedCount}
          </p>
        </div>

        {/* Card 4: Checked In */}
        <div
          onClick={() => {
            setBookingStatusFilter("Checked In");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Checked In"
              ? "bg-[#4A5D43] text-white border-[#4A5D43] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#4A5D43]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Checked In
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {checkedInCount}
          </p>
        </div>

        {/* Card 5: Checked Out */}
        <div
          onClick={() => {
            setBookingStatusFilter("Checked Out");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Checked Out"
              ? "bg-[#6B6E6A] text-white border-[#6B6E6A] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#6B6E6A]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Checked Out
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {checkedOutCount}
          </p>
        </div>

        {/* Card 6: Cancelled */}
        <div
          onClick={() => {
            setBookingStatusFilter("Cancelled");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Cancelled"
              ? "bg-[#ba1a1a] text-white border-[#ba1a1a] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#ba1a1a]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Cancelled
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {cancelledCount}
          </p>
        </div>

        {/* Card 6b: Refund Pending */}
        <div
          onClick={() => {
            setBookingStatusFilter("Refund Pending");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            bookingStatusFilter === "Refund Pending"
              ? "bg-[#0369A1] text-white border-[#0369A1] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#0369A1]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Refund Pending
          </span>
          <p className="font-['Newsreader',serif] text-2xl font-bold mt-1">
            {refundPendingCount}
          </p>
        </div>

        {/* Card 7: Paid Revenue */}
        <div
          onClick={() => {
            setPaymentStatusFilter("Paid");
            setBookingStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer sm:col-span-3 lg:col-span-1 ${
            paymentStatusFilter === "Paid"
              ? "bg-[#2D312C] text-white border-[#2D312C] shadow"
              : "bg-white text-[#2D312C] border-[#E5E1DA] hover:border-[#2D312C]"
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-80">
            Paid Revenue
          </span>
          <p className="font-['Newsreader',serif] text-lg font-bold mt-1 truncate">
            {fmtRupiah(paidRevenueTotal)}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search code, guest or room..."
              className="w-full pl-10 pr-4 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Booking Status */}
            <select
              value={bookingStatusFilter}
              onChange={(e) => {
                setBookingStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Booking Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
              <option value="Refund Pending">Refund Pending</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Payment Status */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Payment: All</option>
              <option value="Pending">Payment Pending</option>
              <option value="Paid">Payment Paid</option>
              <option value="Failed">Payment Failed</option>
              <option value="Expired">Payment Expired</option>
              <option value="Refunded">Payment Refunded</option>
            </select>

            {/* Room Type */}
            <select
              value={roomTypeFilter}
              onChange={(e) => {
                setRoomTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Room Type: All</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Date: All</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="bookingDate">Sort: Booking Date</option>
              <option value="checkIn">Sort: Check In</option>
              <option value="checkOut">Sort: Check Out</option>
              <option value="totalAmount">Sort: Total Amount</option>
              <option value="guestName">Sort: Guest Name</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-[#E5E0D8] bg-[#fcf9f5] rounded-lg text-[#2D312C] hover:bg-[#f0ede9] transition-colors"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING TABLE CARD */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Booking Code
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Guest
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Room
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Check In / Out
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Nights
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Booking Status
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E1DA] text-sm">
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b) => {
                  const guestInitials = b.guest.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={b.id} className="hover:bg-[#A8BBA2]/10 transition-colors">
                      {/* Booking Code */}
                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">
                        {b.bookingCode}
                      </td>

                      {/* Guest Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E4EBE0] text-[#4A5D43] font-bold text-xs flex items-center justify-center border border-[#E5E1DA] shrink-0">
                            {guestInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2D312C] text-sm leading-tight">
                              {b.guest.name}
                            </p>
                            <p className="text-xs text-[#6B6E6A] mt-0.5">{b.guest.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Room Info */}
                      <td className="p-4">
                        <p className="font-medium text-[#2D312C]">{b.room.name}</p>
                        <span className="text-xs text-[#6B6E6A]">{b.room.type}</span>
                      </td>

                      {/* Check In / Out */}
                      <td className="p-4 text-xs whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#2D312C]">{b.checkIn}</span>
                          <span className="text-[#6B6E6A]">{b.checkOut}</span>
                        </div>
                      </td>

                      {/* Nights */}
                      <td className="p-4 font-medium text-[#2D312C] whitespace-nowrap">
                        {b.nights} Nights
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-semibold text-[#506147] whitespace-nowrap">
                        {fmtRupiah(b.totalAmount)}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {b.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4EBE0] text-[#4A5D43]">
                            Paid
                          </span>
                        ) : b.paymentStatus === "Pending" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E0] text-[#D48C45]">
                            Pending
                          </span>
                        ) : b.paymentStatus === "Refunded" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0EDE9] text-[#6B6E6A] border border-[#E5E1DA]">
                            {b.paymentStatus}
                          </span>
                        )}
                      </td>

                      {/* Booking Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {b.bookingStatus === "Confirmed" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d2e5cb] text-[#3a4b38]">
                            Confirmed
                          </span>
                        ) : b.bookingStatus === "Checked In" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#506147] text-white">
                            Checked In
                          </span>
                        ) : b.bookingStatus === "Checked Out" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0EDE9] text-[#6B6E6A] border border-[#E5E1DA]">
                            Checked Out
                          </span>
                        ) : b.bookingStatus === "Pending" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E0] text-[#9B5235]">
                            Pending
                          </span>
                        ) : b.bookingStatus === "Refund Pending" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">
                            Refund Pending
                          </span>
                        ) : b.bookingStatus === "Refunded" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                            {b.bookingStatus}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingBooking(b)}
                            className="px-3 py-1.5 border border-[#506147] text-[#506147] hover:bg-[#506147] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            View Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-[#6B6E6A]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-[#c4c8be]">
                        calendar_today
                      </span>
                      <div>
                        <p className="font-semibold text-[#2D312C] text-base">
                          {bookings.length === 0 ? "No bookings yet." : "No bookings found."}
                        </p>
                        <p className="text-xs text-[#6B6E6A] mt-1">
                          {bookings.length === 0
                            ? "Reservasi tamu akan muncul di sini."
                            : "Tidak ada data reservasi yang sesuai dengan kriteria pencarian/filter."}
                        </p>
                      </div>

                      {searchQuery ||
                      bookingStatusFilter !== "all" ||
                      paymentStatusFilter !== "all" ||
                      roomTypeFilter !== "all" ||
                      dateFilter !== "all" ? (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setBookingStatusFilter("all");
                            setPaymentStatusFilter("all");
                            setRoomTypeFilter("all");
                            setDateFilter("all");
                          }}
                          className="mt-2 px-4 py-2 bg-[#f0ede9] text-[#2D312C] rounded-lg text-xs font-semibold hover:bg-[#e5e2de] transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {sortedBookings.length > 0 && (
          <div className="p-4 border-t border-[#E5E1DA] bg-[#fcf9f5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6E6A]">
            <p>
              Showing <span className="font-semibold text-[#2D312C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-[#2D312C]">{Math.min(currentPage * itemsPerPage, sortedBookings.length)}</span> of{" "}
              <span className="font-semibold text-[#2D312C]">{sortedBookings.length}</span> entries
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg bg-white text-[#2D312C] font-semibold hover:bg-[#f0ede9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    currentPage === idx + 1
                      ? "bg-[#506147] text-white shadow-sm"
                      : "bg-white border border-[#E5E0D8] text-[#2D312C] hover:bg-[#f0ede9]"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg bg-white text-[#2D312C] font-semibold hover:bg-[#f0ede9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: BOOKING DETAIL (BENTO GRID DESIGN)                              */}
      {/* ========================================================================= */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-5xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Bento Header */}
            <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#fcf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                    Booking {viewingBooking.bookingCode}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4EBE0] text-[#4A5D43]">
                    {viewingBooking.bookingStatus}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f0ede9] text-[#2D312C] border border-[#E5E1DA]">
                    Payment: {viewingBooking.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Created on {viewingBooking.bookingDate} via {viewingBooking.bookingSource}
                </p>
              </div>

              {/* Dynamic Actions in Header */}
              <div className="flex items-center gap-2 flex-wrap">
                {viewingBooking.bookingStatus === "Refund Pending" && (
                  <>
                    <button
                      onClick={() => setConfirmRefundApprove(viewingBooking)}
                      className="px-4 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors shadow-sm"
                    >
                      Approve Refund
                    </button>
                    <button
                      onClick={() => setConfirmRefundReject(viewingBooking)}
                      className="px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold rounded-lg hover:bg-[#ffdad6] transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {viewingBooking.canCheckIn && (
                  <>
                    <button
                      onClick={() => setConfirmCheckInBooking(viewingBooking)}
                      className="px-4 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">login</span>
                      Check In
                    </button>
                  </>
                )}

                {viewingBooking.canCancel && (
                  <button
                    onClick={() => setConfirmCancelBooking(viewingBooking)}
                    className="px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold rounded-lg hover:bg-[#ffdad6] transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}

                {viewingBooking.canExtend && (
                  <button
                    onClick={() => {
                      setExtendingBooking(viewingBooking);
                      setExtensionType("hours");
                      setExtensionDuration(1);
                      setExtensionNotes("");
                    }}
                    className="px-4 py-2 bg-[#7A5C3A] text-white text-xs font-semibold rounded-lg hover:bg-[#5c4428] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">more_time</span>
                    Extend Stay
                  </button>
                )}

                {viewingBooking.canCheckOut && (
                  <button
                    onClick={() => setConfirmCheckOutBooking(viewingBooking)}
                    className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Check Out
                  </button>
                )}

                <button
                  onClick={() => setViewingBooking(null)}
                  className="p-1.5 text-[#6B6E6A] hover:bg-[#eae8e4] rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Bento Grid Content */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fcf9f5]">
              {/* Left Column (col-span-7): Guest Info & Room Allocation */}
              <div className="lg:col-span-7 space-y-6">
                {/* Bento Card 1: Guest Information */}
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#506147]">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                      Guest Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#6B6E6A]">Guest Name:</span>
                      <p className="font-semibold text-[#2D312C] text-sm mt-0.5">
                        {viewingBooking.guest.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6B6E6A]">Contact Phone:</span>
                      <p className="font-semibold text-[#2D312C] text-sm mt-0.5">
                        {viewingBooking.guest.phone}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6B6E6A]">Email Address:</span>
                      <p className="font-semibold text-[#2D312C] mt-0.5">
                        {viewingBooking.guest.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6B6E6A]">Jumlah Anak:</span>
                      <p className="font-semibold text-[#2D312C] mt-0.5">
                        {viewingBooking.childrenCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Room Allocation & Dates */}
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#506147]">
                    <span className="material-symbols-outlined text-[20px]">bed</span>
                    <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                      Room Information
                    </h4>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA]">
                    <div>
                      <h5 className="font-bold text-[#2D312C] text-base">
                        {viewingBooking.room.name}
                      </h5>
                      <p className="text-xs text-[#6B6E6A] mt-0.5">
                        Type: {viewingBooking.room.type} • Capacity: {viewingBooking.room.capacity} Guests
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B6E6A] block">
                        Snapshot Pricing
                      </span>
                      <p className="text-xs text-[#2D312C] font-medium">
                        Weekday: {fmtRupiah(viewingBooking.room.weekdayPrice)}
                      </p>
                      <p className="text-xs text-[#506147] font-semibold">
                        Weekend: {fmtRupiah(viewingBooking.room.weekendPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#E4EBE0] rounded-xl border border-[#E5E1DA]">
                      <span className="text-[#4A5D43] font-semibold block">Check In Date</span>
                      <p className="text-sm font-bold text-[#2D312C] mt-1">{viewingBooking.checkIn}</p>
                      <span className="text-[10px] text-[#6B6E6A]">After 02:00 PM</span>
                    </div>

                    <div className="p-3 bg-[#F2EBE1] rounded-xl border border-[#E5E1DA]">
                      <span className="text-[#506147] font-semibold block">Check Out Date</span>
                      <p className="text-sm font-bold text-[#2D312C] mt-1">{viewingBooking.checkOut}</p>
                      <span className="text-[10px] text-[#6B6E6A]">Before 12:00 PM ({viewingBooking.nights} Nights)</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: Booking Timeline */}
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-[#506147]">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                      Booking Timeline
                    </h4>
                  </div>

                  <div className="relative pl-6 space-y-4 border-l-2 border-[#506147]/30 py-1">
                    {(viewingBooking.timeline || []).map((t, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#506147] border-2 border-white" />
                        <p className="text-xs font-semibold text-[#2D312C]">{t.event}</p>
                        <p className="text-[11px] text-[#6B6E6A]">{t.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (col-span-5): Price Calculation & Payment */}
              <div className="lg:col-span-5 space-y-6">
                {/* Bento Card 4: Price Calculation Details */}
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#506147]">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                      Price Details
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs border-b border-[#E5E1DA] pb-4">
                    <div className="flex justify-between text-[#6B6E6A]">
                      <span>Room Price Sum ({viewingBooking.nights} Nights)</span>
                      <span className="font-medium text-[#2D312C]">{fmtRupiah(viewingBooking.roomPriceSum)}</span>
                    </div>

                    {viewingBooking.additionalCharges > 0 && (
                      <div className="flex justify-between text-[#6B6E6A]">
                        <span>Additional Charges / Taxes</span>
                        <span className="font-medium text-[#2D312C]">{fmtRupiah(viewingBooking.additionalCharges)}</span>
                      </div>
                    )}

                    {viewingBooking.discount > 0 && (
                      <div className="flex justify-between text-[#ba1a1a]">
                        <span>Discount Promo</span>
                        <span className="font-medium">-{fmtRupiah(viewingBooking.discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-sm text-[#2D312C]">Total Amount</span>
                    <span className="font-['Newsreader',serif] text-2xl font-bold text-[#506147]">
                      {fmtRupiah(viewingBooking.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Bento Card 5: Payment Information */}
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#506147]">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                      Payment Information
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#6B6E6A]">Payment Status:</span>
                      <p className="font-bold text-sm text-[#506147] mt-0.5">{viewingBooking.paymentStatus}</p>
                    </div>

                    <div>
                      <span className="text-[#6B6E6A]">Payment Method:</span>
                      <p className="font-semibold text-[#2D312C] mt-0.5">{viewingBooking.paymentMethod}</p>
                    </div>

                    <div>
                      <span className="text-[#6B6E6A]">Transaction ID:</span>
                      <p className="font-mono text-[#2D312C] bg-[#fcf9f5] p-2 rounded border border-[#E5E1DA] mt-0.5">
                        {viewingBooking.transactionId || "TRX-N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCheckInCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCheckInByCode} className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E4EBE0] text-[#4A5D43] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">key</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Input Kode Hotel untuk Check-in</h3>
                <p className="text-xs text-[#6B6E6A] mt-1">Masukkan kode booking atau e-ticket tamu yang akan check-in.</p>
              </div>
            </div>
            <input
              type="text"
              autoFocus
              autoCapitalize="characters"
              required
              value={checkInCode}
              onChange={(event) => setCheckInCode(event.target.value.toUpperCase())}
                placeholder="Kode booking / e-ticket"
              className="w-full px-4 py-3 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] uppercase focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20"
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E1DA]">
              <button type="button" onClick={() => setShowCheckInCode(false)} disabled={isProcessing} className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4]">
                Batal
              </button>
              <button type="submit" disabled={isProcessing || !checkInCode.trim()} className="px-5 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] disabled:opacity-50">
                {isProcessing ? "Memproses..." : "Check-in"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showManualBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleManualBooking} className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">Manual Booking</h3>
                <p className="text-xs text-[#6B6E6A] mt-1">Data tamu dan reservasi</p>
              </div>
              <button type="button" onClick={() => setShowManualBooking(false)} disabled={isProcessing} title="Tutup" className="p-2 rounded-lg text-[#6B6E6A] hover:bg-[#f0ede9]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="block text-xs font-semibold text-[#2D312C] space-y-1.5">
              Kode booking untuk check-in
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={manualBookingCode}
                  placeholder="Dibuat otomatis setelah booking disimpan"
                  className="min-w-0 flex-1 px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-mono font-normal text-[#2D312C] placeholder:font-sans placeholder:text-xs"
                />
                {manualBookingCode && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(manualBookingCode);
                        toast.success("Kode booking disalin.");
                      } catch {
                        toast.error("Kode booking gagal disalin.");
                      }
                    }}
                    title="Salin kode booking"
                    className="shrink-0 px-3 border border-[#E5E1DA] rounded-lg text-[#506147] hover:bg-[#f0ede9]"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                )}
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="sm:col-span-2 text-xs font-semibold text-[#2D312C] space-y-1.5">
                Tipe kamar
                <select name="room_type_id" required value={manualForm.room_type_id} onChange={(event) => setManualForm((prev) => ({ ...prev, room_type_id: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]">
                  <option value="">Pilih tipe kamar</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name} · {fmtRupiah(room.weekday_price)} / malam</option>
                  ))}
                </select>
              </label>
              {selectedManualRoom && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#E5E1DA] bg-[#fcf9f5]">
                  {selectedManualRoomPhoto?.photo || selectedManualRoomPhoto?.url ? (
                    <img
                      src={getStorageUrl(selectedManualRoomPhoto.photo || selectedManualRoomPhoto.url)}
                      alt={selectedManualRoom.name}
                      className="h-40 w-full object-cover sm:h-full"
                    />
                  ) : (
                    <div className="flex min-h-32 items-center justify-center bg-[#E8E5DF] text-[#6B6E6A]">
                      <span className="material-symbols-outlined text-4xl">bed</span>
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#2D312C]">{selectedManualRoom.name}</p>
                        <p className="text-xs text-[#6B6E6A]">{selectedManualRoom.type || "Tipe kamar"}{selectedManualRoom.bed ? ` · ${selectedManualRoom.bed}` : ""}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#4A5D43]">Stok {selectedManualRoom.stock ?? "-"}</span>
                    </div>
                    {selectedManualRoom.description && (
                      <p className="text-xs leading-relaxed text-[#5F7161]">{selectedManualRoom.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#2D312C]">
                      <span>{selectedManualRoom.capacity_adult ?? 0} dewasa</span>
                      <span>{selectedManualRoom.capacity_child ?? 0} anak</span>
                      <span>Weekday {fmtRupiah(selectedManualRoom.weekday_price)}</span>
                      <span>Weekend {fmtRupiah(selectedManualRoom.weekend_price)}</span>
                    </div>
                    <div className="space-y-2 border-t border-[#E5E1DA] pt-3">
                      <p className="text-xs font-semibold text-[#2D312C]">Fasilitas kamar</p>
                      {selectedManualFacilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedManualFacilities.map((facility, index) => (
                            <span key={`${facility}-${index}`} className="rounded-md border border-[#D8DDD3] bg-white px-2 py-1 text-[11px] text-[#4A5D43]">
                              {facility}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#6B6E6A]">Belum ada fasilitas untuk tipe kamar ini.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                Check-in
                <input name="check_in" type="date" min={dateInputValue()} required value={manualForm.check_in} onChange={(event) => setManualForm((prev) => ({ ...prev, check_in: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
              </label>
              <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                Check-out
                <input name="check_out" type="date" min={manualForm.check_in} required value={manualForm.check_out} onChange={(event) => setManualForm((prev) => ({ ...prev, check_out: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
              </label>
              <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                Nama tamu
                <input name="guest_name" required maxLength={255} value={manualForm.guest_name} onChange={(event) => setManualForm((prev) => ({ ...prev, guest_name: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
              </label>
              <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                Nomor telepon
                <input name="guest_phone" type="tel" required maxLength={30} value={manualForm.guest_phone} onChange={(event) => setManualForm((prev) => ({ ...prev, guest_phone: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                  Jumlah kamar
                  <input name="qty" type="number" min="1" required value={manualForm.qty} onChange={(event) => setManualForm((prev) => ({ ...prev, qty: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
                </label>
                <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                  Jumlah dewasa
                  <input name="adults" type="number" min="1" required value={manualForm.adults} onChange={(event) => setManualForm((prev) => ({ ...prev, adults: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
                </label>
                <label className="text-xs font-semibold text-[#2D312C] space-y-1.5">
                  Jumlah anak
                  <input name="children" type="number" min="0" max="32767" required value={manualForm.children} onChange={(event) => setManualForm((prev) => ({ ...prev, children: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]" />
                </label>
              </div>
              <label className="sm:col-span-2 text-xs font-semibold text-[#2D312C] space-y-1.5">
                Pembayaran
                <select name="payment_method" required value={manualForm.payment_method} onChange={(event) => setManualForm((prev) => ({ ...prev, payment_method: event.target.value }))} className="w-full px-3 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm font-normal focus:outline-none focus:border-[#506147]">
                  <option value="cash">Tunai · sudah dibayar</option>
                  <option value="bank_transfer">Transfer bank · sudah dibayar</option>
                  <option value="card">Kartu · sudah dibayar</option>
                  <option value="unpaid">Belum dibayar</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E1DA]">
              <button type="button" onClick={() => setShowManualBooking(false)} disabled={isProcessing} className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4]">
                {manualBookingCode ? "Selesai" : "Batal"}
              </button>
              <button type="submit" disabled={isProcessing || rooms.length === 0 || !!manualBookingCode} className="px-5 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] disabled:opacity-50">
                {isProcessing ? "Menyimpan..." : manualBookingCode ? "Booking Dibuat" : "Buat Booking"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM CHECK IN                                                 */}
      {/* ========================================================================= */}
      {confirmCheckInBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E4EBE0] text-[#4A5D43] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">login</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Confirm Check In
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Apakah Anda yakin ingin memproses Check-In untuk reservasi ini?
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Booking Code:</span>
                <span className="font-bold text-[#2D312C]">{confirmCheckInBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Guest Name:</span>
                <span className="font-semibold text-[#2D312C]">{confirmCheckInBooking.guest.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Room:</span>
                <span className="font-semibold text-[#2D312C]">{confirmCheckInBooking.room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Payment Status:</span>
                <span className="font-bold text-[#4A5D43]">{confirmCheckInBooking.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCheckInBooking(null)}
                disabled={isProcessing}
                className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                disabled={isProcessing}
                className="px-6 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors shadow-sm disabled:opacity-50"
              >
                {isProcessing ? "Checking In..." : "Confirm Check In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM CHECK OUT                                                */}
      {/* ========================================================================= */}
      {confirmCheckOutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f0ede9] text-[#2D312C] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Confirm Check Out
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Apakah Anda yakin ingin menyelesaikan penginapan (Check-Out) untuk tamu ini?
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Booking Code:</span>
                <span className="font-bold text-[#2D312C]">{confirmCheckOutBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Guest Name:</span>
                <span className="font-semibold text-[#2D312C]">{confirmCheckOutBooking.guest.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6E6A]">Room:</span>
                <span className="font-semibold text-[#2D312C]">{confirmCheckOutBooking.room.name}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCheckOutBooking(null)}
                disabled={isProcessing}
                className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckOut}
                disabled={isProcessing}
                className="px-6 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors shadow-sm disabled:opacity-50"
              >
                {isProcessing ? "Checking Out..." : "Confirm Check Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CANCEL BOOKING                                                   */}
      {/* ========================================================================= */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Cancel Booking?
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Are you sure you want to cancel booking <strong className="text-[#2D312C]">&quot;{confirmCancelBooking.bookingCode}&quot;</strong>?
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                disabled={isProcessing}
                className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="px-6 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm disabled:opacity-50"
              >
                {isProcessing ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRefundApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E4EBE0] text-[#4A5D43] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Approve Refund?</h3>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Setujui refund untuk <strong className="text-[#2D312C]">{confirmRefundApprove.bookingCode}</strong>? Stok kamar akan dikembalikan dan status menjadi Refunded.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmRefundApprove(null)} disabled={isProcessing} className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors">Batal</button>
              <button type="button" onClick={() => handleRefundDecision(confirmRefundApprove, "approve")} disabled={isProcessing} className="px-6 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors shadow-sm disabled:opacity-50">{isProcessing ? "Memproses..." : "Approve Refund"}</button>
            </div>
          </div>
        </div>
      )}

      {extendingBooking && (() => {
        const basePrice = Number(extendingBooking.room?.weekdayPrice || extendingBooking.room?.price || extendingBooking.roomPriceSum || 350000);
        const qty = extendingBooking.bookingRooms?.reduce((s, br) => s + (br.qty || 1), 0) || 1;
        const hourlyRate = Math.round(basePrice / 24);
        const sub = extensionType === "hours" ? hourlyRate * Number(extensionDuration || 0) * qty : basePrice * Number(extensionDuration || 0) * qty;
        const tax = Math.round(sub * 0.05);
        const total = sub + tax;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E4EBE0] text-[#4A5D43] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">more_time</span>
                </div>
                <div>
                  <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Extend Stay — {extendingBooking.bookingCode}</h3>
                  <p className="text-xs text-[#6B6E6A] mt-1">Tambah durasi menginap. Per jam = harga/malam ÷ 24. Per hari = penuh.</p>
                </div>
              </div>
              <div className="p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] space-y-3 text-xs">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setExtensionType("hours")} className={`flex-1 py-2 rounded-lg font-bold ${extensionType === "hours" ? "bg-[#506147] text-white" : "bg-white border border-[#E5E1DA]"}`}>Per Jam</button>
                  <button type="button" onClick={() => setExtensionType("days")} className={`flex-1 py-2 rounded-lg font-bold ${extensionType === "days" ? "bg-[#506147] text-white" : "bg-white border border-[#E5E1DA]"}`}>Per Hari</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#2D312C]">Durasi ({extensionType === "hours" ? "jam" : "hari"})</label>
                    <input type="number" min={1} value={extensionDuration} onChange={(e) => setExtensionDuration(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full border border-[#E5E1DA] rounded-lg px-3 py-2 bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-[#2D312C]">Catatan (opsional)</label>
                    <input type="text" placeholder="Late check-out 15:00" value={extensionNotes} onChange={(e) => setExtensionNotes(e.target.value)} className="mt-1 w-full border border-[#E5E1DA] rounded-lg px-3 py-2 bg-white" maxLength={255} />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#E5E1DA] p-3 space-y-1.5">
                  <div className="flex justify-between"><span className="text-[#6B6E6A]">{extensionType === "hours" ? `Rp ${hourlyRate.toLocaleString("id-ID")}/jam × ${extensionDuration} jam × ${qty} kamar` : `Rp ${basePrice.toLocaleString("id-ID")}/malam × ${extensionDuration} hari × ${qty} kamar`}</span><span className="font-bold">{fmtRupiah(sub)}</span></div>
                  <div className="flex justify-between text-[#6B6E6A]"><span>Pajak 5%</span><span>{fmtRupiah(tax)}</span></div>
                  <div className="flex justify-between font-bold text-[#506147] text-sm pt-1 border-t border-[#E5E1DA]"><span>Total Tambahan</span><span>{fmtRupiah(total)}</span></div>
                </div>
                <p className="text-[11px] text-[#6B6E6A]">{extensionType === "hours" ? "Jam: tanggal check-out tidak berubah, dicatat di special_request. Tagihan bertambah." : "Hari: check-out mundur, total_night + stok hari tambahan dipotong."}</p>
              </div>
              <div className="pt-3 border-t border-[#E5E1DA] flex justify-end gap-2">
                <button type="button" onClick={() => setExtendingBooking(null)} disabled={isProcessing} className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold">Batal</button>
                <button type="button" onClick={handleExtendBooking} disabled={isProcessing} className="px-6 py-2 bg-[#7A5C3A] text-white text-xs font-bold rounded-lg hover:bg-[#5c4428] disabled:opacity-50">{isProcessing ? "Memproses..." : "Perpanjang"}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {confirmRefundReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">block</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">Reject Refund?</h3>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  Tolak refund <strong className="text-[#2D312C]">{confirmRefundReject.bookingCode}</strong>? Status akan kembali Paid.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmRefundReject(null)} disabled={isProcessing} className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors">Batal</button>
              <button type="button" onClick={() => handleRefundDecision(confirmRefundReject, "reject")} disabled={isProcessing} className="px-6 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm disabled:opacity-50">{isProcessing ? "Memproses..." : "Reject Refund"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}