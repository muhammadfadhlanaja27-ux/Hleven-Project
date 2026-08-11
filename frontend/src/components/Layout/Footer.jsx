import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border)] py-6 px-6 mt-auto text-sm text-[var(--text)]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; 2026 H'Leven Hotel Booking Platform. SMKN 11 Bandung.</p>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:underline">Kebijakan Privasi</span>
          <span className="cursor-pointer hover:underline">Syarat & Ketentuan</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;