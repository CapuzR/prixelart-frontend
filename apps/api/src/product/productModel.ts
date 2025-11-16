import { ObjectId } from "mongodb";

export interface Variant {
  _id?: string;
  name: string;
  variantImage?: string;
  attributes: VariantAttribute[];
  discountId?: string[];
  publicPrice: string;
  prixerPrice: string;
  surchargeId?: string[];
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface Product {
  _id?: ObjectId;
  active: boolean;
  autoCertified: boolean;
  bestSeller: boolean;
  category: string;
  coordinates?: string;
  cost?: string;
  description: string;
  hasSpecialVar: boolean;
  mockUp: string;
  name: string;
  productionTime?: string;
  sources: {
    images: { url: string }[];
    video?: string;
  };
  thumbUrl?: string;
  variants?: Array<Variant>;
  productionLines?: string[];
}