import React from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <img 
        src={hotel.thumbnail} 
        alt={hotel.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4 flex flex-col justify-between flex-grow text-left">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
              {hotel.city}
            </span>
            <span className="text-xs font-semibold text-yellow-600">
              ★ {hotel.rating}
            </span>
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">{hotel.name}</h3>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="font-bold text-[var(--accent)] text-base">
              Rp {hotel.starting_price.toLocaleString('id-ID')}
            </p>
          </div>
          <Link 
            to={`/hotels/${hotel.id}`}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;