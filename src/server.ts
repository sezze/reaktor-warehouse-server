import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { getProducts } from './product';
import Product from './types/Product';

const app = express();
app.use(cors());

// While fetching new data all simultanious requests can wait for
// the same data to process
let currentFetch: Promise<Product[] | undefined> | null = null;

app.get('/products/:category', async (req, res) => {
  const from = typeof req.query.from === 'string' ? parseInt(req.query.from) : 0;
  const to = typeof req.query.to === 'string' ? parseInt(req.query.to) : 3;

  if (!currentFetch) currentFetch = getProducts(req.params.category);
  const products = await currentFetch;
  currentFetch = null;

  products
    ? res.json({
        from: Math.max(from, 0),
        to: Math.min(to, products.length),
        totalCount: products.length,
        products: products.slice(from, to),
      })
    : res.sendStatus(500);
});

app.listen(process.env.PORT || 8080);
