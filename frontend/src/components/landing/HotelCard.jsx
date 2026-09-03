import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = () => {
    if (!hotel) return null;
    if (hotel.thumbnail) {
      if (hotel.thumbnail.startsWith('http')) return hotel.thumbnail;
      return `http://localhost:8000/storage/${hotel.thumbnail.replace(/^\//, '')}`;
    }
    if (hotel.photos && hotel.photos.length > 0) {
      const firstPhoto = hotel.photos[0];
      const photoPath = typeof firstPhoto === 'object' ? firstPhoto.photo || firstPhoto.url || firstPhoto.image_path : firstPhoto;
      if (photoPath) {
        if (photoPath.startsWith('http')) return photoPath;
        return `http://localhost:8000/storage/${photoPath.replace(/^\//, '')}`;
      }
    }
    return null;
  };

  const imageUrl = !imgError ? getImageUrl() : null;
  const hasValidImage = !!imageUrl;

  const getPrice = () => {
    const rawPrice = hotel.starting_price || hotel.price || (hotel.rooms && hotel.rooms[0]?.price) || 500000;
    return Number(rawPrice).toLocaleString('id-ID');
  };

  const getRating = () => {
    return hotel.rating || hotel.average_rating || "4.8";
  };

  const renderFacilityIcon = (fac, idx) => {
    const facObj = typeof fac === 'object' ? fac : null;
    const facName = (facObj ? facObj.name : String(fac)).toLowerCase();
    let iconName = facObj?.icon || 'stars';
    let title = facObj ? facObj.name : String(fac);

    if (!facObj?.icon || facObj.icon === 'stars') {
      if (facName.includes('wifi')) {
        iconName = 'wifi';
      } else if (facName.includes('kolam') || facName.includes('pool')) {
        iconName = 'pool';
      } else if (facName.includes('spa') || facName.includes('wellness')) {
        iconName = 'spa';
      } else if (facName.includes('restoran') || facName.includes('restaurant') || facName.includes('bar')) {
        iconName = 'restaurant';
      } else if (facName.includes('taman') || facName.includes('nature') || facName.includes('park')) {
        iconName = 'park';
      } else if (facName.includes('gym') || facName.includes('fitness')) {
        iconName = 'fitness_center';
      }
    }

    return (
      <span key={idx} className="material-symbols-outlined text-sm text-[#747871]" title={title}>
        {iconName}
      </span>
    );
  };

  const facilities = Array.isArray(hotel.facilities) ? hotel.facilities : [];

  return (
    <div className="bg-[#FDF6ED] rounded-2xl overflow-hidden shadow-sm shadow-[#778873]/10 border border-[#DCCFC0]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col h-full text-left">
      {/* Image Header with Rating Badge */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0]">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="material-symbols-outlined text-[#778873] text-6xl mb-3 opacity-60">
              image_not_supported
            </span>
            <p className="font-label-md text-xs font-bold text-[#778873] uppercase tracking-wider">
              Belum Ada Foto
            </p>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-[#fff8f0]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[#A1BC98] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-label-sm text-xs font-semibold text-[#2D332C]">
            {getRating()}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline-md text-xl font-semibold text-[#2D332C] leading-tight line-clamp-2 mb-2">
          {hotel.name}
        </h3>

        <div className="flex items-center gap-1 text-[#444842] mb-3 text-sm">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="font-body-md text-sm truncate">
            {hotel.address || (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) || "Bandung, Jawa Barat"}
          </span>
        </div>

        {/* Facilities icons */}
        <div className="flex gap-3 mb-5">
          {facilities.slice(0, 4).map(renderFacilityIcon)}
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-[#DCCFC0]/30">
          <div>
            <p className="text-xs text-[#444842] mb-0.5">Mulai dari</p>
            <p className="font-headline-md text-lg font-bold text-[#778873]">
              Rp {getPrice()}
            </p>
            <p className="text-[11px] text-[#747871]">/ malam</p>
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            className="bg-[#fff8f0] border border-[#778873] text-[#778873] px-4 py-2 rounded-lg font-label-md text-xs font-semibold hover:bg-[#DCCFC0]/30 transition-colors inline-block text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;