import React, { useState, useEffect, useMemo } from "react";
import HotelCard from "../../components/landing/HotelCard";
import api from "../../services/api";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";

const LandingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Bar States
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestOption, setGuestOption] = useState("2 Dewasa, 1 Kamar");

  // Sidebar Filter States
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Sorting & Pagination States
  const [sortBy, setSortBy] = useState("recommendation");
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch Hotels (Backend API without Mock)
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await api.get("/hotels");
        if (response.data && (response.data.data || Array.isArray(response.data))) {
          const apiHotels = response.data.data || response.data;
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
  };

  // Filtered and Sorted Hotels Calculation
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        // 1. Text Search Filter (Name, City, Address)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = hotel.name?.toLowerCase().includes(query);
          const cityStr = typeof hotel.city === "object" ? hotel.city?.city : hotel.city;
          const matchCity = cityStr?.toLowerCase().includes(query);
          const matchAddress = hotel.address?.toLowerCase().includes(query);
          if (!matchName && !matchCity && !matchAddress) return false;
        }

        // 2. Min & Max Price Filter
        const price = Number(hotel.starting_price || hotel.price || 0);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        // 3. Star Rating Filter
        if (selectedStars.length > 0) {
          const hotelRatingInt = Math.floor(Number(hotel.rating || 5));
          if (!selectedStars.includes(hotelRatingInt)) return false;
        }

        // 4. Facilities Filter
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
  }, [hotels, searchTerm, minPrice, maxPrice, selectedStars, selectedFacilities, sortBy]);

  const displayedHotels = filteredHotels.slice(0, visibleCount);

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] min-h-screen font-body-md antialiased">
      {/* Hero Section */}
      <section className="relative w-full min-h-[560px] lg:h-[600px] flex items-center justify-center bg-[#DCCFC0] overflow-hidden py-12 px-4">
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
            <div className="w-full lg:w-1/3 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Destinasi / Hotel
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#747871] mr-2 text-lg">
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

            {/* Check-in Date */}
            <div className="w-full lg:w-1/4 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Check-in
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#747871] mr-2 text-lg">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="w-full lg:w-1/4 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Check-out
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#747871] mr-2 text-lg">
                  calendar_month
                </span>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Tamu & Kamar */}
            <div className="w-full lg:w-1/4 flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 focus-within:border-[#778873] transition-all text-left">
              <label className="font-label-sm text-xs font-semibold text-[#444842]">
                Tamu &amp; Kamar
              </label>
              <div className="flex items-center w-full mt-1">
                <span className="material-symbols-outlined text-[#747871] mr-2 text-lg">
                  group
                </span>
                <select
                  value={guestOption}
                  onChange={(e) => setGuestOption(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-sm text-[#1e1b16] outline-none cursor-pointer"
                >
                  <option value="1 Dewasa, 1 Kamar">1 Dewasa, 1 Kamar</option>
                  <option value="2 Dewasa, 1 Kamar">2 Dewasa, 1 Kamar</option>
                  <option value="4 Dewasa, 2 Kamar">4 Dewasa, 2 Kamar</option>
                </select>
              </div>
            </div>

            {/* Search Action Button */}
            <button
              type="button"
              onClick={() => setVisibleCount(6)}
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
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredHotels.length > visibleCount && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="bg-[#FDF6ED] border border-[#778873] text-[#778873] px-8 py-3 rounded-full font-label-md text-sm font-semibold hover:bg-[#778873] hover:text-white transition-all shadow-sm active:scale-95"
              >
                Muat Lebih Banyak Hotel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
