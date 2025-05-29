import { ObjectId } from "mongodb";

export interface OrderArchive {
    _id: ObjectId;
    orderId: string;
    orderType: ErType;
    createdOn: CompletionDate;
    createdBy: CreatedByCreatedByClass | CreatedByEnum;
    subtotal: number;
    tax: number;
    total: number;
    basicData?: BasicData;
    shippingData: ShippingData;
    billingData?: BillingData;
    requests: Request[];
    status: Status;
    observations?: string;
    __v: number;
    payStatus?: PayStatus;
    dollarValue?: number;
    payDate?: CompletionDate;
    completionDate?: CompletionDate;
    shippingCost?: number | null;
    consumerId?: string;
    consumerData?: ConsumerData;
    comissions?: any[];
    paymentVoucher?: string;
}

interface BasicData {
    firstname?: string;
    lastname?: string;
    ci?: string;
    email?: string;
    phone?: string;
    address?: string;
    name?: string;
}

interface BillingData {
    name?: string;
    lastname?: string;
    ci?: string;
    company?: string;
    orderPaymentMethod: OrderPaymentMethod;
    destinatary?: string;
    address?: string;
    billingCompany?: string;
    phone?: string;
}

type OrderPaymentMethod = "Efectivo $" | "Zelle" | "Bs Transferencia" | "Bs Pago Móvil" | "CoinPrix" | "Balance Prixer" | "Giftcard" | "Cashea";

interface CompletionDate {
    $date: Date;
}

interface ConsumerData {
    consumerId: string;
    consumerType: ErType;
}

type ErType = "Corporativo" | "DAs" | "Particular" | "Prixer" | "Artista";

interface CreatedByCreatedByClass {
    _id?: string;
    active?: boolean;
    contactedBy?: ContactedBy;
    consumerType?: ErType;
    firstname?: Firstname;
    lastname?: string;
    ci?: string;
    phone?: string;
    email?: Email;
    address?: string;
    billingAddress?: string;
    shippingAddress?: string;
    __v?: number;
    username?: PurpleUsername;
}

interface ContactedBy {
    username: string;
    id: number;
    phone: string;
    email: string;
}

type Email = "dhenriquez@prixelart.com" | "iamwar2070@gmail.com";

type Firstname = "Diego" | "Edward";

type PurpleUsername = "Nancy Paredes" | "Sheena Bertolino" | "Diego Henriquez" | "Edward Guerrero";

type CreatedByEnum = "Prixelart Page";

export type PayStatus = "Pagado" | "Anulado" | "Obsequio" | "Abonado" | "Pendiente";

export interface Request {
    product: ArchiveProduct;
    art: ArchiveArt;
    quantity?: number | string;
}

export interface ArchiveArt {
    tags?: string[];
    visible?: boolean;
    points?: number;
    artId?: number | string;
    title: string;
    description?: string;
    category?: ArtCategory;
    largeThumbUrl?: string;
    mediumThumbUrl?: string;
    smallThumbUrl?: string;
    squareThumbUrl?: string;
    userId?: UserID;
    prixerUsername?: Owner;
    artType?: ArtType;
    originalPhotoWidth?: string;
    originalPhotoHeight?: string;
    originalPhotoIso?: string;
    originalPhotoPpi?: string;
    artLocation?: string;
    thumbnailUrl?: string;
    publicId?: PublicID;
    disabledReason?: string;
    comission?: number;
    exclusive?: Exclusive;
    owner?: Owner;
    images?: ArtImage[];
    crops?: CropElement[];
    _id?: string;
    imageUrl?: string;
    status?: string;
    __v?: number;
    certificate?: Certificate;
    createdOn?: Date;
}

type ArtType = "Foto" | "Diseño" | "Pintura";

type ArtCategory = "Flora" | "Abstracto" | "Montañas" | "Edificios" | "Playas" | "Arquitectura" | "Ciudades" | "Lanchas, barcos o yates" | "Fauna" | "Comida" | "Café" | "Vehículos" | "Animales" | "Atardecer" | "Naturaleza" | "Puentes" | "Transportes" | "Cacao" | "Surrealista" | "Pintura" | "Personajes religiosos";

interface Certificate {
    code: Code;
    serial: number | string;
    sequence: number;
}

type Code = "XX";

interface CropElement {
    id: number;
    name: string;
    aspect: number;
    thumb: string;
    crop: CropCrop;
    zoom: number;
    cropped: boolean;
    croppedAreaPixels: CroppedAreaPixels;
}

interface CropCrop {
    x: number;
    y: number;
}

interface CroppedAreaPixels {
    width: number;
    height: number;
    x: number;
    y: number;
}

type Exclusive = "standard" | "exclusive" | "private";

interface ArtImage {
    color: Color;
    img: string;
}

type Color = "Negro" | "Azul" | "Verde";

type Owner = "dhenriquez" | "antuangio" | "malena" | "mlara1" | "josythomas" | "sinasns" | "iconosvenezolanos" | "andryjons" | "torvic" | "myrna727" | "isaimorales" | "jbdiwan" | "vitamarcelot" | "cariteshop" | "jpullas" | "raul87" | "tibunando" | "fotonatura" | "fotofelix" | "kwillherrera" | "photorenova" | "omarponceleon@gmail.com" | "LPG" | "bl4ckros3" | "ChiguireBipolar" | "JuanCerbero" | "jgphoto05" | "dorita" | "meriland5101" | "@KoiDiazArt";

type PublicID = "dhenriquez/DH-01_Ávila_desde_Chuao_nxcj7t" | "dhenriquez/DH-133_Desde_el_Lago_Parque_del_Este_xowodq" | "dhenriquez/DH-02_Kukenan_kmlymm" | "dhenriquez/DH-14_Ávila_y_Esfera_de_Soto_okdl3j" | "dhenriquez/DH-129_Camino_de_Dios_upoz6p" | "dhenriquez/DH-138_La_Tortuga_Roca_Plana_mz9ecj" | "vitamarcelot/_DSC8093_s3taza" | "dhenriquez/DH-44_Cima_del_Roraima_j2wqps" | "dhenriquez/DH-04_Tepu_y_Rio_Kukenan_nluwo3" | "dhenriquez/DH-23_Los_Dos_Grandes_ob4eq4" | "dhenriquez/DH-179_Atardecer_entre_tepuyes_obesso" | "dhenriquez/DH-172_Mirador_de_Yapascua_bn3i7d" | "dhenriquez/DH-146_Faro_en_La_Tortuga_jaidku" | "dhenriquez/DH-18_Cascada_Kukenan_rebamm" | "dhenriquez/DH-05_Ávila_desde_Caurimare_dx9nej" | "tibunando/IMG_3054_lp8rcn" | "mlara1/Pastor_de_nubes-02_nzgupz" | "mlara1/mural30x10_zrur7a" | "mlara1/ucab-02_efpry5";

type UserID = "603c50f4d0885c00113017c3" | "6049821bd0885c00113017cc" | "62c873ed27498d0011eb1437" | "604ff1e8b23854001120feed" | "62f53afd27498d0011eb3c7e" | "62f30ed027498d0011eb3956" | "60f0abd3d11c780011453622" | "61c132357404fa0011b12d5b" | "60d8a060d11c780011452943" | "62a22d7c1e58c200117ef34c" | "6233e7df28c461001147f00f" | "628d28db5937da001151e45d" | "60637783b23854001120ff15" | "60c7834a33cab800115422e2" | "6410be4f2657ac0012045fef" | "60b95a3dcd7dd800116c9926" | "6058c00ab23854001120ff04" | "63d5e7f28a132700117ffb4b" | "63d01d488a132700117fe3c3" | "614f4e44d11c780011455b4b" | "651acb6c55def80011e780b9" | "65dcf28afddf5b0012b89a8f" | "6386d6ae723ad30011b6162a" | "659c687d1dae0600115a3782" | "6411e4e72657ac00120462b0" | "605670b7b23854001120fefd" | "66709195fc7e3a0012363b85" | "669e555c0b472e0012b04699" | "66994d3471b0ae00120f9613";

export interface ArchiveProduct {
    sources?: Sources;
    publicPrice?: PriceRange;
    attributes: AttributesAttribute[] | AttributesClass;
    variants?: Variant[];
    _id?: ProductID;
    name: string;
    description: string;
    category?: ProductCategory;
    considerations?: string;
    active?: boolean;
    hasSpecialVar?: boolean;
    __v?: number;
    productionTime?: number | string;
    needsEquation?: boolean;
    publicEquation?: number | string;
    selection?: Array<null | string> | SelectionClass | string;
    prixerPrice?: PriceRange;
    thumbUrl?: string;
    prixerEquation?: number | string;
    discount?: Discount | null;
    modifyPrice?: boolean;
    status?: Status;
    bestSeller?: boolean;
    finalPrice?: number | string;
    mockUp?: MockUp;
    cost?: string;
    comission?: number | null;
    basePrice?: number;
    count?: number;
    points?: number;
    item?: string;
    title?: string;
    point?: number;
    specs?: string;
    id?: ProductID;
    autoCertified?: boolean;
    offer?: string;
    categories?: any[];
    available?: boolean;
    interPrice?: number;
    interProductionTime?: { [key: string]: string[] }[];
    inter?: boolean;
    priceRange?: PriceRange;
}

type ProductID = "6413349c2657ac0012046477" | "6176a5787404fa0011b10216" | "6177f8697404fa0011b10417" | "6176e71e7404fa0011b102e9" | "6360260eaf8bc30011a35f02" | "644822b0b3757a001195a83e" | "6360270aaf8bc30011a35f0a" | "6201c38891523f0011ebd0cd" | "6176a8f37404fa0011b10234" | "6201b71591523f0011ebd0a2" | "644154c5181f760011769777" | "641340972657ac00120464ab" | "63603349af8bc30011a35f16" | "64397b7e181f760011768da1" | "63602401af8bc30011a35ee7" | "62068c5f91523f0011ebd3a4" | "6176a74c7404fa0011b10225" | "6176a86c7404fa0011b10230" | "6201b25e91523f0011ebd08c" | "62099e1691523f0011ebd544" | "63605941af8bc30011a35f30" | "6499f4f61d692e001182460d" | "636057efaf8bc30011a35f26" | "64a5e59e3596d90011858ef6" | "64a5f9683596d90011859042" | "64a5fd523596d900118590a4" | "635ff514af8bc30011a35e1f" | "62068bde91523f0011ebd3a1" | "6206863c91523f0011ebd398" | "63602c27af8bc30011a35f0d" | "64b16f052f26da00112f5fd4" | "649ec9521d692e001182512d" | "6176a6aa7404fa0011b1021e" | "61771d0c7404fa0011b103f0" | "6201c2b291523f0011ebd0ca" | "648bb2c310818c0011057adc" | "620a3f1791523f0011ebd573" | "6442c737181f76001176a2f7" | "620a41b791523f0011ebd577" | "6176a8007404fa0011b10229" | "63602f85af8bc30011a35f13" | "6201c88791523f0011ebd100" | "649de45e1d692e0011824fca" | "6201cc1491523f0011ebd120" | "6206895a91523f0011ebd39e" | "651b14bade99380011eeaf8d" | "61771a847404fa0011b103ea" | "651dadb7de99380011ef0e82" | "649d82671d692e0011824ece" | "6499f8551d692e0011824622" | "65490f0002f4470011bdaf48" | "656f26123051410011744e83" | "656f1fb73051410011744dcc" | "659e98be1dae0600115a8caa" | "65b0008095f3b400113de55c" | "65bd01867bfa8f00128be8e0" | "6206a43f91523f0011ebd3b3" | "6657f83b7a000200122b54de" | "668fcf1b7ed5eb00125d04d8" | "668fd0c47ed5eb00125d0508" | "66b4d77df8a67e0012e6444f" | "668fcfc67ed5eb00125d04e9" | "6719033e28c3320012475286" | "671900c428c3320012474e2f" | "6719024528c3320012475220" | "6719077a28c332001247528f" | "6759834380ef980012bada5c" | "6759819780ef980012baceb8" | "668fcd447ed5eb00125d04a6" | "65f84cc593981f0012d8777a";

export interface AttributesAttribute {
    name: AttributeName;
    value: string[];
}

type AttributeName = "Material" | "Tipo" | "Medida" | "Cantidad" | "Talla" | "Color" | "Opciones" | "Piezas";

export interface AttributesClass {
    color: Color[];
    talla?: Talla[];
    corte?: Corte[];
}

type Corte = "Caballero" | "Dama";

type Talla = "S" | "M" | "L" | "XL" | "XXL";

type ProductCategory = "Moda" | "Estilo de vida" | "Estilo de Vida" | "Hogar" | "." | "Oficina" | "Decoración";

type Discount = "YYbcQX" | "yuFkkj" | "kJkL6O" | "6QM0pN" | "2F1qDy" | "al4rOb" | "uPt_so" | "a6i9OK" | "Termos y vasos %9.1" | "Minis $2" | "Pandoras $2" | "_VC4cU";

interface MockUp {
    mockupImg: string;
    topLeft: BottomLeft;
    topRight: BottomLeft;
    bottomLeft: BottomLeft;
    bottomRight: BottomLeft;
    width: string;
    height: string;
    perspective: string;
    rotateX: string;
    rotateY: string;
    skewX: string;
    skewY: string;
    translateX: string;
    translateY: string;
    rotate?: string;
    warpPercentage?: string;
    warpOrientation?: WarpOrientation;
}

type BottomLeft = "0 0" | "36 108";

type WarpOrientation = "vertical";

interface PriceRange {
    from: string;
    to?: null | string;
}

 export interface SelectionClass {
    _id?: string;
    thumbUrl?: string;
    active?: boolean;
    name: string;
    description?: string;
    category?: ToEnum;
    considerations?: string;
    publicPrice?: SelectionPrixerPrice;
    prixerPrice?: SelectionPrixerPrice;
    attributes: SelectionAttribute[];
    variantImage?: VariantImageElement[];
}

interface SelectionAttribute {
    name: AttributeName;
    value: string;
}

type ToEnum = "" | "undefined";

interface SelectionPrixerPrice {
    from?: string;
    to?: ToEnum;
    equation: string;
}

interface VariantImageElement {
    type: Type;
    url: null | string;
}

type Type = "images" | "video";

interface Sources {
    images: VariantImageElement[];
    video?: null | string;
}

export type Status = "Anulado" | "Concretado" | "En producción" | "Por entregar" | "Entregado" | "En impresión" | "Por producir";

interface Variant {
    _id: string;
    thumbUrl?: string;
    active: boolean;
    name: string;
    description: string;
    category: ToEnum;
    considerations: string;
    publicPrice: VariantPrixerPrice;
    prixerPrice: VariantPrixerPrice;
    attributes: SelectionAttribute[];
    variantImage?: VariantImageElement[];
    cost?: number | string;
    inter?: boolean;
}

interface VariantPrixerPrice {
    from?: null | string;
    to?: ToEnum | null;
    equation: number | null | string;
}

interface ShippingData {
    shippingMethod?: ShippingMethodClass | string;
    name?: string;
    lastname?: string;
    address?: string;
    shippingDate?: string;
    phone?: string;
    shippingName?: string;
    shippingLastName?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    country?: string;
    city?: string;
    zip?: string;
}

interface ShippingMethodClass {
    _id: ShippingMethodID;
    active: boolean;
    name: ShippingMethodName;
    createdOn: Date;
    createdBy: ShippingMethodCreatedBy;
    price: string;
    __v: number;
    inter?: boolean;
}

type ShippingMethodID = "63fb568aa7215800111803d2" | "63fb56bfa7215800111803d5" | "63fb56f1a7215800111803db" | "63fb571aa7215800111803e4" | "63fb56d2a7215800111803d8" | "6532709802f4470011b92e89" | "673e142ee01eb60012d3f5b2";

interface ShippingMethodCreatedBy {
    username: FluffyUsername;
    phone: string;
    email: Email;
    id: CreatedByID;
    time: Date;
    iat: number;
    exp: number;
    area?: Area;
    firstname?: Firstname;
    lastname?: Lastname;
    permissions?: { [key: string]: boolean };
}

type Area = "Master";

type CreatedByID = "61771e487404fa0011b103f9" | "64924f59363f670011ed378d";

type Lastname = "Henriquez" | "Guerrero";

type FluffyUsername = "dhenriquez" | "eguerrero";

type ShippingMethodName = "Lo busco en Prix" | "Delivery Caracas (moto)" | "MRW (cobro destino)" | "Zoom (cobro destino)" | "Delivery Caracas (vehículo)" | "Promo Delivery (Caracas)" | "Envío Internacional";
