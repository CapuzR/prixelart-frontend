import { Discount } from "./discount.types"
import { Movement } from "./movement.types"

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
    // | "modifyPrice"
    // | "comission"
    | "active"
    | "considerations"
    | "cost"
    // | "publicPrice"
    // | "prixerPrice"
    // | "hasSpecialVar"
    // | "bestSeller"
    // | "finalPrice"
    | "status"
    // | "autoCertified"
  > {}

export interface Product {
  _id: string
  name: string
  price: number
  description: string
  attributes: Attribute[]
  selection: Selection
  variants: Array<Variant>
  priceRange: PriceRange
  observations: string
  thumbUrl: string
  sources: {
    images?: { type: string; url: string }[]
    video?: { type: string; url: string }
  }
  productionTime: number
  mockUp: any
  category?: Category | string
  
  active: boolean | string
  considerations: string
  cost: number
  discount: string | undefined
  status: string
}

export interface Variant {
  _id: string
  // id: string
  name: string
  active: boolean
  description: string
  priceRange: PriceRange
  // category?: string
  // considerations: string
  productionTime: number
  cost: number
  // publicPrice: Equation
  // prixerPrice: Equation
  thumbUrl: string
  sources?: {
    images?: { type: string; url: string }[]
    video?: { type: string; url: string }
  }
  // video?: string
  attributes: VariantAttribute[]
}

export interface VariantAttribute {
  name: string
  value: string
}

export interface Selection {
  name: string
  value: string
  attributes: Attribute
  // must be like [{type: string, value: string}]
}

export interface PriceRange {
  from?: number
  to?: number
  equation?: number
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
