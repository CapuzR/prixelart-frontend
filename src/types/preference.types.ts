import { ObjectId } from "mongodb";

export interface TermsAndConditions {
  termsAndConditions: string;
}

export interface CarouselItem {
  _id?: ObjectId;
  position: number;
  type: "desktop" | "mobile";
  imageURL: string;
}
