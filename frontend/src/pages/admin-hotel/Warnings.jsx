import React from 'react';
import WarningList from '../../components/admin-hotel/WarningList';

export default function Warnings() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">Surat Peringatan</h2>
        <p className="text-sm text-[#6B6E6A] mt-1">Peringatan resmi dari Super Admin. Buka detail untuk menandai dibaca.</p>
      </div>
      <WarningList />
    </div>
  );
}
