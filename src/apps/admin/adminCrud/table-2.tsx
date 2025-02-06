import { useHistory } from "react-router-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Fab from "@mui/material/Fab";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { AdminRole } from "../../../types/admin.types";
import { useSnackBar, useLoading } from "context/GlobalContext";
import { getRoles, deleteAdmin, deleteAdminRole } from "./api";

export default function Table2({
  roles,
  permissions,
  loadRoles,
  handleCallback2,
  setActiveCrud,
}) {
  const headers = ["Área", "Permisos", ""];
  const { showSnackBar } = useSnackBar();
  const { setLoading } = useLoading();
  const history = useHistory();

  const deleteRole = async (id: string) => {
    setLoading(true);
    try {
      const del = await deleteAdminRole(id);

      if (del.status === 200) {
        showSnackBar(
          `Rol de administrador ${del.data.area} eliminado con éxito`
        );
      }
      loadRoles();
    } catch (error) {
      showSnackBar(
        "Error eliminando rol de administrador, refresque la ventana e inténtelo de nuevo."
      );
      console.error("Error obteniendo  eliminando rol de administrador:");
    }
  };

  const handleActiveRole = (role: AdminRole) => {
    handleCallback2(role);
    history.push("/admin/user/updateRole");
    setActiveCrud("updateRole");
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((head, i) => (
            <TableCell key={i} align="center">
              {head}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {roles ? (
          roles.map((role: AdminRole) => (
            <TableRow key={role._id}>
              <TableCell align="center">{role.area}</TableCell>
              <TableCell style={{ display: "flex", flexDirection: "row" }}>
                <Grid2 container>
                  <Grid2
                    size={{
                      xs: 3,
                    }}
                  >
                    {(role.detailOrder ||
                      role.detailPay ||
                      role.orderStatus ||
                      role.createOrder) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Pedidos
                        </Typography>
                        {role.detailOrder && <li>Ver detalles de pedido</li>}
                        {role.detailPay && <li> Modificar detalles de pago</li>}
                        {role.orderStatus && (
                          <li> Modificar status de pedido</li>
                        )}
                        {role.createOrder && <li> Crear y modificar pedido</li>}
                      </ul>
                    )}
                  </Grid2>
                  <Grid2
                    size={{
                      xs: 3,
                    }}
                    style={{ flexDirection: "row" }}
                  >
                    {(role.createProduct ||
                      role.deleteProduct ||
                      role.createDiscount ||
                      role.deleteDiscount) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Productos
                        </Typography>
                        {role.createProduct && (
                          <li>Crear y modificar productos</li>
                        )}
                        {role.deleteProduct && <li> Eliminar productos</li>}
                        {role.createDiscount && (
                          <li>Crear y modificar descuentos</li>
                        )}
                        {role.deleteDiscount && <li> Eliminar descuentos</li>}
                      </ul>
                    )}
                    {(role.createPaymentMethod || role.deletePaymentMethod) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Métodos de pago
                        </Typography>
                        {role.createPaymentMethod && (
                          <li>Crear y modificar métodos de pago</li>
                        )}
                        {role.deletePaymentMethod && (
                          <li>Eliminar método de pago</li>
                        )}
                      </ul>
                    )}
                    {(role.createShippingMethod ||
                      role.deleteShippingMethod) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Métodos de envío
                        </Typography>
                        {role.createShippingMethod && (
                          <li>Crear y modificar métodos de envío</li>
                        )}
                        {role.deleteShippingMethod && (
                          <li>Eliminar método de envío</li>
                        )}
                      </ul>
                    )}
                  </Grid2>
                  <Grid2
                    size={{
                      xs: 3,
                    }}
                    style={{ flexDirection: "row" }}
                  >
                    {(role.modifyBanners ||
                      role.modifyTermsAndCo ||
                      role.modifyDollar) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Preferencias
                        </Typography>
                        {role.modifyBanners && <li>Modificar banners</li>}
                        {role.modifyTermsAndCo && (
                          <li>Modificar términos y condiciones</li>
                        )}
                        {role.modifyDollar && (
                          <li>Modificar valor del dolar</li>
                        )}
                        {role.modifyBestSellers && (
                          <li>Modificar productos más vendidos</li>
                        )}
                        {role.modifyArtBestSellers && (
                          <li>Modificar artes más vendidos</li>
                        )}
                      </ul>
                    )}
                    {(role.createTestimonial || role.deleteTestimonial) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
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
                    )}
                  </Grid2>
                  <Grid2
                    size={{
                      xs: 3,
                    }}
                    sx={{ flexDirection: "row" }}
                  >
                    {role.modifyAdmins && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Usuarios
                        </Typography>
                        {role.modifyAdmins && (
                          <li>Crear, modificar y eliminar Admins</li>
                        )}
                      </ul>
                    )}
                    {(role.prixerBan ||
                      role.setPrixerBalance ||
                      role.readMovements) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Prixers
                        </Typography>
                        {role.prixerBan && <li>Banear a Prixers</li>}
                        {role.setPrixerBalance && (
                          <li>Modificar Balance de Prixers</li>
                        )}
                        {role.readMovements && <li>Leer movimientos</li>}
                        {role.artBan && <li>Banear artes</li>}
                      </ul>
                    )}
                    {(role.createConsumer ||
                      role.readConsumers ||
                      role.deleteConsumer) && (
                      <ul style={{ paddingLeft: 20 }}>
                        <Typography variant="body1" color="secondary">
                          Clientes frecuentes
                        </Typography>
                        {role.createConsumer && (
                          <li>Crear y modificar clientes frecuentes</li>
                        )}
                        {role.readConsumers && (
                          <li>Leer clientes frecuentes</li>
                        )}
                        {role.deleteConsumer && (
                          <li>Eliminar clientes frecuentes</li>
                        )}
                      </ul>
                    )}
                  </Grid2>
                </Grid2>
              </TableCell>
              {permissions?.modifyAdmins && (
                <TableCell align="right">
                  <Grid2 sx={{ display: "flex" }}>
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
                  </Grid2>
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
  );
}
