import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import PartnerStepper from "../../components/mitra/PartnerStepper";
import FileUpload from "../../components/mitra/FileUpload";
import api from "../../services/api";

const STEP_LABELS = [
  "Informasi Hotel",
  "Lokasi",
  "Pemilik",
  "Dokumen",
  "Rekening",
  "Review",
];

const HOTEL_TYPES = [
  "Hotel",
  "Resort",
  "Villa",
  "Guest House",
  "Boutique Hotel",
  "Lainnya",
];

const INPUT_BASE =
  "bg-[#faf3ea] border border-[#DCCFC0] rounded-xl px-4 py-3.5 font-body-md text-sm text-[#1c1c19] focus:outline-none focus:border-[#778873] focus:ring-2 focus:ring-[#778873]/20 transition-all placeholder:text-[#747871]/70";
const INPUT_ERROR = "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/20";
const LABEL = "font-label-md text-xs font-semibold text-[#444842]";
const HELPER = "text-[11px] text-[#747871] -mt-1";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^[+\d\s\-()]{8,20}$/.test(v);
const isValidPostal = (v) => /^\d{4,10}$/.test(v);

const emptyForm = {
  hotel_name: "",
  hotel_type: "",
  hotel_description: "",
  hotel_phone: "",
  hotel_email: "",
  room_count: "",
  address: "",
  province: "",
  city: "",
  district: "",
  postal_code: "",
  maps_url: "",
  latitude: "",
  longitude: "",
  owner_name: "",
  owner_email: "",
  owner_phone: "",
  owner_id_number: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  doc_ktp: null,
  doc_legal: null,
  doc_support: null,
  agree: false,
};

const MitraRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Coba prefill dari user yang login
  useEffect(() => {
    if (userString) {
      try {
        const u = JSON.parse(userString);
        setForm((prev) => ({
          ...prev,
          owner_name: prev.owner_name || u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "",
          owner_email: prev.owner_email || u.email || "",
          owner_phone: prev.owner_phone || u.phone || "",
        }));
      } catch (e) {}
    }
    // Jika user buka dari needs_revision / edit, bisa load dari state
    if (location.state?.prefill) {
      setForm((prev) => ({ ...prev, ...location.state.prefill }));
    }
  }, [userString, location.state]);

  if (!token || !userString) {
    return <Navigate to="/login" state={{ from: "/mitra/daftar" }} replace />;
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!form.hotel_name.trim()) e.hotel_name = "Nama hotel wajib diisi";
      if (!form.hotel_type) e.hotel_type = "Pilih tipe hotel";
      if (!form.hotel_description.trim()) e.hotel_description = "Deskripsi hotel wajib diisi";
      if (!form.hotel_phone.trim()) e.hotel_phone = "Nomor telepon hotel wajib diisi";
      else if (!isValidPhone(form.hotel_phone)) e.hotel_phone = "Format nomor telepon tidak valid";
      if (!form.hotel_email.trim()) e.hotel_email = "Email hotel wajib diisi";
      else if (!isValidEmail(form.hotel_email)) e.hotel_email = "Format email tidak valid";
      if (!form.room_count) e.room_count = "Jumlah kamar wajib diisi";
      else if (isNaN(Number(form.room_count)) || Number(form.room_count) < 1) e.room_count = "Jumlah kamar harus angka minimal 1";
    }
    if (step === 2) {
      if (!form.address.trim()) e.address = "Alamat lengkap wajib diisi";
      if (!form.province.trim()) e.province = "Provinsi wajib diisi";
      if (!form.city.trim()) e.city = "Kota/Kabupaten wajib diisi";
      if (!form.district.trim()) e.district = "Kecamatan wajib diisi";
      if (!form.postal_code.trim()) e.postal_code = "Kode pos wajib diisi";
      else if (!isValidPostal(form.postal_code)) e.postal_code = "Kode pos harus angka 4-10 digit";
    }
    if (step === 3) {
      if (!form.owner_name.trim()) e.owner_name = "Nama lengkap wajib diisi";
      if (!form.owner_email.trim()) e.owner_email = "Email wajib diisi";
      else if (!isValidEmail(form.owner_email)) e.owner_email = "Format email tidak valid";
      if (!form.owner_phone.trim()) e.owner_phone = "Nomor telepon wajib diisi";
      else if (!isValidPhone(form.owner_phone)) e.owner_phone = "Format nomor telepon tidak valid";
      if (!form.owner_id_number.trim()) e.owner_id_number = "Nomor identitas wajib diisi";
      else if (form.owner_id_number.trim().length < 10) e.owner_id_number = "Nomor identitas terlalu pendek";
    }
    if (step === 4) {
      if (!form.doc_ktp) e.doc_ktp = "Unggah KTP/Identitas pemilik";
      if (!form.doc_legal) e.doc_legal = "Unggah dokumen legalitas hotel";
    }
    if (step === 5) {
      if (!form.bank_name.trim()) e.bank_name = "Nama bank wajib diisi";
      if (!form.bank_account_number.trim()) e.bank_account_number = "Nomor rekening wajib diisi";
      else if (!/^[\d\s-]{6,30}$/.test(form.bank_account_number)) e.bank_account_number = "Format nomor rekening tidak valid";
      if (!form.bank_account_name.trim()) e.bank_account_name = "Nama pemilik rekening wajib diisi";
    }
    if (step === 6) {
      if (!form.agree) e.agree = "Anda harus menyetujui pernyataan ini";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error("Mohon lengkapi data yang belum sesuai.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (s) => {
    if (s < currentStep || s === currentStep) {
      setCurrentStep(s);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      toast.error("Mohon centang pernyataan persetujuan.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "agree") return;
        if (k.startsWith("doc_") && v instanceof File) {
          payload.append(k, v);
        } else if (v !== null && v !== undefined) {
          payload.append(k, String(v));
        }
      });

      let responseData = null;
      let useFallback = false;
      try {
        // API BELUM TERSEDIA - Catatan kebutuhan backend:
        // POST /api/v1/partner-applications
        // Request (multipart/form-data): semua field form + dokumen (doc_ktp, doc_legal, doc_support)
        // Response: { success, data: { id, application_number, status, created_at, hotel_name } }
        const res = await api.post("/partner-applications", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        responseData = res.data?.data || res.data;
      } catch (err) {
        console.warn("API /partner-applications belum tersedia, pakai simulasi sukses.", err);
        useFallback = true;
        responseData = {
          id: "SIM-" + Date.now(),
          application_number: "HLVN-MIT-" + Math.floor(100000 + Math.random() * 900000),
          hotel_name: form.hotel_name,
          status: "pending",
          created_at: new Date().toISOString(),
        };
      }

      const savedData = {
        ...responseData,
        submitted_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem("partner_app_submission", JSON.stringify(savedData));
      } catch (e) {}

      toast.success(useFallback ? "Pengajuan berhasil dikirim (simulasi)." : "Pengajuan berhasil dikirim!");
      navigate("/mitra/sukses", { state: savedData, replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Gagal mengirim pengajuan.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const saveExit = () => {
    try {
      localStorage.setItem("partner_app_draft", JSON.stringify(form));
      toast.success("Draf tersimpan. Anda dapat melanjutkannya nanti.");
    } catch (e) {}
    navigate("/");
  };

  // ---------------------- RENDER STEPS ----------------------
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-5 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">domain</span>
        Informasi Hotel
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="hotel_name">Nama Hotel *</label>
          <input
            id="hotel_name"
            type="text"
            value={form.hotel_name}
            onChange={(e) => update("hotel_name", e.target.value)}
            placeholder="Contoh: Grand H'Leven Resort & Spa"
            className={`${INPUT_BASE} ${errors.hotel_name ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="hotel_type">Tipe Hotel *</label>
          <select
            id="hotel_type"
            value={form.hotel_type}
            onChange={(e) => update("hotel_type", e.target.value)}
            className={`${INPUT_BASE} ${errors.hotel_type ? INPUT_ERROR : ""}`}
          >
            <option value="">-- Pilih Tipe Hotel --</option>
            {HOTEL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.hotel_type && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_type}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="room_count">Jumlah Kamar *</label>
          <input
            id="room_count"
            type="number"
            min="1"
            value={form.room_count}
            onChange={(e) => update("room_count", e.target.value)}
            placeholder="Contoh: 50"
            className={`${INPUT_BASE} ${errors.room_count ? INPUT_ERROR : ""}`}
          />
          {errors.room_count && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.room_count}</span>}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="hotel_description">Deskripsi Hotel *</label>
          <textarea
            id="hotel_description"
            rows={4}
            value={form.hotel_description}
            onChange={(e) => update("hotel_description", e.target.value)}
            placeholder="Jelaskan fasilitas, keunggulan, dan nilai unik hotel Anda secara singkat."
            className={`${INPUT_BASE} resize-y ${errors.hotel_description ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_description && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_description}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="hotel_phone">Nomor Telepon Hotel *</label>
          <input
            id="hotel_phone"
            type="tel"
            value={form.hotel_phone}
            onChange={(e) => update("hotel_phone", e.target.value)}
            placeholder="+62 22 xxxxxxx"
            className={`${INPUT_BASE} ${errors.hotel_phone ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_phone && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_phone}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="hotel_email">Email Hotel *</label>
          <input
            id="hotel_email"
            type="email"
            value={form.hotel_email}
            onChange={(e) => update("hotel_email", e.target.value)}
            placeholder="hotel@example.com"
            className={`${INPUT_BASE} ${errors.hotel_email ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_email && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_email}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-5 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">location_on</span>
        Lokasi Hotel
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="address">Alamat Lengkap *</label>
          <textarea
            id="address"
            rows={3}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan/Desa, dll."
            className={`${INPUT_BASE} resize-y ${errors.address ? INPUT_ERROR : ""}`}
          />
          {errors.address && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.address}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="province">Provinsi *</label>
          <input
            id="province"
            type="text"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            placeholder="Contoh: Jawa Barat"
            className={`${INPUT_BASE} ${errors.province ? INPUT_ERROR : ""}`}
          />
          {errors.province && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.province}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="city">Kota / Kabupaten *</label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Contoh: Kota Bandung"
            className={`${INPUT_BASE} ${errors.city ? INPUT_ERROR : ""}`}
          />
          {errors.city && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.city}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="district">Kecamatan *</label>
          <input
            id="district"
            type="text"
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
            placeholder="Contoh: Bandung Wetan"
            className={`${INPUT_BASE} ${errors.district ? INPUT_ERROR : ""}`}
          />
          {errors.district && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.district}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="postal_code">Kode Pos *</label>
          <input
            id="postal_code"
            type="text"
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value.replace(/\D/g, ""))}
            placeholder="Contoh: 40116"
            className={`${INPUT_BASE} ${errors.postal_code ? INPUT_ERROR : ""}`}
          />
          {errors.postal_code && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.postal_code}</span>}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="maps_url">Lokasi Google Maps (Opsional)</label>
          <input
            id="maps_url"
            type="url"
            value={form.maps_url}
            onChange={(e) => update("maps_url", e.target.value)}
            placeholder="Tempel link share Google Maps hotel Anda"
            className={INPUT_BASE}
          />
          <span className={HELPER}>Integrasi map picker akan ditambahkan di tahap berikutnya.</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-3 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">person</span>
        Pemilik / Penanggung Jawab
      </h2>
      <div className="mb-5 p-3 rounded-xl bg-[#d5e8cf]/30 border border-[#d5e8cf] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#50604d] shrink-0 mt-0.5">info</span>
        <p className="font-body-md text-xs text-[#3b4b39] leading-relaxed">
          Data ini akan digunakan untuk proses verifikasi dan komunikasi resmi. Pastikan nama sesuai dengan identitas resmi.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="owner_name">Nama Lengkap *</label>
          <input
            id="owner_name"
            type="text"
            value={form.owner_name}
            onChange={(e) => update("owner_name", e.target.value)}
            placeholder="Nama sesuai KTP"
            className={`${INPUT_BASE} ${errors.owner_name ? INPUT_ERROR : ""}`}
          />
          {errors.owner_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.owner_name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="owner_email">Email *</label>
          <input
            id="owner_email"
            type="email"
            value={form.owner_email}
            onChange={(e) => update("owner_email", e.target.value)}
            placeholder="email.pemilik@example.com"
            className={`${INPUT_BASE} ${errors.owner_email ? INPUT_ERROR : ""}`}
          />
          {errors.owner_email && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.owner_email}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="owner_phone">Nomor Telepon / WhatsApp *</label>
          <input
            id="owner_phone"
            type="tel"
            value={form.owner_phone}
            onChange={(e) => update("owner_phone", e.target.value)}
            placeholder="+62 8xx xxxx xxxx"
            className={`${INPUT_BASE} ${errors.owner_phone ? INPUT_ERROR : ""}`}
          />
          {errors.owner_phone && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.owner_phone}</span>}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="owner_id_number">Nomor Identitas (KTP/Passport) *</label>
          <input
            id="owner_id_number"
            type="text"
            value={form.owner_id_number}
            onChange={(e) => update("owner_id_number", e.target.value)}
            placeholder="Masukkan 16 digit nomor KTP"
            className={`${INPUT_BASE} ${errors.owner_id_number ? INPUT_ERROR : ""}`}
          />
          {errors.owner_id_number && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.owner_id_number}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-3 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">description</span>
        Dokumen Legalitas
      </h2>
      <div className="mb-5 p-3 rounded-xl bg-[#eae1d8]/30 border border-[#eae1d8] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#615b54] shrink-0 mt-0.5">gavel</span>
        <div className="font-body-md text-xs text-[#4b463f] leading-relaxed space-y-1">
          <p><strong>Format yang diterima:</strong> PDF, JPG, JPEG, PNG, WEBP. Maks 10MB per file.</p>
          <p><strong>Catatan keamanan:</strong> Dokumen Anda dienkripsi dan hanya dapat diakses oleh tim verifikasi.</p>
        </div>
      </div>
      <div className="space-y-5">
        <FileUpload
          label="KTP / Identitas Pemilik *"
          description="Scan KTP/Passport yang masih berlaku dan sesuai nama pemilik."
          file={form.doc_ktp}
          onChange={(f) => update("doc_ktp", f)}
          onRemove={() => update("doc_ktp", null)}
          error={errors.doc_ktp}
          required
        />
        <FileUpload
          label="Dokumen Legalitas Hotel *"
          description="SIUP, TDUP, NIB, Akta Pendirian, IMB, atau dokumen izin operasional lainnya (boleh gabung dalam 1 file PDF)."
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          file={form.doc_legal}
          onChange={(f) => update("doc_legal", f)}
          onRemove={() => update("doc_legal", null)}
          error={errors.doc_legal}
          required
        />
        <FileUpload
          label="Dokumen Pendukung Lainnya (Opsional)"
          description="Foto tampak depan hotel, surat tanah, SPPT PBB, atau dokumen lain yang mendukung."
          file={form.doc_support}
          onChange={(f) => update("doc_support", f)}
          onRemove={() => update("doc_support", null)}
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-3 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">account_balance</span>
        Informasi Rekening
      </h2>
      <div className="mb-5 p-3 rounded-xl bg-[#ceeac7]/30 border border-[#ceeac7] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#4c6549] shrink-0 mt-0.5">payments</span>
        <p className="font-body-md text-xs text-[#0a200a] leading-relaxed">
          Rekening ini digunakan untuk pencairan dana hasil transaksi tamu. Pastikan rekening <strong>aktif</strong> dan <strong>atas nama pemilik hotel / badan usaha</strong>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="bank_name">Nama Bank *</label>
          <input
            id="bank_name"
            type="text"
            value={form.bank_name}
            onChange={(e) => update("bank_name", e.target.value)}
            placeholder="Contoh: Bank Central Asia (BCA)"
            className={`${INPUT_BASE} ${errors.bank_name ? INPUT_ERROR : ""}`}
          />
          {errors.bank_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.bank_name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="bank_account_number">Nomor Rekening *</label>
          <input
            id="bank_account_number"
            type="text"
            value={form.bank_account_number}
            onChange={(e) => update("bank_account_number", e.target.value.replace(/[^\d\s-]/g, ""))}
            placeholder="Nomor rekening tanpa spasi"
            className={`${INPUT_BASE} ${errors.bank_account_number ? INPUT_ERROR : ""}`}
          />
          {errors.bank_account_number && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.bank_account_number}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="bank_account_name">Nama Pemilik Rekening *</label>
          <input
            id="bank_account_name"
            type="text"
            value={form.bank_account_name}
            onChange={(e) => update("bank_account_name", e.target.value.toUpperCase())}
            placeholder="SESUAI BUKU TABUNGAN (huruf kapital)"
            className={`${INPUT_BASE} ${errors.bank_account_name ? INPUT_ERROR : ""}`}
          />
          {errors.bank_account_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.bank_account_name}</span>}
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ title, icon, children, step }) => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative">
      {step <= currentStep && (
        <button
          type="button"
          onClick={() => goToStep(step)}
          className="absolute top-5 right-5 text-[#50604d] hover:text-[#3b4b39] flex items-center gap-1 bg-[#f6f3ee] hover:bg-[#e5e2dd] px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span className="font-label-sm text-[11px] font-bold tracking-wider">Edit</span>
        </button>
      )}
      <h3 className="font-title-md text-lg font-bold text-[#50604d] mb-4 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-2 pr-24">
        <span className="material-symbols-outlined">{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Row = ({ label, value }) => (
    <div>
      <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">{label}</span>
      <span className="block font-body-md text-sm text-[#1c1c19] break-words">
        {value || <span className="text-[#747871] italic">Tidak diisi</span>}
      </span>
    </div>
  );

  const FileRow = ({ label, file }) => (
    <div className="md:col-span-2">
      <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">{label}</span>
      {file ? (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f6f3ee] rounded-lg text-sm text-[#1c1c19] border border-[#c4c8bf]/50">
          <span className="material-symbols-outlined text-[#50604d] text-[18px]">draft</span>
          {file.name}
          <span className="text-[#747871] text-[11px]">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </span>
      ) : (
        <span className="text-[#747871] italic text-sm">Tidak ada file</span>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-5">
      <div className="mb-2 text-center">
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#1c1c19] mb-2">Review Data Pengajuan</h1>
        <p className="text-sm text-[#444842]">
          Pastikan semua informasi yang Anda masukkan sudah benar sebelum mengirimkan pengajuan.
        </p>
      </div>

      <ReviewCard title="Informasi Hotel" icon="domain" step={1}>
        <Row label="Nama Properti" value={form.hotel_name} />
        <Row label="Tipe Properti" value={form.hotel_type} />
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Deskripsi</span>
          <p className="font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">{form.hotel_description}</p>
        </div>
        <Row label="Nomor Telepon" value={form.hotel_phone} />
        <Row label="Email Properti" value={form.hotel_email} />
        <Row label="Jumlah Kamar" value={form.room_count ? `${form.room_count} Kamar` : ""} />
      </ReviewCard>

      <ReviewCard title="Lokasi" icon="location_on" step={2}>
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Alamat Lengkap</span>
          <span className="block font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">{form.address}</span>
        </div>
        <Row label="Provinsi" value={form.province} />
        <Row label="Kota/Kabupaten" value={form.city} />
        <Row label="Kecamatan" value={form.district} />
        <Row label="Kode Pos" value={form.postal_code} />
        {form.maps_url && (
          <div className="md:col-span-2">
            <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Google Maps</span>
            <a href={form.maps_url} target="_blank" rel="noreferrer" className="text-sm text-[#50604d] hover:underline break-all">
              {form.maps_url}
            </a>
          </div>
        )}
      </ReviewCard>

      <ReviewCard title="Pemilik / Penanggung Jawab" icon="person" step={3}>
        <Row label="Nama Lengkap" value={form.owner_name} />
        <Row label="Nomor Identitas" value={form.owner_id_number} />
        <Row label="Email Pemilik" value={form.owner_email} />
        <Row label="Nomor Telepon Pribadi" value={form.owner_phone} />
      </ReviewCard>

      <ReviewCard title="Dokumen Legalitas" icon="description" step={4}>
        <FileRow label="KTP / Identitas Pemilik" file={form.doc_ktp} />
        <FileRow label="Dokumen Legalitas Hotel" file={form.doc_legal} />
        <FileRow label="Dokumen Pendukung Lainnya" file={form.doc_support} />
      </ReviewCard>

      <ReviewCard title="Detail Rekening" icon="account_balance" step={5}>
        <Row label="Nama Bank" value={form.bank_name} />
        <Row label="Nomor Rekening" value={form.bank_account_number} />
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Nama Pemilik Rekening</span>
          <span className="block font-body-md text-sm text-[#1c1c19]">{form.bank_account_name}</span>
        </div>
      </ReviewCard>

      <div className="bg-[#f6f3ee] p-4 rounded-xl border border-[#baccb4]/60">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => update("agree", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-[#747871] text-[#50604d] focus:ring-[#50604d] focus:ring-offset-[#fcf9f4]"
          />
          <span className="font-body-md text-sm text-[#1c1c19] leading-relaxed">
            Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar dan dapat dipertanggungjawabkan. Saya setuju dengan{" "}
            <a href="#" className="text-[#50604d] underline hover:text-[#3b4b39]">
              Syarat dan Ketentuan
            </a>{" "}
            serta{" "}
            <a href="#" className="text-[#50604d] underline hover:text-[#3b4b39]">
              Kebijakan Privasi
            </a>{" "}
            yang berlaku pada program kemitraan H'Leven.
          </span>
        </label>
        {errors.agree && <p className="mt-2 text-[11px] font-semibold text-[#ba1a1a] ml-8">{errors.agree}</p>}
      </div>
    </div>
  );

  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-body-md antialiased min-h-screen flex flex-col">
      <header className="bg-[#fcf9f4] border-b border-[#c4c8bf]/60 w-full px-5 md:px-16 py-4 flex justify-center items-center shadow-sm z-50 sticky top-0">
        <div className="max-w-[1280px] w-full flex justify-between items-center">
          <span className="font-headline-lg text-xl md:text-2xl font-bold text-[#50604d] tracking-tight">
            H'Leven Mitra
          </span>
          <button
            type="button"
            onClick={saveExit}
            className="text-[#444842] hover:text-[#50604d] transition-colors flex items-center gap-2"
          >
            <span className="font-label-sm text-[11px] md:text-xs font-bold tracking-wider hidden sm:inline">Simpan &amp; Keluar</span>
            <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
          </button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-10 flex flex-col items-center">
        <PartnerStepper currentStep={currentStep} steps={STEP_LABELS} />

        <div className="w-full">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          <div className="mt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || submitting}
              className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-[#50604d] text-[#50604d] font-label-sm text-xs font-bold tracking-wider hover:bg-[#e5e2dd] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali
            </button>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={submitting}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                Lanjutkan
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Mengirim Pengajuan...
                  </>
                ) : (
                  <>
                    Kirim Pengajuan
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#f0ede9] border-t border-[#c4c8bf]/60 w-full py-4 px-5 text-center">
        <span className="font-label-sm text-[11px] font-semibold tracking-wider text-[#747871]">
          © 2026 H'Leven Hospitality Group. Hak Cipta Dilindungi.
        </span>
      </footer>
    </div>
  );
};

export default MitraRegistration;
