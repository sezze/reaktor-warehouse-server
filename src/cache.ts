import Cache from './types/Cache';

/**
 * Create a cache with a max-age. Getter will return undefined whenever the cache is out-of-date.
 */
export const makeCache = <T>(maxAge: number): Cache<T> => {
  let updateTime = 0;
  let value: T | undefined;

  return {
    get: () => (Date.now() - updateTime < maxAge ? value : undefined),
    getExpired: () => value,
    updatedAt: () => updateTime,
    set: (newValue: T) => {
      value = newValue;
      updateTime = Date.now();
    },
  };
};
