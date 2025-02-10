import { ObjectId } from "mongodb";

export interface ShippingMethod {
    active: boolean;
    name: string;
    createdOn: Date;
    createdBy: string;
    price: string;
    _id: ObjectId;
}