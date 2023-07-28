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
import Menu from "@material-ui/core/Menu";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Popper from "@material-ui/core/Popper";
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Backdrop from '@material-ui/core/Backdrop';
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
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [rows, setRows] = useState();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState();
  const [prixersNames, setPrixersNames] = useState([]);
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [orderId, setOrderId] = useState();
  const [prixers, setPrixers] = useState();
  const [selectedPrixer, setSelectedPrixer] = useState();

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
        setRows(response.data.movements);
        setMovements(response.data.movements);
        getPrixersNames(response.data.movements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const readPrixers = async () => {
    try {
      // setLoading(true);
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

      const response = await axios.get(base_url);
      setPrixers(response.data.prixers);
      // setBackdrop(false);
      // setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    readMovements();
    readPrixers();
  }, []);

  const getUsername = (fullname) => {
    const prixer = fullname.split(" ");
    let selected;
    if (prixer.length === 2) {
      selected = prixers?.find(
        (p) => p.firstName === prixer[0] && p.lastName === prixer[1]
      );
    } else if (prixer.length === 3) {
      selected = prixers?.find(
        (p) =>
          p.firstName === prixer[0] &&
          p.lastName === prixer[1] + " " + prixer[2]
      );
    }
    setSelectedPrixer(selected?.username);
  };

  const getPrixersNames = (list) => {
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
    // handleToggle();
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
        <Grid container spacing={3}>
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
                              {row.description.includes("#") ? (
                                <div>
                                  <Typography>
                                    {row.description.slice(0, 20)}
                                  </Typography>
                                  <Button
                                    onClick={() => {
                                      setOpenOrderDetails(true);
                                      setOrderId(row.description.slice(22));
                                      getUsername(row.destinatary);
                                      handleClick();
                                    }}
                                  >
                                    {row.description.slice(21)}
                                  </Button>
                                </div>
                              ) : (
                                <Typography>{row.description}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center">
                              {row.type === "Retiro" && "-"}$
                              {row.value.toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell align="center">
                              {row.createdOn.substring(0, 10)}
                            </TableCell>
                            <TableCell align="center">
                              {row.createdBy}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
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
      </div>
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Popper
          open={openOrderDetails}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MovOrder
                  orderId={orderId}
                  selectedPrixer={selectedPrixer}
                  handleClose={handleClose}
                />
              </ClickAwayListener>
            </Grow>
          )}
        </Popper>
      </Menu>
    </React.Fragment>
  );
}
