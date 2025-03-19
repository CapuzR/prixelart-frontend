import { Discount } from "./discount.types"

export interface PickedProduct
  extends Pick<
    Product,
    | "_id"
    | "name"
    | "price"
    | "sources"
    | "selection"
    | "attributes"
    | "thumbUrl"
    | "price"
    | "productionTime"
    | "mockUp"
    | "priceRange"
    | "variants"
    | "discount"
    | "modifyPrice"
    | "comission"
    | "active"
    | "considerations"
    | "cost"
    | "publicPrice"
    | "prixerPrice"
    | "hasSpecialVar"
    | "bestSeller"
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
    images: { url: string }[]
  }
  productionTime: number
  mockUp: any
  category?: string
  active: boolean
  considerations: string
  cost: number
  publicPrice: PriceRange | Equation
  prixerPrice: PriceRange | Equation
  hasSpecialVar: boolean
  bestSeller: boolean
}

export interface Variant {
  _id: string
  id: string
  name: string
  active: boolean
  description: string
  category?: string
  considerations: string
  productionTime: number
  cost: number
  publicPrice: Equation
  prixerPrice: Equation

  attributes: VariantAttribute[]
}

export interface VariantAttribute {
  name: string
  value: string
}

export interface Selection {
  name: string
  value: string
  attributes: object[]
}

export interface PriceRange {
  from: number
  to: number
}

export interface Equation {
  equation: number
}

export interface Attribute {
  name: string
  value: string[]
}

export interface Category {
  active: boolean
  icon: string
  image: string
  name: string
}
