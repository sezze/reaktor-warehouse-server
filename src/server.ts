import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import {
  getProducts,
  getFilterValues,
  byAvailability,
  byManufacturer,
  bySearchQuery,
} from './product';
import Product from './types/Product';
import ProductResponse from './types/ProductResponse';

const app = express();
app.use(cors());

// While fetching new data all simultanious requests can wait for
// the same data to process
let currentFetch: Promise<Product[] | undefined> | null = null;

app.get('/products/:category', async (req, res) => {
  const { from, to, availability, manufacturer, search } = getFilterValues(req.query);

  if (!currentFetch) currentFetch = getProducts(req.params.category);
  let products = await currentFetch;
  currentFetch = null;
  if (!products) return res.sendStatus(500);

  // Filters
  if (availability && availability !== 'INSTOCK')
    products = products.filter(byAvailability(availability));
  if (manufacturer) products = products.filter(byManufacturer(manufacturer));
  if (search) products = products.filter(bySearchQuery(search));
  const productSlice = products.slice(from, to);

  const response: ProductResponse = {
    from: Math.max(from, 0),
    to: Math.min(to, products.length),
    totalCount: products.length,
    products: productSlice,
  };

  res.json(response);
});

app.listen(process.env.PORT || 8080);
