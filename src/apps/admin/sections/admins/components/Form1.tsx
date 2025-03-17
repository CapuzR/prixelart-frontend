import React, { useState, useEffect } from "react"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import InputAdornment from "@mui/material/InputAdornment"
import FormControl from "@mui/material/FormControl"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import { Switch, Typography } from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

import { useAdminForm } from "@context/AdminFormContext"
import {
  isAValidEmail,
  isAValidPassword,
  isAValidUsername,
} from "utils/validations"

export default function AdminForm({ handleSubmit, roles }) {
  const { state, dispatch } = useAdminForm()
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name as keyof typeof state,
      value: e.target.value,
    })
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 3 }}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="username"
              aria-label="username"
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={state.username}
              onChange={handleChange}
            />
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 3 }}>
          <FormControl variant="outlined" fullWidth required>
            <InputLabel>Área</InputLabel>
            <Select
              value={state.area}
              onChange={handleChange}
              data-testid="area-select"
              name="area"
            >
              {roles &&
                roles.map((role) => (
                  <MenuItem value={role.area} key={role.area}>
                    {role.area}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <FormControl
            style={{
              display: "flex",
              flexDirection: "row",
              justifyItems: "center",
              alignItems: "center",
            }}
            variant="outlined"
            required
          >
            <Typography color="secondary">
              Mostrar como Asesor de ventas
            </Typography>
            <Switch
              checked={state.isSeller}
              onChange={handleChange}
              color="primary"
            />
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 6 }}>
          <FormControl variant="outlined" fullWidth={true}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="firstname"
              label="Nombre"
              aria-label="firstname"
              name="firstname"
              autoComplete="firstname"
              value={state.firstname}
              onChange={handleChange}
            />
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 6 }}>
          <FormControl variant="outlined" fullWidth={true}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="lastname"
              label="Apellido"
              aria-label="Apellido"
              name="lastname"
              autoComplete="lastname"
              value={state.lastname}
              onChange={handleChange}
            />
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 8 }}>
          <FormControl variant="outlined" fullWidth={true}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              aria-label="Correo electrónico"
              name="email"
              autoComplete="email"
              value={state.email}
              onChange={handleChange}
            />
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <FormControl variant="outlined" fullWidth={true}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="phone"
              label="Teléfono"
              aria-label="Teléfono"
              name="phone"
              autoComplete="phone"
              value={state.phone}
              onChange={handleChange}
            />
          </FormControl>
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <FormControl variant="outlined">
            <TextField
              variant="outlined"
              id="Contraseña"
              label="Contraseña"
              aria-label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={state.password}
              error={isAValidPassword(state.password)}
              onChange={handleChange}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        </Grid2>
        <Button variant="contained" color="primary" type="submit">
          Crear
        </Button>
      </Grid2>
    </form>
  )
}
