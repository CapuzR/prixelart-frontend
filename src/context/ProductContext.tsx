import {
  Product,
  PriceRange,
  Equation,
  Category,
  Variant,
  Attribute,
  Selection,
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
  price: number

  attributes: Attribute[]
  description: string
  selection?: Selection
  variants: Array<Variant>
  priceRange: PriceRange

  category: Category | string | undefined
  observations: string

  thumbUrl?: string
  sources: {
    images?: { type: string; url: string }[]
    video?: { type: string; url: string }
  }
  discount: string | undefined
  status: string

  considerations: string
  productionTime: number
  cost: number
}

const initialState: ProductFormState = {
  active: true,
  name: "",
  description: "",
  category: "",
  considerations: "",
  productionTime: 0,
  cost: 0,
  priceRange: {
    from: 0,
    to: 0,
    equation: 0,
  },
  price: 0,
  observations: "",
  discount: undefined,
  status: "visible",
  attributes: [],
  thumbUrl: undefined,
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
    priceRange: {
      from: Number(prod.priceRange?.from) || 0,
      to: Number(prod.priceRange?.to) || 0,
      equation: Number(),
    },
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
