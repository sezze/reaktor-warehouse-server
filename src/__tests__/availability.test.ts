process.env.LEGACY_API_URL = 'localhost';

import { mocked } from 'ts-jest/utils';
import fetch from 'node-fetch';

import { getAvailability } from '../availability';

const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch', () => jest.fn());

const response = [
  {
    id: 'ID1',
    DATAPAYLOAD:
      '<AVAILABILITY>\n  <INSTOCKVALUE>INSTOCK</INSTOCKVALUE>\n</AVAILABILITY>',
  },
  {
    id: 'ID2',
    DATAPAYLOAD: '<INSTOCKVALUE>\nLESSTHAN10</INSTOCKVALUE>',
  },
  {
    id: 'ID3',
    DATAPAYLOAD:
      '  <availability>\n <INSTOCKVALUE>OUTOFSTOCK   </INSTOCKVALUE> \n</availability>  ',
  },
];

test('transforms request correctly', async () => {
  // Mock availability fetch
  mocked(fetch).mockReturnValue(
    Promise.resolve(
      new Response(
        JSON.stringify({
          code: 200,
          response,
        }),
      ),
    ),
  );

  expect(await getAvailability('manufacturer')).toEqual({
    id1: 'INSTOCK',
    id2: 'LESSTHAN10',
    id3: 'OUTOFSTOCK',
  });
});
