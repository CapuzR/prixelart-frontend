import { ObjectId } from "mongodb";
import { Prixer } from "./prixer.types";

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
  role?: UserRoles[];
  shippingAddress?: string;
  twitter?: string;
  username: string;
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

export const USER_ROLE_OPTIONS = [
  { value: 'consumer', label: 'Consumidor' },
  { value: 'prixer', label: 'Prixer' },
  { value: 'organization', label: 'Organización' },
] as const;

export type UserRoles = typeof USER_ROLE_OPTIONS[number]['value'];