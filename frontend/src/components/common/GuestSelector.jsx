import React, { useState } from "react";

const GuestSelector = ({ adults, children, rooms, onGuestChange, capacityAdult, capacityChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [pendingGuests, setPendingGuests] = useState({ adults, children, rooms });

  // Gunakan kapasitas default jika tidak disediakan
  const capA = capacityAdult || 2;
  const capC = capacityChild || 2;

  const handleAdultsChange = (delta) => {
    const newAdults = Math.max(1, adults + delta);
    
    // Validasi: Hanya pemicu modal jika total tamu melebihi kapasitas total kamar yang dipilih
    if ((newAdults + children) > (rooms * (capA + capC))) {
      setPendingGuests({ adults: newAdults, children, rooms: rooms + 1 });
      setShowRoomModal(true);
      return;
    }
    
    onGuestChange({ adults: newAdults, children, rooms });
  };

  const handleChildrenChange = (delta) => {
    const newChildren = Math.max(0, children + delta);
    
    // Validasi: Hanya pemicu modal jika total tamu melebihi kapasitas total kamar
    if ((adults + newChildren) > (rooms * (capA + capC))) {
      setPendingGuests({ adults, children: newChildren, rooms: rooms + 1 });
      setShowRoomModal(true);
      return;
    }
    
    onGuestChange({ adults, children: newChildren, rooms });
  };

  const handleRoomsChange = (delta) => {
    const newRooms = Math.max(1, rooms + delta);
    onGuestChange({ adults, children, rooms: newRooms });
  };

  const confirmAddRoom = (addRoom) => {
    const targetRooms = addRoom ? pendingGuests.rooms : rooms;
    onGuestChange({
      adults: pendingGuests.adults,
      children: pendingGuests.children,
      rooms: targetRooms
    });
    setShowRoomModal(false);
  };

  return (
    <div className="relative w-full">
      {/* Modal Peringatan Tambah Kamar - Fixed Fullscreen di atas segalanya */}
      {showRoomModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200 border border-[#DCCFC0]">
            <div className="w-12 h-12 rounded-full bg-[#778873]/10 text-[#778873] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">meeting_room</span>
            </div>
            <h3 className="font-bold text-lg text-[#1C251D] mb-2">Add Room?</h3>
            <p className="text-sm text-[#444842] mb-6 leading-relaxed">
              Total guests exceed standard capacity per room (maximum 4 people per room). Do you want to add 1 more room for comfort?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmAddRoom(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCCFC0] text-[#444842] hover:bg-[#FDF6ED] font-semibold text-sm transition-colors"
              >
                Keep Current
              </button>
              <button
                onClick={() => confirmAddRoom(true)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#778873] text-white hover:bg-[#50604d] font-semibold text-sm transition-colors shadow-sm"
              >
                Yes, Add Room
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Display Button — same size as Check-in box (px-4 py-3, rounded-xl, w-10 icon) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group flex items-center gap-3 bg-[#FDF6ED] hover:bg-[#EFECE6] px-4 py-3 rounded-xl border border-[#DCCFC0] focus-within:bg-white focus-within:border-[#778873] focus-within:ring-1 focus-within:ring-[#778873]/20 transition-all text-left cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-[#778873]/10 group-hover:bg-[#778873] text-[#778873] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
          <span className="material-symbols-outlined text-xl">group</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <label className="font-label-sm text-[11px] font-bold text-[#7A857B] uppercase tracking-wider cursor-pointer">
            Guests & Rooms
          </label>
          <span className="w-full bg-transparent font-body-md text-sm font-bold text-[#1C251D] outline-none truncate">
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

