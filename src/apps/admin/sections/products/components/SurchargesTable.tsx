import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Checkbox from "@mui/material/Checkbox"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import Fab from "@mui/material/Fab"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import { getPermissions } from "@context/GlobalContext"
import React from "react"

export default function SurchargesTable({
  surchargeList,
  handleActive,
  deleteElement,
}) {
  const permissions = getPermissions()

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="center"></TableCell>
          <TableCell align="center">Nombre</TableCell>
          <TableCell align="center">Activo</TableCell>
          <TableCell align="center">Tipo</TableCell>
          <TableCell align="center">Valor</TableCell>
          <TableCell align="center">Productos aplicados</TableCell>
          <TableCell align="center">Usuarios aplicados</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {surchargeList &&
          surchargeList.map((sur) => (
            <TableRow key={sur._id}>
              <TableCell align="center">
                {permissions?.createDiscount && (
                  <Fab
                    color="default"
                    style={{ width: 35, height: 35 }}
                    aria-label="edit"
                    onClick={(e) => {
                      handleActive("surcharge", sur, "updateSurcharge")
                    }}
                  >
                    <EditIcon />
                  </Fab>
                )}
              </TableCell>
              <TableCell align="center">{sur.name}</TableCell>
              <TableCell align="center">
                <Checkbox
                  disabled
                  checked={sur.active}
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                />
              </TableCell>
              <TableCell align="center">{sur.type}</TableCell>
              <TableCell align="center">
                {sur.type === "Porcentaje" ? "%" + sur.value : "$" + sur.value}
              </TableCell>
              <TableCell align="center">
                <ul>
                  {sur.appliedProducts.map((el) => (
                    <li>{el}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell align="center">
                <ul>
                  {sur.appliedUsers.map((el) => (
                    <li>{el}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell align="center">
                {permissions?.deleteDiscount && (
                  <Fab
                    color="default"
                    style={{ width: 35, height: 35 }}
                    aria-label="Delete"
                    onClick={(e) => {
                      e.preventDefault()
                      deleteElement("surcharge", sur._id)
                    }}
                  >
                    <DeleteIcon />
                  </Fab>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
