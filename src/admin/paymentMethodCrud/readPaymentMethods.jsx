import React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
// import Link from '@material-ui/core/Link';
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../adminMain/Title";
import axios from "axios";
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Backdrop from '@material-ui/core/Backdrop';
import Checkbox from "@material-ui/core/Checkbox";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import Fab from "@material-ui/core/Fab";
// import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function ReadPaymentMethods(props) {
  const classes = useStyles();

  const history = useHistory();
  const [rows, setRows] = useState();
  const [loading, setLoading] = useState(false);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const readMethods = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all";
    axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    readMethods();
  }, []);

  const handleActive = (paymentMethod, action) => {
    props.setPaymentMethod(paymentMethod);
    history.push("/admin/payment-method/" + action + "/" + paymentMethod._id);
  };

  const deleteMethod = async (id) => {
    setLoading(true);
    const URI =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/delete/" + id;
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
      <Title>Métodos de pago</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Datos de pago</TableCell>
            <TableCell align="center">Instrucciones</TableCell>
            <TableCell align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows &&
            rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell align="center">
                  <Fab
                    color="default"
                    style={{ width: 35, height: 35 }}
                    aria-label="edit"
                    onClick={(e) => {
                      handleActive(row, "update");
                    }}
                  >
                    <EditIcon />
                  </Fab>
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    disabled
                    checked={row.active}
                    color="primary"
                    // inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                </TableCell>
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.paymentData}</TableCell>
                <TableCell align="center">{row.instructions}</TableCell>
                <TableCell align="center">
                  {" "}
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
    </React.Fragment>
  );
}
