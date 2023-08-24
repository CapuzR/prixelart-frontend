import React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../adminMain/Title";
import axios from "axios";
import Checkbox from "@material-ui/core/Checkbox";
import EditIcon from "@material-ui/icons/Edit";
import Fab from "@material-ui/core/Fab";
import { Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Grid from "@material-ui/core/Grid";
import { Snackbar } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
export default function ReadConsumers(props) {
  const history = useHistory();
  const [rows, setRows] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [snackbar, setSnackbar] = useState(false);
  const totalConsumers = rows?.length;
  const itemsPerPage = 20;
  const noOfPages = Math.ceil(totalConsumers / itemsPerPage);
  const [pageNumber, setPageNumber] = useState(1);
  const itemsToSkip = (pageNumber - 1) * itemsPerPage;
  const rowsv2 = rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip);

  const readConsumers = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/consumer/read-all";
    axios
      .post(base_url)
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    readConsumers();
  }, []);

  const handleActive = (consumer, action) => {
    props.setConsumer(consumer);
    history.push("/admin/consumer/" + action + "/" + consumer._id);
  };

  const deleteConsumer = (id) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/consumer/delete/" + id;
    axios
      .put(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setSnackbar(true);
        setMessage("Cliente eliminado con éxito");
        readConsumers();
      });
    setLoading(false);
  };

  const closeAd = () => {
    setSnackbar(false);
  };

  return (
    <React.Fragment>
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
      {props?.permissions?.readConsumers ? (
        <>
          <Title>Consumidor</Title>
          {rows && (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Activo</TableCell>
                    <TableCell align="center">Nombre</TableCell>
                    <TableCell align="center">Apellido</TableCell>
                    <TableCell align="center">Usuario</TableCell>
                    <TableCell align="center">Teléfono</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Envío</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows &&
                    rowsv2.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell align="center">
                          <Checkbox
                            disabled
                            checked={row.active}
                            color="primary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                          />
                        </TableCell>
                        <TableCell align="center">{row.firstname}</TableCell>
                        <TableCell align="center">{row.lastname}</TableCell>
                        <TableCell align="center">{row.username}</TableCell>
                        <TableCell align="center">{row.phone}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">
                          {row.shippingAddress}
                        </TableCell>
                        <TableCell align="center">
                          <Grid style={{ display: "flex" }}>
                            {props?.permissions?.createConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginRight: 16,
                                }}
                                aria-label="edit"
                                onClick={(e) => {
                                  handleActive(row, "update");
                                }}
                              >
                                <EditIcon />
                              </Fab>
                            )}
                            {props?.permissions?.deleteConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                }}
                                onClick={() => {
                                  deleteConsumer(row._id);
                                }}
                              >
                                <DeleteIcon />
                              </Fab>
                            )}
                          </Grid>
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
          )}
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
      <Snackbar
        open={snackbar}
        autoHideDuration={6000}
        message={message}
        onClose={closeAd}
      />
    </React.Fragment>
  );
}
