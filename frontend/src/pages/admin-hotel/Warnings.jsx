import React from 'react';
import WarningList from '../../components/admin-hotel/WarningList';

export default function Warnings() {
  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
            Compliance Warning Letters
          </h2>
          <p className="text-base text-[#6B6E6A] mt-1">
            List of official notifications from Super Admin regarding operational standards and partner compliance.
          </p>
        </div>
        <WarningList />
      </div>
    </div>
  );
}
