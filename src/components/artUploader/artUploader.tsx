import React, { useEffect, useState, forwardRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid2 from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete'; // Corrected import from @mui/material
import InfoIcon from '@mui/icons-material/Info';
import InputAdornment from '@mui/material/InputAdornment';
import { TransitionProps } from '@mui/material/transitions';

// Assuming utils.js is converted to utils.ts or has appropriate typings
// If utils.maxPrintCalc is JavaScript, you might need to define its signature
// For now, we'll assume it's:
// const utils = {
//   maxPrintCalc: (width: number, height: number, ppi: number, iso: string): [string, string] => {
//     // mock implementation
//     const wCm = ((width / ppi) * 2.54).toFixed(1);
//     const hCm = ((height / ppi) * 2.54).toFixed(1);
//     return [wCm, hCm];
//   },
// };
// If you have a utils.ts file, import it properly:
// import utils from '../../utils/utils';
declare var utils: { // Temporary declaration until utils.ts is available
  maxPrintCalc: (width: number, height: number, ppi: number, iso: string) => [string, string];
};


// Assuming AspectRatioSelector and Cropper are typed correctly or you'd add types/interfaces
// For Cropper:
// import Cropper, { Area, Point } from 'react-easy-crop';
// For AspectRatioSelector:
// interface AspectRatioSelectorProps {
//   art: string; // URL.createObjectURL result
//   croppedArt: AspectRatioItem[];
//   setCroppedArt: React.Dispatch<React.SetStateAction<AspectRatioItem[]>>;
// }
// const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = (props) => { /* ... */ return <div />;};
// Remove if not used or replace with actual components:
const AspectRatioSelector: React.FC<any> = (props) => <Typography>AspectRatioSelector Placeholder (Original Image: {props.art ? 'Loaded' : 'Not Loaded'})</Typography>;
// const Cropper = ({ image, crop, zoom, aspect, onCropChange, onZoomChange, onCropComplete }) => <div />;


// --- Type Definitions ---
interface ArtUploaderProps {
  openArtFormDialog: boolean;
  setOpenArtFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AspectRatioItem {
  id: number;
  name: string;
  aspect: number;
  thumb: string;
  crop: { x: number; y: number }; // or Point from react-easy-crop
  zoom: number;
  cropped: boolean;
  // croppedAreaPixels?: Area; // Optional, if you use it from onCropComplete
}

interface UploadedArtMeta {
  width: number;
  height: number;
  size: number;
}

// --- Constants ---
const photoIsos: string[] = ['100', '200', '400', '800', '1600', '3200']; // Added more common ISOs
const artTypes: string[] = ['Diseño', 'Foto', 'Pintura', 'Arte plástica', 'Ilustración Digital']; // Added one
const categories: string[] = [
  'Abstracto', 'Animales', 'Arquitectura', 'Atardecer', 'Bodegón', 'Cacao', 'Café',
  'Carros', 'Ciudades', 'Comida', 'Conceptual', 'Edificios', 'Escultura', 'Fauna',
  'Figura Humana', 'Flora', 'Fotoperiodismo', 'Lanchas, barcos o yates', 'Macro',
  'Minimalista', 'Montañas', 'Naturaleza', 'Navidad', 'Paisaje Urbano', 'Paisaje',
  'Personajes célebres', 'Personajes religiosos', 'Pintura Digital', 'Playas', 'Puentes',
  'Retrato', 'Surrealista', 'Transportes', 'Vehículos', 'Viajes',
]; // Expanded and sorted categories

const initialAspectRatios: AspectRatioItem[] = [
  { id: 1, name: 'Original', aspect: 0, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false }, // Added Original
  { id: 2, name: '1:1 Cuadrado', aspect: 1 / 1, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 3, name: '16:9 Horizontal', aspect: 16 / 9, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 4, name: '9:16 Vertical', aspect: 9 / 16, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 5, name: '4:3 Horizontal', aspect: 4 / 3, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 6, name: '3:4 Vertical', aspect: 3 / 4, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 7, name: '3:2 Horizontal', aspect: 3 / 2, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  { id: 8, name: '2:3 Vertical', aspect: 2 / 3, thumb: '', crop: { x: 0, y: 0 }, zoom: 1, cropped: false },
  // Removed some of the less common ones for brevity, can be added back if needed
];


const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any>; },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// --- Component ---
export default function ArtUploader(props: ArtUploaderProps) {
  const [title, setTitle] = useState<string>('');
  const [artUrl, setArtUrl] = useState<File | null>(null); // To store the actual file
  const [artPreviewUrl, setArtPreviewUrl] = useState<string | null>(null); // For <img src> or Cropper
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['arte']); // Default tags
  const preTags = ['arte', 'fotografia', 'pintura', 'diseño', 'abstracto']; // Suggestion list for autocomplete
  // const [publicId, setPublicId] = useState<string>(''); // Assuming this is set by backend or another process
  const [originalPhotoHeight, setOriginalPhotoHeight] = useState<string>(''); // Keep as string for input field, parse for calcs
  const [originalPhotoWidth, setOriginalPhotoWidth] = useState<string>('');
  const [originalPhotoIso, setOriginalPhotoIso] = useState<string>('');
  const [originalPhotoPpi, setOriginalPhotoPpi] = useState<string>('');
  const [maxPrintHeightCm, setMaxPrintHeightCm] = useState<string>('');
  const [maxPrintWidthCm, setMaxPrintWidthCm] = useState<string>('');
  const [artType, setArtType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [exclusive, setExclusive] = useState<string>('standard');
  const [comission, setComission] = useState<number>(10);
  const [requiredPhotoMeta, setRequiredPhotoMeta] = useState<boolean>(false);
  // const [uploaded, setUploaded] = useState<string | null>(null); // Replaced by artPreviewUrl
  const [mimeType, setMimeType] = useState<string>('');
  const [backdrop, setBackdrop] = useState<boolean>(false);
  const [croppedArt, setCroppedArt] = useState<AspectRatioItem[]>(initialAspectRatios);
  const [uploadedArtMeta, setUploadedArtMeta] = useState<UploadedArtMeta>({
    width: 0,
    height: 0,
    size: 0,
  });
  const [allowExclusive, setAllowExclusive] = useState<boolean>(false);
  // const [disabledReason, setDisabledReason] = useState<string>(''); // Assuming not actively used, can be re-added
  // const [visible, setVisible] = useState<boolean>(true); // Assuming not actively used

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [snackBarAction, setSnackBarAction] = useState<React.ReactNode | undefined>();
  const [snackBarError, setSnackBarError] = useState<boolean>(false);

  useEffect(() => {
    if (artType === 'Foto') {
      handleMaxPrintCalc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPhotoWidth, originalPhotoHeight, originalPhotoPpi, originalPhotoIso, artType]); // Added artType

  const showSnackbar = (message: string, action?: React.ReactNode) => {
    setErrorMessage(message);
    setSnackBarAction(action);
    setSnackBarError(true);
  };

  const handleArtTypeChange = (e: SelectChangeEvent<string>) => {
    const newArtType = e.target.value;
    if (!newArtType) {
      setRequiredPhotoMeta(false);
      showSnackbar('Por favor indica a qué categoría pertenece el arte.');
    } else {
      setRequiredPhotoMeta(newArtType === 'Foto');
      setArtType(newArtType);
    }
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value);
  };

  const handleExclusive = (e: SelectChangeEvent<string>) => {
    setExclusive(e.target.value);
    if (e.target.value === 'standard') {
      setComission(10);
    }
  };

  const handleCloseDialog = () => {
    props.setOpenArtFormDialog(false);
    // Consider resetting form state here if desired when dialog closes without submission
  };

  const learnMoreExifButton = (
    <Button
      target="_blank"
      style={{ color: '#fff' }} // sx prop can also be used here
      href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/"
    >
      Aprende cómo
    </Button>
  );

  const handleMaxPrintCalc = () => {
    const widthNum = parseInt(originalPhotoWidth, 10);
    const heightNum = parseInt(originalPhotoHeight, 10);
    const ppiNum = parseInt(originalPhotoPpi, 10);

    if (widthNum > 0 && heightNum > 0 && ppiNum > 0 && originalPhotoIso) {
      const [widthCm, heightCm] = utils.maxPrintCalc(
        widthNum,
        heightNum,
        ppiNum,
        originalPhotoIso
      );
      setMaxPrintWidthCm(widthCm);
      setMaxPrintHeightCm(heightCm);
    } else if (artType === 'Foto') { // Only show these specific errors if artType is 'Foto'
      if (!originalPhotoIso && widthNum > 0 && heightNum > 0 && ppiNum > 0) {
        showSnackbar('Por favor indica el ISO de la foto.', learnMoreExifButton);
      } else if (originalPhotoIso && (!widthNum || !heightNum) && ppiNum > 0) {
        showSnackbar('Por favor indica el Ancho y Alto de la foto en píxeles.', learnMoreExifButton);
      } else if (originalPhotoIso && widthNum > 0 && heightNum > 0 && !ppiNum) {
        showSnackbar('Por favor indica los PPI (píxeles por pulgada) de la foto.', learnMoreExifButton);
      } else {
        // Generic message if some fields are missing for photo type
        // showSnackbar('Para calcular la impresión, completa los campos de dimensiones, PPI e ISO.', learnMoreExifButton);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || tags.length === 0 || !artType || !artUrl) {
      showSnackbar('Por favor completa todos los campos obligatorios y carga tu arte.');
      return;
    }

    if (artType === 'Foto' && (!originalPhotoWidth || !originalPhotoHeight || !originalPhotoPpi || !originalPhotoIso)) {
      showSnackbar('Para el tipo "Foto", por favor indica ancho, alto, PPI e ISO de la foto original.');
      return;
    }

    setBackdrop(true);
    try {
      await newArtPost();
    } catch (err) {
      console.error(err);
      setBackdrop(false);
      // props.setOpenArtFormDialog(false); // Keep dialog open on error for user to retry or see message
      showSnackbar(
        'Ocurrió un error inesperado. Por favor, verifica tu conexión e intenta de nuevo. Asegúrate de haber iniciado sesión.'
      );
    }
  };

  const getMimeTypeAndProcessFile = (file: File, callback: (type: string, file: File) => void) => {
    const fileReader = new FileReader();
    let determinedMimeType = 'unknown';

    fileReader.onloadend = function (e) {
      if (e.target && e.target.result instanceof ArrayBuffer) {
        const arr = new Uint8Array(e.target.result).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          case '89504e47': determinedMimeType = 'image/png'; break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8': determinedMimeType = 'image/jpeg'; break;
          default: determinedMimeType = 'unknown'; break;
        }
      }
      callback(determinedMimeType, file);
    };
    fileReader.readAsArrayBuffer(file);
  };


  const handleArtChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const currentFile = files[0];

      getMimeTypeAndProcessFile(currentFile, (determinedMimeType, file) => {
        setMimeType(determinedMimeType);

        if (determinedMimeType === 'unknown') {
          event.target.value = ''; // Reset file input
          showSnackbar('Disculpa, pero el formato de tu arte no está permitido (solo JPG, PNG).');
          console.log('Error: file format not allowed');
          setArtUrl(null);
          setArtPreviewUrl(null);
          return;
        }

        if (file.size >= 15 * 1024 * 1024) { // Increased to 15MB
          event.target.value = '';
          showSnackbar('El arte es muy grande. El máximo permitido es de 15 MB.');
          setArtUrl(null);
          setArtPreviewUrl(null);
          return;
        }

        setArtUrl(file); // Store the file object
        const objectUrl = URL.createObjectURL(file);

        const img = new Image();
        img.onload = function () {
          const artMetaUpdate: UploadedArtMeta = {
            width: img.width,
            height: img.height,
            size: file.size,
          };

          // Min dimensions check (e.g., 1080px for both, or more granular)
          if (img.width < 1080 || img.height < 1080) {
            event.target.value = '';
            showSnackbar(
              `Tu arte (${img.width}x${img.height}px) es menor a la resolución mínima requerida (1080x1080px). Por favor, sube un arte con mayor resolución.`
            );
            setArtUrl(null);
            setArtPreviewUrl(null);
            URL.revokeObjectURL(objectUrl); // Clean up
            return;
          }

          setUploadedArtMeta(artMetaUpdate);
          setArtPreviewUrl(objectUrl); // For display in Cropper or <img>

          // If art type is 'Foto', prefill dimensions if possible (though EXIF is better)
          if (artType === 'Foto' && !originalPhotoWidth && !originalPhotoHeight) {
            setOriginalPhotoWidth(img.width.toString());
            setOriginalPhotoHeight(img.height.toString());
            // PPI and ISO usually require EXIF data, which is more complex to read client-side.
            // Users will likely still need to input PPI/ISO manually.
          }
        };
        img.onerror = function () {
          event.target.value = '';
          showSnackbar('No se pudo cargar la imagen. Intenta con otro archivo.');
          setArtUrl(null);
          setArtPreviewUrl(null);
          URL.revokeObjectURL(objectUrl); // Clean up
        }
        img.src = objectUrl;
      });
    }
  };

  // Clean up object URL when component unmounts or artPreviewUrl changes
  useEffect(() => {
    return () => {
      if (artPreviewUrl) {
        URL.revokeObjectURL(artPreviewUrl);
      }
    };
  }, [artPreviewUrl]);


  const verifyStandardArts = async () => {
    // Mocking token and backend URL for demonstration
    const tokenItem = localStorage.getItem('token');
    if (!tokenItem) {
      setAllowExclusive(true); // Or handle not logged in state
      return;
    }
    const token = JSON.parse(tokenItem);
    if (token.role === 'Prixer') {
      // const base_url = import.meta.env.VITE_BACKEND_URL + '/art/read-by-prixer';
      // const body = { username: token.username };
      // try {
      //   const response = await axios.post<{ arts: any[] }>(base_url, body);
      //   if (response.data.arts.length > 5) { // Example condition
      //     setAllowExclusive(true);
      //   } else {
      //     setAllowExclusive(false);
      //      setExclusive('standard'); // Force standard if not allowed
      //      setComission(10);
      //   }
      // } catch (error) {
      //   console.error("Failed to verify standard arts", error);
      //   setAllowExclusive(false); // Default to not allowed on error
      // }
      setAllowExclusive(true); // Mock: assume allowed for now
    } else {
      setAllowExclusive(true); // Non-prixers might always be allowed or have different rules
    }
  };

  useEffect(() => {
    verifyStandardArts();
  }, []);

  async function newArtPost() {
    if (!artUrl) {
      showSnackbar('No hay archivo de arte para subir.');
      setBackdrop(false);
      return;
    }
    const tokenItem = localStorage.getItem('token');
    if (!tokenItem) {
      showSnackbar('Error de autenticación. Por favor, inicia sesión.');
      setBackdrop(false);
      return;
    }
    const token = JSON.parse(tokenItem);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', JSON.stringify(tags)); // Send as JSON string array
    formData.append('uploadedArtMeta', JSON.stringify(uploadedArtMeta));
    formData.append('crops', JSON.stringify(croppedArt)); // Assuming croppedArt is populated by AspectRatioSelector/Cropper
    formData.append('userId', token.id);
    formData.append('prixerUsername', token.username);
    formData.append('status', 'Active');
    // formData.append('publicId', publicId); // If publicId is used
    formData.append('artType', artType);
    if (artType === 'Foto') {
      formData.append('originalPhotoWidth', originalPhotoWidth);
      formData.append('originalPhotoHeight', originalPhotoHeight);
      formData.append('originalPhotoIso', originalPhotoIso);
      formData.append('originalPhotoPpi', originalPhotoPpi);
    }
    formData.append('artLocation', location);
    // formData.append('disabledReason', disabledReason); // If used
    // formData.append('visible', String(visible)); // If used
    formData.append('exclusive', exclusive);
    formData.append('comission', String(comission));
    formData.append('imageUrl', artUrl); // The actual file

    // const base_url = import.meta.env.VITE_BACKEND_URL + '/art/create';
    // try {
    //   const response = await axios.post<{ success: boolean; message?: string }>(base_url, formData, {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //   });
    //   if (response.data.success) {
    //     props.setOpenArtFormDialog(false);
    //     setBackdrop(false);
    //     // Consider a success message for the main page instead of reload
    //     // props.onUploadSuccess?.(); // Callback to parent
    //     window.location.reload(); // Or navigate, or show success in parent
    //   } else {
    //     setBackdrop(false);
    //     showSnackbar(
    //       response.data.message || 'Error al guardar el arte. Intenta de nuevo.'
    //     );
    //   }
    // } catch (apiError) {
    //   console.error("API Error:", apiError);
    //   setBackdrop(false);
    //   showSnackbar('Error de conexión con el servidor. Por favor, inténtalo más tarde.');
    // }

    // Mock successful upload
    console.log("Form Data prepared for submission:", Object.fromEntries(formData));
    setTimeout(() => {
      setBackdrop(false);
      props.setOpenArtFormDialog(false);
      alert('Arte subido (simulado)! La página se recargará.');
      window.location.reload();
    }, 2000);
  }

  return (
    <> {/* Using Fragment as Dialog is a top-level element here */}
      <Dialog
        fullScreen // Consider fullWidth and maxWidth="md" or "lg" for non-mobile for better UX
        open={props.openArtFormDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
      >
        <Backdrop sx={{ color: 'primary.contrastText', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdrop}>
          <CircularProgress color="inherit" sx={{ mr: 2 }} />
          <Typography>
            Procesando tu arte... <br /> Esto puede tardar unos minutos, por favor no cierres esta ventana.
          </Typography>
        </Backdrop>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleCloseDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Comparte tu Arte
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmit} disabled={backdrop || !artUrl}>
              Guardar Arte
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="md" sx={{ py: 3 }}> {/* Changed maxWidth for better form layout */}
          <CssBaseline />
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}> {/* Added Paper for better visual grouping */}
            <form noValidate> {/* Removed className, onSubmit is handled by button click */}
              <Grid2 container spacing={3}> {/* Increased spacing */}
                <Grid2 size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <input
                      type="file"
                      id="inputfile"
                      accept="image/jpeg, image/png, image/webp" // Added webp
                      onChange={handleArtChange}
                      style={{ display: 'none' }}
                      aria-labelledby="upload-button-label"
                    />
                    {!artPreviewUrl ? (
                      <label htmlFor="inputfile">
                        <Tooltip
                          title={
                            'Sube tu arte (JPG, PNG, WEBP). Mínimo 1080x1080px, Máximo 15MB.'
                          }
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            id="upload-button-label"
                            fullWidth
                            sx={{ py: 1.5 }}
                          >
                            Cargar archivo de Arte
                          </Button>
                        </Tooltip>
                      </label>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Previsualización y Recortes:</Typography>
                        {/* Replace with actual Cropper/AspectRatioSelector integration */}
                        {/* This is where react-easy-crop would go */}
                        <AspectRatioSelector
                          art={artPreviewUrl}
                          croppedArt={croppedArt}
                          setCroppedArt={setCroppedArt}
                        />
                        {/* Example of showing the preview if no cropper is active */}
                        {/* <img src={artPreviewUrl} alt="Previsualización del arte" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px' }} /> */}
                        <Button onClick={() => { setArtPreviewUrl(null); setArtUrl(null); const input = document.getElementById('inputfile') as HTMLInputElement; if (input) input.value = ''; }} sx={{ mt: 1 }} size="small">
                          Cambiar archivo
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="title"
                    label="Título del Arte"
                    name="title"
                    autoComplete="off"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    helperText={title.length < 5 && title.length > 0 ? "Muy corto" : ""}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <FormControl variant="outlined" fullWidth required>
                    <InputLabel id="artTypeLabel">Tipo de Arte</InputLabel>
                    <Select
                      labelId="artTypeLabel"
                      id="artType"
                      value={artType}
                      onChange={handleArtTypeChange}
                      label="Tipo de Arte"
                    >
                      <MenuItem value=""><em>Selecciona un tipo</em></MenuItem>
                      {artTypes.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <FormControl variant="outlined" fullWidth required>
                    <InputLabel id="categoryLabel">Categoría Principal</InputLabel>
                    <Select
                      labelId="categoryLabel"
                      id="category"
                      value={category}
                      onChange={handleCategoryChange}
                      label="Categoría Principal"
                    >
                      <MenuItem value=""><em>Selecciona una categoría</em></MenuItem>
                      {categories.sort().map((n) => ( // Sorted categories
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                {artType === 'Foto' && (
                  <React.Fragment>
                    <Grid2 size={{ xs: 12 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>Detalles de la Fotografía Original</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        required={requiredPhotoMeta}
                        id="originalPhotoWidth"
                        label="Ancho (px)"
                        type="number"
                        name="originalPhotoWidth"
                        value={originalPhotoWidth}
                        onChange={(e) => {
                          setOriginalPhotoWidth(e.target.value);
                          if (parseInt(e.target.value, 10) < 2000 && parseInt(e.target.value, 10) > 0) {
                            showSnackbar('Ancho recomendado: mayor a 2000px.');
                          }
                        }}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        required={requiredPhotoMeta}
                        type="number"
                        id="originalPhotoHeight"
                        label="Alto (px)"
                        name="originalPhotoHeight"
                        value={originalPhotoHeight}
                        onChange={(e) => {
                          setOriginalPhotoHeight(e.target.value);
                          if (parseInt(e.target.value, 10) < 2000 && parseInt(e.target.value, 10) > 0) {
                            showSnackbar('Alto recomendado: mayor a 2000px.');
                          }
                        }}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        required={requiredPhotoMeta}
                        type="number"
                        id="originalPhotoPpi"
                        label="PPI"
                        name="originalPhotoPpi"
                        value={originalPhotoPpi}
                        onChange={(e) => {
                          setOriginalPhotoPpi(e.target.value);
                          if (parseInt(e.target.value, 10) < 100 && parseInt(e.target.value, 10) > 0) {
                            showSnackbar('PPI recomendado: mayor a 100.');
                          }
                        }}
                        InputProps={{ inputProps: { min: 0 } }}
                        helperText="Píxeles por pulgada"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormControl variant="outlined" fullWidth required={requiredPhotoMeta}>
                        <InputLabel id="originalPhotoIsoLabel">ISO</InputLabel>
                        <Select
                          labelId="originalPhotoIsoLabel"
                          id="originalPhotoIso"
                          value={originalPhotoIso}
                          onChange={(e) => setOriginalPhotoIso(e.target.value)}
                          label="ISO"
                        >
                          <MenuItem value=""><em>Selecciona ISO</em></MenuItem>
                          {photoIsos.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid2>

                    {maxPrintWidthCm && maxPrintHeightCm && (
                      <Grid2 size={{ xs: 12 }} sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="body1">
                          Medida máxima estimada para impresión de alta calidad:
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {maxPrintWidthCm} x {maxPrintHeightCm} cm
                        </Typography>
                      </Grid2>
                    )}
                  </React.Fragment>
                )}

                <Grid2 size={{ xs: 12 }}>
                  <Autocomplete
                    multiple
                    id="tags-filled"
                    options={preTags} // Suggestion list
                    defaultValue={['arte']} // Default pre-filled tags
                    freeSolo // Allows custom tags
                    value={tags}
                    onChange={(event, newValue) => {
                      setTags(newValue);
                    }}
                    renderTags={(value: readonly string[], getTagProps) =>
                      value.map((option: string, index: number) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Etiquetas (Tags)"
                        placeholder="Añade etiquetas relevantes"
                        helperText="Ayuda a otros a encontrar tu arte. Presiona Enter para añadir una nueva etiqueta."
                      />
                    )}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    autoComplete="off"
                    required
                    name="description"
                    variant="outlined"
                    fullWidth
                    id="description"
                    label="Descripción Detallada"
                    multiline
                    minRows={4}
                    maxRows={10}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    helperText={`${description.length}/1000 caracteres (mín. 20)`}
                    inputProps={{ maxLength: 1000 }}
                  />
                </Grid2>

                {allowExclusive && (
                  <Grid2 size={{ xs: 12 }} container spacing={2} sx={{ mt: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="exclusivityTypeLabel">Exclusividad</InputLabel>
                        <Select
                          labelId="exclusivityTypeLabel"
                          value={exclusive}
                          onChange={handleExclusive}
                          label="Exclusividad"
                        >
                          <MenuItem value="standard">Estándar</MenuItem>
                          <MenuItem value={'exclusive'}>Exclusivo en Plataforma</MenuItem>
                          <MenuItem value={'private'}>Privado (No visible públicamente)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        label="Comisión por Venta"
                        disabled={exclusive === 'standard'}
                        value={comission}
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 10, max: 70 }, // Realistic commission range
                        }}
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10);
                          if (isNaN(val)) val = 10;
                          if (val < 10) val = 10;
                          if (val > 70) val = 70;
                          setComission(val);
                        }}
                        helperText={exclusive === 'standard' ? "Comisión fija para estándar" : "Entre 10% y 70%"}
                      />
                    </Grid2>
                  </Grid2>
                )}

                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="location"
                    label="Ubicación (Opcional)"
                    name="location"
                    autoComplete="off"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    helperText="Ciudad, País donde se creó el arte o su inspiración."
                  />
                </Grid2>

                <Grid2
                  size={{ xs: 12 }}
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, color: 'text.secondary' }}
                >
                  <InfoIcon color="inherit" sx={{ mr: 1 }} />
                  <Typography variant="body2" >
                    Asegúrate que los datos sean correctos. Así te encontrarán.
                  </Typography>
                </Grid2>
              </Grid2>
            </form>
          </Paper>
          <Box mt={5} mb={2}> {/* Added mb for spacing */}
            {/* <Copyright /> */} {/* Assuming Copyright is a valid component */}
            <Typography variant="body2" color="text.secondary" align="center">
              {'Copyright © '}
              <MuiLink color="inherit" href="https://yourwebsite.com/">
                Your Platform Name
              </MuiLink>{' '}
              {new Date().getFullYear()}
              {'.'}
            </Typography>
          </Box>
        </Container>
        <Snackbar
          open={snackBarError}
          autoHideDuration={6000} // Increased duration
          onClose={() => {
            setSnackBarError(false);
            setSnackBarAction(undefined); // Clear action
          }}
          message={errorMessage}
          action={
            <>
              {snackBarAction}
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setSnackBarError(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Better positioning
          sx={{ bottom: { xs: 90, sm: 24 } }} // Adjust based on mobile nav if any
        />
      </Dialog>
    </>
  );
}

// Example Link component if you use it for Copyright
import MuiLink from '@mui/material/Link';

// Placeholder for Copyright component if you have one
// const Copyright = () => (
//  <Typography variant="body2" color="text.secondary" align="center">
//      {'Copyright © '}
//      <MuiLink color="inherit" href="https://mui.com/">
//          Your Website
//      </MuiLink>{' '}
//      {new Date().getFullYear()}
//      {'.'}
//  </Typography>
// );