import { useHistory } from "react-router-dom"
import { useEffect, useState } from "react"

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
import { Admin } from "../../../../types/admin.types"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { deleteAdmin } from "../api"

export default function AdminTable({
  admins,
  permissions,
  handleCallback2,
  loadAdmin,
}) {
  const history = useHistory()
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()
  const [pageNumber, setPageNumber] = useState(1)
  const [itemsPerPage, setItemPerPage] = useState(20)
  const [totalElements, setTotalElements] = useState(admins?.length)

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
    <Table1
      headers={headers}
      elements={admins}
      properties={properties}
      permissions={permissions}
      updateFunction={handleActive}
      deleteFunction={deleteMethod}
      setPageNumber={setPageNumber}
      pageNumber={pageNumber}
      itemsPerPage={itemsPerPage}
      maxLength={totalElements}
    />
  )
}
