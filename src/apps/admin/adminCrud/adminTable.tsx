import { useHistory } from "react-router-dom"

import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Fab from "@mui/material/Fab"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import Table1 from "@components/Table/index"
import { Admin } from "../../../types/admin.types"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { deleteAdmin } from "./api"

export default function AdminTable({
  admins,
  permissions,
  handleCallback2,
  loadAdmin,
}) {
  const history = useHistory()
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()

  const headers = [
    "Nombre",
    "Apellido",
    "Área",
    "Correo",
    "Usuario",
    "Teléfono",
    "",
  ]

  const properties = [
    "firstname",
    "lastname",
    "area",
    "email",
    "username",
    "phone",
  ]

  const handleActive = (row: Admin) => {
    history.push("/admin/user/update")
    handleCallback2(row)
  }

  const deleteMethod = async (row: Admin) => {
    setLoading(true)
    try {
      const del = await deleteAdmin(row.username)
      if (del.status === 200) {
        showSnackBar(`Administrador ${del.data.username} eliminado con éxito`)
        loadAdmin()
      }
    } catch (error) {
      showSnackBar(
        "Error eliminando administrador, refresque la ventana e inténtelo de nuevo."
      )
      console.error("Error obteniendo  eliminando administrador:", error)
    }
  }

  return (
    // <Table size="small">
    //   <TableHead>
    //     <TableRow>
    //       {headers.map((head, i) => (
    //         <TableCell key={i} align="center" style={{ fontWeight: "bold" }}>
    //           {head}
    //         </TableCell>
    //       ))}
    //     </TableRow>
    //   </TableHead>
    //   <TableBody>
    //     {admins &&
    //       admins.map((row: Admin) => (
    //         <TableRow key={row.username}>
    //           <TableCell align="center">{row.firstname}</TableCell>
    //           <TableCell align="center">{row.lastname}</TableCell>
    //           <TableCell align="center">{row.area && row.area}</TableCell>
    //           <TableCell align="center">{row.email}</TableCell>
    //           <TableCell align="center">{row.username}</TableCell>
    //           <TableCell align="center">{row.phone}</TableCell>
    //           {permissions?.modifyAdmins && (
    //             <TableCell align="center">
    //               <IconButton
    //                 sx={{
    //                   width: 35,
    //                   height: 35,
    //                   marginRight: "16px !important",
    //                   "&:hover": {
    //                     color: "DarkSlateGray", // Cambia el color al hacer hover
    //                   },
    //                 }}
    //                 onClick={(e) => {
    //                   handleActive(row)
    //                 }}
    //               >
    //                 <EditIcon />
    //               </IconButton>
    //               <IconButton
    //                 sx={{
    //                   width: 35,
    //                   height: 35,
    //                   marginRight: "16px !important",
    //                   "&:hover": {
    //                     color: "darkred", // Cambia el color al hacer hover
    //                   },
    //                 }}
    //                 onClick={(e) => {
    //                   e.preventDefault()
    //                   deleteMethod(row.username)
    //                 }}
    //               >
    //                 <DeleteIcon />
    //               </IconButton>
    //             </TableCell>
    //           )}
    //         </TableRow>
    //       ))}
    //   </TableBody>
    // </Table>
    <Table1
      headers={headers}
      elements={admins}
      properties={properties}
      permissions={permissions}
      updateFunction={handleActive}
      deleteFunction={deleteMethod}
    />
  )
}
