import { useEffect } from "react";

/**
 * Modal konfirmasi reusable menggantikan window.confirm().
 * Gaya konsisten dengan desain H'Leven (krem/hijau sage).
 */
const ConfirmDialog = ({
  open,
  title = "Konfirmasi Tindakan",
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "default", // 'default' | 'danger' | 'success'
  onConfirm,
  onCancel,
  processing = false,
}) => {
  // Tutup dengan tombol ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const styles = {
    default: { btn: "bg-[#778873] hover:bg-[#50604d]", icon: "help", iconColor: "#778873" },
    danger: { btn: "bg-[#ba1a1a] hover:bg-[#8f1414]", icon: "warning", iconColor: "#ba1a1a" },
    success: { btn: "bg-[#4F6F52] hover:bg-[#3d573f]", icon: "check_circle", iconColor: "#4F6F52" },
  }[type] || { btn: "bg-[#778873] hover:bg-[#50604d]", icon: "help", iconColor: "#778873" };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1e1b16]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#DCCFC0]/60 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="p-6 flex items-start gap-4">
          <span
            className="material-symbols-outlined text-3xl flex-shrink-0"
            style={{ color: styles.iconColor }}
          >
            {styles.icon}
          </span>
          <div>
            <h3 id="confirm-dialog-title" className="font-headline-md text-lg font-bold text-[#2D332C] mb-1">
              {title}
            </h3>
            <p className="font-body-md text-sm text-[#444842] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-5 py-2.5 rounded-xl font-label-md text-sm font-semibold text-[#444842] bg-[#faf3ea] border border-[#DCCFC0] hover:bg-[#f0e8dc] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            className={`px-5 py-2.5 rounded-xl font-label-md text-sm font-semibold text-white transition-colors shadow-sm cursor-pointer active:scale-95 disabled:opacity-50 ${styles.btn}`}
          >
            {processing ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
