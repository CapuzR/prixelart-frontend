import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Checkbox from "@mui/material/Checkbox"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import Fab from "@mui/material/Fab"

export default function CategoriesTable({
  categories,
  permissions,
  handleActive,
  deleteElement,
}) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="center"></TableCell>
          <TableCell align="center">Activo</TableCell>
          <TableCell align="center">Nombre</TableCell>
          <TableCell align="center">Ícono</TableCell>
          <TableCell align="center">Imagen</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat._id}>
            <TableCell align="center">
              {permissions?.createDiscount && (
                <Fab
                  color="default"
                  style={{ width: 35, height: 35 }}
                  aria-label="edit"
                  onClick={(e) => {
                    handleActive("category", cat, "updateCategory")
                  }}
                >
                  <EditIcon />
                </Fab>
              )}
            </TableCell>
            <TableCell align="center">
              <Checkbox
                disabled
                checked={cat.active}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
              />
            </TableCell>
            <TableCell align="center">{cat.name}</TableCell>
            <TableCell align="center"></TableCell>
            <TableCell align="center"></TableCell>
            <TableCell align="center">
              {permissions?.deleteDiscount && (
                <Fab
                  color="default"
                  style={{ width: 35, height: 35 }}
                  aria-label="Delete"
                  onClick={(e) => {
                    e.preventDefault()
                    deleteElement("category", cat._id)
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
