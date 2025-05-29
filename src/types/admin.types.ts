import { ObjectId } from "mongodb";

export interface Admin {
    _id?: ObjectId;
    firstname: string;
    lastname: string;
    username: string;
    area: string;
    phone: string;
    email: string;
    password: string;
    isSeller: boolean;
}