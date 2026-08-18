import React, { useState, useEffect, useMemo } from "react";
import HotelCard from "../../components/landing/HotelCard";
import { mockHotels } from "../../data/mockHotels";
import api from "../../services/api";

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState("recommendation");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await api.get("/hotels");
        if (response.data && (response.data.data || Array.isArray(response.data))) {
          const apiHotels = response.data.data || response.data;
          if (apiHotels.length > 0) {
            const mergedHotels = apiHotels.map((apiH, idx) => {
              const mockRef = mockHotels[idx % mockHotels.length];
              return {
                ...mockRef,
                ...apiH,
                facilities: apiH.facilities || mockRef.facilities,
                starting_price: apiH.starting_price || apiH.price || mockRef.starting_price,
                rating: apiH.rating || apiH.average_rating || mockRef.rating
              };
            });
            setHotels(mergedHotels);
          } else {
            setHotels(mockHotels);
          }
        } else {
          setHotels(mockHotels);
        }
      } catch (err) {
        console.warn("Backend Error / Fallback ke mockHotels:", err);
        setHotels(mockHotels);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleStarToggle = (star) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const handleFacilityToggle = (fac) => {
    setSelectedFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
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

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = hotel.name?.toLowerCase().includes(query);
          const matchCity = hotel.city?.toLowerCase().includes(query);
          const matchAddress = hotel.address?.toLowerCase().includes(query);
          if (!matchName && !matchCity && !matchAddress) return false;
        }

        const price = Number(hotel.starting_price || hotel.price || 0);
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;

        if (selectedStars.length > 0) {
          const hotelRatingInt = Math.floor(Number(hotel.rating || 5));
          if (!selectedStars.includes(hotelRatingInt)) return false;
        }

        if (selectedFacilities.length > 0) {
          const hotelFacs = (hotel.facilities || []).map((f) =>
            (typeof f === "object" ? f.name : String(f)).toLowerCase()
          );
          const matchesAll = selectedFacilities.every((fac) =>
            hotelFacs.some((hf) => hf.includes(fac.toLowerCase()))
          );
          if (!matchesAll) return false;
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
  }, [hotels, searchTerm, minPrice, maxPrice, selectedStars, selectedFacilities, sortBy]);

  const displayedHotels = filteredHotels.slice(0, visibleCount);

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      {/* Top Banner Header */}
      <section className="bg-[#FDF6ED] border-b border-[#DCCFC0]/40 py-12 px-4">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 text-left">
          <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#778873] mb-3 leading-tight">
            Jelajah Hotel &amp; Resort H'Leven
          </h1>
          <p className="font-body-lg text-base md:text-lg text-[#444842] max-w-2xl">
            Temukan akomodasi mewah terbaik di berbagai destinasi impian Anda dengan harga dan kenyamanan tak tertandingi.
          </p>

          {/* Inline Search Bar */}
          <div className="mt-8 max-w-2xl bg-[#fff8f0] p-3 rounded-2xl border border-[#DCCFC0] shadow-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-[#778873] text-xl ml-2">
              search
            </span>
            <input
              type="text"
              placeholder="Cari hotel berdasarkan nama, kota, atau area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-body-md text-[#1e1b16] outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-[#747871] hover:text-[#1e1b16] px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar Filters & Grid */}
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 flex flex-col lg:flex-row gap-8">
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

            {/* Popular Facilities Filter */}
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

        {/* Hotel Grid Area */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 text-left">
            <div>
              <h2 className="font-headline-lg text-2xl font-semibold text-[#778873] mb-1">
                Semua Hotel ({filteredHotels.length})
              </h2>
              <p className="font-body-md text-sm text-[#444842]">
                Pilihan akomodasi siap huni untuk perjalanan bisnis maupun liburan Anda.
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#FDF6ED] rounded-2xl h-80 animate-pulse border border-[#DCCFC0]/30"></div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-[#FDF6ED] border border-[#DCCFC0]/50 rounded-2xl p-12 text-center my-6">
              <span className="material-symbols-outlined text-4xl text-[#747871] mb-3">
                search_off
              </span>
              <h3 className="font-headline-md text-lg text-[#2D332C] mb-2 font-semibold">
                Tidak Ada Hotel Ditemukan
              </h3>
              <p className="text-sm text-[#444842] mb-6 max-w-md mx-auto">
                Cobalah mengubah kata kunci atau atur ulang filter pencarian Anda.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#778873] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#50604d] transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

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

export default HotelList;
