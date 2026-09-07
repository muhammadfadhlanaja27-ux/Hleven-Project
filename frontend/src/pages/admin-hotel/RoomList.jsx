import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

const normalizeImageUrl = (value) => {
  if (!value) return "";
  let str = String(value).trim();
  if (!str) return "";

  if (str.includes("storage.supabase.co/storage/v1/s3")) {
    str = str.replace(".storage.supabase.co/storage/v1/s3", ".supabase.co/storage/v1/object/public");
  } else if (str.includes("/storage/v1/s3")) {
    str = str.replace("/storage/v1/s3", "/storage/v1/object/public");
  }

  if (/^https?:\/\//i.test(str) || /^data:/i.test(str)) return str;
  if (str.startsWith("/")) return `http://localhost:8000${str}`;
  if (str.startsWith("storage/")) return `http://localhost:8000/${str}`;
  if (str.startsWith("public/")) return `http://localhost:8000/storage/${str.replace(/^public\//, "")}`;
  return `http://localhost:8000/storage/${str.replace(/^\/+/, "")}`;
};

const fmtRupiah = (val) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

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
  "Parkir": "local_parking",
  "Parking": "local_parking",
  "Restoran": "restaurant",
  "Restaurant": "restaurant",
  "Gym": "fitness_center",
  "Fitness Center": "fitness_center",
  "Pusat Kebugaran": "fitness_center",
  "Spa": "hot_tub",
  "Spa & Massage": "hot_tub",
  "Resepsionis 24 jam": "concierge",
  "Reception 24h": "concierge",
  "Front Desk 24h": "concierge",
  "Lift": "elevator",
  "Elevator": "elevator",
  "Laundry": "local_laundry_service",
  "Laundry Service": "local_laundry_service",
  "Safety Box": "lock",
  "Brankas Kamar": "lock",
  "Coffee Maker": "local_cafe",
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

const normalizeRoom = (r) => {
  let photos = [];
  if (Array.isArray(r.photos)) {
    photos = r.photos.map((p) => {
      const imgPath = p.photo || p.image_path || p.url || "";
      return {
        id: p.id,
        url: normalizeImageUrl(imgPath),
        name: p.name || (imgPath ? imgPath.split("/").pop() : "room.jpg"),
      };
    });
  }

  const facIds = Array.isArray(r.facilities)
    ? r.facilities.map((f) => f.id)
    : r.facilityIds || [];

  return {
    id: r.id,
    name: r.name || "",
    type: r.type || (
      r.name?.toLowerCase().includes("suite")
        ? "Suite"
        : r.name?.toLowerCase().includes("deluxe")
        ? "Deluxe"
        : "Standard"
    ),
    bed: r.bed || "",
    description: r.description || "",
    weekday_price: Number(r.weekday_price || 0),
    weekend_price: Number(r.weekend_price || 0),
    capacity: Number(r.capacity_adult || r.capacity || 2),
    capacity_adult: Number(r.capacity_adult || 2),
    capacity_child: Number(r.capacity_child || 0),
    stock: Number(r.stock || 0),
    occupied: Number(r.occupied || 0),
    facilityIds: facIds,
    facilities: r.facilities || [],
    photos: photos,
    status: Number(r.stock || 0) > 0 ? "Available" : "Occupied",
  };
};

export default function RoomList() {
  const navigate = useNavigate();

  // State Management
  const [rooms, setRooms] = useState([]);
  const [roomFacilities, setRoomFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [viewingRoom, setViewingRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const photoInputRef = useRef(null);

  // Edit Form Values & Errors
  const [editValues, setEditValues] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editNewPhotoFiles, setEditNewPhotoFiles] = useState([]); // raw File objects untuk upload baru
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, facilitiesRes] = await Promise.allSettled([
        api.get("/admin/rooms"),
        cachedGet("/facilities"),
      ]);

      if (roomsRes.status === "fulfilled" && roomsRes.value?.data) {
        const rawRooms =
          roomsRes.value.data.data || roomsRes.value.data || [];
        setRooms(Array.isArray(rawRooms) ? rawRooms.map(normalizeRoom) : []);
      }
      if (facilitiesRes.status === "fulfilled") {
        const payload = facilitiesRes.value?.data ?? facilitiesRes.value ?? [];
        const rawFac = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const filtered = Array.isArray(rawFac)
          ? rawFac.filter((f) => f.category === "Room" || f.category === "Bathroom")
          : [];
        setRoomFacilities(filtered);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data kamar dari server.");
    } finally {
      setLoading(false);
    }
  };

  // Map Facility IDs to Objects
  const getFacilitiesForRoom = (facilityIds = []) => {
    return facilityIds
      .map((id) => roomFacilities.find((f) => f.id === id))
      .filter(Boolean);
  };

  // Filtering Logic
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ? true : room.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ? true : room.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesCapacity = true;
    if (capacityFilter === "1") matchesCapacity = room.capacity === 1;
    else if (capacityFilter === "2") matchesCapacity = room.capacity === 2;
    else if (capacityFilter === "3") matchesCapacity = room.capacity === 3;
    else if (capacityFilter === "4+") matchesCapacity = room.capacity >= 4;

    return matchesSearch && matchesType && matchesStatus && matchesCapacity;
  });

  // Sorting Logic
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "available") {
      aVal = a.stock - a.occupied;
      bVal = b.stock - b.occupied;
    }

    if (typeof aVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedRooms.length / itemsPerPage) || 1;
  const paginatedRooms = sortedRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Edit Modal Open
  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setEditNewPhotoFiles([]);
    setDeletedPhotoIds([]);
    setEditValues({
      name: room.name,
      type: room.type || "Standard",
      bed: room.bed || "",
      description: room.description || "",
      weekday_price: room.weekday_price,
      weekend_price: room.weekend_price,
      capacity_adult: room.capacity_adult || room.capacity || 2,
      capacity_child: room.capacity_child || 0,
      stock: room.stock,
      occupied: room.occupied || 0,
      facilityIds: room.facilityIds || [],
      photos: room.photos || [],
      status: room.status || "Available",
    });
    setEditErrors({});
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  // Edit Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Edit Facility Checkbox
  const handleEditFacilityToggle = (facilityId) => {
    setEditValues((prev) => {
      const currentIds = prev.facilityIds || [];
      const updatedIds = currentIds.includes(facilityId)
        ? currentIds.filter((id) => id !== facilityId)
        : [...currentIds, facilityId];
      return { ...prev, facilityIds: updatedIds };
    });
  };

  // Edit Photo Upload — simpan file asli dan preview URL
  const handleEditPhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = files.map((file, idx) => ({
      id: `p-new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file,
      isNew: true,
      is_thumbnail: true,
    }));

    setEditNewPhotoFiles((prev) => [...prev, ...files]);

    setEditValues((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos].map((photo, index, arr) => {
        if (photo.isNew) {
          return { ...photo, is_thumbnail: index === arr.length - 1 };
        }
        return { ...photo, is_thumbnail: false };
      }),
    }));
    toast.success(`${files.length} foto berhasil ditambahkan!`);
  };

  // Remove Photo from Edit Form
  const handleRemovePhoto = (photoId) => {
    setEditValues((prev) => {
      const removed = (prev.photos || []).find((p) => p.id === photoId);
      if (removed?.isNew) {
        setEditNewPhotoFiles((files) =>
          files.filter((f) => f.name !== removed.name)
        );
      } else if (removed && removed.id && !String(removed.id).startsWith("p-new-")) {
        setDeletedPhotoIds((prevIds) => {
          if (prevIds.includes(removed.id)) return prevIds;
          return [...prevIds, removed.id];
        });
      }
      return {
        ...prev,
        photos: (prev.photos || []).filter((p) => p.id !== photoId),
      };
    });
    toast.success("Foto dihapus.");
  };

  // Save Edit Submit — kirim semua perubahan ke API termasuk facilities dan foto baru
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!editValues.name.trim()) errs.name = "Room name is required.";
    if (!editValues.weekday_price || Number(editValues.weekday_price) <= 0)
      errs.weekday_price = "Weekday price must be greater than 0.";
    if (!editValues.weekend_price || Number(editValues.weekend_price) <= 0)
      errs.weekend_price = "Weekend price must be greater than 0.";
    if (!editValues.capacity_adult || Number(editValues.capacity_adult) < 1)
      errs.capacity_adult = "Adult capacity must be at least 1.";
    if (!editValues.stock || Number(editValues.stock) < 1)
      errs.stock = "Stock must be at least 1.";

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setIsSaving(true);

    try {
      const currentExistingIds = (editingRoom.photos || []).map((p) => p.id);
      const currentPhotoIds = (editValues.photos || [])
        .filter((p) => !p.isNew)
        .map((p) => p.id);
      const photosToDelete = currentExistingIds.filter((id) => !currentPhotoIds.includes(id));
      const photosToUpload = (editValues.photos || [])
        .filter((p) => p.isNew && p.file)
        .map((p) => p.file);

      const payload = new FormData();
      payload.append("_method", "PUT");
      payload.append("name", editValues.name.trim());
      payload.append("type", editValues.type || "Standard");
      payload.append("bed", editValues.bed || "");
      payload.append("description", editValues.description?.trim() || "");
      payload.append("weekday_price", Number(editValues.weekday_price));
      payload.append("weekend_price", Number(editValues.weekend_price));
      payload.append("capacity_adult", Number(editValues.capacity_adult));
      payload.append("capacity_child", Number(editValues.capacity_child || 0));
      payload.append("stock", Number(editValues.stock));

      const facilityIds = editValues.facilityIds || [];
      if (facilityIds.length === 0) {
        payload.append("facilities", "");
      } else {
        facilityIds.forEach((fId, idx) => {
          payload.append(`facilities[${idx}]`, fId);
        });
      }

      for (const photoId of photosToDelete) {
        try {
          await api.delete(`/room-photos/${photoId}`);
        } catch (deleteErr) {
          console.error("Failed to delete room photo:", deleteErr);
        }
      }

      photosToUpload.forEach((file) => {
        payload.append("photos[]", file);
      });

      await api.post(`/admin/rooms/${editingRoom.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Room updated successfully.");
      // Hapus cache hotel agar halaman user (HotelDetail/RoomDetail) menampilkan data terbaru
      invalidateCache("/hotels");
      setEditingRoom(null);
      setEditNewPhotoFiles([]);
      setDeletedPhotoIds([]);
      loadData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.errors
        ? Object.values(error.response.data.errors || {}).flat().join(", ")
        : "Failed to update room.";
      toast.error(typeof msg === "string" ? msg : "Failed to update room.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Room Action
  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;

    setIsSaving(true);
    try {
      await api.delete(`/admin/rooms/${deletingRoom.id}`);
      toast.success("Room deleted successfully.");
      invalidateCache("/hotels");
      setDeletingRoom(null);
      if (viewingRoom && viewingRoom.id === deletingRoom.id) {
        setViewingRoom(null);
      }
      loadData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to delete room.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Rooms
          </h2>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Manage rooms, pricing, availability, and facilities.
          </p>
        </div>

        <Link
          to="/admin/rooms/create"
          className="bg-[#506147] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3b4b33] transition-all shadow-sm hover:shadow active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          + Add Room
        </Link>
      </div>

      {/* Search, Filter & Sort Controls Card */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757870] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-sm text-[#2D312C] focus:outline-none focus:border-[#506147] focus:ring-2 focus:ring-[#506147]/20 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Room Type */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>

            {/* Capacity */}
            <select
              value={capacityFilter}
              onChange={(e) => {
                setCapacityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="all">Capacity: All</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4+">4+ Guests</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#fcf9f5] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#2D312C] focus:outline-none focus:border-[#506147] transition-all cursor-pointer"
            >
              <option value="name">Sort: Room Name</option>
              <option value="weekday_price">Sort: Weekday Price</option>
              <option value="weekend_price">Sort: Weekend Price</option>
              <option value="capacity">Sort: Capacity</option>
              <option value="available">Sort: Available Stock</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-[#E5E0D8] bg-[#fcf9f5] rounded-lg text-[#2D312C] hover:bg-[#f0ede9] transition-colors"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Room Table Card */}
      <div className="bg-white rounded-xl border border-[#E5E1DA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EBE1] border-b border-[#E5E1DA]">
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Room
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Room Type
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Bed Type
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Weekday Price
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Weekend Price
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Capacity
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Stock
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Available
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Facilities
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E1DA] text-sm">
              {paginatedRooms.length > 0 ? (
                paginatedRooms.map((room) => {
                  const availableStock = Math.max(0, room.stock - (room.occupied || 0));
                  const assignedFacilities = getFacilitiesForRoom(room.facilityIds);
                  const firstPhoto = room.photos?.[0]?.url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80";

                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-[#A8BBA2]/10 transition-colors"
                    >
                      {/* Room Thumbnail & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstPhoto}
                            alt={room.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#E5E1DA] shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#2D312C] text-sm leading-tight">
                              {room.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[#6B6E6A]">
                              {assignedFacilities.slice(0, 3).map((f) => (
                                <span
                                  key={f.id}
                                  className="material-symbols-outlined text-[15px]"
                                  title={f.name}
                                >
                                  {f.icon || "star"}
                                </span>
                              ))}
                              {assignedFacilities.length > 3 && (
                                <span className="text-[10px] font-semibold text-[#6B6E6A]">
                                  +{assignedFacilities.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Room Type */}
                      <td className="p-4 text-[#6B6E6A] font-medium whitespace-nowrap">
                        {room.type}
                      </td>

                      {/* Bed Type */}
                      <td className="p-4 text-[#6B6E6A] font-medium whitespace-nowrap">
                        {room.bed ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-[#506147]">bed</span>
                            {room.bed}
                          </span>
                        ) : (
                          <span className="text-xs text-[#6B6E6A]">—</span>
                        )}
                      </td>

                      {/* Weekday Price */}
                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">
                        {fmtRupiah(room.weekday_price)}
                      </td>

                      {/* Weekend Price */}
                      <td className="p-4 font-semibold text-[#506147] whitespace-nowrap">
                        {fmtRupiah(room.weekend_price)}
                      </td>

                      {/* Capacity */}
                      <td className="p-4 text-[#6B6E6A] whitespace-nowrap">
                        {room.capacity} Guests
                      </td>

                      {/* Stock */}
                      <td className="p-4 font-semibold text-[#2D312C] whitespace-nowrap">
                        {room.stock}
                      </td>

                      {/* Available Stock */}
                      <td className="p-4 font-bold text-[#506147] whitespace-nowrap">
                        {availableStock}
                      </td>

                      {/* Facilities Badges */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {assignedFacilities.length > 0 ? (
                            assignedFacilities.slice(0, 2).map((fac) => (
                              <span
                                key={fac.id}
                                className="bg-[#f0ede9] text-[#2D312C] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E5E1DA]"
                              >
                                {fac.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#6B6E6A]">—</span>
                          )}
                          {assignedFacilities.length > 2 && (
                            <span className="bg-[#E4EBE0] text-[#4A5D43] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              +{assignedFacilities.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        {room.status === "Available" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4EBE0] text-[#4A5D43]">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0E0] text-[#9B5235]">
                            Occupied
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRoom(room)}
                            className="p-1.5 text-[#506147] hover:bg-[#f0ede9] rounded-lg transition-colors"
                            title="View Room Detail"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(room)}
                            className="p-1.5 text-[#D48C45] hover:bg-[#fff5eb] rounded-lg transition-colors"
                            title="Edit Room"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>

                          <button
                            onClick={() => setDeletingRoom(room)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                            title="Delete Room"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="p-12 text-center text-[#6B6E6A]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-[#c4c8be]">
                        bed
                      </span>
                      <div>
                        <p className="font-semibold text-[#2D312C] text-base">
                          {rooms.length === 0 ? "No rooms yet." : "No rooms found."}
                        </p>
                        <p className="text-xs text-[#6B6E6A] mt-1">
                          {rooms.length === 0
                            ? "Mulai dengan menambahkan tipe kamar pertama Anda."
                            : "Tidak ada kamar yang cocok dengan kriteria pencarian/filter."}
                        </p>
                      </div>

                      {searchQuery ||
                      typeFilter !== "all" ||
                      statusFilter !== "all" ||
                      capacityFilter !== "all" ? (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setTypeFilter("all");
                            setStatusFilter("all");
                            setCapacityFilter("all");
                          }}
                          className="mt-2 px-4 py-2 bg-[#f0ede9] text-[#2D312C] rounded-lg text-xs font-semibold hover:bg-[#e5e2de] transition-colors"
                        >
                          Clear Search
                        </button>
                      ) : (
                        <Link
                          to="/admin/rooms/create"
                          className="mt-2 px-5 py-2.5 bg-[#506147] text-white rounded-lg text-xs font-semibold hover:bg-[#3b4b33] transition-colors"
                        >
                          + Add Room
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {sortedRooms.length > 0 && (
          <div className="p-4 border-t border-[#E5E1DA] bg-[#fcf9f5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6E6A]">
            <p>
              Showing <span className="font-semibold text-[#2D312C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-[#2D312C]">{Math.min(currentPage * itemsPerPage, sortedRooms.length)}</span> of{" "}
              <span className="font-semibold text-[#2D312C]">{sortedRooms.length}</span> rooms
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg bg-white text-[#2D312C] font-semibold hover:bg-[#f0ede9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    currentPage === idx + 1
                      ? "bg-[#506147] text-white shadow-sm"
                      : "bg-white border border-[#E5E0D8] text-[#2D312C] hover:bg-[#f0ede9]"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg bg-white text-[#2D312C] font-semibold hover:bg-[#f0ede9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ROOM DETAIL */}
      {viewingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#fcf9f5] flex justify-between items-center">
              <div>
                <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  Room Detail
                </span>
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-0.5">
                  {viewingRoom.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const r = viewingRoom;
                    setViewingRoom(null);
                    handleOpenEdit(r);
                  }}
                  className="px-4 py-2 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Room
                </button>

                <button
                  onClick={() => setViewingRoom(null)}
                  className="p-1.5 text-[#6B6E6A] hover:bg-[#eae8e4] rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="bg-[#fcf9f5] rounded-xl border border-[#E5E1DA] p-5 space-y-3">
                <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                  Room Information
                </h4>
                <p className="text-xs text-[#444840] leading-relaxed">
                  {viewingRoom.description || "Tidak ada deskripsi kamar."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E5E1DA] text-xs">
                  <div>
                    <span className="text-[#6B6E6A]">Type:</span>
                    <p className="font-semibold text-[#2D312C] mt-0.5">{viewingRoom.type}</p>
                  </div>
                  <div>
                    <span className="text-[#6B6E6A]">Bed:</span>
                    <p className="font-semibold text-[#2D312C] mt-0.5">{viewingRoom.bed || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[#6B6E6A]">Capacity:</span>
                    <p className="font-semibold text-[#2D312C] mt-0.5">{viewingRoom.capacity} Guests</p>
                  </div>
                  <div>
                    <span className="text-[#6B6E6A]">Status:</span>
                    <p className="font-semibold text-[#506147] mt-0.5">{viewingRoom.status}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[#E5E1DA] p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    Weekday Price (Senin - Kamis)
                  </span>
                  <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mt-1">
                    {fmtRupiah(viewingRoom.weekday_price)}
                  </p>
                </div>
                <div className="bg-[#F2EBE1] rounded-xl border border-[#E5E1DA] p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-[#506147] uppercase tracking-wider">
                    Weekend Price (Jumat - Minggu)
                  </span>
                  <p className="font-['Newsreader',serif] text-2xl font-semibold text-[#506147] mt-1">
                    {fmtRupiah(viewingRoom.weekend_price)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-3">
                <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                  Room Availability Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-[#fcf9f5] rounded-lg border border-[#E5E1DA]">
                    <span className="text-[11px] font-semibold text-[#6B6E6A]">Total Stock</span>
                    <p className="font-['Newsreader',serif] text-2xl font-bold text-[#2D312C] mt-1">{viewingRoom.stock}</p>
                  </div>
                  <div className="p-3 bg-[#FFF0E0] rounded-lg border border-[#E5E1DA]">
                    <span className="text-[11px] font-semibold text-[#9B5235]">Occupied</span>
                    <p className="font-['Newsreader',serif] text-2xl font-bold text-[#9B5235] mt-1">{viewingRoom.occupied || 0}</p>
                  </div>
                  <div className="p-3 bg-[#E4EBE0] rounded-lg border border-[#E5E1DA]">
                    <span className="text-[11px] font-semibold text-[#4A5D43]">Available</span>
                    <p className="font-['Newsreader',serif] text-2xl font-bold text-[#4A5D43] mt-1">
                      {Math.max(0, viewingRoom.stock - (viewingRoom.occupied || 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E1DA] p-5 shadow-sm space-y-3">
                <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                  Room Facilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getFacilitiesForRoom(viewingRoom.facilityIds).map((fac) => (
                    <span
                      key={fac.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0ede9] rounded-lg text-xs font-semibold text-[#2D312C] border border-[#E5E1DA]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#506147]">
                        {resolveFacilityIcon(fac.name)}
                      </span>
                      {fac.name}
                    </span>
                  ))}
                  {getFacilitiesForRoom(viewingRoom.facilityIds).length === 0 && (
                    <span className="text-xs text-[#6B6E6A] italic">Tidak ada fasilitas kamar yang terdaftar.</span>
                  )}
                </div>
              </div>

              {viewingRoom.photos?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-['Newsreader',serif] text-lg font-semibold text-[#2D312C]">
                    Room Photos
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewingRoom.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setPreviewPhoto(photo)}
                        className="aspect-[4/3] rounded-lg overflow-hidden border border-[#E5E1DA] cursor-pointer group relative"
                      >
                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ROOM */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-[#E5E1DA] bg-[#fcf9f5] flex justify-between items-center">
              <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                Edit Room: {editingRoom.name}
              </h3>
              <button
                onClick={() => setEditingRoom(null)}
                disabled={isSaving}
                className="p-1 text-[#6B6E6A] hover:bg-[#eae8e4] rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  1. Room Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Room Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editValues.name}
                      onChange={handleEditChange}
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                    {editErrors.name && <span className="text-xs text-[#ba1a1a]">{editErrors.name}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Room Type *</label>
                    <select
                      name="type"
                      value={editValues.type}
                      onChange={handleEditChange}
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm bg-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Bed Type</label>
                    <select
                      name="bed"
                      value={editValues.bed}
                      onChange={handleEditChange}
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm bg-white"
                    >
                      <option value="">Pilih Tipe Kasur</option>
                      <option value="1 Single Bed">Single Bed</option>
                      <option value="1 Twin Bed">Twin Bed</option>
                      <option value="1 Queen Bed">Queen Bed</option>
                      <option value="1 King Bed">King Bed</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#2D312C]">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={editValues.description}
                    onChange={handleEditChange}
                    className="p-3 border border-[#E5E0D8] rounded-lg text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E5E1DA]">
                <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  2. Room Pricing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Weekday Price (Rp) *</label>
                    <input
                      type="number"
                      name="weekday_price"
                      value={editValues.weekday_price}
                      onChange={handleEditChange}
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                    {editErrors.weekday_price && <span className="text-xs text-[#ba1a1a]">{editErrors.weekday_price}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Weekend Price (Rp) *</label>
                    <input
                      type="number"
                      name="weekend_price"
                      value={editValues.weekend_price}
                      onChange={handleEditChange}
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                    {editErrors.weekend_price && <span className="text-xs text-[#ba1a1a]">{editErrors.weekend_price}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E5E1DA]">
                <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  3. Capacity &amp; Availability
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Adult Capacity *</label>
                    <input
                      type="number"
                      name="capacity_adult"
                      value={editValues.capacity_adult}
                      onChange={handleEditChange}
                      min="1"
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                    {editErrors.capacity_adult && <span className="text-xs text-[#ba1a1a]">{editErrors.capacity_adult}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Child Capacity</label>
                    <input
                      type="number"
                      name="capacity_child"
                      value={editValues.capacity_child}
                      onChange={handleEditChange}
                      min="0"
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#2D312C]">Total Units / Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={editValues.stock}
                      onChange={handleEditChange}
                      min="1"
                      className="h-10 px-3 border border-[#E5E0D8] rounded-lg text-sm"
                    />
                    {editErrors.stock && <span className="text-xs text-[#ba1a1a]">{editErrors.stock}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E5E1DA]">
                <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                  4. Room Facilities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border border-[#E5E1DA] rounded-xl bg-[#fcf9f5]">
                  {roomFacilities.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-[#6B6E6A]">
                      Memuat daftar fasilitas kamar...
                    </div>
                  )}
                  {roomFacilities.map((fac) => {
                    const isChecked = (editValues.facilityIds || []).includes(fac.id);
                    return (
                      <label
                        key={fac.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "border-[#506147] bg-[#E4EBE0] text-[#4A5D43]"
                            : "border-[#E5E1DA] bg-white text-[#2D312C]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEditFacilityToggle(fac.id)}
                          className="accent-[#506147]"
                        />
                        <span className="material-symbols-outlined text-[16px] text-[#506147]">
                          {resolveFacilityIcon(fac.name)}
                        </span>
                        <span className="truncate">{fac.name}</span>
                        {fac.category && (
                          <span className="text-[8px] text-[#757870] ml-auto px-1 py-0.5 bg-[#E5E1DA] rounded-full">
                            {fac.category === "Room" ? "R" : "B"}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E5E1DA]">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-semibold text-[#6B6E6A] uppercase tracking-wider">
                    5. Room Photos
                  </h4>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3 py-2 bg-[#506147] text-white text-[10px] font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors"
                  >
                    + Add Photo
                  </button>
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleEditPhotoUpload}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(editValues.photos || []).map((photo) => (
                    <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E5E1DA] bg-[#fcf9f5]">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        title="Remove photo"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}

                  {(editValues.photos || []).length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-[#D5CFC3] bg-[#fcf9f5] p-6 text-center text-xs text-[#6B6E6A]">
                      Belum ada foto kamar. Tambahkan foto untuk menampilkan tampilan kamar.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  disabled={isSaving}
                  className="px-5 py-2.5 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#506147] text-white text-xs font-semibold rounded-lg hover:bg-[#3b4b33] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E5E1DA] w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="font-['Newsreader',serif] text-xl font-semibold text-[#2D312C]">
                  Delete Room?
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-[#2D312C]">&quot;{deletingRoom.name}&quot;</strong>? Action ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E1DA] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                disabled={isSaving}
                className="px-5 py-2 border border-[#c4c8be] rounded-lg text-xs font-semibold text-[#2D312C] hover:bg-[#eae8e4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="px-6 py-2 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between bg-[#fcf9f5]">
              <span className="text-sm font-semibold text-[#2D312C] truncate">
                {previewPhoto.name}
              </span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-full text-[#6B6E6A] hover:bg-[#eae8e4] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-4">
              <img src={previewPhoto.url} alt={previewPhoto.name} className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}