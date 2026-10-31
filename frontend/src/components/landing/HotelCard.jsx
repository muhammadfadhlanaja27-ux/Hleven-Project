import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStorageUrl } from '../../services/imageUrl';

const HotelCard = ({ hotel, adults, children, variant = "vertical" }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!hotel) return null;

  const getImageUrl = () => {
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

  // Ekstraksi Rating & Ulasan dari Data Backend
  const rawRating = Number(hotel.reviews_avg_rating || hotel.average_rating || hotel.rating || 0);
  const averageRating = rawRating > 0 ? rawRating.toFixed(1) : null;
  const totalReviews = hotel.reviews_count || hotel.total_review || hotel.total_reviews || 0;

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
  const cityName =
    (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) ||
    hotel.city_name ||
    "Bandung";

  // Penanganan Bintang Klasifikasi Hotel (1-5 Bintang Properti)
  const starCount = Math.min(Math.max(Number(hotel.star_rating || hotel.stars || hotel.star || 4), 1), 5);

  const handleNavigateDetail = (e) => {
    e.stopPropagation();
    navigate(`/hotels/${hotel.id}`);
  };

  // Layout Horizontal (untuk HotelList)
  if (variant === "horizontal") {
    return (
      <div 
        onClick={handleNavigateDetail}
        className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-[#E8E2D9] transition-all duration-300 group flex flex-col md:flex-row text-left cursor-pointer"
      >
        <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0 overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0]">
          {hasValidImage ? (
            <img
              src={imageUrl}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="material-symbols-outlined text-[#778873] text-5xl mb-2 opacity-60">
                image_not_supported
              </span>
                <p className="font-label-md text-xs font-bold text-[#778873] uppercase tracking-wider">
                  No Photos Available
                </p>
              </div>
            )}

            <div className="absolute top-3 left-3 bg-[#1C251D]/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {cityName}
            </div>

            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-black/5">
              <span className="material-symbols-outlined text-[#D97706] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-label-sm text-[11px] font-bold text-[#1C251D]">
                {starCount} Star(s)
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-headline-md text-xl font-bold text-[#2D332C] leading-tight group-hover:text-[#778873] transition-colors">
                  {hotel.name}
                </h3>
              </div>

              {/* Badge Rating & Ulasan */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-md font-bold text-xs border border-[#FDE68A]">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
              <span>{averageRating ? averageRating : "0.0"}</span>
                </div>
                {totalReviews > 0 ? (
                  <span className="text-xs text-[#747871] font-medium">
                    ({totalReviews} reviews)
                  </span>
                ) : (
                  <span className="text-xs text-[#747871] italic">
                    No reviews yet
                  </span>
                )}
              </div>

            <div className="flex items-center gap-1 text-[#444842] mb-3 text-sm">
              <span className="material-symbols-outlined text-sm text-[#778873]">location_on</span>
              <span className="font-body-md text-sm truncate">
                {hotel.address || (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) || "Bandung, Jawa Barat"}
              </span>
            </div>

            <div className="flex gap-3 mb-4">
              {facilities.slice(0, 5).map(renderFacilityIcon)}
            </div>
          </div>

          <div className="flex items-end justify-between pt-3 border-t border-[#E8E2D9]">
            <div>
              <p className="text-xs text-[#444842]">Starting from</p>
              <p className="font-headline-md text-xl font-bold text-[#778873]">
                Rp {getPrice()} <span className="text-xs font-normal text-[#444842]">/ night</span>
              </p>
            </div>

            <Link
              to={`/hotels/${hotel.id}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#778873] text-white px-5 py-2.5 rounded-xl font-label-md text-xs font-semibold hover:bg-[#50604d] transition-colors inline-block text-center shadow-xs"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Layout Vertikal Default (untuk Landing Page)
  return (
    <div 
      onClick={handleNavigateDetail}
      className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-[#E8E2D9] transition-all duration-300 group flex flex-col h-full text-left cursor-pointer"
    >
      {/* Image Header */}
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
              No Photos Available
            </p>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-[#1C251D]/75 backdrop-blur-xs text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md">
          {cityName}
        </div>

        {hotel.logo && (
          <div className="absolute bottom-2.5 left-2.5 w-12 h-12 rounded-xl bg-white/95 backdrop-blur-xs border border-white/80 shadow-md p-1.5">
            <img
              src={getStorageUrl(hotel.logo)}
              alt={`${hotel.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-black/5">
          <span className="material-symbols-outlined text-[#D97706] text-xs md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-label-sm text-[11px] md:text-xs font-bold text-[#1C251D]">
            {starCount} Star(s)
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline-md text-xl font-semibold text-[#2D332C] leading-tight line-clamp-2 mb-1.5 group-hover:text-[#778873] transition-colors">
          {hotel.name}
        </h3>

        {/* Badge Rating & Ulasan */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-md font-bold text-xs border border-[#FDE68A]">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span>{averageRating ? averageRating : "New"}</span>
          </div>
          {totalReviews > 0 ? (
            <span className="text-xs text-[#747871] font-medium">
              ({totalReviews} reviews)
            </span>
          ) : (
            <span className="text-xs text-[#747871] italic">
              No reviews yet
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[#444842] mb-3 text-sm">
          <span className="material-symbols-outlined text-sm text-[#778873]">location_on</span>
          <span className="font-body-md text-sm truncate">
            {hotel.address || (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) || "Bandung, Jawa Barat"}
          </span>
        </div>

        {/* Facilities icons */}
        <div className="flex gap-3 mb-5">
          {facilities.slice(0, 4).map(renderFacilityIcon)}
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-[#E8E2D9]">
          <div>
            <p className="text-xs text-[#444842] mb-0.5">Starting from</p>
            <p className="font-headline-md text-lg font-bold text-[#778873]">
              Rp {getPrice()}
            </p>
            <p className="text-[11px] text-[#747871]">/ night</p>
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#faf3ea] border border-[#778873] text-[#778873] px-4 py-2 rounded-lg font-label-md text-xs font-semibold hover:bg-[#778873] hover:text-white transition-colors inline-block text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;