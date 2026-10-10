import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getStorageUrl } from '../../services/imageUrl';

const HotelCard = ({ hotel, adults, children, variant = "vertical", customUrl }) => {
  const [urlSearchParams] = useSearchParams();
  const location = useLocation();
  const [imgError, setImgError] = useState(false);

  const effectiveAdults = (adults ?? Number(urlSearchParams.get('adults'))) || 0;
  const effectiveChildren = (children ?? Number(urlSearchParams.get('children'))) || 0;
  const effectiveCheckIn = urlSearchParams.get('check_in') || urlSearchParams.get('check_in_date') || urlSearchParams.get('checkIn') || '';
  const effectiveCheckOut = urlSearchParams.get('check_out') || urlSearchParams.get('check_out_date') || urlSearchParams.get('checkOut') || '';

  const buildTargetUrl = () => {
    if (customUrl) return customUrl;

    const params = new URLSearchParams();
    if (effectiveAdults > 0) params.set('adults', effectiveAdults);
    if (effectiveChildren > 0) params.set('children', effectiveChildren);
    if (effectiveCheckIn) params.set('check_in', effectiveCheckIn);
    if (effectiveCheckOut) params.set('check_out', effectiveCheckOut);

    // Jika diklik di Landing Page ('/'), arahkan ke /hotels?selected=ID agar HotelList HANYA menampilkan 1 hotel ini
    if (location.pathname === '/' || location.pathname === '') {
      params.set('selected', hotel?.id);
      const qs = params.toString();
      return `/hotels?${qs}`;
    }

    // Jika sudah berada di /hotels, klik kartu baru mengarahkan ke detail hotel (/hotels/:id)
    const qs = params.toString();
    return `/hotels/${hotel?.id}${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    setImgError(false);
  }, [hotel?.thumbnail, hotel?.photos]);

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

  const rawPrice = Number(hotel?.starting_price || hotel?.price || (hotel?.rooms && hotel.rooms[0]?.price) || 0);
  const formattedPrice = rawPrice > 0 ? rawPrice.toLocaleString('id-ID') : '150.000';

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
      if (facName.includes('wifi') || facName.includes('internet')) iconName = 'wifi';
      else if (facName.includes('kolam') || facName.includes('pool') || facName.includes('renang')) iconName = 'pool';
      else if (facName.includes('spa') || facName.includes('wellness') || facName.includes('pijat')) iconName = 'spa';
      else if (facName.includes('restoran') || facName.includes('restaurant') || facName.includes('makan')) iconName = 'restaurant';
      else if (facName.includes('gym') || facName.includes('fitness') || facName.includes('kebugaran')) iconName = 'fitness_center';
      else if (facName.includes('parkir') || facName.includes('parking')) iconName = 'local_parking';
      else if (facName.includes('resepsionis') || facName.includes('reception') || facName.includes('front desk')) iconName = 'concierge';
      else if (facName.includes('lift') || facName.includes('elevator')) iconName = 'elevator';
      else if (facName.includes('laundry') || facName.includes('cuci')) iconName = 'local_laundry_service';
      else if (facName.includes('ac') || facName.includes('air cond')) iconName = 'ac_unit';
      else iconName = 'hotel';
    }

    return (
      <div key={idx} className="p-1 rounded-md bg-[#F4F6F4] border border-[#E2E8E2] flex items-center justify-center shrink-0" title={title}>
        <span className="material-symbols-outlined text-[14px] text-[#5F7161]">
          {iconName}
        </span>
      </div>
    );
  };

  const facilities = Array.isArray(hotel?.facilities) ? hotel.facilities : [];
  const isHorizontal = variant === "horizontal";

  return (
    <Link
      to={buildTargetUrl()}
      className={`bg-white rounded-xl overflow-hidden border border-[#E8E2D9] shadow-2xs hover:shadow-md hover:border-[#D0C8BC] transition-all duration-200 group flex w-full text-left cursor-pointer ${
        isHorizontal ? "flex-col sm:flex-row" : "flex-col h-full"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-[#F2EFE9] ${
          isHorizontal
            ? "w-full sm:w-48 md:w-56 h-48 sm:h-auto"
            : "w-full h-48 md:h-52"
        }`}
      >
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={hotel?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="material-symbols-outlined text-[#8C968D] text-2xl mb-1 opacity-60">
              image_not_supported
            </span>
            <p className="font-label-md text-[9px] font-semibold text-[#8C968D] uppercase tracking-wider">
              Belum Ada Foto
            </p>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-[#1C251D]/75 backdrop-blur-xs text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md">
          {cityName}
        </div>

        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs border border-black/5">
          <span className="material-symbols-outlined text-[#D97706] text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-label-sm text-[10px] font-bold text-[#1C251D]">
            {verifiedStar ? verifiedStar : 'Belum Terverifikasi'}
          </span>
        </div>
      </div>

      <div className={`flex flex-col flex-grow justify-between min-w-0 ${isHorizontal ? "p-3 md:p-3.5" : "p-3"}`}>
        <div>
          <h3 className={`font-headline-md font-bold text-[#1C251D] leading-snug line-clamp-1 mb-1 group-hover:text-[#5F7161] transition-colors ${
            isHorizontal ? "text-sm md:text-base" : "text-xs md:text-sm"
          }`}>
            {hotel?.name}
          </h3>

          <div className="flex items-start gap-1 text-[#59635A] mb-2 text-[11px] md:text-xs">
            <span className="material-symbols-outlined text-[13px] md:text-[15px] text-[#5F7161] shrink-0 mt-0.5">location_on</span>
            <span className="font-body-md line-clamp-2 leading-tight">
              {hotel?.address || cityName}
            </span>
          </div>

          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {facilities.slice(0, isHorizontal ? 5 : 4).map(renderFacilityIcon)}
            </div>
          )}
        </div>

        <div className={`pt-2 border-t border-[#F0EBE1] mt-auto flex flex-col ${isHorizontal ? "sm:flex-row sm:justify-between items-center" : ""} items-start`}>
          <div className="flex flex-col">
            <p className="text-[9px] md:text-[10px] text-[#7A857B] font-medium">Mulai dari</p>
            <div className="flex items-baseline gap-0.5">
              <span className={`font-headline-md font-extrabold text-[#5F7161] ${isHorizontal ? "text-sm md:text-base" : "text-xs md:text-sm"}`}>Rp {formattedPrice}</span>
              <span className="text-[9px] md:text-[10px] text-[#7A857B]">/ malam</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#5F7161] mt-1 sm:mt-0">
            <span className="material-symbols-outlined text-[11px]">star_rate</span>
            <span className="font-label-sm">Review {reviewRating} ({reviewCount})</span>
          </div>

          {isHorizontal && (
            <span className="hidden sm:flex items-center gap-0.5 text-[11px] font-semibold text-[#5F7161] group-hover:translate-x-0.5 transition-transform shrink-0">
              Lihat Detail
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;