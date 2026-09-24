import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { cachedGet } from "../../services/apiCache";
import { getStorageUrl } from "../../services/imageUrl";
import ReviewSection from "../../components/ReviewSection";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // State untuk menangani gambar kamar yang error/broken URL
  const [imgErrors, setImgErrors] = useState({});

  // Filter States untuk Kamar
  const initialAdults = searchParams.get("adults") || "";
  const initialChildren = searchParams.get("children") || "";
  const [filterAdults, setFilterAdults] = useState(initialAdults);
  const [filterChildren, setFilterChildren] = useState(initialChildren);
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [filterBedType, setFilterBedType] = useState("all");
  const [filterRoomName, setFilterRoomName] = useState("");
  const [filterBreakfast, setFilterBreakfast] = useState(false);
  const [filterSmoking, setFilterSmoking] = useState(false);
  const [filterRefundable, setFilterRefundable] = useState(false);

  // Pagination Kamar
  const ROOMS_PER_PAGE = 5;
  const [roomPage, setRoomPage] = useState(1);

  const lightboxContainerRef = useRef(null);

  useEffect(() => {
    if (lightboxOpen) {
      setScale(1);
      setPanX(0);
      setPanY(0);
    }
  }, [lightboxOpen, lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    if (lightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [lightboxOpen]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(Math.max(s + delta, 0.5), 3));
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: panX, y: panY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanX(dragOffset.x + dx);
    setPanY(dragOffset.y + dy);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchHotelDetail = async () => {
      setLoading(true);

      try {
        const { data: responseData, fromCache } = await cachedGet(`/hotels/${id}`);
        if (responseData && responseData.data) {
          const apiData = responseData.data;

          const mappedRooms = (apiData.room_types || []).map((rt) => {
            const thumbnailPhoto =
              rt.photos && rt.photos.length > 0
                ? rt.photos.find((p) => p.is_thumbnail) || rt.photos[0]
                : null;
            const photoPath = thumbnailPhoto ? thumbnailPhoto.photo || thumbnailPhoto.url : null;
            const roomImage = photoPath ? getStorageUrl(photoPath) : null;

            return {
              id: rt.id,
              name: rt.name,
              type: rt.type || "Standard",
              price: rt.weekday_price,
              weekday_price: rt.weekday_price,
              weekend_price: rt.weekend_price,
              thumbnail: roomImage,
              hasPhoto: !!roomImage,
              capacity_adult: rt.capacity_adult ?? 2,
              capacity_child: rt.capacity_child ?? 0,
              capacity: `${rt.capacity_adult ?? 2} Dewasa, ${rt.capacity_child ?? 0} Anak`,
              description: rt.description,
              bed: rt.bed || (rt.description?.includes("Bed") ? rt.description : "1 King Bed"),
              breakfast: Boolean(rt.breakfast), // Konversi murni ke boolean
              smoking_area: Boolean(rt.smoking_area), // Konversi murni ke boolean
              is_refundable: rt.is_refundable !== undefined ? Boolean(rt.is_refundable) : true,
              stock: rt.stock,
            };
          });

          setHotel({
            ...apiData,
            rooms: mappedRooms,
          });
        } else {
          setHotel(null);
        }
        if (fromCache) {
          console.debug(`[Cache Hit] HotelDetail id=${id} loaded from cache`);
        }
      } catch (err) {
        console.error("Backend Error / Gagal memuat data hotel:", err);
        setHotel(null);
      }
      setLoading(false);
    };

    fetchHotelDetail();
  }, [id]);

  const [liveRating, setLiveRating] = useState(0);
  useEffect(() => {
    setLiveRating(Number(hotel?.rating || hotel?.average_rating || 0));
  }, [hotel]);

  const filteredRooms = useMemo(() => {
    if (!hotel || !hotel.rooms) return [];

    return hotel.rooms.filter((room) => {
      if (filterAdults && Number(room.capacity_adult) < Number(filterAdults)) return false;
      if (filterChildren && Number(room.capacity_child) < Number(filterChildren)) return false;
      if (filterRoomType !== "all" && room.type?.toLowerCase() !== filterRoomType.toLowerCase()) return false;
      if (filterRoomName.trim() && !room.name.toLowerCase().includes(filterRoomName.toLowerCase())) return false;
      if (filterBedType !== "all") {
        const bedStr = (room.bed || "").toLowerCase();
        if (!bedStr.includes(filterBedType.toLowerCase())) return false;
      }
      if (filterBreakfast && !room.breakfast) return false;
      if (filterSmoking && !room.smoking_area) return false;
      if (filterRefundable && !room.is_refundable) return false;

      return true;
    });
  }, [
    hotel,
    filterAdults,
    filterChildren,
    filterRoomType,
    filterBedType,
    filterRoomName,
    filterBreakfast,
    filterSmoking,
    filterRefundable,
  ]);

  useEffect(() => {
    setRoomPage(1);
  }, [
    filterAdults,
    filterChildren,
    filterRoomType,
    filterBedType,
    filterRoomName,
    filterBreakfast,
    filterSmoking,
    filterRefundable,
  ]);

  const totalRoomPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) || 1;
  const paginatedRooms = useMemo(
    () => filteredRooms.slice((roomPage - 1) * ROOMS_PER_PAGE, roomPage * ROOMS_PER_PAGE),
    [filteredRooms, roomPage]
  );

  const handleResetRoomFilters = () => {
    setFilterAdults("");
    setFilterChildren("");
    setFilterRoomType("all");
    setFilterBedType("all");
    setFilterRoomName("");
    setFilterBreakfast(false);
    setFilterSmoking(false);
    setFilterRefundable(false);
  };

  const getImageUrl = (photoItem) => {
    if (!photoItem) return null;
    let path = typeof photoItem === "object" ? photoItem.photo || photoItem.url || photoItem.image_path : photoItem;
    if (!path) return null;
    return getStorageUrl(path);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-8 bg-[#E8E2D9]/60 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#E8E2D9]/60 rounded w-1/4 mb-6"></div>
        <div className="h-[500px] bg-[#E8E2D9]/60 rounded-3xl mb-8"></div>
        <div className="h-32 bg-[#E8E2D9]/60 rounded-2xl"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="w-full max-w-[1280px] mx-auto py-20 text-center">
        <h2 className="font-headline-md text-2xl font-bold mb-4 text-[#1C251D]">Hotel Tidak Ditemukan</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-[#5F7161] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#4D5E4F] transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const rawPhotos = (hotel.photos && hotel.photos.length > 0 ? hotel.photos : []).filter((p) => {
    const pth = typeof p === "object" ? p.photo || p.url || p.image_path : p;
    return !!pth;
  });

  const thumbObj = hotel && hotel.thumbnail != null ? hotel.thumbnail : null;
  const hotelThumb = thumbObj
    ? typeof thumbObj === "object"
      ? thumbObj.photo || thumbObj.url || thumbObj.image_path || null
      : thumbObj
    : null;

  const resolvedUrls = rawPhotos.map(getImageUrl).filter(Boolean);
  if (hotelThumb) {
    const resolvedThumb = getImageUrl(hotelThumb);
    if (resolvedThumb && !resolvedUrls.includes(resolvedThumb)) {
      resolvedUrls.unshift(resolvedThumb);
    }
  }

  const photosList = Array.from(new Set(resolvedUrls));
  const hasHotelPhotos = photosList.length > 0;

  const facilitiesList = Array.isArray(hotel.facilities) ? hotel.facilities : [];

  const getFacilityIcon = (fac) => {
    if (typeof fac === "object" && fac?.icon && fac.icon !== "stars") {
      return fac.icon;
    }
    const name = String(typeof fac === "object" ? fac.name : fac || "").toLowerCase();
    if (name.includes("wifi")) return "wifi";
    if (name.includes("kolam") || name.includes("pool")) return "pool";
    if (name.includes("gym") || name.includes("kebugaran") || name.includes("fitness")) return "fitness_center";
    if (name.includes("restoran") || name.includes("restaurant") || name.includes("bar")) return "restaurant";
    if (name.includes("spa") || name.includes("wellness") || name.includes("pijat")) return "spa";
    if (name.includes("parkir") || name.includes("parking")) return "local_parking";
    if (name.includes("ac") || name.includes("air cond")) return "ac_unit";
    if (name.includes("tv")) return "tv";
    return "stars";
  };

  const hotelCityName = typeof hotel.city === "object" ? hotel.city?.city : hotel.city || "Bandung";
  const hotelAddress = hotel.address || `${hotelCityName}, Jawa Barat`;

  const verifiedStar = hotel?.star_rating ? Number(hotel.star_rating) : null;
  const starCount = verifiedStar || 0;
  const reviewCount = Number(hotel?.reviews_count ?? hotel?.total_review ?? hotel?.total_reviews ?? 0);

  const handleReviewSubmitted = (newStats) => {
    if (newStats?.average_rating) {
      setLiveRating(Number(newStats.average_rating));
    }
  };

  const handleBookRoom = (e, room) => {
    e.preventDefault();
    const targetHotelId = hotel?.id || id || 1;
    const targetRoomId = room?.id || 101;
    navigate(`/booking/${targetHotelId}/${targetRoomId}`);
  };

  const hasActiveFilters =
    filterAdults ||
    filterChildren ||
    filterRoomType !== "all" ||
    filterBedType !== "all" ||
    filterRoomName ||
    filterBreakfast ||
    filterSmoking ||
    filterRefundable;

  return (
    <div className="bg-[#FAF8F5] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-20 text-left">
        {/* Photo Gallery */}
        <section className="mb-10">
          {hasHotelPhotos ? (
            photosList.length === 1 ? (
              <div
                className="w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden shadow-xs bg-[#E8E2D9] cursor-pointer border border-[#E8E2D9]"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
              >
                <img src={photosList[0]} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[450px] md:h-[580px] rounded-3xl overflow-hidden shadow-xs border border-[#E8E2D9]">
                <div
                  className="md:col-span-2 md:row-span-2 h-full w-full relative group overflow-hidden bg-[#E8E2D9] cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={photosList[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {photosList[1] && (
                  <div
                    className="hidden md:block h-full w-full relative group overflow-hidden bg-[#E8E2D9] cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(1);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photosList[1]}
                      alt="Room detail 1"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                {photosList[2] && (
                  <div
                    className="hidden md:block h-full w-full relative group overflow-hidden bg-[#E8E2D9] cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(2);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photosList[2]}
                      alt="Room detail 2"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                {photosList[3] && (
                  <div
                    className="hidden md:block h-full w-full relative group overflow-hidden bg-[#E8E2D9] cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(3);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photosList[3]}
                      alt="Room detail 3"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                {photosList[4] && (
                  <div
                    className="hidden md:block h-full w-full relative group overflow-hidden bg-[#E8E2D9] cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(4);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photosList[4]}
                      alt="Room detail 4"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center hover:bg-black/55 transition-colors">
                      <span className="text-white font-label-md text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                        Lihat Semua Foto ({photosList.length})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="h-[350px] md:h-[450px] rounded-3xl bg-white border border-[#E8E2D9] flex flex-col items-center justify-center text-center p-8 shadow-xs">
              <span className="material-symbols-outlined text-[#5F7161] text-7xl mb-4 opacity-50">
                image_not_supported
              </span>
              <h3 className="font-headline-md text-2xl font-bold text-[#1C251D] mb-2">Belum Ada Foto Hotel</h3>
              <p className="font-body-md text-sm text-[#5A625B] max-w-md">
                Pihak hotel belum mengunggah foto galeri. Lihat bagian Pilihan Kamar di bawah untuk melihat foto tipe kamar.
              </p>
            </div>
          )}
        </section>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Info & Description & Amenities Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card 1: Hotel Info & Description */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-[#E8E2D9] text-left">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex text-[#D97706]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-lg"
                      style={{
                        fontVariationSettings: i < starCount ? "'FILL' 1" : "'FILL' 0",
                        color: i < starCount ? "#D97706" : "#E2E8E2",
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                {verifiedStar ? (
                  <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full font-label-sm text-xs font-bold">
                    {verifiedStar} Bintang
                  </span>
                ) : (
                  <span className="bg-[#F3F4F3] text-[#8C968D] border border-[#E2E8E2] px-3 py-1 rounded-full font-label-sm text-xs font-semibold">
                    Belum Terverifikasi
                  </span>
                )}
              </div>
              {liveRating > 0 && (
                <p className="text-xs text-[#8C968D] mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#9CA3AF]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {liveRating.toFixed(1)}
                  {reviewCount > 0 ? ` · ${reviewCount} ulasan` : " · ulasan tamu"}
                </p>
              )}

              <h1 className="font-headline-xl text-3xl md:text-4xl font-extrabold text-[#1C251D] mb-4 leading-tight">
                {hotel.name}
              </h1>

              <div className="flex items-start gap-2 text-[#5A625B] mb-6">
                <span className="material-symbols-outlined text-[#5F7161] mt-0.5 shrink-0">location_on</span>
                <p className="font-body-md text-sm md:text-base leading-snug">{hotelAddress}</p>
              </div>

              <hr className="border-[#F0EBE1] my-6" />

              <div>
                <h3 className="font-headline-md text-lg font-bold text-[#1C251D] mb-3">Tentang Hotel</h3>
                <p className="font-body-md text-sm md:text-base text-[#5A625B] leading-relaxed">
                  {hotel.description ||
                    `Terletak di lokasi strategis ${hotelCityName}, ${hotel.name} menawarkan perpaduan sempurna antara kemewahan modern dan kenyamanan alam yang menenangkan.`}
                </p>
              </div>
            </div>

            {/* Card 2: Fasilitas Hotel */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-[#E8E2D9] text-left">
              <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-[#1C251D] mb-6 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#5F7161] text-2xl">home_repair_service</span>
                Fasilitas Hotel
              </h2>
              {facilitiesList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {facilitiesList.map((fac, idx) => {
                    const facName = typeof fac === "object" ? fac.name : String(fac);
                    const iconName = getFacilityIcon(fac);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F7F6F2] hover:bg-[#EFECE6] border border-[#E2DDD3] transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#5F7161]/10 text-[#5F7161] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">{iconName}</span>
                        </div>
                        <span className="font-label-md text-xs font-bold text-[#1C251D] truncate">{facName}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#8A948C] italic bg-[#F7F6F2] p-4 rounded-2xl border border-[#E2DDD3]">
                  Belum ada fasilitas khusus yang terdaftar untuk hotel ini.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Location Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E8E2D9] text-left space-y-5 sticky top-24">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5F7161]/10 text-[#5F7161] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">map</span>
                </div>
                <h2 className="font-headline-lg text-xl font-bold text-[#1C251D]">Lokasi Hotel</h2>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-xs relative h-60 bg-[#F7F6F2]">
                <iframe
                  title={`Peta Lokasi ${hotel.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    (hotel.name || "") + " " + (hotel.address || hotelCityName)
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <p className="font-label-md text-sm font-bold text-[#1C251D]">{hotel.name}</p>
                  <p className="font-body-md text-xs text-[#5A625B] mt-1 leading-relaxed">{hotelAddress}</p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hotel.name + " " + hotelAddress
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#5F7161] hover:bg-[#4D5E4F] text-white rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Room Types & Availability Section */}
        <section className="mt-16 pt-10 border-t border-[#E8E2D9]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#5F7161] mb-1">
                Pilihan Kamar
              </h2>
              <p className="font-body-md text-xs text-[#5A625B]">
                Menampilkan {paginatedRooms.length} dari {(hotel.rooms || []).length} tipe kamar tersedia (hal.{" "}
                {roomPage}/{totalRoomPages})
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetRoomFilters}
                className="text-xs text-[#5F7161] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset Filter Kamar
              </button>
            )}
          </div>

          {/* Room Filter Box */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 mb-8 shadow-xs">
            <h3 className="font-label-md text-xs font-bold text-[#5F7161] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">tune</span>
              Filter Kamar Sesuai Kebutuhan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="border border-[#E2DDD3] rounded-2xl p-3 bg-[#F7F6F2] focus-within:bg-white focus-within:border-[#5F7161] transition-colors text-left">
                <label className="block font-label-sm text-[10px] font-bold text-[#5A625B] uppercase tracking-wider mb-1">
                  Tipe Kamar
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[#5F7161] text-base select-none">
                    meeting_room
                  </span>
                  <select
                    value={filterRoomType}
                    onChange={(e) => setFilterRoomType(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-[#1C251D] outline-none cursor-pointer"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="standard">Standar</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="border border-[#E2DDD3] rounded-2xl p-3 bg-[#F7F6F2] transition-colors text-left">
                <label className="block font-label-sm text-[10px] font-bold text-[#5A625B] uppercase tracking-wider mb-1">
                  Min. Dewasa
                </label>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <button
                    onClick={() => setFilterAdults((prev) => Math.max(0, (Number(prev) || 0) - 1) || "")}
                    disabled={!filterAdults || Number(filterAdults) <= 0}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#5F7161] text-white hover:bg-[#4D5E4F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold shrink-0"
                  >
                    −
                  </button>
                  <span className="font-body-md font-bold text-[#1C251D] text-sm min-w-8 text-center">
                    {filterAdults || 0}
                  </span>
                  <button
                    onClick={() => setFilterAdults(String((Number(filterAdults) || 0) + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#5F7161] text-white hover:bg-[#4D5E4F] transition-colors text-sm font-bold shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border border-[#E2DDD3] rounded-2xl p-3 bg-[#F7F6F2] transition-colors text-left">
                <label className="block font-label-sm text-[10px] font-bold text-[#5A625B] uppercase tracking-wider mb-1">
                  Min. Anak
                </label>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <button
                    onClick={() => setFilterChildren((prev) => Math.max(0, (Number(prev) || 0) - 1) || "")}
                    disabled={!filterChildren || Number(filterChildren) <= 0}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#5F7161] text-white hover:bg-[#4D5E4F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold shrink-0"
                  >
                    −
                  </button>
                  <span className="font-body-md font-bold text-[#1C251D] text-sm min-w-8 text-center">
                    {filterChildren || 0}
                  </span>
                  <button
                    onClick={() => setFilterChildren(String((Number(filterChildren) || 0) + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#5F7161] text-white hover:bg-[#4D5E4F] transition-colors text-sm font-bold shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border border-[#E2DDD3] rounded-2xl p-3 bg-[#F7F6F2] focus-within:bg-white focus-within:border-[#5F7161] transition-colors text-left">
                <label className="block font-label-sm text-[10px] font-bold text-[#5A625B] uppercase tracking-wider mb-1">
                  Tipe Kasur
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[#5F7161] text-base select-none">bed</span>
                  <select
                    value={filterBedType}
                    onChange={(e) => setFilterBedType(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-[#1C251D] outline-none cursor-pointer"
                  >
                    <option value="all">Semua Jenis Kasur</option>
                    <option value="king">King Bed</option>
                    <option value="queen">Queen Bed</option>
                    <option value="twin">Twin Bed</option>
                    <option value="single">Single Bed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-3 border-t border-[#F0EBE1]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C251D] hover:text-[#5F7161] transition-colors">
                <input
                  type="checkbox"
                  checked={filterBreakfast}
                  onChange={(e) => setFilterBreakfast(e.target.checked)}
                  className="rounded border-[#E2DDD3] text-[#5F7161] focus:ring-[#5F7161] w-4 h-4 cursor-pointer"
                />
                Gratis Sarapan
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C251D] hover:text-[#5F7161] transition-colors">
                <input
                  type="checkbox"
                  checked={filterSmoking}
                  onChange={(e) => setFilterSmoking(e.target.checked)}
                  className="rounded border-[#E2DDD3] text-[#5F7161] focus:ring-[#5F7161] w-4 h-4 cursor-pointer"
                />
                Area Merokok (Smoking)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C251D] hover:text-[#5F7161] transition-colors">
                <input
                  type="checkbox"
                  checked={filterRefundable}
                  onChange={(e) => setFilterRefundable(e.target.checked)}
                  className="rounded border-[#E2DDD3] text-[#5F7161] focus:ring-[#5F7161] w-4 h-4 cursor-pointer"
                />
                Bisa Refund
              </label>
            </div>
          </div>

          {/* Rooms List Rendering */}
          {filteredRooms && filteredRooms.length > 0 ? (
            <div className="space-y-6">
              {paginatedRooms.map((room) => {
                const roomPrice = Number(room.price || room.weekday_price || 1250000);
                const weekendPrice = Math.round(roomPrice * 1.35);

                return (
                  <div
                    key={room.id}
                    className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="w-full md:w-72 lg:w-80 shrink-0 min-h-[200px] md:min-h-[250px] relative bg-[#E8E2D9] overflow-hidden">
                      {room.thumbnail && !imgErrors[room.id] ? (
                        <img
                          src={room.thumbnail}
                          alt={room.name || "Kamar Hotel"}
                          onError={() => setImgErrors((prev) => ({ ...prev, [room.id]: true }))}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6">
                          <span className="material-symbols-outlined text-[#5F7161] text-5xl mb-3 opacity-60">
                            no_photography
                          </span>
                          <p className="font-label-md text-xs font-bold text-[#5F7161] uppercase tracking-wider">
                            Belum Ada Foto Kamar
                          </p>
                          <p className="font-body-md text-[11px] text-[#5A625B] mt-1 opacity-80">
                            Admin hotel belum mengunggah foto untuk tipe kamar ini.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-grow min-w-0 text-left">
                      <div>
                        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                          <h3 className="font-headline-md text-xl font-bold text-[#1C251D]">
                            {room.name || room.type || "Deluxe Room"}
                          </h3>
                          <span className="bg-[#5F7161]/10 text-[#5F7161] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-sm">group</span>
                            {room.capacity || "2 Tamu"}
                          </span>
                        </div>

                        <p className="font-body-md text-sm text-[#5A625B] mb-4 line-clamp-3 leading-relaxed">
                          {room.description ||
                            `Kamar seluas 45 meter persegi dengan ${
                              room.bed || "1 King Bed"
                            }, pemandangan memukau, dan kamar mandi marmer yang luas.`}
                        </p>

                        {/* Features Checkmarks (Sudah Aman dari Angka 0) */}
                        <div className="flex flex-wrap gap-2.5 mb-3 text-xs">
                          {Boolean(room.bed) && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#5F7161]/10 border border-[#5F7161]/20 text-[#5F7161] font-bold">
                              <span className="material-symbols-outlined text-[14px]">bed</span>
                              {room.bed}
                            </div>
                          )}

                          {Boolean(room.breakfast) && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#5F7161]/10 border border-[#5F7161]/20 text-[#5F7161] font-bold">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Sarapan Termasuk
                            </div>
                          )}

                          {Boolean(room.smoking_area) && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold">
                              <span className="material-symbols-outlined text-[14px]">smoking_rooms</span>
                              Smoking Area
                            </div>
                          )}

                          {Boolean(room.type) && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#A0522D]/10 border border-[#A0522D]/20 text-[#A0522D] font-bold uppercase tracking-wide">
                              <span className="material-symbols-outlined text-[14px]">apartment</span>
                              {room.type}
                            </div>
                          )}

                          <div
                            className={
                              room.is_refundable
                                ? "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-bold"
                                : "inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-bold"
                            }
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {room.is_refundable ? "verified" : "block"}
                            </span>
                            {room.is_refundable ? "Bisa Refund" : "Non-Refundable"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 pt-4 border-t border-[#F0EBE1] gap-4">
                        <div>
                          <p className="text-xs text-[#8A948C] line-through">
                            Rp {weekendPrice.toLocaleString("id-ID")} (Weekend)
                          </p>
                          <p className="font-headline-lg text-2xl font-extrabold text-[#5F7161]">
                            Rp {roomPrice.toLocaleString("id-ID")}{" "}
                            <span className="text-xs font-normal text-[#5A625B]">/ malam (Weekday)</span>
                          </p>
                          {room.stock !== undefined && room.stock !== null ? (
                            room.stock <= 3 ? (
                              <p className="text-xs text-[#ba1a1a] font-bold mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  local_fire_department
                                </span>
                                Hanya sisa {room.stock} kamar!
                              </p>
                            ) : (
                              <p className="text-xs text-[#4F6F52] font-bold mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Tersedia ({room.stock} kamar)
                              </p>
                            )
                          ) : null}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => navigate(`/hotels/${hotel?.id || id || 1}/rooms/${room?.id || 101}`)}
                            className="w-full sm:w-auto border border-[#5F7161] text-[#5F7161] font-label-md text-xs font-bold px-5 py-3 rounded-2xl hover:bg-[#5F7161]/10 transition-colors cursor-pointer text-center"
                          >
                            Detail Kamar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleBookRoom(e, room)}
                            className="w-full sm:w-auto bg-[#5F7161] text-white font-label-md text-xs font-bold px-6 py-3 rounded-2xl hover:bg-[#4D5E4F] transition-colors shadow-xs cursor-pointer text-center"
                          >
                            Pilih Kamar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {totalRoomPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                  <p className="text-xs text-[#5A625B]">
                    Halaman <span className="font-bold text-[#5F7161]">{roomPage}</span> dari {totalRoomPages}{" "}
                    — menampilkan {(roomPage - 1) * ROOMS_PER_PAGE + 1}–
                    {Math.min(roomPage * ROOMS_PER_PAGE, filteredRooms.length)} dari {filteredRooms.length}{" "}
                    kamar
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRoomPage((p) => Math.max(1, p - 1))}
                      disabled={roomPage === 1}
                      className="px-4 py-2 border border-[#E8E2D9] text-[#5F7161] rounded-xl text-xs font-bold hover:bg-[#F7F6F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ‹ Sebelumnya
                    </button>
                    {Array.from({ length: totalRoomPages }).map((_, idx) => (
                      <button
                        key={idx + 1}
                        type="button"
                        onClick={() => setRoomPage(idx + 1)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          roomPage === idx + 1
                            ? "bg-[#5F7161] text-white shadow-xs"
                            : "border border-[#E8E2D9] text-[#5F7161] hover:bg-[#F7F6F2]"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRoomPage((p) => Math.min(totalRoomPages, p + 1))}
                      disabled={roomPage === totalRoomPages}
                      className="px-4 py-2 border border-[#E8E2D9] text-[#5F7161] rounded-xl text-xs font-bold hover:bg-[#F7F6F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Berikutnya ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E2D9] shadow-xs">
              <span className="material-symbols-outlined text-4xl text-[#8A948C] mb-2">filter_alt_off</span>
              <h4 className="font-headline-md text-lg font-bold text-[#1C251D] mb-1">
                Kamar Tidak Ditemukan
              </h4>
              <p className="text-[#5A625B] text-sm mb-4">
                Tidak ada tipe kamar yang cocok dengan kriteria filter yang Anda pilih.
              </p>
              <button
                type="button"
                onClick={handleResetRoomFilters}
                className="bg-[#5F7161] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#4D5E4F] transition-colors"
              >
                Reset Filter Kamar
              </button>
            </div>
          )}
        </section>

        <ReviewSection hotelId={id} roomTypes={hotel?.rooms || []} onReviewSubmitted={handleReviewSubmitted} />
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <div
            ref={lightboxContainerRef}
            className="relative w-full h-full flex items-center justify-center touch-none select-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-gray-300 cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
            {photosList.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300 cursor-pointer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setLightboxIndex((i) => (i - 1 + photosList.length) % photosList.length)}
                >
                  ‹
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300 cursor-pointer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setLightboxIndex((i) => (i + 1) % photosList.length)}
                >
                  ›
                </button>
              </>
            )}
            <img
              src={photosList[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200"
              style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }}
              draggable={false}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {photosList.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;