import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStorageUrl } from '../../services/imageUrl';

const HotelCard = ({ hotel, adults, children }) => {
  const [urlSearchParams] = useSearchParams();
  const [imgError, setImgError] = useState(false);

  const effectiveAdults = (adults ?? Number(urlSearchParams.get('adults'))) || 0;
  const effectiveChildren = (children ?? Number(urlSearchParams.get('children'))) || 0;

  const buildDetailUrl = () => {
    const params = new URLSearchParams();
    if (effectiveAdults > 0) params.set('adults', effectiveAdults);
    if (effectiveChildren > 0) params.set('children', effectiveChildren);
    const qs = params.toString();
    return `/hotels/${hotel.id}${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    setImgError(false);
  }, [hotel.thumbnail, hotel.photos]);

  const getImageUrl = () => {
    if (!hotel) return null;
    if (hotel.thumbnail) {
      return getStorageUrl(hotel.thumbnail);
    }
    if (hotel.photos && hotel.photos.length > 0) {
      const firstPhoto = hotel.photos[0];
      const photoPath = typeof firstPhoto === 'object' ? firstPhoto.photo || firstPhoto.url || firstPhoto.image_path : firstPhoto;
      if (photoPath) {
        return getStorageUrl(photoPath);
      }
    }
    return null;
  };

  const imageUrl = !imgError ? getImageUrl() : null;
  const hasValidImage = !!imageUrl;

  const rawPrice = Number(hotel.starting_price || hotel.price || (hotel.rooms && hotel.rooms[0]?.price) || 0);
  const formattedPrice = rawPrice > 0 ? rawPrice.toLocaleString('id-ID') : '150.000';

  const getRating = () => {
    return Number(hotel.rating || hotel.average_rating || 0).toFixed(1);
  };

  const cityName = (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) || "Bandung";
  const verifiedStar = hotel.star_rating ? Number(hotel.star_rating) : null;
  const reviewRating = Number(hotel.rating || hotel.average_rating || 0);
  const reviewCount = Number(hotel.reviews_count ?? hotel.total_review ?? hotel.total_reviews ?? 0);

  const renderFacilityIcon = (fac, idx) => {
    const facObj = typeof fac === 'object' ? fac : null;
    const facName = (facObj ? facObj.name : String(fac)).toLowerCase();
    let iconName = facObj?.icon || 'stars';
    let title = facObj ? facObj.name : String(fac);

    if (!facObj?.icon || facObj.icon === 'stars') {
      if (facName.includes('wifi')) iconName = 'wifi';
      else if (facName.includes('kolam') || facName.includes('pool')) iconName = 'pool';
      else if (facName.includes('spa') || facName.includes('wellness')) iconName = 'spa';
      else if (facName.includes('restoran') || facName.includes('restaurant')) iconName = 'restaurant';
      else if (facName.includes('gym') || facName.includes('fitness')) iconName = 'fitness_center';
    }

    return (
      <div key={idx} className="p-1.5 rounded-lg bg-[#F4F6F4] border border-[#E2E8E2] flex items-center justify-center" title={title}>
        <span className="material-symbols-outlined text-xs md:text-sm text-[#5F7161]">
          {iconName}
        </span>
      </div>
    );
  };

  const facilities = Array.isArray(hotel.facilities) ? hotel.facilities : [];

  return (
    <Link
      to={buildDetailUrl()}
      className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-xs hover:shadow-md hover:border-[#5F7161]/20 hover:-translate-y-0.5 transition-all duration-300 group flex flex-col h-full text-left cursor-pointer"
    >
      <div className="relative aspect-4/3 md:h-48 overflow-hidden bg-[#F2EFE9] shrink-0">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="material-symbols-outlined text-[#8C968D] text-3xl md:text-5xl mb-1 opacity-60">
              image_not_supported
            </span>
            <p className="font-label-md text-[10px] md:text-xs font-semibold text-[#8C968D] uppercase tracking-wider">
              Belum Ada Foto
            </p>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 bg-[#1C251D]/75 backdrop-blur-xs text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-lg">
          {cityName}
        </div>

        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-black/5">
          {verifiedStar ? (
            <>
              <span className="material-symbols-outlined text-[#D97706] text-xs md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-label-sm text-[11px] md:text-xs font-bold text-[#1C251D]">
                {verifiedStar} Bintang
              </span>
            </>
          ) : (
            <span className="font-label-sm text-[10px] md:text-xs font-semibold text-[#8C968D]">Belum Terverifikasi</span>
          )}
        </div>
      </div>

      <div className="p-3.5 md:p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-headline-md text-xs md:text-base font-bold text-[#1C251D] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#5F7161] transition-colors">
            {hotel.name}
          </h3>

          <div className="flex items-center gap-1 text-[#59635A] mb-3 text-[10px] md:text-xs">
            <span className="material-symbols-outlined text-xs md:text-base text-[#5F7161] shrink-0">location_on</span>
            <span className="font-body-md truncate">
              {hotel.address || cityName}
            </span>
          </div>

          {facilities.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {facilities.slice(0, 4).map(renderFacilityIcon)}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#F0EBE1] mt-auto">
          <p className="text-[10px] md:text-xs text-[#7A857B] mb-0.5 font-medium">Mulai dari</p>
          <div className="flex items-baseline gap-1">
            <span className="font-headline-md text-sm md:text-lg font-extrabold text-[#5F7161]">
              Rp {formattedPrice}
            </span>
            <span className="text-[10px] md:text-xs text-[#7A857B]">/ malam</span>
          </div>
          {reviewRating > 0 && (
            <p className="text-[10px] text-[#8C968D] mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px] text-[#9CA3AF]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {reviewRating.toFixed(1)}{reviewCount > 0 ? ` · ${reviewCount} ulasan` : " · ulasan tamu"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;