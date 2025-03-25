import React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import axios from "axios"
import DeleteIcon from "@mui/icons-material/Delete"
import Checkbox from "@mui/material/Checkbox"
import EditIcon from "@mui/icons-material/Edit"
import Fab from "@mui/material/Fab"
import { useSnackBar, useLoading } from "@context/GlobalContext"
import { Product, Variant } from "../../../../../types/product.types"

interface VarProps {
  product: Product
  setVariant: (variant: Variant) => void
}

export default function ReadVariants({ product, setVariant }: VarProps) {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [rows, setRows] = useState<Variant[]>([])

  useEffect(() => {
    readVariants()
  }, [])

  const readVariants = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read"

    await axios
      .post(base_url, product)
      .then((response) => {
        if (response.data.products[0].variants) {
          let variants = response.data.products[0].variants.sort(function (
            a: Variant,
            b: Variant
          ) {
            return a.name.localeCompare(b.name)
          })
          setRows(variants)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleActive = (variant: Variant, action: string) => {
    setVariant(variant)
    action == "create" &&
      navigate("/product" + "/" + product._id + "/variant/" + action)
    action == "read" &&
      navigate("/product" + "/" + product._id + "/variant/" + action)
    action == "update" &&
      navigate(
        "/product" +
          "/" +
          product._id +
          "/variant/" +
          variant._id +
          "/" +
          action
      )
  }

  const deleteVariant = async (v: string) => {
    setLoading(true)
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/deleteVariant"
    const id = product._id

    const deleteVar = await axios.put(base_url, {
      product: id,
      variant: v,
    })
    if (deleteVar?.data.success === true) {
      readVariants()
    }
    showSnackBar("Variante eliminada exitosamente.")
  }

  return (
    <React.Fragment>
      <Table size="small" style={{ overflow: "auto" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Imagen</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Descripción</TableCell>
            <TableCell align="center">PVP desde-hasta</TableCell>
            <TableCell align="center">PVM desde-hasta</TableCell>
            <TableCell align="center">
              {/* <Fab
                color="default"
                style={{ width: 35, height: 35 }}
                aria-label="Delete"
                onClick={(e) => {
                  e.preventDefault();
                  deleteVariant();
                  // readOrders();
                  // rows.splice(1, i);
                }}
              >
                <DeleteIcon />
              </Fab> */}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows &&
            rows.map((row: Variant, i: number) =>
              row !== null && (
                <TableRow key={row._id}>
                  <TableCell align="center">
                    <Fab
                      color="default"
                      style={{ width: 35, height: 35 }}
                      aria-label="edit"
                      onClick={(e) => {
                        handleActive(row, "update")
                      }}
                    >
                      <EditIcon />
                    </Fab>
                  </TableCell>
                  <TableCell align="center">
                    {row.variantImage ? (
                      <img
                        src={row.variantImage.images?.[0].url}
                        style={{ width: 50, height: "auto" }}
                      />
                    ) : (
                      <img
                        src={row?.thumbUrl}
                        style={{ width: 50, height: "auto" }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.name}
                    {row.attributes[1]?.value && " " + row.attributes[1]?.value}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox disabled checked={row.active} color="primary" />
                  </TableCell>
                  <TableCell align="center">{row.description}</TableCell>
                  <TableCell align="center">
                    ${row.publicPrice?.equation}
                  </TableCell>
                  <TableCell align="center">
                    ${row.prixerPrice?.equation}
                  </TableCell>
                  <TableCell align="center">
                    <Fab
                      color="default"
                      style={{ width: 35, height: 35 }}
                      aria-label="Delete"
                      onClick={(e) => {
                        e.preventDefault()
                        deleteVariant(row._id)
                        // readVariants();
                        // rows.splice(1, i);
                      }}
                    >
                      <DeleteIcon />
                    </Fab>
                  </TableCell>
                </TableRow>
              )
            )}
        </TableBody>
      </Table>
    </React.Fragment>
  )
}
