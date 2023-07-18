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
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import axios from "axios";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
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
  const [prixers, setPrixers] = useState([]);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={fixedHeightPaper}>
              {props.permissions.readMovements ? (
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
    </React.Fragment>
  );
}
