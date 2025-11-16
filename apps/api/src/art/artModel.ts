import { ObjectId } from "mongodb"

interface Crop {
  name: string
  aspect: number
  thumb: string
  crop: {
    x: number
    y: number
  }
  zoom: number
  cropped: boolean
  croppedAreaPixels: {
    width: number
    height: number
    x: number
    y: number
  }
}

interface Certificate {
  code?: string
  serial?: number
  sequence?: number
}

export type ArtStatTemporary = Partial<Art>
export interface Art {
  _id?: ObjectId
  artId: string
  artLocation: string
  artType: string
  category?: string
  certificate?: Certificate
  comission: number
  createdOn?: Date
  crops?: Crop[]
  description: string
  discountId?: string
  disabledReason?: string
  exclusive: string
  imageUrl: string
  largeThumbUrl: string
  mediumThumbUrl: string
  originalPhotoHeight: string
  originalPhotoIso: string
  originalPhotoPpi: string
  originalPhotoWidth: string
  owner?: string
  points?: number
  prixerUsername: string
  publicId?: string
  selled?: number
  smallThumbUrl: string
  squareThumbUrl: string
  surchargeId?: string[]
  status: string
  tags: string[]
  thumbnailUrl?: string
  title: string
  userId: string
  visible: boolean
}
