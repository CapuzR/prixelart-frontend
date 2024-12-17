import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
import FormControl from "@material-ui/core/FormControl";
import Snackbar from "@material-ui/core/Snackbar";
import { Backdrop, Button } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import MovOrder from "./movementForOrder";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "none",
    flexDirection: "column",
    marginLeft: 30,
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function ReadMovements(props) {
  const history = useHistory();
  const location = useLocation();

  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [rows, setRows] = useState();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState();
  const [prixersNames, setPrixersNames] = useState([]);
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [orderId, setOrderId] = useState();
  const [prixers, setPrixers] = useState();
  const [orgs, setOrgs] = useState([]);
  const [selectedPrixer, setSelectedPrixer] = useState();
  const [type, setType] = useState();

  const totalMovements = rows?.length;
  const itemsPerPage = 20;
  const noOfPages = Math.ceil(totalMovements / itemsPerPage);
  const [pageNumber, setPageNumber] = useState(1);
  const itemsToSkip = (pageNumber - 1) * itemsPerPage;
  const rowsv2 = rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const anchorRef = React.useRef(null);

  const handleClick = (event) => {
    setAnchorEl(true);
  };

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
        const sortedMov = response.data.movements.sort(function (a, b) {
          if (a.createdOn < b.createdOn) {
            return 1;
          }
          if (a.createdOn > b.createdOn) {
            return -1;
          }
          return 0;
        });
        setRows(sortedMov);
        setMovements(sortedMov);
        getPrixersNames(response.data.movements);
      })
      .catch((error) => {
        console.log(error);
        setSnackBarError(true);
        setErrorMessage(error);
      });
  };

  const readPrixers = async () => {
    try {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

      const response = await axios.get(base_url);
      setPrixers(response.data.prixers);
    } catch (error) {
      console.log(error);
    }
  };

  const getORGs = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/organization/read-all-full";
    await axios
      .get(base_url)
      .then((response) => {
        setOrgs(response.data.organizations);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    setLoading(true);
    readMovements();
    readPrixers();
    getORGs();
    setLoading(false);
  }, []);

  const getUsername = (fullname) => {
    const name = fullname?.split(" ");
    let selected;

    if (name && name?.length === 2) {
      selected = orgs.find(
        (p) => p?.firstName === name[0].trim() && p?.lastName === name[1].trim()
      );
      if (selected === undefined) {
        selected = prixers?.find(
          (p) =>
            p?.firstName === name[0].trim() && p?.lastName === name[1].trim()
        );
      }
    } else if (name && name?.length === 3) {
      selected = orgs.find(
        (p) =>
          p.firstName === name[0].trim() &&
          p.lastName === name[1].trim() + " " + name[2].trim()
      );
      if (selected === undefined) {
        selected = prixers?.find(
          (p) =>
            p.firstName === name[0].trim() &&
            p.lastName === name[1].trim() + " " + name[2].trim()
        );
      }
    }

    setSelectedPrixer(selected?.username);
    return selected;
  };

  const getPrixersNames = (list) => {
    let prix = [];
    list.map((mov) => {
      if (prix[0] === null) {
        prix = [mov.destinatary];
      } else if (prix.includes(mov.destinatary)) {
        return;
      } else {
        prix.push(mov.destinatary);
      }
    });
    setPrixersNames(prix);
  };

  const handleChange = (event) => {
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

  const handleClose = () => {
    setOpenOrderDetails(false);
    setSelectedPrixer(undefined);
    setAnchorEl(null);
    setSnackBarError(false);
  };

  const deleteMov = async (mov) => {
    setLoading(true);

    const nick = getUsername(mov.destinatary)?.username;

    if (nick !== undefined) {
      const URI =
        process.env.REACT_APP_BACKEND_URL + "/movement/delete/" + mov._id;
      const body = {
        adminToken: localStorage.getItem("adminTokenV"),
        movement: mov._id,
        user: nick,
      };
      await axios.put(URI, body, { withCredentials: true });
      setErrorMessage("Movimiento eliminado exitosamente.");
      setSnackBarError(true);
      readMovements();
    } else {
      setErrorMessage("Usuario no encontrado.");
      setSnackBarError(true);
    }
    setLoading(false);
  };

  return (
    <React.Fragment>
      <Backdrop
        className={classes.backdrop}
        open={loading}
        transitionDuration={500}
      >
        <CircularProgress />
      </Backdrop>
      <Grid container>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            {props?.permissions?.readMovements ? (
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
                            {prixersNames?.length > 0 &&
                              prixersNames?.map((prixer, i) => (
                                <MenuItem key={i} value={prixer}>
                                  {prixer}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">Descripción</TableCell>
                      <TableCell align="center">Monto</TableCell>
                      <TableCell align="center">Fecha de creación</TableCell>
                      <TableCell align="center">Creado por</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows &&
                      rowsv2.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell align="center">{row._id}</TableCell>
                          <TableCell align="center">
                            {row.date &&
                              new Date(row?.date)?.toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            {row.destinatary}
                          </TableCell>

                          <TableCell align="center">
                            {row.description?.includes("#") ? (
                              <div>
                                <Typography>
                                  {row.description?.split("#")?.[0]}
                                </Typography>
                                <Button
                                  onClick={() => {
                                    setOpenOrderDetails(true);
                                    setOrderId(row.description.split("#")?.[1]);
                                    getUsername(row.destinatary);
                                    handleClick();
                                    setType(row.type);
                                  }}
                                >
                                  {row.description.split("#")?.[1]}
                                </Button>
                              </div>
                            ) : (
                              <Typography>{row.description}</Typography>
                            )}
                          </TableCell>

                          <TableCell align="center">
                            {row.type === "Retiro" && "-"}$
                            {row.value
                              .toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                              .replace("-", "")}
                          </TableCell>
                          <TableCell align="center">
                            {new Date(row.createdOn).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">{row.createdBy}</TableCell>
                          <TableCell align="center">
                            {props.permissions?.deletePaymentMethod && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginLeft: 100,
                                }}
                                aria-label="edit"
                                onClick={() => {
                                  deleteMov(row);
                                }}
                              >
                                <DeleteIcon />
                              </Fab>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                <Box
                  style={{
                    display: "flex",
                    alignSelf: "center",
                    paddingTop: 5,
                    marginBottom: 4,
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 80,
                      marginRight: 5,
                      backgroundColor: "rgb(238, 238, 238)",
                      borderRadius: 4,
                    }}
                  >
                    Página {pageNumber}
                  </div>
                  {pageNumber + 1 <= noOfPages && (
                    <Button
                      style={{ minWidth: 30, marginRight: 5 }}
                      onClick={() => {
                        setPageNumber(pageNumber + 1);
                      }}
                    >
                      {pageNumber + 1}
                    </Button>
                  )}

                  {pageNumber + 2 <= noOfPages && (
                    <Button
                      style={{ minWidth: 30, marginRight: 5 }}
                      onClick={() => {
                        setPageNumber(pageNumber + 2);
                      }}
                    >
                      {pageNumber + 2}
                    </Button>
                  )}
                  {pageNumber + 3 <= noOfPages && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 5,
                      }}
                    >
                      ...
                    </div>
                  )}
                  {pageNumber + 3 <= noOfPages && (
                    <Button
                      style={{ minWidth: 30, marginRight: 5 }}
                      onClick={() => {
                        setPageNumber(noOfPages);
                      }}
                    >
                      {noOfPages}
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Typography
                variant="h3"
                color="secondary"
                align="center"
                style={{ paddingTop: 30, marginTop: 60, marginBottom: 80 }}
              >
                No tienes permiso para entrar a esta área.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Modal open={openOrderDetails} onClose={handleClose}>
        <MovOrder
          orderId={orderId}
          selectedPrixer={selectedPrixer}
          type={type}
          handleClose={handleClose}
        />
      </Modal>
      <Snackbar
        onClose={handleClose}
        open={snackBarError}
        autoHideDuration={5000}
        message={errorMessage}
        className={classes.snackbar}
      />{" "}
    </React.Fragment>
  );
}
