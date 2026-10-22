import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import StatusBadge, { getStatusLabel } from "../../components/mitra/StatusBadge";

const MitraRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state || null);

  useEffect(() => {
    if (!data) {
      try {
        const saved = localStorage.getItem("partner_app_submission");
        if (saved) setData(JSON.parse(saved));
      } catch (e) {}
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center px-5">
        <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-8 max-w-md text-center shadow-md">
          <span className="material-symbols-outlined text-5xl text-[#747871] mb-3">find_in_page</span>
          <h2 className="font-headline-lg text-2xl font-bold text-[#1c1c19] mb-2">Tidak ada data pengajuan</h2>
          <p className="font-body-md text-sm text-[#444842] mb-6">
            Silakan lakukan pengajuan terlebih dahulu melalui halaman pendaftaran mitra.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/mitra"
              className="px-6 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors"
            >
              Halaman Mitra
            </Link>
            <Link
              to="/mitra/daftar"
              className="px-6 py-3 rounded-xl border-2 border-[#50604d] text-[#50604d] font-label-sm text-xs font-bold tracking-wider hover:bg-[#e5e2dd] transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submitDate = data.submitted_at || data.created_at ? new Date(data.submitted_at || data.created_at) : new Date();
  const dateStr = submitDate.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = submitDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const status = data.status || "pending";
  const appNumber = data.application_number || data.id || "HLVN-MIT-" + (data.id || "xxxxxx");

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center px-5 py-12">
      <div className="bg-white rounded-3xl border border-[#c4c8bf]/60 p-6 md:p-10 max-w-2xl w-full text-center shadow-[0_10px_40px_rgba(80,96,77,0.08)]">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#d5e8cf]/50 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[56px] text-[#50604d] icon-fill">check_circle</span>
        </div>

        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#1c1c19] mb-2">
          Pengajuan Berhasil Dikirim!
        </h1>
        <p className="font-body-md text-sm md:text-base text-[#444842] mb-6 leading-relaxed">
          Terima kasih telah mendaftarkan hotel Anda ke program kemitraan H'Leven.
          Tim kami akan segera meninjau pengajuan Anda. Setelah disetujui, akun admin hotel akan dibuat secara otomatis menggunakan email hotel yang Anda daftarkan.
        </p>

        <div className="bg-[#faf3ea] rounded-2xl border border-[#DCCFC0]/60 p-5 md:p-6 mb-6 text-left space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#DCCFC0]/50">
            <span className="font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871]">
              Nomor Pengajuan
            </span>
            <span className="font-headline-md text-base font-bold text-[#50604d]">
              #{appNumber}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-1">
                Nama Hotel
              </span>
              <span className="font-body-md text-sm font-semibold text-[#1c1c19]">
                {data.hotel_name || "Hotel Anda"}
              </span>
            </div>
            <div>
              <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-1">
                Status Pengajuan
              </span>
              <StatusBadge status={status} />
            </div>
            <div>
              <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-1">
                Tanggal Pengajuan
              </span>
              <span className="font-body-md text-sm text-[#1c1c19]">{dateStr}</span>
            </div>
            <div>
              <span className="block font-label-sm text-[11px] font-bold tracking-wider uppercase text-[#747871] mb-1">
                Waktu
              </span>
              <span className="font-body-md text-sm text-[#1c1c19]">{timeStr} WIB</span>
            </div>
          </div>
        </div>

        <div className="bg-[#ceeac7]/40 border border-[#ceeac7] rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
          <span className="material-symbols-outlined text-[#4c6549] shrink-0 mt-0.5">timeline</span>
          <div className="font-body-md text-xs md:text-sm text-[#0a200a] leading-relaxed">
            <p className="font-bold mb-1">Proses verifikasi pengajuan membutuhkan waktu 3-7 hari kerja.</p>
            <p>Anda akan menerima notifikasi melalui email ketika ada perubahan status. Sementara itu, periksa status pengajuan Anda kapan saja melalui halaman profil.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-8 py-3.5 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Cek Status Pengajuan
            </span>
          </button>
          <Link
            to="/hotels"
            className="px-8 py-3.5 rounded-xl border-2 border-[#50604d] text-[#50604d] font-label-sm text-xs font-bold tracking-wider hover:bg-[#e5e2dd] transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Jelajahi Hotel
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MitraRegistrationSuccess;
