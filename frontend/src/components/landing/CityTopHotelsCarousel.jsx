import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CityTopHotelsCarousel = ({ hotels = [] }) => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const animFrameRef = useRef(null);

    // Filter 1 hotel terbaik per kota & urutkan dari skor/bintang tertinggi ke terendah
    const topHotelsPerCity = useMemo(() => {
        if (!hotels || hotels.length === 0) return [];

        const cityMap = new Map();

        hotels.forEach((hotel) => {
            const cityName =
                (typeof hotel.city === "object" ? hotel.city?.city : hotel.city) ||
                hotel.city_name ||
                "Bandung";

            const starVal = Number(hotel.star_rating || hotel.stars || hotel.star || 0);
            const reviewRatingVal = Number(
                hotel.average_rating || hotel.rating || hotel.reviews_avg_rating || 0
            );

            // Perhitungan skor komposit
            const compositeScore = starVal * 2 + reviewRatingVal;

            if (!cityMap.has(cityName)) {
                cityMap.set(cityName, { hotel, score: compositeScore, starVal });
            } else {
                const existing = cityMap.get(cityName);
                if (compositeScore > existing.score) {
                    cityMap.set(cityName, { hotel, score: compositeScore, starVal });
                }
            }
        });

        // Urutkan berdasarkan Bintang terbanyak terlebih dahulu, lalu Skor Ulasan
        return Array.from(cityMap.values())
            .sort((a, b) => {
                if (b.starVal !== a.starVal) {
                    return b.starVal - a.starVal;
                }
                return b.score - a.score;
            })
            .map((item) => item.hotel);
    }, [hotels]);

    // Dual array untuk Seamless Infinite Continuous Smooth Scroll
    const displayHotels = useMemo(() => {
        if (topHotelsPerCity.length === 0) return [];
        return [...topHotelsPerCity, ...topHotelsPerCity];
    }, [topHotelsPerCity]);

    // Continuous Smooth Animation menggunakan requestAnimationFrame
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || topHotelsPerCity.length === 0) return;

        const speed = 0.8;

        const animateScroll = () => {
            if (!isHovered && container) {
                container.scrollLeft += speed;

                const halfWidth = container.scrollWidth / 2;
                if (container.scrollLeft >= halfWidth) {
                    container.scrollLeft -= halfWidth;
                }
            }
            animFrameRef.current = requestAnimationFrame(animateScroll);
        };

        animFrameRef.current = requestAnimationFrame(animateScroll);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [topHotelsPerCity, isHovered]);

    if (topHotelsPerCity.length === 0) return null;

    return (
        <section className="w-full my-10 text-left">
            {/* Header dengan background putih */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8E2D9] shadow-xs mb-6 text-left">
                <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-[#778873] mb-1">
                    Hotel Terbaik di Setiap Kota
                </h2>
                <p className="font-body-md text-sm text-[#444842]">
                    Rekomendasi akomodasi pilihan dengan ulasan tertinggi di berbagai kota destinasi.
                </p>
            </div>

            {/* Container Carousel Horizontal */}
            <div
                ref={scrollRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                className="flex gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 select-none cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {displayHotels.map((hotel, index) => {
                    const cityName =
                        (typeof hotel.city === "object" ? hotel.city?.city : hotel.city) ||
                        hotel.city_name ||
                        "Bandung";

                    const imageUrl = hotel.thumbnail
                        ? hotel.thumbnail.startsWith("http")
                            ? hotel.thumbnail
                            : `http://localhost:8000/storage/${hotel.thumbnail.replace(/^\//, "")}`
                        : hotel.photos?.[0]?.photo || hotel.photos?.[0]?.url || null;

                    const price = Number(
                        hotel.starting_price || hotel.price || hotel.rooms?.[0]?.price || 500000
                    ).toLocaleString("id-ID");

                    const reviewRating = Number(
                        hotel.average_rating || hotel.rating || hotel.reviews_avg_rating || 0
                    ).toFixed(1);

                    const starCount = Math.min(
                        Math.max(Number(hotel.star_rating || hotel.stars || hotel.star || 4), 1),
                        5
                    );

                    return (
                        <div
                            key={`${hotel.id}-${index}`}
                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                            className="w-72 md:w-80 shrink-0 bg-white rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                        >
                            <div className="relative h-44 overflow-hidden bg-[#e8e2d9]">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#778873]">
                                        <span className="material-symbols-outlined text-4xl">no_photography</span>
                                    </div>
                                )}

                                {/* Badge Nama Kota */}
                                <div className="absolute top-3 left-3 bg-[#778873] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                                    {cityName}
                                </div>

                                {/* Badge Bintang Klasifikasi Hotel */}
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-black/5">
                                    <span
                                        className="material-symbols-outlined text-[#D97706] text-xs"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        star
                                    </span>
                                    <span className="font-label-sm text-xs font-bold text-[#1C251D]">
                                        {starCount} Bintang
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <div>
                                    <h3 className="font-headline-sm text-base font-bold text-[#2D332C] line-clamp-1 mb-1 group-hover:text-[#778873] transition-colors">
                                        {hotel.name}
                                    </h3>

                                    {/* Rating Ulasan */}
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex items-center gap-0.5 bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded font-bold text-[11px] border border-[#FDE68A]">
                                            <span
                                                className="material-symbols-outlined text-[12px]"
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                star
                                            </span>
                                            <span>{reviewRating > 0 ? reviewRating : "Baru"}</span>
                                        </div>
                                        <span className="text-[11px] text-[#747871] truncate">
                                            Rating Ulasan
                                        </span>
                                    </div>

                                    <p className="font-body-md text-xs text-[#444842] flex items-center gap-1 truncate mb-3">
                                        <span className="material-symbols-outlined text-xs text-[#778873]">
                                            location_on
                                        </span>
                                        {hotel.address || `${cityName}, Indonesia`}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between pt-3 border-t border-[#E8E2D9]">
                                    <div>
                                        <span className="text-[10px] text-[#444842] block">Mulai dari</span>
                                        <span className="font-headline-sm text-base font-bold text-[#778873]">
                                            Rp {price} <span className="text-[10px] font-normal text-[#444842]">/malam</span>
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-[#778873] group-hover:translate-x-1 transition-transform flex items-center">
                                        Detail <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CityTopHotelsCarousel;