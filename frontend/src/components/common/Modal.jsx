import React from 'react';

const Modal = ({ isOpen, onClose, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-[#DCCFC0]">
        <div className="w-12 h-12 rounded-full bg-[#778873]/10 text-[#778873] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl">meeting_room</span>
        </div>
        <h3 className="font-bold text-lg text-[#1C251D] mb-2">{title}</h3>
        <p className="text-sm text-[#444842] mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCCFC0] text-[#444842] hover:bg-[#FDF6ED] font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#778873] text-white hover:bg-[#50604d] font-semibold text-sm transition-colors shadow-sm"
          >
            Yes, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
