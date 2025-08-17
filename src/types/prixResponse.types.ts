import { GlobalDashboardStatsData } from "@api/order.api";
import { Account } from "./account.types";
import { Admin } from "./admin.types";
import { Art } from "./art.types";
import { Manufacturer } from "./manufacturer.types";
import { Movement } from "./movement.types";
import { Order, PaymentMethod, ShippingMethod } from "./order.types";
import { OrderArchive } from "./orderArchive.types";
import { Organization } from "./organization.types";
import { CarouselItem, TermsAndConditions } from "./preference.types";
import { Prixer } from "./prixer.types";
import { Product } from "./product.types";
import { Service } from "./service.types";
import { Surcharge } from "./surcharge.types";
import { Testimonial } from "./testimonial.types";
import { User } from "./user.types";
import { Discount } from "./discount.types";
import { PermissionsV2 } from "./permissions.types";

type DiscountValues = number[];
export type Gallery = { arts: Art[]; length: number };

type PrixResult = GlobalDashboardStatsData | Gallery | CarouselItem | CarouselItem[] | Account | Account[] | User | User[] | Testimonial | Testimonial[] | Admin | Admin[] | PermissionsV2 | PermissionsV2[] | string | string[] | DiscountValues | Discount | Discount[] | Surcharge | Surcharge[] | Service | Service[] | Product | Product[] | Prixer | Prixer[] | Record<string, string[]> | Organization | Organization[] | Movement | Movement[] | Art | Art[] | Manufacturer | Manufacturer[] | Order | Order[] | OrderArchive | OrderArchive[] | PaymentMethod | PaymentMethod[] | ShippingMethod | ShippingMethod[] | TermsAndConditions;

export interface PrixResponse {
    success: boolean;
    message: string;
    result?: PrixResult;
}
