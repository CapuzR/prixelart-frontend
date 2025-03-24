import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import Title from '@apps/admin/components/Title';
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import clsx from 'clsx';
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import EditIcon from '@mui/icons-material/Edit';
import MDEditor from '@uiw/react-md-editor';
import Variants from './VariantsIndex';
import Backdrop from '@mui/material/Backdrop';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { isAValidName, isAValidCi, isAValidPhoneNum, isAValidEmail } from 'utils/validations';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Paper from '@mui/material/Paper';
import Mockup from './updateMockUp';
import InputAdornment from '@mui/material/InputAdornment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  textField: {
    marginRight: '8px',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'none',
    flexDirection: 'column',
  },
  paper2: {
    position: 'absolute',
    width: '80%',
    maxHeight: '90%',
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'row',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function UpdateProductV2(props) {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [productId, setProductId] = useState(props?.product?._id);
  const [images, newImages] = useState({ images: [] });
  const [thumbUrl, setThumbUrl] = useState(props.product?.thumbUrl);
  const [imagesList, setImagesList] = useState(props?.product?.sources.images);
  const [active, setActive] = useState(props?.product?.active);
  const [productName, setProductName] = useState(props?.product?.name);
  const [variants, setVariants] = useState(props?.product?.variants);
  const [description, setDescription] = useState(props?.product?.description);
  const [category, setCategory] = useState(props?.product?.category);
  const [considerations, setConsiderations] = useState(props?.product?.considerations || undefined);
  const [productionTime, setProductionTime] = useState(props.product?.productionTime || undefined);
  const [fromPublicPrice, setFromPublicPrice] = useState(props?.product?.publicPrice?.from);
  const [toPublicPrice, setToPublicPrice] = useState(props?.product?.publicPrice?.to || undefined);
  const [fromPrixerPrice, setFromPrixerPrice] = useState(props?.product?.prixerPrice?.from);
  const [toPrixerPrice, setToPrixerPrice] = useState(props?.product?.prixerPrice?.to || undefined);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [activeVCrud, setActiveVCrud] = useState('read');
  const [hasSpecialVar, setHasSpecialVar] = useState(props?.product?.hasSpecialVar || false);
  const [videoUrl, setVideoUrl] = useState(props?.product?.sources.video);
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: 'Subir imagenes',
  });

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [focus, setFocus] = useState(undefined);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [loaDOpen, setLoaDOpen] = useState(false);
  const [mustImage, setMustImages] = useState(false);

  useEffect(() => {
    // readProduct();
    const indexImage = imagesList?.length < 1 ? imagesList?.indexOf(thumbUrl) : undefined;

    imagesList?.map((url) => {
      url?.type === 'images'
        ? imageLoader.loader.push(url && url.url)
        : setVideoUrl(url && url.url);
    });

    if (indexImage === -1) {
      imagesList.push(thumbUrl);
      imageLoader.loader.push(thumbUrl);
    }
    setTimeout(() => {
      if (props.product?.sources.images) {
        props?.product?.sources.images.map((element) => {
          element.type === 'video' && setVideoUrl(element.url);
        });
      }
    }, 1000);
    return () => {
      localStorage.removeItem('product');
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      props.handleClose();
    } else return;
  }
  document.addEventListener('keydown', handleKeyDown);

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Grid container className={classes.paper2}>
        <Tabs
          value={value}
          onChange={handleChange}
          style={{ width: '70%' }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Descripción" />
          <Tab label="Variantes" />
          <Tab label="MockUp" />
        </Tabs>

        {/* <TabPanel value={value} index={0}> */}
        <form
          encType="multipart/form-data"
          noValidate
          //  onSubmit={handleSubmit}
        >
          <Grid container spacing={2}>
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={12}
                md={4}
                lg={4}
                xl={4}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormControl variant="outlined">
                  <Button variant="contained" component="label" style={{ textTransform: 'none' }}>
                    Subir imagen{' '}
                    <input
                      name="newProductImages"
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(a) => {
                        a.preventDefault();
                        // loadImage(a);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    componenet="label"
                    // onClick={handleClickOpen}
                    style={{ textTransform: 'none', marginTop: 10 }}
                  >
                    Subir video
                  </Button>
                </FormControl>
              </Grid>
              <Grid item xs={11} sm={11} md={7} lg={7} xl={7} style={{ display: 'flex' }}>
                {imageLoader.loader &&
                  imageLoader.loader.map((img, key_id) => {
                    return (
                      <div
                        key={key_id}
                        style={{
                          width: '25%',
                          marginRight: '4px',
                          flexDirection: 'row',
                        }}
                      >
                        <div
                          style={{
                            textAlign: 'right',
                          }}
                        >
                          <IconButton
                            variant="text"
                            className={classes.buttonImgLoader}
                            style={{
                              color: '#d33f49',
                            }}
                            component="label"
                          >
                            <input
                              name="productImages"
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(a) => {
                                const i = imageLoader.loader.indexOf(img);
                                // replaceImage(a, i);
                                imagesList?.splice(key_id, 1);
                              }}
                            />
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            variant="text"
                            className={classes.buttonImgLoader}
                            style={{ color: '#d33f49' }}
                            onClick={(d) => {
                              imageLoader.loader.splice(key_id, 1);
                              images.images.splice(key_id, 1);
                              imagesList?.splice(key_id, 1);
                              setLoadImage({
                                loader: imageLoader.loader,
                                filename: 'Subir Imagenes',
                              });
                              newImages({ images: images.images });
                            }}
                          >
                            <HighlightOffOutlinedIcon />
                          </IconButton>
                        </div>
                        <Paper elevation={3} style={{ padding: 10 }}>
                          <img
                            style={{
                              width: '100%',
                              objectFit: 'contain',
                            }}
                            src={img}
                            alt="Imagen"
                          />
                        </Paper>
                      </div>
                    );
                  })}
                {videoUrl && (
                  <>
                    <div
                      style={{
                        marginRight: '4px',
                        flexDirection: 'row',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'right',
                          display: 'flex',
                        }}
                      >
                        <IconButton
                          variant="text"
                          className={classes.buttonImgLoader}
                          style={{
                            color: '#d33f49',
                          }}
                          component="label"
                          //   onClick={handleClickOpen}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          variant="text"
                          className={classes.buttonImgLoader}
                          style={{ color: '#d33f49' }}
                          onClick={(d) => {
                            // setVideoUrl(undefined);
                          }}
                        >
                          <HighlightOffOutlinedIcon />
                        </IconButton>
                      </div>

                      <Paper elevation={3} style={{ padding: 10 }}>
                        <span
                          key={1}
                          style={{ width: '100%' }}
                          dangerouslySetInnerHTML={{
                            __html: videoUrl,
                          }}
                          alt={'video'}
                        />
                      </Paper>
                    </div>
                  </>
                )}
              </Grid>
              <IconButton
                variant="text"
                className={classes.buttonImgLoader}
                style={{
                  color: '#d33f49',
                  width: 40,
                  height: 40,
                }}
                onClick={(e) => {
                  setImagesList([]);
                  setLoadImage({ loader: [], filename: 'Subir imagenes' });
                }}
              >
                <DeleteOutlineIcon style={{ width: 30, height: 30 }} />
              </IconButton>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <Checkbox
                      checked={active}
                      color="primary"
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                      onChange={() => {
                        active ? setActive(false) : setActive(true);
                      }}
                    />
                    Habilitado / Visible
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Checkbox
                      checked={hasSpecialVar}
                      color="primary"
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                      onChange={() => {
                        hasSpecialVar ? setHasSpecialVar(false) : setHasSpecialVar(true);
                      }}
                    />{' '}
                    ¿Tiene variables especiales?
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl variant="outlined" xs={12} fullWidth={true}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    display="inline"
                    id="productName"
                    label="Nombre"
                    name="productName"
                    autoComplete="productName"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                    }}
                    // autoFocus={focus === "name"}
                    // onFocus={() => {
                    //   handleFocus("name");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    display="inline"
                    fullWidth
                    id="category"
                    label="Categoría"
                    name="category"
                    autoComplete="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                    }}
                    // autoFocus={focus === "category"}
                    // onFocus={() => {
                    //   handleFocus("category");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  data-color-mode="light"
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <InputLabel style={{ marginTop: '-5%' }}>Descripción</InputLabel>
                  <MDEditor
                    value={description}
                    onChange={setDescription}
                    preview="edit"
                    hideToolbar={false}
                    // autoFocus={focus === "description"}
                    // onFocus={() => {
                    //   handleFocus("description");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                  {/* <ReactQuill
                  style={{
                    marginBottom: 10,
                    marginTop: 15,
                    maxWidth: 1100,
                    width: "100%",

                    borderRadius: 30,
                  }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ align: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                    ],
                  }}
                  value={description}
                  onChange={handleEditorChange}
                  placeholder="Escribe la descripción aquí..."
                  // autoFocus={focus === "description"}
                  onFocus={() => {
                    handleFocus("description");
                  }}
                  onBlur={() => {
                    handleBlur();
                  }}
                /> */}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    minRows={2}
                    label="Consideraciones"
                    value={considerations}
                    onChange={(e) => {
                      setConsiderations(e.target.value);
                    }}
                    // autoFocus={focus === "considerations"}
                    // onFocus={() => {
                    //   handleFocus("considerations");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                >
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Tiempo de producción"
                    value={productionTime}
                    onChange={(e) => {
                      setProductionTime(e.target.value);
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                    // autoFocus={focus === "productionTime"}
                    // onFocus={() => {
                    //   handleFocus("productionTime");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container style={{ marginTop: 20 }}>
              <Title>PVP</Title>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4} md={5}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="fromPublicPrice"
                    label="Desde"
                    name="fromPublicPrice"
                    autoComplete="fromPublicPrice"
                    value={fromPublicPrice}
                    onChange={(e) => {
                      setFromPublicPrice(e.target.value);
                    }}
                    error={
                      fromPublicPrice !== undefined && !isAValidPrice(fromPublicPrice)
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    // autoFocus={focus === "fromPublicPrice"}
                    // onFocus={() => {
                    //   handleFocus("fromPublicPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={4} md={5}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    // required
                    fullWidth
                    id="toPublicPrice"
                    label="Hasta"
                    name="toPublicPrice"
                    autoComplete="toPublicPrice"
                    value={toPublicPrice}
                    onChange={(e) => {
                      setToPublicPrice(e.target.value);
                    }}
                    error={
                      toPublicPrice !== undefined &&
                      toPublicPrice !== '' &&
                      toPublicPrice !== null &&
                      !isAValidPrice(toPublicPrice)
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    // autoFocus={focus === "toPublicPrice"}
                    // onFocus={() => {
                    //   handleFocus("toPublicPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container style={{ marginTop: 20 }}>
              <Title>PVM</Title>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4} md={5}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="fromPrixerPrice"
                    label="Desde"
                    name="fromPrixerPrice"
                    autoComplete="fromPrixerPrice"
                    value={fromPrixerPrice}
                    onChange={(e) => {
                      setFromPrixerPrice(e.target.value);
                    }}
                    error={
                      fromPrixerPrice !== undefined &&
                      fromPrixerPrice !== '' &&
                      fromPrixerPrice !== null &&
                      !isAValidPrice(fromPrixerPrice)
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    // autoFocus={focus === "fromPrixerPrice"}
                    // onFocus={() => {
                    //   handleFocus("fromPrixerPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={4} md={5}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    // required
                    fullWidth
                    id="toPrixerPrice"
                    label="Hasta"
                    name="toPrixerPrice"
                    autoComplete="toPrixerPrice"
                    value={toPrixerPrice}
                    onChange={(e) => {
                      setToPrixerPrice(e.target.value);
                    }}
                    error={
                      toPrixerPrice !== undefined &&
                      toPrixerPrice !== '' &&
                      toPrixerPrice !== null &&
                      !isAValidPrice(toPrixerPrice)
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    // autoFocus={focus === "toPrixerPrice"}
                    // onFocus={() => {
                    //   handleFocus("toPrixerPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={buttonState}
              style={{ marginTop: 20 }}
            >
              Actualizar
            </Button>
          </Grid>
        </form>
        {/* </TabPanel>

        <TabPanel value={value} index={1}>
          <Variants
            product={props.product}
            activeVCrud={activeVCrud}
            setActiveVCrud={setActiveVCrud}
          />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Mockup product={props.product} />
        </TabPanel> */}
      </Grid>
      {/* <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              modifyString(a, a.target.value);
            }}
            value={videoUrl}
            label="Url"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog> */}
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
      <Snackbar
        open={loadOpen}
        autoHideDuration={1000}
        message={'No puedes colocar mas de 4 fotos'}
        className={classes.snackbar}
      />
      <Snackbar
        open={loaDOpen}
        autoHideDuration={1000}
        message={'No puedes enviar mas de 4 fotos'}
        className={classes.snackbar}
      />
      <Snackbar
        open={mustImage}
        autoHideDuration={1000}
        message={'No puedes crear un producto sin foto, agrega 1 o más'}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
