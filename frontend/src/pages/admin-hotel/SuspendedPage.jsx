import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import WarningList from "../../components/admin-hotel/WarningList";

export default function SuspendedPage() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hotelStatus, setHotelStatus] = useState("blocked");
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Cek status hotel dari server
  const checkHotelStatus = useCallback(async () => {
    try {
      const res = await api.get("/admin/hotel/profile");
      const status = res.data?.data?.status;
      if (status) {
        setHotelStatus(status);
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          u.hotel_status = status;
          if (u.hotel) u.hotel.status = status;
          localStorage.setItem("user", JSON.stringify(u));
        } catch (_) {}
      }
    } catch (_) {} finally {
      setCheckingStatus(false);
    }
  }, []);

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/appeals");
      const pag = res.data?.data;
      const list = Array.isArray(pag?.data) ? pag.data : Array.isArray(pag) ? pag : [];
      setAppeals(list);
    } catch (e) {
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHotelStatus();
    fetchAppeals();
  }, [checkHotelStatus, fetchAppeals]);

  const hasPendingSuspend = appeals.some((a) => !a.warning_id && a.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("Appeal reason must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/admin/appeals", { reason: reason.trim() });
      toast.success("Account recovery appeal successfully submitted to Super Admin");
      setReason("");
      fetchAppeals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const badge = (s) => {
    if (s === "pending") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20">Pending</span>;
    if (s === "approved") return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E4EBE0] text-[#4A5D43] border border-[#4A5D43]/20">Approved</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20">Rejected</span>;
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col items-center justify-start p-6 font-['Hanken_Grotesk',sans-serif]">
      {/* Top Header Bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">H&apos;Leven Admin</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-semibold uppercase">Blocked Status</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Banner Pemulihan jika Hotel Sudah Aktif */}
        {hotelStatus === "active" ? (
          <div className="bg-[#E4EBE0] border border-[#4A5D43]/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[#4A5D43] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </span>
              <div>
          <h2 className="font-['Newsreader',serif] text-xl font-bold text-[#2D312C]">Hotel Reactivated!</h2>
          <p className="text-xs text-[#434842] mt-1">
            Your appeal has been approved by the Super Admin. Dashboard access restored.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="shrink-0 px-5 py-2.5 bg-[#506147] text-white rounded-xl text-xs font-bold hover:bg-[#3b4b33] transition-colors shadow-sm"
      >
        Enter Dashboard
      </button>
    </div>
  ) : (
    <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="w-12 h-12 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">block</span>
        </span>
        <div>
          <h1 className="font-['Newsreader',serif] text-2xl font-bold text-[#93000a]">Hotel Account Blocked</h1>
          <p className="text-xs text-[#434842] mt-1 leading-relaxed">
            Your hotel status is <strong>{hotelStatus}</strong>. Access to operational dashboards, room management, and booking is <strong>locked</strong> until appeal is approved.
          </p>
        </div>
      </div>
    </div>
  )}

        {/* ... (Warning List remains the same) ... */}

        {/* Account Restoration Appeal Form (appears if status is not active) */}
        {hotelStatus !== "active" && (
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-sm text-[#2D312C] mb-1">Appeal Account Recovery</h2>
            <p className="text-xs text-[#6B6E6A] mb-4">
              Explain the reason for the unblock appeal and your future mitigation plan.
            </p>
            {hasPendingSuspend ? (
              <div className="bg-[#E0F2FE] border border-[#0369A1]/20 rounded-xl p-4 text-xs text-[#0369A1] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                <span>Account recovery appeal is under review by Super Admin. Please wait for the decision.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Explain the appeal reason and your hotel's compliance commitment..."
                  className="w-full p-3 border border-[#E5E1DA] rounded-xl text-xs focus:outline-none focus:border-[#506147] focus:ring-1 focus:ring-[#506147]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#6B6E6A]">{reason.length}/2000 characters</span>
                  <button
                    type="submit"
                    disabled={submitting || !reason.trim()}
                    className="px-5 py-2 bg-[#506147] text-white rounded-xl text-xs font-semibold hover:bg-[#3b4b33] disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {submitting ? "Submitting..." : "Submit Appeal"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

         {/* Appeal History */}
        <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-[#2D312C] mb-3">Appeal History</h3>
          {loading ? (
            <p className="text-xs text-[#6B6E6A]">Loading history...</p>
          ) : appeals.length === 0 ? (
            <p className="text-xs text-[#6B6E6A]">No appeal history.</p>
          ) : (
            <div className="space-y-3">
              {appeals.map((a) => (
                <div key={a.id} className="border border-[#E5E1DA] rounded-xl p-4 bg-[#fcf9f5] space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#2D312C]">
                          {a.warning_id ? `Warning Appeal #WRN-${String(a.warning_id).padStart(4, "0")}` : "Account Recovery Appeal"}
                        </span>
                        {a.warning?.title && (
                          <span className="text-[11px] text-[#6B6E6A]">({a.warning.title})</span>
                        )}
                      </div>
                      <p className="text-xs text-[#434842] mt-1 whitespace-pre-wrap">{a.reason}</p>
                    </div>
                    {badge(a.status)}
                  </div>
                  {a.admin_note && (
                    <div className="p-2.5 bg-white border border-[#E5E1DA] rounded-lg text-xs text-[#6B6E6A]">
                      Super Admin Note: <span className="text-[#2D312C] font-medium">{a.admin_note}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-[#6B6E6A]/70">
                    Submitted: {a.created_at ? new Date(a.created_at).toLocaleString("en-US") : "-"}
                    {a.decided_at ? ` • Decided: ${new Date(a.decided_at).toLocaleString("en-US")}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
