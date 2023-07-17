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
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

// import CircularProgress from '@material-ui/core/CircularProgress';
// import Backdrop from '@material-ui/core/Backdrop';
import Checkbox from "@material-ui/core/Checkbox";

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function ReadMovements(props) {
  const history = useHistory();
  const location = useLocation();

  const classes = useStyles();
  // const [activeCrud, setActiveCrud] = useState("read");

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [rows, setRows] = useState();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [active, setActive] = useState(true);
  // const [name, setName] = useState();
  // const [price, setPrice] = useState();
  const [filter, setFilter] = useState();
  const [prixers, setPrixers] = useState([]);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  // useEffect(() => {
  //   location.pathname.split("/").length === 5
  //     ? setActiveCrud(
  //         location.pathname.split("/")[location.pathname.split("/").length - 2]
  //       )
  //     : location.pathname.split("/").length === 4 &&
  //       setActiveCrud(
  //         location.pathname.split("/")[location.pathname.split("/").length - 1]
  //       );
  // }, [location.pathname]);

  const readMovements = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/movement/readAllMovements";
    axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setRows(response.data.movements);
        setMovements(response.data.movements);
        getPrixers(response.data.movements);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    readMovements();
  }, []);

  const getPrixers = (list) => {
    let prix = [];
    list.map((mov) => {
      if (prix === []) {
        prix = [mov.destinatary];
      } else if (prix.includes(mov.destinatary)) {
        return;
      } else {
        prix.push(mov.destinatary);
      }
    });
    setPrixers(prix);
  };

  const handleChange = (event) => {
    console.log(event.target.value);
    setFilter(event.target.value);
    filterMovements(event.target.value);
  };

  const filterMovements = (filter) => {
    setLoading(true);
    if (filter === undefined) {
      setRows(movements);
    } else {
      let movementsv2 = movements.filter((row) => row.destinatary === filter);
      setRows(movementsv2);
    }
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
          {/* <Fab
            color="default"
            aria-label="edit"
            style={{ marginRight: 10 }}
            onClick={() => {
              handleAction("read");
            }}
          >
            <ViewListIcon />
          </Fab>
          {props.permissions?.createShippingMethod && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                handleAction("create");
              }}
            >
              <AddIcon />
            </Fab>
          )} */}
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={fixedHeightPaper}>
              {/* {activeCrud === "read" ? ( */}
              <>
                <Title>Movimientos</Title>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">ID</TableCell>
                      <TableCell align="center">Fecha efectiva</TableCell>

                      <TableCell align="center">
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Destinatario
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filter}
                            onChange={handleChange}
                          >
                            <MenuItem key={"none"} value={undefined}>
                              {""}
                            </MenuItem>
                            {prixers?.length > 0 &&
                              prixers?.map((prixer, i) => (
                                <MenuItem key={i} value={prixer}>
                                  {prixer}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">Descripción</TableCell>
                      <TableCell align="center">Monto</TableCell>
                      <TableCell align="center">Fecha</TableCell>
                      <TableCell align="center">Creado por</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows &&
                      rows.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell align="center">{row._id}</TableCell>
                          <TableCell align="center">
                            {row?.date?.substring(0, 10) ||
                              row.createdOn.substring(0, 10)}
                          </TableCell>
                          <TableCell align="center">
                            {row.destinatary}
                          </TableCell>

                          <TableCell align="center">
                            {row.description}
                          </TableCell>
                          <TableCell align="center">
                            {row.type === "Retiro" && "-"}${row.value}
                          </TableCell>
                          <TableCell align="center">
                            {row.createdOn.substring(0, 10)}
                          </TableCell>
                          <TableCell align="center">{row.createdBy}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </>
              {/* ) : activeCrud === "create" ? (
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
              )} */}
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
