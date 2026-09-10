import React, { useState } from "react";

const GuestSelector = ({ adults, children, rooms, onGuestChange, onAddRoomRequest }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdultsChange = (delta) => {
    const newAdults = Math.max(1, adults + delta);
    onGuestChange({ adults: newAdults, children, rooms });

    // Check if adults >= 5 and request room addition
    if (newAdults >= 5 && adults < 5) {
      onAddRoomRequest?.();
    }
  };

  const handleChildrenChange = (delta) => {
    const newChildren = Math.max(0, children + delta);
    onGuestChange({ adults, children: newChildren, rooms });
  };

  const handleRoomsChange = (delta) => {
    const newRooms = Math.max(1, rooms + delta);
    onGuestChange({ adults, children, rooms: newRooms });
  };

  return (
    <div className="relative w-full lg:w-1/4">
      {/* Display Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col items-start bg-[#FDF6ED] px-4 py-2.5 rounded-xl border border-[#DCCFC0]/60 hover:border-[#778873] focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873] transition-all text-left cursor-pointer"
      >
        <label className="font-label-sm text-xs font-semibold text-[#444842]">
          Tamu &amp; Kamar
        </label>
        <div className="flex items-center w-full mt-1">
          <span className="material-symbols-outlined text-[#778873] mr-2 text-lg">
            group
          </span>
          <span className="w-full bg-transparent font-body-md text-sm text-[#1e1b16] outline-none truncate">
            {adults} Adult{adults !== 1 ? "s" : ""}, {children} Child{children !== 1 ? "ren" : ""}, {rooms} Room{rooms !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Dropdown Selector - Below */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#DCCFC0] rounded-xl shadow-lg p-6 z-50 w-full min-w-96">
            {/* Adults */}
            <div className="mb-6">
              <label className="font-label-sm text-xs font-semibold text-[#444842] uppercase tracking-wider mb-3 block">
                Adults
              </label>
              <div className="flex items-center justify-between bg-[#FDF6ED] rounded-lg p-3 border border-[#DCCFC0]/50">
                <button
                  onClick={() => handleAdultsChange(-1)}
                  disabled={adults === 1}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  −
                </button>
                <span className="font-body-md font-semibold text-[#1e1b16] min-w-12 text-center text-lg">
                  {adults}
                </span>
                <button
                  onClick={() => handleAdultsChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="mb-6">
              <label className="font-label-sm text-xs font-semibold text-[#444842] uppercase tracking-wider mb-3 block">
                Children
              </label>
              <div className="flex items-center justify-between bg-[#FDF6ED] rounded-lg p-3 border border-[#DCCFC0]/50">
                <button
                  onClick={() => handleChildrenChange(-1)}
                  disabled={children === 0}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  −
                </button>
                <span className="font-body-md font-semibold text-[#1e1b16] min-w-12 text-center text-lg">
                  {children}
                </span>
                <button
                  onClick={() => handleChildrenChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rooms */}
            <div className="mb-6">
              <label className="font-label-sm text-xs font-semibold text-[#444842] uppercase tracking-wider mb-3 block">
                Rooms
              </label>
              <div className="flex items-center justify-between bg-[#FDF6ED] rounded-lg p-3 border border-[#DCCFC0]/50">
                <button
                  onClick={() => handleRoomsChange(-1)}
                  disabled={rooms === 1}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  −
                </button>
                <span className="font-body-md font-semibold text-[#1e1b16] min-w-12 text-center text-lg">
                  {rooms}
                </span>
                <button
                  onClick={() => handleRoomsChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-[#778873] text-white hover:bg-[#50604d] transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-[#778873] text-white font-label-md text-sm font-semibold rounded-lg hover:bg-[#50604d] transition-colors"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GuestSelector;

