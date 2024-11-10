import { PickedArt } from './art.types';
import { PickedProduct } from './product.types';

export interface Item {
  sku: string | undefined;
  art: PickedArt | undefined;
  product: PickedProduct | undefined;
  price: number | undefined;
  discount: number | undefined;
}