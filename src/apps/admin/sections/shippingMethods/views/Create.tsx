import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import Title from "../../../components/Title"
import Grid2 from "@mui/material/Grid2"
import Checkbox from "@mui/material/Checkbox"
import TextField from "@mui/material/TextField"
import FormControl from "@mui/material/FormControl"
import Button from "@mui/material/Button"

import { createMethod } from "../api"
import { useSnackBar, useLoading } from "context/GlobalContext"

export default function CreateShippingMethod() {
  const [active, setActive] = useState<boolean>(true)
  const [name, setName] = useState<string>()
  const [price, setPrice] = useState<string>()

  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const adminToken = localStorage.getItem("adminToken")
    const adminData = adminToken ? JSON.parse(adminToken).username : null

    const data = {
      active: active,
      name: name,
      createdOn: new Date(),
      createdBy: adminData,
      price: price,
    }

    const newMethod = await createMethod(data)

    if (newMethod?.success === false) {
      setLoading(false)
      showSnackBar(newMethod?.message)
    } else {
      showSnackBar(
        `Registro del método de envío ${newMethod?.newShippingMethod?.name} exitoso.`
      )
      setActive(true)
      setName("")
      setPrice("")
      navigate({ pathname: "/admin/shipping-method/read" })
    }
  }

  return (
    <>
      <Title title={"Agregar método de envío"} />
      <form noValidate onSubmit={handleSubmit}>
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
              Crear
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </>
  )
}
