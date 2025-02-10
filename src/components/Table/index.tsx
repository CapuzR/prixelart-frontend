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

export default function Table1({
  headers,
  elements,
  properties,
  permissions,
  updateFunction,
  deleteFunction,
}) {
  const [dots, setDots] = useState<any[]>()

  const filterAndOrder = () => {
    return elements?.map((obj: any) => {
      let xo = {}

      properties.forEach((prop: string) => {
        xo[prop] = obj[prop] || "" // Si la propiedad no existe, asigna ""
      })

      return xo
    })
  }

  useEffect(() => {
    const neat = filterAndOrder()
    setDots(neat)
  }, [elements])

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
              {permissions?.modifyAdmins && (
                <TableCell align="center" sx={{minWidth: 150}}>
                  <IconButton
                    sx={{
                      width: 35,
                      height: 35,
                      marginRight: "16px !important",
                      "&:hover": {
                        color: "DarkSlateGray", // Cambia el color al hacer hover
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
    </Table>
  )
}
