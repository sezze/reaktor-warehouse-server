process.env.LEGACY_API_URL = 'localhost';

import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';

import { getAvailabilityMap } from '../availability';
import { getProducts } from '../product';

import Product from '../types/Product';

const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch', () => jest.fn());
jest.mock('../availability');

const response = [
  {
    id: 'f33561de3a864f951a',
    type: 'jackets',
    name: 'EWHHOP ROOM',
    color: ['blue'],
    price: 52,
    manufacturer: 'reps',
  },
  {
    id: '0e4772c827c4296592fbd',
    type: 'jackets',
    name: 'WEERLEP METROPOLIS RAPTOR',
    color: ['black'],
    price: 98,
    manufacturer: 'reps',
  },
  {
    id: '6d39a08b3bcae88a67',
    type: 'jackets',
    name: 'DERWEER TYRANNUS BANG',
    color: ['purple'],
    price: 15,
    manufacturer: 'abiplos',
  },
];

test('transforms request correctly', async () => {
  // Mock product fetch
  mocked(fetch).mockReturnValue(new Response(JSON.stringify(response)));

  // Mock availability fetch
  mocked(getAvailabilityMap).mockReturnValue(
    Promise.resolve({
      reps: {
        f33561de3a864f951a: 'INSTOCK',
      },
      abiplos: {
        '6d39a08b3bcae88a67': 'LESSTHAN10',
      },
    }),
  );

  expect(await getProducts('jackets')).toEqual<Product[]>([
    {
      ...response[0],
      availability: 'INSTOCK',
    },
    {
      ...response[1],
      availability: 'UNKNOWN',
    },
    {
      ...response[2],
      availability: 'LESSTHAN10',
    },
  ]);
});
