import React, { useEffect, useState } from 'react';
import api from '../services/api';
import HotelCard from '../components/landing/HotelCard';

const HotelList = () => {
    const [hotels, setHotels] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchHotels = async (searchQuery = '') => {
        setLoading(true);
        try {
            const endpoint = searchQuery ? `/hotels/search?keyword=${searchQuery}` : '/hotels';
            const response = await api.get(endpoint);
            setHotels(response.data.data);
        } catch (error) {
            console.error('Gagal memuat data hotel:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHotels(keyword);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-6">
            <h1 className="text-3xl font-bold mb-6 text-left">Daftar Hotel</h1>

            {/* Search Bar Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama hotel atau kota..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full p-3 border border-[var(--border)] rounded-lg outline-none"
                />
                <button type="submit" className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90">
                    Cari
                </button>
            </form>

            {/* Hotel Grid */}
            {loading ? (
                <p className="text-center py-10">Memuat daftar hotel...</p>
            ) : hotels.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Tidak ada hotel yang ditemukan.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            )}

            {/* Hotel Section */}
            <section className="max-w-6xl mx-auto py-12 px-6 text-left">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Hotel Populer</h2>
                {loading ? (
                    <p className="text-gray-600">Memuat hotel...</p>
                ) : hotels.length === 0 ? (
                    <p className="text-gray-500">Belum ada hotel yang tersedia di database.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {hotels.map((hotel) => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HotelList;