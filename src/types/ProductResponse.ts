import Product from './Product';

export default interface ProductResponse {
  from: number;
  to: number;
  totalCount: number;
  products: Product[];
}
