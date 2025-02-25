import React, { useState } from "react"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { Checkbox } from "@mui/material"

import { useConsumerForm } from "@context/ConsumerFormContext"
import { Prixer } from "../../../../../types/prixer.types"

export default function ConsumerForm({ handleSubmit, prixers }) {
  const { state, dispatch } = useConsumerForm()

  const today = new Date()
  const minDate = new Date()
  const minimumAge = new Date(minDate.setFullYear(today.getFullYear() - 18))
  const [selectedPrixer, setSelectedPrixer] = useState<Prixer | undefined>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name as keyof typeof state,
      value: e.target.value,
    })
  }

  return (
    <form style={{ padding: "15px" }} noValidate onSubmit={handleSubmit}>
      <Grid2 container spacing={2}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12 }}>
            <Checkbox
              checked={state.active}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={handleChange}
            />
            Habilitado
          </Grid2>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <InputLabel required id="consumerTypeLabel">
                Tipo de consumidor
              </InputLabel>
              <Select
                labelId="consumerType"
                id="consumerType"
                variant="outlined"
                name="consumerType"
                value={state.consumerType}
                defaultValue="Particular"
                onChange={handleChange}
                label="consumerType"
              >
                <MenuItem value="">
                  <em></em>
                </MenuItem>
                {["Particular", "DAs", "Corporativo", "Prixer", "Artista"].map(
                  (n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="consumerFirstname"
                label="Nombres"
                name="firstname"
                autoComplete="consumerFirstname"
                value={state.firstname}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastname"
                label="Apellidos"
                name="consumerLastname"
                autoComplete="consumerLastname"
                value={state.lastname}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          {/* Falta integrar el Autocompletar del Select al Reducer */}
          {state.consumerType === "Prixer" && (
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Prixer</InputLabel>
                <Select
                  labelId="username"
                  id="username"
                  name="username"
                  variant="outlined"
                  value={state.username}
                  onChange={
                    handleChange
                    // setSelectedPrixer(
                    //   prixers.find(
                    //     (prixer) => prixer.username === e.target.value
                    //   )
                    // )
                  }
                  label="Prixer"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {prixers.map((n) => (
                    <MenuItem key={n.username} value={n.username}>
                      {n.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          )}
          <Grid2 size={{ xs: 12, md: 2 }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="consumerTypeLabel">Género</InputLabel>
              <Select
                labelId="gender"
                id="gender"
                name="gender"
                variant="outlined"
                value={state.gender}
                defaultValue=""
                onChange={handleChange}
                label="Género"
              >
                <MenuItem value="">
                  <em></em>
                </MenuItem>
                {["Masculino", "Femenino"].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                fullWidth
                minRows={2}
                id="phone"
                label="Teléfono"
                name="phone"
                autoComplete="phone"
                value={state.phone}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                fullWidth
                rows={2}
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                value={state.email}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                fullWidth
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                defaultValue={minimumAge}
                id="birthdate"
                label="Fecha de nacimiento"
                name="birthdate"
                autoComplete="birthdate"
                value={state.birthdate}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                fullWidth
                // id="nationalId"
                label="Cédula o RIF"
                name="nationalId"
                value={state.nationalId}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                fullWidth
                id="instagram"
                label="Instagram"
                name="instagram"
                autoComplete="instagram"
                value={state.instagram}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                multiline
                minRows={3}
                fullWidth
                id="billingAddress"
                label="Dirección de facturación"
                name="billingAddress"
                autoComplete="billingAddress"
                value={state.billingAddress}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth>
              <TextField
                variant="outlined"
                multiline
                minRows={3}
                fullWidth
                id="shippingAddress"
                label="Dirección de entrega"
                name="shippingAddress"
                autoComplete="shippingAddress"
                value={state.shippingAddress}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginTop: 20 }}
          >
            Guardar
          </Button>
        </Grid2>
      </Grid2>
    </form>
  )
}
