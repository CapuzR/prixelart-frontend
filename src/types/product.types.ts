
export interface PickedProduct
  extends Pick<
    Product,
    | 'id'
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
  > {}

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
}

interface PriceRange {
  from: number;
  to: number;
}

interface Attribute {
  name: string;
  value: string[];
}
