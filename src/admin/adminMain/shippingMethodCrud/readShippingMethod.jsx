import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
// import Link from '@material-ui/core/Link';
// import { makeStyles } from '@material-ui/core/styles';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../Title";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Snackbar from "@material-ui/core/Snackbar";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import validations from "../../../shoppingCart/validations";
import axios from "axios";
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Backdrop from '@material-ui/core/Backdrop';
import Checkbox from "@material-ui/core/Checkbox";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

import Fab from "@material-ui/core/Fab";
// import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "none",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
}));

export default function ReadShippingMethod(props) {
  const history = useHistory();
  const location = useLocation();

  const classes = useStyles();
  const [activeCrud, setActiveCrud] = useState("read");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [rows, setRows] = useState();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(true);
  const [name, setName] = useState();
  const [price, setPrice] = useState();
  const [shippingMethod, setShippingMethod] = useState();

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleAction = (action) => {
    history.push({ pathname: "/admin/shipping-method/" + action });
  };

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        );
  }, [location.pathname]);

  const readMethods = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/shipping-method/read-all";
    axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setRows(response.data.shippingMethods);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    readMethods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      active: active,
      name: name,
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem("adminToken")),
      price: price,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/shipping-method/create";
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    });
    if (response.data.success === false) {
      setLoading(false);
      setErrorMessage(response.data.message);
      setSnackBarError(true);
    } else {
      setErrorMessage("Registro del método de envío exitoso.");
      setSnackBarError(true);
      setActive(true);
      setName("");
      setPrice("");
      history.push({ pathname: "/admin/shipping-method/read" });
      readMethods();
      setLoading(false);
    }
  };

  const handleActive = (shippingMethod, action) => {
    setShippingMethod(shippingMethod);
    setName(shippingMethod.name);
    setPrice(shippingMethod.price);
    setActive(shippingMethod.active);
    history.push("/admin/shipping-method/" + action + "/" + shippingMethod._id);
  };

  const updateShippingMethod = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
    } else {
      setLoading(true);

      const data = {
        id: shippingMethod._id,
        active: active,
        name: name,
        price: price,
        adminToken: localStorage.getItem("adminTokenV"),
      };

      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/shipping-method/update";
      const response = await axios.put(base_url, data, {
        withCredentials: true,
      });
      if (response.data.success === false) {
        setLoading(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Actualización de método de envío exitosa.");
        setSnackBarError(true);
        setActive(true);
        setName("");
        setPrice("");
        history.push("/admin/shipping-method/read");
        readMethods();
        setLoading(false);
      }
    }
  };
  const deleteMethod = async (id) => {
    setLoading(true);

    const URI =
      process.env.REACT_APP_BACKEND_URL + "/shipping-method/delete/" + id;
    const body = { adminToken: localStorage.getItem("adminTokenV") };
    await axios.put(URI, body, { withCredentials: true });
    setErrorMessage("Método de envío eliminado exitosamente.");
    setSnackBarError(true);
    readMethods();
    setLoading(false);
  };

  return (
    <React.Fragment>
      <Backdrop
        className={classes.backdrop}
        open={loading}
        transitionDuration={1000}
      >
        <CircularProgress />
      </Backdrop>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: 10, marginTop: 15 }}>
          <Fab
            color="default"
            aria-label="edit"
            style={{ marginRight: 10 }}
            onClick={() => {
              handleAction("read");
            }}
          >
            <ViewListIcon />
          </Fab>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              handleAction("create");
            }}
          >
            <AddIcon />
          </Fab>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={fixedHeightPaper}>
              {activeCrud === "read" ? (
                <>
                  <Title>Métodos de envío</Title>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell align="center">Activo</TableCell>
                        <TableCell align="center">Nombre</TableCell>
                        <TableCell align="center">Costo</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows &&
                        rows.map((row) => (
                          <TableRow key={row._id}>
                            <TableCell>
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginRight: 100,
                                }}
                                aria-label="edit"
                                onClick={(e) => {
                                  handleActive(row, "update");
                                }}
                              >
                                <EditIcon />
                              </Fab>
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                disabled
                                checked={row.active}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">${row.price}</TableCell>
                            <TableCell>
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginLeft: 100,
                                }}
                                aria-label="edit"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteMethod(row._id);
                                }}
                              >
                                <DeleteIcon />
                              </Fab>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </>
              ) : activeCrud === "create" ? (
                <>
                  {" "}
                  <Title>Agregar método de envío</Title>
                  <form
                    className={classes.form}
                    noValidate
                    onSubmit={handleSubmit}
                  >
                    <Grid container spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid container xs={6}>
                            <Grid item xs={12}>
                              <Checkbox
                                checked={active}
                                color="primary"
                                inputProps={{
                                  "aria-label": "secondary checkbox",
                                }}
                                onChange={() => {
                                  setActive(!active);
                                }}
                              />
                              Habilitado
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <TextField
                            variant="outlined"
                            required
                            fullWidth
                            display="inline"
                            label="Nombre"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={5}>
                          <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                            xs={6}
                            fullWidth={true}
                            required
                          >
                            <TextField
                              variant="outlined"
                              fullWidth
                              multiline
                              required
                              label="Precio aproximado"
                              value={price}
                              onChange={(e) => {
                                setPrice(e.target.value);
                              }}
                              error={
                                price !== undefined &&
                                !validations.isAValidPrice(price)
                              }
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={
                          !name || !price || !validations.isAValidPrice(price)
                        }
                        style={{ marginTop: 20 }}
                      >
                        Crear
                      </Button>
                    </Grid>
                  </form>
                </>
              ) : (
                <>
                  <Title>Actualización de Método de envío</Title>
                  <form
                    className={classes.form}
                    noValidate
                    onSubmit={updateShippingMethod}
                  >
                    <Grid container spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Grid container xs={6}>
                            <Grid item xs={12}>
                              <Checkbox
                                checked={active}
                                color="primary"
                                inputProps={{
                                  "aria-label": "secondary checkbox",
                                }}
                                onChange={() => {
                                  setActive(!active);
                                }}
                              />
                              Habilitado
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <FormControl
                            variant="outlined"
                            xs={12}
                            fullWidth={true}
                          >
                            <TextField
                              variant="outlined"
                              required
                              fullWidth
                              display="inline"
                              //   id="name"
                              label="Nombre"
                              //   name="name"
                              //   autoComplete="name"
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value);
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={5}>
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
                              label="Costo"
                              value={price}
                              onChange={(e) => {
                                setPrice(e.target.value);
                              }}
                              // type={"Number"}
                              error={
                                price !== undefined &&
                                !validations.isAValidPrice(price)
                              }
                            />
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        style={{ marginTop: 20 }}
                        disabled={
                          !name || !price || !validations.isAValidPrice(price)
                        }
                      >
                        Actualizar
                      </Button>
                    </Grid>
                  </form>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
