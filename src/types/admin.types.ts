import { Permissions} from "./permissions.types"

export interface AdminToken {
    username: string;
    area: string;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    permissions: Permissions;
    id: string;
    time: Date;
}

export interface Admin {
    token: string;
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    area: string;
    isSeller: boolean;
}

export interface AdminRole {
    _id: string;
    area: string;
    createDiscount?: boolean;
    createOrder: boolean;
    createPaymentMethod: boolean;
    createProduct: boolean;
    createShippingMethod: boolean;
    createTestimonial?: boolean;
    deleteDiscount?: boolean;
    deletePaymentMethod: boolean;
    deleteProduct: boolean;
    deleteShippingMethod: boolean;
    deleteTestimonial?: boolean;
    detailOrder: boolean;
    detailPay: boolean;
    modifyAdmins?: boolean;
    modifyBanners: boolean;
    modifyDollar: boolean;
    modifyTermsAndCo: boolean;
    orderStatus: boolean;
    prixerBan?: boolean;
    readMovements?: boolean;
    setPrixerBalance?: boolean;
    createConsumer?: boolean;
    readConsumers?: boolean;
    deleteConsumer?: boolean;
    artBan?: boolean;
    modifyBestSellers?: boolean;
    modifyArtBestSellers?: boolean;  
}

