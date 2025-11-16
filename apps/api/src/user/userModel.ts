import { ObjectId } from "mongodb";
import { Prixer } from "../prixer/prixerModel.ts";

export interface User {
  _id?: ObjectId;
  account?: string;
  active: boolean;
  address?: string;
  avatar?: string;
  billingAddress?: string;
  birthdate?: Date;
  ci?: string;
  city?: string;
  country?: string;
  email: string;
  facebook?: string;
  firstName: string;
  gender?: string;
  instagram?: string;
  lastName: string;
  login_count?: number;
  password?: string;
  phone?: string;
  prixer?: Prixer;
  role?: string[];
  shippingAddress?: string;
  twitter?: string;
  username?: string;
}