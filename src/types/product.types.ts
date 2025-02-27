import { Discount } from "./discount.types";

export interface PickedProduct
  extends Pick<
    Product,
    | '_id'
    | 'name'
    | 'price'
    | 'sources'
    | 'selection'
    | 'attributes'
    | 'thumbUrl'
    | 'price'
    | 'productionTime'
    | 'mockUp'
    | 'priceRange'
    | 'variants'
    | 'discount'
    | 'modifyPrice'
    | 'comission'
  > {}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  discount: string;
  attributes: Attribute[];
  selection: Selection[] | object[] | string | undefined;
  modifyPrice: number;
  comission: number;
  variants: Array<Variant>;
  priceRange: PriceRange | Equation;
  observations: string;
  thumbUrl: string;
  sources: {
    images: { url: string }[];
  };
  productionTime: number;
  mockUp: any;
  category?: string;
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

export interface Selection {
  name: string;
  value: string;
  attributes: object[];
}

interface PriceRange {
  from: number;
  to: number;
}

interface Equation {
  equation: number
}

interface Attribute {
  name: string;
  value: string[];
}
