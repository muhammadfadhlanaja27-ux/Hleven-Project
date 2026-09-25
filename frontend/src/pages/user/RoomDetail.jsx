import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cachedGet } from "../../services/apiCache";
import { getStorageUrl } from "../../services/imageUrl";
import GuestSelector from "../../components/common/GuestSelector";
import { getInitialSearchValues, saveSearchState, fmtDateStr } from "../../services/searchStorage";

const FACILITY_ICON_MAP = {
  "AC": "ac_unit",
  "Air Conditioning": "ac_unit",
  "AC Area Umum": "ac_unit",
  "TV": "tv",
  "Smart TV": "tv",
  "Television": "tv",
  "Kamar mandi pribadi": "bathtub",
  "Private Bathroom": "bathtub",
  "Bathtub": "bathtub",
  "Balkon": "balcony",
  "Private Balcony": "balcony",
  "Mini fridge": "kitchen",
  "Mini Refrigerator": "kitchen",
  "Kulkas Mini": "kitchen",
  "Hair dryer": "lotion",
  "Hair Dryer": "lotion",
  "Pengering Rambut": "lotion",
  "Meja kerja": "desk",
  "Work Desk": "desk",
  "Lemari": "checkroom",
  "Wardrobe": "checkroom",
  "Closet": "checkroom",
  "Lemari Pakaian": "checkroom",
  "Air mineral": "water_drop",
  "Mineral Water": "water_drop",
  "Air Mineral": "water_drop",
  "Water Heater": "water_drop",
  "Shower": "shower",
  "Toilet": "bathtub",
  "Washtafel": "bathtub",
  "Wi-Fi": "wifi",
  "Wi-Fi Gratis": "wifi",
  "Internet": "wifi",
  "Kolam renang": "pool",
  "Swimming Pool": "pool",
  "Kolam Renang": "pool",
  "Parkir": "local_parking",
  "Parkir Gratis": "local_parking",
  "Parking": "local_parking",
  "Restoran": "restaurant",
  "Restaurant": "restaurant",
  "Gym": "fitness_center",
  "Fitness Center": "fitness_center",
  "Pusat Kebugaran": "fitness_center",
  "Spa": "hot_tub",
  "Spa & Massage": "hot_tub",
  "Spa & Wellness": "hot_tub",
  "Resepsionis 24 jam": "concierge",
  "Reception 24h": "concierge",
  "Front Desk 24h": "concierge",
  "Lift": "elevator",
  "Elevator": "elevator",
  "Laundry": "local_laundry_service",
  "Laundry Service": "local_laundry_service",
  "Safety Box": "lock",
  "Brankas Kamar": "lock",
  "Coffee Maker": "local_cafe",
  "Pembuat Teh/Kopi": "local_cafe",
  "Bar & Lounge": "local_bar",
  "Room Service": "room_service",
  "Bed / Room": "bed",
  "Tempat Tidur": "bed",
  "Hotel General": "hotel",
  "Peralatan Mandi Gratis": "bathtub",
  "Free Toiletries": "bathtub",
};

const getFacilityIcon = (fac) => {
  if (typeof fac === "object" && fac?.icon && fac.icon !== "stars") return fac.icon;
  const name = String(typeof fac === "object" ? fac.name : fac || "").trim();
  if (FACILITY_ICON_MAP[name]) return FACILITY_ICON_MAP[name];
  const lower = name.toLowerCase();
  if (lower.includes("ac") || lower.includes("air condition")) return "ac_unit";
  if (lower.includes("tv") || lower.includes("televisi") || lower.includes("television")) return "tv";
  if (lower.includes("mandi") || lower.includes("bath") || lower.includes("toilet") || lower.includes("kloset") || lower.includes("wash") || lower.includes("washtafel")) return "bathtub";
  if (lower.includes("bathtub") || lower.includes("bak")) return "bathtub";
  if (lower.includes("balkon") || lower.includes("teras") || lower.includes("balcony")) return "balcony";
  if (lower.includes("kulkas") || lower.includes("fridge") || lower.includes("minibar") || lower.includes("refrigerator")) return "kitchen";
  if (lower.includes("meja") || lower.includes("kerja") || lower.includes("desk")) return "desk";
  if (lower.includes("lemari") || lower.includes("wardrobe") || lower.includes("closet")) return "checkroom";
  if (lower.includes("air mineral") || lower.includes("mineral water") || lower.includes("drink") || lower.includes("water heater")) return "water_drop";
  if (lower.includes("shower")) return "shower";
  if (lower.includes("wifi") || lower.includes("internet")) return "wifi";
  if (lower.includes("kolam") || lower.includes("pool") || lower.includes("renang")) return "pool";
  if (lower.includes("parkir") || lower.includes("parking")) return "local_parking";
  if (lower.includes("restoran") || lower.includes("makan") || lower.includes("restaurant")) return "restaurant";
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("kebugaran")) return "fitness_center";
  if (lower.includes("spa") || lower.includes("massage") || lower.includes("wellness")) return "hot_tub";
  if (lower.includes("resepsionis") || lower.includes("reception") || lower.includes("front desk")) return "concierge";
  if (lower.includes("lift") || lower.includes("elevator")) return "elevator";
  if (lower.includes("laundry") || lower.includes("cuci")) return "local_laundry_service";
  if (lower.includes("brankas") || lower.includes("safety box") || lower.includes("safe") || lower.includes("lock")) return "lock";
  if (lower.includes("coffee") || lower.includes("kopi") || lower.includes("tea") || lower.includes("teh")) return "local_cafe";
  if (lower.includes("bar") || lower.includes("lounge")) return "local_bar";
  if (lower.includes("room service")) return "room_service";
  if (lower.includes("bed") || lower.includes("tidur")) return "bed";
  return "star";
};

const RoomDetail = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(Math.max(s + delta, 0.5), 3));
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
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

  const handlePointerUp = () => setIsDragging(false);

  const today = useMemo(() => new Date(), []);
  const init = useMemo(() => getInitialSearchValues(searchParams), [searchParams]);
  const [checkInDate, setCheckInDate] = useState(init.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState(init.checkOutDate);
  const [adults, setAdults] = useState(init.adults);
  const [children, setChildren] = useState(init.children);

  useEffect(() => {
    saveSearchState({ checkIn: checkInDate, checkOut: checkOutDate, adults, children });
  }, [checkInDate, checkOutDate, adults, children]);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setCheckInDate(start);
    setCheckOutDate(end);
  };

  const handleGuestChange = ({ adults: a, children: c }) => {
    setAdults(a);
    setChildren(c);
  };
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const targetHotelId = hotelId || "1";
      const targetRoomId = roomId || "101";

      try {
        const { data: responseData, fromCache } = await cachedGet(`/hotels/${targetHotelId}`);
        if (responseData && responseData.data) {
          const apiHotel = responseData.data;
          const apiRooms = apiHotel.room_types || [];
          const matchedRoomType = apiRooms.find((r) => String(r.id) === String(targetRoomId)) || apiRooms[0];

          if (matchedRoomType) {
            const thumbnailPhoto = matchedRoomType.photos && matchedRoomType.photos.length > 0 
              ? (matchedRoomType.photos.find(p => p.is_thumbnail) || matchedRoomType.photos[0]) 
              : null;
            const photoPath = thumbnailPhoto ? (thumbnailPhoto.photo || thumbnailPhoto.url) : null;
            const roomImage = photoPath ? getStorageUrl(photoPath) : null;

            const facilities = matchedRoomType.facilities || [];
            const policies = matchedRoomType.policies || "";
            const mappedRoom = {
              id: matchedRoomType.id,
              name: matchedRoomType.name,
              price: matchedRoomType.weekday_price,
              weekday_price: matchedRoomType.weekday_price,
              weekend_price: matchedRoomType.weekend_price,
              thumbnail: roomImage,
              capacity: `${matchedRoomType.capacity_adult} Dewasa, ${matchedRoomType.capacity_child} Anak`,
              capacity_adult: matchedRoomType.capacity_adult,
              capacity_child: matchedRoomType.capacity_child,
              description: matchedRoomType.description,
              bed: matchedRoomType.bed || (matchedRoomType.description?.includes("Bed") ? matchedRoomType.description : "1 King Bed"),
              breakfast: matchedRoomType.breakfast,
              smoking_area: matchedRoomType.smoking_area,
              is_refundable: matchedRoomType.is_refundable !== undefined ? matchedRoomType.is_refundable : true,
              stock: matchedRoomType.stock,
              policies,
              facilities,
              photos: matchedRoomType.photos || []
            };

            setHotel(apiHotel);
            setRoom(mappedRoom);
          } else {
            setHotel(apiHotel);
            setRoom(null);
          }
        } else {
          setHotel(null);
          setRoom(null);
        }
        if (fromCache) {
          console.debug(`[Cache Hit] RoomDetail hotel=${targetHotelId} room=${targetRoomId} loaded from cache`);
        }
      } catch (err) {
        console.error("Backend API Error/Offline:", err);
        setHotel(null);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [hotelId, roomId]);

  // Price & Nights Calculation
  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  const roomPrice = Number(room?.price || room?.weekday_price || 3200000);
  const subtotalPrice = roomPrice * nightsCount;
  const taxAndFees = Math.round(subtotalPrice * 0.05);
  const totalPrice = subtotalPrice + taxAndFees;

  const getImageUrl = (photoItem) => {
    if (!photoItem) return null;
    let path = typeof photoItem === "object" ? photoItem.photo || photoItem.url : photoItem;
    if (!path) return null;
    return getStorageUrl(path);
  };

  const roomPhotoUrls = (room?.photos || []).map(getImageUrl).filter(Boolean);
  const hotelPhotoUrls = (hotel?.photos || []).map(getImageUrl).filter(Boolean);
  const rawPhotosList = roomPhotoUrls.length > 0 ? roomPhotoUrls : hotelPhotoUrls;
  const thumbFallback = room?.thumbnail;
  let photosList = rawPhotosList;
  if (photosList.length === 0 && thumbFallback) {
    photosList = [thumbFallback];
  }
  if (photosList.length === 0) {
    photosList = ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23ccc'%3E%3Crect width='400' height='300' fill='%23ccc'/%3E%3Ctext x='200' y='160' font-family='sans-serif' font-size='18' fill='%23666' text-anchor='middle'%3ENo Photo Available%3C/text%3E%3C/svg%3E"];
  }

  // Format Date for URL navigation
  const formatDateForUrl = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleReserve = (e) => {
    e.preventDefault();
    const hId = hotel?.id || hotelId || 1;
    const rId = room?.id || roomId || 101;
    const checkInStr = formatDateForUrl(checkInDate);
    const checkOutStr = formatDateForUrl(checkOutDate);
    const qs = new URLSearchParams({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults: String(adults),
      children: String(children),
    }).toString();
    navigate(`/booking/${hId}/${rId}?${qs}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-6 bg-[#DCCFC0]/40 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-[#DCCFC0]/40 rounded w-1/2 mb-6"></div>
        <div className="h-[500px] bg-[#DCCFC0]/40 rounded-2xl mb-8"></div>
        <div className="h-40 bg-[#DCCFC0]/40 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col gap-10 text-left">
        
        {/* Breadcrumb & Title Area */}
        <section className="flex flex-col gap-4">
          <nav className="flex items-center space-x-2 text-xs font-medium text-[#444842]/80">
            <Link to="/hotels" className="hover:text-[#778873] transition-colors">
              Hotels
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link to={`/hotels/${hotel?.id || 1}`} className="hover:text-[#778873] transition-colors">
              {hotel?.name || "H'Leven Hotel"}
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#778873] font-semibold">{room?.name || "Executive Suite"}</span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#1e1b16] mb-3 leading-tight">
                {room?.name || "Executive Suite with Private Pool"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#444842]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">group</span>
                  {room?.capacity || "2 Adults"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCCFC0]"></div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">bed</span>
                  {room?.bed || "1 King Bed"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCCFC0]"></div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-lg text-[#778873]">aspect_ratio</span>
                  {room?.sqm || "80 sqm"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#DCCFC0]"></div>
                {room?.is_refundable ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20">
                    <span className="material-symbols-outlined text-[#4F6F52] text-[16px]">verified</span>
                    <span className="text-[#4F6F52] font-bold text-xs uppercase tracking-wider">
                      Bisa Refund
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">block</span>
                    <span className="text-[#ba1a1a] font-bold text-xs uppercase tracking-wider">
                      Tidak Bisa Refund
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-xs font-semibold text-[#444842] uppercase tracking-wider">Mulai dari</span>
              <div className="font-headline-lg text-2xl md:text-3xl font-bold text-[#778873]">
                Rp {roomPrice.toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-[#444842]">/ malam</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Photo Mosaic Gallery */}
        {photosList.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-sm">
            <div
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] cursor-pointer"
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
            >
              <img src={photosList[0]} alt="Main Bedroom View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>

            {photosList[1] && (
              <div
                className="hidden md:block relative group overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] cursor-pointer"
                onClick={() => { setLightboxIndex(1); setLightboxOpen(true); }}
              >
                <img src={photosList[1]} alt="Room Detail 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            )}

            {photosList[2] && (
              <div
                className="hidden md:block relative group overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] cursor-pointer"
                onClick={() => { setLightboxIndex(2); setLightboxOpen(true); }}
              >
                <img src={photosList[2]} alt="Room Detail 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            )}

            {photosList[3] && (
              <div
                className="hidden md:block md:col-span-2 relative group overflow-hidden bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] cursor-pointer"
                onClick={() => { setLightboxIndex(3); setLightboxOpen(true); }}
              >
                <img src={photosList[3]} alt="Room Detail 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                  <button
                    type="button"
                    className="bg-[#FDF6ED] text-[#778873] px-6 py-3 rounded-full font-label-md text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-white transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                    View All {photosList.length} Photos
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="h-[350px] md:h-[450px] rounded-2xl bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] border-2 border-dashed border-[#c4c8be] flex flex-col items-center justify-center text-center p-8 shadow-sm">
            <span className="material-symbols-outlined text-[#778873] text-7xl mb-4 opacity-60">image_not_supported</span>
            <h3 className="font-headline-md text-2xl font-bold text-[#778873] mb-2">Belum Ada Foto Kamar</h3>
            <p className="font-body-md text-sm text-[#444842] max-w-md">
              Admin hotel belum mengunggah foto untuk tipe kamar ini.
            </p>
          </section>
        )}

        {/* Main Content Layout: Details vs Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Left Column: Description, Amenities, Policies */}
          <div className="lg:col-span-8 flex flex-col gap-10 pr-0 lg:pr-4">
            
            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-4">
                Tentang Kamar Ini
              </h2>
              <p className="font-body-md text-base text-[#444842] leading-relaxed whitespace-pre-line">
                {room?.description ||
                  `Nikmati privasi dan ketenangan tak tertandingi di ${room?.name || "Executive Suite"}. Dirancang sebagai tempat peristirahatan modern, ruang seluas ${room?.sqm || '80 sqm'} ini menggabungkan kemewahan kontemporer dengan elemen alam yang menenangkan. Kamar ini dilengkapi dengan area santai terpisah, kamar mandi marmer mewah dengan bathtub berukuran besar, serta jendela besar yang menghadap langsung ke panorama alam yang indah.`}
              </p>
            </section>

            <hr className="border-[#DCCFC0]/40" />

            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-6">
                Fasilitas Kamar
              </h2>
              {Array.isArray(room?.facilities) && room.facilities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  {room.facilities.map((fac, idx) => {
                    const facName = typeof fac === "object" ? fac.name : String(fac);
                    const facDesc = typeof fac === "object" ? (fac.description || "") : "";
                    const iconName = getFacilityIcon(fac);
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#778873] text-2xl">{iconName}</span>
                        <div>
                          <h3 className="font-label-md text-sm font-semibold text-[#1e1b16]">{facName}</h3>
                          {facDesc && <p className="font-body-md text-xs text-[#444842]/80 mt-0.5">{facDesc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#8A948C] italic bg-[#F7F6F2] p-4 rounded-2xl border border-[#E2DDD3]">
                  Belum ada fasilitas khusus yang terdaftar untuk kamar ini.
                </p>
              )}
            </section>

            <hr className="border-[#DCCFC0]/40" />

            <section>
              <h2 className="font-headline-md text-2xl font-bold text-[#1e1b16] mb-6">
                Kebijakan Kamar
              </h2>
              {room?.policies ? (
                <div className="text-sm text-[#444842] leading-relaxed whitespace-pre-wrap bg-[#F7F6F2] p-5 rounded-2xl border border-[#E2DDD3]">
                  {room.policies}
                </div>
              ) : (
                <div className="bg-[#F7F6F2] p-5 rounded-2xl border border-[#E2DDD3] space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#1e1b16] text-sm">Waktu Check-in &amp; Check-out</h4>
                    <p className="text-xs text-[#444842] mt-1">Check-in mulai pukul 14:00 WIB. Check-out maksimal pukul 12:00 WIB.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1e1b16] text-sm">Kebijakan Bebas Asap Rokok</h4>
                    <p className="text-xs text-[#444842] mt-1">Semua kamar bebas dari asap rokok. Area merokok khusus tersedia di teras luar.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1e1b16] text-sm">Hewan Peliharaan</h4>
                    <p className="text-xs text-[#444842] mt-1">Hewan peliharaan tidak diperkenankan masuk untuk menjaga higienitas seluruh tamu.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1e1b16] text-sm">Pembatalan</h4>
                    {room?.is_refundable ? (
                      <p className="text-xs text-[#444842] mt-1">
                        <span className="font-bold text-[#4F6F52]">Pembatalan tersedia:</span> Pengembalian dana penuh berlaku hingga 3 hari sebelum jadwal kedatangan.
                      </p>
                    ) : (
                      <p className="text-xs text-[#444842] mt-1">
                        <span className="font-bold text-[#ba1a1a]">Tidak dapat dibatalkan:</span> Kamar ini bersifat non-refundable. Pembayaran tidak dapat dikembalikan dalam kondisi apa pun.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Interactive Sticky Booking Card */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-[100px] bg-[#DCCFC0]/20 border border-[#DCCFC0]/60 rounded-2xl p-6 shadow-md shadow-[#778873]/5">
              <div className="flex justify-between items-baseline mb-6">
                <span className="font-headline-md text-2xl font-bold text-[#778873]">
                  Rp {roomPrice.toLocaleString("id-ID")}
                </span>
                <span className="font-body-md text-xs text-[#444842]">/ malam</span>
              </div>

              {room?.is_refundable ? (
                <div className="mb-6 p-3 rounded-xl bg-[#4F6F52]/10 border border-[#4F6F52]/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4F6F52] text-[18px] mt-0.5 flex-shrink-0">verified</span>
                  <div>
                    <p className="font-label-md text-xs font-bold text-[#4F6F52] uppercase tracking-wider">
                      Bisa Refund
                    </p>
                    <p className="font-body-md text-[11px] text-[#444842] mt-0.5 leading-snug">
                      Pengembalian dana penuh jika dibatalkan H-3 sebelum check-in.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] mt-0.5 flex-shrink-0">block</span>
                  <div>
                    <p className="font-label-md text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                      Non-Refundable
                    </p>
                    <p className="font-body-md text-[11px] text-[#444842] mt-0.5 leading-snug">
                      Reservasi tidak dapat dikembalikan dananya jika dibatalkan.
                    </p>
                  </div>
                </div>
              )}

              {/* Date Range + GuestSelector — mirror LandingPage L228 */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="w-full group flex items-center gap-3 bg-[#FDF6ED] hover:bg-[#EFECE6] px-4 py-3 rounded-xl border border-[#DCCFC0] focus-within:bg-white focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873]/20 transition-all text-left relative z-40">
                  <div className="w-10 h-10 rounded-xl bg-[#778873]/10 group-hover:bg-[#778873] text-[#778873] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="font-label-sm text-[11px] font-bold text-[#7A857B] uppercase tracking-wider cursor-pointer">
                      Check-in &amp; Check-out
                    </label>
                    <DatePicker
                      selectsRange={true}
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      onChange={handleDateRangeChange}
                      minDate={today}
                      monthsShown={2}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Pilih Tanggal Menginap"
                      popperClassName="!z-[9999]"
                      className="w-full bg-transparent border-none p-0 font-body-md text-sm font-bold text-[#1C251D] outline-none cursor-pointer placeholder-[#9EA6A0] truncate"
                    />
                  </div>
                </div>

                <GuestSelector adults={adults} children={children} rooms={1} onGuestChange={handleGuestChange} />
              </div>

              {/* Dynamic Price Breakdown */}
              <div className="space-y-3 mb-6 font-body-md text-xs text-[#444842]">
                <div className="flex justify-between">
                  <span>Rp {roomPrice.toLocaleString("id-ID")} x {nightsCount} malam</span>
                  <span className="font-semibold">Rp {subtotalPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak &amp; Biaya Layanan (5%)</span>
                  <span className="font-semibold">Rp {taxAndFees.toLocaleString("id-ID")}</span>
                </div>
                <hr className="border-[#DCCFC0]/50 my-2" />
                <div className="flex justify-between font-label-md text-sm font-bold text-[#1e1b16]">
                  <span>Total Harga</span>
                  <span className="text-[#778873]">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Reserve Action Button */}
              <button
                type="button"
                onClick={handleReserve}
                className="w-full bg-[#778873] text-white py-3.5 rounded-xl font-label-md text-sm font-semibold hover:bg-[#50604d] transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Pesan Sekarang
              </button>
              <p className="text-center font-body-md text-[11px] text-[#444842] mt-3">
                Anda belum dikenakan biaya pada tahap ini
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Full-screen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>
          <div
            ref={lightboxContainerRef}
            className="relative w-full h-full flex items-center justify-center touch-none select-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
              <button
                className="absolute top-4 right-4 text-white text-3xl z-20 hover:text-gray-300 bg-black/20 p-2 rounded-full transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setLightboxOpen(false)}
              >
                ✕
              </button>
            {photosList.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setLightboxIndex((i) => (i - 1 + photosList.length) % photosList.length)}
                >
                  ‹
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300"
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

export default RoomDetail;