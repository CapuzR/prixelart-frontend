import React, { useEffect, useState } from "react"

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

export default function Table1({
  headers,
  elements,
  properties,
  permissions,
  updateFunction,
  deleteFunction,
  setPageNumber,
  pageNumber,
  itemsPerPage,
  maxLength,
}) {
  const [dots, setDots] = useState<any[]>()

  const filterAndOrder = () => {
    const itemsToSkip = (pageNumber - 1) * itemsPerPage

    let elements2 = elements?.slice(itemsToSkip, itemsPerPage + itemsToSkip)
    return elements2?.map((obj: any) => {
      let xo = {}

      properties.forEach((prop: string) => {
        xo[prop] = obj[prop] || ""
      })

      return xo
    })
  }

  useEffect(() => {
    const neat = filterAndOrder()
    setDots(neat)
  }, [elements, pageNumber])

  return (
    <Table size="medium">
      <TableHead>
        <TableRow>
          {headers.map((head: string, i: number) => (
            <TableCell key={i} align="center" style={{ fontWeight: "bold" }}>
              {head}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {dots &&
          dots?.map((row: object, i: number) => (
            <TableRow
              key={`element-${i}`}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {Object.entries(row).map(([key, value]) => {
                if (typeof value === "boolean") {
                  return (
                    <TableCell align="center">
                      <Checkbox disabled checked={value} color="primary" />
                    </TableCell>
                  )
                } else {
                  return <TableCell align="center">{value}</TableCell>
                }
              })}
              {/* Especificar el permiso según el área correspondiente !!! */}
              {permissions?.modifyAdmins && (
                <TableCell align="center" sx={{ minWidth: 150 }}>
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
                  <IconButton
                    sx={{
                      width: 35,
                      height: 35,
                      marginRight: "16px !important",
                      "&:hover": {
                        color: "darkred", // Cambia el color al hacer hover
                      },
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      deleteFunction(elements[i])
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
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
