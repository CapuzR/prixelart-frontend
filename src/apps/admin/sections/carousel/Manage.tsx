import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // If needed for navigation
import Grid2 from '@mui/material/Grid';
// DND Imports
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor,
    useSensors, DragEndEvent, DragOverlay, DropAnimation, defaultDropAnimation, DragStartEvent // Added DragStartEvent
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as tus from 'tus-js-client';
// MUI Components
import {
    Box, Typography, Paper, Button, IconButton, CircularProgress, Alert,
    Stack, List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Tooltip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// Hooks, Types, Context, API 
import { useSnackBar } from 'context/GlobalContext';
import { CarouselItem } from 'types/preference.types';
import {
    fetchCarouselImages, updateCarouselOrder, deleteCarouselItem,
    createCarouselItem
} from '@api/preferences.api';

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Title from '@apps/admin/components/Title';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';
import { BACKEND_URL } from '@api/utils.api';
import CropIcon from '@mui/icons-material/Crop';
// --- Sortable Item Component ---
interface SortableCarouselItemProps {
    item: Omit<CarouselItem, "_id"> & { _id: string; };
    handleOpenDeleteDialog: (item: Omit<CarouselItem, "_id"> & { _id: string; }) => void;
    isSavingOrder: boolean;
    isDeleting: boolean;
    itemToDeleteId: string | null;
}

// Separate UI Component for rendering the item appearance
const SortableCarouselItemUI: React.FC<{ item: Omit<CarouselItem, "_id"> & { _id: string; }; isOverlay?: boolean }> = ({ item, isOverlay }) => (
    <Paper
        elevation={isOverlay ? 4 : 1}
        sx={{
            display: 'flex', alignItems: 'center', p: 1, mb: 1, width: '100%', // Ensure width for overlay
            cursor: 'grab',
            backgroundColor: 'background.paper',
        }}
    >
        <DragIndicatorIcon sx={{ mr: 1, color: 'action.active', touchAction: 'none', cursor: 'grab' }} />
        <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar variant="rounded" src={item.imageURL} alt={`Pos ${item.position}`} sx={{ width: 80, height: 45, bgcolor: 'grey.200' }} />
        </ListItemAvatar>
        <ListItemText
            primary={`Posición: ${item.position}`}
            secondary={item.imageURL.substring(item.imageURL.lastIndexOf('/') + 1)}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
            secondaryTypographyProps={{ variant: 'caption', noWrap: true, title: item.imageURL, component: 'div' }} // Use div for better wrapping control 
        />
    </Paper>
);

async function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale = 1, // For future scaling if needed
    rotate = 0, // For future rotation if needed
) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    // devicePixelRatio slightly increases sharpness on retina devices
    // but can increase file size. Remove if not needed.
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = (rotate * Math.PI) / 180;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY);
    // 4) Move the origin to the center of the original image
    ctx.translate(centerX, centerY);
    // 3) Rotate around the center
    ctx.rotate(rotateRads);
    // 2) Scale the image
    ctx.scale(scale, scale);
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
    );

    ctx.restore();
}

const SortableCarouselItem: React.FC<SortableCarouselItemProps> = ({
    item, handleOpenDeleteDialog, isSavingOrder, isDeleting, itemToDeleteId
}) => {
    const {
        attributes, listeners, setNodeRef, transform, transition, isDragging
    } = useSortable({ id: item._id!.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            disablePadding
            secondaryAction={
                <Tooltip title="Eliminar Item">
                    <span>
                        <IconButton
                            edge="end" aria-label="delete" color="error"
                            onClick={() => handleOpenDeleteDialog(item)}
                            disabled={!item._id || isSavingOrder || (isDeleting && itemToDeleteId === item._id.toString())}
                            size="small"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            }
            // Apply listeners to the ListItem itself for a larger grab area
            {...attributes}
            {...listeners}
            sx={{
                touchAction: 'none',
                cursor: 'grab', // Indicate grabbable on the whole item
                mb: 0.5, // Add slight margin between items
                '&:hover .drag-handle': { // Show handle more prominently on hover (optional)
                    color: 'text.primary'
                },
                p: 0,
            }}
        >
            {/* Pass only item data to the UI component */}
            <SortableCarouselItemUI item={item} />
        </ListItem>
    );
};
// --- End Sortable Item Component ---

const ManageCarousels: React.FC = () => {
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [desktopItems, setDesktopItems] = useState<(Omit<CarouselItem, '_id'> & { _id: string })[]>([]);
    const [mobileItems, setMobileItems] = useState<(Omit<CarouselItem, '_id'> & { _id: string })[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorFetch, setErrorFetch] = useState<string | null>(null);
    const [isSavingOrder, setIsSavingOrder] = useState<false | 'desktop' | 'mobile'>(false);
    const [isCreating, setIsCreating] = useState<false | 'desktop' | 'mobile'>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<(Omit<CarouselItem, '_id'> & { _id: string; }) | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<(Omit<CarouselItem, '_id'> & { _id: string; }) | null>(null);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

    // --- File & Cropper State ---
    // Stores the original selected file's data URL for the cropper
    const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(null);
    // Stores the original file object (needed for name, type) before cropping
    const [originalFileBeforeCrop, setOriginalFileBeforeCrop] = useState<File | null>(null);
    // Stores the type ('desktop' | 'mobile') for the current cropping session
    const [croppingType, setCroppingType] = useState<'desktop' | 'mobile' | null>(null);

    // These will hold the File object *after* cropping, ready for upload
    const [newDesktopImageFile, setNewDesktopImageFile] = useState<File | null>(null);
    const [newMobileImageFile, setNewMobileImageFile] = useState<File | null>(null);

    // Display names for UI after a file is selected (even before crop confirmation)
    const [desktopFileDisplayName, setDesktopFileDisplayName] = useState<string | null>(null);
    const [mobileFileDisplayName, setMobileFileDisplayName] = useState<string | null>(null);


    const [uploadProgress, setUploadProgress] = useState<{
        [key in 'desktop' | 'mobile']?: { percentage: number; status: string }
    }>({});

    // Cropper specific state
    const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
    const [crop, setCrop] = useState<Crop>(); // Current crop selection (percentage based)
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>(); // Pixel values of crop
    const imgRef = useRef<HTMLImageElement | null>(null); // Ref for the image in cropper
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);


    // --- DND Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Fetch Data ---
    const loadItems = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        setErrorFetch(null);
        try {
            const fetchedItems = (await fetchCarouselImages() as CarouselItem[])
                .filter(item => item._id)
                .map(item => ({ ...item, _id: item._id!.toString() }));

            const desktop = fetchedItems.filter(item => item.type === 'desktop').sort((a, b) => a.position - b.position);
            const mobile = fetchedItems.filter(item => item.type === 'mobile').sort((a, b) => a.position - b.position);

            const fixPositions = (items: (Omit<CarouselItem, '_id'> & { _id: string })[]) => items.map((item, index) => ({ ...item, position: index + 1 }));
            const desktopCorrected = fixPositions(desktop);
            const mobileCorrected = fixPositions(mobile);

            setDesktopItems(desktopCorrected);
            setMobileItems(mobileCorrected);

        } catch (err: any) {
            const message = err.message || "Error al cargar los items del carrusel.";
            setErrorFetch(message); showSnackBar(message); console.error("Error fetching items:", err);
        } finally { if (showLoading) setIsLoading(false); }
    }, [showSnackBar]);

    useEffect(() => { loadItems(); }, [loadItems]);

    function centerAspectCrop(
        mediaWidth: number,
        mediaHeight: number,
        aspect: number,
    ) {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%', // Use percentage for initial crop
                    width: 90, // Default to 90% width
                },
                aspect,
                mediaWidth,
                mediaHeight,
            ),
            mediaWidth,
            mediaHeight,
        );
    }

    const onImageLoadInCropper = (e: React.SyntheticEvent<HTMLImageElement>) => {
        imgRef.current = e.currentTarget; // Assign currentTarget to imgRef.current
        const { width, height } = e.currentTarget;
        const aspect = croppingType === 'desktop' ? 16 / 9 : 9 / 16;
        setCrop(centerAspectCrop(width, height, aspect));
        // No need to set completedCrop here, it's set onComplete by ReactCrop
    };

    const handleInitiateCrop = (event: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
        const file = event.target.files?.[0];
        if (file) {
            // Clear any previous *cropped* file for this type
            if (type === 'desktop') {
                setNewDesktopImageFile(null);
                setDesktopFileDisplayName(file.name); // Show name immediately
            } else {
                setNewMobileImageFile(null);
                setMobileFileDisplayName(file.name); // Show name immediately
            }

            setOriginalFileBeforeCrop(file); // Store original file
            setCroppingType(type); // Set current cropping type

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrcForCropper(reader.result?.toString() || null);
                setCropModalOpen(true); // Open modal after image is loaded
            });
            reader.readAsDataURL(file);
            setErrorSubmit(null);
        }
        // Allows re-selecting the same file if the user cancels and tries again
        (event.target as HTMLInputElement).value = '';
    };

    const handleConfirmCrop = async () => {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current || !originalFileBeforeCrop || !croppingType) {
            showSnackBar("Error: No se pudo procesar el recorte. Información incompleta.");
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;

        await canvasPreview(image, canvas, completedCrop);

        // Convert canvas to WebP Blob
        canvas.toBlob((blob) => {
            if (!blob) {
                showSnackBar("Error: No se pudo crear el archivo WebP recortado.");
                setIsCreating(false);
                return;
            }

            // Modify filename to have .webp extension
            let originalNameWithoutExtension = originalFileBeforeCrop.name;
            const lastDotIndex = originalFileBeforeCrop.name.lastIndexOf('.');
            if (lastDotIndex > 0) { // Check if there is an extension
                originalNameWithoutExtension = originalFileBeforeCrop.name.substring(0, lastDotIndex);
            }
            const webpFileName = `${originalNameWithoutExtension}.webp`;

            const croppedWebpFile = new File([blob], webpFileName, {
                type: 'image/webp', // Explicitly set the MIME type
            });

            if (croppingType === 'desktop') {
                setNewDesktopImageFile(croppedWebpFile);
                setDesktopFileDisplayName(`${croppedWebpFile.name} (WebP)`);
            } else {
                setNewMobileImageFile(croppedWebpFile);
                setMobileFileDisplayName(`${croppedWebpFile.name} (WebP)`);
            }
            showSnackBar("Imagen recortada y convertida a WebP, lista para subir.");
            closeAndResetCropper();
        }, 'image/webp', 0.85); // Convert to WebP with 85% quality. Adjust (0.0 to 1.0) as needed.
    };

    const closeAndResetCropper = () => {
        setCropModalOpen(false);
        setImageSrcForCropper(null);
        setOriginalFileBeforeCrop(null);
        setCroppingType(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
        if (imgRef.current) imgRef.current = null; // Clear ref
    }
    // --- Add Item Handling ---
    const handleAddItem = async (type: 'desktop' | 'mobile') => {
        const fileToUpload = type === 'desktop' ? newDesktopImageFile : newMobileImageFile;

        if (!fileToUpload) {
            showSnackBar("Por favor, seleccione, recorte y convierta una imagen a WebP primero.");
            return;
        }

        setIsCreating(type);
        setErrorSubmit(null);
        setUploadProgress(prev => ({
            ...prev,
            [type]: { percentage: 0, status: 'Iniciando…' }
        }));

        // The metadata will now correctly reflect the .webp extension and image/webp type
        const upload = new tus.Upload(fileToUpload, {
            endpoint: `${BACKEND_URL}/files`,
            retryDelays: [0, 1000, 3000, 5000],
            metadata: { filename: fileToUpload.name, filetype: fileToUpload.type },
            onError(error) {
                console.error('Tus upload error:', error);
                setUploadProgress(prev => ({ ...prev, [type]: { percentage: prev[type]?.percentage ?? 0, status: 'Error' } }));
                setErrorSubmit(`Error al subir: ${error.message || 'Intente de nuevo.'}`);
                setIsCreating(false);
            },
            onProgress(bytesUploaded, bytesTotal) {
                const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
                setUploadProgress(prev => ({ ...prev, [type]: { percentage, status: 'Subiendo…' } }));
            },
            onSuccess: async () => {
                const uploadUrl = upload.url!;
                setUploadProgress(prev => ({ ...prev, [type]: { percentage: 100, status: 'Finalizado, guardando...' } }));
                try {
                    await createCarouselItem({ type, imageURL: uploadUrl });
                    showSnackBar('Item WebP agregado correctamente.'); // Updated message
                    await loadItems(false);
                    if (type === 'desktop') {
                        setNewDesktopImageFile(null); setDesktopFileDisplayName(null);
                    } else {
                        setNewMobileImageFile(null); setMobileFileDisplayName(null);
                    }
                    setUploadProgress(prev => { const newProgress = { ...prev }; delete newProgress[type]; return newProgress; });
                } catch (err: any) {
                    console.error('API error after upload:', err);
                    setErrorSubmit(err.message || 'Error al guardar el item en la base de datos.');
                    setUploadProgress(prev => ({ ...prev, [type]: { percentage: 100, status: 'Error al guardar' } }));
                } finally {
                    setIsCreating(false);
                }
            }
        });
        upload.start();
    };

    // --- Delete Handling ---
    const handleOpenDeleteDialog = (item: Omit<CarouselItem, '_id'> & { _id: string; }) => { if (!item._id) return; setItemToDelete(item); setDialogOpen(true); };
    const handleCloseDialog = () => { if (isDeleting || isSavingOrder) return; setDialogOpen(false); setItemToDelete(null); };
    const handleConfirmDelete = async () => {
        if (!itemToDelete?._id) return;
        setIsDeleting(true);
        try {
            await deleteCarouselItem(itemToDelete._id);
            showSnackBar(`Item eliminado exitosamente.`);
            await loadItems(false);
            handleCloseDialog();
        } catch (err: any) {
            console.error("Error deleting item:", err); showSnackBar(err.message || "Error al eliminar."); handleCloseDialog();
        } finally { setIsDeleting(false); }
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (event: DragStartEvent) => { // Use DragStartEvent
        const { active } = event;
        const item = [...desktopItems, ...mobileItems].find(i => i._id === active.id);
        setActiveDragItem(item || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over, activatorEvent } = event;
        const targetElement = activatorEvent.target as HTMLElement | null;
        const container = targetElement?.closest('[data-carousel-type]');
        const type = container?.getAttribute('data-carousel-type') as 'desktop' | 'mobile' | null;

        if (!over || !type || active.id === over.id) { return; }

        const items = type === 'desktop' ? desktopItems : mobileItems;
        const setItems = type === 'desktop' ? setDesktopItems : setMobileItems;

        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        const updatedItemsWithPosition = reorderedItems.map((item, index) => ({ ...item, position: index + 1 }));
        setItems(updatedItemsWithPosition); // Optimistic UI Update

        setIsSavingOrder(type);
        setErrorSubmit(null); // Clear previous submit errors
        try {
            const orderedIds = updatedItemsWithPosition.map(item => item._id);
            await updateCarouselOrder(type, orderedIds);
            showSnackBar(`Orden del carrusel ${type} actualizado.`);
        } catch (err: any) {
            console.error(`Error saving ${type} order:`, err);
            const message = err.message || `Error al guardar orden ${type}.`;
            setErrorSubmit(message); // Set error for display
            showSnackBar(message);
            await loadItems(false); // Revert UI on error
        } finally { setIsSavingOrder(false); }
    };

    // --- Drop Animation ---
    const dropAnimation: DropAnimation = defaultDropAnimation;

    // --- Render Logic ---
    const renderCarouselList = (type: 'desktop' | 'mobile', items: (Omit<CarouselItem, '_id'> & { _id: string })[]) => {
        const currentCroppedFile = type === 'desktop' ? newDesktopImageFile : newMobileImageFile;
        const displayName = type === 'desktop' ? desktopFileDisplayName : mobileFileDisplayName;
        const progressData = uploadProgress[type];
        const aspectText = type === 'desktop' ? '(16:9)' : '(9:16)';

        return (
            <Paper elevation={2} sx={{ p: 2, opacity: (isSavingOrder === type || isCreating === type) ? 0.7 : 1 }} data-carousel-type={type}>
                <Typography variant="h6" gutterBottom>{type === 'desktop' ? 'Carrusel Desktop' : 'Carrusel Mobile'} {aspectText}</Typography>
                <Stack direction="column" spacing={1.5} mb={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            component="label" // Makes the button act like a label for the hidden input
                            size="small"
                            disabled={isCreating === type || isSavingOrder === type}
                            startIcon={<CropIcon />}
                        >
                            Seleccionar y Recortar
                            <input
                                id={`${type}-file-input`}
                                type="file"
                                hidden
                                accept="image/png, image/jpeg, image/webp, image/gif" // GIF might not crop well with static canvas
                                onChange={(e) => handleInitiateCrop(e, type)}
                            />
                        </Button>
                        {displayName && (
                            <Tooltip title={displayName}>
                                <Typography variant="caption" sx={{
                                    display: 'inline-block', maxWidth: 180, overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle'
                                }}>
                                    {displayName}
                                </Typography>
                            </Tooltip>
                        )}
                    </Box>

                    {isCreating === type && progressData && (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress variant={progressData.status.startsWith("Error") ? "determinate" : "determinate"} value={progressData.percentage} color={progressData.status.startsWith("Error") ? "error" : "primary"} />
                            <Typography variant="caption" display="block" textAlign="center">{`${progressData.status} ${progressData.percentage}%`}</Typography>
                        </Box>
                    )}
                    {/* Show submission error for this section (create or save order) */}
                    {errorSubmit && (isCreating === type || isSavingOrder === type) && (
                        <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{errorSubmit}</Alert>
                    )}

                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddItem(type)}
                        disabled={isCreating === type || isSavingOrder === type || !currentCroppedFile} // Disabled if no CROPPED file
                        startIcon={isCreating === type && (!progressData || !progressData.status.startsWith('Error')) ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                    >
                        Añadir Imagen Recortada
                    </Button>
                </Stack>

                {items.length === 0 && !isLoading && <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>No hay items en este carrusel.</Typography>}
                <List disablePadding sx={{ minHeight: '100px' }}>
                    <SortableContext items={items.map(item => item._id!.toString())} strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                            <SortableCarouselItem key={item._id!.toString()} item={item} handleOpenDeleteDialog={handleOpenDeleteDialog} isSavingOrder={isSavingOrder === type} isDeleting={isDeleting} itemToDeleteId={itemToDelete?._id!.toString() ?? null} />
                        ))}
                    </SortableContext>
                </List>
                {isSavingOrder === type && <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}><CircularProgress size={24} /></Box>}
            </Paper>
        );
    };

    return (
        <>
            <Title title="Gestionar Carruseles Principales" />

            {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
            {errorFetch && !isLoading && (<Alert severity="error" sx={{ m: 2 }}>{errorFetch}<Button onClick={() => loadItems()} size="small">Reintentar</Button></Alert>)}

            {!isLoading && !errorFetch && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragItem(null)}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12, md: 6 }}> {renderCarouselList('desktop', desktopItems)} </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}> {renderCarouselList('mobile', mobileItems)} </Grid2>
                    </Grid2>
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeDragItem ? (<SortableCarouselItemUI item={activeDragItem} isOverlay />) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* --- Cropper Modal --- */}
            {imageSrcForCropper && croppingType && (
                <Dialog
                    open={cropModalOpen}
                    onClose={closeAndResetCropper} // Use the reset function on close
                    maxWidth="lg" // Allow wider modal for large images
                    PaperProps={{ sx: { minWidth: { xs: '90vw', sm: '70vw', md: '50vw' } } }}
                >
                    <DialogTitle>Recortar Imagen: {croppingType} ({croppingType === 'desktop' ? '16:9' : '9:16'})</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 1, sm: 2 } }}>
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)} // User drags, updates percentage crop
                            onComplete={(c) => setCompletedCrop(c)} // User finishes drag, updates pixel crop
                            aspect={croppingType === 'desktop' ? 16 / 9 : 9 / 16}
                            minWidth={100} // Minimum crop selection width in pixels
                            minHeight={100} // Minimum crop selection height in pixels
                            keepSelection // Keep selection when image resizes or changes
                        // ruleOfThirds // Optional: Show rule of thirds grid
                        >
                            <img
                                alt="Imagen para recortar"
                                src={imageSrcForCropper}
                                onLoad={onImageLoadInCropper} // Sets initial crop
                                style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }}
                            />
                        </ReactCrop>
                        {/* Hidden canvas for generating the cropped image blob */}
                        <canvas
                            ref={previewCanvasRef}
                            style={{
                                display: 'none',
                                objectFit: 'contain',
                                // Dimensions will be set by canvasPreview based on completedCrop
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
                        <Button onClick={closeAndResetCropper}>Cancelar</Button>
                        <Button onClick={handleConfirmCrop} variant="contained" disabled={!completedCrop?.width || !completedCrop?.height || isCreating === croppingType}>
                            Confirmar Recorte
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <ConfirmationDialog
                open={dialogOpen} onClose={handleCloseDialog} onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={<>¿Estás seguro de eliminar este item? <br /> <Avatar variant="rounded" src={itemToDelete?.imageURL} sx={{ width: 100, height: 'auto', my: 1 }} /></>}
                confirmText="Eliminar" cancelText="Cancelar" isPerformingAction={isDeleting}
            />
        </>
    );
};

export default ManageCarousels;