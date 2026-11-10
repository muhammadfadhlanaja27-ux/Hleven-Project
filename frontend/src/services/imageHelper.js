const SUPABASE_STORAGE_URL = "https://oilqbukzlnsbudnffhoj.supabase.co/storage/v1/object/public/hleven";
const FALLBACK_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
];

const getFallbackHotelImage = (seed = "hleven-hotel") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_HOTEL_IMAGES[hash % FALLBACK_HOTEL_IMAGES.length];
};

export const getPublicImageUrl = (path) => {
  if (!path) return null;

  let str = String(path).trim();
  if (!str) return null;

  if (/^data:/i.test(str) || /^blob:/i.test(str)) {
    return str;
  }

  if (/pixabay\.com\/get\//i.test(str) || /picsum\.photos\//i.test(str)) {
    return getFallbackHotelImage(str);
  }

  // Remove duplicate bucket name occurrences if present
  str = str.replace("/object/public/hleven/hleven/", "/object/public/hleven/");

  // If it's a localhost URL pointing to /storage/, convert it to Supabase public URL
  if (str.includes("localhost:8000/storage/")) {
    const relativePath = str.substring(str.indexOf("/storage/") + 9).replace(/^\/+/, "");
    return `${SUPABASE_STORAGE_URL}/${relativePath}`;
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
