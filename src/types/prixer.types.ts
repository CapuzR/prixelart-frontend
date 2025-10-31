import { ObjectId } from "mongodb";

export interface Prixer {
  _id?: ObjectId;
  specialty?: string[];
  description?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  phone?: string;
  avatar?: string;
  status?: boolean;
  // visible: boolean
  termsAgree: boolean;
  bio?: Record<string, string[]>; // First String Bio, Second String Images
}
