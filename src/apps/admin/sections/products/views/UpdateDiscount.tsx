import React, { useState, useEffect } from "react"
import { Theme, useTheme } from "@mui/material/styles"
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
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"
import InputAdornment from "@mui/material/InputAdornment"
import { Typography } from "@mui/material"
import { useSnackBar, useLoading } from "@context/GlobalContext"
import { Discount } from "../../../../../types/discount.types"
import { Product } from "../../../../../types/product.types"
interface DiscProps {
  discount: Discount
}

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

export default function UpdateDiscount({ discount }: DiscProps) {
  const { classes, cx } = useStyles()
  const theme = useTheme()
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [active, setActive] = useState(discount.active)
  const [name, setName] = useState<string | undefined>(
    discount.name || undefined
  )
  const [description, setDescription] = useState<string | undefined>(
    discount.description || undefined
  )
  const [type, setType] = useState<string | undefined>(
    discount.type || undefined
  )
  const [value, setValue] = useState<string | number | undefined>(
    discount.value || undefined
  )
  const [appliedProducts, setAppliedProducts] = useState<string[]>(
    discount.appliedProducts || []
  )
  const [buttonState, setButtonState] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const discountTypes = ["Porcentaje", "Monto"]
  //Error states.

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name && !description && !type && !value) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      setButtonState(true)
      const data = {
        _id: discount._id,
        name: name,
        active: active,
        description: description,
        type: type,
        value: value,
        appliedProducts: appliedProducts,
        adminToken: localStorage.getItem("adminTokenV"),
      }
      const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/update"
      const response = await axios.put(base_url, data)
      if (response.data.success === false) {
        setLoading(false)
        setButtonState(false)
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Actualización de descuento exitoso.")
        setActive(false)
        setName(undefined)
        setDescription(undefined)
        setType(undefined)
        setValue(undefined)
        setAppliedProducts([])
        navigate("/admin/product/read")
      }
    }
  }

  const getProducts = async () => {
    setLoading(true)
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-allv1"
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setProducts(response.data.products)
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  useEffect(() => {
    getProducts()
  }, [])

  return (
    <React.Fragment>
      <Title title="Actualizar Descuento" />
      <form encType="multipart/form-data" noValidate onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={active}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                setActive(!active)
              }}
            />
            Habilitado
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
          <Grid2 size={{ xs: 12, md: 3 }} style={{ marginTop: "-75px" }}>
            <FormControl variant="outlined" fullWidth={true}>
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
            style={{ marginTop: "-75px", width: "50%" }}
          >
            <FormControl variant="outlined" fullWidth={true}>
              {type === "Monto" ? (
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  label="Valor"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
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
          <Grid2>
            <Typography color="primary">Aplicado a:</Typography>
          </Grid2>
          <Grid2>
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
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
        <Grid2 container spacing={2}></Grid2>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={buttonState}
          style={{ marginTop: 20 }}
        >
          Actualizar
        </Button>
      </form>
    </React.Fragment>
  )
}
