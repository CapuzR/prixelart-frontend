
export interface PickedArt
  extends Pick<
    Art,
    'artId' | 'title' | 'squareThumbUrl' | 'largeThumbUrl' | 'prixerUsername' | 'exclusive'
  > {}

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
