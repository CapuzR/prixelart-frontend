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

export default function ProductsTable({
  rows,
  handleActive,
  discountList,
  deleteElement,
}) {
  const permissions = getPermissions()

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="center"></TableCell>
          <TableCell align="center">Imagen</TableCell>
          <TableCell align="center">Nombre</TableCell>
          <TableCell align="center">Activo</TableCell>
          <TableCell align="center">Categoría</TableCell>
          <TableCell align="center">PVP desde-hasta</TableCell>
          <TableCell align="center">PVM desde-hasta</TableCell>
          <TableCell align="center">Descuento</TableCell>
          <TableCell align="center">Tiempo de producción</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows &&
          rows.map((row) => (
            <TableRow key={row._id}>
              <TableCell align="center">
                {permissions?.createProduct && (
                  <Fab
                    color="default"
                    style={{ width: 35, height: 35 }}
                    aria-label="edit"
                    onClick={(e) => {
                      handleActive("product", row, "update")
                    }}
                  >
                    <EditIcon />
                  </Fab>
                )}
              </TableCell>
              <TableCell align="center">
                {row.sources.images?.length > 0 ? (
                  <>
                    {row.sources.images[0]?.type === "video" ? (
                      <span
                        // key={key_id}
                        dangerouslySetInnerHTML={{
                          __html: row.sources.images[0]?.url,
                        }}
                      />
                    ) : (
                      <Paper
                        elevation={3}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignContent: "center",
                          width: 220,
                          height: 210,
                          objectFit: "contain",
                          padding: 10,
                        }}
                      >
                        <img
                          src={row.sources.images[0]?.url || row.thumbUrl}
                          width={200}
                          alt="imageProduct"
                        />
                      </Paper>
                    )}

                    <Typography
                      style={{ fontSize: "1rem", color: "#bdbdbd" }}
                    >{`Cantidad de imagenes: ${row.sources.images?.length}`}</Typography>
                  </>
                ) : (
                  <Paper
                    elevation={3}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                      width: 220,
                      height: 210,
                      objectFit: "contain",
                      padding: 10,
                    }}
                  >
                    <img src={row.thumbUrl} alt="prix-product" width={200} />{" "}
                  </Paper>
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
              <TableCell align="center">{row.category}</TableCell>
              <TableCell align="center">
                $
                {Number(row.publicPrice.from).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {row.publicPrice.to &&
                  " - " +
                    Number(row.publicPrice.to).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </TableCell>
              <TableCell align="center">
                {row.prixerPrice &&
                  row.prixerPrice.from &&
                  "$" +
                    Number(row.prixerPrice?.from).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                {row.prixerPrice &&
                  row.prixerPrice.to &&
                  " - " +
                    Number(row.prixerPrice.to).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </TableCell>
              <TableCell>
                {row.discount &&
                  discountList.map((discount) => {
                    if (discount._id === row.discount) return discount.name
                  })}
              </TableCell>
              <TableCell align="center">
                {row.productionTime && Number(row.productionTime) > 1
                  ? row.productionTime + " días"
                  : row.productionTime && row.productionTime + " día"}
              </TableCell>
              <TableCell align="center">
                {permissions?.deleteProduct && (
                  <Fab
                    color="default"
                    style={{ width: 35, height: 35 }}
                    aria-label="Delete"
                    onClick={(e) => {
                      e.preventDefault()
                      deleteElement("product", row._id)
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
