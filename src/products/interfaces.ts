
interface Attribute {
    name: string;
    value: string[];
  }
  
  interface Selection {
    name: string;
    value: string;
  }
  
  //Este parece ser el tipo que se utiliza en Product/Details, diferente al de Product/Catalog.
  export default interface Product {
    productId: string;
    name: string;
    price: number;
    description: string;
    attributes: Attribute[];
    selection: Selection[];
    variants: Array<any>;
    priceRange: any;
    observations: string;
  }

  //Este parece ser el tipo correcto de Product.
  interface Product1 {
    _id: string;
    name: string;
    description: string;
    sources: {
      images: {
        type: string;
        url: string;
      }[];
    };
    variants: Variant1[];
    attributes: {
      name: string;
      value: string[];
    }[];
    price: string;
    publicEquation: {
      from: string;
      to: string;
    };
    publicPrice: {
      from: string;
      to: string;
    };
  }

  //Esto debe estar en cart/interfaces.ts y llamarse CartState o Cart
  interface BuyState {
    art: Art1;
    product: Product1;
    quantity: number;
  }

  interface Crop1 {
    id: number;
    name: string;
    aspect: number;
    thumb: string;
    crop: {
      x: number;
      y: number;
    };
    zoom: number;
    cropped: boolean;
    croppedAreaPixels: {
      width: number;
      height: number;
      x: number;
      y: number;
    };
  }
  
  //Esto debe estar en art/interfaces.ts
  interface Art1 {
    crops: Crop1[];
    points: number;
    tags: string[];
    visible: boolean;
    _id: string;
    artId: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    largeThumbUrl: string;
    mediumThumbUrl: string;
    smallThumbUrl: string;
    squareThumbUrl: string;
    userId: string;
    prixerUsername: string;
    status: string;
    artType: string;
    originalPhotoWidth?: string;
    originalPhotoHeight?: string;
    originalPhotoIso?: string;
    originalPhotoPpi?: string;
    artLocation?: string;
    disabledReason?: string;
    bestSeller: boolean;
    comission: number;
    exclusive: string;
    owner: string;
    createdOn: string;
  }

  interface Variant1 {
    _id: string;
    name: string;
    attributes: {
      name: string;
      value: string;
    }[];
  }