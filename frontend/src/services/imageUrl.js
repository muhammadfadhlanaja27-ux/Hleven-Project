// Helper to resolve backend storage URL dynamically based on environment
const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://api.hleven.my.id/api/v1";
  return apiUrl.replace(/\/api(?:\/v1)?\/?$/, "");
};

export const getStorageUrl = (path = "") => {
  if (!path) return "";
  const str = String(path).trim();
  if (!str) return "";

  // Supabase s3 endpoint fix if stored in DB
  if (str.includes("storage.supabase.co/storage/v1/s3")) {
    return str.replace(".storage.supabase.co/storage/v1/s3", ".supabase.co/storage/v1/object/public");
  }
  if (str.includes("/storage/v1/s3")) {
    return str.replace("/storage/v1/s3", "/storage/v1/object/public");
  }

  // Legacy localhost URLs stored in DB fix
  if (str.includes("localhost:8000") || str.includes("127.0.0.1:8000")) {
    const base = getBackendBaseUrl();
    const relative = str.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):8000\/?/, "");
    let clean = relative.replace(/^\/+/, "");
    if (clean.startsWith("storage/")) clean = clean.replace(/^storage\//, "");
    if (clean.startsWith("public/")) clean = clean.replace(/^public\//, "");
    return `${base}/storage/${clean}`;
  }

  // If already absolute URL or data URI
  if (/^https?:\/\//i.test(str) || /^data:/i.test(str)) {
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

  return `${base}/storage/${cleanPath}`;
};

export const BACKEND_URL = getBackendBaseUrl();
