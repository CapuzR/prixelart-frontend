import React, { useState } from "react"
import { useHistory } from "react-router-dom"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"

import Title from "../Title"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { updateMethod } from "./api"

export default function UpdatePaymentMethod({ paymentMethod }) {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [active, setActive] = useState(paymentMethod.active)
  const [name, setName] = useState(paymentMethod.name)
  const [instructions, setInstructions] = useState(paymentMethod.instructions)
  const [paymentData, setPaymentData] = useState(paymentMethod.paymentData)
  const [buttonState, setButtonState] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!instructions || !name) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      setButtonState(true)

      const data = {
        _id: paymentMethod._id,
        active: active,
        name: name,
        instructions: instructions,
        paymentData: paymentData,
        createdOn: paymentMethod.createdOn,
        createdBy: paymentMethod.createdBy,
      }

      const updatedMethod = await updateMethod(data)
      if (updatedMethod.success === false) {
        setButtonState(false)
        showSnackBar(updatedMethod.message)
      } else {
        showSnackBar("Actualización del método de pago exitosa.")
        history.push("/admin/payment-method/read")
      }
    }
  }

  return (
    <React.Fragment>
      <Title>Actualización de Método de pago</Title>
      <form style={{ height: "auto", padding: "15px" }} onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
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
          <Grid2 size={{ xs: 12, md: 3 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                multiline
                fullWidth
                minRows={5}
                id="paymentData"
                label="Datos para el pago:"
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
                label="Intrucciones"
                name="instructions"
                autoComplete="instructions"
                value={instructions}
                onChange={(e) => {
                  setInstructions(e.target.value)
                }}
              />
            </FormControl>
          </Grid2>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
            Actualizar
          </Button>
        </Grid2>
      </form>
    </React.Fragment>
  )
}
