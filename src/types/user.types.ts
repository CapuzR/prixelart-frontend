import { ObjectId } from "mongodb";
import { Prixer } from "./prixer.types";

export interface User {
  _id?: ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  account?: string;
  role?: string[];
  login_count?: number;
  country?: string;
  city?: string;
  prixer?: Prixer;
  avatar?: string;
  active: boolean;
  ci?: string;
  phone?: string;
  address?: string;
  billingAddress?: string;
  shippingAddress?: string;
  birthdate?: Date;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  gender?: string;
}

export type UserOptions = Pick<
  User,
  | "_id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "shippingAddress"
  | "billingAddress"
>;