import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Star from '@mui/icons-material/StarRate';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import LabelIcon from '@mui/icons-material/Label';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import EditIcon from '@mui/icons-material/Edit';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';

import Img from 'react-cool-img';
import dayjs from 'dayjs';

import { useLoading, useSnackBar, useUser } from 'context/GlobalContext';

import utils from 'utils/utils.js';
import { Art } from '../../../../../../types/art.types';
import { fetchArt, updateArt } from '@api/art.api';

const ArtDetail: React.FC = () => {
  const { artId } = useParams<{ artId: string }>();
  const navigate = useNavigate();
  const { setLoading, loading } = useLoading();
  const { user } = useUser();
  const { showSnackBar } = useSnackBar();

  const [art, setArt] = useState<Art | null>(null);
  const [artLoadingError, setArtLoadingError] = useState<string | null>(null);

  const isOwner = user?.username === art?.prixerUsername;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Art | null>(null);

  const preTags: string[] = ['arte', 'fotografia', 'pintura', 'diseño', 'abstracto'];

  const handleTagsChange = (event: React.SyntheticEvent, newValue: string[]) => {
    setFormData((prev) => (prev ? { ...prev, tags: newValue } : null));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveChanges = async () => {
    if (!formData || !formData._id) return;
    setLoading(true);
    try {
      const updatedArt = await updateArt(formData._id.toString(), formData);
      if (updatedArt.success) {
        // setArt(updatedArt?.result!)
        loadArt();
        showSnackBar(updatedArt.message);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar el arte:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxPrintValues = useCallback((tile: Art) => {
    if (!tile.originalPhotoWidth || !tile.originalPhotoHeight || !tile.originalPhotoPpi) {
      return 'N/A';
    }
    const [w, h] = utils.maxPrintCalc(
      Number(tile.originalPhotoWidth),
      Number(tile.originalPhotoHeight),
      Number(tile.originalPhotoPpi),
      tile.originalPhotoIso
    );
    return `${w} x ${h} cm`;
  }, []);

  const navigateToPrixer = (e: React.MouseEvent<HTMLButtonElement>, username: string) => {
    e.preventDefault();
    navigate(`/prixer/${username}`);
  };

  const loadArt = async () => {
    if (artId) {
      setLoading(true);
      setArtLoadingError(null);
      try {
        const data = await fetchArt(artId);
        setArt(data);
        setFormData(data);
        if (!data) {
          setArtLoadingError('Art not found. It might have been moved or deleted.');
        }
      } catch (error) {
        console.error('Failed to fetch art:', error);
        setArtLoadingError(
          'An error occurred while fetching the art details. Please try again later.'
        );
        setArt(null);
      } finally {
        setLoading(false);
      }
    } else {
      setArtLoadingError('No Art ID provided.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArt();
  }, [artId, setLoading]);

  useEffect(() => {
    if (art && artId) {
      const timer = setTimeout(() => {
        document
          .getElementById(`art-detail-${artId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [art, artId]);

  console.log(art);

  if (loading && !art && !artLoadingError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: { xs: 2, md: 4 } }}>
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '50%' }} />
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ my: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '70%' }} />
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '60%' }} />
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '65%' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    );
  }

  if (artLoadingError) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          mt: { xs: 2, md: 4 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)', // Adjust as needed
        }}
      >
        <BrokenImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Oops!
        </Typography>
        <Typography color="textSecondary">{artLoadingError}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 3 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!art) {
    return (
      <Container sx={{ py: 4, mt: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography>No art data available.</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4, mt: { xs: 8, md: 10 } }} id={`art-detail-${art.artId}`}>
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <Grid2 container spacing={{ xs: 0, md: 0 }}>
            <Grid2
              size={{ xs: 12, md: 7 }}
              sx={{
                position: 'relative',
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              {art.exclusive === 'exclusive' && (
                <Tooltip title="Arte Exclusivo">
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Star sx={{ color: 'gold' }} fontSize="medium" />
                  </Box>
                </Tooltip>
              )}

              <Img
                placeholder="/imgLoading.svg"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
                src={art.largeThumbUrl || art.mediumThumbUrl || art.imageUrl}
                debounce={300}
                cache
                error="/imgError.svg"
                alt={art.title}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }} sx={{ position: 'relative' }}>
              {isOwner && (
                <Box>
                  <Tooltip title={isEditing ? 'Guardar Arte' : 'Editar Arte'}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: isEditing ? 52 : 16,
                        zIndex: 1,
                        borderRadius: '50%',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        color="primary"
                        aria-label="Guardar Arte"
                        onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
                      >
                        {isEditing ? <SaveAsIcon /> : <EditIcon />}
                      </IconButton>
                    </Box>
                  </Tooltip>
                  {isEditing && (
                    <Tooltip title={'Cancelar'}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          zIndex: 1,
                          borderRadius: '50%',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton aria-label="Cancelar" onClick={() => setIsEditing(false)}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              )}
              <CardContent
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Título"
                    name="title"
                    value={formData?.title || ''}
                    onChange={handleInputChange}
                    sx={{ mb: 2, pr: '4.8rem' }}
                  />
                ) : (
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    color="secondary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {art.title}
                  </Typography>
                )}
                {!isEditing && (
                  <Grid2
                    sx={{
                      display: 'flex',
                      justifyContent: 'left',
                      alignItems: 'center',
                      mb: 2,
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" color="secondary">
                      {'Prixer: '}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={(e) => navigateToPrixer(e, art.prixerUsername)}
                      sx={{
                        textTransform: 'none',
                        padding: '0px 14px',
                        fontSize: '1.1rem',
                        ':hover': {
                          backgroundColor: '#404e5c',
                          color: '#fff',
                        },
                      }}
                    >
                      {art.prixerUsername}
                    </Button>
                  </Grid2>
                )}
                {isEditing ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Descripción"
                    name="description"
                    multiline
                    rows={4}
                    value={formData?.description || ''}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                ) : (
                  art.description && (
                    <Typography
                      gutterBottom
                      component="p"
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-line', mb: 3, fontSize: '1rem' }}
                    >
                      {art.description}
                    </Typography>
                  )
                )}
                <Box sx={{ mb: 3 }}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Ubicación"
                      name="artLocation"
                      value={formData?.artLocation || ''}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                  ) : (
                    art.artLocation && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {art.artLocation}
                        </Typography>
                      </Box>
                    )
                  )}

                  {isEditing ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Ancho"
                        name="originalPhotoWidth"
                        value={formData?.originalPhotoWidth || ''}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Alto"
                        name="originalPhotoHeight"
                        value={formData?.originalPhotoHeight || ''}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="PPI"
                        name="originalPhotoPpi"
                        value={formData?.originalPhotoPpi || ''}
                        onChange={handleInputChange}
                      />
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="ISO"
                        name="originalPhotoIso"
                        value={formData?.originalPhotoIso || ''}
                        onChange={handleInputChange}
                      />
                    </Box>
                  ) : (
                    <>
                      {art.originalPhotoHeight &&
                        art.originalPhotoWidth &&
                        art.originalPhotoPpi && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PhotoSizeSelectActualIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Máx. Impresión: {maxPrintValues(art)}
                            </Typography>
                          </Box>
                        )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Este arte tiene una comisión de {art.comission}%
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
                {isEditing ? (
                  <Autocomplete
                    multiple
                    id="tags-autocomplete"
                    options={preTags}
                    freeSolo
                    value={formData?.tags}
                    onChange={handleTagsChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Tags"
                        placeholder="Añade etiquetas relevantes"
                      />
                    )}
                  />
                ) : (
                  art.tags &&
                  art.tags.length > 0 && (
                    <Box sx={{ mb: 3, display: 'flex' }}>
                      <LabelIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {art.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end',
                    mt: 'auto',
                  }}
                >
                  {art?.createdOn && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon sx={{ mr: 1.5, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.disabled">
                        {` Arte publicado el 
                        ${new Date(art?.createdOn).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}`}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    component="p"
                    sx={{ textAlign: 'right' }}
                  >
                    ID: {art.artId}
                  </Typography>
                </Box>
              </CardContent>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </>
  );
};

export default ArtDetail;
