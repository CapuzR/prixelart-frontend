import { Art } from '../art/interfaces';
import { Product } from '../products/interfaces';

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
  'priceRange'
> {}

export interface PickedArt extends Pick<Art,
  'artId' |
  'title' |
  'squareThumbUrl' |
  'largeThumbUrl' |
  'prixerUsername' |
  'exclusive'
> {}