import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import PartnerStepper from "../../components/mitra/PartnerStepper";
import FileUpload from "../../components/mitra/FileUpload";
import api from "../../services/api";

const STEP_LABELS = [
  "Hotel Details",
  "Location",
  "Owner",
  "Documents",
  "Bank Account",
  "Review",
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
  property_type: "",
  year_built: "",
  hotel_description: "",
  hotel_phone: "",
  hotel_email: "",
  requested_star_rating: "",
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
  const [emailAvailable, setEmailAvailable] = useState(null); // null | true | false
  const [emailChecking, setEmailChecking] = useState(false);

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
    if (field === "hotel_email") {
      setEmailAvailable(null);
    }
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Debounced email uniqueness check
  useEffect(() => {
    const email = form.hotel_email;
    if (!email || !isValidEmail(email)) {
      setEmailAvailable(null);
      return;
    }
    setEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/check-email", { params: { email } });
        const available = res.data?.available ?? true;
        setEmailAvailable(available);
        if (!available) {
          setErrors((prev) => ({ ...prev, hotel_email: "This email is already in use. Please use another email." }));
        }
      } catch (err) {
        // Jika gagal, biarkan tetap bisa submit (fail-open)
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.hotel_email]);

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!form.hotel_name.trim()) e.hotel_name = "Hotel name is required";
      if (!form.hotel_description.trim()) e.hotel_description = "Hotel description is required";
      if (!form.hotel_phone.trim()) e.hotel_phone = "Hotel phone number is required";
      else if (!isValidPhone(form.hotel_phone)) e.hotel_phone = "Invalid phone number format";
      if (!form.hotel_email.trim()) e.hotel_email = "Hotel email is required";
      else if (!isValidEmail(form.hotel_email)) e.hotel_email = "Invalid email format";
      else if (emailAvailable === false) e.hotel_email = "This email is already registered. Please use another email.";
    }
    if (step === 2) {
      if (!form.address.trim()) e.address = "Full address is required";
      if (!form.province.trim()) e.province = "Province is required";
      if (!form.city.trim()) e.city = "City/Regency is required";
      if (!form.district.trim()) e.district = "District is required";
      if (!form.postal_code.trim()) e.postal_code = "Postal code is required";
      else if (!isValidPostal(form.postal_code)) e.postal_code = "Postal code must be 4-10 digits";
    }
    if (step === 3) {
      if (!form.owner_name.trim()) e.owner_name = "Full name is required";
      if (!form.owner_email.trim()) e.owner_email = "Email is required";
      else if (!isValidEmail(form.owner_email)) e.owner_email = "Invalid email format";
      if (!form.owner_phone.trim()) e.owner_phone = "Phone number is required";
      else if (!isValidPhone(form.owner_phone)) e.owner_phone = "Invalid phone number format";
      if (!form.owner_id_number.trim()) e.owner_id_number = "ID number is required";
      else if (form.owner_id_number.trim().length < 10) e.owner_id_number = "ID number is too short";
    }
    if (step === 4) {
      if (!form.doc_ktp) e.doc_ktp = "Upload KTP/Owner ID";
      if (!form.doc_legal) e.doc_legal = "Upload hotel legal documents";
    }
    if (step === 5) {
      if (!form.bank_name.trim()) e.bank_name = "Bank name is required";
      if (!form.bank_account_number.trim()) e.bank_account_number = "Account number is required";
      else if (!/^[\d\s-]{6,30}$/.test(form.bank_account_number)) e.bank_account_number = "Invalid account number format";
      if (!form.bank_account_name.trim()) e.bank_account_name = "Account holder name is required";
    }
    if (step === 6) {
      if (!form.agree) e.agree = "You must agree to these terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete the required information.");
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
      toast.error("Please agree to the statement.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "agree") return;
        if (k === "requested_star_rating" && (v === "" || v == null)) return;
        if (k.startsWith("doc_") && v instanceof File) {
          payload.append(k, v);
        } else if (v !== null && v !== undefined) {
          payload.append(k, String(v));
        }
      });

      const res = await api.post("/partner-applications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const responseData = res.data?.data || res.data;

      const savedData = {
        ...responseData,
        submitted_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem("partner_app_submission", JSON.stringify(savedData));
      } catch (e) {}

      toast.success("Application successfully submitted!");
      navigate("/mitra/sukses", { state: savedData, replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit application.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const saveExit = () => {
    try {
      localStorage.setItem("partner_app_draft", JSON.stringify(form));
      toast.success("Draft saved. You can continue it later.");
    } catch (e) {}
    navigate("/");
  };

  // ---------------------- RENDER STEPS ----------------------
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-5 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">domain</span>
        Hotel Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="hotel_name">Hotel Name *</label>
          <input
            id="hotel_name"
            type="text"
            value={form.hotel_name}
            onChange={(e) => update("hotel_name", e.target.value)}
            placeholder="e.g., Grand H'Leven Resort & Spa"
            className={`${INPUT_BASE} ${errors.hotel_name ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="property_type">Property Type</label>
          <input
            id="property_type"
            type="text"
            maxLength={100}
            value={form.property_type}
            onChange={(e) => update("property_type", e.target.value)}
            placeholder="e.g., Business Hotel, Resort, Boutique Hotel"
            className={INPUT_BASE}
          />
          <span className={HELPER}>Optional. Enter your hotel property type.</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="year_built">Year Built</label>
          <input
            id="year_built"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={form.year_built}
            onChange={(e) => update("year_built", e.target.value)}
            placeholder="e.g., 2018"
            className={INPUT_BASE}
          />
          <span className={HELPER}>Optional. Leave empty if unknown.</span>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="hotel_description">Hotel Description *</label>
          <textarea
            id="hotel_description"
            rows={4}
            value={form.hotel_description}
            onChange={(e) => update("hotel_description", e.target.value)}
            placeholder="Briefly describe your hotel's facilities, highlights, and unique value."
            className={`${INPUT_BASE} resize-y ${errors.hotel_description ? INPUT_ERROR : ""}`}
          />
          {errors.hotel_description && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_description}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="requested_star_rating">Star Rating (Claim)</label>
          <select id="requested_star_rating" value={form.requested_star_rating} onChange={(e) => update("requested_star_rating", e.target.value)} className={INPUT_BASE}>
            <option value="">-- Uncertified / Select --</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
          </select>
          <span className={HELPER}>To be verified by Super Admin. Empty = unclassified.</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="hotel_phone">Hotel Phone Number *</label>
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
          <label className={LABEL} htmlFor="hotel_email">Hotel Email *</label>
          <input
            id="hotel_email"
            type="email"
            value={form.hotel_email}
            onChange={(e) => update("hotel_email", e.target.value)}
            placeholder="hotel@example.com"
            className={`${INPUT_BASE} ${errors.hotel_email ? INPUT_ERROR : ""}`}
          />
          <span className={HELPER}>This email will be used as the hotel admin account.</span>
          {errors.hotel_email && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.hotel_email}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-5 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">location_on</span>
        Hotel Location
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="address">Full Address *</label>
          <textarea
            id="address"
            rows={3}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street name, house number, neighborhood, village/ward, etc."
            className={`${INPUT_BASE} resize-y ${errors.address ? INPUT_ERROR : ""}`}
          />
          {errors.address && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.address}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="province">Province *</label>
          <input
            id="province"
            type="text"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            placeholder="e.g., West Java"
            className={`${INPUT_BASE} ${errors.province ? INPUT_ERROR : ""}`}
          />
          {errors.province && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.province}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="city">City / Regency *</label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="e.g., Bandung City"
            className={`${INPUT_BASE} ${errors.city ? INPUT_ERROR : ""}`}
          />
          {errors.city && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.city}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="district">District *</label>
          <input
            id="district"
            type="text"
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
            placeholder="e.g., Bandung Wetan"
            className={`${INPUT_BASE} ${errors.district ? INPUT_ERROR : ""}`}
          />
          {errors.district && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.district}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="postal_code">Postal Code *</label>
          <input
            id="postal_code"
            type="text"
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g., 40116"
            className={`${INPUT_BASE} ${errors.postal_code ? INPUT_ERROR : ""}`}
          />
          {errors.postal_code && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.postal_code}</span>}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="maps_url">Google Maps Location (Optional)</label>
          <input
            id="maps_url"
            type="url"
            value={form.maps_url}
            onChange={(e) => update("maps_url", e.target.value)}
            placeholder="Paste your hotel's Google Maps share link"
            className={INPUT_BASE}
          />
          <span className={HELPER}>Map picker integration will be added in the next phase.</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-2xl border border-[#c4c8bf]/60 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h2 className="font-title-md text-xl font-bold text-[#50604d] mb-3 flex items-center gap-2 border-b border-[#DCCFC0]/50 pb-3">
        <span className="material-symbols-outlined">person</span>
        Owner / Responsible Person
      </h2>
        <div className="mb-5 p-3 rounded-xl bg-[#d5e8cf]/30 border border-[#d5e8cf] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#50604d] shrink-0 mt-0.5">info</span>
        <p className="font-body-md text-xs text-[#3b4b39] leading-relaxed">
          This data will be used for verification and official communication. Ensure the name matches the official ID.
        </p>
      </div>
      {form.owner_email && form.hotel_email && form.owner_email === form.hotel_email && (
        <div className="mb-5 p-3 rounded-xl bg-[#e8e2d9]/60 border border-[#DCCFC0] flex items-start gap-3">
          <span className="material-symbols-outlined text-[#778873] shrink-0 mt-0.5">key</span>
          <p className="font-body-md text-xs text-[#444842] leading-relaxed">
            <strong>This email will be set as the hotel admin account</strong> for logging in. You can change the password after logging in via the Profile page.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="owner_name">Full Name *</label>
          <input
            id="owner_name"
            type="text"
            value={form.owner_name}
            onChange={(e) => update("owner_name", e.target.value)}
            placeholder="Name as per ID"
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
            placeholder="owner.email@example.com"
            className={`${INPUT_BASE} ${errors.owner_email ? INPUT_ERROR : ""}`}
          />
          {errors.owner_email && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.owner_email}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="owner_phone">Phone Number / WhatsApp *</label>
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
          <label className={LABEL} htmlFor="owner_id_number">ID Number (KTP/Passport) *</label>
          <input
            id="owner_id_number"
            type="text"
            value={form.owner_id_number}
            onChange={(e) => update("owner_id_number", e.target.value)}
            placeholder="Enter your 16-digit ID number"
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
        Legal Documents
      </h2>
      <div className="mb-5 p-3 rounded-xl bg-[#eae1d8]/30 border border-[#eae1d8] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#615b54] shrink-0 mt-0.5">gavel</span>
        <div className="font-body-md text-xs text-[#4b463f] leading-relaxed space-y-1">
          <p><strong>Accepted formats:</strong> PDF, JPG, JPEG, PNG, WEBP. Max 10MB per file.</p>
          <p><strong>Security note:</strong> Your documents are encrypted and accessible only by the verification team.</p>
        </div>
      </div>
      <div className="space-y-5">
        <FileUpload
          label="Owner KTP / ID *"
          description="Scan of valid KTP/Passport matching the owner's name."
          file={form.doc_ktp}
          onChange={(f) => update("doc_ktp", f)}
          onRemove={() => update("doc_ktp", null)}
          error={errors.doc_ktp}
          required
        />
        <FileUpload
          label="Hotel Legal Documents *"
          description="SIUP, TDUP, NIB, Deed of Establishment, IMB, or other operational licenses (can be combined into one PDF file)."
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          file={form.doc_legal}
          onChange={(f) => update("doc_legal", f)}
          onRemove={() => update("doc_legal", null)}
          error={errors.doc_legal}
          required
        />
        <FileUpload
          label="Other Supporting Documents (Optional)"
          description="Front view photo of the hotel, land deed, SPPT PBB, or other supporting documents."
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
        Bank Account Information
      </h2>
      <div className="mb-5 p-3 rounded-xl bg-[#ceeac7]/30 border border-[#ceeac7] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#4c6549] shrink-0 mt-0.5">payments</span>
        <p className="font-body-md text-xs text-[#0a200a] leading-relaxed">
          This account is used for guest transaction fund disbursements. Ensure the account is <strong>active</strong> and <strong>under the hotel owner's/business entity's name</strong>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={LABEL} htmlFor="bank_name">Bank Name *</label>
          <input
            id="bank_name"
            type="text"
            value={form.bank_name}
            onChange={(e) => update("bank_name", e.target.value)}
            placeholder="e.g., Bank Central Asia (BCA)"
            className={`${INPUT_BASE} ${errors.bank_name ? INPUT_ERROR : ""}`}
          />
          {errors.bank_name && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.bank_name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="bank_account_number">Account Number *</label>
          <input
            id="bank_account_number"
            type="text"
            value={form.bank_account_number}
            onChange={(e) => update("bank_account_number", e.target.value.replace(/[^\d\s-]/g, ""))}
            placeholder="Account number without spaces"
            className={`${INPUT_BASE} ${errors.bank_account_number ? INPUT_ERROR : ""}`}
          />
          {errors.bank_account_number && <span className="text-[11px] font-semibold text-[#ba1a1a]">{errors.bank_account_number}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={LABEL} htmlFor="bank_account_name">Account Holder Name *</label>
          <input
            id="bank_account_name"
            type="text"
            value={form.bank_account_name}
            onChange={(e) => update("bank_account_name", e.target.value.toUpperCase())}
            placeholder="AS PER BANK ACCOUNT (capital letters)"
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
        {value || <span className="text-[#747871] italic">Not provided</span>}
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
        <span className="text-[#747871] italic text-sm">No file</span>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-5">
      <div className="mb-2 text-center">
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#1c1c19] mb-2">Review Submission Data</h1>
        <p className="text-sm text-[#444842]">
          Ensure all information you entered is correct before submitting your application.
        </p>
      </div>

      <ReviewCard title="Hotel Details" icon="domain" step={1}>
        <Row label="Property Name" value={form.hotel_name} />
        <Row label="Property Type" value={form.property_type} />
        <Row label="Year Built" value={form.year_built} />
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Description</span>
          <p className="font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">{form.hotel_description}</p>
        </div>
        <Row label="Phone Number" value={form.hotel_phone} />
        <Row label="Property Email" value={form.hotel_email} />
        <Row label="Star Rating (Claim)" value={form.requested_star_rating ? `${form.requested_star_rating} Star` : "Uncertified"} />
      </ReviewCard>

      <ReviewCard title="Hotel Location" icon="location_on" step={2}>
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Full Address</span>
          <span className="block font-body-md text-sm text-[#1c1c19] whitespace-pre-wrap leading-relaxed">{form.address}</span>
        </div>
        <Row label="Province" value={form.province} />
        <Row label="City/Regency" value={form.city} />
        <Row label="District" value={form.district} />
        <Row label="Postal Code" value={form.postal_code} />
        {form.maps_url && (
          <div className="md:col-span-2">
            <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Google Maps</span>
            <a href={form.maps_url} target="_blank" rel="noreferrer" className="text-sm text-[#50604d] hover:underline break-all">
              {form.maps_url}
            </a>
          </div>
        )}
      </ReviewCard>

      <ReviewCard title="Owner / Responsible Person" icon="person" step={3}>
        <Row label="Full Name" value={form.owner_name} />
        <Row label="ID Number" value={form.owner_id_number} />
        <Row label="Owner Email" value={form.owner_email} />
        <Row label="Personal Phone" value={form.owner_phone} />
      </ReviewCard>

      <ReviewCard title="Legal Documents" icon="description" step={4}>
        <FileRow label="Owner KTP / ID" file={form.doc_ktp} />
        <FileRow label="Hotel Legal Documents" file={form.doc_legal} />
        <FileRow label="Other Supporting Documents" file={form.doc_support} />
      </ReviewCard>

      <ReviewCard title="Bank Account Details" icon="account_balance" step={5}>
        <Row label="Bank Name" value={form.bank_name} />
        <Row label="Account Number" value={form.bank_account_number} />
        <div className="md:col-span-2">
          <span className="block font-label-sm text-[11px] font-semibold tracking-wider uppercase text-[#747871] mb-0.5">Account Holder Name</span>
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
            I declare that all information provided is true and accountable. I agree to the{" "}
            <a href="#" className="text-[#50604d] underline hover:text-[#3b4b39]">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#50604d] underline hover:text-[#3b4b39]">
              Privacy Policy
            </a>{" "}
            applicable to the H'Leven partnership program.
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
              <span className="font-label-sm text-[11px] md:text-xs font-bold tracking-wider hidden sm:inline">Exit</span>
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
              Back
            </button>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={submitting}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#50604d] text-white font-label-sm text-xs font-bold tracking-wider hover:bg-[#3b4b39] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                Continue
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
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
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
          © 2026 H'Leven Hospitality Group. All Rights Reserved.
        </span>
      </footer>
    </div>
  );
};

export default MitraRegistration;
