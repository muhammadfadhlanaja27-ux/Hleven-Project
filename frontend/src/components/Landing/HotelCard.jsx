import React from 'react';

const HotelCard = ({ hotel }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <img 
        src={hotel.thumbnail || 'https://via.placeholder.com/400x250'} 
        alt={hotel.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{hotel.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{hotel.city}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-blue-600 font-bold">
            Rp{hotel.starting_price?.toLocaleString()}
          </span>
          <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-semibold">
            ★ {hotel.rating}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;