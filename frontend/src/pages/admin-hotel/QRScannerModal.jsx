import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import api from "../../services/api";

const QRScannerModal = ({ isOpen, onClose, onSuccessCheckIn }) => {
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false); // Ref pengunci untuk cegah double scan

  useEffect(() => {
    if (!isOpen) return;

    isProcessingRef.current = false;

    // Timeout singkat untuk memastikan elemen #qr-reader sudah dirender di DOM
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          // Cegah eksekusi ganda jika sedang memproses API
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          setLoading(true);

          try {
            const response = await api.post("/admin/verify-qr", {
              booking_code: decodedText.trim(),
            });

            toast.success(response.data?.message || "Check-in Berhasil!");
            
            if (onSuccessCheckIn) {
              onSuccessCheckIn(response.data?.data);
            }

            if (scannerRef.current) {
              await scannerRef.current.clear();
            }
            onClose();
          } catch (err) {
            toast.error(err.response?.data?.message || "Gagal memverifikasi QR Code.");
            // Beri jeda 2 detik sebelum mengizinkan scan ulang jika gagal
            setTimeout(() => {
              isProcessingRef.current = false;
            }, 2000);
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Callback saat frame kamera belum menemukan QR (diabaikan)
        }
      );

      scannerRef.current = scanner;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Gagal membersihkan scanner:", err));
        scannerRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [isOpen, onClose, onSuccessCheckIn]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-left border border-[#DCCFC0]/60">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h3 className="font-headline-md text-xl font-bold text-[#778873] mb-1">
          Pindai E-Tiket Tamu
        </h3>
        <p className="font-body-md text-xs text-[#444842] mb-4">
          Arahkan kamera ke QR Code E-Tiket milik tamu untuk proses check-in otomatis.
        </p>

        <div 
          id="qr-reader" 
          className="w-full overflow-hidden rounded-xl border border-[#DCCFC0] bg-gray-50"
        ></div>

        {loading && (
          <p className="text-center font-label-md text-xs text-[#778873] font-semibold mt-3 animate-pulse">
            Memverifikasi Kode Booking...
          </p>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;