import { useHistory } from "react-router-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Fab from "@mui/material/Fab";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Admin } from "../../../types/admin.types";
import { useSnackBar, useLoading } from "context/GlobalContext";
import { deleteAdmin } from "./api";

export default function Table1({
  admins,
  permissions,
  handleCallback2,
  loadAdmin,
}) {
  const history = useHistory();
  const { setLoading } = useLoading();
  const { showSnackBar } = useSnackBar();

  const headers = [
    "Nombre",
    "Apellido",
    "Área",
    "Correo",
    "Usuario",
    "Teléfono",
    "",
  ];

  const handleActive = (row: Admin) => {
    history.push("/admin/user/update");
    handleCallback2(row);
  };

  const deleteMethod = async (username: string) => {
    setLoading(true);
    try {
      const del = await deleteAdmin(username);
      if (del.status === 200) {
        showSnackBar(`Administrador ${del.data.username} eliminado con éxito`);
        loadAdmin();
      }
    } catch (error) {
      showSnackBar(
        "Error eliminando administrador, refresque la ventana e inténtelo de nuevo."
      );
      console.error("Error obteniendo  eliminando administrador:", error);
    }
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
        {admins &&
          admins.map((row: Admin) => (
            <TableRow key={row.username}>
              <TableCell align="center">{row.firstname}</TableCell>
              <TableCell align="center">{row.lastname}</TableCell>
              <TableCell align="center">{row.area && row.area}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.username}</TableCell>
              <TableCell align="center">{row.phone}</TableCell>
              {permissions?.modifyAdmins && (
                <TableCell align="center">
                  <Fab
                    color="default"
                    style={{
                      width: 35,
                      height: 35,
                      marginRight: 16,
                    }}
                    onClick={(e) => {
                      handleActive(row);
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
  );
}
