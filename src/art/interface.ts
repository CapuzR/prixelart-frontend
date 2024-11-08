
interface Crop {
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

export interface Art {
    crops: Crop[];
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
    originalPhotoWidth: string;
    originalPhotoHeight: string;
    originalPhotoIso: string;
    originalPhotoPpi: string;
    artLocation: string;
    __v: number;
    disabledReason: string;
    bestSeller: boolean;
    comission: number;
    exclusive: string;
    owner: string;
    createdOn: string;
  }

   export interface Filters {
    text?: string;
    category?: string;
    username?: string;
    initialPoint: number;
    itemsPerPage: number;
  }

  export interface WarpImageProps {
    warpPercentage: any;
    warpOrientation: any;
    invertedWrap: any;
    randomArt: any;
    topLeft: any;
    width: any;
    height: any;
    perspective: any;
    rotate: any;
    rotateX: any;
    rotateY: any;
    skewX: any;
    skewY: any;
    translateX: any;
    translateY: any;
    setOpen: (value: boolean) => void;
    setMessage: (message: string) => void;
  }