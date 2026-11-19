import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge, { getStatusLabel } from "./StatusBadge";

const STATUS_MESSAGES = {
  pending: {
    color: "bg-[#eae1d8]/50 border-[#eae1d8]",
    iconColor: "text-[#615b54]",
    title: "Pending Verification",
    message:
      "Our team is checking the completeness of the documents and data you submitted. This process takes 3-7 business days.",
  },
  under_review: {
    color: "bg-[#ceeac7]/40 border-[#ceeac7]",
    iconColor: "text-[#4c6549]",
    title: "Under Review",
    message:
      "Your application is under further review. Please monitor your email and this page periodically.",
  },
  needs_revision: {
    color: "bg-[#ffdad6]/30 border-[#ffdad6]",
    iconColor: "text-[#ba1a1a]",
    title: "Needs Revision",
    message:
      "The verification team has requested data or document revisions. Please correct them according to the notes below and resubmit.",
  },
  approved: {
    color: "bg-[#d5e8cf]/50 border-[#d5e8cf]",
    iconColor: "text-[#3b4b39]",
    title: "Your Hotel Has Been Approved! 🎉",
    message:
      "Congratulations! Your partnership application has been approved. You can now manage your hotel through the Hotel Admin Dashboard.",
  },
  rejected: {
    color: "bg-[#ffdad6]/50 border-[#ffdad6]",
    iconColor: "text-[#93000a]",
    title: "Application Rejected",
    message:
      "We apologize, but your partnership application could not be approved. Please address the following issues and reapply another time.",
  },
};

const ApplicationStatus = ({ application, loading, onFixRevision, approvalNotification }) => {
  const navigate = useNavigate();
  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm animate-pulse">
        <div className="h-5 w-48 bg-[#DCCFC0]/50 rounded mb-4" />
        <div className="h-4 w-full bg-[#DCCFC0]/30 rounded mb-2" />
        <div className="h-4 w-3/4 bg-[#DCCFC0]/30 rounded" />
      </section>
    );
  }
  // Belum pernah mengajukan
  if (!application) {
    return (
      <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4 border-b border-[#DCCFC0]/30 pb-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#eae1d8]/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-[#615b54]">apartment</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-md text-xl font-bold text-[#2D332C] mb-1">Hotel Partner Status</h3>
            <p className="font-body-md text-sm text-[#444842]">
              Information regarding the status of your hotel partnership application on the H'Leven platform.
            </p>
          </div>
        </div>

        <div className="bg-[#faf3ea] border border-[#DCCFC0]/50 rounded-2xl p-5 md:p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white border-2 border-dashed border-[#DCCFC0] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#747871]">add_home_work</span>
          </div>
          <h4 className="font-title-md text-lg font-bold text-[#1c1c19] mb-2">
            You are not a hotel partner yet.
          </h4>
          <p className="font-body-md text-sm text-[#444842] mb-5 max-w-lg mx-auto leading-relaxed">
            Register your hotel now and enjoy the benefits with thousands of other H'Leven partners to grow your hotel business.
          </p>
          <button
            type="button"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) navigate("/mitra/daftar");
              else navigate("/mitra");
            }}
            className="px-8 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">flag</span>
              Register as Partner
            </span>
          </button>
        </div>
      </section>
    );
  }

  const status = application.status || "pending";
  const st = STATUS_MESSAGES[status] || STATUS_MESSAGES.pending;
  const submitDate = application.created_at || application.submitted_at;
  const dateStr = submitDate
    ? new Date(submitDate).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "-";

  return (
    <section className="bg-white rounded-2xl border border-[#DCCFC0]/40 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#DCCFC0]/30 pb-5 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#d5e8cf]/50 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl text-[#50604d]">real_estate_agent</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">Hotel Partner Status</h3>
            <StatusBadge status={status} />
          </div>
          <p className="font-body-md text-sm text-[#444842]">
            Application No.:{" "}
            <span className="font-semibold text-[#50604d]">
              #{application.application_number || application.id || "—"}
            </span>
            <span className="mx-2 text-[#DCCFC0]">•</span>
            Submitted on {dateStr}
          </p>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 md:p-6 mb-5 ${st.color}`}>
        <div className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-[26px] shrink-0 mt-0.5 ${st.iconColor}`}>
            {status === "approved" ? "workspace_premium"
              : status === "rejected" ? "cancel"
              : status === "needs_revision" ? "edit_note"
              : status === "under_review" ? "visibility"
              : "schedule"}
          </span>
          <div className="flex-1">
            <h4 className={`font-title-md text-lg font-bold mb-1.5 ${st.iconColor}`}>{st.title}</h4>
            <p className="font-body-md text-sm leading-relaxed text-[#1c1c19]/90">{st.message}</p>
          </div>
        </div>
      </div>

      {status === "approved" && approvalNotification?.message && (
        <div className="rounded-2xl border border-[#778873]/30 bg-[#e8f0e4]/50 p-5 md:p-6 mb-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[26px] shrink-0 mt-0.5 text-[#3b4b39]">
              key
            </span>
            <div className="flex-1">
              <h5 className="font-label-md text-sm font-bold text-[#3b4b39] uppercase tracking-wider mb-3">
                Hotel Admin Access Information
              </h5>
              <p className="font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">
                {approvalNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {(status === "needs_revision" || status === "rejected") &&
        (application.rejection_reason || application.revision_notes || application.reason) && (
          <div className="bg-white rounded-2xl border border-[#ba1a1a]/30 p-5 md:p-6 mb-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ba1a1a] shrink-0 mt-0.5">
                sticky_note_2
              </span>
              <div className="flex-1">
                <h5 className="font-label-md text-sm font-bold text-[#93000a] uppercase tracking-wider mb-2">
                  {status === "needs_revision" ? "Requested Revision" : "Rejection Reason"}
                </h5>
                <p className="font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">
                  {application.rejection_reason ||
                    application.revision_notes ||
                    application.reason}
                </p>
              </div>
            </div>
          </div>
        )}

      {application.hotel_name && (
        <div className="bg-[#faf3ea]/70 rounded-2xl border border-[#DCCFC0]/40 p-5 mb-6">
          <div>
            <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-0.5">
              Hotel Name
            </span>
            <span className="font-body-md text-sm font-semibold text-[#1c1c19]">{application.hotel_name}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-start sm:justify-end">
        {status === "needs_revision" && (
          <button
            type="button"
            onClick={onFixRevision}
            className="px-7 py-3 rounded-xl bg-[#ba1a1a] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#93000a] transition-colors shadow-md active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Fix Application
            </span>
          </button>
        )}
        {status === "approved" && (
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="px-7 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Go to Hotel Dashboard
            </span>
          </button>
        )}
        {status === "rejected" && (
          <button
            type="button"
            onClick={() => navigate("/mitra")}
            className="px-7 py-3 rounded-xl border-2 border-[#50604d] text-[#50604d] font-label-sm text-xs font-bold tracking-wider hover:bg-[#e5e2dd] transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Learn Partner Terms
            </span>
          </button>
        )}
        {(status === "pending" || status === "under_review") && (
          <button
            type="button"
            onClick={() => navigate("/mitra")}
            className="px-7 py-3 rounded-xl border-2 border-[#50604d] text-[#50604d] font-label-sm text-xs font-bold tracking-wider hover:bg-[#e5e2dd] transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              View Partner Benefits
            </span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ApplicationStatus;
