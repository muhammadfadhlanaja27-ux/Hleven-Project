import React, { useEffect, useState } from 'react';
import api from '../services/api';
import HotelCard from '../components/Landing/HotelCard';

const LandingPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await api.get('/hotels');
                setHotels(response.data.data);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-900 py-16 px-6 text-center text-white">
                <h1 className="text-4xl font-extrabold mb-4">Temukan Hotel Impianmu</h1>
                <p className="text-blue-100 mb-8">Pesan hotel terbaik dengan harga terjangkau</p>
                <div className="max-w-xl mx-auto bg-white p-2 rounded-xl shadow-lg flex">
                    <input type="text" placeholder="Mau ke mana?" className="w-full p-3 text-gray-700 outline-none" />
                    <button className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700">Cari</button>
                </div>
            </section>

            {/* Hotel Section */}
            <section className="max-w-6xl mx-auto py-12 px-6">
                <h2 className="text-2xl font-bold mb-8">Hotel Populer</h2>
                {loading ? (
                    <p>Memuat hotel...</p>
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

export default LandingPage;