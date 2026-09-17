import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPublicImageUrl } from '../../services/imageHelper';

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
      return getPublicImageUrl(hotel.thumbnail);
    }
    if (hotel.photos && hotel.photos.length > 0) {
      const firstPhoto = hotel.photos[0];
      const photoPath = typeof firstPhoto === 'object' ? firstPhoto.photo || firstPhoto.url || firstPhoto.image_path : firstPhoto;
      if (photoPath) {
        return getPublicImageUrl(photoPath);
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
    return Number(hotel.rating || hotel.average_rating || 0).toFixed(1);
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
      <div key={idx} className="p-1.5 rounded-lg bg-[#F4F6F4] border border-[#E2E8E2] flex items-center justify-center" title={title}>
        <span className="material-symbols-outlined text-sm text-[#5F7161]">
          {iconName}
        </span>
      </div>
    );
  };

  const facilities = Array.isArray(hotel.facilities) ? hotel.facilities : [];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-sm hover:shadow-xl hover:border-[#D0C8BC] hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full text-left">
      {/* Image Header with Rating Badge */}
      <div className="relative h-48 overflow-hidden bg-[#F2EFE9] shrink-0">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="material-symbols-outlined text-[#8C968D] text-5xl mb-2 opacity-60">
              image_not_supported
            </span>
            <p className="font-label-md text-xs font-semibold text-[#8C968D] uppercase tracking-wider">
              Belum Ada Foto
            </p>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-black/5">
          <span className="material-symbols-outlined text-[#D97706] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-label-sm text-xs font-bold text-[#1C251D]">
            {getRating()}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Hotel Name */}
        <h3 className="font-headline-md text-lg font-bold text-[#1C251D] leading-snug line-clamp-2 mb-2 group-hover:text-[#5F7161] transition-colors">
          {hotel.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-[#59635A] mb-4 text-xs">
          <span className="material-symbols-outlined text-base text-[#5F7161] shrink-0">location_on</span>
          <span className="font-body-md truncate">
            {hotel.address || (typeof hotel.city === 'object' ? hotel.city?.city : hotel.city) || "Bandung, Jawa Barat"}
          </span>
        </div>

        {/* Facilities icons */}
        <div className="flex gap-2 mb-5">
          {facilities.slice(0, 4).map(renderFacilityIcon)}
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-auto pt-4 border-t border-[#F0EBE1] flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium text-[#7A857B] mb-0.5">Mulai dari</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-md text-xl font-extrabold text-[#2C382E]">
                Rp {getPrice()}
              </span>
              <span className="text-[11px] text-[#7A857B]">/ malam</span>
            </div>
          </div>

          <Link
            to={buildDetailUrl()}
            className="w-full bg-[#5F7161] text-white py-2.5 rounded-xl font-label-md text-xs font-semibold hover:bg-[#4D5E4F] active:scale-95 transition-all shadow-sm shadow-[#5F7161]/20 text-center block"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;