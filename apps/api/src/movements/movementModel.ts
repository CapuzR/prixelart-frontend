import { ObjectId } from "mongodb";

export interface Movement {
  _id?: string | ObjectId;
  date: Date;
  destinatary?: string;
  description: string;
  type: 'Depósito' | 'Retiro';
  value: number;
  order?: string;
  createdOn: Date;
  createdBy: string;
  item?: Record<string, File>; //TODO: discuss this, why string or file?
}