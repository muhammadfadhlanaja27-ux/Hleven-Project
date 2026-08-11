import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Anda perlu membuat endpoint GET /admin/bookings di backend nanti
    api.get('/admin/bookings').then(res => setBookings(res.data.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Pesanan</h1>
      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Kode</th>
              <th>Tamu</th>
              <th>Check-in</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b">
                <td>{b.booking_code}</td>
                <td>{b.user.name}</td>
                <td>{b.check_in}</td>
                <td><span className="capitalize">{b.status}</span></td>
                <td>
                  <button className="text-blue-600 underline">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}