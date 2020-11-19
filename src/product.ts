import fetch from 'node-fetch';
import { ParsedQs } from 'qs';

import { defaultResponseCount, legacyApiUrl, maxCacheAge } from './config';
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

/**
 * Creates a filtering function to filter products by the given search query (case insensitive)
 */
export const bySearchQuery = (search: string) => (p: Product): boolean =>
  p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase());

/**
 * Creates a filtering function to filter products by the given manufacturer
 */
export const byManufacturer = (manufacturer: string) => (p: Product): boolean =>
  p.manufacturer === manufacturer;

/**
 * Creates a filtering function to filter products by the given availability status
 */
export const byAvailability = (availability: string) => (p: Product): boolean =>
  p.availability === availability || p.availability === 'OUTOFSTOCK';

interface QueryOptions {
  from: number;
  to: number;
  availability?: string;
  manufacturer?: string;
  search?: string;
}

/**
 *
 * @param query Request query from Express
 */
export const getFilterValues = (query: ParsedQs): QueryOptions => ({
  from: typeof query.from === 'string' ? parseInt(query.from) : 0,
  to: typeof query.to === 'string' ? parseInt(query.to) : defaultResponseCount,
  search: typeof query.search === 'string' ? query.search : undefined,
  manufacturer: typeof query.manufacturer === 'string' ? query.manufacturer : undefined,
  availability: typeof query.availability === 'string' ? query.availability : undefined,
});
