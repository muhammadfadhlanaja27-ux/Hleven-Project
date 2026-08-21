import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cachedGet } from "../../services/apiCache";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const fetchHotelDetail = async () => {
      setLoading(true);

      try {
        const { data: responseData, fromCache } = await cachedGet(`/hotels/${id}`);
        if (responseData && responseData.data) {
          const apiData = responseData.data;
          
          const mappedRooms = (apiData.room_types || []).map((rt) => {
            const thumbnailPhoto = rt.photos && rt.photos.length > 0 
              ? (rt.photos.find(p => p.is_thumbnail) || rt.photos[0]) 
              : null;
            const photoPath = thumbnailPhoto ? (thumbnailPhoto.photo || thumbnailPhoto.url) : null;
            const roomImage = photoPath 
              ? (photoPath.startsWith('http') ? photoPath : `http://localhost:8000/storage/${photoPath.replace(/^\//, '')}`)
              : null;

            return {
              id: rt.id,
              name: rt.name,
              price: rt.weekday_price,
              weekday_price: rt.weekday_price,
              weekend_price: rt.weekend_price,
              thumbnail: roomImage,
              hasPhoto: !!roomImage,
              capacity: `${rt.capacity_adult} Dewasa, ${rt.capacity_child} Anak`,
              description: rt.description,
              bed: rt.description?.includes("Bed") ? rt.description : "1 King Bed",
              breakfast: rt.breakfast,
              smoking_area: rt.smoking_area,
              is_refundable: rt.is_refundable !== undefined ? rt.is_refundable : true,
              stock: rt.stock
            };
          });

          setHotel({
            ...apiData,
            rooms: mappedRooms
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
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [id]);

  const getImageUrl = (photoItem) => {
    if (!photoItem) return null;
    let path = typeof photoItem === "object" ? photoItem.photo || photoItem.url : photoItem;
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://localhost:8000/storage/${path.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-12 animate-pulse text-left">
        <div className="h-8 bg-[#DCCFC0]/40 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#DCCFC0]/40 rounded w-1/4 mb-6"></div>
        <div className="h-[500px] bg-[#DCCFC0]/40 rounded-2xl mb-8"></div>
        <div className="h-32 bg-[#DCCFC0]/40 rounded-xl"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="w-full max-w-[1280px] mx-auto py-20 text-center">
        <h2 className="font-headline-md text-2xl font-bold mb-4 text-[#1e1b16]">Hotel Tidak Ditemukan</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-[#778873] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#50604d] transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Raw Photos List — HANYA foto asli dari API, TIDAK ada default Unsplash
  const rawPhotos = (hotel.photos && hotel.photos.length > 0 ? hotel.photos : [])
    .filter(p => {
      const pth = typeof p === "object" ? (p.photo || p.url || p.image_path) : p;
      return !!pth;
    });

  // Aman dari thumbnail NULL / undefined
  const thumbObj = hotel && hotel.thumbnail != null ? hotel.thumbnail : null;
  const hotelThumb = thumbObj
    ? (typeof thumbObj === "object"
        ? (thumbObj.photo || thumbObj.url || thumbObj.image_path || null)
        : thumbObj)
    : null;
  if (hotelThumb) rawPhotos.unshift(hotelThumb);

  const photosList = rawPhotos
    .map(getImageUrl)
    .filter(url => !!url);
  const hasHotelPhotos = photosList.length > 0;

  // Facility list mapping
  const facilitiesList = hotel.facilities || [
    "WiFi Gratis",
    "Kolam Renang",
    "Pusat Kebugaran",
    "Restoran & Bar",
    "Layanan Spa",
    "Parkir Gratis"
  ];

  const getFacilityIcon = (facNameStr) => {
    const name = String(facNameStr).toLowerCase();
    if (name.includes("wifi")) return "wifi";
    if (name.includes("kolam") || name.includes("pool")) return "pool";
    if (name.includes("gym") || name.includes("kebugaran") || name.includes("fitness")) return "fitness_center";
    if (name.includes("restoran") || name.includes("restaurant") || name.includes("bar")) return "restaurant";
    if (name.includes("spa") || name.includes("wellness")) return "spa";
    if (name.includes("parkir") || name.includes("parking")) return "local_parking";
    return "stars";
  };

  const roomsList = hotel.rooms || [];
  const hotelCityName = typeof hotel.city === "object" ? hotel.city?.city : hotel.city || "Bandung";
  const hotelAddress = hotel.address || `${hotelCityName}, Jawa Barat`;
  const ratingValue = hotel.rating || hotel.average_rating || 4.8;
  const starCount = Math.floor(Number(ratingValue));

  const handleBookRoom = (e, room) => {
    e.preventDefault();
    const targetHotelId = hotel?.id || id || 1;
    const targetRoomId = room?.id || 101;
    navigate(`/booking/${targetHotelId}/${targetRoomId}`);
  };

  return (
    <div className="bg-[#fff8f0] text-[#1e1b16] font-body-md antialiased min-h-screen">
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-10 pt-6 pb-20 text-left">
        
        {/* Photo Gallery Mosaic */}
        <section className="mb-12">
          {hasHotelPhotos ? (
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[450px] md:h-[600px] rounded-2xl overflow-hidden shadow-sm">
              {/* Hero Main Image (Left 2 cols x 2 rows) */}
              <div className="md:col-span-2 md:row-span-2 h-full w-full relative group overflow-hidden bg-[#e8e2d9]">
                <img
                  src={photosList[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  onClick={() => setShowPhotoModal(true)}
                />
              </div>

              {photosList[1] && (
                <div className="hidden md:block h-full w-full relative group overflow-hidden bg-[#e8e2d9]">
                  <img
                    src={photosList[1]}
                    alt="Room detail 1"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  />
                </div>
              )}
              {photosList[2] && (
                <div className="hidden md:block h-full w-full relative group overflow-hidden bg-[#e8e2d9]">
                  <img
                    src={photosList[2]}
                    alt="Room detail 2"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  />
                </div>
              )}
              {photosList[3] && (
                <div className="hidden md:block h-full w-full relative group overflow-hidden bg-[#e8e2d9]">
                  <img
                    src={photosList[3]}
                    alt="Room detail 3"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  />
                </div>
              )}
              {photosList[4] && (
                <div className="hidden md:block h-full w-full relative group overflow-hidden bg-[#e8e2d9]">
                  <img
                    src={photosList[4]}
                    alt="Room detail 4"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                  />
                  <div
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
                  >
                    <span className="text-white font-label-md text-sm font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">grid_view</span>
                      Lihat Semua Foto ({photosList.length})
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Placeholder: Hotel belum upload foto */
            <div className="h-[350px] md:h-[450px] rounded-2xl bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] border-2 border-dashed border-[#c4c8be] flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <span className="material-symbols-outlined text-[#778873] text-7xl mb-4 opacity-60">
                image_not_supported
              </span>
              <h3 className="font-headline-md text-2xl font-bold text-[#778873] mb-2">
                Belum Ada Foto Hotel
              </h3>
              <p className="font-body-md text-sm text-[#444842] max-w-md">
                Pihak hotel belum mengunggah foto galeri. Lihat bagian Pilihan Kamar di bawah untuk melihat foto tipe kamar.
              </p>
            </div>
          )}
        </section>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Info & Description & Amenities */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Hotel Info Header */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex text-[#A0522D]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: i < starCount ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="bg-[#DCCFC0]/40 text-[#778873] px-3 py-1 rounded font-label-sm text-xs font-semibold">
                  Hotel Bintang {starCount}
                </span>
              </div>

              <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-[#778873] mb-4 leading-tight">
                {hotel.name}
              </h1>

              <div className="flex items-center gap-2 text-[#444842] mb-6">
                <span className="material-symbols-outlined text-[#778873]">location_on</span>
                <p className="font-body-md text-sm md:text-base">{hotelAddress}</p>
              </div>

              <div className="prose max-w-none text-[#444842] font-body-md text-base leading-relaxed space-y-4">
                <p className="font-headline-md text-lg text-[#645b4f] leading-relaxed">
                  {hotel.description ||
                    `Terletak di lokasi strategis ${hotelCityName}, ${hotel.name} menawarkan perpaduan sempurna antara kemewahan modern dan kenyamanan alam yang menenangkan.`}
                </p>
                <p className="text-sm md:text-base text-[#444842]">
                  Nikmati fasilitas kelas dunia, mulai dari kamar berdesain elegan, layanan resepsionis 24 jam, kolam renang dengan pemandangan menakjubkan, hingga pilihan restoran bersantap dengan hidangan lezat. Destinasi sempurna bagi Anda yang mencari ketenangan dan pengalaman tak terlupakan.
                </p>
              </div>
            </section>

            {/* Fasilitas Utama Grid */}
            <section>
              <h2 className="font-headline-lg text-2xl font-bold text-[#778873] mb-6">
                Fasilitas Utama
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {facilitiesList.map((fac, idx) => {
                  const facName = typeof fac === "object" ? fac.name : String(fac);
                  const iconName = getFacilityIcon(facName);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[#faf3ea] border border-[#DCCFC0]/30 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[#778873] text-2xl">
                        {iconName}
                      </span>
                      <span className="font-label-md text-xs font-semibold text-[#1e1b16]">
                        {facName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Location Card */}
          <div className="lg:col-span-1 space-y-8">
            <section>
              <h2 className="font-headline-lg text-2xl font-bold text-[#778873] mb-6">
                Lokasi
              </h2>
              <div className="rounded-2xl overflow-hidden shadow-sm border border-[#DCCFC0]/40 bg-[#faf3ea]">
                <div className="w-full h-56 bg-[#eee7de] relative overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                    alt="Peta Lokasi"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-[#778873]/10 flex flex-col items-center justify-center p-4 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#778873] drop-shadow">
                      location_on
                    </span>
                    <span className="font-label-sm text-xs font-bold text-[#1e1b16] mt-1 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                      {hotelCityName}
                    </span>
                  </div>
                </div>
                <div className="p-5 bg-[#FDF6ED] text-left">
                  <p className="font-label-md text-sm font-semibold text-[#1e1b16]">
                    {hotel.name}
                  </p>
                  <p className="font-body-md text-xs text-[#444842] mt-1">
                    Berjarak 8.5 km dari pusat kota.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + hotelAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2.5 border border-[#778873] text-[#778873] rounded-xl font-label-md text-xs font-semibold hover:bg-[#DCCFC0]/30 transition-colors block text-center"
                  >
                    Lihat di Peta
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Room Types & Availability Section */}
        <section className="mt-16 pt-10 border-t border-[#DCCFC0]/40">
          <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-[#778873] mb-8">
            Pilihan Kamar
          </h2>

          {roomsList && roomsList.length > 0 ? (
            <div className="space-y-6">
              {roomsList.map((room) => {
                const roomPrice = Number(room.price || room.weekday_price || 1250000);
                const weekendPrice = Math.round(roomPrice * 1.35);

                return (
                  <div
                    key={room.id}
                    className="flex flex-col md:flex-row bg-[#faf3ea] rounded-2xl overflow-hidden border border-[#DCCFC0]/40 shadow-sm shadow-[#778873]/5 hover:shadow-md transition-shadow"
                  >
                    {/* Room Thumbnail — Placeholder hanya jika TIDAK ADA foto asli */}
                    <div className="md:w-1/3 min-h-[220px] relative bg-gradient-to-br from-[#e8e2d9] to-[#DCCFC0] overflow-hidden">
                      {room.thumbnail ? (
                        <img
                          src={room.thumbnail}
                          alt={room.name || "Kamar Hotel"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                          <span className="material-symbols-outlined text-[#778873] text-5xl mb-3 opacity-60">
                            no_photography
                          </span>
                          <p className="font-label-md text-xs font-bold text-[#778873] uppercase tracking-wider">
                            Belum Ada Foto Kamar
                          </p>
                          <p className="font-body-md text-[11px] text-[#444842] mt-1 opacity-80">
                            Admin hotel belum mengunggah foto untuk tipe kamar ini.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Room Content */}
                    <div className="p-6 flex flex-col justify-between flex-grow text-left">
                      <div>
                        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                          <h3 className="font-headline-md text-xl font-bold text-[#778873]">
                            {room.name || room.type || "Deluxe Room"}
                          </h3>
                          <span className="bg-[#e8e2d9] text-[#778873] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-sm">group</span>
                            {room.capacity || "2 Tamu"}
                          </span>
                        </div>

                        <p className="font-body-md text-sm text-[#444842] mb-4">
                          {room.description ||
                            `Kamar seluas 45 meter persegi dengan ${room.bed || '1 King Bed'}, pemandangan memukau, dan kamar mandi marmer yang luas.`}
                        </p>

                        {/* Features Checkmarks — DINAMIS sesuai data asli + refund */}
                        <div className="flex flex-wrap gap-3 mb-3 text-xs">
                          {room.breakfast && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#778873]/10 border border-[#778873]/20 text-[#778873] font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Sarapan Termasuk
                            </div>
                          )}
                          {room.smoking_area && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-semibold">
                              <span className="material-symbols-outlined text-[14px]">smoking_rooms</span>
                              Smoking Area
                            </div>
                          )}
                          <div className={room.is_refundable
                            ? "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4F6F52]/10 border border-[#4F6F52]/20 text-[#4F6F52] font-semibold"
                            : "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] font-semibold"
                          }>
                            <span className="material-symbols-outlined text-[14px]">
                              {room.is_refundable ? "verified" : "block"}
                            </span>
                            {room.is_refundable ? "Bisa Refund" : "Non-Refundable"}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Price & Booking Button */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 pt-4 border-t border-[#DCCFC0]/30 gap-4">
                        <div>
                          <p className="text-xs text-[#444842] line-through">
                            Rp {weekendPrice.toLocaleString("id-ID")} (Weekend)
                          </p>
                          <p className="font-headline-lg text-2xl font-bold text-[#778873]">
                            Rp {roomPrice.toLocaleString("id-ID")}{" "}
                            <span className="text-xs font-normal text-[#444842]">/ malam (Weekday)</span>
                          </p>
                          {(room.stock !== undefined && room.stock !== null) ? (
                            room.stock <= 3 ? (
                              <p className="text-xs text-[#ba1a1a] font-semibold mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                Hanya sisa {room.stock} kamar!
                              </p>
                            ) : (
                              <p className="text-xs text-[#4F6F52] font-semibold mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Tersedia ({room.stock} kamar)
                              </p>
                            )
                          ) : null}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                          <button
                            type="button"
                            onClick={() => navigate(`/hotels/${hotel?.id || id || 1}/rooms/${room?.id || 101}`)}
                            className="w-full sm:w-auto border border-[#778873] text-[#778873] font-label-md text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#DCCFC0]/30 transition-colors shadow-sm active:scale-95 cursor-pointer text-center"
                          >
                            Detail Kamar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleBookRoom(e, room)}
                            className="w-full sm:w-auto bg-[#778873] text-white font-label-md text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#50604d] transition-colors shadow-sm active:scale-95 cursor-pointer text-center"
                          >
                            Pilih Kamar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#faf3ea] rounded-2xl border border-[#DCCFC0]/40">
              <p className="text-[#444842] text-sm">Belum ada tipe kamar yang terdaftar untuk hotel ini.</p>
            </div>
          )}
        </section>
      </main>

      {/* All Photos Lightbox Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fff8f0] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-left">
            <div className="flex justify-between items-center mb-4 border-b border-[#DCCFC0]/40 pb-3">
              <h3 className="font-headline-md text-xl font-bold text-[#778873]">Galeri Foto {hotel.name}</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-[#1e1b16] hover:text-[#778873] p-1 rounded-full text-2xl"
              >
                ✕
              </button>
            </div>
            {hasHotelPhotos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photosList.map((photo, i) => (
                  <div key={i} className="h-64 rounded-xl overflow-hidden bg-[#eee7de]">
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[#778873] text-6xl mb-3 opacity-60">
                  image_not_supported
                </span>
                <p className="font-label-md text-sm font-bold text-[#778873]">
                  Belum ada foto yang diunggah hotel.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;