import Cache from './types/Cache';

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
