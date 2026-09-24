// Helper to resolve backend storage URL dynamically based on environment
const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  return apiUrl.replace(/\/api(?:\/v1)?\/?$/, "");
};

export const getStorageUrl = (path = "") => {
  if (!path) return "";
  const str = String(path).trim();
  if (!str) return "";

  if (str.includes("storage.supabase.co/storage/v1/s3")) {
    return str.replace(".storage.supabase.co/storage/v1/s3", ".supabase.co/storage/v1/object/public");
  }
  if (str.includes("/storage/v1/s3")) {
    return str.replace("/storage/v1/s3", "/storage/v1/object/public");
  }

  // Already absolute URL, blob URL, or data URI: keep as-is.
  if (/^https?:\/\//i.test(str) || /^data:/i.test(str) || /^blob:/i.test(str)) {
    return str;
  }

  const base = getBackendBaseUrl();
  let cleanPath = str.replace(/^\/+/, "");
  if (cleanPath.startsWith("public/")) {
    cleanPath = cleanPath.replace(/^public\//, "");
  }
  if (cleanPath.startsWith("storage/")) {
    cleanPath = cleanPath.replace(/^storage\//, "");
  }

  if (str.startsWith("/storage/") || str.startsWith("storage/")) {
    return `${base}/${str.startsWith("/") ? str.slice(1) : str}`;
  }

  return `${base}/storage/${cleanPath}`;
};

export const BACKEND_URL = getBackendBaseUrl();
