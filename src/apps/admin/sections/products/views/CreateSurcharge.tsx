import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Title from "@apps/admin/components/Title"
import axios from "axios"
import TextField from "@mui/material/TextField"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"
import InputAdornment from "@mui/material/InputAdornment"
import { Typography } from "@mui/material"
import { nanoid } from "nanoid"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Divider from "@mui/material/Divider"
import FormControlLabel from "@mui/material/FormControlLabel"
import { useSnackBar, useLoading } from "@context/GlobalContext"
import { Product } from "../../../../../types/product.types"

const categories = {
  artista: { type: "string", value: "Artista" },
  corporativo: { type: "string", value: "Corporativo" },
  da: { type: "string", value: "DA" },
  prixer: { type: "string", value: "Prixer" },
}

type CategoryKey = keyof typeof categories

function getCategoryValue(key: CategoryKey) {
  return categories[key].value
}

interface Consideration {
  type: string
  value: string
}

export default function CreateSurcharge() {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [active, setActive] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("Porcentaje")
  const [value, setValue] = useState("")
  const [appliedProducts, setAppliedProducts] = useState<string[]>([])
  const [appliedUsers, setAppliedUsers] = useState<string>("")
  const [appliedPercentage, setAppliedPercentage] = useState("ownerComission")
  const [owners, setOwners] = useState([])
  const [buttonState, setButtonState] = useState(false)
  const [products, setProducts] = useState([])
  const discountTypes = ["Porcentaje", "Monto"]
  const [considerations, setConsiderations] = useState<
    Record<string, Consideration>
  >({
    artista: { type, value },
    corporativo: { type, value },
    da: { type, value },
    prixer: { type, value },
  })

  const handleConsiderations = (
    client: string,
    type: string,
    value: string
  ) => {
    if (type === "type") {
      setConsiderations((prevState) => {
        const updatedClient: any = {
          ...prevState[client],
          type: value,
        }
        return {
          ...prevState,
          [client]: updatedClient,
        }
      })
    } else {
      setConsiderations((prevState) => {
        const updatedClient = {
          ...prevState[client],
          value: value,
        }
        return {
          ...prevState,
          [client]: updatedClient,
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name && !type && !value && !!appliedPercentage) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      setButtonState(true)
      const data = {
        surchargeId: nanoid(6),
        name: name,
        active: active,
        description: description,
        type: type,
        value: value.replace(/[,]/gi, "."),
        appliedProducts: appliedProducts,
        appliedUsers: appliedUsers,
        appliedPercentage: appliedPercentage,
        considerations: considerations,
      }
      const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/create"
      const response = await axios.post(base_url, data)
      if (response.data.success === false) {
        setLoading(false)
        setButtonState(false)
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Creación de recargo exitoso.")

        setActive(false)
        setName("")
        setDescription("")
        setType("")
        setValue("")
        setAppliedProducts([])
        setAppliedUsers("")
        navigate("/product/read")
      }
    }
  }

  const getProducts = async () => {
    setLoading(true)
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-allv1"
    await axios
      .post(base_url)
      .then((response) => {
        setProducts(response.data.products)
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  const getOwnersAndPrixers = async () => {
    setLoading(true)
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/prixer/getOwnersAndPrixers"
    await axios
      .post(base_url)
      .then((response) => {
        setOwners(response.data.users)
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  useEffect(() => {
    getOwnersAndPrixers()
    getProducts()
  }, [])

  const changeAppliedUsers = (e: SelectChangeEvent<string>) => {
    setAppliedUsers(e.target.value)
  }

  return (
    <React.Fragment>
      <Title title="Crear Recargo" />
      <form
        style={{
          height: "auto",
        }}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid2>
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
        <div style={{ display: "flex", marginTop: 10, marginBottom: 20 }}>
          <Grid2 style={{ width: "50%", marginRight: 10 }}>
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
            <div
              style={{ marginTop: 10, display: "flex", alignItems: "center" }}
            >
              <Typography>PVP:</Typography>
              <FormControl
                variant="outlined"
                fullWidth={true}
                required
                style={{ width: "50%", marginRight: 10, marginLeft: 10 }}
              >
                <InputLabel>Tipo</InputLabel>
                <Select
                  style={{ width: "100%" }}
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

              <FormControl
                style={{ width: "50%" }}
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
                    // error={value !== undefined && !isAValidPrice(value)}
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
                      // error={value !== undefined && !isAValidPrice(value)}
                    />
                  )
                )}
              </FormControl>
            </div>
            <Accordion style={{ marginTop: 20 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <FormControlLabel
                  onClick={(event) => {
                    event.stopPropagation()
                    setConsiderations((prev) => {
                      const updatedConsiderations = { ...prev }
                      Object.keys(updatedConsiderations).forEach((client) => {
                        updatedConsiderations[client] = {
                          ...updatedConsiderations[client],
                          type: type,
                          value: value,
                        }
                      })
                      return updatedConsiderations
                    })
                  }}
                  control={
                    <Checkbox
                      color="primary"
                      checked={
                        Object.values(considerations).every(
                          (client) => client.value === value
                        )
                          ? true
                          : false
                      }
                    />
                  }
                  label={"Ajustes"}
                  style={{ color: "#404e5c" }}
                />
              </AccordionSummary>
              <AccordionDetails
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <Typography style={{ width: "40%" }}>Artista:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: "30%", marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      input={<OutlinedInput />}
                      value={considerations.artista.type}
                      onChange={(e) => {
                        handleConsiderations("artista", "type", e.target.value)
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => (
                          <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    style={{ width: "30%" }}
                    variant="outlined"
                    fullWidth={true}
                  >
                    {considerations.artista.type === "Monto" ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        value={considerations.artista.value}
                        onChange={(e) => {
                          handleConsiderations(
                            "artista",
                            "value",
                            e.target.value
                          )
                        }}
                        // error={value !== undefined && !isAValidPrice(value)}
                      />
                    ) : (
                      considerations.artista.type === "Porcentaje" && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  %
                                </InputAdornment>
                              ),
                              inputProps: {
                                min: 1,
                                max: value,
                                shrink: true,
                              },
                            },
                          }}
                          label="Valor"
                          value={considerations.artista.value}
                          onChange={(e) => {
                            handleConsiderations(
                              "artista",
                              "value",
                              e.target.value
                            )
                          }}
                          // error={value !== undefined && !isAValidPrice(value)}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <Typography style={{ width: "40%" }}>Corporativo:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: "30%", marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      input={<OutlinedInput />}
                      value={considerations.corporativo.type}
                      onChange={(e) => {
                        handleConsiderations(
                          "corporativo",
                          "type",
                          e.target.value
                        )
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => (
                          <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    style={{ width: "30%" }}
                    variant="outlined"
                    fullWidth={true}
                  >
                    {considerations.corporativo.type === "Monto" ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        value={considerations.corporativo.value}
                        onChange={(e) => {
                          handleConsiderations(
                            "corporativo",
                            "value",
                            e.target.value
                          )
                        }}
                      />
                    ) : (
                      considerations.corporativo.type === "Porcentaje" && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  %
                                </InputAdornment>
                              ),
                              inputProps: { min: 1, max: value, shrink: true },
                            },
                          }}
                          label="Valor"
                          value={considerations.corporativo.value}
                          onChange={(e) => {
                            handleConsiderations(
                              "corporativo",
                              "value",
                              e.target.value
                            )
                          }}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <Typography style={{ width: "40%" }}>DAs:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: "30%", marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      input={<OutlinedInput />}
                      value={considerations.da.type}
                      onChange={(e) => {
                        handleConsiderations("da", "type", e.target.value)
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => (
                          <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    style={{ width: "30%" }}
                    variant="outlined"
                    fullWidth={true}
                  >
                    {considerations.da.type === "Monto" ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        value={considerations.da.value}
                        onChange={(e) => {
                          handleConsiderations("da", "value", e.target.value)
                        }}
                      />
                    ) : (
                      considerations.da.type === "Porcentaje" && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  %
                                </InputAdornment>
                              ),
                              inputProps: { min: 1, max: value, shrink: true },
                            },
                          }}
                          label="Valor"
                          value={considerations.da.value}
                          onChange={(e) => {
                            handleConsiderations("da", "value", e.target.value)
                          }}
                        />
                      )
                    )}
                  </FormControl>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <Typography style={{ width: "40%" }}>Prixer:</Typography>
                  <FormControl
                    variant="outlined"
                    fullWidth={true}
                    required
                    style={{ width: "30%", marginRight: 10, marginLeft: 10 }}
                  >
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      input={<OutlinedInput />}
                      value={considerations.prixer.type}
                      onChange={(e) => {
                        handleConsiderations("prixer", "type", e.target.value)
                      }}
                    >
                      {discountTypes &&
                        discountTypes.map((type) => (
                          <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    style={{ width: "30%" }}
                    variant="outlined"
                    fullWidth={true}
                  >
                    {considerations.prixer.type === "Monto" ? (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="number"
                        label="Valor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        value={considerations.prixer.value}
                        onChange={(e) => {
                          handleConsiderations(
                            "prixer",
                            "value",
                            e.target.value
                          )
                        }}
                      />
                    ) : (
                      considerations.prixer.type === "Porcentaje" && (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          type="number"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  %
                                </InputAdornment>
                              ),
                              inputProps: { min: 1, max: value, shrink: true },
                            },
                          }}
                          label="Valor"
                          value={considerations.prixer.value}
                          onChange={(e) => {
                            handleConsiderations(
                              "prixer",
                              "value",
                              e.target.value
                            )
                          }}
                        />
                      )
                    )}
                  </FormControl>
                </div>
              </AccordionDetails>
            </Accordion>
          </Grid2>

          <Grid2 container style={{ width: "50%" }}>
            <Grid2>
              <FormControl variant="outlined" fullWidth={true}>
                <TextField
                  variant="outlined"
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
            <Grid2 sx={{ marginTop: 10 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <InputLabel>Prixer / Owner:</InputLabel>
                <Select
                  fullWidth={true}
                  input={<OutlinedInput />}
                  value={appliedUsers}
                  multiple
                  onChange={changeAppliedUsers}
                >
                  {owners &&
                    owners.map((o) => <MenuItem value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
        </div>
        <Divider sx={{ opacity: 0.6 }} variant="middle" />

        <Grid2 container spacing={2} style={{ marginTop: 20 }}>
          <Grid2>
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                if (appliedProducts.length !== products.length) {
                  let v1: string[] = []
                  products.map((product: Product) => v1.push(product.name))
                  setAppliedProducts(v1)
                } else if (appliedProducts.length === products.length) {
                  setAppliedProducts([])
                }
              }}
            />
            Todos los productos
          </Grid2>
          {products &&
            products.map((product: Product) => (
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={buttonState}
          style={{ marginTop: 20 }}
        >
          Crear
        </Button>
      </form>
    </React.Fragment>
  )
}
