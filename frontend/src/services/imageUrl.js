// Helper to resolve backend storage URL dynamically based on environment
const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://api.hleven.my.id/api/v1";
  return apiUrl.replace(/\/api(?:\/v1)?\/?$/, "");
};

export const getStorageUrl = (path = "") => {
  if (!path) return "";
  const str = String(path).trim();
  if (!str) return "";

  // Jika path mengarah ke gambar lokal khusus (Padma/Budi)
  if (str.startsWith("/images/")) {
    return str;
  }

  // Already absolute URL, blob URL, or data URI: keep as-is.
  if (/^https?:\/\//i.test(str) || /^data:/i.test(str) || /^blob:/i.test(str)) {
    return str;
  }

  const base = getBackendBaseUrl();
  let cleanPath = str.replace(/^\/+/, "");
  
  if (cleanPath.startsWith("public/")) cleanPath = cleanPath.replace(/^public\//, "");
  if (cleanPath.startsWith("storage/")) cleanPath = cleanPath.replace(/^storage\//, "");

  if (str.startsWith("/storage/") || str.startsWith("storage/")) {
    return `${base}/${str.startsWith("/") ? str.slice(1) : str}`;
  }

  return `${base}/storage/${cleanPath}`;
};

export const BACKEND_URL = getBackendBaseUrl();
