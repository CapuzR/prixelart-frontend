import { PickedArt } from "./art.types"
import { PickedProduct } from "./product.types"

export interface Item {
  sku: string
  art?: PickedArt
  product: PickedProduct
  price: number
  discount: number
  // quantity: number
}