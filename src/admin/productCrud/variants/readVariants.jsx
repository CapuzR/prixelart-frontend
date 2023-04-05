import React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../../adminMain/Title";
import axios from "axios";
import DeleteIcon from "@material-ui/icons/Delete";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import Checkbox from "@material-ui/core/Checkbox";
import EditIcon from "@material-ui/icons/Edit";
import Fab from "@material-ui/core/Fab";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
}));

export default function ReadVariants(props) {
  const classes = useStyles();
  const history = useHistory();
  const [rows, setRows] = useState();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  useEffect(() => {
    readVariants();
    readProduct();
  }, []);

  const readVariants = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read";

    axios
      .post(
        base_url,
        props.product,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        response.data.products[0].variants &&
          setRows(response.data.products[0].variants);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const readProduct = () => {
    const base_url2 = process.env.REACT_APP_BACKEND_URL + "/product/read";
    axios.post(base_url2, { _id: props.product._id }).then((response) => {
      let product = response.data.products[0];
      // props.setProduct(product);
      localStorage.setItem("product", JSON.stringify(product));
    });
  };

  const handleActive = (variant, action) => {
    props.setVariant(variant);
    action == "create" &&
      history.push(
        "/admin/product" + "/" + props.product._id + "/variant/" + action
      );
    action == "read" &&
      history.push(
        "/admin/product" + "/" + props.product._id + "/variant/" + action
      );
    action == "update" &&
      history.push(
        "/admin/product" +
          "/" +
          props.product._id +
          "/variant/" +
          variant._id +
          "/" +
          action
      );
  };

  const deleteVariant = (i) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/product/deleteVariant";
    const id = props.product._id;

    axios
      .put(
        base_url,
        { id, i },
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        readVariants();
        readProduct();
      })
      .catch((error) => {
        console.log(error);
      });
    setSnackBarError(true);
    setErrorMessage("Variante eliminada exitosamente.");
    setLoading(false);
  };

  const onCloseSnackbar = () => {
    setSnackBarError(false);
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Table size="small" style={{ overflow: "auto" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Imagen</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Descripción</TableCell>
            <TableCell align="center">PVP desde-hasta</TableCell>
            <TableCell align="center">PVM desde-hasta</TableCell>
            <TableCell align="center">
              {/* <Fab
                color="default"
                style={{ width: 35, height: 35 }}
                aria-label="Delete"
                onClick={(e) => {
                  e.preventDefault();
                  deleteVariant();
                  // readOrders();
                  // rows.splice(1, i);
                }}
              >
                <DeleteIcon />
              </Fab> */}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows &&
            rows.map((row, i) =>
              row !== null ? (
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
                    {row.variantImage ? (
                      <img
                        src={row.variantImage[0]?.url}
                        style={{ width: 50, height: "auto" }}
                      />
                    ) : (
                      <img
                        src={row.thumbUrl}
                        style={{ width: 50, height: "auto" }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      disabled
                      checked={row.active}
                      color="primary"
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </TableCell>
                  <TableCell align="center">{row.description}</TableCell>
                  <TableCell align="center">
                    ${row.publicPrice?.equation}
                  </TableCell>
                  <TableCell align="center">
                    ${row.prixerPrice?.equation}
                  </TableCell>
                  <TableCell align="center">
                    <Fab
                      color="default"
                      style={{ width: 35, height: 35 }}
                      aria-label="Delete"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteVariant(i);
                        readVariants();
                        // rows.splice(1, i);
                      }}
                    >
                      <DeleteIcon />
                    </Fab>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>null</TableCell>{" "}
                  <TableCell>
                    {" "}
                    <Fab
                      color="default"
                      style={{ width: 35, height: 35 }}
                      aria-label="Delete"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteVariant(i);
                        // readOrders();
                        // rows.splice(1, i);
                      }}
                    >
                      <DeleteIcon />
                    </Fab>
                  </TableCell>
                </TableRow>
              )
            )}
        </TableBody>
      </Table>
      <Snackbar
        open={snackBarError}
        onClose={onCloseSnackbar}
        autoHideDuration={3000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
