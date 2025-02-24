import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"

import Title from "../Title"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import IconButton from "@mui/material/IconButton"
import FormControl from "@mui/material/FormControl"

import Checkbox from "@mui/material/Checkbox"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import InputLabel from "@mui/material/InputLabel"
import ViewListIcon from "@mui/icons-material/ViewList"

import { getAllPrixers } from "../prixers/api"
import { updateConsumer } from "./api"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { Prixer } from "../../../../types/prixer.types"

export default function UpdateConsumer({ consumer, setConsumer }) {
  const history = useHistory()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const today = new Date()
  const minDate = new Date()
  const minimumAge = new Date(minDate.setFullYear(today.getFullYear() - 18))

  const [active, setActive] = useState(Boolean(consumer?.active))
  const [consumerType, setConsumerType] = useState(consumer.consumerType)
  const [consumerFirstname, setConsumerFirstname] = useState(consumer.firstname)
  const [consumerLastname, setConsumerLastname] = useState(consumer.lastname)
  const [username, setUsername] = useState(consumer?.username)
  const [phone, setPhone] = useState(consumer.phone)
  const [email, setEmail] = useState(consumer.email)
  const [billingAddress, setBillingAddress] = useState(consumer.billingAddress)
  const [shippingAddress, setShippingAddress] = useState(
    consumer.shippingAddress
  )
  const [instagram, setInstagram] = useState(consumer.instagram)
  const [birthdate, setBirthdate] = useState(consumer.birthdate || "")
  const [nationalIdType, setNationalIdType] = useState(consumer.nationalIdType)
  const [ci, setCi] = useState(consumer.ci)
  const [gender, setGender] = useState(consumer.gender)
  const [prixers, setPrixers] = useState<Prixer[]>()
  const [selectedPrixer, setSelectedPrixer] = useState<Prixer>()

  const [buttonState, setButtonState] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!consumerFirstname && !consumerLastname && !consumerType) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      setLoading(true)
      setButtonState(true)

      const data = {
        active: active,
        consumerType: consumerType,
        firstname: consumerFirstname,
        lastname: consumerLastname,
        username: username,
        phone: phone,
        email: email,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        instagram: instagram,
        birthdate: birthdate,
        nationalIdType: nationalIdType,
        ci: ci,
        gender: gender,
        _id: consumer._id,
      }
      const response = await updateConsumer(data)

      if (response.data.success === false) {
        setButtonState(false)
        showSnackBar(response.data.message)
      } else {
        showSnackBar("Actualización de consumidor exitosa.")
        history.push("/admin/consumer/read")
        setConsumer(undefined)
      }
    }
  }

  const readPrixers = async () => {
    try {
      setLoading(true)
      const response = await getAllPrixers()
      setPrixers(response)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    readPrixers()
  }, [])

  useEffect(() => {
    setActive(true)
    setConsumerFirstname(selectedPrixer?.firstName)
    setConsumerLastname(selectedPrixer?.lastName)
    setPhone(selectedPrixer?.phone)
    setEmail(selectedPrixer?.email)
    setInstagram(selectedPrixer?.instagram)
  }, [selectedPrixer])

  const handleConsumerAction = (action: string) => {
    history.push({ pathname: action })
  }

  return (
    <React.Fragment>
      <Grid2
        sx={{
          display: "flex",
          padding: 2,
          justifyContent: "space-between",
        }}
      >
        <Title>Actualizar Cliente</Title>
        <IconButton
          onClick={() => {
            handleConsumerAction("read")
          }}
          style={{ right: 10 }}
        >
          <ViewListIcon />
        </IconButton>
      </Grid2>
      <form style={{ padding: "15px" }} noValidate onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 container spacing={3}>
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
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <InputLabel required id="consumerTypeLabel">
                  Tipo de consumidor
                </InputLabel>
                <Select
                  labelId="consumerType"
                  id="consumerType"
                  variant="outlined"
                  value={consumerType}
                  defaultValue="Particular"
                  onChange={(e) => setConsumerType(e.target.value)}
                  label="consumerType"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {[
                    "Particular",
                    "DAs",
                    "Corporativo",
                    "Prixer",
                    "Artista",
                  ].map((n) => (
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
                  required
                  fullWidth
                  id="consumerFirstname"
                  label="Nombres"
                  name="consumerFirstname"
                  autoComplete="consumerFirstname"
                  value={consumerFirstname}
                  onChange={(e) => {
                    setConsumerFirstname(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="consumerLastname"
                  label="Apellidos"
                  name="consumerLastname"
                  autoComplete="consumerLastname"
                  value={consumerLastname}
                  onChange={(e) => {
                    setConsumerLastname(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
            {consumerType === "Prixer" && (
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Prixer</InputLabel>
                  <Select
                    labelId="username"
                    id="username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setSelectedPrixer(
                        prixers.find(
                          (prixer) => prixer.username === e.target.value
                        )
                      )
                    }}
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
                  variant="outlined"
                  value={gender}
                  defaultValue=""
                  onChange={(e) => setGender(e.target.value)}
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
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                  }}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                  }}
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
                  value={birthdate}
                  onChange={(e) => {
                    setBirthdate(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormControl variant="outlined" fullWidth>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Cédula o RIF"
                  value={nationalIdType}
                  onChange={(e) => {
                    setNationalIdType(e.target.value)
                  }}
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
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value)
                  }}
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
                  value={billingAddress}
                  onChange={(e) => {
                    setBillingAddress(e.target.value)
                  }}
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
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value)
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
              Guardar
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </React.Fragment>
  )
}
