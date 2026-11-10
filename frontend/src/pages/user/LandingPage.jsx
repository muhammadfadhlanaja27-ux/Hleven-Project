import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HotelCard from "../../components/landing/HotelCard";
import CityTopHotelsCarousel from "../../components/landing/CityTopHotelsCarousel";
import TrendingDestinations from "../../components/landing/TrendingDestinations";
import Pagination from "../../components/common/Pagination";
import GuestSelector from "../../components/common/GuestSelector";
import { cachedGet } from "../../services/apiCache";
import { fmtDateStr, getInitialSearchValues, saveSearchState } from "../../services/searchStorage";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";
const ITEMS_PER_PAGE = 9;

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(Date.now() + 86400000), []);
  const init = useMemo(() => getInitialSearchValues(searchParams), [searchParams]);

  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(init.searchTerm || "");
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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, checkInDate, checkOutDate, adults, children, rooms, minPrice, maxPrice, selectedStars, selectedFacilities]);

  // Pengambilan seluruh data hotel murni dari API untuk Carousel & Rekomendasi
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const { data: responseData, fromCache } = await cachedGet("/hotels");

        if (responseData && (responseData.data || Array.isArray(responseData))) {
          const apiHotels = responseData.data || responseData;
          setAllHotels(apiHotels);
        } else {
          setAllHotels([]);
        }
        if (fromCache) {
          console.debug("[Cache Hit] LandingPage hotels loaded from cache");
        }
      } catch (err) {
        console.error("Backend API Error:", err);
        setAllHotels([]);
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
    if (checkInDate) params.append("check_in_date", fmtDateStr(checkInDate));
    if (checkOutDate) params.append("check_out_date", fmtDateStr(checkOutDate));
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
    const query = searchTerm.trim().toLowerCase();

    return allHotels
      .filter((hotel) => {
        if (query) {
          const matchName = hotel.name?.toLowerCase().includes(query);
          const cityStr = typeof hotel.city === "object" ? hotel.city?.city : hotel.city;
          const matchCity = cityStr?.toLowerCase().includes(query);
          const matchAddress = hotel.address?.toLowerCase().includes(query);
          if (!matchName && !matchCity && !matchAddress) return false;
        }

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
        // 1. Pemesanan Terbanyak
        const bookingsA = Number(a.total_bookings || a.bookings_count || a.total_booked || a.total_booking || 0);
        const bookingsB = Number(b.total_bookings || b.bookings_count || b.total_booked || b.total_booking || 0);
        if (bookingsB !== bookingsA) return bookingsB - bookingsA;

        // 2. Rating Ulasan Terbaik
        const reviewRatingA = Number(a.average_rating || a.rating || a.reviews_avg_rating || 0);
        const reviewRatingB = Number(b.average_rating || b.rating || b.reviews_avg_rating || 0);
        if (reviewRatingB !== reviewRatingA) return reviewRatingB - reviewRatingA;

        // 3. Bintang Klasifikasi Hotel Tertinggi
        const starA = Number(a.star_rating || a.stars || a.star || 0);
        const starB = Number(b.star_rating || b.stars || b.star || 0);
        return starB - starA;
      });
  }, [allHotels, searchTerm, minPrice, maxPrice, selectedStars, selectedFacilities]);

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
            Find the Best Stays with H'Leven
          </h1>
          <p className="font-body-lg text-base md:text-lg text-white/90 mb-10 max-w-2xl drop-shadow">
            A modern hotel reservation platform that makes searching, comparing prices, and managing bookings smart and secure.
          </p>

          <div className="w-full max-w-5xl bg-[#fff8f0] p-4 rounded-2xl shadow-xl shadow-[#778873]/10 flex flex-col lg:flex-row gap-3 items-center">
            <div className="w-full lg:w-1/3 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Destination / Hotel
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
                Check-in &amp; Check-out Dates
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
                  placeholderText="Select Check-in - Check-out"
                  popperPlacement="bottom-start"
                  popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                  className="w-full bg-transparent border-none p-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer placeholder-[#747871]"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <GuestSelector
                adults={adults}
                children={children}
                rooms={rooms}
                onGuestChange={handleGuestChange}
                capacityAdult={2}
                capacityChild={2}
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="w-full lg:w-auto h-full bg-[#778873] text-white px-8 py-4 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Search
            </button>
          </div>
        </div>
      </section>

      <main className="w-full max-w-[1280px] px-4 md:px-10 mx-auto py-16">
        {/* Destinasi Populer Grid */}
        <TrendingDestinations />

        {/* Carousel Hotel Terbaik Per Kota (Menggunakan allHotels murni tanpa filter) */}
        {!loading && <CityTopHotelsCarousel hotels={allHotels} />}

        <div className="w-full">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8E2D9] shadow-xs mb-8 text-left">
            <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-[#778873] mb-1">
              Hotel Recommendations
            </h2>
            <p className="font-body-md text-sm text-[#444842]">
              Top selected properties based on bookings, ratings, and stars. ({filteredHotels.length} found)
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E8E2D9] shadow-xs"></div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-12 text-center my-6 shadow-xs">
              <span className="material-symbols-outlined text-4xl text-[#747871] mb-3">
                search_off
              </span>
              <h3 className="font-headline-md text-lg text-[#2D332C] mb-2 font-semibold">
                Hotel Not Found
              </h3>
              <p className="text-sm text-[#444842] mb-6 max-w-md mx-auto">
                Sorry, no hotels match your search or criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#778873] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#50604d] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Add Room?
              </h3>
              <p className="font-body-md text-[#747872]">
                Total guests ({pendingAdults} adults) exceed one room's capacity. Do you want to add an extra room?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-6 py-2.5 border border-[#DCCFC0] rounded-lg font-label-md text-sm font-semibold text-[#434842] hover:bg-[#FDF6ED] transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmAddRoom}
                className="px-6 py-2.5 bg-[#778873] rounded-lg font-label-md text-sm font-semibold text-white hover:bg-[#50604d] transition-colors"
              >
                Yes, Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;