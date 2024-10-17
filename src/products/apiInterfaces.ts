import { CartItem as C_CartItem } from '../cart/interface';
export type CartItem = C_CartItem;

export interface Product {
    name: string;
    description: string;
    sources: Sources;
    variants: Variant[];
    priceRange: PriceRange;
    attributes: Attribute[];
  }
  
  interface Sources {
    images: Image[];
  }
  
  interface Image {
    type: string;
    url: string;
  }
  
  interface Variant {
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