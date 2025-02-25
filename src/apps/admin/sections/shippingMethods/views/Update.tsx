import { useHistory, useLocation } from "react-router-dom"

import Grid2 from "@mui/material/Grid2"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

import Title from "../../../components/Title"
import {
  isAValidName,
  isAValidCi,
  isAValidPhoneNum,
  isAValidEmail,
  isAValidPrice,
} from "utils/validations"
import { useSnackBar, useLoading } from "context/GlobalContext"
import { updateMethod } from "../api"

export default function UpdateShippingMethod({
  shippingMethod,
  setName,
  setPrice,
  setActive,
  active,
  name,
  price,
}) {
  const history = useHistory()

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

      const data = {
        _id: shippingMethod._id,
        active: active,
        name: name,
        price: price.replace(/[,]/gi, "."),
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
        setPrice("")
        history.push("/admin/shipping-method/read")
      }
    }
  }

  return (
    <>
      <Title>Actualización de Método de envío</Title>
      <form noValidate onSubmit={updateShippingMethod}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={active}
              color="primary"
              inputProps={{
                "aria-label": "secondary checkbox",
              }}
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
                  setPrice(e.target.value)
                }}
                error={price !== undefined && !isAValidPrice(price)}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginTop: 20 }}
              disabled={!name || !price || !isAValidPrice(price)}
            >
              Actualizar
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </>
  )
}
