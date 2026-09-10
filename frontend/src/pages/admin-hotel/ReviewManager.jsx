import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

// Helper to render star icons
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-[18px] text-[#D48C45]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      );
    } else {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-[18px] text-[#c4c8be]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          star
        </span>
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(new Set());

  // Reply State
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal States
  const [viewingReview, setViewingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data: resData } = await cachedGet("/hotel/reviews", {}, forceRefresh);
      if (resData && resData.status === "success") {
        setReviews(resData.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat ulasan.");
    } finally {
      setLoading(false);
    }
  };

  // Mark as read (frontend-only state)
  const handleMarkAsRead = (reviewId) => {
    setReadIds((prev) => new Set([...prev, reviewId]));
    toast.success("Review marked as read.");
  };

  // View Detail Handler
  const handleOpenDetail = (review) => {
    setReadIds((prev) => new Set([...prev, review.id]));
    setViewingReview(review);
    setReplyingId(null);
    setReplyText("");
  };

  // Send Reply
  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }
    setIsSendingReply(true);
    try {
      const response = await api.post(`/hotel/reviews/${reviewId}/reply`, {
        reply: replyText.trim(),
      });
      if (response.data && response.data.status === "success") {
        toast.success("Reply sent successfully.");
        invalidateCache("/hotel/reviews");
        invalidateCache("/admin/hotel/dashboard");
        const sentReply = replyText.trim();
        setReplyingId(null);
        setReplyText("");
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, reply: sentReply } : r))
        );
        if (viewingReview && viewingReview.id === reviewId) {
          setViewingReview((prev) => ({ ...prev, reply: sentReply }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim balasan.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Hapus ulasan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await api.delete(`/hotel/reviews/${reviewId}`);
      toast.success("Ulasan berhasil dihapus.");
      invalidateCache("/hotel/reviews");
      invalidateCache("/admin/hotel/dashboard");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (viewingReview && viewingReview.id === reviewId) {
        setViewingReview(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus ulasan.");
    }
  };

  // DYNAMIC CALCULATIONS
  const totalReviews = reviews.length;
  const unreadCount = reviews.filter((r) => !readIds.has(r.id)).length;

  const count5Star = reviews.filter((r) => r.rating === 5).length;
  const count4Star = reviews.filter((r) => r.rating === 4).length;
  const count3Star = reviews.filter((r) => r.rating === 3).length;
  const count2Star = reviews.filter((r) => r.rating === 2).length;
  const count1Star = reviews.filter((r) => r.rating === 1).length;

  const sumRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : "0.0";

  // Percentage calculations
  const getPercentage = (count) =>
    totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

  // Filter Logic
  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const guestName = r.guest?.name || "";
    const comment = r.comment || "";
    const matchesSearch =
      guestName.toLowerCase().includes(q) ||
      comment.toLowerCase().includes(q);

    let matchesRating = true;
    if (ratingFilter === "5") matchesRating = r.rating === 5;
    else if (ratingFilter === "4") matchesRating = r.rating === 4;
    else if (ratingFilter === "3") matchesRating = r.rating === 3;
    else if (ratingFilter === "2") matchesRating = r.rating === 2;
    else if (ratingFilter === "1") matchesRating = r.rating === 1;
    else if (ratingFilter === "3below") matchesRating = r.rating <= 3;

    let matchesDate = true;
    const today = new Date().toISOString().slice(0, 10);
    if (dateFilter === "today") matchesDate = (r.created_at || "").slice(0, 10) === today;

    return matchesSearch && matchesRating && matchesDate;
  });

  // Sorting Logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    return 0;
  });

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
            Reviews
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            View and manage guest reviews for your hotel.
          </p>
        </div>

        {/* Unread Reviews Badge Counter */}
        <div className="flex items-center gap-2 bg-[#E4EBE0] px-4 py-2 rounded-xl border border-[#c4c8be]/40 text-[#4A5D43]">
          <span className="material-symbols-outlined text-[18px]">mark_email_unread</span>
          <span className="text-xs font-bold">{unreadCount} Unread Reviews</span>
        </div>
      </div>

      {/* SECTION 1: REVIEW SUMMARY & RATING OVERVIEW (BENTO GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
            Average Rating
          </span>
          <div className="font-['Newsreader',serif] text-6xl font-bold text-[#2D312C] mt-2">
            {averageRating}
          </div>
          <div className="mt-2 mb-1">{renderStars(Math.round(Number(averageRating)))}</div>
          <p className="text-xs text-[#6B6E6A] mt-2">
            Based on <span className="font-bold text-[#2D312C]">{totalReviews}</span> total reviews
          </p>
        </div>

        {/* Card 2: Rating Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 space-y-4">
          <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
            Rating Overview &amp; Distribution
          </h3>

          <div className="space-y-2 text-xs">
            {/* 5 Stars */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-semibold text-[#2D312C]">5 Stars</span>
              <div className="flex-1 h-3 bg-[#f0ede9] rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className="h-full bg-[#506147] rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(count5Star)}%` }}
                />
              </div>
              <span className="w-16 text-right text-[#6B6E6A] font-medium">
                {count5Star} ({getPercentage(count5Star)}%)
              </span>
            </div>

            {/* 4 Stars */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-semibold text-[#2D312C]">4 Stars</span>
              <div className="flex-1 h-3 bg-[#f0ede9] rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className="h-full bg-[#69795f] rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(count4Star)}%` }}
                />
              </div>
              <span className="w-16 text-right text-[#6B6E6A] font-medium">
                {count4Star} ({getPercentage(count4Star)}%)
              </span>
            </div>

            {/* 3 Stars */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-semibold text-[#2D312C]">3 Stars</span>
              <div className="flex-1 h-3 bg-[#f0ede9] rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className="h-full bg-[#D48C45] rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(count3Star)}%` }}
                />
              </div>
              <span className="w-16 text-right text-[#6B6E6A] font-medium">
                {count3Star} ({getPercentage(count3Star)}%)
              </span>
            </div>

            {/* 2 Stars */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-semibold text-[#2D312C]">2 Stars</span>
              <div className="flex-1 h-3 bg-[#f0ede9] rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className="h-full bg-[#ad6042] rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(count2Star)}%` }}
                />
              </div>
              <span className="w-16 text-right text-[#6B6E6A] font-medium">
                {count2Star} ({getPercentage(count2Star)}%)
              </span>
            </div>

            {/* 1 Star */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right font-semibold text-[#2D312C]">1 Star</span>
              <div className="flex-1 h-3 bg-[#f0ede9] rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className="h-full bg-[#ba1a1a] rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(count1Star)}%` }}
                />
              </div>
              <span className="w-16 text-right text-[#6B6E6A] font-medium">
                {count1Star} ({getPercentage(count1Star)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SEARCH, FILTER & SORT BAR */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
              <option value="3below">3 &amp; Below</option>
            </select>


            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Date: All</option>
              <option value="today">Today</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest">Sort: Highest Rating</option>
              <option value="lowest">Sort: Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: REVIEWS GRID */}
      <div className="space-y-4">
        <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
          Guest Reviews
        </h3>

        {sortedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedReviews.map((review) => {
              const isUnread = !readIds.has(review.id);
              const guestInitials = (review.guest?.name || "G")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const dateStr = review.created_at
                ? new Date(review.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                : "";

              return (
                <div
                  key={review.id}
                  className={`rounded-xl border p-6 shadow-sm flex flex-col gap-4 transition-all relative ${
                    isUnread
                      ? "bg-[#F2EBE1]/40 border-[#506147]/40 ring-1 ring-[#506147]/20"
                      : "bg-white border-[#E5E1DA]"
                  }`}
                >
                  {/* Unread Indicator Badge */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#506147] text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Unread
                    </span>
                  )}

                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#f0ede9] text-[#506147] font-bold text-sm flex items-center justify-center border border-[#E5E1DA] shrink-0">
                        {guestInitials}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2D312C] text-base leading-snug">
                          {review.guest?.name || "Guest"}
                        </h4>
                        <p className="text-xs text-[#6B6E6A]">
                          {review.booking_code ? `Booking: ${review.booking_code} • ` : ""}{dateStr}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">{renderStars(review.rating)}</div>
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm text-[#444840] leading-relaxed italic">
                    &quot;{review.comment}&quot;
                  </p>

                  {/* Reply Display */}
                  {review.reply && (
                    <div className="bg-[#E4EBE0] rounded-lg p-3 border border-[#c4c8be]/40 text-xs">
                      <span className="font-bold text-[#4A5D43] block mb-1">Hotel Reply:</span>
                      <p className="text-[#2D312C]">{review.reply}</p>
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  {replyingId === review.id && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="Write your reply..."
                        className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-[#fcf9f5] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReply(review.id)}
                          disabled={isSendingReply}
                          className="px-4 py-1.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors disabled:opacity-50"
                        >
                          {isSendingReply ? "Sending..." : "Send Reply"}
                        </button>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(""); }}
                          className="px-4 py-1.5 bg-[#f0ede9] text-[#2D312C] text-xs font-semibold rounded-lg hover:bg-[#e5e2de] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#E5E1DA] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(review.id)}
                          className="px-3 py-1.5 bg-[#f0ede9] text-[#2D312C] text-xs font-semibold rounded-lg hover:bg-[#e5e2de] transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                      {!review.reply && replyingId !== review.id && (
                        <button
                          onClick={() => { setReplyingId(review.id); setReplyText(""); }}
                          className="px-3 py-1.5 bg-[#E4EBE0] text-[#4A5D43] text-xs font-semibold rounded-lg hover:bg-[#d4e0d0] transition-colors"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(review)}
                        className="px-3 py-1.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors"
                      >
                        View Detail
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E1DA] p-12 text-center text-[#6B6E6A]">
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-[#c4c8be]">
                rate_review
              </span>
              <div>
                <p className="font-semibold text-[#2D312C] text-base">
                  {reviews.length === 0
                    ? "No reviews yet."
                    : "No reviews match your filters."}
                </p>
                <p className="text-xs text-[#6B6E6A] mt-1">
                  {reviews.length === 0
                    ? "Guest reviews will appear here after guests complete their stay."
                    : "Coba ubah kata kunci atau bersihkan filter pencarian Anda."}
                </p>
              </div>

              {searchQuery ||
              ratingFilter !== "all" ||
              dateFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRatingFilter("all");
                    setDateFilter("all");
                  }}
                  className="mt-2 px-4 py-2 bg-[#f0ede9] text-[#2D312C] rounded-lg text-xs font-semibold hover:bg-[#e5e2de] transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REVIEW DETAIL                                                    */}
      {/* ========================================================================= */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#fcf9f5] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                  Review Detail
                </h3>
                {renderStars(viewingReview.rating)}
              </div>
              <button
                onClick={() => setViewingReview(null)}
                className="p-1.5 text-[#6B6E6A] hover:bg-[#eae8e4] rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Section 1: Guest Information */}
              <div className="bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] p-5 space-y-3">
                <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">Guest Information</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E4EBE0] text-[#4A5D43] font-bold text-sm flex items-center justify-center border border-[#E5E1DA]">
                    {(viewingReview.guest?.name || "G").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-[#2D312C] text-sm">{viewingReview.guest?.name || "Guest"}</p>
                    {viewingReview.booking_code && (
                      <p className="text-[#6B6E6A]">Booking: {viewingReview.booking_code}</p>
                    )}
                    <p className="text-[#6B6E6A]">
                      {viewingReview.created_at
                        ? new Date(viewingReview.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Review Content */}
              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                    Review Comment &amp; Rating
                  </h4>
                  <span className="text-xs text-[#6B6E6A] font-semibold">
                    {viewingReview.created_at ? new Date(viewingReview.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(viewingReview.rating)}
                  <span className="text-xs font-bold text-[#2D312C]">{viewingReview.rating}.0 / 5.0</span>
                </div>
                <p className="text-sm text-[#444840] leading-relaxed bg-[#fcf9f5] p-4 rounded-xl border border-[#E5E1DA] italic">
                  &quot;{viewingReview.comment}&quot;
                </p>
              </div>

              {/* Section 3: Hotel Reply */}
              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 space-y-3 shadow-sm">
                <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">Hotel Reply</h4>
                {viewingReview.reply ? (
                  <p className="text-sm text-[#444840] leading-relaxed bg-[#E4EBE0] p-4 rounded-xl border border-[#c4c8be]/40">
                    {viewingReview.reply}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#6B6E6A]">No reply yet. Write a response below:</p>
                    <textarea
                      value={replyingId === viewingReview.id ? replyText : ""}
                      onChange={(e) => { setReplyingId(viewingReview.id); setReplyText(e.target.value); }}
                      rows={3}
                      placeholder="Write your reply to this guest..."
                      className="w-full px-3 py-2 text-sm border border-[#E5E0D8] rounded-lg bg-[#fcf9f5] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 resize-none"
                    />
                    <button
                      onClick={() => handleSendReply(viewingReview.id)}
                      disabled={isSendingReply}
                      className="px-5 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors disabled:opacity-50"
                    >
                      {isSendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}