import { CartItem as C_CartItem } from 'cart/interfaces';
export type CartItem = C_CartItem;

  export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    attributes: Attribute[];
    selection: Selection[];
    variants: Array<Variant>;
    priceRange: PriceRange;
    observations: string;
    thumbUrl: string;
    sources: {
      images: { url: string }[];
    }
  }

  
  export interface Variant {
    _id: string;
    name: string;
    attributes: VariantAttribute[];
  }
  
  interface VariantAttribute {
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
