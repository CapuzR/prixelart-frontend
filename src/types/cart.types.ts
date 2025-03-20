import { Item } from "./item.types";

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