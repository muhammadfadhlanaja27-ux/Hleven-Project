import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const initialPhotos = [
  {
    id: "photo-1",
    name: "Grand_Lobby_Main.jpg",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    size: "2.4 MB",
    uploadedAt: "12 Oct 2023",
    isPrimary: true,
  },
  {
    id: "photo-2",
    name: "Executive_Suite_Bed.jpg",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    size: "1.8 MB",
    uploadedAt: "12 Oct 2023",
    isPrimary: false,
  },
  {
    id: "photo-3",
    name: "Restaurant_Dining.jpg",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    size: "3.1 MB",
    uploadedAt: "28 Sep 2023",
    isPrimary: false,
  },
  {
    id: "photo-4",
    name: "Spa_Indoor_Pool.jpg",
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    size: "2.9 MB",
    uploadedAt: "15 Sep 2023",
    isPrimary: false,
  },
];

const initialHotelData = {
  name: "Grand H'Leven Hotel",
  description:
    "Hotel nyaman dengan fasilitas lengkap untuk kebutuhan perjalanan bisnis maupun liburan.",
  address: "Jl. Example No. 123",
  city: "Bandung",
  phone: "+62 812 3456 7890",
  email: "contact@hleven.com",
  rating: "0.0",
  totalReviews: "0",
  location: "Bandung, Jawa Barat",
  propertyType: "Luxury Boutique Resort",
  yearBuilt: "2020",
  website: "www.hleven.com",
  photos: initialPhotos,
};

export default function HotelInformation() {
  const [hotelData, setHotelData] = useState(initialHotelData);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialHotelData);
  const [formPhotos, setFormPhotos] = useState(initialPhotos);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHotelInfo();
  }, []);

  const fetchHotelInfo = async () => {
    setLoading(true);
    try {
      const [profileRes, reviewsRes] = await Promise.allSettled([
        api.get("/admin/hotel/profile"),
        api.get("/hotel/reviews"),
      ]);

      let reviewsData = [];
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.data) {
        reviewsData =
          reviewsRes.value.data.data || reviewsRes.value.data || [];
      }

      const totalReviewsCount = Array.isArray(reviewsData) ? reviewsData.length : 0;
      const sumRating = Array.isArray(reviewsData)
        ? reviewsData.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
        : 0;
      const dynamicAvgRating =
        totalReviewsCount > 0
          ? (sumRating / totalReviewsCount).toFixed(1)
          : "0.0";

      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        const raw = profileRes.value.data.data || profileRes.value.data;
        if (raw) {
          const mappedPhotos = (raw.photos || []).map((p, idx) => {
            const imgPath = p.image_path || p.url || "";
            const fullUrl = imgPath.startsWith("http")
              ? imgPath
              : `http://localhost:8000/storage/${imgPath}`;
            return {
              id: p.id || `photo-${idx}`,
              name: imgPath ? imgPath.split("/").pop() : `Photo_${idx + 1}.jpg`,
              url: fullUrl,
              size: "2.5 MB",
              uploadedAt: "Recent",
              isPrimary: idx === 0,
            };
          });

          const currentRating =
            dynamicAvgRating !== "0.0"
              ? dynamicAvgRating
              : raw.average_rating
              ? Number(raw.average_rating).toFixed(1)
              : "0.0";

          const currentTotalReviews =
            totalReviewsCount > 0
              ? String(totalReviewsCount)
              : String(raw.total_review || 0);

          const updatedData = {
            name: raw.name || "Grand H'Leven Hotel",
            description:
              raw.description ||
              "Hotel nyaman dengan fasilitas lengkap untuk kebutuhan perjalanan bisnis maupun liburan.",
            address: raw.address || "Jl. Example No. 123",
            city: raw.city?.name || raw.city || "Bandung",
            phone: raw.phone || "+62 812 3456 7890",
            email: raw.email || "contact@hleven.com",
            rating: currentRating,
            totalReviews: currentTotalReviews,
            location:
              raw.address ||
              (raw.city?.name
                ? `${raw.city.name}, Indonesia`
                : "Bandung, Jawa Barat"),
            propertyType: "Luxury Boutique Resort",
            yearBuilt: "2020",
            website: "www.hleven.com",
            photos: mappedPhotos.length > 0 ? mappedPhotos : initialPhotos,
          };

          setHotelData(updatedData);
          setFormValues(updatedData);
          setFormPhotos(updatedData.photos);
        }
      }
    } catch (err) {
      console.error("Failed to load hotel info:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle ke mode edit
  const handleStartEdit = () => {
    setFormValues(hotelData);
    setFormPhotos(hotelData.photos || initialPhotos);
    setErrors({});
    setIsEditing(true);
  };

  // Batal edit
  const handleCancel = () => {
    setFormValues(hotelData);
    setFormPhotos(hotelData.photos || initialPhotos);
    setErrors({});
    setIsEditing(false);
  };

  // Change handler input teks
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // =========================================================================
  // MANAJEMEN FOTO (FRONTEND LOCAL STATE)
  // =========================================================================
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newUploadedPhotos = files.map((file, index) => {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return {
        id: `photo-new-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${sizeInMB} MB`,
        uploadedAt: todayStr,
        isPrimary: formPhotos.length === 0 && index === 0,
      };
    });

    setFormPhotos((prev) => [...prev, ...newUploadedPhotos]);
    toast.success(`${files.length} foto berhasil diunggah!`);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSetPrimary = (photoId) => {
    setFormPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        isPrimary: photo.id === photoId,
      }))
    );
    toast.success("Foto utama hotel berhasil diperbarui.");
  };

  const handleDeletePhoto = (photoId) => {
    setFormPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== photoId);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    toast.success("Foto berhasil dihapus dari galeri.");
  };

  // Validasi Form Frontend
  const validateForm = () => {
    const newErrors = {};

    if (!formValues.name.trim()) {
      newErrors.name = "Hotel name is required.";
    }

    if (!formValues.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!formValues.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formValues.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formValues.phone.trim()) {
      newErrors.phone = "Contact phone is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.email.trim()) {
      newErrors.email = "Contact email is required.";
    } else if (!emailRegex.test(formValues.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.location.trim()) {
      newErrors.location = "Location is required.";
    }

    return newErrors;
  };

  // Submit Handler
  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      await api.post("/admin/hotel/profile", {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        address: formValues.address.trim(),
        phone: formValues.phone.trim(),
      });

      setHotelData({
        ...formValues,
        photos: formPhotos,
      });
      setIsEditing(false);
      toast.success("Hotel information updated successfully.");
    } catch (err) {
      console.error("Failed to update hotel profile:", err);
      toast.error("Gagal memperbarui profil hotel.");
    } finally {
      setIsSaving(false);
    }
  };

  const primaryPhoto =
    (hotelData.photos || initialPhotos).find((p) => p.isPrimary) ||
    (hotelData.photos || initialPhotos)[0];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            {isEditing ? "Edit Hotel Information" : "Hotel Information"}
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            {isEditing
              ? "Update your hotel's core details, location, contact, and gallery photos."
              : "Manage core details, location, contact information, and photo gallery."}
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            className="bg-[#506147] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Hotel
          </button>
        ) : (
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-5 py-2 border border-[#c4c8be] rounded-lg bg-[#fcf9f5] text-[#2D312C] text-xs font-semibold hover:bg-[#eae8e4] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              close
            </span>
            Cancel Editing
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: VIEW MODE                                                         */}
      {/* ========================================================================= */}
      {!isEditing && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Overview Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6 border-b border-[#E5E1DA] pb-4">
                <div>
                  <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                    Hotel Overview
                  </h3>
                  <p className="text-xs text-[#6B6E6A] mt-0.5">
                    Informasi umum dan profil utama hotel Anda.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#757870] text-[24px]">
                  info
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                    Hotel Name
                  </h4>
                  <p className="font-['Newsreader',serif] text-2xl sm:text-3xl font-semibold text-[#2D312C]">
                    {hotelData.name}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-[#444840] leading-relaxed">
                    {hotelData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E5E1DA]">
                  <div>
                    <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                      Property Type
                    </h4>
                    <p className="text-sm font-semibold text-[#2D312C]">
                      {hotelData.propertyType}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                      Year Built
                    </h4>
                    <p className="text-sm font-semibold text-[#2D312C]">
                      {hotelData.yearBuilt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Stats & Contact */}
            <div className="space-y-6">
              {/* Guest Rating Card */}
              <div className="bg-[#F6F3EF] rounded-xl border border-[#E5E1DA] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                    Guest Rating
                  </h3>
                  <span className="material-symbols-outlined text-[#D48C45] text-[22px]">
                    star
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-['Newsreader',serif] text-4xl font-bold text-[#2D312C]">
                    {hotelData.rating}
                  </span>
                  <span className="text-xs text-[#6B6E6A] mb-1">/ 5.0</span>
                </div>
                <div className="flex gap-1 text-[#D48C45] mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#444840]">
                  Berdasarkan{" "}
                  <span className="font-semibold text-[#2D312C]">
                    {hotelData.totalReviews}
                  </span>{" "}
                  ulasan tamu terverifikasi.
                </p>
              </div>

              {/* Contact Details Card */}
              <div className="bg-white rounded-xl border border-[#E5E1DA] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5 border-b border-[#E5E1DA] pb-3">
                  <h3 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                    Contact Information
                  </h3>
                  <span className="material-symbols-outlined text-[#757870] text-[22px]">
                    contact_support
                  </span>
                </div>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#6B6E6A] text-[20px] shrink-0 mt-0.5">
                      call
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">
                        Phone Number
                      </p>
                      <p className="text-sm font-semibold text-[#2D312C]">
                        {hotelData.phone}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#6B6E6A] text-[20px] shrink-0 mt-0.5">
                      mail
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-[#2D312C]">
                        {hotelData.email}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#6B6E6A] text-[20px] shrink-0 mt-0.5">
                      language
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">
                        Website
                      </p>
                      <p className="text-sm font-semibold text-[#506147] hover:underline cursor-pointer">
                        {hotelData.website}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Location & Map Card */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 sm:p-8 md:w-1/3 flex flex-col justify-center bg-[#F2EBE1] border-b md:border-b-0 md:border-r border-[#E5E1DA]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#2D312C] text-[24px]">
                    location_on
                  </span>
                  <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                    Location
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                      Street Address
                    </h4>
                    <p className="font-semibold text-[#2D312C]">
                      {hotelData.address}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                      City &amp; Region
                    </h4>
                    <p className="font-semibold text-[#2D312C]">
                      {hotelData.city}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
                      Location Area
                    </h4>
                    <p className="font-semibold text-[#2D312C]">
                      {hotelData.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated Map Container */}
              <div className="md:w-2/3 min-h-[220px] bg-[#dcdad6] relative flex items-center justify-center p-6 text-center select-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F2EBE1]/80 via-transparent to-transparent z-10 pointer-events-none" />
                <div className="relative z-20 flex flex-col items-center gap-2 bg-white/85 backdrop-blur-sm p-5 rounded-xl border border-[#E5E1DA] shadow-sm max-w-sm">
                  <span className="material-symbols-outlined text-[#506147] text-[36px]">
                    map
                  </span>
                  <p className="font-semibold text-[#2D312C] text-sm">
                    {hotelData.name}
                  </p>
                  <p className="text-xs text-[#6B6E6A]">
                    {hotelData.address}, {hotelData.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* VIEW MODE: HOTEL PHOTOS GALLERY SECTION */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E1DA] pb-4">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Hotel Photo Gallery
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Koleksi foto profil dan galeri hotel ({hotelData.photos?.length || 0} foto tersedia).
                </p>
              </div>
              <button
                onClick={handleStartEdit}
                className="text-xs font-semibold text-[#506147] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  photo_camera
                </span>
                Kelola Foto di Mode Edit
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(hotelData.photos || initialPhotos).map((photo) => (
                <div
                  key={photo.id}
                  className="group relative bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Primary Badge */}
                    {photo.isPrimary && (
                      <span className="absolute top-3 left-3 bg-[#506147] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        Primary Banner
                      </span>
                    )}

                    {/* Overlay Action Preview */}
                    <div className="absolute inset-0 bg-[#2D312C]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="w-10 h-10 rounded-full bg-white text-[#2D312C] hover:bg-[#F2EBE1] transition-colors flex items-center justify-center shadow"
                        title="Preview"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-[#E5E1DA]">
                    <p className="text-xs font-semibold text-[#2D312C] truncate" title={photo.name}>
                      {photo.name}
                    </p>
                    <p className="text-[11px] text-[#6B6E6A] mt-1">
                      {photo.uploadedAt} &bull; {photo.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: EDIT MODE (FORM + PHOTO MANAGEMENT)                              */}
      {/* ========================================================================= */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION A: FORM TEXT DETAILS */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E5E1DA] pb-4">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                Form Informasi Hotel
              </h3>
              <p className="text-xs text-[#6B6E6A] mt-0.5">
                Perbarui bidang informasi di bawah ini. Semua bidang bertanda *
                wajib diisi.
              </p>
            </div>

            {/* Field 1: Hotel Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
              >
                Hotel Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formValues.name}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Masukkan nama hotel"
                className={`w-full h-11 px-4 bg-white border ${
                  errors.name ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
              />
              {errors.name && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Field 2: Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formValues.description}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Masukkan deskripsi hotel"
                className={`w-full p-4 bg-white border ${
                  errors.description ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all leading-relaxed`}
              />
              {errors.description && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Grid 2 Column untuk Alamat & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 3: Address */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="address"
                  className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
                >
                  Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formValues.address}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Contoh: Jl. Example No. 123"
                  className={`w-full h-11 px-4 bg-white border ${
                    errors.address ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
                {errors.address && (
                  <span className="text-xs text-[#ba1a1a] font-medium">
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Field 4: City */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="city"
                  className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
                >
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formValues.city}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Contoh: Bandung"
                  className={`w-full h-11 px-4 bg-white border ${
                    errors.city ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
                {errors.city && (
                  <span className="text-xs text-[#ba1a1a] font-medium">
                    {errors.city}
                  </span>
                )}
              </div>
            </div>

            {/* Grid 2 Column untuk Kontak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 5: Contact Phone */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
                >
                  Contact Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formValues.phone}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Contoh: +62 812 3456 7890"
                  className={`w-full h-11 px-4 bg-white border ${
                    errors.phone ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
                {errors.phone && (
                  <span className="text-xs text-[#ba1a1a] font-medium">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Field 6: Contact Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
                >
                  Contact Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Contoh: contact@hleven.com"
                  className={`w-full h-11 px-4 bg-white border ${
                    errors.email ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
                {errors.email && (
                  <span className="text-xs text-[#ba1a1a] font-medium">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Field 7: Location */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="location"
                className="text-xs font-semibold text-[#434842] uppercase tracking-wider"
              >
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formValues.location}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Contoh: Bandung, Jawa Barat"
                className={`w-full h-11 px-4 bg-white border ${
                  errors.location ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
              />
              {errors.location && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.location}
                </span>
              )}
            </div>

            {/* Read-Only Info */}
            <div className="pt-4 border-t border-[#E5E1DA] bg-[#F6F3EF] p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#757870]">
                  lock
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#2D312C]">
                    Hotel Rating &amp; Total Reviews (Read-Only)
                  </p>
                  <p className="text-[11px] text-[#6B6E6A]">
                    Informasi rating ({hotelData.rating} ★) dan ulasan (
                    {hotelData.totalReviews} ulasan) dikalkulasi secara otomatis
                    oleh sistem dari ulasan tamu dan tidak dapat diubah oleh Admin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: HOTEL PHOTOS MANAGEMENT */}
          <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E1DA] pb-4">
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Manajemen Foto Hotel
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-0.5">
                  Unggah, atur foto utama, atau hapus foto profil hotel Anda.
                </p>
              </div>

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="bg-[#506147] text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3b4b33] transition-all shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add_photo_alternate
                  </span>
                  Unggah Foto Baru
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#c4c8be] hover:border-[#506147] rounded-xl p-6 sm:p-8 text-center bg-[#fcf9f5] hover:bg-[#f6f3ef] transition-colors cursor-pointer flex flex-col items-center justify-center group"
            >
              <span className="material-symbols-outlined text-4xl text-[#506147] group-hover:scale-110 transition-transform mb-2">
                cloud_upload
              </span>
              <p className="text-sm font-semibold text-[#2D312C]">
                Tarik &amp; lepas foto baru di sini, atau klik untuk memilih file
              </p>
              <p className="text-xs text-[#6B6E6A] mt-1">
                Format yang didukung: JPG, PNG, WEBP (maksimal 5MB per file)
              </p>
            </div>

            {/* Managed Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative bg-[#fcf9f5] rounded-xl border ${
                    photo.isPrimary
                      ? "border-[#506147] ring-2 ring-[#506147]/20"
                      : "border-[#E5E1DA]"
                  } overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col`}
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {photo.isPrimary ? (
                      <span className="absolute top-2.5 left-2.5 bg-[#506147] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1 z-10">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        Primary Banner
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(photo.id)}
                        className="absolute top-2.5 left-2.5 bg-black/60 hover:bg-[#506147] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">star_border</span>
                        Set Primary
                      </button>
                    )}

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-[#2D312C]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px] z-0">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(photo)}
                        className="w-9 h-9 rounded-full bg-white text-[#2D312C] hover:bg-[#F2EBE1] transition-colors flex items-center justify-center shadow"
                        title="Preview Foto"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="w-9 h-9 rounded-full bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors flex items-center justify-center shadow"
                        title="Hapus Foto"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white border-t border-[#E5E1DA]">
                    <p className="text-xs font-semibold text-[#2D312C] truncate" title={photo.name}>
                      {photo.name}
                    </p>
                    <p className="text-[11px] text-[#6B6E6A] mt-0.5">
                      {photo.uploadedAt} &bull; {photo.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 border border-[#c4c8be] rounded-lg bg-white text-[#2D312C] text-xs font-semibold hover:bg-[#eae8e4] transition-colors shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-[#a2ba9c] disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL PHOTO PREVIEW                                                       */}
      {/* ========================================================================= */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between bg-[#fcf9f5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#506147]">
                  image
                </span>
                <span className="text-sm font-semibold text-[#2D312C] truncate max-w-md">
                  {previewPhoto.name}
                </span>
                {previewPhoto.isPrimary && (
                  <span className="bg-[#506147] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Primary Banner
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-full text-[#6B6E6A] hover:bg-[#eae8e4] hover:text-[#2D312C] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body Image */}
            <div className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-4">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#E5E1DA] bg-white flex justify-between items-center text-xs text-[#6B6E6A]">
              <span>
                Uploaded: {previewPhoto.uploadedAt} &bull; Size: {previewPhoto.size}
              </span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 bg-[#f0ede9] text-[#2D312C] rounded-lg font-semibold hover:bg-[#e5e2de] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
