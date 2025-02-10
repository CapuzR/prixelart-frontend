import React, { useState } from "react"
import { useHistory } from "react-router-dom"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"

import Title from "../Title"

import { createMethod } from "./api"
import { useSnackBar, useLoading } from "context/GlobalContext"

export default function CreatePaymentMethod() {
  const [active, setActive] = useState<boolean>(true)
  const [name, setName] = useState<string>()
  const [instructions, setInstructions] = useState<string>()
  const [paymentData, setPaymentData] = useState<string>()
  const history = useHistory()

  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const data = {
      active: active,
      name: name,
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
      instructions: instructions,
      paymentData: paymentData
    }
    const newMethod = await createMethod(data)

    if (newMethod.success === false) {
      showSnackBar(newMethod.message)
    } else {
      showSnackBar("Registro del método de pago exitoso.")
      setActive(true)
      setName("")
      setInstructions("")
      setPaymentData("")
      history.push({ pathname: "/admin/payment-method/read" })
    }
  }

  return (
    <React.Fragment>
      <Title>Agregar método de pago</Title>
      <form style={{ padding: 15 }} noValidate onSubmit={handleSubmit}>
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
          <Grid2 size={{ xs: 12, sm: 3 }}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="name"
              label="Nombre"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                minRows={5}
                id="paymentData"
                label="Datos para el pago"
                name="paymentData"
                autoComplete="paymentData"
                value={paymentData}
                onChange={(e) => {
                  setPaymentData(e.target.value)
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                multiline
                fullWidth
                minRows={5}
                id="instructions"
                label="Instrucciones"
                name="instructions"
                autoComplete="instructions"
                value={instructions}
                onChange={(e) => {
                  setInstructions(e.target.value)
                }}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!name}
          style={{ marginTop: 20 }}
        >
          Crear
        </Button>
      </form>
    </React.Fragment>
  )
}
