import React, { useState } from "react";
import toast from "react-hot-toast";

// Icon selector options
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
  { value: "coffee_maker", label: "Coffee Maker" },
  { value: "spa", label: "Spa & Massage" },
  { value: "local_bar", label: "Bar & Lounge" },
  { value: "room_service", label: "Room Service" },
  { value: "hot_tub", label: "Hot Tub / Jacuzzi" },
  { value: "security", label: "Safety Box" },
];

const initialHotelFacilities = [
  {
    id: "h-1",
    name: "Free High-Speed Wi-Fi",
    description: "Free Wi-Fi available throughout the hotel.",
    status: "active",
    icon: "wifi",
    updatedAt: "24 Oct 2023",
  },
  {
    id: "h-2",
    name: "Outdoor Swimming Pool",
    description: "Outdoor swimming pool for hotel guests.",
    status: "active",
    icon: "pool",
    updatedAt: "24 Oct 2023",
  },
  {
    id: "h-3",
    name: "Restaurant & Fine Dining",
    description: "Restaurant serving breakfast, lunch, and dinner.",
    status: "active",
    icon: "restaurant",
    updatedAt: "22 Oct 2023",
  },
  {
    id: "h-4",
    name: "Guest Parking Area",
    description: "Parking area available for hotel guests.",
    status: "active",
    icon: "local_parking",
    updatedAt: "20 Oct 2023",
  },
  {
    id: "h-5",
    name: "Wellness Gym Center",
    description: "Fitness center available for hotel guests.",
    status: "inactive",
    icon: "fitness_center",
    updatedAt: "15 Oct 2023",
  },
];

const initialRoomFacilities = [
  {
    id: "r-1",
    name: "Air Conditioning",
    description: "Air conditioning available in the room.",
    status: "active",
    icon: "ac_unit",
    updatedAt: "24 Oct 2023",
  },
  {
    id: "r-2",
    name: "Smart Television (65\")",
    description: "Smart TV available in the room with streaming services.",
    status: "active",
    icon: "tv",
    updatedAt: "24 Oct 2023",
  },
  {
    id: "r-3",
    name: "Mini Refrigerator",
    description: "Mini refrigerator available in selected rooms.",
    status: "active",
    icon: "kitchen",
    updatedAt: "22 Oct 2023",
  },
  {
    id: "r-4",
    name: "Private Bathroom",
    description: "Private bathroom with luxury organic amenities.",
    status: "active",
    icon: "bathtub",
    updatedAt: "20 Oct 2023",
  },
  {
    id: "r-5",
    name: "Private Balcony",
    description: "Private balcony available in selected rooms.",
    status: "inactive",
    icon: "balcony",
    updatedAt: "15 Oct 2023",
  },
];

export default function FacilityManager() {
  // Tab State: 'hotel' | 'room'
  const [activeTab, setActiveTab] = useState("hotel");

  // Local Data State
  const [hotelFacilities, setHotelFacilities] = useState(initialHotelFacilities);
  const [roomFacilities, setRoomFacilities] = useState(initialRoomFacilities);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete' | null
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    icon: "wifi",
    description: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine active dataset
  const currentFacilities =
    activeTab === "hotel" ? hotelFacilities : roomFacilities;

  // Filtered dataset
  const filteredFacilities = currentFacilities.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Modal Actions
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
      icon: facility.icon || "wifi",
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

  // Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form Validation
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

  // Handle Save (Add & Edit)
  const handleSaveFacility = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (modalMode === "add") {
        const newFacility = {
          id: `${activeTab[0]}-${Date.now()}`,
          name: formValues.name.trim(),
          icon: formValues.icon,
          description: formValues.description.trim(),
          status: formValues.status,
          updatedAt: todayStr,
        };

        if (activeTab === "hotel") {
          setHotelFacilities((prev) => [newFacility, ...prev]);
          toast.success("Hotel facility created successfully.");
        } else {
          setRoomFacilities((prev) => [newFacility, ...prev]);
          toast.success("Room facility created successfully.");
        }
      } else if (modalMode === "edit" && selectedFacility) {
        const updatedFacility = {
          ...selectedFacility,
          name: formValues.name.trim(),
          icon: formValues.icon,
          description: formValues.description.trim(),
          status: formValues.status,
          updatedAt: todayStr,
        };

        if (activeTab === "hotel") {
          setHotelFacilities((prev) =>
            prev.map((item) =>
              item.id === selectedFacility.id ? updatedFacility : item
            )
          );
          toast.success("Hotel facility updated successfully.");
        } else {
          setRoomFacilities((prev) =>
            prev.map((item) =>
              item.id === selectedFacility.id ? updatedFacility : item
            )
          );
          toast.success("Room facility updated successfully.");
        }
      }

      handleCloseModal();
    }, 500);
  };

  // Handle Delete Confirmation
  const handleDeleteFacility = () => {
    if (!selectedFacility) return;

    setIsSubmitting(true);

    setTimeout(() => {
      if (activeTab === "hotel") {
        setHotelFacilities((prev) =>
          prev.filter((item) => item.id !== selectedFacility.id)
        );
        toast.success("Hotel facility deleted successfully.");
      } else {
        setRoomFacilities((prev) =>
          prev.filter((item) => item.id !== selectedFacility.id)
        );
        toast.success("Room facility deleted successfully.");
      }
      handleCloseModal();
    }, 400);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-['Hanken_Grotesk',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Facilities
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Manage facilities available at your hotel and rooms.
          </p>
        </div>

        {/* Segmented Control / Tab Buttons */}
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

      {/* Tab Sub-Header & Primary Action Button */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1DA] pb-6">
          <div>
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
              {activeTab === "hotel" ? "Hotel Facilities" : "Room Facilities"}
            </h3>
            <p className="text-xs text-[#6B6E6A] mt-0.5">
              {activeTab === "hotel"
                ? "Manage facilities available throughout the hotel property."
                : "Manage facilities available inside guest rooms."}
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

        {/* Search and Status Filter Bar */}
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

        {/* Facilities Table Card */}
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
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
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

                      <td className="p-4 text-[#6B6E6A] text-xs max-w-xs leading-relaxed">
                        {facility.description || "—"}
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

                      <td className="p-4 text-xs text-[#6B6E6A] whitespace-nowrap">
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
                                ? "No hotel facilities yet."
                                : "No room facilities yet."
                              : "No facilities found."}
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD & EDIT FACILITY                                              */}
      {/* ========================================================================= */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
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

            {/* Modal Form */}
            <form onSubmit={handleSaveFacility} className="p-6 space-y-5">
              {/* Field 1: Name */}
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
                  placeholder="Contoh: Free Wi-Fi, Air Conditioning"
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

              {/* Field 2: Icon Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#434842] uppercase tracking-wider">
                  Select Icon *
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 border border-[#E5E0D8] rounded-lg bg-[#fcf9f5]">
                  {ICON_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                        formValues.icon === opt.value
                          ? "border-[#506147] bg-[#E4EBE0] text-[#4A5D43]"
                          : "border-[#E5E1DA] bg-white hover:bg-[#f0ede9] text-[#2D312C]"
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
                      <span className="material-symbols-outlined text-[20px]">
                        {opt.value}
                      </span>
                      <span className="text-xs font-medium truncate">
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

              {/* Field 3: Description */}
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

              {/* Field 4: Status */}
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

              {/* Modal Actions */}
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
                  {isSubmitting ? "Saving..." : modalMode === "add" ? "Save Facility" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
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