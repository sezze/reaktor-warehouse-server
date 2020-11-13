import fetch from 'node-fetch';

import { legacyApiUrl, maxCacheAge } from './config';
import { getAvailabilityMap } from './availability';
import { makeCache } from './cache';

import LegacyProduct from './types/LegacyProduct';
import { CacheMap } from './types/Cache';
import Product from './types/Product';

const cacheMap: CacheMap<Product[]> = {};

const fetchLegacyProducts = (category: string) =>
  fetch(`${legacyApiUrl}/products/${category}`);

/**
 * Fetch product information, returns cached values if unsuccessful.
 */
export const fetchProducts = async (category: string): Promise<Product[] | undefined> => {
  let cache = cacheMap[category];

  // Fetch legacy product data
  const response = await fetchLegacyProducts(category);
  if (!response.ok) return cache?.getExpired();

  const legacyProducts: LegacyProduct[] = await response.json();

  const manufacturers = legacyProducts.reduce(
    (a, p) => a.add(p.manufacturer),
    new Set<string>(),
  );

  const availabilityMap = await getAvailabilityMap(...manufacturers);

  // Transform legacy data to products with availability info
  const products: Product[] = legacyProducts.map((p) => ({
    ...p,
    availability: availabilityMap[p.manufacturer]?.[p.id] || 'UNKNOWN',
  }));

  // Update cache
  if (!cache) {
    cache = makeCache(maxCacheAge);
    cacheMap[category] = cache;
  }
  cache.set(products);

  return products;
};

/**
 * Returns up-to-date cached products or fetches new products if valid cache doesn't exist.
 */
export const getProducts = async (category: string): Promise<Product[] | undefined> =>
  cacheMap[category]?.get() || (await fetchProducts(category));
