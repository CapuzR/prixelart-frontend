import { Crop } from '../../types/art.types';
import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

export interface Point {
  x: number;
  y: number;
}

interface CroppedArt {
  aspect: number;
  crop: Point;
  zoom: number;
}

interface EasyCropperProps {
  art: string;
  ar?: any; // optional prop (not used in this component)
  croppedArt: CroppedArt[];
  setCroppedArt: React.Dispatch<React.SetStateAction<CroppedArt[]>>;
  index: number;
  setCroppedAreaPixels: (croppedAreaPixels: Area) => void;
}

const EasyCropper: React.FC<EasyCropperProps> = ({
  art,
  croppedArt,
  setCroppedArt,
  index,
  setCroppedAreaPixels,
}) => {
  const [aspect] = useState<number>(croppedArt[index].aspect);
  const [crop, setCrop] = useState<Point>(croppedArt[index].crop);
  const [zoom, setZoom] = useState<number>(croppedArt[index].zoom);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      const croppedArtTemp = [...croppedArt];
      croppedArtTemp[index].crop = {
        ...croppedArtTemp[index].crop,
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
      };
      setCroppedAreaPixels(croppedAreaPixels);
      setCroppedArt(croppedArtTemp);
    },
    [croppedArt, index, setCroppedAreaPixels, setCroppedArt]
  );

  return (
    <Cropper
      image={art}
      crop={crop}
      zoom={zoom}
      aspect={aspect}
      onCropChange={setCrop}
      onCropComplete={onCropComplete}
      onZoomChange={setZoom}
    />
  );
};

export default EasyCropper;
