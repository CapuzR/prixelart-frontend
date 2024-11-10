import { 
  Item,
  PickedProduct
} from 'cart/interfaces';
export type { Item, PickedProduct };

import { Art } from 'art/interfaces';
export type { Art };

  export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    attributes: Attribute[];
    selection: any[] | undefined;
    variants: Array<Variant>;
    priceRange: PriceRange;
    observations: string;
    thumbUrl: string;
    sources: {
      images: { url: string }[];
    },
    productionTime: number;
    mockUp: any;
  }

  
  export interface Variant {
    _id: string;
    id: string;
    name: string;
    attributes: VariantAttribute[];
  }
  
  export interface VariantAttribute {
    name: string;
    value: string;
  }
  
  
  interface PriceRange {
    from: number;
    to: number;
  }
  
  interface Attribute {
    name: string;
    value: string[];
  }

  interface Selection {
    name: string;
    value: string;
  }
