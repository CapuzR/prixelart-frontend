import { PickedArt } from 'types/art.types';
import { PickedProduct } from 'types/product.types';
import { Item } from 'types/item.types';
export type { PickedArt, PickedProduct, Item };

// export interface Order {
//   lines: OrderLine[];
//   subTotal: number;
//   totalUnits: number;
//   cartDiscount: number;
//   totalDiscount: number;
//   totalShipping: number;
//   totalTax: number;
//   totalWithoutTax: number;
//   totalWithTax: number;
// }

export interface Cart {
  lines: CartLine[];
  subTotal: number;
  totalUnits: number;
  cartDiscount: number;
  totalDiscount: number;
}

export interface CartLine {
  id: string;
  item: Item;
  quantity: number;
  discount: number;
  subtotal: number;
}
