import { Art } from '../art/interface';
import { Product } from '../products/interfaces';

export interface CartItem {
    art?: Art;
    product?: Product;
    quantity: number;
  }
  