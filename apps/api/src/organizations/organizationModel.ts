import { ObjectId } from "mongodb";

export interface Organization {
  _id?: ObjectId;
  specialtyArt?: string[];
  description?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  dateOfBirth: string;
  phone: string;
  country: string;
  city: string;
  userId: string;
  shortShot?: string;
  username: string;
  avatar?: string;
  status?: boolean;
  termsAgree?: boolean;
  bio?: string;
  agreement?: boolean;
}