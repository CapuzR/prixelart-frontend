import React from "react";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../adminMain/Title";
import axios from "axios";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { AppBar, Snackbar } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";

import Fab from "@material-ui/core/Fab";
import CircularProgress from "@material-ui/core/CircularProgress";
import UpdateAdmin from "./updateAdmin";
import { useHistory, useLocation } from "react-router-dom";
import { TabPanel } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    "margin-left": "60px",
  },
}));

export default function ReadAdmins(props) {
  const history = useHistory();
  const classes = useStyles();

  const [rows, setRows] = useState();
  const [roles, setRoles] = useState();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [snackbar, setSnackbar] = useState(false);
  const [up, setUp] = useState();
  const loadAdmins = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/read-all";
    try {
      const rowState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      );
      setRows(rowState.data);
    } catch (e) {
      console.log(e);
    }
  };

  const loadRoles = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/read-roles";
    try {
      const rolesState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      );
      setRoles(rolesState.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadAdmins();
    loadRoles();
  }, []);

  const deleteMethod = async (username) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/admin/delete/" + username;
    axios
      .delete(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setSnackbar(true);
        setMessage("Administrador eliminado con éxito");
        loadAdmins();
      });
    setLoading(false);
  };

  const deleteRole = async (id) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/adminRole/delete/" + id;
    axios
      .delete(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setSnackbar(true);
        setMessage("Rol de administrador eliminado con éxito");
        loadRoles();
      });
    setLoading(false);
  };

  const closeAd = () => {
    setSnackbar(false);
  };

  const handleActive = (row) => {
    history.push("/admin/user/update");
    props.handleCallback2(row);
  };

  const handleActiveRole = (role) => {
    props.handleCallback2(role);
    history.push("/admin/user/updateRole");
    props.setActiveCrud("updateRole");
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  function TabPanel(props) {
    const { children, value, index } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <React.Fragment>
      {loading && (
        <div>
          <CircularProgress />
        </div>
      )}
      <Tabs value={value} onChange={handleChange} style={{ width: "70%" }}>
        <Tab indicator="red" backgroundColor="red" label="Administradores" />
        <Tab label="Roles" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Nombre</TableCell>
              <TableCell align="center">Apellido</TableCell>
              <TableCell align="center">Área</TableCell>
              <TableCell align="center">Correo</TableCell>
              <TableCell align="center">Usuario</TableCell>
              <TableCell align="center">Teléfono</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows &&
              rows.map((row) => (
                <TableRow key={row.username}>
                  <TableCell align="center">{row.firstname}</TableCell>
                  <TableCell align="center">{row.lastname}</TableCell>
                  <TableCell align="center"> {row.area && row.area}</TableCell>
                  <TableCell align="center">{row.email}</TableCell>
                  <TableCell align="center">{row.username}</TableCell>
                  <TableCell align="center">{row.phone}</TableCell>
                  {props.permissions.modifyAdmins && (
                    <TableCell align="center">
                      <Fab
                        color="default"
                        style={{
                          width: 35,
                          height: 35,
                          marginRight: 16,
                        }}
                        onClick={(e) => {
                          handleActive(row, "update");
                        }}
                      >
                        <EditIcon />
                      </Fab>
                      <Fab
                        color="default"
                        style={{
                          width: 35,
                          height: 35,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMethod(row.username);
                        }}
                      >
                        <DeleteIcon />
                      </Fab>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Área</TableCell>
              <TableCell align="center">Permisos</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles ? (
              roles.map((role) => (
                <TableRow key={role._id}>
                  <TableCell align="center">{role.area}</TableCell>
                  <TableCell style={{ display: "flex", flexDirection: "row" }}>
                    {(role.detailOrder ||
                      role.detailPay ||
                      role.orderStatus ||
                      role.createOrder) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Pedidos
                          </Typography>
                          {role.detailOrder && <li>Ver detalles de pedido</li>}
                          {role.detailPay && (
                            <li> Modificar detalles de pago</li>
                          )}
                          {role.orderStatus && (
                            <li> Modificar status de pedido</li>
                          )}
                          {role.createOrder && (
                            <li> Crear y modificar pedido</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {(role.createProduct || role.deleteProduct) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Productos
                          </Typography>
                          {role.createProduct && (
                            <li>Crear y modificar productos</li>
                          )}
                          {role.deleteProduct && <li> Eliminar productos</li>}
                        </ul>
                      </div>
                    )}

                    {(role.modifyBanners ||
                      role.modifyTermsAndCo ||
                      role.modifyDollar) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Preferencias
                          </Typography>
                          {role.modifyBanners && <li>Modificar banners</li>}
                          {role.modifyTermsAndCo && (
                            <li>Modificar términos y condiciones</li>
                          )}
                          {role.modifyDollar && (
                            <li>Modificar valor del dolar</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {(role.createPaymentMethod || role.deletePaymentMethod) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Métodos de pago
                          </Typography>
                          {role.createPaymentMethod && (
                            <li>Crear y modificar métodos de pago</li>
                          )}
                          {role.deletePaymentMethod && (
                            <li>Eliminar método de pago</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {(role.createShippingMethod ||
                      role.deleteShippingMethod) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Métodos de envío
                          </Typography>
                          {role.createShippingMethod && (
                            <li>Crear y modificar métodos de envío</li>
                          )}
                          {role.deleteShippingMethod && (
                            <li>Eliminar método de envío</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {role.prixerBan && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Prixers{" "}
                          </Typography>
                          {role.prixerBan && <li>Banear a Prixers</li>}
                        </ul>
                      </div>
                    )}
                    {(role.createTestimonial || role.deleteTestimonial) && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Testimonios
                          </Typography>
                          {role.createTestimonial && (
                            <li>
                              Crear, modificar, mostrar y ordenar testimonios
                            </li>
                          )}
                          {role.deleteTestimonial && (
                            <li>Eliminar testimonios</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {role.modifyAdmins && (
                      <div
                        style={{
                          borderWidth: "1px",
                          borderStyle: "solid",
                          marginLeft: 5,

                          borderRadius: 10,
                          borderColor: "silver",
                          width: "35%",
                        }}
                      >
                        <ul style={{ paddingLeft: 20 }}>
                          <Typography variant="p" color="secondary">
                            Usuarios
                          </Typography>
                          {role.modifyAdmins && (
                            <li>Crear, modificar y eliminar Admins</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </TableCell>
                  {props.permissions.modifyAdmins && (
                    <TableCell align="right">
                      <Fab
                        color="default"
                        style={{
                          width: 35,
                          height: 35,
                          marginRight: 16,
                        }}
                        onClick={(e) => {
                          handleActiveRole(role);
                        }}
                      >
                        <EditIcon />
                      </Fab>
                      <Fab
                        color="default"
                        style={{
                          width: 35,
                          height: 35,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          deleteRole(role._id);
                        }}
                      >
                        <DeleteIcon />
                      </Fab>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <Typography
                variant="h5"
                color="secondary"
                align="right"
                style={{ paddingTop: 30 }}
              >
                Aún no hay roles que mostrar
              </Typography>
            )}
          </TableBody>
        </Table>
      </TabPanel>
      {up && <UpdateAdmin admin={up} />}
      <Snackbar
        open={snackbar}
        autoHideDuration={6000}
        message={message}
        onClose={closeAd}
      />
      {props.handleCallback(value)}
    </React.Fragment>
  );
}
