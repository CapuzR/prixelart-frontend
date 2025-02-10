import { ObjectId } from "mongodb";

export interface PaymentMethod {
    active: boolean;
    name: string;
    createdOn: Date;
    createdBy: string;
    instructions: string;
    paymentData: string;
    _id: ObjectId;
}