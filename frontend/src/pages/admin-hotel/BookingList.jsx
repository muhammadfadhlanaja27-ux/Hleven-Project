import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getStoredBookings,
  saveStoredBookings,
} from "../../utils/bookingData";
import {
  getStoredRooms,
  saveStoredRooms,
} from "../../utils/roomData";

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function BookingList() {
  // State Management
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedBookings = getStoredBookings();
    const loadedRooms = getStoredRooms();
    setBookings(loadedBookings);
    setRooms(loadedRooms);
  };

  const updateBookingsState = (newBookings) => {
    setBookings(newBookings);
    saveStoredBookings(newBookings);
  };

  // Update room stock in localStorage when check in / check out occurs
  const updateRoomOccupiedStock = (roomId, delta) => {
    const currentRooms = getStoredRooms();
    const updatedRooms = currentRooms.map((r) => {
      if (r.id === roomId) {
        const newOccupied = Math.max(0, Math.min(r.stock, (r.occupied || 0) + delta));
        return {
          ...r,
          occupied: newOccupied,
          status: newOccupied >= r.stock ? "Occupied" : "Available",
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    saveStoredRooms(updatedRooms);
  };

  // Calculated Stats for Summary Cards
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === "Pending").length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === "Confirmed").length;
  const checkedInCount = bookings.filter((b) => b.bookingStatus === "Checked In").length;
  const checkedOutCount = bookings.filter((b) => b.bookingStatus === "Checked Out").length;
  const cancelledCount = bookings.filter((b) => b.bookingStatus === "Cancelled").length;
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

    // Date Filter (simple mock evaluation)
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = b.checkIn === "2026-08-18" || b.bookingDate.includes("18 Aug 2026");
    } else if (dateFilter === "tomorrow") {
      matchesDate = b.checkIn === "2026-08-19";
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
  const handleConfirmCheckIn = () => {
    if (!confirmCheckInBooking) return;

    if (confirmCheckInBooking.paymentStatus !== "Paid") {
      toast.error("Payment must be completed before check-in.");
      setConfirmCheckInBooking(null);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", 02:00 PM";

      const updated = bookings.map((b) => {
        if (b.id === confirmCheckInBooking.id) {
          return {
            ...b,
            bookingStatus: "Checked In",
            timeline: [
              ...(b.timeline || []),
              { event: "Checked In", timestamp: todayStr },
            ],
          };
        }
        return b;
      });

      updateBookingsState(updated);
      updateRoomOccupiedStock(confirmCheckInBooking.room.id, 1);

      if (viewingBooking && viewingBooking.id === confirmCheckInBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Checked In",
          timeline: [
            ...(prev.timeline || []),
            { event: "Checked In", timestamp: todayStr },
          ],
        }));
      }

      setIsProcessing(false);
      setConfirmCheckInBooking(null);
      toast.success("Guest checked in successfully.");
    }, 500);
  };

  // Check Out Handler
  const handleConfirmCheckOut = () => {
    if (!confirmCheckOutBooking) return;

    setIsProcessing(true);

    setTimeout(() => {
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", 11:30 AM";

      const updated = bookings.map((b) => {
        if (b.id === confirmCheckOutBooking.id) {
          return {
            ...b,
            bookingStatus: "Checked Out",
            timeline: [
              ...(b.timeline || []),
              { event: "Checked Out", timestamp: todayStr },
            ],
          };
        }
        return b;
      });

      updateBookingsState(updated);
      updateRoomOccupiedStock(confirmCheckOutBooking.room.id, -1);

      if (viewingBooking && viewingBooking.id === confirmCheckOutBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Checked Out",
          timeline: [
            ...(prev.timeline || []),
            { event: "Checked Out", timestamp: todayStr },
          ],
        }));
      }

      setIsProcessing(false);
      setConfirmCheckOutBooking(null);
      toast.success("Guest checked out successfully.");
    }, 500);
  };

  // Cancel Handler
  const handleConfirmCancel = () => {
    if (!confirmCancelBooking) return;

    setIsProcessing(true);

    setTimeout(() => {
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", 05:00 PM";

      const updated = bookings.map((b) => {
        if (b.id === confirmCancelBooking.id) {
          return {
            ...b,
            bookingStatus: "Cancelled",
            timeline: [
              ...(b.timeline || []),
              { event: "Booking Cancelled", timestamp: todayStr },
            ],
          };
        }
        return b;
      });

      updateBookingsState(updated);

      if (viewingBooking && viewingBooking.id === confirmCancelBooking.id) {
        setViewingBooking((prev) => ({
          ...prev,
          bookingStatus: "Cancelled",
          timeline: [
            ...(prev.timeline || []),
            { event: "Booking Cancelled", timestamp: todayStr },
          ],
        }));
      }

      setIsProcessing(false);
      setConfirmCancelBooking(null);
      toast.success("Booking cancelled successfully.");
    }, 400);
  };

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
      </div>

      {/* SUMMARY CARDS DASHBOARD HEADER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
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
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a]">
                            {b.bookingStatus}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="px-3 py-1.5 border border-[#506147] text-[#506147] hover:bg-[#506147] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Detail
                        </button>
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
              <div className="flex items-center gap-2">
                {viewingBooking.bookingStatus === "Confirmed" && (
                  <>
                    <button
                      onClick={() => setConfirmCheckInBooking(viewingBooking)}
                      className="px-4 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">login</span>
                      Check In
                    </button>
                    <button
                      onClick={() => setConfirmCancelBooking(viewingBooking)}
                      className="px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold rounded-lg hover:bg-[#ffdad6] transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}

                {viewingBooking.bookingStatus === "Checked In" && (
                  <button
                    onClick={() => setConfirmCheckOutBooking(viewingBooking)}
                    className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Check Out
                  </button>
                )}

                {viewingBooking.bookingStatus === "Pending" && (
                  <button
                    onClick={() => setConfirmCancelBooking(viewingBooking)}
                    className="px-4 py-2 border border-[#ba1a1a] text-[#ba1a1a] text-xs font-semibold rounded-lg hover:bg-[#ffdad6] transition-colors"
                  >
                    Cancel Booking
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
                      <span className="text-[#6B6E6A]">Identity Number (KTP/Passport):</span>
                      <p className="font-semibold text-[#2D312C] mt-0.5">
                        {viewingBooking.guest.identityNumber}
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
    </div>
  );
}