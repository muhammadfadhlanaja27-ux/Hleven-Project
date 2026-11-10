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

/**
 * Format any image/file path into a clean, publicly accessible Supabase URL or absolute HTTP URL.
 * Handles normalizing S3 endpoint URLs, localhost URLs, and relative paths.
 */
export const getPublicImageUrl = (path) => {
  if (!path) return null;

  let str = String(path).trim();
  if (!str) return null;

  // Replace S3 internal endpoints with public HTTP endpoints
  if (str.includes("storage.supabase.co/storage/v1/s3")) {
    str = str.replace(".storage.supabase.co/storage/v1/s3", ".supabase.co/storage/v1/object/public");
  } else if (str.includes("/storage/v1/s3")) {
    str = str.replace("/storage/v1/s3", "/storage/v1/object/public");
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

  // If already a valid absolute URL (HTTP/HTTPS/Data/Blob)
  if (/^https?:\/\//i.test(str) || /^data:/i.test(str) || /^blob:/i.test(str)) {
    return str;
  }

  // If relative path, prepend Supabase public storage URL
  const cleanPath = str.replace(/^(storage\/|public\/|\/+)/, "");
  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
};
