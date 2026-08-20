import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

// ─── Initial Fallback Data ───────────────────────────────────────────────────
const INITIAL_PROFILE = {
  name: "Admin Hotel",
  email: "admin@example.com",
  phone: "+62 812 3456 7890",
  role: "Hotel Administrator",
  avatar: null,

  hotel: {
    name: "Grand H'Leven Hotel",
    email: "info@grandhleven.com",
    phone: "+62 22 1234567",
    address: "Jl. Example No. 123",
    city: "Bandung",
    province: "West Java",
    postalCode: "40123",
    description: "Comfortable accommodation with modern facilities.",
    logo: null,
  },

  preferences: {
    bookingNotifications: true,
    reviewNotifications: true,
    revenueNotifications: false,
    systemNotifications: true,
    language: "English",
    timezone: "Asia/Jakarta",
  },
};

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return {
        ...INITIAL_PROFILE,
        name: u.name || "Admin Hotel",
        email: u.email || "admin@example.com",
        phone: u.phone || "",
        role:
          u.role === "admin_hotel"
            ? "Hotel Administrator"
            : u.role || "Hotel Administrator",
        avatar: u.avatar || null,
      };
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PROFILE;
};

// ─── Password Strength Evaluator ──────────────────────────────────────────────
const evaluatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Weak", color: "bg-gray-200", text: "text-gray-400" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500", text: "text-red-600" };
  if (score <= 4) return { score, label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
  return { score, label: "Strong", color: "bg-[#506147]", text: "text-[#506147]" };
};

export default function Profile() {
  // ─── Local State ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(getInitialUser);

  // Account Edit State
  const [editAccount, setEditAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [savingAccount, setSavingAccount] = useState(false);

  // Hotel Edit State
  const [editHotel, setEditHotel] = useState(false);
  const [hotelForm, setHotelForm] = useState({ ...profile.hotel });
  const [hotelErrors, setHotelErrors] = useState({});
  const [savingHotel, setSavingHotel] = useState(false);

  // Preferences State
  const [preferencesForm, setPreferencesForm] = useState({ ...profile.preferences });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Hidden File Input Refs
  const avatarInputRef = useRef(null);
  const hotelLogoInputRef = useRef(null);

  // Fetch real profile from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, hotelRes] = await Promise.allSettled([
          api.get("/profile"),
          api.get("/admin/hotel/profile"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data) {
          const u = profileRes.value.data.data || profileRes.value.data.user || profileRes.value.data;
          if (u) {
            setProfile((prev) => ({
              ...prev,
              name: u.name || prev.name,
              email: u.email || prev.email,
              phone: u.phone || prev.phone,
              avatar: u.avatar_url || (u.avatar ? `http://localhost:8000/storage/${u.avatar}` : prev.avatar),
            }));
          }
        }

        if (hotelRes.status === "fulfilled" && hotelRes.value.data) {
          const h = hotelRes.value.data.data || hotelRes.value.data;
          if (h) {
            setProfile((prev) => ({
              ...prev,
              hotel: {
                ...prev.hotel,
                name: h.name || prev.hotel.name,
                description: h.description || prev.hotel.description,
                address: h.address || prev.hotel.address,
                city: h.city?.name || h.city || prev.hotel.city,
                phone: h.phone || prev.hotel.phone,
              },
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfileData();
  }, []);

  // Keep form states in sync when profile updates
  useEffect(() => {
    setAccountForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setHotelForm({ ...profile.hotel });
    setPreferencesForm({ ...profile.preferences });
  }, [profile]);

  // ─── Image Handlers ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image size must be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("avatar", file);
        const nameParts = profile.name.trim().split(" ");
        formData.append("first_name", nameParts[0]);
        formData.append("last_name", nameParts.slice(1).join(" ") || "");
        formData.append("email", profile.email);
        await api.put("/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profile photo updated successfully.");
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengunggah foto profil ke server.");
      }
    }
  };

  const handleHotelLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo image size must be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHotelForm((prev) => ({ ...prev, logo: reader.result }));
        setProfile((prev) => ({
          ...prev,
          hotel: { ...prev.hotel, logo: reader.result },
        }));
        toast.success("Hotel logo updated successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveHotelLogo = () => {
    setHotelForm((prev) => ({ ...prev, logo: null }));
    setProfile((prev) => ({
      ...prev,
      hotel: { ...prev.hotel, logo: null },
    }));
    toast.success("Hotel logo removed.");
  };

  // ─── Account Information Actions ────────────────────────────────────────────
  const validateAccountForm = () => {
    const errs = {};
    if (!accountForm.name || accountForm.name.trim().length < 2) {
      errs.name = "Full name is required (minimum 2 characters).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!accountForm.email || !emailRegex.test(accountForm.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (accountForm.phone && accountForm.phone.trim() !== "") {
      const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
      if (!phoneRegex.test(accountForm.phone.trim()) || accountForm.phone.trim().length < 6) {
        errs.phone = "Please enter a valid phone number.";
      }
    }
    setAccountErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!validateAccountForm()) return;

    setSavingAccount(true);

    try {
      const nameParts = accountForm.name.trim().split(" ");
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(" ") || "";

      const res = await api.put("/user/profile", {
        first_name,
        last_name,
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
      });

      const updatedUser =
        res.data?.user || res.data?.data || {};

      try {
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const mergedUser = {
          ...localUser,
          name: updatedUser.name || accountForm.name.trim(),
          email: updatedUser.email || accountForm.email.trim(),
          phone: updatedUser.phone || accountForm.phone.trim(),
        };
        localStorage.setItem("user", JSON.stringify(mergedUser));
      } catch (err) {
        console.error(err);
      }

      setProfile((prev) => ({
        ...prev,
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
        phone: accountForm.phone.trim(),
      }));

      setEditAccount(false);
      toast.success("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal memperbarui profil.";
      toast.error(msg);
    } finally {
      setSavingAccount(false);
    }
  };

  const handleCancelAccount = () => {
    setAccountForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setAccountErrors({});
    setEditAccount(false);
  };

  // ─── Hotel Information Actions ───────────────────────────────────────────────
  const validateHotelForm = () => {
    const errs = {};
    if (!hotelForm.name || hotelForm.name.trim() === "") {
      errs.name = "Hotel name is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!hotelForm.email || !emailRegex.test(hotelForm.email.trim())) {
      errs.email = "Please enter a valid hotel email.";
    }
    if (!hotelForm.phone || hotelForm.phone.trim() === "") {
      errs.phone = "Hotel phone number is required.";
    }
    if (!hotelForm.address || hotelForm.address.trim() === "") {
      errs.address = "Hotel address is required.";
    }
    if (!hotelForm.city || hotelForm.city.trim() === "") {
      errs.city = "City is required.";
    }
    if (!hotelForm.province || hotelForm.province.trim() === "") {
      errs.province = "Province is required.";
    }
    if (!hotelForm.postalCode || hotelForm.postalCode.trim() === "") {
      errs.postalCode = "Postal code is required.";
    }
    if (hotelForm.description && hotelForm.description.length > 500) {
      errs.description = "Description cannot exceed 500 characters.";
    }
    setHotelErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    if (!validateHotelForm()) return;

    setSavingHotel(true);

    try {
      await api.post("/admin/hotel/profile", {
        name: hotelForm.name.trim(),
        description: hotelForm.description?.trim() || "",
        address: hotelForm.address.trim(),
        phone: hotelForm.phone.trim(),
      });

      setProfile((prev) => ({
        ...prev,
        hotel: { ...hotelForm },
      }));
      setEditHotel(false);
      toast.success("Hotel information updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui informasi hotel.");
    } finally {
      setSavingHotel(false);
    }
  };

  const handleCancelHotel = () => {
    setHotelForm({ ...profile.hotel });
    setHotelErrors({});
    setEditHotel(false);
  };

  // ─── Preferences Actions ────────────────────────────────────────────────────
  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavingPreferences(true);
    setTimeout(() => {
      setProfile((prev) => ({
        ...prev,
        preferences: { ...preferencesForm },
      }));
      setSavingPreferences(false);
      toast.success("Preferences updated successfully.");
    }, 500);
  };

  // ─── Change Password Actions ────────────────────────────────────────────────
  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = "Current password is required.";
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errs.newPassword = "New password must be at least 8 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setUpdatingPassword(true);

    try {
      await api.put("/user/change-password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      toast.success("Password updated successfully.");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Gagal mengubah kata sandi.";
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const pwdStrength = evaluatePasswordStrength(passwordForm.newPassword);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={hotelLogoInputRef}
        onChange={handleHotelLogoChange}
        accept="image/*"
        className="hidden"
      />

      {/* ══════════════════════════════════════════════════════════
          1. PAGE HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className="pb-6 border-b border-[#E5E1DA] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Profile
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Manage your account and hotel information.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. PROFILE HEADER CARD
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative overflow-hidden">
        {/* Profile Avatar */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#fcf9f5] overflow-hidden shadow-md bg-[#F2EBE1] flex items-center justify-center text-[#506147] font-bold text-3xl">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-['Newsreader',serif] text-4xl">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            title="Change Photo"
            className="absolute bottom-1 right-1 bg-[#506147] hover:bg-[#3b4b33] text-white p-2.5 rounded-full shadow-md transition-transform active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </div>

        {/* Profile Text Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="font-['Newsreader',serif] text-2xl sm:text-3xl font-semibold text-[#2D312C]">
              {profile.name}
            </h1>
            <span className="inline-flex items-center self-center md:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-[#E4EBE0] text-[#506147] border border-[#506147]/20">
              {profile.role}
            </span>
          </div>
          <p className="text-sm text-[#6B6E6A] mt-1">{profile.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-[#506147] font-medium mt-3">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{profile.hotel.name} &bull; {profile.hotel.city}</span>
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="flex flex-wrap sm:flex-col gap-3 w-full md:w-auto shrink-0 justify-center">
          <button
            onClick={() => {
              setEditAccount(true);
              document.getElementById("account-info-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-1 sm:flex-initial bg-[#506147] hover:bg-[#3b4b33] text-white text-xs font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex-1 sm:flex-initial border border-[#506147] text-[#506147] hover:bg-[#506147]/10 text-xs font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Change Password
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. ACCOUNT INFORMATION SECTION
      ══════════════════════════════════════════════════════════ */}
      <div id="account-info-section" className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E1DA]">
          <div>
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#506147]">manage_accounts</span>
              Account Information
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Manage your personal account information.
            </p>
          </div>
          {!editAccount && (
            <button
              onClick={() => setEditAccount(true)}
              className="text-xs font-semibold text-[#506147] hover:text-[#3b4b33] flex items-center gap-1.5 bg-[#f0ede9] hover:bg-[#e5e2de] px-3.5 py-2 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Profile
            </button>
          )}
        </div>

        {editAccount ? (
          <form onSubmit={handleSaveAccount} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    accountErrors.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="e.g. Name"
                />
                {accountErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {accountErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    accountErrors.email
                      ? "border-red-400 focus:ring-red-200"
                      : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="admin@example.com"
                />
                {accountErrors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {accountErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    accountErrors.phone
                      ? "border-red-400 focus:ring-red-200"
                      : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="+62 812 3456 7890"
                />
                {accountErrors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {accountErrors.phone}
                  </p>
                )}
              </div>

              {/* Role (Read Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  System Role (Read-only)
                </label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#eae8e4] border border-[#E5E1DA] text-[#6B6E6A] cursor-not-allowed font-medium"
                />
                <p className="text-[11px] text-[#6B6E6A] mt-1">Role assignment cannot be edited.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DA]">
              <button
                type="button"
                onClick={handleCancelAccount}
                disabled={savingAccount}
                className="px-5 py-2.5 text-xs font-semibold text-[#6B6E6A] bg-[#f0ede9] hover:bg-[#e5e2de] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAccount}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#506147] hover:bg-[#3b4b33] rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingAccount ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
              <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Full Name</span>
              <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.name}</span>
            </div>
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
              <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.email}</span>
            </div>
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
              <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Phone Number</span>
              <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.phone || "-"}</span>
            </div>
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
              <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">System Role</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d2e5cb] text-[#3a4b38] mt-1">
                {profile.role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          4. HOTEL INFORMATION SECTION
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E1DA]">
          <div>
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#506147]">business</span>
              Hotel Information
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Manage the information displayed for your hotel.
            </p>
          </div>
          {!editHotel && (
            <button
              onClick={() => setEditHotel(true)}
              className="text-xs font-semibold text-[#506147] hover:text-[#3b4b33] flex items-center gap-1.5 bg-[#f0ede9] hover:bg-[#e5e2de] px-3.5 py-2 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Hotel Information
            </button>
          )}
        </div>

        {/* Hotel Logo Manager */}
        <div className="bg-[#F2EBE1] p-5 rounded-xl border border-[#E5E1DA] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-xl border border-[#E5E1DA] bg-white overflow-hidden shadow-sm flex items-center justify-center text-[#506147] shrink-0">
              {hotelForm.logo || profile.hotel.logo ? (
                <img
                  src={hotelForm.logo || profile.hotel.logo}
                  alt="Hotel Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-[#c4c8be]">domain</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D312C]">Hotel Logo</h4>
              <p className="text-xs text-[#6B6E6A] mt-0.5">
                {hotelForm.logo || profile.hotel.logo ? "Current logo loaded." : "No custom logo uploaded yet."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => hotelLogoInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold bg-[#506147] hover:bg-[#3b4b33] text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              {hotelForm.logo || profile.hotel.logo ? "Change Logo" : "Upload Hotel Logo"}
            </button>
            {(hotelForm.logo || profile.hotel.logo) && (
              <button
                type="button"
                onClick={handleRemoveHotelLogo}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remove
              </button>
            )}
          </div>
        </div>

        {editHotel ? (
          <form onSubmit={handleSaveHotel} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Hotel Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.name}
                  onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.name ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="Grand Horizon Hotel"
                />
                {hotelErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.name}
                  </p>
                )}
              </div>

              {/* Hotel Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Hotel Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={hotelForm.email}
                  onChange={(e) => setHotelForm({ ...hotelForm, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.email ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="info@grandhorizonhotel.com"
                />
                {hotelErrors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.email}
                  </p>
                )}
              </div>

              {/* Hotel Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Hotel Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.phone}
                  onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.phone ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="+62 22 1234567"
                />
                {hotelErrors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Hotel Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.address}
                  onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.address ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="Jl. Example No. 123"
                />
                {hotelErrors.address && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.address}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.city}
                  onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.city ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="Bandung"
                />
                {hotelErrors.city && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.city}
                  </p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.province}
                  onChange={(e) => setHotelForm({ ...hotelForm, province: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.province ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="West Java"
                />
                {hotelErrors.province && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.province}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelForm.postalCode}
                  onChange={(e) => setHotelForm({ ...hotelForm, postalCode: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                    hotelErrors.postalCode ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                  }`}
                  placeholder="40123"
                />
                {hotelErrors.postalCode && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {hotelErrors.postalCode}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A]">
                  Hotel Description
                </label>
                <span
                  className={`text-xs font-medium ${
                    (hotelForm.description?.length || 0) > 500 ? "text-red-500 font-bold" : "text-[#6B6E6A]"
                  }`}
                >
                  {hotelForm.description?.length || 0} / 500
                </span>
              </div>
              <textarea
                rows={4}
                value={hotelForm.description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setHotelForm({ ...hotelForm, description: e.target.value });
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                  hotelErrors.description ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                }`}
                placeholder="Comfortable accommodation with modern facilities..."
              />
              {hotelErrors.description && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {hotelErrors.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DA]">
              <button
                type="button"
                onClick={handleCancelHotel}
                disabled={savingHotel}
                className="px-5 py-2.5 text-xs font-semibold text-[#6B6E6A] bg-[#f0ede9] hover:bg-[#e5e2de] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingHotel}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#506147] hover:bg-[#3b4b33] rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingHotel ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Hotel Name</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.name}</span>
              </div>
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Hotel Email</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.email}</span>
              </div>
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Hotel Phone</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.phone}</span>
              </div>
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Address</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.address}</span>
              </div>
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">City / Province</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.city}, {profile.hotel.province}</span>
              </div>
              <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Postal Code</span>
                <span className="text-sm font-semibold text-[#2D312C] mt-1 block">{profile.hotel.postalCode}</span>
              </div>
            </div>
            <div className="bg-[#fcf9f5] p-4 rounded-lg border border-[#E5E1DA]">
              <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider block">Description</span>
              <p className="text-sm text-[#2D312C] mt-1 leading-relaxed">{profile.hotel.description || "No description available."}</p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          5. SECURITY SECTION
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E5E1DA]">
          <div>
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#506147]">security</span>
              Security
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Manage your account security and password.
            </p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="border border-[#506147] text-[#506147] hover:bg-[#506147]/10 text-xs font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            Change Password
          </button>
        </div>

        <div className="bg-[#fcf9f5] p-5 rounded-xl border border-[#E5E1DA] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E4EBE0] text-[#506147] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2D312C]">Password & Security Status</h4>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Your account password was configured. Keep your password secure and do not share it with anyone.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          6. PREFERENCES SECTION
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8">
        <div className="pb-4 mb-6 border-b border-[#E5E1DA]">
          <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#506147]">settings</span>
            Preferences
          </h3>
          <p className="text-xs text-[#6B6E6A] mt-0.5">
            Configure system notifications, language, and regional preferences.
          </p>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Notification Preferences */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-3">
              Notification Preferences
            </h4>

            {/* Booking Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA]">
              <div>
                <p className="text-sm font-semibold text-[#2D312C]">Booking Notifications</p>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Receive notifications when a new booking is created.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.bookingNotifications}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, bookingNotifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c4c8be] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#506147]" />
              </label>
            </div>

            {/* Review Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA]">
              <div>
                <p className="text-sm font-semibold text-[#2D312C]">Review Notifications</p>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Receive notifications when guests submit a review.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.reviewNotifications}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, reviewNotifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c4c8be] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#506147]" />
              </label>
            </div>

            {/* Revenue Report Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA]">
              <div>
                <p className="text-sm font-semibold text-[#2D312C]">Revenue Report Notifications</p>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Receive notifications about periodic revenue reports.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.revenueNotifications}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, revenueNotifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c4c8be] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#506147]" />
              </label>
            </div>

            {/* System Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#fcf9f5] rounded-xl border border-[#E5E1DA]">
              <div>
                <p className="text-sm font-semibold text-[#2D312C]">System Notifications</p>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Receive important system notifications and security alerts.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferencesForm.systemNotifications}
                  onChange={(e) =>
                    setPreferencesForm({ ...preferencesForm, systemNotifications: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#c4c8be] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#506147]" />
              </label>
            </div>
          </div>

          {/* Regional & Language Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E5E1DA]">
            {/* Language Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                Language
              </label>
              <select
                value={preferencesForm.language}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border border-[#E5E1DA] text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20"
              >
                <option value="English">English</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              </select>
            </div>

            {/* Timezone Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-2">
                Timezone
              </label>
              <select
                value={preferencesForm.timezone}
                onChange={(e) => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border border-[#E5E1DA] text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E1DA]">
            <button
              type="submit"
              disabled={savingPreferences}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#506147] hover:bg-[#3b4b33] rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingPreferences ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════
          7. CHANGE PASSWORD MODAL
      ══════════════════════════════════════════════════════════ */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#506147]">lock</span>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Change Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordErrors({});
                }}
                className="text-[#6B6E6A] hover:text-[#2D312C] transition-colors p-1 rounded-full hover:bg-[#f0ede9]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                      passwordErrors.currentPassword ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6E6A] hover:text-[#2D312C]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPasswords.current ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                      passwordErrors.newPassword ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                    }`}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6E6A] hover:text-[#2D312C]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPasswords.new ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.newPassword}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <div className="mt-2.5 p-2.5 bg-[#fcf9f5] rounded-lg border border-[#E5E1DA] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B6E6A]">Password Strength:</span>
                      <span className={`font-bold ${pwdStrength.text}`}>{pwdStrength.label}</span>
                    </div>
                    <div className="w-full bg-[#E5E1DA] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${pwdStrength.color} transition-all duration-300`}
                        style={{ width: `${(pwdStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6E6A] mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm bg-[#fcf9f5] border transition-colors focus:outline-none focus:ring-2 ${
                      passwordErrors.confirmPassword ? "border-red-400 focus:ring-red-200" : "border-[#E5E1DA] focus:border-[#506147] focus:ring-[#506147]/20"
                    }`}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6E6A] hover:text-[#2D312C]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPasswords.confirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setPasswordErrors({});
                  }}
                  disabled={updatingPassword}
                  className="px-4 py-2 text-xs font-semibold text-[#6B6E6A] bg-[#f0ede9] hover:bg-[#e5e2de] rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#506147] hover:bg-[#3b4b33] rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {updatingPassword ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
