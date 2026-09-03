import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge, { getStatusLabel } from "./StatusBadge";

const STATUS_MESSAGES = {
  pending: {
    color: "bg-[#eae1d8]/50 border-[#eae1d8]",
    iconColor: "text-[#615b54]",
    title: "Menunggu Verifikasi",
    message:
      "Tim kami sedang memeriksa kelengkapan dokumen dan data yang Anda kirimkan. Proses ini membutuhkan waktu 3-7 hari kerja.",
  },
  under_review: {
    color: "bg-[#ceeac7]/40 border-[#ceeac7]",
    iconColor: "text-[#4c6549]",
    title: "Sedang Ditinjau",
    message:
      "Pengajuan Anda sedang dalam tahap peninjauan lebih lanjut. Silakan pantau email dan halaman ini secara berkala.",
  },
  needs_revision: {
    color: "bg-[#ffdad6]/30 border-[#ffdad6]",
    iconColor: "text-[#ba1a1a]",
    title: "Membutuhkan Perbaikan",
    message:
      "Tim verifikasi meminta perbaikan data atau dokumen. Silakan perbaiki sesuai catatan di bawah lalu kirim ulang.",
  },
  approved: {
    color: "bg-[#d5e8cf]/50 border-[#d5e8cf]",
    iconColor: "text-[#3b4b39]",
    title: "Hotel Anda Telah Disetujui! 🎉",
    message:
      "Selamat! Pengajuan kemitraan Anda telah disetujui. Sekarang Anda dapat mengelola hotel Anda melalui Dashboard Admin Hotel.",
  },
  rejected: {
    color: "bg-[#ffdad6]/50 border-[#ffdad6]",
    iconColor: "text-[#93000a]",
    title: "Pengajuan Ditolak",
    message:
      "Kami mohon maaf, pengajuan kemitraan Anda belum dapat kami setujui. Silakan perbaiki kekurangan berikut dan ajukan kembali di lain waktu.",
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
            <h3 className="font-headline-md text-xl font-bold text-[#2D332C] mb-1">Status Mitra Hotel</h3>
            <p className="font-body-md text-sm text-[#444842]">
              Informasi status pengajuan kemitraan hotel Anda di platform H'Leven.
            </p>
          </div>
        </div>

        <div className="bg-[#faf3ea] border border-[#DCCFC0]/50 rounded-2xl p-5 md:p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white border-2 border-dashed border-[#DCCFC0] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#747871]">add_home_work</span>
          </div>
          <h4 className="font-title-md text-lg font-bold text-[#1c1c19] mb-2">
            Anda belum menjadi mitra hotel.
          </h4>
          <p className="font-body-md text-sm text-[#444842] mb-5 max-w-lg mx-auto leading-relaxed">
            Daftarkan hotel Anda sekarang dan nikmati keuntungan bersama ribuan mitra H'Leven lainnya untuk mengembangkan bisnis hotel Anda.
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
              Daftar Menjadi Mitra
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
            <h3 className="font-headline-md text-xl font-bold text-[#2D332C]">Status Mitra Hotel</h3>
            <StatusBadge status={status} />
          </div>
          <p className="font-body-md text-sm text-[#444842]">
            No. Pengajuan:{" "}
            <span className="font-semibold text-[#50604d]">
              #{application.application_number || application.id || "—"}
            </span>
            <span className="mx-2 text-[#DCCFC0]">•</span>
            Diajukan pada {dateStr}
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
                Informasi Akses Admin Hotel
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
                  {status === "needs_revision" ? "Perbaikan yang Diminta" : "Alasan Penolakan"}
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
        <div className="bg-[#faf3ea]/70 rounded-2xl border border-[#DCCFC0]/40 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-0.5">
              Nama Hotel
            </span>
            <span className="font-body-md text-sm font-semibold text-[#1c1c19]">{application.hotel_name}</span>
          </div>
          {application.hotel_type && (
            <div>
              <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-0.5">
                Tipe Hotel
              </span>
              <span className="font-body-md text-sm text-[#1c1c19]">{application.hotel_type}</span>
            </div>
          )}
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
              Perbaiki Pengajuan
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
              Masuk ke Dashboard Hotel
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
              Pelajari Ketentuan Mitra
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
              Lihat Keuntungan Mitra
            </span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ApplicationStatus;
