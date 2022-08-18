import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop'

const useStyles = makeStyles((theme) => ({}));


export default function EasyCropper(props) {
    const  { art, ar, croppedArt, setCroppedArt, index, setCroppedAreaPixels  } = props;
    const classes = useStyles();
    const [aspect, setAspect] = useState(croppedArt[index].aspect);
    const [crop, setCrop] = useState(croppedArt[index].crop);
    const [zoom, setZoom] = useState(croppedArt[index].zoom);
    const croppedArtTemp = croppedArt;
    
    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
        croppedArtTemp[index].crop.x = croppedAreaPixels.x;
        croppedArtTemp[index].crop.y = croppedAreaPixels.y;
        setCroppedAreaPixels(croppedAreaPixels);
        setCroppedArt(croppedArtTemp);     
    });

    return (
        // <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <Cropper
            image={art}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            />
        // </div>
  )
}