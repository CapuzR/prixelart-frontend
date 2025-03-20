import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Autocomplete from '@mui/lab/Autocomplete';
import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import ArtUploader from 'components/artUploader/artUploader';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import utils from '../../../../../../utils/utils';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Img from 'react-cool-img';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import MDEditor from '@uiw/react-md-editor';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Star from '@mui/icons-material/StarRate';
import StarOutline from '@mui/icons-material/StarOutline';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { useLoading } from 'context/GlobalContext';
import {
  locationEdit,
  titleEdit,
  originalPhotoHeightEdit,
  originalPhotoWidthEdit,
  originalPhotoPpiEdit,
  originalPhotoIsoEdit,
  descriptionEdit,
  exclusiveEdit,
  comissionEdit,
  AllowedEvent,
} from '../helpers';
import { Grid2, Theme } from '@mui/material';
import { generateWaMessage } from 'utils/utils.js';
import { useStyles } from './artDetails.styles';
import { fetchArt } from '@apps/consumer/art/api';
import { getUrlParams } from '@utils/util';
import { Art } from '../../../../../../types/art.types';

const IOSSwitch = withStyles((theme: Theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: 'primary',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }: any) => (
  <Switch
    focusVisibleClassName={classes.focusVisible}
    disableRipple
    classes={{
      root: classes.root,
      switchBase: classes.switchBase,
      thumb: classes.thumb,
      track: classes.track,
      checked: classes.checked,
    }}
    {...props}
  />
));

const photoIsos = ['100', '200', '400'];

const ArtDetail: React.FC = () => {
  const { artId } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();

  const globalParams = getUrlParams();
  const [ready, setReady] = useState(false);
  const [art, setArt] = useState<Art | null>(null);
  // const [newTag, setNewTag] = useState([]);
  const [updatedArt, setUpdatedArt] = useState<Partial<Art>>({});
  const { setLoading } = useLoading();
  const [artDataState, setArtDataState] = useState("");
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [selectedArt, setSelectedArt] = useState<Partial<Art>>({});
  const [hiddenArt, setHiddenArt] = useState<Partial<Art>>({});
  const [open, setOpen] = useState(false);
  const [disabledReason, setDisabledReason] = useState('');
  const [points, setPoints] = useState("50");
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState('');
  const [allowExclusive, setAllowExclusive] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [code, setCode] = useState('XX');
  const [serial, setSerial] = useState(0);
  const [sequence, setSequence] = useState(0);
  const [openV, setOpenV] = useState(false);
  const [visible, setVisible] = useState(true);
  const itemsPerPage = 8;
  const [pageNumber, setPageNumber] = useState(1);
  const itemsToSkip = (pageNumber - 1) * itemsPerPage;

  const tokenString = localStorage.getItem('token');
  const token = tokenString ? JSON.parse(tokenString) : null;

  const adminString = localStorage.getItem('adminToken');
  const adminToken = adminString ? JSON.parse(adminString) : null;

  const verifyStandardArts = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/read-by-prixer';

    if (token) {
      const username = token.username;

      const body = {
        username: username,
      };
      axios.post(base_url, body).then((response) => {
        if (response.data.arts.length > 5) {
          setAllowExclusive(true);
        }
      });
    }

  };

  useEffect(() => {
    if (token) {
      verifyStandardArts();
    }
  }, []);

  const handleClickVisible = () => {
    setOpenV(true);
  };

  const handleArtEdit = async (e: React.MouseEvent<HTMLButtonElement>, tile: Art) => {
    setLoading(true);
    if (artDataState === tile.artId) {
      if (updatedArt.title !== '' && updatedArt.description !== '') {
        setUpdatedArt(tile);
        const base_url = import.meta.env.VITE_BACKEND_URL + '/art/update/' + selectedArt;
        const data = {
          title: tile.title,
          description: tile.description,
          tags: tile.tags,
          category: tile.category,
          artId: tile.artId,
          artType: tile.artType,
          artLocation: tile.artLocation,
          exclusive: tile.exclusive,
          comission: Number(tile.comission),
        };
        await axios
          .put(base_url, data)
          .then((response) => {
            if (response.data.data.success == true) {
              setSnackBarMessage(response.data.data.success);
              setSnackBar(true);
              setSelectedArt({});
            } else {
              setSnackBarMessage(response.data.data.error_message);
              setSnackBar(true);
              setSelectedArt({});
            }
          })
          .catch((error) => {
            setSelectedArt({});
          });
        setArtDataState('');
      } else {
        setSnackBarMessage('Por favor llena los campos requeridos');
        setSnackBar(true);
      }
    } else {
      setArtDataState(tile.artId);
    }
    setLoading(false);
  };

  const handleArtDescriptionEdit = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = descriptionEdit([], tile, e);
    setArt(result[0]);
  };

  const handleArtTitleEdit = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    const result = titleEdit([], tile, e);
    setArt(result[0]);
  };

  const handleOriginalPhotoHeight = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = originalPhotoHeightEdit([], tile, e);
    setArt(result[0]);
  };

  const handleOriginalPhotoWidth = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = originalPhotoWidthEdit([], tile, e);
    setArt(result[0]);
  };

  const handleOriginalPhotoPpi = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = originalPhotoPpiEdit([], tile, e);
    setArt(result[0]);
  };

  const handleOriginalPhotoIso = async (e: AllowedEvent, tile: Art) => {
    let result = originalPhotoIsoEdit([], tile, e);
    setArt(result[0]);
  };

  const handleArtLocationEdit = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = locationEdit([], tile, e);
    setArt(result[0]);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedArt({});
    setOpenSettings(false);
  };

  const handleCloseVisible = () => {
    setSelectedArt({});
  };

  const maxPrintValues = (tile: Art) => {
    const [maxPrintWidthCm, maxPrintHeightCm] = utils.maxPrintCalc(
      tile.originalPhotoWidth,
      tile.originalPhotoHeight,
      tile.originalPhotoPpi,
      tile.originalPhotoIso
    );

    return maxPrintWidthCm + ' x ' + maxPrintHeightCm + ' cm';
  };

  const navigateToPrixer = (e: React.MouseEvent<HTMLButtonElement>, prixerUsername: string) => {
    e.preventDefault();
    navigate(`/prixer/${prixerUsername}`);
  };

  const deleteArt = async (tile: Art) => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/delete/' + tile;
    await axios.delete(base_url);
    handleClose();
    setSnackBarMessage('Arte eliminado exitosamente');
    setSnackBar(true);
    navigate(-1);
  };

  const setVisibleArt = async (art: Art) => {
    setLoading(true);
    art.visible = !art.visible;

    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/disable/' + art.artId;
    await axios.put(base_url, {
      art: art,
      disabledReason: disabledReason,
      adminToken: localStorage.getItem('adminTokenV'),
    });
    setSnackBarMessage('Arte modificado exitosamente');
    setSnackBar(true);
    setLoading(false);
    setDisabledReason('');
    setSelectedArt({});
    handleClose();
  };

  const rankArt = async (art: Art, id: string) => {
    setLoading(true);
    const URI = import.meta.env.VITE_BACKEND_URL + '/art/rank/' + id;
    art.points = parseInt(points);
    const certificate = {
      code: code,
      serial: serial,
      sequence: sequence,
    };
    await axios.put(
      URI,
      art,
      {
        headers: { adminToken: localStorage.getItem('adminTokenV') },
        withCredentials: true
      }
    );
    setSnackBarMessage('Puntuación agregada exitosamente');
    setInterval(() => {
      setLoading(false);
    }, 3000);
    setSnackBar(true);
    setSelectedArt({});
  };


  useEffect(() => {
    const loadArt = async () => {
      if (artId) {
        const art = await fetchArt(artId);
        setArt(art);
      }
      setReady(true);
      setLoading(false);
      setTimeout(accurateLocation, 1000);
    }
    loadArt();
  }, []);

  const accurateLocation = () => {
    if (artId) {
      document.getElementById(artId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const getTerms = () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/termsAndConditions/read';
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
  };

  const handleExclusive = async (e: AllowedEvent, tile: Art) => {
    let result = exclusiveEdit([], tile, e);
    setArt(result[0]);
  };

  const handleComission = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tile: Art) => {
    let result = comissionEdit([], tile, e);
    setArt(result[0]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, Id: string) => {
    e.preventDefault();
    const formData = new FormData();
    const termsAgree = true;
    formData.append('termsAgree', String(termsAgree));
    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/update-terms/' + Id;
    await axios
      .put(
        base_url,
        { termsAgree: true },
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      .then((response) => {
        setTermsAgreeVar(true);
      });
  };

  const TermsAgreeModal = () => {
    if (token) {
      const GetId = token.username;
      const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/get/' + GetId;
      axios.get(base_url).then((response) => {
        setTermsAgreeVar(response.data.termsAgree);
        getTerms();
      });
    }
  };

  useEffect(() => {
    {
      TermsAgreeModal();
    }
  }, []);

  const addingToCart = (e: React.MouseEvent<HTMLButtonElement>, tile: Art) => {
    e.preventDefault();
    setSelectedArt(tile);
  };


  return (
    <>
      <Container component="main" className={classes.paper}>
        <div style={{ marginTop: 75, width: 'clamp(300px, 100%, 750px)', alignSelf: 'center' }}>
          {/* Art Detail */}
          {art ? (
            artDataState !== art.artId ? (
              <div id={art.artId}>
                {art.visible === true ? (
                  <>
                    <Card style={{ marginTop: 35 }}>
                      <CardActionArea disabled>
                        {/* Exclusive badge */}
                        {art.exclusive === 'exclusive' && (
                          <Tooltip title="Arte exclusivo">
                            <IconButton
                              style={{
                                position: 'absolute',
                                right: 0,
                                display: 'flex',
                              }}
                            >
                              <Star
                                style={{
                                  marginRight: '-2.2rem',
                                  marginTop: '0.05rem',
                                }}
                                color="primary"
                                fontSize="large"
                              />
                              <StarOutline
                                style={{
                                  color: 'white',
                                }}
                                fontSize="large"
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Img
                          placeholder="/imgLoading.svg"
                          style={{ backgroundColor: '#eeeeee', width: '100%' }}
                          src={art.largeThumbUrl || art.mediumThumbUrl}
                          debounce={1000}
                          cache
                          error="/imgError.svg"
                          srcSet={
                            art.smallThumbUrl +
                            ' 600w, ' +
                            art.mediumThumbUrl +
                            ' 850w, ' +
                            art.largeThumbUrl +
                            ' 1300w'
                          }
                          sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                          alt={art.title}
                          id={art.artId}
                        />
                      </CardActionArea>
                      <CardContent>
                        <Grid2 container justifyContent="space-between">
                          <Typography style={{ fontSize: '0.8em' }}>ID: {art.artId}</Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => navigateToPrixer(e, art.prixerUsername)}
                          >
                            <Typography variant="h6" style={{ fontSize: 12 }}>
                              Prixer: {art.prixerUsername}
                            </Typography>
                          </Button>
                        </Grid2>
                        <Grid2 container style={{ textAlign: 'left', padding: 0, margin: 0 }}>
                          <Typography variant="h5" component="h2" style={{ margin: 0 }}>
                            {art.title}
                          </Typography>
                        </Grid2>
                        {art.artLocation && (
                          <Typography style={{ fontSize: '0.8em', paddingBottom: 10, paddingLeft: 3 }}>
                            Ubicación: {art.artLocation}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            whiteSpace: 'pre-line',
                            fontSize: '1.1em',
                            marginBottom: 10,
                          }}
                        >
                          {art.description}
                        </Typography>
                        {art.originalPhotoHeight && art.originalPhotoWidth && (
                          <Typography variant="body2" color="textSecondary">
                            Máximo para impresión: {maxPrintValues(art)}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            whiteSpace: 'pre-line',
                            fontSize: '1.1em',
                            marginBottom: 10,
                            textAlign: 'center',
                          }}
                        >
                          Creado el{' '}
                          {new Date(art.createdOn).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </CardContent>
                      {/* Additional admin/prixer actions can be enabled here if needed */}
                    </Card>

                    {/* Dialogs for hide and delete actions */}
                    <Dialog open={openV} onClose={handleCloseVisible}>
                      <DialogTitle>{'¿Estás seguro de ocultar este arte?'}</DialogTitle>
                      <DialogContent>
                        <DialogContentText style={{ textAlign: 'center' }}>
                          Este arte ya no será visible en este perfil y la página de inicio.
                        </DialogContentText>
                      </DialogContent>
                      <Grid2 container style={{ display: 'flex', justifyContent: 'center' }}>
                        <TextField
                          style={{ width: '95%', marginBottom: '5px' }}
                          multiline
                          required
                          id="disableReason"
                          label="¿Por qué quieres ocultar este arte?"
                          variant="outlined"
                          onChange={(e) => setDisabledReason(e.target.value)}
                        />
                      </Grid2>
                      <DialogActions>
                        <Button onClick={handleCloseVisible} color="primary">
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            setVisibleArt(art);
                            setHiddenArt({});
                            handleCloseVisible();
                          }}
                          variant="contained"
                          color="primary"
                          style={{
                            color: 'white',
                            backgroundColor: '#d33f49',
                          }}
                        >
                          Aceptar
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">{'¿Estás seguro de eliminar este arte?'}</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description" style={{ textAlign: 'center' }}>
                          Este arte se eliminará permanentemente de tu perfil.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose} color="primary">
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            deleteArt(art);
                            setSelectedArt({});
                          }}
                          variant="contained"
                          color="primary"
                          style={{
                            color: 'white',
                            backgroundColor: '#d33f49',
                          }}
                        >
                          Aceptar
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                ) : (
                  // Admin view for invisible art
                  adminToken && (
                    <Card style={{ marginTop: 35 }}>
                      <CardActionArea disabled>
                        <Img
                          placeholder="/imgLoading.svg"
                          style={{ backgroundColor: '#eeeeee', width: '100%' }}
                          src={art.largeThumbUrl || art.mediumThumbUrl}
                          debounce={1000}
                          cache
                          error="/imgError.svg"
                          srcSet={
                            art.smallThumbUrl +
                            ' 600w, ' +
                            art.mediumThumbUrl +
                            ' 850w, ' +
                            art.largeThumbUrl +
                            ' 1300w'
                          }
                          sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                          alt={art.title}
                          id={art.artId}
                        />
                      </CardActionArea>
                      <CardContent>
                        <Grid2 container justifyContent="space-between">
                          <Typography style={{ fontSize: '0.8em' }}>ID: {art.artId}</Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => navigateToPrixer(e, art.prixerUsername)}
                          >
                            <Typography variant="h6" style={{ fontSize: 12 }}>
                              Prixer: {art.prixerUsername}
                            </Typography>
                          </Button>
                        </Grid2>
                        <Grid2 container style={{ textAlign: 'left', padding: 0, margin: 0 }}>
                          <Typography variant="h5" component="h2" style={{ margin: 0 }}>
                            {art.title}
                          </Typography>
                        </Grid2>
                        {art.artLocation && (
                          <Typography style={{ fontSize: '0.8em', paddingBottom: 10, paddingLeft: 3 }}>
                            Ubicación: {art.artLocation}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            whiteSpace: 'pre-line',
                            fontSize: '1.1em',
                            marginBottom: 10,
                          }}
                        >
                          {art.description}
                        </Typography>
                        {art.originalPhotoHeight && art.originalPhotoWidth && (
                          <Typography variant="body2" color="textSecondary">
                            Máximo para impresión: {maxPrintValues(art)}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) => window.open(generateWaMessage(art), '_blank')}
                        >
                          <WhatsAppIcon /> Escríbenos
                        </Button>
                        {adminToken && (
                          <IOSSwitch
                            color="primary"
                            size="normal"
                            onChange={(e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
                              if (e.target.checked === false) {
                                handleClickVisible();
                                setVisible(e.target.checked);
                                setHiddenArt(art);
                              } else {
                                setVisible(e.target.checked);
                                setVisibleArt(art);
                              }
                            }}
                          />
                        )}
                        {token && token.username === art.prixerUsername && (
                          <Button
                            color="primary"
                            size="small"
                            onClick={(e) => {
                              handleClickOpen();
                              setSelectedArt(art);
                            }}
                          >
                            Eliminar
                          </Button>
                        )}
                        <Dialog
                          open={open}
                          onClose={handleClose}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle id="alert-dialog-title">{'¿Estás seguro de eliminar este arte?'}</DialogTitle>
                          <DialogContent>
                            <DialogContentText id="alert-dialog-description" style={{ textAlign: 'center' }}>
                              Este arte se eliminará permanentemente de tu perfil.
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleClose} color="primary">
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                deleteArt(art);
                                setSelectedArt({});
                              }}
                              variant="contained"
                              color="primary"
                              style={{
                                color: 'white',
                                backgroundColor: '#d33f49',
                              }}
                            >
                              Aceptar
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </CardActions>
                    </Card>
                  )
                )}
              </div>
            ) : (
              // Edit mode for the art
              <Card id={art.artId} style={{ marginTop: 35 }}>
                <Img
                  placeholder="/imgLoading.svg"
                  style={{ backgroundColor: '#eeeeee', width: '100%' }}
                  src={art.largeThumbUrl || art.mediumThumbUrl}
                  debounce={1000}
                  cache
                  error="/imgError.svg"
                  srcSet={
                    art.smallThumbUrl +
                    ' 600w, ' +
                    art.mediumThumbUrl +
                    ' 850w, ' +
                    art.largeThumbUrl +
                    ' 1300w'
                  }
                  sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                  alt={art.title}
                  id={art.artId}
                />
                <CardContent>
                  <Grid2 container direction="column">
                    <TextField
                      required
                      id="artTitle"
                      label="Titulo del arte"
                      variant="outlined"
                      value={art.title}
                      onChange={(e) => handleArtTitleEdit(e, art)}
                    />
                    {art.artType === 'Foto' && (
                      <>
                        <Grid2 container style={{ paddingTop: 15, paddingBottom: 15 }}>
                          <Grid2 size={{ xs: 12 }} style={{ textAlign: 'left' }}>
                            <Typography style={{ whiteSpace: 'pre-line', fontSize: '1.3em' }}>
                              Medida del archivo original
                            </Typography>
                          </Grid2>
                          {art.originalPhotoWidth && art.originalPhotoHeight && (
                            <Grid2 container justifyContent="space-between" style={{ paddingTop: 15 }}>
                              <Grid2 size={{ xs: 5 }}>
                                <TextField
                                  variant="outlined"
                                  id="originalPhotoWidth"
                                  label="Ancho"
                                  type="number"
                                  value={art.originalPhotoWidth}
                                  onChange={(e) => {
                                    handleOriginalPhotoWidth(e, art);
                                    if (Number(e.target.value) < 2000) {
                                      setSnackBarMessage('La foto original debe tener un ancho mayor a 2.000 px.');
                                      setSnackBar(true);
                                    }
                                  }}
                                />
                              </Grid2>
                              <Typography style={{ paddingTop: 13 }}> x </Typography>
                              <Grid2 size={{ xs: 5 }}>
                                <TextField
                                  variant="outlined"
                                  type="number"
                                  id="originalPhotoHeight"
                                  label="Alto"
                                  value={art.originalPhotoHeight}
                                  onChange={(e) => {
                                    handleOriginalPhotoHeight(e, art);
                                    if (Number(e.target.value) < 2000) {
                                      setSnackBarMessage('La foto original debe tener un alto mayor a 2.000 px.');
                                      setSnackBar(true);
                                    }
                                  }}
                                />
                              </Grid2>
                              <Typography style={{ paddingTop: 13, paddingLeft: 2 }}> px </Typography>
                            </Grid2>
                          )}
                          <Grid2 container justifyContent="space-between" style={{ paddingTop: 15 }}>
                            <Grid2 size={{ xs: 5 }}>
                              <TextField
                                variant="outlined"
                                type="number"
                                id="originalPhotoPpi"
                                label="PPI"
                                value={art.originalPhotoPpi}
                                onChange={(e) => {
                                  handleOriginalPhotoPpi(e, art);
                                  if (Number(e.target.value) < 100) {
                                    setSnackBarMessage('La foto original debe ser mayor a 100 ppi.');
                                    setSnackBar(true);
                                  }
                                }}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 5 }}>
                              <FormControl variant="outlined" style={{ width: '100%' }}>
                                <InputLabel id="originalPhotoIsoLabel">ISO</InputLabel>
                                <Select
                                  labelId="originalPhotoIsoLabel"
                                  id="originalPhotoIso"
                                  value={art.originalPhotoIso}
                                  onChange={(e) => {
                                    handleOriginalPhotoIso(e, art);
                                  }}
                                  label="originalPhotoIso"
                                >
                                  <MenuItem value="">
                                    <em></em>
                                  </MenuItem>
                                  {photoIsos.map((n) => (
                                    <MenuItem key={n} value={n}>
                                      {n}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid2>
                          </Grid2>
                        </Grid2>
                        <Grid2 container style={{ textAlign: 'left' }}>
                          <Typography style={{ whiteSpace: 'pre-line', fontSize: '1.3em' }}>
                            Medida máxima para impresión:
                          </Typography>
                          <Typography style={{ whiteSpace: 'pre-line', fontSize: '1.3em' }}>
                            {maxPrintValues(art)}
                          </Typography>
                        </Grid2>
                      </>
                    )}
                    <Grid2 style={{ marginBottom: 20, marginTop: 20 }}>
                      <TextField
                        multiline
                        minRows={2}
                        required
                        id="artDescription"
                        variant="outlined"
                        label="Descripción del arte"
                        value={art.description}
                        onChange={(e) => handleArtDescriptionEdit(e, art)}
                      />
                    </Grid2>
                    <Grid2 style={{ marginBottom: 20, marginTop: 20 }}>
                      <Autocomplete
                        multiple
                        freeSolo
                        id="tags-outlined"
                        options={art.tags ? art.tags : []}
                        value={art.tags ? art.tags : []}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              style={{ marginRight: 5 }}
                              onDelete={() => {
                                if (art.tags) {
                                  const newTags = art.tags.filter((tag) => tag !== option);
                                  setArt({ ...art, tags: newTags });
                                }
                              }}
                              variant="outlined"
                              label={option}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Etiquetas"
                            onKeyDown={(e) => {
                              const target = e.target as HTMLInputElement;
                              if ((e.key === 'Enter' && target.value) || (e.key === ' ' && target.value)) {
                                if (art.tags) {
                                  setArt({ ...art, tags: [...art.tags, target.value] });
                                } else {
                                  setArt({ ...art, tags: [target.value] });
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Grid2>
                    <Grid2>
                      <TextField
                        variant="outlined"
                        id="artLocation"
                        label="Ubicación"
                        value={art.artLocation}
                        onChange={(e) => handleArtLocationEdit(e, art)}
                      />
                    </Grid2>
                    {allowExclusive && (
                      <Grid2 container spacing={2} style={{ marginTop: 20, justifyContent: 'center' }}>
                        <Grid2 size={{ xs: 5, sm: 12, md: 6 }}>
                          <FormControl variant="outlined" className={classes.form}>
                            <InputLabel required id="artTypeLabel">
                              Exclusividad
                            </InputLabel>
                            <Select
                              value={art.exclusive}
                              onChange={(e) => handleExclusive(e, art)}
                              label="artType"
                            >
                              <MenuItem value="standard">Estándar</MenuItem>
                              <MenuItem value="exclusive">Exclusivo</MenuItem>
                              <MenuItem value="private">Privado</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
                          <TextField
                            variant="outlined"
                            label="Comisión"
                            disabled={art.exclusive === 'standard'}
                            value={art.comission}
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            }}
                            inputProps={{
                              min: 10,
                            }}
                            onChange={(e) => handleComission(e, art)}
                          />
                        </Grid2>
                      </Grid2>
                    )}
                  </Grid2>
                </CardContent>
                <CardActions>
                  {token && token.username && (
                    <Button size="small" color="primary" onClick={(e) => handleArtEdit(e, art)}>
                      Guardar
                    </Button>
                  )}
                </CardActions>
              </Card>
            )
          ) : (
            <p>Prueba prueba</p>
          )}


          {/* Art uploader */}
          {openArtFormDialog && (
            <ArtUploader
              openArtFormDialog={openArtFormDialog}
              setOpenArtFormDialog={setOpenArtFormDialog}
            />
          )}
          {/* Floating buttons */}
          <Grid2 className={classes.float}>
            <FloatingAddButton
              setOpenArtFormDialog={setOpenArtFormDialog}
              setOpenServiceFormDialog={setOpenArtFormDialog}
            />
          </Grid2>
          {/* Snackbar */}
          <Snackbar
            open={snackBar}
            autoHideDuration={2000}
            message={snackBarMessage}
            className={classes.snackbar}
            onClose={() => setSnackBar(false)}
          />
        </div>
        {/* Paginación */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignSelf: 'center',
            paddingTop: 5,
            marginBottom: 4,
            width: '100%',
          }}
        >
          {pageNumber - 3 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(1);
              }}
            >
              {1}
            </Button>
          )}
          {pageNumber - 3 > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 5,
              }}
            >
              ...
            </div>
          )}
          {pageNumber - 2 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber - 2);
              }}
            >
              {pageNumber - 2}
            </Button>
          )}
          {pageNumber - 1 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber - 1);
              }}
            >
              {pageNumber - 1}
            </Button>
          )}
        </Box>
        {/* Términos y condiciones */}
        <Modal
          // size={{ x1: 800, lg: 800, sm: 360, md: 480, xs: 360 }}
          open={termsAgreeVar === false}
        // onClose={termsAgreeVar === true}
        >
          <div className={classes.paper2}>
            <h2 style={{ textAlign: 'center', fontWeight: 'Normal' }}>
              Hemos actualizado nuestros términos y condiciones y queremos que estés al tanto.
            </h2>
            <div>
              <div data-color-mode="light">
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
                </div>
                <div data-color-mode="light">
                  <MDEditor.Markdown source={value} style={{ textAlign: 'justify' }} />
                </div>
              </div>
            </div>
            <div style={{ justifyContent: 'center', display: 'flex' }}>
              <Button
                onClick={(e) => {
                  handleSubmit(e, token.username);
                }}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
              // required
              >
                Acepto los nuevos términos y condiciones
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </>
  );
}

export default ArtDetail;