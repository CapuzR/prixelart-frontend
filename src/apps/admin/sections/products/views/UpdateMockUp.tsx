import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Backdrop from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';

import DeleteIcon from '@mui/icons-material/Delete';

import WarpImage from '../components/WarpImage';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    height: 550,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  loaderImage: {
    width: '120%',
    border: '2px',
    height: '30vh',
    borderStyle: 'groove',
    borderColor: '#d33f49',
    backgroundColor: '#ededed',
    display: 'flex',
    flexDirection: 'row',
  },
  imageLoad: {
    width: '100%',
    height: '95%',
    padding: '15px',
    marginTop: '5px',
  },
  formHead: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  buttonImgLoader: {
    cursor: 'pointer',
    padding: '5px',
  },
  buttonEdit: {
    cursor: 'pointer',
    padding: '5px',
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    width: '100%',
  },
}));

export default function UpdateMockup(props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState();
  const [preview, setPreview] = useState(undefined);
  const [randomArt, setArt] = useState(undefined);
  const [corner, setCorner] = useState(0);
  const [distortion, setDistortion] = useState(undefined);
  const [topLeft, setTopLeft] = useState({ x: 0, y: 0 });
  const [topRight, setTopRight] = useState({ x: 0, y: 0 });
  const [bottomLeft, setBottomLeft] = useState({ x: 0, y: 0 });
  const [bottomRight, setBottomRight] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(350);
  const [height, setHeight] = useState(350);
  const [perspective, setPerspective] = useState(0);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const [selectedImg, setSelectedImg] = useState(undefined);
  const [warpPercentage, setWarpPercenteage] = useState(0);
  const [warpOrientation, setWarpOrientation] = useState('vertical');
  const [invertedWrap, setInvertedWrap] = useState(false);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleWidth = (event) => {
    setWidth(event.target.value);
  };
  const handleHeight = (event) => {
    setHeight(event.target.value);
  };

  const handlePerspective = (event) => {
    setPerspective(event.target.value);
  };

  const handleRotate = (event) => {
    setRotate(event.target.value);
  };

  const handleRotateX = (event) => {
    setRotateX(event.target.value);
  };

  const handleRotateY = (event) => {
    setRotateY(event.target.value);
  };

  const handleTranslateX = (event) => {
    setTranslateX(event.target.value);
  };
  const handleTranslateY = (event) => {
    setTranslateY(event.target.value);
  };

  const handleSkewX = (event) => {
    setSkewX(event.target.value);
  };

  const handleSkewY = (event) => {
    setSkewY(event.target.value);
  };

  const handleCorner = (event) => {
    setCorner(event.target.value);
  };

  const handleDistortion = (event) => {
    setDistortion(event.taget.value);
  };

  const handleOrientation = (event) => {
    setWarpOrientation(event.target.value);
  };

  const handleInvertedWrap = (event) => {
    setInvertedWrap(event.target.checked);
  };

  const getRandomArt = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/art/random';
    const response = await axios.get(url);
    if (response.data.arts !== null) {
      setArt(response.data.arts);
    }
  };

  //Preview de imagen antes de enviar
  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const loadImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    setImages(file);
    setPreview(resizedString);
  };

  const checkImages = async () => {
    if (props.product.mockUp) {
      const prev = props.product.mockUp;
      setPreview(prev.mockupImg);
      setTopLeft({
        x: prev.topLeft.split(' ')[0],
        y: prev.topLeft.split(' ')[1],
      });
      setTopRight({
        x: prev.topRight.split(' ')[0],
        y: prev.topRight.split(' ')[1],
      });
      setBottomLeft({
        x: prev.bottomLeft.split(' ')[0],
        y: prev.bottomLeft.split(' ')[1],
      });
      setBottomRight({
        x: prev.bottomRight.split(' ')[0],
        y: prev.bottomRight.split(' ')[1],
      });
      setWidth(Number(prev.width));
      setHeight(Number(prev.height));
      setPerspective(Number(prev.perspective));
      setSkewX(Number(prev.skewX));
      setSkewY(Number(prev.skewY));
      setTranslateX(Number(prev.translateX));
      setTranslateY(Number(prev.translateY));
      setRotateX(Number(prev.rotateX));
      setRotateY(Number(prev.rotateY));
    }
  };

  useEffect(() => {
    if (width > 0 && height > 0) {
      let calc = width / height;
      if (calc < 0.5) {
        setAspectRatio(0.5);
      } else if (calc > 0.5 && calc < 0.666) {
        setAspectRatio(0.6666666666666666);
      } else if (calc > 0.666 && calc < 1) {
        setAspectRatio(1);
      } else if (calc > 1 && calc < 1.5) {
        setAspectRatio(1.5);
      } else if (calc > 1.5 && calc < 2) {
        setAspectRatio(2);
      } else if (calc > 2) {
        setAspectRatio(3);
      }
      randomArt &&
        randomArt?.crops.map((crop) => {
          if (crop.aspect === aspectRatio) {
            setSelectedImg(crop);
          }
        });
    }
  }, [width, height]);

  useEffect(() => {
    checkImages();
    getRandomArt();
  }, []);

  const handleImageClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    handleCornerChange(offsetX, offsetY);
  };

  const handleCornerChange = (newX, newY) => {
    switch (corner) {
      case 'topLeft':
        setTopLeft({ x: newX, y: newY });
        break;
      case 'topRight':
        setTopRight({ x: newX, y: newY });
        break;
      case 'bottomLeft':
        setBottomLeft({ x: newX, y: newY });
        break;
      case 'bottomRight':
        setBottomRight({ x: newX, y: newY });
        break;
      default:
        break;
    }
  };

  const handleChangeWarpPercentage = (event, newValue) => {
    setWarpPercenteage(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const newFormData = new FormData();

    newFormData.append('adminToken', localStorage.getItem('adminTokenV'));
    if (images !== undefined) {
      newFormData.append('newMockupImg', images);
    }
    newFormData.append('mockupImg', preview);

    newFormData.append('topLeft', topLeft.x + ' ' + topLeft.y);
    newFormData.append('topRight', topRight.x + ' ' + topRight.y);
    newFormData.append('bottomLeft', bottomLeft.x + ' ' + bottomLeft.y);
    newFormData.append('bottomRight', bottomRight.x + ' ' + bottomRight.y);

    newFormData.append('width', width);
    newFormData.append('height', height);

    newFormData.append('perspective', perspective);
    newFormData.append('skewX', skewX);
    newFormData.append('skewY', skewY);
    newFormData.append('translateX', translateX);
    newFormData.append('translateY', translateY);
    newFormData.append('rotate', rotate);
    newFormData.append('rotateX', rotateX);
    newFormData.append('rotateY', rotateY);
    newFormData.append('warpPercentage', warpPercentage);
    newFormData.append('warpOrientation', warpOrientation);

    const base_url =
      import.meta.env.VITE_BACKEND_URL + `/product/updateMockup/${props.product._id}`;
    const response = await axios.put(base_url, newFormData, {
      withCredentials: true,
    });
    if (response.data.success === false) {
      setLoading(false);
      setErrorMessage(response.data.message);
      setSnackBarError(true);
    } else {
      setErrorMessage('Actualización de producto exitosa.');
      setLoading(false);
      setSnackBarError(true);
    }
  };

  const deleteMockupImg = async (e) => {
    e.preventDefault();

    setLoading(true);

    const base_url =
      import.meta.env.VITE_BACKEND_URL + `/product/updateMockup/${props.product._id}`;
    const response = await axios.put(
      base_url,
      { adminToken: localStorage.getItem('adminTokenV') },
      {
        withCredentials: true,
      }
    );
    if (response.data.success === false) {
      setLoading(false);
      setErrorMessage(response.data.message);
      setSnackBarError(true);
    } else {
      setErrorMessage('Actualización de producto exitosa.');
      setPreview(undefined);
      checkImages();
      getRandomArt();
      setLoading(false);
      setSnackBarError(true);
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Grid
        container
        spacing={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <>
          <Paper
            className={classes.paper}
            style={{
              height: '100%',
              width: '100%',
              backgroundColor: 'gainsboro',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            elevation={3}
          >
            <Grid item md={6}>
              <FormControl style={{ width: '90%' }}>
                <FormLabel component="legend">Selecciona el punto a definir:</FormLabel>
                <RadioGroup value={corner} onChange={handleCorner}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      value="topLeft"
                      control={<Radio />}
                      label="Superior izquierda"
                    />
                    <Typography variant="subtitle2" color="secondary">
                      x: {topLeft.x}, y: {topLeft.y}
                    </Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      value="topRight"
                      control={<Radio />}
                      label="Superior derecha"
                    />
                    <Typography variant="subtitle2" color="secondary">
                      x: {topRight.x}, y: {topRight.y}
                    </Typography>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      value="bottomLeft"
                      control={<Radio />}
                      label="Inferior izquierda"
                    />
                    <Typography variant="subtitle2" color="secondary">
                      x: {bottomLeft.x}, y: {bottomLeft.y}
                    </Typography>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      value="bottomRight"
                      control={<Radio />}
                      label="Inferior derecha"
                    />
                    <Typography variant="subtitle2" color="secondary">
                      x: {bottomRight.x}, y: {bottomRight.y}
                    </Typography>
                  </div>
                </RadioGroup>
                <Grid style={{ display: 'flex' }}>
                  <Grid
                    container
                    spacing={2}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      flexDirection: 'column',
                    }}
                  >
                    <Grid item md>
                      <TextField
                        label="Ancho"
                        value={width}
                        onChange={handleWidth}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item md>
                      <TextField
                        label="Alto"
                        value={height}
                        onChange={handleHeight}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Perspectiva"
                        value={perspective}
                        onChange={handlePerspective}
                        max={500}
                        min={-500}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Rotar"
                        value={rotate}
                        onChange={handleRotate}
                        max={360}
                        min={-360}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Rotación horizontal"
                        value={rotateX}
                        onChange={handleRotateX}
                        max={360}
                        min={-360}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Rotación vertical"
                        value={rotateY}
                        onChange={handleRotateY}
                        max={360}
                        min={-360}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      flexDirection: 'column',
                      marginLeft: 10,
                    }}
                  >
                    <Grid item md>
                      <TextField
                        label="Desplazamiento horizontal"
                        value={translateX}
                        onChange={handleTranslateX}
                        max={300}
                        min={-300}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Desplazamiento vertical"
                        value={translateY}
                        onChange={handleTranslateY}
                        max={300}
                        min={-300}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <TextField
                        label="Deformación 2D horizontal"
                        value={skewX}
                        onChange={handleSkewX}
                        max={300}
                        min={-300}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item md>
                      <TextField
                        label="Deformación 2D vertical"
                        value={skewY}
                        onChange={handleSkewY}
                        max={300}
                        min={-300}
                        type="number"
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item md>
                      <Typography color="secondary">Curvatura %{warpPercentage}</Typography>
                      <Slider
                        style={{ width: 200 }}
                        id="warp_percentage"
                        type="range"
                        min={-1}
                        max={1}
                        value={warpPercentage}
                        onChange={handleChangeWarpPercentage}
                        step={0.001}
                      />
                    </Grid>

                    <Grid item md>
                      <FormLabel component="legend">Orientación de la curva</FormLabel>
                      <RadioGroup value={warpOrientation} onChange={handleOrientation}>
                        <FormControlLabel value="vertical" control={<Radio />} label="Vertical" />
                        <FormControlLabel
                          value="horizontal"
                          control={<Radio />}
                          label="Horizontal"
                        />
                      </RadioGroup>
                    </Grid>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
            <Grid item md={6}>
              <div style={{ width: 210, height: 210, position: 'relative' }}>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'end',
                    position: 'absolute',
                    top: '-40px',
                    left: '0',
                  }}
                >
                  <IconButton size="small" onClick={deleteMockupImg} color="gainsboro">
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div
                  style={{
                    backgroundImage: 'url(' + preview + ')',
                    width: 210,
                    height: 210,
                    backgroundSize: 'cover',
                    borderRadius: 5,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    zIndex: '2',
                    opacity: 0.5,
                  }}
                  onClick={handleImageClick}
                />
                {randomArt && (
                  <WarpImage
                    warpPercentage={warpPercentage}
                    warpOrientation={warpOrientation}
                    invertedWrap={invertedWrap}
                    randomArt={randomArt}
                    topLeft={topLeft}
                    width={width}
                    height={height}
                    perspective={perspective}
                    rotate={rotate}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    skewX={skewX}
                    skewY={skewY}
                    translateX={translateX}
                    translateY={translateY}
                  />
                )}
              </div>
            </Grid>
          </Paper>
          {/* ) : (
            <Typography variant="h5" color="secondary" style={{ padding: 20 }}>
              No hay imagen seleccionada
            </Typography>
          )} */}

          <Button variant="contained" component="label" color="primary" style={{ marginTop: 10 }}>
            {preview ? 'Cambiar imagen' : 'Subir imagen'}
            <input
              name="newMockupImage"
              type="file"
              accept="image/*"
              hidden
              onChange={(a) => {
                a.preventDefault();
                loadImage(a);
              }}
            />
          </Button>

          {preview !== undefined && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginTop: 20 }}
              onClick={handleSubmit}
            >
              Actualizar
            </Button>
          )}
        </>
      </Grid>

      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
