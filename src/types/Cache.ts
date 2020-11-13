export default interface Cache<T> {
  get: () => T | undefined;
  getExpired: () => T | undefined;
  updatedAt: () => number;
  set: (newValue: T) => void;
}

export interface CacheMap<T> {
  [key: string]: Cache<T> | undefined;
}
