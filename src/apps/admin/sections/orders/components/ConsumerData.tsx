import React, { useEffect, useState } from "react";

import Grid2 from "@mui/material/Grid2";
import Checkbox from "@mui/material/Checkbox";
import Title from "../../../components/Title";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import Autocomplete from "@mui/lab/Autocomplete";
import { AutocompleteInputChangeReason } from "@mui/material";

import { Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { useSnackBar, useLoading } from "@context/GlobalContext";
import { Consumer } from "../../../../../types/consumer.types";
import { Prixer } from "../../../../../types/prixer.types";
import { ShippingMethod } from "../../../../../types/shippingMethod.types";
import { useOrder } from "@context/OrdersContext";
import { getConsumers, getPrixers, getShippingMethods } from "../api";
import { BasicInfo, ConsumerDetails } from "@apps/consumer/checkout/interfaces";

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
  };
});

// Definir el tipo para las opciones
type AutocompleteOption = {
  id: string;
  label: string;
  data: Consumer | Prixer;
  type: 'consumer' | 'prixer';
};

export default function ConsumerData() {
  const { classes } = useStyles();
  const { setLoading } = useLoading();
  const { state, dispatch } = useOrder();
  const { order, prixers, consumers, selectedConsumer, selectedPrixer } = state;
  const { consumerDetails, shipping, billing } = order; //Datos básicos, de envío y de facturación
  const { basic } = consumerDetails;
  // const { billTo } = billing
  const [shippingDataCheck, setShippingDataCheck] = useState(false);
  const [billingDataCheck, setBillingDataCheck] = useState(false);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);

  const [shippingList, setShippingList] = useState<ShippingMethod[]>([]);
  // const [consumers, setConsumers] = useState<Consumer[]>([]);
  // const [prixers, setPrixers] = useState<Prixer[]>([]);
  const [options, setOptions] = useState<Array<{
    id: string;
    label: string;
    data: Consumer | Prixer;
    type: 'consumer' | 'prixer';
  }>>([]);

  const [inputValue, setInputValue] = useState('');

  let today = new Date();
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
  ];
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
  ];
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  let ProdTimes = order.lines.map((line) => {
    if (
      line.item.product &&
      line.item.art &&
      line.item.product.productionTime !== undefined
    ) {
      return line.item.product.productionTime;
    }
  });

  let orderedProdT = ProdTimes.sort((a, b) => {
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    return a - b;
  });

  let readyDate = new Date(
    today.setDate(today.getDate() + Number(orderedProdT[0]))
  );

  const stringReadyDate =
    readyDate.getFullYear() +
    "-" +
    monthsOrder[readyDate.getMonth()] +
    "-" +
    readyDate.getDate();

  const readShippingMethods = async () => {
    try {
      const response = await getShippingMethods();
      dispatch({
        type: "SET_SHIPPING_METHODS",
        payload: response,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const readConsumers = async () => {
    try {
      const response = await getConsumers();
      dispatch({
        type: "SET_CONSUMERS",
        payload: response,
      }); // setConsumer(response.data)
    } catch (error) {
      console.log(error);
    }
  };

  const readPrixers = async () => {
    try {
      const response = await getPrixers();
      dispatch({
        type: "SET_PRIXERS",
        payload: response,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    readShippingMethods();
    readConsumers();
    readPrixers();
    setLoading(false);
  }, []);

  useEffect(() => {
    const combinedOptions: Array<{
      id: string;
      label: string;
      data: Consumer | Prixer;
      type: 'consumer' | 'prixer';
    }> = [];

    // Primero agregamos todos los consumers
    consumers?.forEach((consumer) => {
      combinedOptions.push({
        id: consumer._id,
        label: `C-${consumer.firstname} ${consumer.lastname}`,
        data: consumer,
        type: 'consumer'
      });
    });

    // Luego agregamos prixers que no tengan un consumer correspondiente
    prixers?.forEach((prixer) => {
      const hasMatchingConsumer = consumers?.some(
        consumer => consumer.username === prixer.username
      );

      if (!hasMatchingConsumer) {
        combinedOptions.push({
          id: prixer._id,
          label: `P-${prixer.firstName} ${prixer.lastName}`,
          data: prixer,
          type: 'prixer'
        });
      }
    });

    // Ordenamos las opciones alfabéticamente
    combinedOptions.sort((a, b) => a.label.localeCompare(b.label));

    setOptions(combinedOptions);
  }, [consumers, prixers]);

  const handleShippingDataCheck = () => {
    const newValue = !shippingDataCheck;
    setShippingDataCheck(newValue);

    if (newValue) {
      dispatch({
        type: "SET_SHIPPING_BASIC",
        payload: {
          ...shipping.basic,
          name: basic.name,
          lastName: basic.lastName,
          phone: basic.phone,
          email: basic.email,
          id: basic.id,
          shortAddress: basic.shortAddress,
        },
      });
    } else {
      dispatch({
        type: "SET_SHIPPING_BASIC",
        payload: {
          ...shipping.basic,
        },
      });
    }
  };
  console.log(basic);

  const handleBillingDataCheck = () => {
    const newValue = !billingDataCheck;
    setBillingDataCheck(newValue);
    if (newValue === true) {
      setBillingShDataCheck(false);
    }
    if (newValue) {

      // Si se activa el checkbox, copiar datos básicos a billing
      dispatch({
        type: "SET_BILLING_DETAILS",
        payload: {
          ...billing,
          basic: {
            name: basic.name,
            lastName: basic.lastName,
            phone: basic.phone,
            email: basic.email,
            id: basic.id,
            shortAddress: basic.shortAddress,
          },
          billTo: {
            name: basic.name,
            lastName: basic.lastName,
            phone: basic.phone,
            email: basic.email,
            id: basic.id,
            shortAddress: basic.shortAddress,
          },
        },
      });
    } else {
      // Si se desactiva el checkbox, mantener los datos actuales pero permitir edición
      dispatch({
        type: "SET_BILLING_BASIC",
        payload: {
          ...billing.basic,
        },
      });
    }
  };

  const handleBillingShDataCheck = () => {
    const newValue = !billingShDataCheck;
    setBillingShDataCheck(newValue);
    if (newValue === true) {
      setBillingDataCheck(false);
    }
    if (newValue) {
      // Si se activa el checkbox, copiar datos de shipping a billing
      dispatch({
        type: "SET_BILLING_DETAILS",
        payload: {
          ...billing,
          basic: {
            name: shipping.basic.name,
            lastName: shipping.basic.lastName,
            phone: shipping.basic.phone,
            email: shipping.basic.email,
            id: shipping.basic.id,
            shortAddress: shipping.basic.shortAddress,
          },
          billTo: {
            name: shipping.basic.name,
            lastName: shipping.basic.lastName,
            phone: shipping.basic.phone,
            email: shipping.basic.email,
            id: shipping.basic.id,
            shortAddress: shipping.basic.shortAddress,
          },
        },
      });
    } else {
      // Si se desactiva el checkbox, mantener los datos actuales pero permitir edición
      dispatch({
        type: "SET_BILLING_BASIC",
        payload: {
          ...billing.basic,
        },
      });
    }
  };

  const defaultData = {
    name: "",
    lastName: "",
    phone: "",
    email: "",
    id: "",
    shortAddress: "",
  };

  const handleInputChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setInputValue(newValue);
    if (!newValue) {
      dispatch({ type: 'SET_SELECTED_CONSUMER', payload: undefined });
      dispatch({
        type: 'SET_CONSUMER_BASIC',
        payload: {
          name: '',
          lastName: '',
          phone: '',
          email: '',
          id: '',
          shortAddress: ''
        }
      });
    }
  };

  const handleOptionSelect = (event: React.ChangeEvent<{}>, value: any) => {
    if (value) {
      const selectedData = value.data;
      if (value.type === 'consumer') {
        dispatch({ type: 'SET_SELECTED_CONSUMER', payload: selectedData });
        dispatch({
          type: 'SET_CONSUMER_BASIC',
          payload: {
            name: selectedData.firstname,
            lastName: selectedData.lastname,
            phone: selectedData.phone,
            email: selectedData.email,
            id: selectedData.id,
            shortAddress: selectedData.address
          }
        });
      } else if (value.type === 'prixer') {
        dispatch({ type: 'SET_SELECTED_PRIXER', payload: selectedData });
        dispatch({
          type: 'SET_CONSUMER_BASIC',
          payload: {
            name: selectedData.firstName,
            lastName: selectedData.lastName,
            phone: selectedData.phone,
            email: selectedData.email,
            id: selectedData.id,
            shortAddress: selectedData.address
          }
        });
      }
    }
  };

  const handleInput = (value: string, type: keyof BasicInfo, area: string) => {
    if (area === "basic") {
      dispatch({
        type: "SET_CONSUMER_BASIC",
        payload: { ...basic, [type]: value },
      });
    } else if (area === "shipping") {
      dispatch({
        type: "SET_SHIPPING_BASIC",
        payload: { ...shipping.basic, [type]: value },
      });
    } else if (area === "billing") {
      console.log(value, type, area);
      // Asegurarnos de que el estado se actualice correctamente
      const updatedBasic = {
        ...billing.basic,
        [type]: value,
      };

      dispatch({
        type: "SET_BILLING_BASIC",
        payload: updatedBasic,
      });

      // Si el checkbox de datos básicos está activo, también actualizar billTo
      if (billingDataCheck) {
        dispatch({
          type: "SET_BILLING_DETAILS",
          payload: {
            ...billing,
            billTo: updatedBasic,
          },
        });
      }
    }
  };

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
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : option.label.substring(2)
              }
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onChange={handleOptionSelect}
              value={basic?.name ? {
                id: selectedConsumer?._id || selectedPrixer?._id || '',
                label: `${selectedConsumer ? 'C-' : 'P-'}${basic.name} ${basic.lastName}`,
                data: selectedConsumer || selectedPrixer,
                type: selectedConsumer ? 'consumer' : 'prixer'
              } : null}
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
                />
              )}
              openOnFocus
              autoHighlight
              clearOnBlur={false}
              selectOnFocus={false}
              blurOnSelect={false}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.trim().toLowerCase();
                return options.filter(option => 
                  option.label.substring(2).toLowerCase().includes(inputValue)
                );
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  {option.label.substring(2)}
                  {option.type === 'prixer' && (
                    <span style={{ marginLeft: 8, color: '#666' }}>
                      (Prixer)
                    </span>
                  )}
                </li>
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
              <Select
                label="Tipo de cliente"
                className={classes.textField}
                value={consumerDetails.type || ""}
                onChange={(e) => {
                  dispatch({
                    type: "SET_CONSUMER_DETAILS",
                    payload: {
                      ...consumerDetails,
                      type: e.target.value as string,
                    },
                  });
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un tipo</em>
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
          <Grid2 size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shippingDataCheck}
                  onChange={handleShippingDataCheck}
                />
              }
              label="Igual a Datos básicos"
            />
          </Grid2>
          <Grid2 size={{ sm: 4, xs: 12 }} className={classes.gridInput}>
            <TextField
              variant="outlined"
              id="shipping-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={shippingDataCheck}
              value={shipping.basic?.name || ""}
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
              value={shipping.basic?.lastName}
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
              value={shipping.basic?.phone}
              // error={
              //   shippingDataCheck
              //     ? props.values?.phone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.phone)
              //     : props.values?.shippingPhone != undefined &&
              //       !UtilVals.isAValidPhoneNum(props.values?.shippingPhone)
              // }
              onChange={(e) => {
                handleInput(e.target.value, "phone", "shipping");
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
              value={shipping.basic?.shortAddress}
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
                  dispatch({
                    type: "SET_SHIPPING_DETAILS",
                    payload: { ...shipping, method: e.target.value },
                  });
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
                onChange={(e) => {
                  dispatch({
                    type: "SET_SHIPPING_DETAILS",
                    payload: { ...shipping, shippingDate: e.target.value },
                    // this need to be the full object at this level?
                  });
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
          <Grid2 size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={billingDataCheck}
                  onChange={handleBillingDataCheck}
                />
              }
              label="Igual a Datos básicos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={billingShDataCheck}
                  onChange={handleBillingShDataCheck}
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
              id="billing-name"
              label="Nombre"
              fullWidth
              className={classes.textField}
              disabled={billingDataCheck || billingShDataCheck}
              value={billing.basic?.name || ""}
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
              value={billing.basic?.lastName}
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
                billing.basic?.phone
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
              value={billing?.company || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_BILLING_DETAILS",
                  payload: {
                    ...billing,
                    company: e.target.value,
                  },
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
              value={billing.basic?.id || ""}
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
              value={billing.basic?.shortAddress}
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
  );
}
