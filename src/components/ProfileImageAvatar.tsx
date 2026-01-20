import React, { useState, useRef, ChangeEvent } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  CircularProgress,
  IconButton,
  Typography,
  Tooltip
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { useTusUpload } from "@/hooks/useTusUpload"; 
import { centerAspectCrop, canvasPreview } from "@utils/imageUtils";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUploadSuccess: (url: string) => void; 
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUploadSuccess,
}) => {
  const { uploadFile, isUploading, uploadProgress, uploadedUrl, error } = useTusUpload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [modalOpen, setModalOpen] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Carga inicial de imagen en cropper
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  // Confirmar recorte y subir
  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current || !selectedFile) {
      return;
    }

    // 1. Generar preview en canvas
    await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);

    // 2. Convertir canvas a Blob (WebP)
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;

        const webpFileName = `profile_${Date.now()}.webp`;
        const croppedFile = new File([blob], webpFileName, { type: "image/webp" });

        // 3. Subir usando el Hook de TUS
        // Enviamos 'userProfileImage' como contexto para el backend
        uploadFile(croppedFile, "userProfileImage");
        setModalOpen(false);
      },
      "image/webp",
      0.85
    );
  };

  // Efecto para comunicar éxito al padre
  React.useEffect(() => {
    if (uploadedUrl) {
      onImageUploadSuccess(uploadedUrl);
    }
  }, [uploadedUrl, onImageUploadSuccess]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      
      {/* Visualización del Avatar */}
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={uploadedUrl || currentImageUrl}
          sx={{ width: 120, height: 120, border: "2px solid #e0e0e0" }}
        />
        
        {/* Overlay de carga */}
        {isUploading && (
          <Box
            sx={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.7)", borderRadius: "50%"
            }}
          >
            <CircularProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Botón flotante para editar */}
        <Tooltip title="Cambiar foto de perfil">
          <IconButton
            color="primary"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.default" },
            }}
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <PhotoCameraIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Typography color="error" variant="caption">{error}</Typography>}

      {/* Input Oculto */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Modal de Recorte */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recortar Foto de Perfil</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Cuadrado obligatorio para perfil
              circularCrop // Máscara visual redonda
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          )}
          <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleCropAndUpload} variant="contained">
            Guardar Foto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileImageUpload;