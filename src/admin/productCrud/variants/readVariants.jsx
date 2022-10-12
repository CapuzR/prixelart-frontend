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

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function ReadVariants(props) {
  const classes = useStyles();
  const history = useHistory();
  const [rows, setRows] = useState();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read";

  useEffect(() => {
    axios
      .post(base_url, props.product)
      .then((response) => {
        response.data.products[0].variants &&
          setRows(response.data.products[0].variants);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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

  return (
    <React.Fragment>
      <Table size="small" style={{overflow: 'auto'}}>
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Imagen</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Descripción</TableCell>
            <TableCell align="center">PVP desde-hasta</TableCell>
            <TableCell align="center">PVM desde-hasta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
              {
                rows &&
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
                  {
                    row.variantImage ?
                    <img
                      src={row.variantImage[0]?.url}
                      style={{ width: 50, height: "auto" }}
                    />
                    :
                    <img
                      src={row.thumbUrl}
                      style={{ width: 50, height: "auto" }}
                    />
                  }
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
                    {row.publicPrice.from}-{row.publicPrice.to}
                  </TableCell>
                  <TableCell align="center">
                    {row.prixerPrice.from}-{row.prixerPrice.to}
                  </TableCell>
                  </TableRow>
              ))
              }
      </TableBody>
      </Table>
    </React.Fragment>
  );
}
