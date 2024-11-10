import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import Title from '../Title';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FormControl from '@material-ui/core/FormControl';
import clsx from 'clsx';
import validations from '../../../consumer/checkout/validations';
import Checkbox from '@material-ui/core/Checkbox';
import Backdrop from '@material-ui/core/Backdrop';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Typography } from '@material-ui/core';
import { nanoid } from 'nanoid';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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
  margin: {
    marginBottom: 10,
  },
}));

export default function UpdateSurcharge(props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [active, setActive] = useState(props.surcharge.active);
  const [name, setName] = useState(props.surcharge.name || undefined);
  const [description, setDescription] = useState(props.surcharge.description || undefined);
  const [type, setType] = useState(props.surcharge.type || undefined);
  const [value, setValue] = useState(props.surcharge.value || undefined);
  const [appliedProducts, setAppliedProducts] = useState(props.surcharge.appliedProducts || []);
  const [appliedUsers, setAppliedUsers] = useState(props.surcharge.appliedUsers || []);
  const [considerations, setConsiderations] = useState({
    artista: { type: type, value: value },
    corporativo: { type: type, value: value },
    da: { type: type, value: value },
    prixer: { type: type, value: value },
  });

  const [appliedPercentage, setAppliedPercentage] = useState('ownerComission');
  const [owners, setOwners] = useState(props.surcharge.owners || []);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [products, setProducts] = useState();
  const discountTypes = ['Porcentaje', 'Monto'];

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleConsiderations = (client, type, value) => {
    if (type === 'type') {
      setConsiderations((prevState) => {
        const updatedClient = {
          ...prevState[client],
          type: value,
        };
        return {
          ...prevState,
          [client]: updatedClient,
        };
      });
    } else {
      setConsiderations((prevState) => {
        const updatedClient = {
          ...prevState[client],
          value: Number(value),
        };
        return {
          ...prevState,
          [client]: updatedClient,
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name && !type && !value && !appliedPercentage) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        surchargeId: nanoid(6),
        _id: props.surcharge._id,
        name: name,
        active: active,
        description: description,
        type: type,
        value: value,
        appliedProducts: appliedProducts,
        appliedUsers: appliedUsers,
        appliedPercentage: appliedPercentage,
        considerations: considerations,
        adminToken: localStorage.getItem('adminTokenV'),
      };
      const base_url = process.env.REACT_APP_BACKEND_URL + '/surcharge/update';
      const response = await axios.put(base_url, data);
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage('Actualización de recargo exitoso.');
        setSnackBarError(true);
        setActive(false);
        setName();
        setDescription();
        setType();
        setValue();
        setAppliedProducts([]);
        history.push('/admin/product/read');
      }
    }
  };

  const getProducts = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + '/product/read-allv1';
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

  const getOwnersAndPrixers = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + '/prixer/getOwnersAndPrixers';
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem('adminTokenV') },
        { withCredentials: true }
      )
      .then((response) => {
        setOwners(response.data.users);
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  useEffect(() => {
    getOwnersAndPrixers();
    getProducts();
  }, []);

  const changeAppliedUsers = (e) => {
    setAppliedUsers(e.target.value);
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Title>Editar Recargo</Title>
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
        <div style={{ display: 'flex', marginTop: 10, marginBottom: 20 }}>
          <Grid style={{ width: '50%', marginRight: 10 }}>
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
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
              <Typography>PVP:</Typography>
              <FormControl
                variant="outlined"
                fullWidth={true}
                required
                style={{ width: '50%', marginRight: 10, marginLeft: 10 }}
              >
                <InputLabel>Tipo</InputLabel>
                <Select
                  style={{ width: '100%' }}
                  input={<OutlinedInput />}
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                >
                  {discountTypes &&
                    discountTypes.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl style={{ width: '50%' }} variant="outlined" xs={12} fullWidth={true}>
                {type === 'Monto' ? (
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    type="number"
                    label="Valor"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    error={value !== undefined && !validations.isAValidPrice(value)}
                  />
                ) : (
                  type === 'Porcentaje' && (
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">%</InputAdornment>,
                        inputProps: { min: 1, max: 100 },
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      label="Valor"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                      }}
                      error={value !== undefined && !validations.isAValidPrice(value)}
                    />
                  )
                )}
              </FormControl>
            </div>
            <Accordion style={{ marginTop: 20 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <FormControlLabel
                  onClick={(event) => {
                    event.stopPropagation();
                    setConsiderations((prev) => {
                      const updatedConsiderations = { ...prev };
                      Object.keys(updatedConsiderations).forEach((client) => {
                        updatedConsiderations[client] = {
                          ...updatedConsiderations[client],
                          type: type,
                          value: Number(value),
                        };
                      });
                      return updatedConsiderations;
                    });
                  }}
                  control={
                    <Checkbox
                      color="primary"
                      checked={
                        Object.values(considerations).every((client) => client.value === value)
                          ? true
                          : false
                      }
                    />
                  }
                  label={'Ajustes'}
                  style={{ color: '#404e5c' }}
                />
              </AccordionSummary>
              <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                  }}
                >
                  <Typography style={{ width: '40%' }}>Artista:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: '30%', marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: '100%' }}
                      input={<OutlinedInput />}
                      value={considerations.artista.type}
                      onChange={(e) => {
                        handleConsiderations('artista', 'type', e.target.value);
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: '30%' }} variant="outlined" xs={12} fullWidth={true}>
                    {considerations.artista.type === 'Monto' ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={considerations.artista.value}
                        onChange={(e) => {
                          handleConsiderations('artista', 'value', e.target.value);
                        }}
                        error={value !== undefined && !validations.isAValidPrice(value)}
                      />
                    ) : (
                      considerations.artista.type === 'Porcentaje' && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            inputProps: {
                              min: 1,
                              max: value,
                            },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          label="Valor"
                          value={considerations.artista.value}
                          onChange={(e) => {
                            handleConsiderations('artista', 'value', e.target.value);
                          }}
                          error={value !== undefined && !validations.isAValidPrice(value)}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                  }}
                >
                  <Typography style={{ width: '40%' }}>Corporativo:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: '30%', marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: '100%' }}
                      input={<OutlinedInput />}
                      value={considerations.corporativo.type}
                      onChange={(e) => {
                        handleConsiderations('corporativo', 'type', e.target.value);
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: '30%' }} variant="outlined" xs={12} fullWidth={true}>
                    {considerations.corporativo.type === 'Monto' ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={considerations.corporativo.value}
                        onChange={(e) => {
                          handleConsiderations('corporativo', 'value', e.target.value);
                        }}
                        error={value !== undefined && !validations.isAValidPrice(value)}
                      />
                    ) : (
                      considerations.corporativo.type === 'Porcentaje' && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            inputProps: { min: 1, max: value },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          label="Valor"
                          value={considerations.corporativo.value}
                          onChange={(e) => {
                            handleConsiderations('corporativo', 'value', e.target.value);
                          }}
                          error={value !== undefined && !validations.isAValidPrice(value)}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                  }}
                >
                  <Typography style={{ width: '40%' }}>DAs:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: '30%', marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: '100%' }}
                      input={<OutlinedInput />}
                      value={considerations.da.type}
                      onChange={(e) => {
                        handleConsiderations('da', 'type', e.target.value);
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: '30%' }} variant="outlined" xs={12} fullWidth={true}>
                    {considerations.da.type === 'Monto' ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={considerations.da.value}
                        onChange={(e) => {
                          handleConsiderations('da', 'value', e.target.value);
                        }}
                        error={value !== undefined && !validations.isAValidPrice(value)}
                      />
                    ) : (
                      considerations.da.type === 'Porcentaje' && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            inputProps: { min: 1, max: value },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          label="Valor"
                          value={considerations.da.value}
                          onChange={(e) => {
                            handleConsiderations('da', 'value', e.target.value);
                          }}
                          error={value !== undefined && !validations.isAValidPrice(value)}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                  }}
                >
                  <Typography style={{ width: '40%' }}>Prixer:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: '30%', marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: '100%' }}
                      input={<OutlinedInput />}
                      value={considerations.prixer.type}
                      onChange={(e) => {
                        handleConsiderations('prixer', 'type', e.target.value);
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: '30%' }} variant="outlined" xs={12} fullWidth={true}>
                    {considerations.prixer.type === 'Monto' ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={considerations.prixer.value}
                        onChange={(e) => {
                          handleConsiderations('prixer', 'value', e.target.value);
                        }}
                        error={value !== undefined && !validations.isAValidPrice(value)}
                      />
                    ) : (
                      considerations.prixer.type === 'Porcentaje' && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">%</InputAdornment>,
                            inputProps: { min: 1, max: value },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          label="Valor"
                          value={considerations.prixer.value}
                          onChange={(e) => {
                            handleConsiderations('prixer', 'value', e.target.value);
                          }}
                          error={value !== undefined && !validations.isAValidPrice(value)}
                        />
                      )
                    )}
                  </FormControl>
                </div>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid container style={{ width: '50%' }}>
            <Grid item xs={12}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={5}
                  label="Descripción"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ marginTop: 10 }}>
              <FormControl variant="outlined" xs={12} fullWidth={true}>
                <InputLabel>Prixer / Owner:</InputLabel>
                <Select
                  fullWidth={true}
                  input={<OutlinedInput />}
                  value={appliedUsers}
                  multiple
                  onChange={changeAppliedUsers}
                >
                  {owners && owners.map((o) => <MenuItem value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>
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
          Actualizar
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
