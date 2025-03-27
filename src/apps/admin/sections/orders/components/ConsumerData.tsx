import React, { useEffect, useState } from "react"
import axios from "axios"
import Grid2 from "@mui/material/Grid2"
import Checkbox from "@mui/material/Checkbox"
import Title from "../../../components/Title"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import FormControlLabel from "@mui/material/FormControlLabel"
import InputAdornment from "@mui/material/InputAdornment"
import LocalPhoneIcon from "@mui/icons-material/LocalPhone"
import EmailIcon from "@mui/icons-material/Email"
import HomeIcon from "@mui/icons-material/Home"
import BusinessIcon from "@mui/icons-material/Business"
import Autocomplete from "@mui/lab/Autocomplete"
import { Theme, Typography } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import { useSnackBar, useLoading } from "@context/GlobalContext"
import { Consumer } from "../../../../../types/consumer.types"
import { Prixer } from "../../../../../types/prixer.types"
import { ShippingMethod } from "../../../../../types/shippingMethod.types"

interface ConsumerProps {
  setConsumer: (x: Consumer) => void
  setShippingData: (x: any) => void
  setValues: (x: any) => void
  values: any
  basicData: any
  setSelectedPrixer: (x: any) => void
  setSelectedConsumer: (x: any) => void
  setConsumerType: (x: any) => void
  setBasicData: (x: any) => void
  consumerType: string
  shippingData: any
  setShippingMethod: (x: any) => void
  setBillingData: (x: any) => void
  billingData: any
}
const useStyles = makeStyles()((theme: Theme) => {
  return {
    gridInput: {
      display: "flex",
      width: "100%",
      marginBottom: "12px",
    },
    textField: {
      marginRight: "8px",
    },
  }
})

export default function ConsumerData({
  setConsumer,
  setShippingData,
  setValues,
  values,
  basicData,
  setSelectedPrixer,
  setSelectedConsumer,
  setConsumerType,
  setBasicData,
  consumerType,
  shippingData,
  setShippingMethod,
  setBillingData,
  billingData,
}: ConsumerProps) {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [shippingDataCheck, setShippingDataCheck] = useState(true)
  const [shippingList, setShippingList] = useState<ShippingMethod[]>([])
  const [billingDataCheck, setBillingDataCheck] = useState(true)
  const [billingShDataCheck, setBillingShDataCheck] = useState(false)
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [prixers, setPrixers] = useState<Prixer[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef(null)
  let today = new Date()
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const monthsOrder = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ]
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ]

  let ProdTimes = buyState.map((item) => {
    if (item.product && item.art && item.product.productionTime !== undefined) {
      return item.product.productionTime
    }
  })

  let orderedProdT = ProdTimes.sort(function (a, b) {
    if (a.toLowerCase() > b.toLowerCase()) {
      return 1
    }
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1
    }
    return 0
  })

  let readyDate = new Date(
    today.setDate(today.getDate() + Number(orderedProdT[0]))
  )

  const stringReadyDate =
    readyDate.getFullYear() +
    "-" +
    monthsOrder[readyDate.getMonth()] +
    "-" +
    readyDate.getDate()

  const getShippingMethods = () => {
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/shipping-method/read-all-v2"
    axios
      .get(base_url)
      .then((response) => {
        setShippingList(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getConsumers = () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-all"
    axios
      .post(base_url)
      .then((response) => {
        setConsumers(response.data)
        setConsumer(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getPrixers = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read-all-full"
    await axios
      .get(base_url)
      .then((response) => {
        setPrixers(response.data.prixers)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    setLoading(true)
    getShippingMethods()
    getConsumers()
    getPrixers()
    setLoading(false)
  }, [])

  const handleShippingDataCheck = () => {
    if (shippingDataCheck) {
      setShippingData({
        ...props.shippingData,
        shippingName: "",
        shippingLastName: "",
        shippingPhone: "",
        shippingAddress: "",
      })
    } else {
      setValues({
        ...props.shippingData,
        shippingName: values.name,
        shippingLastName: values.lastName,
        shippingPhone: values.phone,
        shippingAddress: values.address,
      })
    }

    setShippingDataCheck(!shippingDataCheck)
  }

  useEffect(() => {
    let updatedv2: string[] = []
    const updated = consumers?.filter((consumer) =>
      consumer.firstname?.toLowerCase().includes(basicData?.name?.toLowerCase())
    )
    updated.map((p) => {
      updatedv2.push(p.firstname + ", " + p.lastname)
    })

    const updatedv3 = prixers?.filter((prixer) =>
      prixer?.firstName?.toLowerCase().includes(basicData?.name?.toLowerCase())
    )

    updatedv3.map((p) => {
      if (updatedv2.includes(p.firstName + ", " + p.lastName)) {
        return
      } else {
        updatedv2.push(p.firstName + ", " + p.lastName)
      }
    })

    setOptions(updatedv2)
  }, [basicData?.name])

  const handleInputChange = (event, value, reason) => {
    if (reason === "clear") {
      setSelectedPrixer(undefined)
      setSelectedConsumer(undefined)
      setConsumerType("Particular")
      setBasicData(undefined)
    } else if (event?.type === "change") {
      setBasicData({
        ...basicData,
        name: value,
      })
    } else if (event?.type === "click") {
      const valuev2 = value.split(",")
      let prixer = prixers.find(
        (prixer) =>
          prixer?.firstName === valuev2[0] &&
          prixer?.lastName === valuev2[1]?.trim()
      )
      let selected = consumers.find(
        (consumer) =>
          consumer.firstname === valuev2[0] &&
          consumer.lastname === valuev2[1]?.trim()
      )
      if (selected) {
        setSelectedConsumer(selected)
        setConsumerType(selected.consumerType)

        if (selected.consumerType === "Prixer") {
          setSelectedPrixer(prixer)
          setConsumerType("Prixer")
        }
        setBasicData({
          ...basicData,
          name: valuev2[0],
          lastname: valuev2[1]?.trim(),
          phone: selected?.phone,
          email: selected?.email,
          address: selected?.address,
          ci: selected?.ci,
        })
      }
      if (prixer) {
        setSelectedPrixer(prixer)
        setBasicData({
          ...basicData,
          name: valuev2[0],
          lastname: valuev2[1]?.trim(),
          phone: prixer?.phone,
          email: prixer?.email,
          address: prixer?.address,
          ci: prixer?.ci,
        })
        setConsumerType("Prixer")
      } else if (prixer === undefined && selected?.username) {
        prixer = prixers.find(
          (prixer) => prixer?.username === selected.username
        )
        setSelectedPrixer(prixer)
      }
    }
  }

  return (
    <>
      <Grid2 container spacing={2}>
        <Grid2 container style={{ marginTop: 20 }}>
          <Title title="Información del cliente" />
        </Grid2>
        <Grid2 container>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <Autocomplete
              freeSolo
              options={options}
              getOptionLabel={(option) => option}
              onInputChange={handleInputChange}
              value={basicData?.name}
              fullWidth
              style={{ marginRight: 8 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  value={basicData?.name}
                  onChange={(e) =>
                    setBasicData({
                      ...basicData,
                      name: e.target.value,
                    })
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              className={classes.textField}
              value={basicData?.lastname}
              onChange={(e) =>
                setBasicData({
                  ...basicData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>

          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Cédula o RIF"
              fullWidth
              helperText="ej: V-12345679 o V-1234567-0"
              className={classes.textField}
              value={basicData?.ci}
              onChange={(e) =>
                setBasicData({
                  ...basicData,
                  ci: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={basicData?.phone}
              //   error={!UtilVals.isAValidPhoneNum(props.values?.phone)}
              onChange={(e) =>
                setBasicData({
                  ...basicData,
                  phone: e.target.value,
                })
              }
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalPhoneIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Correo"
              fullWidth
              className={classes.textField}
              value={basicData?.email}
              onChange={(e) =>
                setBasicData({
                  ...basicData,
                  email: e.target.value,
                })
              }
              // error={!UtilVals.isAValidEmail(props.values?.email)}
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <FormControl
              style={{ minWidth: "100%", marginTop: 15 }}
              variant="outlined"
            >
              <InputLabel>Tipo de cliente</InputLabel>
              <Select
                label="Método de entrega"
                className={classes.textField}
                value={consumerType}
                onChange={(e) => {
                  setConsumerType(e.target.value)
                }}
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
          <Grid2 className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              fullWidth
              label="Dirección"
              className={classes.textField}
              multiline
              minRows={3}
              helperText="Incluir todos los detalles posibles, incluidas referencias."
              value={basicData?.address}
              onChange={(e) =>
                setBasicData({
                  ...basicData,
                  address: e.target.value,
                })
              }
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid2>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 container style={{ marginTop: 20 }}>
          <Title title="Datos de entrega" />
        </Grid2>
        <Grid2 container>
          <Grid2>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shippingDataCheck}
                  onChange={() => {
                    handleShippingDataCheck()
                  }}
                />
              }
              label="Igual a Datos básicos"
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={shippingDataCheck}
              value={
                shippingDataCheck
                  ? basicData?.name
                    ? basicData?.name
                    : ""
                  : shippingData?.name
              }
              onChange={(e) =>
                setShippingData({
                  ...shippingData,
                  name: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              disabled={shippingDataCheck}
              className={classes.textField}
              value={
                shippingDataCheck
                  ? basicData?.lastname
                    ? basicData?.lastname
                    : ""
                  : shippingData?.lastname
              }
              onChange={(e) =>
                setShippingData({
                  ...shippingData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              disabled={shippingDataCheck}
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={
                shippingDataCheck
                  ? basicData?.phone
                    ? basicData?.phone
                    : ""
                  : shippingData?.phone
              }
              // error={
              //   shippingDataCheck
              //     ? props.values?.phone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.phone)
              //     : props.values?.shippingPhone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
              // }
              onChange={(e) => {
                setShippingData({
                  ...shippingData,
                  phone: e.target.value,
                })
              }}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid2>
          <Grid2 className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              fullWidth
              label="Dirección de envio"
              className={classes.textField}
              multiline
              disabled={shippingDataCheck}
              minRows={3}
              helperText="Incluir todos los detalles posibles, incluidas referencias."
              value={
                shippingDataCheck
                  ? basicData?.address
                    ? basicData?.address
                    : ""
                  : shippingData?.address
              }
              onChange={(e) =>
                setShippingData({
                  ...shippingData,
                  address: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid2>
          <Grid2 size={{ md: 6, xs: 12 }} className={classes.gridInput}>
            <FormControl style={{ minWidth: "100%" }} variant="outlined">
              <InputLabel>Método de entrega</InputLabel>
              <Select
                id="shippingMethod"
                label="Método de entrega"
                className={classes.textField}
                value={shippingData?.shippingMethod?.name}
                onChange={(e) => {
                  setShippingData({
                    ...shippingData,
                    shippingMethod: e.target.value,
                  })
                  setShippingMethod(e.target.value)
                }}
              >
                <MenuItem value="" key={"vacío"}>
                  <em></em>
                </MenuItem>
                {shippingList &&
                  shippingList.map((n, i) => (
                    <MenuItem key={i} value={n.name}>
                      {n.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ md: 6, xs: 12 }} className={classes.gridInput}>
            <FormControl style={{ minWidth: "100%" }} variant="outlined">
              <TextField
                style={{
                  width: "100%",
                }}
                label="Fecha de Entrega"
                type="date"
                variant="outlined"
                // format="dd-MM-yyyy"
                defaultValue={stringReadyDate}
                value={shippingData?.shippingDate}
                error={values?.today < stringReadyDate}
                // min={stringReadyDate}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setShippingData({
                    ...shippingData,
                    shippingDate: e.target.value,
                  })
                }}
              />
            </FormControl>
          </Grid2>
          {buyState.length > 0 && (
            <Grid2>
              <div style={{ marginTop: 10, marginLeft: 10 }}>
                {"El pedido estará listo el día " +
                  days[readyDate.getDay()] +
                  " " +
                  readyDate.getDate() +
                  " de " +
                  months[readyDate.getMonth()] +
                  "."}
              </div>
            </Grid2>
          )}
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <Grid2 container style={{ marginTop: 20 }}>
          <Title title="Datos de facturación" />
        </Grid2>
        <Grid2 container>
          <Grid2>
            <FormControlLabel
              control={
                <Checkbox
                  checked={billingDataCheck}
                  onChange={(e) => {
                    if (billingShDataCheck) {
                      setBillingDataCheck(!billingDataCheck)
                      setBillingShDataCheck(!billingShDataCheck)
                    } else {
                      setBillingDataCheck(!billingDataCheck)
                    }
                  }}
                />
              }
              label="Igual a Datos básicos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={billingShDataCheck}
                  onChange={(e) => {
                    if (billingDataCheck) {
                      setBillingShDataCheck(!billingShDataCheck)
                      setBillingDataCheck(!billingDataCheck)
                    } else {
                      setBillingShDataCheck(!billingShDataCheck)
                    }
                  }}
                />
              }
              label="Igual a Datos de entrega"
            />
          </Grid2>
          <Grid2
            size={{
              sm: 4,
              xs: 12,
            }}
            className={classes.gridInput}
          >
            <TextField
              variant="outlined"
              id="standard-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={
                billingDataCheck
                  ? basicData?.name
                    ? basicData?.name
                    : ""
                  : billingShDataCheck
                    ? shippingData?.name
                      ? shippingData?.name
                      : ""
                    : billingData?.name
              }
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  name: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2
            size={{
              sm: 4,
              xs: 12,
            }}
            className={classes.gridInput}
          >
            <TextField
              variant="outlined"
              id="standard-name"
              label="Apellido"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={
                billingDataCheck
                  ? basicData?.lastname
                    ? basicData?.lastname
                    : ""
                  : billingShDataCheck
                    ? shippingData?.lastname
                      ? shippingData?.lastname
                      : ""
                    : billingData?.lastname
              }
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  lastname: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2
            size={{
              sm: 4,
              xs: 12,
            }}
            className={classes.gridInput}
          >
            <TextField
              variant="outlined"
              id="standard-name"
              label="Telefono"
              fullWidth
              disabled={billingDataCheck || billingShDataCheck}
              className={classes.textField}
              helperText="ej: 584141234567 o +584141234567 o 04143201028"
              value={
                billingDataCheck
                  ? basicData?.phone
                    ? basicData?.phone
                    : ""
                  : billingShDataCheck
                    ? shippingData?.phone
                      ? shippingData?.phone
                      : ""
                    : billingData?.phone
              }
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  phone: e.target.value,
                })
              }
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid2>
          <Grid2
            size={{
              sm: 8,
              xs: 12,
            }}
            className={classes.gridInput}
          >
            <TextField
              variant="outlined"
              id="standard-name"
              label="Razón Social"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={billingData?.billingCompany}
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  billingCompany: e.target.value,
                })
              }
              required
              margin="normal"
            />
          </Grid2>
          <Grid2
            size={{
              sm: 4,
              xs: 12,
            }}
            className={classes.gridInput}
          >
            <TextField
              variant="outlined"
              id="standard-name"
              label="RIF"
              fullWidth
              disabled={billingDataCheck || billingShDataCheck}
              className={classes.textField}
              helperText="ej: V-12345679 o V-1234567-0"
              value={
                billingDataCheck
                  ? basicData?.ci
                    ? basicData?.ci
                    : ""
                  : billingData?.Ci
              }
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  ci: e.target.value,
                })
              }
              margin="normal"
            />
          </Grid2>
          <Grid2 className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="standard-name"
              fullWidth
              label="Dirección de facturación"
              multiline
              minRows={3}
              disabled={billingDataCheck || billingShDataCheck}
              className={classes.textField}
              value={
                billingDataCheck
                  ? basicData?.address
                    ? basicData?.address
                    : ""
                  : billingShDataCheck
                    ? shippingData?.address
                      ? shippingData?.address
                      : ""
                    : billingData?.address
              }
              onChange={(e) =>
                setBillingData({
                  ...billingData,
                  address: e.target.value,
                })
              }
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid2>
        </Grid2>
      </Grid2>
    </>
  )
}
