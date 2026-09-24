import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelCard from "../../components/landing/HotelCard";
import Pagination from "../../components/common/Pagination";
import GuestSelector from "../../components/common/GuestSelector";
import { cachedGet } from "../../services/apiCache";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";
const ITEMS_PER_PAGE = 12;

const LandingPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

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
    <div className="bg-[#fff8f0] text-[#1e1b16] min-h-screen font-body-md antialiased overflow-x-hidden max-w-full">
      <section className="relative w-full min-h-[560px] lg:h-[600px] flex items-center justify-center bg-[#DCCFC0] overflow-visible py-12 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${HERO_BG_IMAGE}')` }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"></div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[1280px] px-4 md:px-10 mx-auto flex flex-col items-center text-center">
          <h1 className="font-headline-xl text-3xl md:text-5xl text-white mb-4 max-w-4xl leading-tight drop-shadow-md">
            Temukan Pengalaman Menginap Terbaik Bersama H'Leven
          </h1>
          <p className="font-body-lg text-base md:text-lg text-white/90 mb-10 max-w-2xl drop-shadow">
            Platform reservasi hotel modern yang memberikan kemudahan pencarian, perbandingan harga, dan manajemen pemesanan secara cerdas dan aman.
          </p>

          <div className="w-full max-w-5xl bg-[#fff8f0] p-4 rounded-2xl shadow-xl shadow-[#778873]/10 flex flex-col lg:flex-row gap-3 items-center">
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

            <div className="w-full lg:w-1/3 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873] transition-all text-left relative z-20">
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
                  monthsShown={window.innerWidth > 640 ? 2 : 1}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Pilih Check-in - Check-out"
                  popperPlacement="bottom-start"
                  popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                  className="w-full bg-transparent border-none p-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer placeholder-[#747871]"
                />
              </div>
            </div>

            <GuestSelector
              adults={adults}
              children={children}
              rooms={rooms}
              onGuestChange={handleGuestChange}
              onAddRoomRequest={handleAddRoomRequest}
            />

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

      <main className="w-full max-w-[1280px] px-4 md:px-10 mx-auto py-16">
        <div className="w-full">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8E2D9] shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-[#778873] mb-1">
                Rekomendasi Hotel
              </h2>
              <p className="font-body-md text-sm text-[#444842]">
                Properti terbaik yang dipilih khusus untuk kenyamanan Anda. ({filteredHotels.length} ditemukan)
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm bg-[#FDF6ED] px-3.5 py-2 rounded-xl border border-[#DCCFC0]/60 shrink-0">
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E8E2D9] shadow-xs"></div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-12 text-center my-6 shadow-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  adults={adults}
                  children={children}
                  variant="vertical"
                  customUrl="/hotels"
                />
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

      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2e3130]/40 backdrop-blur-sm"
            onClick={() => setShowRoomModal(false)}
          />

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