import { Art } from '../art/interface';
import { Product } from '../products/model';

//TODO: Art y Product deberían ser opcionales??
export interface CartItem {
    art?: Art;
    product?: Product;
    quantity: number;
  }
  