// Maximum age of cache, default set to 5 minutes
export const maxCacheAge = process.env.MAX_CACHE_AGE
  ? parseInt(process.env.MAX_CACHE_AGE)
  : 300000;

// URL of the legacy API
export const legacyApiUrl = process.env.LEGACY_API_URL;
if (!legacyApiUrl)
  throw new Error('LEGACY_API_URL is not a defined environment variable');
