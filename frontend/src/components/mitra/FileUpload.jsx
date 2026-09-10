import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FileUpload = ({
  label,
  description,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSize = 10 * 1024 * 1024,
  file,
  onChange,
  onRemove,
  required = false,
  error,
}) => {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > maxSize) {
      toast.error(`File terlalu besar. Maksimal ${formatBytes(maxSize)}.`);
      inputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsUploading(false);
      onChange(selected);
      setTimeout(() => setProgress(0), 500);
    }, 800);
  };

  const handleRemove = () => {
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-label-md text-xs font-semibold text-[#444842]">
        {label} {required && <span className="text-[#ba1a1a]">*</span>}
      </label>
      {description && (
        <p className="text-[11px] text-[#747871] -mt-1">{description}</p>
      )}

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            error
              ? "border-[#ba1a1a] bg-[#ffdad6]/10"
              : "border-[#DCCFC0] bg-[#faf3ea] hover:border-[#778873] hover:bg-[#FDF6ED]"
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-[#778873]">
            upload_file
          </span>
          <span className="font-label-md text-sm font-semibold text-[#50604d]">
            Klik untuk unggah atau seret file ke sini
          </span>
          <span className="text-[11px] text-[#747871]">
            {accept} • Maks. {formatBytes(maxSize)}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
        </button>
      ) : (
        <div className="flex items-center justify-between p-3 bg-[#faf3ea] rounded-xl border border-[#DCCFC0]/40">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-[#615b54] shrink-0">
              draft
            </span>
            <div className="min-w-0 flex-1">
              <span className="block font-body-md text-sm font-medium text-[#1c1c19] truncate">
                {file.name}
              </span>
              <span className="block font-label-sm text-[11px] text-[#747871]">
                {formatBytes(file.size)}
              </span>
              {isUploading || progress > 0 ? (
                <div className="mt-1.5 h-1.5 w-full bg-[#e5e2dd] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#50604d] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1.5 font-label-sm text-[11px] font-semibold text-[#50604d]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Berhasil diunggah
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="ml-3 p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors shrink-0 disabled:opacity-40"
            title="Hapus file"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
      {error && (
        <span className="text-[11px] font-semibold text-[#ba1a1a]">{error}</span>
      )}
    </div>
  );
};

export default FileUpload;
