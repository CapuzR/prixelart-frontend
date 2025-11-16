import { ObjectId } from "mongodb";

export interface Testimonial {
  _id?: ObjectId;
  type: string;
  name: string;
  value: string;
  avatar: string;
  footer?: string;
  position: number;
  status: boolean;
}