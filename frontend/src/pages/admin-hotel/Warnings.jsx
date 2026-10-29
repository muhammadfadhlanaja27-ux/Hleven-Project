import React from 'react';
import WarningList from '../../components/admin-hotel/WarningList';

export default function Warnings() {
  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Surat Peringatan Kepatuhan
          </h2>
          <p className="text-base text-[#6B6E6A] mt-1">
            Daftar pemberitahuan resmi dari Super Admin mengenai standar operasional dan kepatuhan mitra.
          </p>
        </div>
        <WarningList />
      </div>
    </div>
  );
}
