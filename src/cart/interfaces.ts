import { Art } from '../art/interfaces';
import { Product } from '../products/interfaces';


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

  export interface Item {
  sku: string | undefined;
  art: PickedArt | undefined;
  product: PickedProduct | undefined;
  price: number | undefined;
  discount: number | undefined;
}

export interface PickedProduct extends Pick<Product, 
  'id' | 
  'name' | 
  'price' | 
  'sources' |
  'selection' |
  'attributes' |
  'thumbUrl' |
  'price' |
  'productionTime' |
  'mockUp' |
  'priceRange' |
  'variants'
> {}

export interface PickedArt extends Pick<Art,
  'artId' |
  'title' |
  'squareThumbUrl' |
  'largeThumbUrl' |
  'prixerUsername' |
  'exclusive'
> {}