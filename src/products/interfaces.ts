
interface Attribute {
    name: string;
    value: string[];
  }
  
  interface Selection {
    name: string;
    value: string;
  }
  
  export default interface Product {
    productId: string;
    name: string;
    price: number;
    description: string;
    attributes: Attribute[];
    selection: Selection[];
    variants: Array<any>;
    priceRange: any;
    observations: string;
  }