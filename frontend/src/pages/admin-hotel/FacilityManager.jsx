import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

const ICON_OPTIONS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "pool", label: "Swimming Pool" },
  { value: "restaurant", label: "Restaurant" },
  { value: "local_parking", label: "Parking" },
  { value: "fitness_center", label: "Fitness Center / Gym" },
  { value: "ac_unit", label: "Air Conditioning" },
  { value: "tv", label: "Smart TV" },
  { value: "kitchen", label: "Mini Refrigerator" },
  { value: "bathtub", label: "Bathroom / Bathtub" },
  { value: "balcony", label: "Balcony" },
  { value: "hot_tub", label: "Spa & Massage" },
  { value: "local_laundry_service", label: "Laundry" },
  { value: "elevator", label: "Lift / Elevator" },
  { value: "concierge", label: "Reception 24h" },
  { value: "hotel", label: "Hotel General" },
  { value: "bed", label: "Bed / Room" },
  { value: "shower", label: "Shower" },
  { value: "water_drop", label: "Water / Mineral Water" },
  { value: "desk", label: "Work Desk" },
  { value: "checkroom", label: "Closet / Wardrobe" },
  { value: "local_bar", label: "Bar & Lounge" },
  { value: "room_service", label: "Room Service" },
  { value: "lock", label: "Safety Box" },
  { value: "local_cafe", label: "Coffee Maker" },
];

const FACILITY_ICON_MAP = {
  "Wi-Fi": "wifi",
  "Wi-Fi Gratis": "wifi",
  "High-Speed Wi-Fi (All Areas)": "wifi",
  "Kolam Renang": "pool",
  "Outdoor Swimming Pool": "pool",
  "Swimming Pool": "pool",
  "Parkir": "local_parking",
  "Parkir Gratis": "local_parking",
  "Guest Parking Area": "local_parking",
  "Restoran": "restaurant",
  "Restaurant & Fine Dining": "restaurant",
  "Gym": "fitness_center",
  "Pusat Kebugaran": "fitness_center",
  "Wellness Gym Center": "fitness_center",
  "Fitness Center": "fitness_center",
  "Spa": "hot_tub",
  "Spa & Massage": "hot_tub",
  "Spa & Wellness": "hot_tub",
  "Resepsionis 24 Jam": "concierge",
  "Resepsionis 24h": "concierge",
  "Front Desk 24h": "concierge",
  "Reception 24h": "concierge",
  "24-Hour Front Desk": "concierge",
  "Lift": "elevator",
  "Elevator": "elevator",
  "Laundry": "local_laundry_service",
  "Laundry Service": "local_laundry_service",
  "AC Area Umum": "ac_unit",
  "AC Public Area": "ac_unit",
  "AC": "ac_unit",
  "Air Conditioning": "ac_unit",
  "TV": "tv",
  "Smart TV": "tv",
  "TV LED 43 inch": "tv",
  "Television": "tv",
  "Kamar Mandi Pribadi": "bathtub",
  "Private Bathroom": "bathtub",
  "Bathtub": "bathtub",
  "Balkon": "balcony",
  "Private Balcony": "balcony",
  "Mini Fridge": "kitchen",
  "Mini Refrigerator": "kitchen",
  "Kulkas Mini": "kitchen",
  "Pengering Rambut": "lotion",
  "Meja Kerja": "desk",
  "Work Desk": "desk",
  "Lemari": "checkroom",
  "Wardrobe": "checkroom",
  "Closet": "checkroom",
  "Lemari Pakaian": "checkroom",
  "Brankas Kamar": "lock",
  "Safety Box": "lock",
  "In-Room Safe": "lock",
  "Air Mineral": "water_drop",
  "Mineral Water": "water_drop",
  "Pembuat Teh/Kopi": "local_cafe",
  "Coffee Maker": "local_cafe",
  "Coffee & Tea Maker": "local_cafe",
  "Water Heater": "water_drop",
  "Shower": "shower",
  "Peralatan Mandi Gratis": "bathtub",
  "Free Toiletries": "bathtub",
  "Bar & Lounge": "local_bar",
  "Room Service": "room_service",
  "Hotel General": "hotel",
  "Hotel Umum": "hotel",
  "Bed / Room": "bed",
  "Tempat Tidur": "bed",
};

const resolveIcon = (facilityName, fallback = "hotel") => {
  if (!facilityName) return fallback;
  const key = Object.keys(FACILITY_ICON_MAP).find(
    (k) => facilityName.toLowerCase() === k.toLowerCase()
  );
  if (key) return FACILITY_ICON_MAP[key];
  const partial = Object.keys(FACILITY_ICON_MAP).find(
    (k) =>
      facilityName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(facilityName.toLowerCase())
  );
  return partial ? FACILITY_ICON_MAP[partial] : fallback;
};

const todayStr = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function FacilityManager() {
  const [activeTab, setActiveTab] = useState("hotel");
  const [hotelFacilities, setHotelFacilities] = useState([]);
  const [roomFacilities, setRoomFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data: resData } = await cachedGet("/facilities", {}, forceRefresh);
      if (resData && resData.data && Array.isArray(resData.data)) {
        const mapFacility = (f, fallbackIcon) => ({
          id: f.id,
          name: f.name,
          description: f.description || "",
          status: "active",
          icon: f.icon || resolveIcon(f.name, fallbackIcon),
          updatedAt: todayStr(),
          category: f.category,
        });

        const hotelList = resData.data
          .filter((f) => f.category === "Hotel")
          .map((f) => mapFacility(f, "hotel"));
        const roomList = resData.data
          .filter((f) => f.category === "Room" || f.category === "Bathroom")
          .map((f) => mapFacility(f, "bed"));

        setHotelFacilities(hotelList);
        setRoomFacilities(roomList);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat daftar fasilitas.");
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalMode, setModalMode] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    icon: "wifi",
    description: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentFacilities =
    activeTab === "hotel" ? hotelFacilities : roomFacilities;

  const filteredFacilities = currentFacilities.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setFormValues({
      name: "",
      icon: activeTab === "hotel" ? "wifi" : "ac_unit",
      description: "",
      status: "active",
    });
    setErrors({});
    setSelectedFacility(null);
    setModalMode("add");
  };

  const handleOpenEditModal = (facility) => {
    setSelectedFacility(facility);
    setFormValues({
      name: facility.name,
      icon: facility.icon || (activeTab === "hotel" ? "wifi" : "ac_unit"),
      description: facility.description || "",
      status: facility.status || "active",
    });
    setErrors({});
    setModalMode("edit");
  };

  const handleOpenDeleteModal = (facility) => {
    setSelectedFacility(facility);
    setModalMode("delete");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedFacility(null);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.name.trim()) {
      newErrors.name = "Facility name is required.";
    }
    if (!formValues.icon) {
      newErrors.icon = "Please select an icon.";
    }
    return newErrors;
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const category = activeTab === "hotel" ? "Hotel" : "Room";
      const payload = {
        name: formValues.name.trim(),
        category,
      };

      if (modalMode === "add") {
        await api.post("/facilities", payload);
        toast.success(
          activeTab === "hotel"
            ? "Hotel facility created successfully."
            : "Room facility created successfully."
        );
      } else if (modalMode === "edit" && selectedFacility) {
        await api.put(`/facilities/${selectedFacility.id}`, payload);
        toast.success(
          activeTab === "hotel"
            ? "Hotel facility updated successfully."
            : "Room facility updated successfully."
        );
      }

      invalidateCache("/facilities");
      await fetchFacilities(true);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Gagal menyimpan fasilitas. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFacility = async () => {
    if (!selectedFacility) return;
    setIsSubmitting(true);

    try {
      await api.delete(`/facilities/${selectedFacility.id}`);
      toast.success(
        activeTab === "hotel"
          ? "Hotel facility deleted successfully."
          : "Room facility deleted successfully."
      );
      invalidateCache("/facilities");
      await fetchFacilities(true);
      handleCloseModal();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Gagal menghapus fasilitas. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#506147]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Facilities
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Manage facilities available at your hotel and rooms.
          </p>
        </div>

        <div className="flex items-center bg-[#f0ede9] p-1.5 rounded-xl border border-[#E5E1DA]">
          <button
            onClick={() => {
              setActiveTab("hotel");
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "hotel"
                ? "bg-[#506147] text-white shadow-sm"
                : "text-[#6B6E6A] hover:text-[#2D312C]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">hotel</span>
            Hotel Facilities
          </button>
          <button
            onClick={() => {
              setActiveTab("room");
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "room"
                ? "bg-[#506147] text-white shadow-sm"
                : "text-[#6B6E6A] hover:text-[#2D312C]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bed</span>
            Room Facilities
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1DA] pb-6">
          <div>
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
              {activeTab === "hotel" ? "Hotel Facilities" : "Room Facilities"}
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              {activeTab === "hotel"
                ? "Kelola fasilitas yang tersedia di seluruh area properti hotel."
                : "Kelola fasilitas yang tersedia di dalam kamar tamu."}
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#506147] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + Add Facility
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facilities..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-[#6B6E6A] shrink-0">
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="border border-[#E5E1DA] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider w-16">
                    Icon
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    Facility Name
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider hidden md:table-cell">
                    Category
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider hidden sm:table-cell">
                    Updated At
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5E1DA] text-sm bg-white">
                {filteredFacilities.length > 0 ? (
                  filteredFacilities.map((facility) => (
                    <tr
                      key={facility.id}
                      className="hover:bg-[#A8BBA2]/10 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-full bg-[#f0ede9] text-[#506147] flex items-center justify-center border border-[#E5E1DA] shrink-0">
                          <span className="material-symbols-outlined text-[22px]">
                            {facility.icon || "pool"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">
                        {facility.name}
                      </td>

                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2EBE1] text-[#6B6E6A] border border-[#E5E1DA]">
                          {facility.category ||
                            (activeTab === "hotel" ? "Hotel" : "Room")}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {facility.status === "active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4EBE0] text-[#4A5D43]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0EDE9] text-[#6B6E6A] border border-[#E5E1DA]">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-[#6B6E6A] whitespace-nowrap hidden sm:table-cell">
                        {facility.updatedAt}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(facility)}
                            className="p-1.5 text-[#506147] hover:bg-[#f0ede9] rounded-lg transition-colors"
                            title="Edit Facility"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(facility)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                            title="Delete Facility"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-[#6B6E6A]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-[48px] text-[#c4c8be]">
                          search_off
                        </span>
                        <div>
                          <p className="font-semibold text-[#2D312C] text-base">
                            {currentFacilities.length === 0
                              ? activeTab === "hotel"
                                ? "Belum ada fasilitas hotel."
                                : "Belum ada fasilitas kamar."
                              : "Tidak ada fasilitas yang ditemukan."}
                          </p>
                          <p className="text-xs text-[#6B6E6A] mt-1">
                            {currentFacilities.length === 0
                              ? "Tambahkan fasilitas baru untuk melengkapi daftar fasilitas."
                              : "Tidak ada fasilitas yang cocok dengan filter pencarian Anda."}
                          </p>
                        </div>

                        {searchQuery || statusFilter !== "all" ? (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                            }}
                            className="mt-2 px-4 py-2 bg-[#f0ede9] text-[#2D312C] rounded-lg text-xs font-semibold hover:bg-[#e5e2de] transition-colors"
                          >
                            Clear Search
                          </button>
                        ) : (
                          <button
                            onClick={handleOpenAddModal}
                            className="mt-2 px-5 py-2.5 bg-[#506147] text-white rounded-lg text-xs font-semibold hover:bg-[#3b4b33] transition-colors"
                          >
                            + Add Facility
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#fcf9f5]">
              <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                {modalMode === "add"
                  ? activeTab === "hotel"
                    ? "Add Hotel Facility"
                    : "Add Room Facility"
                  : activeTab === "hotel"
                  ? "Edit Hotel Facility"
                  : "Edit Room Facility"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-[#6B6E6A] hover:text-[#2D312C] p-1 rounded-full hover:bg-[#eae8e4] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Contoh: Wi-Fi, AC, Kolam Renang"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Select Icon *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-4 border border-[#E5E0D8] rounded-lg bg-[#fcf9f5]">
                  {ICON_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all min-h-[88px] ${
                        formValues.icon === opt.value
                          ? "border-[#506147] bg-[#E4EBE0] text-[#4A5D43] shadow-sm ring-2 ring-[#506147]/10"
                          : "border-[#E5E1DA] bg-white hover:bg-[#f0ede9] text-[#2D312C] hover:border-[#d4d0c6]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="icon"
                        value={opt.value}
                        checked={formValues.icon === opt.value}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E1DA] flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[22px] leading-none text-[#506147]">
                          {opt.value}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight break-words w-full">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.icon && (
                  <span className="text-xs text-[#ba1a1a] font-medium">
                    {errors.icon}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formValues.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Deskripsi singkat mengenai fasilitas ini..."
                  className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Category (Auto)
                </label>
                <div className="px-4 py-2.5 rounded-lg bg-[#F2EBE1] border border-[#E5E1DA] text-xs font-semibold text-[#434842]">
                  {activeTab === "hotel" ? "Hotel" : "Room"} — otomatis
                  disesuaikan dengan tab yang aktif.
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Status
                </label>
                <div className="flex gap-4 items-center pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2D312C] cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formValues.status === "active"}
                      onChange={handleInputChange}
                      className="accent-[#506147]"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2D312C] cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formValues.status === "inactive"}
                      onChange={handleInputChange}
                      className="accent-[#506147]"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-all shadow-sm flex items-center gap-2 disabled:bg-[#a2ba9c]"
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Save Facility"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "delete" && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  warning
                </span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  {activeTab === "hotel"
                    ? "Delete Hotel Facility?"
                    : "Delete Room Facility?"}
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#2D312C]">
                    &quot;{selectedFacility.name}&quot;
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFacility}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
