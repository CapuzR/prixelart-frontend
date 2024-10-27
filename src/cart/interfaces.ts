import { Art } from '../art/interfaces';
import { Product } from '../products/interfaces';

export interface CartItem {
  id: string;
  art: PickedArt | undefined;
  product: PickedProduct | undefined;
  quantity: number;
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
  'mockUp'
> {}

export interface PickedArt extends Pick<Art,
  'artId' |
  'title' |
  'squareThumbUrl' |
  'largeThumbUrl' |
  'prixerUsername' |
  'exclusive'
> {}