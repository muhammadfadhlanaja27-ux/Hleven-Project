const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  return apiUrl.replace(/\/api(?:\/v1)?\/?$/, "");
};

export const getPublicImageUrl = (path) => {
  if (!path) return null;

  let str = String(path).trim();
  if (!str) return null;

  if (/^data:/i.test(str) || /^blob:/i.test(str)) {
    return str;
  }

  if (/^https?:\/\//i.test(str)) {
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
