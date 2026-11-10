import React from "react";
import { useNavigate } from "react-router-dom";

const DESTINATIONS = [
  {
    name: "Jakarta",
    // Gambar Monas / Skyline Jakarta
    image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1200&q=80",
    isLarge: true,
  },
  {
    name: "Yogyakarta",
    // Gambar Candi Prambanan / Landmark Jogja
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
    isLarge: true,
  },
  {
    name: "Bandung",
    // Gambar Gedung Sate / Suasana Kota Bandung
    image: "https://images.unsplash.com/photo-1611638281871-1063d3e76e1f?q=80&w=1133&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    isLarge: false,
  },
  {
    name: "Surabaya",
    // Gambar Skyline Kota Surabaya / Suramadu
    image: "https://plus.unsplash.com/premium_photo-1690959214934-802fdf410b3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    isLarge: false,
  },
  {
    name: "Bali",
    // Gambar Pura Ulun Danu Bedugul / Lanskap Bali
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    isLarge: false,
  },
];

const TrendingDestinations = () => {
  const navigate = useNavigate();

  const handleCityClick = (cityName) => {
    navigate(`/hotels?search=${encodeURIComponent(cityName)}`);
  };

  const largeDestinations = DESTINATIONS.filter((item) => item.isLarge);
  const smallDestinations = DESTINATIONS.filter((item) => !item.isLarge);

  return (
    <section className="w-full my-10 text-left bg-white p-6 md:p-8 rounded-2xl border border-[#E8E2D9] shadow-xs">
      {/* Header Inside Big Card */}
      <div className="mb-6">
        <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-[#778873] mb-1">
          Trending Destinations
        </h2>
        <p className="font-body-md text-sm text-[#444842]">
          Favorite locations chosen by travelers for vacations and trips in Indonesia.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div className="flex flex-col gap-5">
        {/* Baris Atas: 2 Card Besar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {largeDestinations.map((item) => (
            <div
              key={item.name}
              onClick={() => handleCityClick(item.name)}
              className="relative h-64 md:h-72 rounded-2xl overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all duration-300 border border-[#E8E2D9]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="font-headline-md text-2xl font-bold text-white drop-shadow-md">
                  {item.name}
                </span>
                <span className="text-xl">🇮🇩</span>
              </div>
            </div>
          ))}
        </div>

        {/* Baris Bawah: 3 Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {smallDestinations.map((item) => (
            <div
              key={item.name}
              onClick={() => handleCityClick(item.name)}
              className="relative h-56 md:h-60 rounded-2xl overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all duration-300 border border-[#E8E2D9]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="font-headline-md text-xl font-bold text-white drop-shadow-md">
                  {item.name}
                </span>
                <span className="text-lg">🇮🇩</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations;