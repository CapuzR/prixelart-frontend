import { Account } from "../account/accountModel.ts"
import { Admin } from "../admin/adminModel.ts"
import { PermissionsV2 } from "../admin/permissionsModel.ts"
import { Art, ArtStatTemporary } from "../art/artModel.ts"
import { Discount } from "../discount/discountModel.ts"
import { Manufacturer } from "../manufacturer/manufacturerModel.ts"
import { Movement } from "../movements/movementModel.ts"
import { Order, PaymentMethod, ShippingMethod } from "../order/orderModel.ts"
import {
  GlobalDashboardStatsData,
  PerformanceData,
  TopPerformingItemData,
} from "../order/orderService.ts"
import { OrderArchive } from "../orderArchive/orderArchiveModel.ts"
import { Organization } from "../organizations/organizationModel.ts"
import {
  CarouselItem,
  TermsAndConditions,
} from "../preferences/preferencesModel.ts"
import { Prixer } from "../prixer/prixerModel.ts"
import { Product } from "../product/productModel.ts"
import { Service } from "../serviceOfPrixers/serviceModel.ts"
import { Surcharge } from "../surcharge/surchargeModel.ts"
import { Testimonial } from "../testimonials/testimonialModel.ts"
import { User } from "../user/userModel.ts"

type DiscountValues = number[]
type Gallery = { arts: Art[]; length: number }

export interface GalleryResult {
  arts: Art[];
  hasMore: boolean;
}

interface email {
  success: boolean
  message: string
  data?: any
}

interface UpdatedProduct {
  productId?: string
  variantId?: string
  success: boolean
  message: string
  productName?: string
  variantName?: string
}

export interface TopCategoryStat {
  category: string;
  count: number;
}

export interface TopProductStat {
  product: string;
  count: number;
}
export interface PrixerDashboardStats {
  myArtStats: Partial<Art>[];
  topCategories: TopCategoryStat[];
  topProducts: TopProductStat[];
  myProductStats: TopProductStat[];
}

type PrixResult =
  | Account
  | Account[]
  | Admin
  | Admin[]
  | Art
  | Art[]
  | ArtStatTemporary
  | ArtStatTemporary[]
  | CarouselItem
  | CarouselItem[]
  | Discount
  | Discount[]
  | DiscountValues
  | email
  | Gallery
  | GalleryResult
  | GlobalDashboardStatsData
  | Manufacturer
  | Manufacturer[]
  | Movement
  | Movement[]
  | Order
  | Order[]
  | OrderArchive
  | OrderArchive[]
  | Organization
  | Organization[]
  | PaymentMethod
  | PaymentMethod[]
  | PerformanceData[]
  | PermissionsV2
  | PermissionsV2[]
  | Prixer
  | Prixer[]
  | PrixerDashboardStats
  | Product
  | Product[]
  | Record<string, string[]>
  | Service
  | Service[]
  | ShippingMethod
  | ShippingMethod[]
  | string
  | string[]
  | Surcharge
  | Surcharge[]
  | TermsAndConditions
  | Testimonial
  | Testimonial[]
  | TopPerformingItemData[]
  | UpdatedProduct[]
  | User
  | User[]


export interface PrixResponse {
  success: boolean
  message: string
  result?: PrixResult
  email?: email
}

export interface PermissionsResponse {
  success: boolean
  message: string
  result?: PermissionsV2
}