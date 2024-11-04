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
  items: CartLine[];
  subTotal: number;
  totalUnits: number;
  cartDiscount: number;
  totalDiscount: number;
}

export interface CartLine {
  item: Item;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Item {
  id: string | undefined;
  art: PickedArt | undefined;
  product: PickedProduct | undefined;
  price: number;
  discount: number;
}


//cartItem debe tener price jaja wtf, y también subTotal (?) para no estarlo calculando en todos lados ?
export interface CartItem {
  id: string | undefined;
  art: PickedArt | undefined;
  product: PickedProduct | undefined;
  quantity: number | undefined;
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