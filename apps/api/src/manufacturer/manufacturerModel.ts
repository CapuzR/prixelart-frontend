import { ObjectId } from "mongodb";

export interface Manufacturer{
    _id?: ObjectId;
    entityName: string;
    officialDoc: string;
    foundationDate: string;
    //los emails probablemente deben englobarse en un arreglo
    deliveryEmail: string;
    salesEmail: string;
    workshopEmail: string;
    mainPhone: string;
    country: string;
    city: string;
    description?: string;
    //los siguientes probablemente deben englobarse en un arreglo de statements
    mision: string;
    vision: string;
    values: string;
    why: string;
    //los siguientes deben agruparse en un arreglo de brand.
    logo?: string; //debe haber logo vertical, logo horizontal, etc.
    brandPrimaryColor: string;
    brandSecondaryColor: string;
    //Se debe agregar un arreglo con la dirección de retiro y la dirección de admin.
    //Se debe agregar un arreglo con los datos de pago.
}