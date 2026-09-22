const SUPABASE_STORAGE_URL = "https://oilqbukzlnsbudnffhoj.supabase.co/storage/v1/object/public/hleven";

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
