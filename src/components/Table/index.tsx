import { useEffect, useState } from "react"

import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PaginationBar from "@components/Pagination/PaginationBar"
import { Tooltip, Typography } from "@mui/material"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import { useTheme } from "@mui/styles"
import { getPermissions } from "@context/GlobalContext"

export default function Table1({
  headers,
  elements,
  properties,
  updateFunction,
  deleteFunction,
  setPageNumber,
  pageNumber,
  itemsPerPage,
  maxLength,
  filter,
  options,
  handleFilter,
}) {
  const [dots, setDots] = useState<any[]>()
  const theme = useTheme()
  const permissions = getPermissions()

  const filterAndOrder = () => {
    const itemsToSkip = (pageNumber - 1) * itemsPerPage

    let elements2 = elements?.slice(itemsToSkip, itemsPerPage + itemsToSkip)
    return elements2?.map((obj: any) => {
      let xo = {}

      properties.forEach((prop: string) => {
        xo[prop] = obj[prop] ?? ""
      })
      return xo
    })
  }

  useEffect(() => {
    const neat = filterAndOrder()
    setDots(neat)
  }, [elements, pageNumber])

  interface Head {
    title: string
    type: string
  }

  return (
    <Table size="medium">
      <TableHead>
        <TableRow>
          {headers.map((head: Head, i: number) => (
            <TableCell key={i} align="center" style={{ fontWeight: "bold" }}>
              {head.type === "string" ? (
                <Typography sx={{ fontWeight: "bold" }}>
                  {head.title}
                </Typography>
              ) : (
                head.type === "select" && (
                  <FormControl sx={{ margin: theme.spacing(1), minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-label">
                      Destinatario
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filter}
                      onChange={handleFilter}
                    >
                      <MenuItem key={"none"} value={undefined}></MenuItem>
                      {options?.length > 0 &&
                        options?.map((o, i) => (
                          <MenuItem key={i} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {dots &&
          dots?.map((row, i: number) => (
            <TableRow
              key={`element-${i}`}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {Object.entries(row).map(([key, value]) => {
                if (Array.isArray(value)) {
                  return (
                    <TableCell align="center">
                      <ul>
                        {value.map((v) => (
                          <li>{v}</li>
                        ))}
                      </ul>
                    </TableCell>
                  )
                } else if (typeof value === "boolean") {
                  return (
                    <TableCell align="center">
                      <Checkbox
                        disabled
                        checked={Boolean(value)}
                        color="primary"
                      />
                    </TableCell>
                  )
                } else if (
                  typeof value === "string" ||
                  typeof value === "number"
                ) {
                  return <TableCell align="center">{value}</TableCell>
                }
              })}
              {/* Especificar el permiso según el área correspondiente !!! */}
              {permissions?.modifyAdmins &&
                (updateFunction || deleteFunction) && (
                  <TableCell align="center" sx={{ minWidth: 150 }}>
                    {updateFunction && (
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
                            updateFunction(elements[i])
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {deleteFunction && (
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
                            deleteFunction(elements[i])
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
            </TableRow>
          ))}
      </TableBody>
      <PaginationBar
        setPageNumber={setPageNumber}
        pageNumber={pageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={maxLength}
      />
    </Table>
  )
}
