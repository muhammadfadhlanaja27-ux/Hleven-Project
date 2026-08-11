import React, { useState } from "react";
import HotelCard from "../../components/landing/HotelCard";
import { mockHotels } from "../../data/mockHotels";

const LandingPage = () => {
  const [hotels] = useState(mockHotels);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 py-16 px-6 text-center text-white">
        <h1 className="text-4xl font-extrabold mb-4">Temukan Hotel Impianmu</h1>
        <p className="text-blue-100 mb-8">
          Pesan hotel terbaik dengan harga terjangkau
        </p>
        <div className="max-w-xl mx-auto bg-white p-2 rounded-xl shadow-lg flex">
          <input
            type="text"
            placeholder="Mau ke mana? (Cth: Bandung, Jakarta)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 text-gray-700 outline-none"
          />
          <button className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700 text-white">
            Cari
          </button>
        </div>
      </section>

      {/* Hotel Section */}
      <section className="max-w-6xl mx-auto py-12 px-6 text-left">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Hotel Populer</h2>
        {filteredHotels.length === 0 ? (
          <p className="text-gray-500">
            Tidak ada hotel yang sesuai dengan pencarian Anda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
