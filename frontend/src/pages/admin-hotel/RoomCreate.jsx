import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";
import {
  deduplicateFacilities,
  getFacilityDisplayName,
  matchesFacilitySearch,
  resolveFacilityIcon as getFacilityIcon,
} from "../../utils/facilities";

const FACILITY_ICON_MAP = {
  "AC": "ac_unit",
  "Air Conditioning": "ac_unit",
  "AC Area Umum": "ac_unit",
  "TV": "tv",
  "Smart TV": "tv",
  "Television": "tv",
  "Kamar mandi pribadi": "bathtub",
  "Private Bathroom": "bathtub",
  "Bathtub": "bathtub",
  "Balkon": "balcony",
  "Private Balcony": "balcony",
  "Mini fridge": "kitchen",
  "Mini Refrigerator": "kitchen",
  "Kulkas Mini": "kitchen",
  "Hair dryer": "lotion",
  "Hair Dryer": "lotion",
  "Pengering Rambut": "lotion",
  "Meja kerja": "desk",
  "Work Desk": "desk",
  "Lemari": "checkroom",
  "Wardrobe": "checkroom",
  "Closet": "checkroom",
  "Lemari Pakaian": "checkroom",
  "Air mineral": "water_drop",
  "Mineral Water": "water_drop",
  "Air Mineral": "water_drop",
  "Water Heater": "water_drop",
  "Shower": "shower",
  "Toilet": "bathtub",
  "Washtafel": "bathtub",
  "Wi-Fi": "wifi",
  "Wi-Fi Gratis": "wifi",
  "Internet": "wifi",
  "Kolam renang": "pool",
  "Swimming Pool": "pool",
  "Kolam Renang": "pool",
  "Parkir": "local_parking",
  "Parkir Gratis": "local_parking",
  "Parking": "local_parking",
  "Restoran": "restaurant",
  "Restaurant": "restaurant",
  "Gym": "fitness_center",
  "Fitness Center": "fitness_center",
  "Pusat Kebugaran": "fitness_center",
  "Spa": "hot_tub",
  "Spa & Massage": "hot_tub",
  "Spa & Wellness": "hot_tub",
  "Resepsionis 24 jam": "concierge",
  "Reception 24h": "concierge",
  "Front Desk 24h": "concierge",
  "Lift": "elevator",
  "Elevator": "elevator",
  "Laundry": "local_laundry_service",
  "Laundry Service": "local_laundry_service",
  "Safety Box": "lock",
  "Brankas Kamar": "lock",
  "In-Room Safe": "lock",
  "Coffee Maker": "local_cafe",
  "Pembuat Teh/Kopi": "local_cafe",
  "Bar & Lounge": "local_bar",
  "Room Service": "room_service",
  "Bed / Room": "bed",
  "Tempat Tidur": "bed",
  "Hotel General": "hotel",
  "Peralatan Mandi Gratis": "bathtub",
  "Free Toiletries": "bathtub",
};

const resolveFacilityIcon = (name) => {
  if (!name) return "bed";
  if (FACILITY_ICON_MAP[name]) return FACILITY_ICON_MAP[name];
  const lower = name.toLowerCase();
  if (lower.includes("ac") || lower.includes("air condition")) return "ac_unit";
  if (lower.includes("tv") || lower.includes("televisi") || lower.includes("television")) return "tv";
  if (lower.includes("mandi") || lower.includes("bath") || lower.includes("toilet") || lower.includes("kloset") || lower.includes("wash") || lower.includes("washtafel") || lower.includes("wastafel")) return "bathtub";
  if (lower.includes("bathtub") || lower.includes("bak")) return "bathtub";
  if (lower.includes("balkon") || lower.includes("teras") || lower.includes("balcony")) return "balcony";
  if (lower.includes("kulkas") || lower.includes("fridge") || lower.includes("minibar") || lower.includes("refrigerator")) return "kitchen";
  if (lower.includes("hair") || lower.includes("pengering") || lower.includes("dryer")) return "lotion";
  if (lower.includes("meja") || lower.includes("kerja") || lower.includes("desk")) return "desk";
  if (lower.includes("lemari") || lower.includes("wardrobe") || lower.includes("closet")) return "checkroom";
  if (lower.includes("air mineral") || lower.includes("mineral water") || lower.includes("drink") || lower.includes("botol") || lower.includes("water heater")) return "water_drop";
  if (lower.includes("shower")) return "shower";
  if (lower.includes("wifi") || lower.includes("internet")) return "wifi";
  if (lower.includes("kolam") || lower.includes("pool") || lower.includes("renang")) return "pool";
  if (lower.includes("parkir") || lower.includes("parking")) return "local_parking";
  if (lower.includes("restoran") || lower.includes("makan") || lower.includes("restaurant")) return "restaurant";
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("kebugaran")) return "fitness_center";
  if (lower.includes("spa") || lower.includes("massage") || lower.includes("wellness")) return "hot_tub";
  if (lower.includes("resepsionis") || lower.includes("reception") || lower.includes("24") || lower.includes("front desk")) return "concierge";
  if (lower.includes("lift") || lower.includes("elevator")) return "elevator";
  if (lower.includes("laundry") || lower.includes("cuci")) return "local_laundry_service";
  if (lower.includes("brankas") || lower.includes("safety box") || lower.includes("safe") || lower.includes("lock")) return "lock";
  if (lower.includes("coffee") || lower.includes("kopi") || lower.includes("tea") || lower.includes("teh")) return "local_cafe";
  if (lower.includes("bar") || lower.includes("lounge")) return "local_bar";
  if (lower.includes("room service")) return "room_service";
  if (lower.includes("bed") || lower.includes("tidur")) return "bed";
  return "bed";
};

export default function RoomCreate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Shared Room Facilities list
  const [roomFacilities, setRoomFacilities] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [roomTypeCategories, setRoomTypeCategories] = useState([]);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [rawFiles, setRawFiles] = useState([]);

  const ROOM_POLICY_TEMPLATE = `Waktu Check-in & Check-out
Check-in mulai pukul 14:00 WIB. Check-out maksimal pukul 12:00 WIB.
Kebijakan Bebas Asap Rokok
Semua kamar bebas dari asap rokok. Area merokok khusus tersedia di teras luar.
Hewan Peliharaan
Hewan peliharaan tidak diperkenankan masuk untuk menjaga higienitas seluruh tamu.
Pembatalan
Pembatalan tersedia: Refund otomatis berlaku jika pembatalan dilakukan lebih dari 24 jam sebelum check-in. Dalam 24 jam terakhir sebelum check-in, dana tidak dapat dikembalikan.`;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    room_type_category_id: "",
    bed: "",
    bed_type_id: "",
    description: "",
    weekday_price: "",
    weekend_price: "",
    stock: "",
    is_refundable: true,
    policies: ROOM_POLICY_TEMPLATE,
    facilityIds: [],
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomFacilities = async () => {
      const [facilityResult, bedTypeResult, categoryResult] = await Promise.allSettled([
        cachedGet("/facilities"),
        cachedGet("/admin/bed-types"),
        cachedGet("/admin/room-type-categories"),
      ]);
      if (facilityResult.status === "fulfilled") {
        const responseData = facilityResult.value.data;
        const payload = responseData ?? [];
        const allFacilities = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const filtered = Array.isArray(allFacilities)
          ? allFacilities.filter((f) => f.category === "Room" || f.category === "Bathroom")
          : [];
        setRoomFacilities(deduplicateFacilities(filtered));
      } else {
        console.error("Failed to load room facilities:", facilityResult.reason);
        setRoomFacilities([]);
      }
      if (bedTypeResult.status === "fulfilled") {
        const bedTypeData = bedTypeResult.value.data?.data ?? [];
        setBedTypes(Array.isArray(bedTypeData) ? bedTypeData : []);
      } else {
        console.error("Failed to load bed types:", bedTypeResult.reason);
        toast.error("Gagal memuat daftar tipe kasur.");
      }
      if (categoryResult.status === "fulfilled") {
        const categoryData = categoryResult.value.data?.data ?? [];
        setRoomTypeCategories(Array.isArray(categoryData) ? categoryData : []);
      } else {
        console.error("Failed to load room type categories:", categoryResult.reason);
        toast.error("Gagal memuat daftar tipe kamar.");
      }
      setIsLoadingFacilities(false);
    };
    fetchRoomFacilities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoomTypeCategoryChange = (e) => {
    const value = e.target.value;
    const selected = roomTypeCategories.find((c) => String(c.id) === String(value));
    setFormData((prev) => ({
      ...prev,
      room_type_category_id: value,
      type: selected ? selected.name : "",
    }));
    if (errors.room_type_category_id) {
      setErrors((prev) => ({ ...prev, room_type_category_id: "" }));
    }
  };

  const handleBedTypeChange = (e) => {
    const value = e.target.value;
    const selected = bedTypes.find((b) => String(b.id) === String(value));
    setFormData((prev) => ({
      ...prev,
      bed_type_id: value,
      bed: selected ? selected.name : "",
    }));
    if (errors.bed_type_id) {
      setErrors((prev) => ({ ...prev, bed_type_id: "" }));
    }
  };

  const handleRefundChange = (isRefundable) => {
    setFormData((prev) => ({ ...prev, is_refundable: isRefundable }));
  };

  const handleFacilityToggle = (facilityId) => {
    setFormData((prev) => {
      const currentIds = prev.facilityIds || [];
      const updatedIds = currentIds.includes(facilityId)
        ? currentIds.filter((id) => id !== facilityId)
        : [...currentIds, facilityId];
      return { ...prev, facilityIds: updatedIds };
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setRawFiles((prev) => [...prev, ...files]);

    const newPhotos = files.map((file, idx) => ({
      id: `p-create-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file: file,
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
    toast.success(`${files.length} foto berhasil diunggah!`);
  };

  const handleRemovePhoto = (photoId, index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
    setRawFiles((prev) => prev.filter((_, idx) => idx !== index));
    toast.success("Foto dihapus.");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required.";
    }

    if (!formData.room_type_category_id) {
      newErrors.room_type_category_id = "Pilih tipe kamar.";
    }

    if (!formData.weekday_price || Number(formData.weekday_price) <= 0) {
      newErrors.weekday_price = "Weekday price must be greater than 0.";
    }

    if (!formData.weekend_price || Number(formData.weekend_price) <= 0) {
      newErrors.weekend_price = "Weekend price must be greater than 0.";
    }

    if (!formData.bed_type_id) {
      newErrors.bed_type_id = "Pilih tipe tempat tidur.";
    }

    if (!formData.stock || Number(formData.stock) < 1) {
      newErrors.stock = "Stock must be at least 1 unit.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("room_type_category_id", formData.room_type_category_id);
      payload.append("type", formData.type || "Standard");
      payload.append("description", formData.description.trim());
      payload.append("weekday_price", formData.weekday_price);
      payload.append("weekend_price", formData.weekend_price);
      payload.append("bed", formData.bed || "");
      payload.append("bed_type_id", formData.bed_type_id || "");
      payload.append("stock", formData.stock);
      payload.append("is_refundable", formData.is_refundable ? "1" : "0");
      payload.append("policies", (formData.policies || "").trim());

      (formData.facilityIds || []).forEach((fId, idx) => {
        payload.append(`facilities[${idx}]`, fId);
      });

      (rawFiles || []).forEach((file) => {
        payload.append("photos[]", file);
      });

      await api.post("/admin/rooms", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Room created successfully.");
      invalidateCache("/hotels");
      navigate("/admin/rooms");
    } catch (error) {
      console.error("Failed to create room:", error);
      const msg =
        error.response?.data?.message || "Gagal membuat tipe kamar di server.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider mb-1">
            <Link to="/admin/rooms" className="hover:text-[#506147]">
              Rooms
            </Link>
            <span>/</span>
            <span className="text-[#2D312C]">Add New Room</span>
          </div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Add Room
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Configure a new room listing for the property.
          </p>
        </div>

        <Link
          to="/admin/rooms"
          className="px-4 py-2 border border-[#c4c8be] rounded-lg bg-white text-[#2D312C] text-xs font-semibold hover:bg-[#eae8e4] transition-colors shadow-sm"
        >
          Cancel
        </Link>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-8">
        {/* SECTION 1: ROOM INFORMATION */}
        <div className="space-y-6">
          <div className="border-b border-[#E5E1DA] pb-3">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              1. Room Information
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Nama, tipe, dan deskripsi umum dari kamar hotel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Room Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Contoh: Deluxe Ocean View Suite"
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

            {/* Room Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="room_type_category_id" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Room Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                id="room_type_category_id"
                name="room_type_category_id"
                value={formData.room_type_category_id}
                onChange={handleRoomTypeCategoryChange}
                disabled={isSubmitting}
                className={`w-full h-11 px-4 bg-white border ${
                  errors.room_type_category_id ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer`}
              >
                <option value="" disabled>
                  Pilih tipe kamar
                </option>
                {roomTypeCategories
                  .filter((category) => category.status === "active")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {errors.room_type_category_id && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.room_type_category_id}
                </span>
              )}
              {roomTypeCategories.length === 0 && (
                <span className="text-[11px] text-[#6B6E6A]">
                  Belum ada tipe kamar. Tambahkan dulu di menu{" "}
                  <Link to="/admin/room-types" className="font-semibold text-[#506147] underline">
                    Room Types Management
                  </Link>
                  .
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Berikan deskripsi detail tentang atmosfer, fasilitas, dan keunggulan kamar..."
              className="w-full p-4 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all leading-relaxed"
            />
          </div>

          {/* Bed Type */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bed_type_id" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
              Bed Type <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              id="bed_type_id"
              name="bed_type_id"
              value={formData.bed_type_id}
              onChange={handleBedTypeChange}
              disabled={isSubmitting}
              className={`w-full h-11 px-4 bg-white border ${
                errors.bed_type_id ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
              } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all cursor-pointer`}
            >
              <option value="">Pilih Tipe Kasur</option>
              {bedTypes.filter((b) =>
                b.status === "active" || String(b.id) === String(formData.bed_type_id)
              ).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.size ? ` — ${b.size}` : ""} ({b.max_adults}D/{b.max_children}A, maks {b.max_total})
                </option>
              ))}
            </select>
            {errors.bed_type_id && (
              <span className="text-xs text-[#ba1a1a] font-medium">{errors.bed_type_id}</span>
            )}
            {bedTypes.length === 0 && (
              <span className="text-[11px] text-[#6B6E6A]">
                Belum ada tipe tempat tidur. Tambahkan dulu di menu Bed Types Management.
              </span>
            )}
            {(() => {
              const selected = bedTypes.find((b) => String(b.id) === String(formData.bed_type_id));
              if (!selected) return null;
              return (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#4A5D43] bg-[#E4EBE0] border border-[#cfe0c6] rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Kapasitas: {selected.max_adults} Dewasa, {selected.max_children} Anak (Total {selected.max_total} tamu)
                </div>
              );
            })()}
          </div>
        </div>

        {/* SECTION 2: ROOM PRICING */}
        <div className="space-y-6 pt-4 border-t border-[#E5E1DA]">
          <div className="border-b border-[#E5E1DA] pb-3">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              2. Room Pricing
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Tentukan harga terpisah untuk hari kerja (Weekday) dan akhir pekan (Weekend).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekday Price */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="weekday_price" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Weekday Price (Senin - Kamis) <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757870] font-semibold text-sm">
                  Rp
                </span>
                <input
                  id="weekday_price"
                  type="number"
                  name="weekday_price"
                  value={formData.weekday_price}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="500000"
                  className={`w-full h-11 pl-11 pr-4 bg-white border ${
                    errors.weekday_price ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
              </div>
              {errors.weekday_price && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.weekday_price}
                </span>
              )}
            </div>

            {/* Weekend Price */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="weekend_price" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Weekend Price (Jumat - Minggu) <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757870] font-semibold text-sm">
                  Rp
                </span>
                <input
                  id="weekend_price"
                  type="number"
                  name="weekend_price"
                  value={formData.weekend_price}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="650000"
                  className={`w-full h-11 pl-11 pr-4 bg-white border ${
                    errors.weekend_price ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
              </div>
              {errors.weekend_price && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.weekend_price}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: ROOM AVAILABILITY */}
        <div className="space-y-6 pt-4 border-t border-[#E5E1DA]">
          <div className="border-b border-[#E5E1DA] pb-3">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              3. Room Availability
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Total jumlah unit fisik kamar. Kapasitas tamu mengikuti tipe tempat tidur yang dipilih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="stock" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Total Units / Stock <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">
                  tag
                </span>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  min="1"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="10"
                  className={`w-full h-11 pl-10 pr-4 bg-white border ${
                    errors.stock ? "border-[#ba1a1a]" : "border-[#E5E0D8]"
                  } rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all`}
                />
              </div>
              {errors.stock && (
                <span className="text-xs text-[#ba1a1a] font-medium">
                  {errors.stock}
                </span>
              )}
            </div>
          </div>

          {/* Refund Policy Section */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                Refund Policy
              </h4>
              <span className="text-[#ba1a1a] text-xs">*</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRefundChange(true)}
                disabled={isSubmitting}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  formData.is_refundable === true
                    ? "border-[#506147] bg-[#E4EBE0] shadow-sm"
                    : "border-[#E5E1DA] bg-white hover:border-[#c4c8be]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 border-2 ${
                  formData.is_refundable === true
                    ? "border-[#506147] bg-[#506147]"
                    : "border-[#c4c8be] bg-white"
                }`}>
                  {formData.is_refundable === true && (
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[#2D312C] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4F6F52] text-[18px]">
                      verified
                    </span>
                    Bisa Refund
                  </span>
                  <p className="text-xs text-[#6B6E6A] leading-relaxed">
                    Tamu bisa membatalkan dan mendapat refund otomatis jika dilakukan lebih dari 24 jam sebelum check-in. Dalam 24 jam terakhir, dana hangus.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRefundChange(false)}
                disabled={isSubmitting}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  formData.is_refundable === false
                    ? "border-[#ba1a1a] bg-[#ffdad6]/30 shadow-sm"
                    : "border-[#E5E1DA] bg-white hover:border-[#c4c8be]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 border-2 ${
                  formData.is_refundable === false
                    ? "border-[#ba1a1a] bg-[#ba1a1a]"
                    : "border-[#c4c8be] bg-white"
                }`}>
                  {formData.is_refundable === false && (
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[#2D312C] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">
                      block
                    </span>
                    Tidak Bisa Refund
                  </span>
                  <p className="text-xs text-[#6B6E6A] leading-relaxed">
                    Pembayaran bersifat non-refundable. Tamu tidak dapat mengembalikan dana apabila membatalkan reservasi.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Kebijakan Kamar (Policies Textarea) */}
          <div className="pt-2 flex flex-col gap-1.5">
            <label htmlFor="policies" className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
              Kebijakan Kamar
            </label>
            <textarea
              id="policies"
              name="policies"
              rows={6}
              value={formData.policies}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Kebijakan khusus kamar ini..."
              className="w-full p-4 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all leading-relaxed whitespace-pre-wrap"
            />
            <p className="text-[11px] text-[#6B6E6A]">Sudah terisi template standar. Anda bisa mengubah aturan khusus kamar ini.</p>
          </div>

          <div className="bg-[#F6F3EF] p-4 rounded-xl text-xs text-[#6B6E6A] border border-[#E5E1DA]">
            <p className="font-semibold text-[#2D312C]">Informasi Stok Tersedia (Available Stock)</p>
            <p className="mt-0.5">
              Available stock dikalkulasikan secara otomatis berdasarkan rumus: <code className="bg-white px-1.5 py-0.5 rounded border">Stock - Occupied</code>.
            </p>
          </div>
        </div>

        {/* SECTION 4: ROOM FACILITIES */}
        <div className="space-y-6 pt-4 border-t border-[#E5E1DA]">
          <div className="border-b border-[#E5E1DA] pb-3">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              4. Fasilitas Kamar
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Fasilitas pada bagian ini hanya untuk kamar dan kamar mandi; fasilitas hotel dikelola terpisah di Hotel Information.
            </p>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#778873] text-[20px]">
              search
            </span>
            <input
              type="search"
              value={facilitySearch}
              onChange={(event) => setFacilitySearch(event.target.value)}
              placeholder="Cari fasilitas kamar..."
              aria-label="Cari fasilitas kamar"
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E5E0D8] bg-white text-sm focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 border border-[#E5E0D8] rounded-xl bg-[#fcf9f5]">
            {roomFacilities.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-[#6B6E6A]">
                {isLoadingFacilities
                  ? "Memuat daftar fasilitas kamar..."
                  : "Belum ada fasilitas kamar di katalog."}
              </div>
            )}
            {roomFacilities
              .filter((fac) => matchesFacilitySearch(fac, facilitySearch))
              .map((fac) => {
              const isChecked = formData.facilityIds.includes(fac.id);
              const isInactive = fac.status === "inactive";

              return (
                <label
                  key={fac.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isChecked
                      ? "border-[#506147] bg-[#E4EBE0] text-[#4A5D43]"
                      : "border-[#E5E1DA] bg-white text-[#2D312C] hover:border-[#c4c8be]"
                  } ${isInactive ? "opacity-40 cursor-not-allowed bg-gray-100" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isInactive}
                    onChange={() => !isInactive && handleFacilityToggle(fac.id)}
                    className="accent-[#506147]"
                  />
                  <span className="material-symbols-outlined text-[18px] text-[#506147]">
                    {getFacilityIcon(fac.name, fac.icon, "bed")}
                  </span>
                  <span className="truncate">{getFacilityDisplayName(fac)}</span>
                  {fac.category && (
                    <span className="text-[9px] text-[#757870] ml-auto px-1.5 py-0.5 bg-[#E5E1DA] rounded-full">
                      {fac.category === "Room" ? "Room" : "Bath"}
                    </span>
                  )}
                  {isInactive && (
                    <span className="text-[9px] text-[#ba1a1a] ml-auto uppercase font-bold">
                      Inactive
                    </span>
                  )}
                </label>
              );
              })}
            {roomFacilities.filter((fac) => matchesFacilitySearch(fac, facilitySearch)).length === 0 && !isLoadingFacilities && (
              <p className="col-span-full py-5 text-center text-xs text-[#6B6E6A]">
                Fasilitas tidak ditemukan.
              </p>
            )}
          </div>
        </div>

        {/* SECTION 5: ROOM PHOTOS */}
        <div className="space-y-6 pt-4 border-t border-[#E5E1DA]">
          <div className="border-b border-[#E5E1DA] pb-3">
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
              5. Room Photos
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              Unggah foto kamar untuk menampilkan pratinjau visual bagi calon tamu.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#c4c8be] hover:border-[#506147] rounded-xl p-8 text-center bg-[#fcf9f5] hover:bg-[#f6f3ef] transition-colors cursor-pointer flex flex-col items-center justify-center group"
          >
            <span className="material-symbols-outlined text-4xl text-[#506147] group-hover:scale-110 transition-transform mb-2">
              cloud_upload
            </span>
            <p className="text-sm font-semibold text-[#2D312C]">
              Click to upload or drag and drop room photos
            </p>
            <p className="text-xs text-[#6B6E6A] mt-1">
              SVG, PNG, JPG or WEBP (Max. 5MB per file)
            </p>
          </div>

          {/* Photo Gallery Grid */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {formData.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E1DA] group shadow-sm"
                >
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-[#ba1a1a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer Buttons */}
        <div className="pt-6 border-t border-[#E5E1DA] flex items-center justify-end gap-3">
          <Link
            to="/admin/rooms"
            className="px-6 py-2.5 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-2 disabled:bg-[#a2ba9c]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Room...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Room</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}