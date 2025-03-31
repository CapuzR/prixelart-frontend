import React, { useEffect, useState } from "react"

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
import { AutocompleteInputChangeReason } from "@mui/material"

import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

import { useSnackBar, useLoading } from "@context/GlobalContext"
import { Consumer } from "../../../../../types/consumer.types"
import { Prixer } from "../../../../../types/prixer.types"
import { ShippingMethod } from "../../../../../types/shippingMethod.types"
import { useOrder } from "@context/OrdersContext"
import { getConsumers, getPrixers, getShippingMethods } from "../api"
import { BasicInfo, ConsumerDetails } from "@apps/consumer/checkout/interfaces"

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

export default function ConsumerData() {
  const { classes } = useStyles()
  const { setLoading } = useLoading()
  const { state, dispatch } = useOrder()
  const { order } = state
  const { consumerDetails, shipping, billing } = order //Datos básicos, de envío y de facturación
  const { basic } = consumerDetails
  // const { billTo } = billing
  const [shippingDataCheck, setShippingDataCheck] = useState(true)
  const [billingDataCheck, setBillingDataCheck] = useState(true)
  const [billingShDataCheck, setBillingShDataCheck] = useState(false)

  const [shippingList, setShippingList] = useState<ShippingMethod[]>([])
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [prixers, setPrixers] = useState<Prixer[]>([])
  const [options, setOptions] = useState<string[]>([])

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

  let ProdTimes = order.lines.map((line) => {
    if (
      line.item.product &&
      line.item.art &&
      line.item.product.productionTime !== undefined
    ) {
      return line.item.product.productionTime
    }
  })

  let orderedProdT = ProdTimes.sort((a, b) => {
    if (a === undefined) return 1
    if (b === undefined) return -1
    return a - b
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

  const readShippingMethods = async () => {
    try {
      const response = await getShippingMethods()
      dispatch({
        type: "SET_SHIPPING_METHODS",
        payload: response,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const readConsumers = async () => {
    try {
      const response = await getConsumers()
      dispatch({
        type: "SET_CONSUMERS",
        payload: response,
      }) // setConsumer(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const readPrixers = async () => {
    try {
      const response = await getPrixers()
      dispatch({
        type: "SET_PRIXERS",
        payload: response,
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setLoading(true)
    readShippingMethods()
    readConsumers()
    readPrixers()
    setLoading(false)
  }, [])

  const handleShippingDataCheck = () => {
    // FIX this function!!!
    if (shippingDataCheck) {
    //   setShippingData({
    //     ...props.shippingData,
    //     shippingName: "",
    //     shippingLastName: "",
    //     shippingPhone: "",
    //     shippingAddress: "",
    //   })
    // } else {
    //   setValues({
    //     ...props.shippingData,
    //     shippingName: values.name,
    //     shippingLastName: values.lastName,
    //     shippingPhone: values.phone,
    //     shippingAddress: values.address,
    //   })
    }

    setShippingDataCheck(!shippingDataCheck)
  }

  useEffect(() => {
    let updatedv2: string[] = []
    const updated = consumers?.filter((consumer) =>
      consumer.firstname?.toLowerCase().includes(basic?.name?.toLowerCase())
    )
    updated.map((p) => {
      updatedv2.push(p.firstname + ", " + p.lastname)
    })

    const updatedv3 = prixers?.filter((prixer) =>
      prixer?.firstName?.toLowerCase().includes(basic?.name?.toLowerCase())
    )

    updatedv3.map((p) => {
      if (updatedv2.includes(p.firstName + ", " + p.lastName)) {
        return
      } else {
        updatedv2.push(p.firstName + ", " + p.lastName)
      }
    })

    setOptions(updatedv2)
  }, [basic?.name])

  const defaultData = {
    consumerDetails: {
      basic: {
        name: "",
        id: "",
        lastName: "",
        email: "",
        phone: "",
        shortAddress: "",
      },
      type: "Particular",
      selectedAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
      },
      addresses: [],
    },
    shipping: {
      basic: {
        name: "",
        id: "",
        lastName: "",
        email: "",
        phone: "",
        shortAddress: "",
      },
      address: {
        recepient: {
          name: "",
          id: "",
          lastName: "",
          email: "",
          phone: "",
          shortAddress: "",
        },
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          reference: "",
        },
      },
      preferredDeliveryDate: undefined,
      estimatedShippingDate: undefined,
      estimatedDeliveryDate: undefined,
    },
    billing: {
      basic: {
        name: "",
        id: "",
        lastName: "",
        email: "",
        phone: "",
        shortAddress: "",
      },
      billTo: {
        name: "",
        id: "",
        lastName: "",
        email: "",
        phone: "",
        shortAddress: "",
      },
      address: {
        recepient: {
          name: "",
          id: "",
          lastName: "",
          email: "",
          phone: "",
          shortAddress: "",
        },
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          reference: "",
        },
      },
    },
  }

  const handleInputChange = (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    if (reason === "clear") {
      // setSelectedPrixer(undefined)
      // setSelectedConsumer(undefined)
      // setConsumerType("Particular")
      dispatch({
        type: "RESET_BASIC_DATA",
        payload: {
          consumerDetails: defaultData.consumerDetails,
          shipping: defaultData.shipping,
          billing: defaultData.billing,
        },
      })
    } else if (event?.type === "change") {
      const form = basic
      form.name = value

      dispatch({
        type: "SET_CONSUMER_BASIC",
        payload: form,
      })
    }
    // else if (event?.type === "click") {
    //   const valuev2 = value.split(",")
    //   let prixer = prixers.find(
    //     (prixer) =>
    //       prixer?.firstName === valuev2[0] &&
    //       prixer?.lastName === valuev2[1]?.trim()
    //   )
    //   let selected = consumers.find(
    //     (consumer) =>
    //       consumer.firstname === valuev2[0] &&
    //       consumer.lastname === valuev2[1]?.trim()
    //   )
    //   if (selected) {
    //     setSelectedConsumer(selected)
    //     setConsumerType(selected.consumerType)

    //     if (selected.consumerType === "Prixer") {
    //       setSelectedPrixer(prixer)
    //       setConsumerType("Prixer")
    //     }
    //     setBasic({
    //       ...basic,
    //       name: valuev2[0],
    //       lastname: valuev2[1]?.trim(),
    //       phone: selected?.phone,
    //       email: selected?.email,
    //       address: selected?.address,
    //       ci: selected?.ci,
    //     })
    //   }
    //   if (prixer) {
    //     setSelectedPrixer(prixer)
    //     setBasic({
    //       ...basic,
    //       name: valuev2[0],
    //       lastname: valuev2[1]?.trim(),
    //       phone: prixer?.phone,
    //       email: prixer?.email,
    //       address: prixer?.address,
    //       ci: prixer?.ci,
    //     })
    //     setConsumerType("Prixer")
    //   } else if (prixer === undefined && selected?.username) {
    //     prixer = prixers.find(
    //       (prixer) => prixer?.username === selected.username
    //     )
    //     setSelectedPrixer(prixer)
    //   }
    // }
  }

  const handleInput = (value: string, type: keyof BasicInfo, area: string) => {
    const form = basic
    form[type] = value

    if (area === "basic") {
      dispatch({
        type: "SET_CONSUMER_BASIC",
        payload: form,
        // this need to be the full object at this level?
      })
    } else if (area === "shipping") {
      dispatch({
        type: "SET_SHIPPING_BASIC",
        payload: form,
        // this need to be the full object at this level?
      })
    } else if (area === "billing") {
      dispatch({
        type: "SET_BILLING_BASIC",
        payload: form,
        // this need to be the full object at this level?
      })
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
              value={basic?.name}
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
                  value={basic?.name}
                  onChange={(e) => handleInput(e.target.value, "name", "basic")}
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
              value={basic?.lastName}
              onChange={(e) => handleInput(e.target.value, "lastName", "basic")}
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
              value={basic?.id}
              onChange={(e) => handleInput(e.target.value, "id", "basic")}
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
              value={basic?.phone}
              //   error={!UtilVals.isAValidPhoneNum(props.values?.phone)}
              onChange={(e) => handleInput(e.target.value, "phone", "basic")}
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
              value={basic?.email}
              onChange={(e) => handleInput(e.target.value, "email", "basic")}
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
              {/* <Select
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
              </Select> */}
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
              value={basic?.shortAddress}
              onChange={(e) =>
                handleInput(e.target.value, "shortAddress", "basic")
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
              value={shipping.basic.name}
              onChange={(e) => handleInput(e.target.value, "name", "shipping")}
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
              value={shipping.basic.lastName}
              onChange={(e) =>
                handleInput(e.target.value, "lastName", "shipping")
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
              value={shipping.basic.phone}
              // error={
              //   shippingDataCheck
              //     ? props.values?.phone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.phone)
              //     : props.values?.shippingPhone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
              // }
              onChange={(e) => {
                handleInput(e.target.value, "phone", "shipping")
              }}
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
              value={shipping.basic.shortAddress}
              onChange={(e) =>
                handleInput(e.target.value, "shortAddress", "shipping")
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
          <Grid2 size={{ md: 6, xs: 12 }} className={classes.gridInput}>
            <FormControl style={{ minWidth: "100%" }} variant="outlined">
              <InputLabel>Método de entrega</InputLabel>
              <Select
                id="shippingMethod"
                label="Método de entrega"
                className={classes.textField}
                value={
                  typeof shipping.method !== "string"
                    ? shipping?.method?.name
                    : shipping?.method
                }
                onChange={(e) => {
                  // setShippingData({
                  //   ...shippingData,
                  //   shippingMethod: e.target.value,
                  // })
                  // setShippingMethod(e.target.value)
                  dispatch({
                    type: "SET_SHIPPING_DETAILS",
                    payload: { ...shipping, method: e.target.value },
                    // this need to be the full object at this level?
                  })

                  // handleInput(e.target.value, "method", "shipping")
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
                value={shipping?.shippingDate}
                // error={values?.today < stringReadyDate}
                // min={stringReadyDate}
                className={classes.textField}
                slotProps={{
                  input: {
                    inputProps: {
                      shrink: true,
                    },
                  },
                }}
                onChange={(e) => {
                  // setShippingData({
                  //   ...shippingData,
                  //   shippingDate: e.target.value,
                  // })
                  dispatch({
                    type: "SET_SHIPPING_DETAILS",
                    payload: { ...shipping, shippingDate: e.target.value },
                    // this need to be the full object at this level?
                  })
                }}
              />
            </FormControl>
          </Grid2>
          {order.lines.length > 0 && (
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
              value={billing.basic.name}
              onChange={(e) => handleInput(e.target.value, "name", "billing")}
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
              value={billing.basic.lastName}
              onChange={(e) =>
                handleInput(e.target.value, "lastName", "billing")
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
                // billingDataCheck
                //   ? basic?.phone
                //     ? basic?.phone
                //     : ""
                //   : billingShDataCheck
                //     ? shippingData?.phone
                //       ? shippingData?.phone
                //       : ""
                //     : billingData?.phone
                billing.basic.phone
              }
              onChange={(e) => handleInput(e.target.value, "phone", "billing")}
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
              value={billing?.company}
              onChange={(e) =>
                dispatch({
                  type: "SET_BILLING_DETAILS",
                  payload: { ...billing, company: e.target.value },
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
              value={billing.basic.id}
              onChange={(e) => handleInput(e.target.value, "id", "billing")}
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
              value={billing.basic.shortAddress}
              onChange={(e) =>
                handleInput(e.target.value, "shortAddress", "billing")
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
