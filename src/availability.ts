import fetch from 'node-fetch';

import { legacyApiUrl, maxCacheAge } from './config';
import { makeCache } from './cache';

import AvailabilityMap, { AvailabilityMapEntry } from './types/AvailabilityMap';
import { LegacyAvailabilityResponse } from './types/LegacyAvailability';
import Availability from './types/Availability';
import { CacheMap } from './types/Cache';

const availabilityPattern = /(?<=<INSTOCKVALUE>)[^<]+(?=<\/)/m;

const cacheMap: CacheMap<AvailabilityMapEntry> = {};

const fetchLegacyAvailability = (manufacturer: string) =>
  fetch(`${legacyApiUrl}/availability/${manufacturer}`);

/**
 * Fetch availability information, returns cached values if unsuccessful.
 * Time of actual fetch can be checked from the returned updatedAt property.
 */
export const fetchAvailability = async (
  manufacturer: string,
): Promise<AvailabilityMapEntry | undefined> => {
  let cache = cacheMap[manufacturer];

  // Fetch legacy availability data
  const response = await fetchLegacyAvailability(manufacturer);
  if (!response.ok) return cache?.getExpired();

  const legacyAvailability: LegacyAvailabilityResponse = await response.json();
  if (typeof legacyAvailability.response === 'string') return cache?.getExpired();

  // Transform legacy data
  const availabilityMap = legacyAvailability.response.reduce((map, a) => {
    // Add availability if found, otherwise try cached data or finally set to unknown
    map[a.id.toLowerCase()] = (a.DATAPAYLOAD.match(availabilityPattern)?.[0]?.trim() ||
      cache?.getExpired()?.[a.id] ||
      'UNKNOWN') as Availability;
    return map;
  }, {} as AvailabilityMapEntry);

  // Update cache
  if (!cache) {
    cache = makeCache(maxCacheAge);
    cacheMap[manufacturer] = cache;
  }
  cache.set(availabilityMap);

  return availabilityMap;
};

/**
 * Returns up-to-date cached availability information or fetches new information if valid
 * cache doesn't exist.
 */
export const getAvailability = async (
  manufacturer: string,
): Promise<AvailabilityMapEntry | undefined> =>
  cacheMap[manufacturer]?.get() || (await fetchAvailability(manufacturer));

/**
 * Get all requested manufacturers' availability information. Builds upon getAvailability.
 */
export const getAvailabilityMap = async (
  ...manufacturers: string[]
): Promise<AvailabilityMap> =>
  Object.fromEntries(
    await Promise.all(manufacturers.map(async (m) => [m, await getAvailability(m)])),
  );
