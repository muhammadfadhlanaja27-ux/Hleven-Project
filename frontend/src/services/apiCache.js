import api from './api';

// In-memory cache store
const cacheStore = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Generate a consistent cache key from URL and query params
 */
export const getCacheKey = (url, params = {}) => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const cleanParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});
  
  const queryStr = new URLSearchParams(cleanParams).toString();
  return queryStr ? `${url}?${queryStr}` : url;
};

/**
 * Get cached data if it exists and hasn't expired
 */
export const getCachedData = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.data;
};

/**
 * Set data in cache with TTL
 */
export const setCachedData = (key, data, ttl = DEFAULT_TTL) => {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + ttl,
    timestamp: Date.now(),
  });
};

/**
 * Invalidate/clear cache by exact key, URL pattern, or all if no pattern passed
 */
export const invalidateCache = (pattern) => {
  if (!pattern) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
};

/**
 * Cached GET request helper:
 * - If cached data exists and !forceRefresh: returns cached data immediately.
 * - Otherwise fetches from API and caches the response.
 */
export const cachedGet = async (url, config = {}, forceRefresh = false, ttl = DEFAULT_TTL) => {
  const key = getCacheKey(url, config.params);
  
  if (!forceRefresh) {
    const cached = getCachedData(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }
  }

  const response = await api.get(url, config);
  const responseData = response.data;
  setCachedData(key, responseData, ttl);
  return { data: responseData, fromCache: false };
};

export default {
  getCacheKey,
  getCachedData,
  setCachedData,
  invalidateCache,
  cachedGet,
};
