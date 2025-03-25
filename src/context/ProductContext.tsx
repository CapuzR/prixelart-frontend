import {
  Product,
  PriceRange,
  Equation,
  Category,
  Variant,
} from "../types/product.types"
import React, { createContext, useReducer, useContext } from "react"

interface Img {
  url: string
  type: string
}
interface ProductFormState {
  _id?: string
  active: boolean | string
  name: string
  description: string
  category: Category | string | undefined// create and import Category Interface
  considerations: string
  productionTime: number
  cost: number
  publicPrice: { from?: number; to?: number; equation?: number }
  prixerPrice: { from?: number; to?: number; equation?: number }
  hasSpecialVar: boolean | string
  autoCertified: boolean | string
  video?: { type: string; url: string }
  productImages: Array<string | File>
  sources: any
  thumbUrl?: string
  variants: Array<Variant>
}
// Es necesario que PriceRange y Equation existan al mismo tiempo
const initialState: ProductFormState = {
  active: true,
  name: "",
  description: "",
  category: "",
  considerations: "",
  productionTime: 0,
  cost: 0,
  publicPrice: {
    from: 0,
    to: 0,
    equation: 0,
  },
  prixerPrice: {
    from: 0,
    to: 0,
    equation: 0,
  },
  hasSpecialVar: false,
  autoCertified: false,
  video: undefined,
  productImages: [],
  sources: { images: [], video: undefined },
  variants: [],
}

const formatProd = (prod: Partial<Product>) => {
  return {
    _id: prod._id,
    active: prod.active || false,
    name: prod?.name || "",
    description: prod.description || "",
    category: prod?.category || "",
    considerations: prod?.considerations || "",
    productionTime: prod?.productionTime || 0,
    cost: Number(prod.cost),
    publicPrice: {
      from: Number(prod.publicPrice?.from) || 0,
      to: Number(prod.publicPrice?.to) || 0,
      equation: Number(),
    },
    prixerPrice: {
      from: Number(prod.prixerPrice?.from) || 0,
      to: Number(prod.prixerPrice?.to) || 0,
    },
    hasSpecialVar:
      (typeof prod.hasSpecialVar === "string" &&
        prod?.hasSpecialVar === "true") ||
      (prod?.hasSpecialVar && prod?.hasSpecialVar === true)
        ? true
        : false,
    autoCertified:
      (typeof prod?.autoCertified === "string" &&
        prod?.autoCertified === "true") ||
      (prod?.autoCertified && prod?.autoCertified === true)
        ? true
        : false,
    video: prod.sources?.video || undefined,
    sources: prod.sources && prod.sources.images,
  }
}

type ProductFormAction =
  | {
      type: "SET_FIELD"
      field: keyof ProductFormState
      value: string | boolean
    }
  | {
      type: "SET_NESTED_FIELD"
      parentField: keyof ProductFormState
      childField: string
      value: string | number
    }
  | {
      type: "SET_FULL_FORM"
      product: Product
    }
  | { type: "RESET_FORM" }

const ProductFormReducer = (
  state: ProductFormState,
  action: ProductFormAction
): ProductFormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "SET_NESTED_FIELD":
      return {
        ...state,
        [action.parentField]: {
          ...state[action.parentField],
          [action.childField]: action.value,
        },
      }
    case "SET_FULL_FORM":
      return { ...state, ...formatProd(action.product) }
    case "RESET_FORM":
      return initialState
    default:
      return state
  }
}

const ProductFormContext = createContext<{
  state: ProductFormState
  dispatch: React.Dispatch<ProductFormAction>
} | null>(null)

export const ProductFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(ProductFormReducer, initialState)
  return (
    <ProductFormContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductFormContext.Provider>
  )
}

export const useProductForm = () => {
  const context = useContext(ProductFormContext)
  if (!context) {
    throw new Error("useProductForm debe usarse dentro de ProductFormProvider")
  }
  return context
}
