import Availability from './Availability';

export default interface Product {
  id: string;
  type: string;
  name: string;
  color: string[];
  price: number;
  manufacturer: string;
  availability: Availability;
}
