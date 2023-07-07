import React from "react";
import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

import Title from "../../adminMain/Title";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import validations from "../../../shoppingCart/validations";
import Checkbox from "@material-ui/core/Checkbox";
import Backdrop from "@material-ui/core/Backdrop";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Typography } from "@material-ui/core";
import { CheckBox } from "@material-ui/icons";
import { nanoid } from "nanoid";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  loaderImage: {
    width: "120%",
    border: "2px",
    height: "30vh",
    borderStyle: "groove",
    borderColor: "#d33f49",
    backgroundColor: "#ededed",
    display: "flex",
    flexDirection: "row",
  },
  imageLoad: {
    maxWidth: "100%",
    maxHeight: "100%",
    padding: "5px",
    marginTop: "5px",
  },
  formHead: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  buttonImgLoader: {
    cursor: "pointer",
    padding: "5px",
  },
  buttonEdit: {
    cursor: "pointer",
    padding: "5px",
  },
}));

export default function CreateDiscount() {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [active, setActive] = useState(true);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [type, setType] = useState();
  const [value, setValue] = useState();
  const [appliedProducts, setAppliedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [products, setProducts] = useState();
  const discountTypes = ["Porcentaje", "Monto"];
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name && !description && !type && !value) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        _id: nanoid(6),
        name: name,
        active: active,
        description: description,
        type: type,
        value: value.replace(/[,]/gi, "."),
        appliedProducts: appliedProducts,
      };
      const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/create";
      const response = await axios.post(base_url, data, {
        adminToken: localStorage.getItem("adminTokenV"),
      });
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Creación de descuento exitoso.");
        setSnackBarError(true);
        setActive(false);
        setName();
        setDescription();
        setType();
        setValue();
        setAppliedProducts([]);
        history.push("/admin/product/read");
      }
    }
  };

  const getProducts = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-allv1";
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
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

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Title>Crear Descuento</Title>
      <form
        className={classes.form}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Checkbox
              checked={active}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                active ? setActive(false) : setActive(true);
              }}
            />
            Habilitado
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
                label="Nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
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
          <Grid item xs={12} md={3} style={{ marginTop: "-75px" }}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              <InputLabel>Tipo</InputLabel>
              <Select
                input={<OutlinedInput />}
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                {discountTypes &&
                  discountTypes.map((type) => (
                    <MenuItem value={type}>{type}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={3}
            style={{ marginTop: "-75px", width: "50%" }}
          >
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              {type === "Monto" ? (
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  type="number"
                  label="Valor"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  error={
                    value !== undefined && !validations.isAValidPrice(value)
                  }
                />
              ) : (
                type === "Porcentaje" && (
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">%</InputAdornment>
                      ),
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
                    error={
                      value !== undefined && !validations.isAValidPrice(value)
                    }
                  />
                )
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography color="primary">Aplicado a:</Typography>
          </Grid>
          <Grid item xs={12}>
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
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
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => {
                    if (appliedProducts[0] === undefined) {
                      setAppliedProducts([product.name]);
                    } else if (appliedProducts.includes(product.name)) {
                      setAppliedProducts(
                        appliedProducts.filter((item) => item !== product.name)
                      );
                    } else {
                      setAppliedProducts([...appliedProducts, product.name]);
                    }
                  }}
                />
                {product.name}
              </Grid>
            ))}
        </Grid>
        <Grid container spacing={2}></Grid>
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
