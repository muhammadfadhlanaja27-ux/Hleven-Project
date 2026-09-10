import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 10 }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDF6ED] p-4 rounded-2xl border border-[#DCCFC0]/40 shadow-sm">
      {/* Info text */}
      {totalItems !== undefined && (
        <div className="text-xs text-[#444842] font-body-md">
          Menampilkan <span className="font-semibold text-[#1e1b16]">{startItem}</span> - <span className="font-semibold text-[#1e1b16]">{endItem}</span> dari <span className="font-semibold text-[#1e1b16]">{totalItems}</span> hotel
        </div>
      )}

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
            currentPage === 1
              ? "opacity-40 cursor-not-allowed border-[#DCCFC0] text-[#747871]"
              : "border-[#DCCFC0] text-[#778873] hover:bg-[#778873] hover:text-white active:scale-95 cursor-pointer"
          }`}
          aria-label="Halaman Sebelumnya"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        {/* First Page button if startPage > 1 */}
        {getPageNumbers()[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1.5 rounded-xl border border-[#DCCFC0] text-xs font-semibold text-[#778873] hover:bg-[#778873] hover:text-white transition-all cursor-pointer"
            >
              1
            </button>
            {getPageNumbers()[0] > 2 && (
              <span className="px-1 text-xs text-[#747871]">...</span>
            )}
          </>
        )}

        {/* Numbered Page Buttons */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentPage === page
                ? "bg-[#778873] text-white border border-[#778873] shadow-sm"
                : "border border-[#DCCFC0] text-[#778873] hover:bg-[#778873] hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last Page button if endPage < totalPages */}
        {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
          <>
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
              <span className="px-1 text-xs text-[#747871]">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 rounded-xl border border-[#DCCFC0] text-xs font-semibold text-[#778873] hover:bg-[#778873] hover:text-white transition-all cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
            currentPage === totalPages
              ? "opacity-40 cursor-not-allowed border-[#DCCFC0] text-[#747871]"
              : "border-[#DCCFC0] text-[#778873] hover:bg-[#778873] hover:text-white active:scale-95 cursor-pointer"
          }`}
          aria-label="Halaman Selanjutnya"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
