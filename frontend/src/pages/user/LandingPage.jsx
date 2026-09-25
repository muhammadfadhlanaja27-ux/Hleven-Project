import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelCard from "../../components/landing/HotelCard";
import Pagination from "../../components/common/Pagination";
import GuestSelector from "../../components/common/GuestSelector";
import { cachedGet } from "../../services/apiCache";
import { getInitialSearchValues, saveSearchState } from "../../services/searchStorage";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";
const ITEMS_PER_PAGE = 10;

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000), []);
  const init = useMemo(() => getInitialSearchValues(searchParams), [searchParams]);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(init.searchTerm);
  const [checkInDate, setCheckInDate] = useState(init.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState(init.checkOutDate);
  const [adults, setAdults] = useState(init.adults);
  const [children, setChildren] = useState(init.children);
  const [rooms, setRooms] = useState(init.rooms);

  useEffect(() => {
    saveSearchState({ search: searchTerm, checkIn: checkInDate, checkOut: checkOutDate, adults, children, rooms });
  }, [searchTerm, checkInDate, checkOutDate, adults, children, rooms]);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [pendingAdults, setPendingAdults] = useState(2);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const [sortBy, setSortBy] = useState("recommendation");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, checkInDate, checkOutDate, adults, children, rooms, minPrice, maxPrice, selectedStars, selectedFacilities, sortBy]);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
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
      } catch (err) {
        console.error("Backend API Error:", err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
  };

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

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        const price = Number(hotel.starting_price || hotel.price || 0);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        if (selectedStars.length > 0) {
          const hotelRatingInt = Math.floor(Number(hotel.rating || hotel.average_rating || 0));
          if (hotelRatingInt > 0 && !selectedStars.includes(hotelRatingInt)) return false;
        }

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
        return 0;
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
    <div className="bg-[#FAF8F5] text-[#1e1b16] min-h-screen font-body-md antialiased overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[520px] lg:h-[620px] flex items-center justify-center bg-[#DCCFC0] py-10 md:py-12 px-4 z-10">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"></div>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-[1280px] px-2 md:px-10 mx-auto flex flex-col items-center text-center">
          <h1 className="font-headline-xl text-2xl md:text-5xl text-white mb-3 md:mb-4 max-w-4xl leading-tight drop-shadow-md font-extrabold">
            Temukan Pengalaman Menginap Terbaik Bersama H'Leven
          </h1>
          <p className="font-body-lg text-xs md:text-lg text-white/90 mb-6 md:mb-10 max-w-2xl drop-shadow">
            Platform reservasi hotel modern yang memberikan kemudahan pencarian, perbandingan harga, dan manajemen pemesanan secara cerdas dan aman.
          </p>

          {/* Floating Search Bar */}
          <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-[0_20px_60px_rgba(28,37,29,0.12)] border border-white/80 ring-1 ring-black/5 flex flex-col lg:flex-row gap-2.5 items-stretch relative z-30">
            {/* Destinasi Input */}
            <div className="w-full lg:w-1/3 group flex items-center gap-3 bg-[#F7F6F2] hover:bg-[#EFECE6] px-4 py-3 rounded-2xl border border-[#E2DDD3] focus-within:bg-white focus-within:border-[#5F7161] focus-within:ring-2 focus-within:ring-[#5F7161]/20 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-[#5F7161]/10 group-hover:bg-[#5F7161] text-[#5F7161] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <label className="font-label-sm text-[11px] font-bold text-[#7A857B] uppercase tracking-wider cursor-pointer">
                  Destinasi / Hotel
                </label>
                <input
                  type="text"
                  placeholder="Bandung, Jakarta, Bali..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-sm font-bold text-[#1C251D] placeholder-[#9EA6A0] outline-none truncate"
                />
              </div>
            </div>

            {/* Range Date Picker */}
            <div className="w-full lg:w-1/3 group flex items-center gap-3 bg-[#F7F6F2] hover:bg-[#EFECE6] px-4 py-3 rounded-2xl border border-[#E2DDD3] focus-within:bg-white focus-within:border-[#5F7161] focus-within:ring-2 focus-within:ring-[#5F7161]/20 transition-all text-left relative z-40">
              <div className="w-10 h-10 rounded-xl bg-[#5F7161]/10 group-hover:bg-[#5F7161] text-[#5F7161] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <span className="material-symbols-outlined text-xl">calendar_month</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <label className="font-label-sm text-[11px] font-bold text-[#7A857B] uppercase tracking-wider cursor-pointer">
                  Check-in &amp; Check-out
                </label>
                <DatePicker
                  selectsRange={true}
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  onChange={handleDateRangeChange}
                  minDate={today}
                  monthsShown={2}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Pilih Tanggal Menginap"
                  popperClassName="!z-[9999]"
                  className="w-full bg-transparent border-none p-0 font-body-md text-sm font-bold text-[#1C251D] outline-none cursor-pointer placeholder-[#9EA6A0] truncate"
                />
              </div>
            </div>

            {/* Guest Selector Component */}
            <div className="w-full lg:w-1/3">
              <GuestSelector
                adults={adults}
                children={children}
                rooms={rooms}
                onGuestChange={handleGuestChange}
                onAddRoomRequest={handleAddRoomRequest}
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-full lg:w-auto bg-[#5F7161] text-white px-8 py-3.5 rounded-2xl font-label-md text-sm font-bold hover:bg-[#4D5E4F] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#5F7161]/25 cursor-pointer active:scale-95 shrink-0 min-h-[56px]"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              <span>Cari</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area (Ditambahkan pb-24 agar tidak tertutup Bottom Nav HP) */}
      <main className="w-full max-w-[1280px] px-3 md:px-10 mx-auto py-8 md:py-16 pb-24 md:pb-16 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar Filters (Hanya muncul di Layar Besar atau Terlipat di HP) */}
        <aside className="lg:col-span-1 hidden lg:flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E2D9] text-left">
            <div className="flex items-center justify-between mb-6 border-b border-[#F0EBE1] pb-4">
              <h3 className="font-headline-md text-xl font-bold text-[#1C251D]">
                Filter Pencarian
              </h3>
              {(searchTerm || minPrice || maxPrice || selectedStars.length > 0 || selectedFacilities.length > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#5F7161] font-bold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Rentang Harga Filter */}
            <div className="mb-6">
              <h4 className="font-label-md text-xs font-bold text-[#5A625B] mb-3 uppercase tracking-wider">
                Rentang Harga (per malam)
              </h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Rp Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm text-[#1C251D] font-semibold focus:border-[#5F7161] focus:bg-white focus:ring-2 focus:ring-[#5F7161]/20 outline-none transition-all"
                />
                <span className="text-[#C4C8BF] font-bold">-</span>
                <input
                  type="number"
                  placeholder="Rp Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E2DDD3] rounded-xl px-3 py-2.5 text-sm text-[#1C251D] font-semibold focus:border-[#5F7161] focus:bg-white focus:ring-2 focus:ring-[#5F7161]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Star Rating Filter */}
            <div className="mb-6">
              <h4 className="font-label-md text-xs font-bold text-[#5A625B] mb-3 uppercase tracking-wider">
                Bintang Hotel
              </h4>
              <div className="flex flex-col gap-2.5">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(star)}
                      onChange={() => handleStarToggle(star)}
                      className="rounded border-[#E2DDD3] text-[#5F7161] focus:ring-[#5F7161] w-4 h-4 cursor-pointer"
                    />
                    <div className="flex text-[#D97706]">
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
              <h4 className="font-label-md text-xs font-bold text-[#5A625B] mb-3 uppercase tracking-wider">
                Fasilitas Populer
              </h4>
              <div className="flex flex-col gap-2.5">
                {["WiFi Gratis", "Kolam Renang", "Spa & Wellness", "Restoran"].map((fac) => (
                  <label key={fac} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(fac)}
                      onChange={() => handleFacilityToggle(fac)}
                      className="rounded border-[#E2DDD3] text-[#5F7161] focus:ring-[#5F7161] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-body-md text-sm text-[#1C251D] group-hover:text-[#5F7161] transition-colors font-medium">
                      {fac}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Featured Hotels Grid */}
        <div className="lg:col-span-3">
          {/* Header Section (Card Container Modern) */}
          <div className="bg-white p-4 md:p-7 rounded-2xl md:rounded-3xl shadow-xs border border-[#E8E2D9] mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 md:py-1 rounded-full bg-[#5F7161]/10 border border-[#5F7161]/20 text-[#5F7161] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#5F7161]"></span>
                Pilihan Terbaik
              </div>
              <h2 className="font-headline-lg text-xl md:text-3xl font-extrabold text-[#1C251D] tracking-tight">
                Rekomendasi Hotel
              </h2>
              <p className="font-body-md text-xs md:text-sm text-[#5A625B] mt-0.5">
                Properti pilihan dengan fasilitas terbaik ({filteredHotels.length} ditemukan).
              </p>
            </div>

            {/* Select Filter Inside Card */}
            <div className="flex items-center gap-2 text-xs md:text-sm bg-[#F7F6F2] hover:bg-[#EFECE6] px-3 py-2 rounded-xl border border-[#E2DDD3] focus-within:bg-white focus-within:border-[#5F7161] transition-all shrink-0">
              <span className="material-symbols-outlined text-base md:text-lg text-[#5F7161]">sort</span>
              <span className="text-[#5A625B] text-[10px] md:text-xs font-bold">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-label-md text-[11px] md:text-xs font-bold text-[#1C251D] focus:ring-0 cursor-pointer outline-none p-0 pr-1"
              >
                <option value="recommendation">Rekomendasi Utama</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="rating_desc">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {loading ? (
            /* Skeleton Loading Grid: 2 Kolom di HP */
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-64 md:h-80 animate-pulse border border-[#E8E2D9]"></div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 md:p-12 text-center my-6 shadow-xs">
              <span className="material-symbols-outlined text-4xl text-[#8A948C] mb-3">
                search_off
              </span>
              <h3 className="font-headline-md text-base md:text-lg text-[#1C251D] mb-2 font-semibold">
                Hotel Tidak Ditemukan
              </h3>
              <p className="text-xs md:text-sm text-[#5A625B] mb-6 max-w-md mx-auto">
                Maaf, tidak ada hotel yang sesuai dengan kata kunci atau kriteria filter yang Anda pilih.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#5F7161] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#4D5E4F] transition-colors cursor-pointer shadow-xs"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Hotel Grid: 2 Kolom di Mobile (grid-cols-2), 3 Kolom di Desktop */
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {displayedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} adults={adults} children={children} />
              ))}
            </div>
          )}

          {!loading && filteredHotels.length > ITEMS_PER_PAGE && (
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
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRoomModal(false)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md z-10 border border-[#E8E2D9]">
            <div className="mb-6">
              <h3 className="font-headline-md text-2xl font-bold text-[#1C251D] mb-2">
                Tambah Kamar?
              </h3>
              <p className="font-body-md text-[#5A625B] text-sm">
                Jumlah tamu ({pendingAdults} dewasa) melebihi kapasitas satu kamar. Apakah Anda ingin menambahkan kamar tambahan?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-6 py-2.5 border border-[#E8E2D9] rounded-xl font-label-md text-sm font-semibold text-[#5A625B] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmAddRoom}
                className="px-6 py-2.5 bg-[#5F7161] rounded-xl font-label-md text-sm font-semibold text-white hover:bg-[#4D5E4F] transition-colors cursor-pointer shadow-xs"
              >
                Ya, Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar Khusus Tampilan Mobile (HP) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] px-4 py-2 flex justify-around items-center md:hidden z-40 shadow-lg">
        <button className="flex flex-col items-center text-[#5F7161]">
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-[10px] font-bold mt-0.5">Awal</span>
        </button>
        <button className="flex flex-col items-center text-[#8A948C] hover:text-[#5F7161]">
          <span className="material-symbols-outlined text-xl">explore</span>
          <span className="text-[10px] font-medium mt-0.5">Explore</span>
        </button>
        <button className="flex flex-col items-center text-[#8A948C] hover:text-[#5F7161]">
          <span className="material-symbols-outlined text-xl">receipt_long</span>
          <span className="text-[10px] font-medium mt-0.5">Pesanan</span>
        </button>
        <button className="flex flex-col items-center text-[#8A948C] hover:text-[#5F7161]">
          <span className="material-symbols-outlined text-xl">bookmark</span>
          <span className="text-[10px] font-medium mt-0.5">Simpan</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;