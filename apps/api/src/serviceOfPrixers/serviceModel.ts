import { ObjectId } from "mongodb";

export interface Service {
  _id?: ObjectId
  title: string;
  active: boolean;
  description: string;
  prixer: string;
  userid: string;
  isLocal: boolean;
  isRemote: boolean;
  location?: string;
  sources: {
    images: { url: string }[];
    video?: string;
  };
  serviceArea: string;
  productionTime?: string;
  publicPrice: {
    from: number;
    to?: number;
  };
  disabledReason?: string;
  visible?: boolean;
}