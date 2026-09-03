import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelCard from "../../components/landing/HotelCard";
import Pagination from "../../components/common/Pagination";
import GuestSelector from "../../components/common/GuestSelector";
import { cachedGet } from "../../services/apiCache";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";
const ITEMS_PER_PAGE = 10;

const LandingPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tanggal Default (Hari Ini & Besok) berbasis Object Date
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000), []);

  // Search Bar States
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Modal State for room addition
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [pendingAdults, setPendingAdults] = useState(2);

  // Sidebar Filter States
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Sorting & Pagination States
  const [sortBy, setSortBy] = useState("recommendation");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, checkInDate, checkOutDate, adults, children, rooms, minPrice, maxPrice, selectedStars, selectedFacilities, sortBy]);

  // Fetch Hotels with Search Params (Cached)
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (checkInDate) params.append("check_in_date", checkInDate.toISOString().split('T')[0]);
        if (checkOutDate) params.append("check_out_date", checkOutDate.toISOString().split('T')[0]);
        if (adults) params.append("adults", adults);
        if (children) params.append("children", children);
        if (rooms) params.append("rooms", rooms);

        const url = `/hotels${params.toString() ? `?${params.toString()}` : ""}`;
        const { data: responseData, fromCache } = await cachedGet(url);
        
        if (responseData && (responseData.data || Array.isArray(responseData))) {
          const apiHotels = responseData.data || responseData;
          setHotels(apiHotels);
        } else {
          setHotels([]);
        }
        if (fromCache) {
          console.debug("[Cache Hit] LandingPage hotels loaded from cache");
        }
      } catch (err) {
        console.error("Backend API Error:", err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Handler Perubahan Tanggal Check-in & Check-out (Unified Range)
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
  };

  // ponytail: hanya param yang didukung backend (search); guest/date diteruskan untuk konsistensi
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("search", searchTerm.trim());
    if (checkInDate) params.append("check_in_date", checkInDate.toISOString().split("T")[0]);
    if (checkOutDate) params.append("check_out_date", checkOutDate.toISOString().split("T")[0]);
    if (adults) params.append("adults", adults);
    if (children) params.append("children", children);
    return `/hotels${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleSearch = () => {
    navigate(buildSearchUrl());
  };

  // Filter Handlers
  const handleStarToggle = (starRating) => {
    setSelectedStars((prev) =>
      prev.includes(starRating)
        ? prev.filter((s) => s !== starRating)
        : [...prev, starRating]
    );
  };

  const handleFacilityToggle = (facilityName) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedStars([]);
    setSelectedFacilities([]);
    setSortBy("recommendation");
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
  };

  const handleGuestChange = ({ adults: newAdults, children: newChildren, rooms: newRooms }) => {
    setAdults(newAdults);
    setChildren(newChildren);
    setRooms(newRooms);
  };

  const handleAddRoomRequest = () => {
    setPendingAdults(adults);
    setShowRoomModal(true);
  };

  const handleConfirmAddRoom = () => {
    setRooms(rooms + 1);
    setShowRoomModal(false);
  };

  // Filtered and Sorted Hotels Calculation (API provides pre-filtered data)
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // 1. Min & Max Price Filter (Frontend)
        const price = Number(hotel.starting_price || hotel.price || 0);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        // 2. Star Rating Filter (Frontend)
        if (selectedStars.length > 0) {
          const hotelRatingInt = Math.floor(Number(hotel.rating || 5));
          if (!selectedStars.includes(hotelRatingInt)) return false;
        }

        // 3. Facilities Filter (Frontend)
        if (selectedFacilities.length > 0) {
          const hotelFacs = (hotel.facilities || []).map((f) =>
            (typeof f === "object" ? f.name : String(f)).toLowerCase()
          );
          const matchesAllFacs = selectedFacilities.every((fac) =>
            hotelFacs.some((hf) => hf.includes(fac.toLowerCase()))
          );
          if (!matchesAllFacs) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.starting_price || a.price || 0);
        const priceB = Number(b.starting_price || b.price || 0);
        const ratingA = Number(a.rating || a.average_rating || 0);
        const ratingB = Number(b.rating || b.average_rating || 0);

        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "rating_desc") return ratingB - ratingA;
        return 0; // Default Recommendation
      });
  }, [hotels, minPrice, maxPrice, selectedStars, selectedFacilities, sortBy]);

  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedHotels = filteredHotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 450, behavior: "smooth" });
  };

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] min-h-screen font-body-md antialiased">
      {/* Hero Section */}
      <section className="relative w-full min-h-[560px] lg:h-[600px] flex items-center justify-center bg-[#DCCFC0] overflow-visible py-12 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1280px] px-4 md:px-10 mx-auto flex flex-col items-center text-center">
          <h1 className="font-headline-xl text-3xl md:text-5xl text-white mb-4 max-w-4xl leading-tight drop-shadow-md">
            Temukan Pengalaman Menginap Terbaik Bersama H'Leven
          </h1>
          <p className="font-body-lg text-base md:text-lg text-white/90 mb-10 max-w-2xl drop-shadow">
            Platform reservasi hotel modern yang memberikan kemudahan pencarian, perbandingan harga, dan manajemen pemesanan secara cerdas dan aman.
          </p>

          {/* Floating Search Bar */}
          <div className="w-full max-w-5xl bg-[#fff8f0] p-4 rounded-2xl shadow-xl shadow-[#778873]/10 flex flex-col lg:flex-row gap-3 items-center">
            {/* Destinasi / Hotel Input */}
            <div className="w-full lg:w-1/3 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Destinasi / Hotel
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#778873] mr-2 text-lg">
                  location_on
                </span>
                <input
                  type="text"
                  placeholder="Bandung, Jakarta, Bali..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-sm text-[#1e1b16] placeholder-[#747871] outline-none"
                />
              </div>
            </div>

            {/* Tanggal Check-in & Check-out Unified Range */}
            <div className="w-full lg:w-1/3 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Tanggal Check-in &amp; Check-out
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#778873] mr-2 text-lg">
                  date_range
                </span>
                <DatePicker
                  selectsRange={true}
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  onChange={handleDateRangeChange}
                  minDate={today}
                  monthsShown={2}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Pilih Check-in - Check-out"
                  className="w-full bg-transparent border-none p-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer placeholder-[#747871]"
                />
              </div>
            </div>

            {/* Tamu & Kamar - Guest Selector Component */}
            <GuestSelector
              adults={adults}
              children={children}
              rooms={rooms}
              onGuestChange={handleGuestChange}
              onAddRoomRequest={handleAddRoomRequest}
            />

            {/* Search Action Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-full lg:w-auto h-full bg-[#778873] text-white px-8 py-4 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar Filters & Hotel Cards Grid */}
      <main className="w-full max-w-[1280px] px-4 md:px-10 mx-auto py-16 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-[#FDF6ED] p-6 rounded-2xl shadow-sm shadow-[#778873]/5 border border-[#DCCFC0]/40 text-left">
            <div className="flex items-center justify-between mb-6 border-b border-[#DCCFC0]/30 pb-3">
              <h3 className="font-headline-md text-xl font-semibold text-[#2D332C]">
                Filter Pencarian
              </h3>
              {(searchTerm || minPrice || maxPrice || selectedStars.length > 0 || selectedFacilities.length > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#778873] font-semibold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Rentang Harga Filter */}
            <div className="mb-6">
              <h4 className="font-label-md text-xs font-semibold text-[#444842] mb-3 uppercase tracking-wider">
                Rentang Harga (per malam)
              </h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Rp Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-lg px-3 py-2 text-sm focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none"
                />
                <span className="text-[#c4c8bf] font-bold">-</span>
                <input
                  type="number"
                  placeholder="Rp Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#fff8f0] border border-[#DCCFC0] rounded-lg px-3 py-2 text-sm focus:border-[#778873] focus:ring-1 focus:ring-[#778873] outline-none"
                />
              </div>
            </div>

            {/* Star Rating Filter */}
            <div className="mb-6">
              <h4 className="font-label-md text-xs font-semibold text-[#444842] mb-3 uppercase tracking-wider">
                Bintang Hotel
              </h4>
              <div className="flex flex-col gap-2.5">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(star)}
                      onChange={() => handleStarToggle(star)}
                      className="rounded border-[#DCCFC0] text-[#778873] focus:ring-[#778873] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex text-[#A1BC98]">
                      {Array.from({ length: star }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Facilities Filter */}
            <div>
              <h4 className="font-label-md text-xs font-semibold text-[#444842] mb-3 uppercase tracking-wider">
                Fasilitas Populer
              </h4>
              <div className="flex flex-col gap-2.5">
                {["WiFi Gratis", "Kolam Renang", "Spa & Wellness", "Restoran"].map((fac) => (
                  <label key={fac} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(fac)}
                      onChange={() => handleFacilityToggle(fac)}
                      className="rounded border-[#DCCFC0] text-[#778873] focus:ring-[#778873] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-body-md text-sm text-[#1e1b16] group-hover:text-[#778873] transition-colors">
                      {fac}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Featured Hotels Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 text-left">
            <div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-[#778873] mb-1">
                Rekomendasi Hotel
              </h2>
              <p className="font-body-md text-sm text-[#444842]">
                Properti terbaik yang dipilih khusus untuk kenyamanan Anda. ({filteredHotels.length} ditemukan)
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm bg-[#FDF6ED] px-3 py-1.5 rounded-lg border border-[#DCCFC0]/50">
              <span className="text-[#444842] text-xs font-semibold">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-label-md text-xs font-semibold text-[#778873] focus:ring-0 cursor-pointer outline-none p-0"
              >
                <option value="recommendation">Rekomendasi</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="rating_desc">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Skeleton Loader / Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#FDF6ED] rounded-2xl h-80 animate-pulse border border-[#DCCFC0]/30"></div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            /* Empty State */
            <div className="bg-[#FDF6ED] border border-[#DCCFC0]/50 rounded-2xl p-12 text-center my-6">
              <span className="material-symbols-outlined text-4xl text-[#747871] mb-3">
                search_off
              </span>
              <h3 className="font-headline-md text-lg text-[#2D332C] mb-2 font-semibold">
                Hotel Tidak Ditemukan
              </h3>
              <p className="text-sm text-[#444842] mb-6 max-w-md mx-auto">
                Maaf, tidak ada hotel yang sesuai dengan kata kunci atau kriteria filter yang Anda pilih.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#778873] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#50604d] transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Hotel Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} adults={adults} children={children} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredHotels.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredHotels.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </main>

      {/* Room Addition Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm"
            onClick={() => setShowRoomModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-lg p-8 max-w-md z-10 border border-[#DCCFC0]">
            <div className="mb-6">
              <h3 className="font-headline-md text-2xl font-semibold text-[#2D332C] mb-2">
                Tambah Kamar?
              </h3>
              <p className="font-body-md text-[#747872]">
                Jumlah tamu ({pendingAdults} dewasa) melebihi kapasitas satu kamar. Apakah Anda ingin menambahkan kamar tambahan?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-6 py-2.5 border border-[#DCCFC0] rounded-lg font-label-md text-sm font-semibold text-[#434842] hover:bg-[#FDF6ED] transition-colors"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmAddRoom}
                className="px-6 py-2.5 bg-[#778873] rounded-lg font-label-md text-sm font-semibold text-white hover:bg-[#50604d] transition-colors"
              >
                Ya, Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;