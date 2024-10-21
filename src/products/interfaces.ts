import { CartItem as C_CartItem } from 'cart/interfaces';
export type CartItem = C_CartItem;

// export interface Product {
//     name: string;
//     description: string;
//     sources: Sources;
//     variants: Variant[];
//     priceRange: PriceRange;
//     attributes: Attribute[];
//   }
  
//   interface Sources {
//     images: Image[];
//   }
  
//   interface Image {
//     type: string;
//     url: string;
//   }
  
//   interface Variant {
//     _id: string;
//     name: string;
//     attributes: VariantAttribute[];
//   }
  
//   interface VariantAttribute {
//     name: string;
//     value: string;
//   }
  
  
//   interface PriceRange {
//     from: number;
//     to: number;
//   }
  
//   interface Attribute {
//     name: string;
//     value: string[];
//   }

interface Attribute {
  name: string;
  value: string[];
}

interface Selection {
  name: string;
  value: string;
}

//Este parece ser el tipo que se utiliza en Product/Details, diferente al de Product/Catalog.
export interface Product {
  productId: string;
  name: string;
  price: number;
  description: string;
  attributes: Attribute[];
  selection: Selection[];
  variants: Array<any>;
  priceRange: any;
  observations: string;
  sources: {
    images: { url: string }[];
  }
}