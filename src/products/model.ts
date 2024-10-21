export interface Product {
    _id: string;
    name: string;
    description: string;
    category: string;
    considerations: string;
    productionTime?: string;
    thumbUrl?: string;
    mockupImg?: string;
    coordinates?: string;
    sources: {
      images: any[]; // You may want to replace `any` with a more specific type if you know the structure of images
      video?: string;
    };
    publicPrice?: {
      from?: string;
      to?: string;
    };
    prixerPrice?: {
      from?: string;
      to?: string;
    };
    cost?: string;
    attributes?: any[]; // Replace `any` with a more specific type if attributes have a defined structure
    active: boolean;
    variants?: []; // Replace `any` with a more specific type if variants have a defined structure
    hasSpecialVar: boolean;
    autoCertified?: boolean;
    discount?: string;
    bestSeller?: boolean;
    mockUp?: Record<string, any>; // Adjust to the mockUp object structure
  }

  export type ProductBase = Pick<Product, 
  'name' | 
  'description' | 
  'attributes' | 
  'variants' | 
  'publicPrice' | 
  'considerations'
>;
