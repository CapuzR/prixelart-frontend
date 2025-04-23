import React, { useState, useEffect } from "react"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import { useNavigate } from "react-router-dom"

import Title from "../../../components/Title"
import axios from "axios"
import TextField from "@mui/material/TextField"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import Snackbar from "@mui/material/Snackbar"
import CircularProgress from "@mui/material/CircularProgress"
import { useTheme } from "@mui/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import FormControl from "@mui/material/FormControl"

import Checkbox from "@mui/material/Checkbox"
import InputAdornment from "@mui/material/InputAdornment"
import { Typography } from "@mui/material"
import { useLoading, useSnackBar } from "@context/GlobalContext"
import { createDiscount, getAllProducts } from "../api"
import { Product } from "../../../../../types/product.types"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    loaderImage: {
      width: "120%",
      border: "2px",
      height: "30vh",
      borderStyle: "groove",
      borderColor: "#d33f49",
      backgroundColor: "#ededed",
      display: "flex",
      flexDirection: "row",
    },
    imageLoad: {
      maxWidth: "100%",
      maxHeight: "100%",
      padding: "5px",
      marginTop: "5px",
    },
    formHead: {
      display: "flex",
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    buttonImgLoader: {
      cursor: "pointer",
      padding: "5px",
    },
    buttonEdit: {
      cursor: "pointer",
      padding: "5px",
    },
  }
})

export default function CreateDiscount() {
  const {classes, cx} = useStyles()
  const theme = useTheme()
  const navigate = useNavigate()

  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const [active, setActive] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [value, setValue] = useState("")
  const [appliedProducts, setAppliedProducts] = useState<string[]>([])
  const [buttonState, setButtonState] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const discountTypes = ["Porcentaje", "Monto"]

  const parseNumber = (value: string) => {
    if (!value) return 0

    // Elimina separadores de miles y reemplaza la coma decimal por punto
    const formattedValue = value.replace(/\./g, "").replace(/,/g, ".")

    return parseFloat(formattedValue) || 0
  }

  // console.log(parseNumber(value?.replace(",", ".")))
  // console.log(parseNumber(value))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name && !type && !value) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      setButtonState(true)
      const data = {
        name: name,
        active: active,
        description: description,
        type: type,
        value: Number(value?.replace(/[,]/gi, ".")),
        appliedProducts: appliedProducts,
      }
      const response = await createDiscount(data)
      if (response?.success === false) {
        setLoading(false)
        setButtonState(false)
        showSnackBar(response?.message)
      } else {
        showSnackBar("Creación de descuento exitoso.")
        setActive(false)
        setName("")
        setDescription("")
        setType("")
        setValue("")
        setAppliedProducts([])
        navigate("/admin/product/read")
      }
    }
  }

  const getProducts = async () => {
    setLoading(true)
    try {
      const readProducts = await getAllProducts()
      setProducts(readProducts)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getProducts()
  }, [])

  return (
    <React.Fragment>
      <Title title="Crear Descuento" />
      <form
        style={{
          height: "auto",
        }}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid2 container>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={active}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                active ? setActive(false) : setActive(true)
              }}
            />
            Habilitado
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }} style={{ padding: 5 }}>
            <FormControl
              variant="outlined"
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }} style={{ padding: 5 }}>
            <FormControl
              variant="outlined"
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                multiline
                minRows={5}
                label="Descripción"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2
            size={{ xs: 12, md: 3 }}
            style={{ marginTop: "-75px", padding: 5 }}
          >
            <FormControl
              variant="outlined"
              fullWidth={true}
            >
              <InputLabel>Tipo</InputLabel>
              <Select
                input={<OutlinedInput />}
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                }}
              >
                {discountTypes &&
                  discountTypes.map((type) => (
                    <MenuItem value={type}>{type}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2
            size={{ xs: 12, md: 3 }}
            style={{ marginTop: "-75px", padding: 5 }}
          >
            <FormControl
              variant="outlined"
              fullWidth={true}
            >
              {type === "Monto" ? (
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  type="number"
                  label="Valor"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    },
                  }}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                />
              ) : (
                type === "Porcentaje" && (
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    type="number"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">%</InputAdornment>
                        ),
                        inputProps: { min: 1, max: 100, shrink: true },
                      },
                    }}
                    label="Valor"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value)
                    }}
                  />
                )
              )}
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Typography color="primary">Aplicado a:</Typography>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                if (appliedProducts.length !== products.length) {
                  let v1: string[] = []
                  products.map((product) => v1.push(product.name))
                  setAppliedProducts(v1)
                } else if (appliedProducts.length === products.length) {
                  setAppliedProducts([])
                }
              }}
            />
            Todos los productos
          </Grid2>
          {products &&
            products.map((product) => (
              <Grid2 size={{ xs: 3 }}>
                <Checkbox
                  checked={appliedProducts.includes(product.name)}
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => {
                    if (appliedProducts[0] === undefined) {
                      setAppliedProducts([product.name])
                    } else if (appliedProducts.includes(product.name)) {
                      setAppliedProducts(
                        appliedProducts.filter((item) => item !== product.name)
                      )
                    } else {
                      setAppliedProducts([...appliedProducts, product.name])
                    }
                  }}
                />
                {product.name}
              </Grid2>
            ))}
        </Grid2>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={buttonState}
          style={{ marginTop: 20 }}
          // onClick={handleSubmit}
        >
          Crear
        </Button>
      </form>
    </React.Fragment>
  )
}
