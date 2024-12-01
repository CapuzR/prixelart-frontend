import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';

import Title from '../Title';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import FormControl from '@mui/material/FormControl';
import clsx from 'clsx';
import { isAValidName, isAValidCi, isAValidPhoneNum, isAValidEmail } from 'utils/validations';
import Checkbox from '@mui/material/Checkbox';
import Backdrop from '@mui/material/Backdrop';
import InputAdornment from '@mui/material/InputAdornment';
import { Typography } from '@mui/material';
import { nanoid } from 'nanoid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import IconButton from '@mui/material/IconButton';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
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
    maxWidth: '100%',
    maxHeight: '100%',
    padding: '5px',
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
}));

export default function CreateCategory() {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [active, setActive] = useState(true);
  const [name, setName] = useState();
  const [appliedProducts, setAppliedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [products, setProducts] = useState();
  const [loadIcon, setLoadIcon] = useState({
    icon: [],
    filename: '',
  });
  const [loadImage, setLoadImage] = useState({
    image: [],
    filename: '',
  });
  const [image, setImage] = useState();
  const [icon, setIcon] = useState();

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        name: name,
        active: active,
        // appliedProducts: appliedProducts,
      };
      const base_url = import.meta.env.VITE_BACKEND_URL + '/product/create-category';
      const response = await axios.post(base_url, data);
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage('¡Categoría creada exitosamente!');
        setSnackBarError(true);
        setActive(false);
        setName();
        setAppliedProducts([]);
        history.push('/product/read');
      }
    }
  };

  const getProducts = async () => {
    setLoading(true);
    const base_url = import.meta.env.VITE_BACKEND_URL + '/product/read-allv1';
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem('adminTokenV') },
        { withCredentials: true }
      )
      .then((response) => {
        setProducts(response.data.products);
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const loadImg = async (e, type) => {
    e.preventDefault();

    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);

    if (type === 'icon') {
      setLoadIcon({ loader: resizedString, filename: file.name });
    } else {
      setLoadImage({ loader: resizedString, filename: file.name });
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Title>Crear Categoría</Title>
      <form
        style={{
          height: 'auto',
        }}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid>
          <Checkbox
            checked={active}
            color="primary"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
            onChange={() => {
              active ? setActive(false) : setActive(true);
            }}
          />
          Habilitado
        </Grid>
        <Grid container style={{ display: 'flex', marginTop: 10, marginBottom: 20 }}>
          <Grid md={4}>
            <FormControl className={classes.margin} variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FormControl>
          </Grid>
          <Grid
            md={4}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {icon !== undefined && (
              <div
                style={{
                  width: '180px',
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
                    style={{ color: '#d33f49' }}
                    onClick={() => {
                      setIcon();
                    }}
                  >
                    <HighlightOffOutlinedIcon />
                  </IconButton>
                </div>

                <img
                  style={{
                    width: '100%',
                    // height: "200px",
                    objectFit: 'contain',
                  }}
                  src={img}
                  alt="+"
                />
              </div>
            )}
            <Button
              variant="contained"
              component="label"
              style={{ textTransform: 'none', width: 'fit-content' }}
            >
              Subir ícono
              <input
                name="categoryIcon"
                type="file"
                accept="image/*"
                hidden
                onChange={(a) => {
                  loadImg(a, 'icon');
                }}
              />
            </Button>
          </Grid>
          <Grid
            md={4}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              component="label"
              style={{ textTransform: 'none', width: 'fit-content' }}
            >
              Subir imagen
              <input
                name="categoryImg"
                type="file"
                accept="image/*"
                hidden
                onChange={(a) => {
                  loadImg(a, 'img');
                }}
              />
            </Button>
          </Grid>
        </Grid>
        <Divider light variant="fullWidth" />

        <Grid container spacing={2} style={{ marginTop: 20 }}>
          <Grid item xs={12}>
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
              onChange={() => {
                if (appliedProducts.length !== products.length) {
                  let v1 = [];
                  products.map((product) => v1.push(product.name));
                  setAppliedProducts(v1);
                } else if (appliedProducts.length === products.length) {
                  setAppliedProducts([]);
                }
              }}
            />
            Todos los productos
          </Grid>
          {products &&
            products.map((product) => (
              <Grid item xs={3}>
                <Checkbox
                  checked={appliedProducts.includes(product.name)}
                  color="primary"
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                  onChange={() => {
                    if (appliedProducts[0] === undefined) {
                      setAppliedProducts([product.name]);
                    } else if (appliedProducts.includes(product.name)) {
                      setAppliedProducts(appliedProducts.filter((item) => item !== product.name));
                    } else {
                      setAppliedProducts([...appliedProducts, product.name]);
                    }
                  }}
                />
                {product.name}
              </Grid>
            ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={buttonState}
          style={{ marginTop: 20 }}
        >
          Crear
        </Button>
      </form>

      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
