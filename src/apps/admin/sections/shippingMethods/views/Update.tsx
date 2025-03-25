import { useNavigate, useLocation } from "react-router-dom"

import Grid2 from "@mui/material/Grid2"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

import Title from "../../../components/Title"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { updateMethod } from "../api"
import { ShippingMethod } from "../../../../../types/shippingMethod.types"

interface MethodProps {
  shippingMethod: ShippingMethod
  setName: (x: string) => void
  setPrice: (x: number) => void
  setActive: (x: boolean) => void
  active: boolean
  name: string
  price: number
}

export default function UpdateShippingMethod({
  shippingMethod,
  setName,
  setPrice,
  setActive,
  active,
  name,
  price,
}: MethodProps) {
  const navigate = useNavigate()

  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const updateShippingMethod = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!name || !price) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)

      const data: ShippingMethod = {
        _id: shippingMethod._id,
        active: active,
        name: name,
        price: Number(price),
        createdOn: shippingMethod.createdOn,
        createdBy: shippingMethod.createdBy,
      }

      const updatedMethod = await updateMethod(data)
      if (updatedMethod?.success === false) {
        setLoading(false)
        showSnackBar(updatedMethod?.message)
      } else {
        showSnackBar("Actualización de método de envío exitosa.")
        setActive(true)
        setName("")
        setPrice(0)
        navigate("/admin/shipping-method/read")
      }
    }
  }

  return (
    <>
      <Title title="Actualización de Método de envío"/>
      <form noValidate onSubmit={updateShippingMethod}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={active}
              color="primary"
              onChange={() => {
                setActive(!active)
              }}
            />
            Habilitado
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
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
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true} required>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                required
                label="Precio aproximado"
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value))
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginTop: 20 }}
            >
              Actualizar
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </>
  )
}
