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
import { Grid2, Tooltip, IconButton } from "@mui/material"

import { getPermissions } from "@context/GlobalContext"
import { Product } from "../../../../../types/product.types"
import { Discount } from "../../../../../types/discount.types"

interface TableProps {
  rows: Product[]
  handleActive: (type: string, element: Product, action: string) => void
  discountList: Discount[]
  deleteElement: (product: string, id: string) => void
}

export default function ProductsTable({
  rows,
  handleActive,
  discountList,
  deleteElement,
}: TableProps) {
  const permissions = getPermissions()

  const headers = [
    "Imagen",
    "Nombre",
    "Activo",
    "Categoría",
    "PVP desde - hasta",
    "PVM desde - hasta",
    "Descuento",
    "Tiempo de producción",
    "",
  ]

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((head, i) => (
            <TableCell key={i} align="center" style={{ fontWeight: "bold" }}>
              {head}
            </TableCell>
          ))}{" "}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows &&
          rows.map((row) => (
            <TableRow key={row._id}>
              <TableCell align="center">
                {row.sources.images && row.sources.images?.length > 0 ? (
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
                  checked={
                    row.active === "true" || row.active === true ? true : false
                  }
                  color="primary"
                />
              </TableCell>
              <TableCell align="center">
                {typeof row.category === "string"
                  ? row.category
                  : row.category?.name}
              </TableCell>
              <TableCell align="center">
                $
                {Number(row.priceRange?.from).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {row.priceRange?.to &&
                  " - " +
                    Number(row.priceRange?.to).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </TableCell>
              <TableCell align="center">
                {row.priceRange &&
                  row.priceRange.from &&
                  "$" +
                    Number(row.priceRange?.from).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                {row.priceRange &&
                  row.priceRange.to &&
                  " - " +
                    Number(row.priceRange.to).toLocaleString("de-DE", {
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
                <Grid2 sx={{ display: "flex" }}>
                  {permissions?.createProduct && (
                    <Tooltip title="Editar">
                      <IconButton
                        sx={{
                          width: 35,
                          height: 35,
                          marginRight: "16px !important",
                          "&:hover": {
                            color: "DarkSlateGray",
                          },
                        }}
                        onClick={(e) => {
                          handleActive("product", row, "update")
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {permissions?.deleteProduct && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        sx={{
                          width: 35,
                          height: 35,
                          marginRight: "16px !important",
                          "&:hover": {
                            color: "darkred",
                          },
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          deleteElement("product", row._id)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid2>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
