import { Permissions} from "./permissions.types"
import { ObjectId } from "mongodb";

export interface AdminToken {
    username: string;
    area: string;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    permissions: Permissions;
    id: ObjectId;
    time: Date;
}