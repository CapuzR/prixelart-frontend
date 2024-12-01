import { makeStyles, useTheme } from '@mui/styles';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import { format } from 'utils/utils.js';
import { calculateTotalPrice } from '../../cart/services.ts';
import { useConversionRate, useCurrency, useSnackBar } from 'context/GlobalContext';

import {
  getTotalUnitsPVP,
  getTotalUnitsPVM,
  UnitPriceForOrg,
} from '../pricesFunctions';

const useStyles = makeStyles((theme) => ({
  gridInput: {
    width: '100%',
    marginBottom: '12px',
  },
  textField: {
    marginRight: '8px',
  },
}));

export default function OrderForm({ checkoutState, handleDispatch }) {
  const classes = useStyles();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const theme = useTheme();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [previewVoucher, setPreviewVoucher] = useState();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [balance, setBalance] = useState(0);
  const [discountList, setDiscountList] = useState([]);
  const [sellers, setSellers] = useState([]);
  const prixer = JSON.parse(localStorage?.getItem('token'))?.username;

  // TODO : Debo obtener el saldo del prixer.
  // TODO : Debo obtener los vendedores.
  // TODO : Debo obtener los métodos de pago.

  //Voucher O.O
  // const onImageChange = async (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     props.setPaymentVoucher(e.target.files[0]);
  //     setPreviewVoucher(URL.createObjectURL(e.target.files[0]));
  //   }
  // };

  return (
    <>
      <form noValidate autoComplete="off">
        <Grid container>
          <Grid item lg={12} md={12} sm={12} xs={12} className={classes.gridInput}>
            <AppBar position="static" style={{ borderRadius: 5 }}>
              <Toolbar style={{ fontSize: 20, justifyContent: 'center' }}>Orden de compra</Toolbar>
            </AppBar>
            <div
              style={{
                display: 'flex',
                padding: '8px',
                flexDirection: 'column',
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 'bold' }}>Items:</div>
                <div>
                  <List component="div" disablePadding>
                    {checkoutState.order.lines.map((item, index) => (
                      <>
                        {item.product && item.art && (
                          <>
                            <ListItem>
                              <ListItemText primary={`#${index + 1}`} />
                            </ListItem>
                            <Collapse in={true} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                <ListItem>
                                  <ListItemText
                                    inset
                                    style={{ marginLeft: 0, paddingLeft: 0 }}
                                    primary={
                                      <Grid container>
                                        <Grid item xs={12} md={8}>
                                          Producto: {item.product.name}
                                          <br />
                                          Arte: {item.art.title}
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          md={4}
                                          style={{
                                            display: 'flex',
                                            justifyContent: isMobile ? 'space-between' : '',
                                          }}
                                        >
                                          <div>
                                            Cantidad:
                                            <br></br> {item.quantity || 1}
                                          </div>
                                          <div
                                            style={{
                                              textAlign: 'end',
                                              paddingLeft: 10,
                                            }}
                                          >
                                            Monto:
                                            <br></br>
                                            {currency ? ' Bs' : '$'}
                                            {item.product.price * item.quantity}
                                          </div>
                                        </Grid>
                                      </Grid>
                                    }
                                  />
                                </ListItem>
                              </List>
                            </Collapse>
                            <Divider />
                            {/* TODO : Tengo que ver porque no debería ser posible hacer checkout si faltan productos por definir. */}
                            {/* {getTotalCombinedItems(props.buyState).totalNotCompleted?.length >=
                              1 && (
                              <Typography
                                style={{
                                  fontSize: '11px',
                                  // color: "primary",
                                }}
                              >
                                {getTotalCombinedItems(props.buyState).totalNotCompleted?.length > 1
                                  ? `Faltan ${
                                      getTotalCombinedItems(props.buyState).totalNotCompleted.length
                                    } productos por definir.`
                                  : `Falta 1 producto por definir.`}
                              </Typography>
                            )} */}
                          </>
                        )}
                      </>
                    ))}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Grid item lg={6} md={6} sm={6} xs={6} style={{ paddingLeft: 0 }}>
                        <FormControl
                          variant="outlined"
                          fullWidth
                          style={{ marginTop: 25 }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">Método de pago</InputLabel>
                          <Select
                            input={<OutlinedInput />}
                            value={checkoutState.order.paymentMethod}
                            onChange={(event) => handleDispatch('SET_ORDER_PAYMENT_METHOD', event.target.value)}
                          >
                            {paymentMethods &&
                              paymentMethods.map((m) => <MenuItem value={m}>{m.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                        {/* {props.orderPaymentMethod && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <p align="left">
                                {props?.orderPaymentMethod?.instructions}
                                <br></br>
                                <br></br>
                                {props?.orderPaymentMethod?.paymentData}
                              </p>
                              <div>
                                {props.paymentVoucher && (
                                  <img
                                    src={previewVoucher}
                                    style={{ width: 200, borderRadius: 10 }}
                                  />
                                )}
                                <input
                                  type="file"
                                  id="inputfile"
                                  accept="image/jpeg, image/jpg, image/webp, image/png"
                                  onChange={onImageChange}
                                  style={{ display: "none" }}
                                />
                                <label htmlFor="inputfile">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    component="span"
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    Cargar comprobante
                                  </Button>
                                </label>
                              </div>
                            </div>
                          </>
                        )} */}
                      </Grid>
                      <Grid
                        item
                        lg={6}
                        md={6}
                        sm={6}
                        xs={6}
                        style={{
                          display: 'flex',
                          alignItems: 'end',
                          marginTop: '24px',
                          marginRight: '14px',
                          flexDirection: 'column',
                        }}
                      >
                        {checkoutState.order.paymentMethod?.name === 'Balance Prixer' && (
                          <div
                            style={{
                              backgroundColor: '#d33f49',
                              color: 'white',
                              fontWeight: 'thin',
                              borderRadius: 5,
                              paddingLeft: 5,
                              paddingRight: 5,
                            }}
                          >
                            {currency
                              ? 'Saldo disponible: Bs' +
                                (balance * conversionRate).toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : 'Saldo disponible: $' +
                                balance.toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </div>
                        )}
                        <strong>
                          {`${currency === 'Bs' ? 'Subtotal: Bs' : 'Subtotal: $'}`}
                          {checkoutState.order.subTotal}
                        </strong>
                        {checkoutState.order.tax.length > 0 && checkoutState.order.tax.map((tax) => (
                          <strong>
                            {`IVA: ${tax.name}`}
                            {tax.value}
                          </strong>
                        ))}
                        {checkoutState.order.consumerDetails.shipping.method && currency == 'Bs' ? (
                          <strong>{`Envío: Bs${priceToUI(checkoutState.order.shippingCost * conversionRate)}`}</strong>
                        ) : (
                          checkoutState.order.consumerDetails.shipping.method && (
                            <strong>{`Envío: $${checkoutState.order.shippingCost.toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}</strong>
                          )
                        )}
                        <strong>
                          {`${currency === 'Bs' ? 'Total: Bs' : 'Total: $'}`}
                          {checkoutState.order.total}
                        </strong>
                        <br />
                      </Grid>
                    </div>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ paddingLeft: 0, marginTop: 30 }}
                    >
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          marginTop: 25,
                          alignItems: 'center',
                        }}
                      >
                        <Tooltip
                          // onClick={(e) => setOpenTooltip(!openTooltip)}
                          // open={openTooltip}
                          // onClose={(leaveDelay) => setOpenTooltip(false)}
                          title={'¿Alguno de nuestros asesores te ayudó en el proceso de compra?'}
                          style={{ marginLeft: 5, marginRight: 20 }}
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                        <FormControl
                          variant="outlined"
                          fullWidth
                          // style={{  }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">Asesor</InputLabel>

                          <Select
                            input={<OutlinedInput />}
                            value={checkoutState.seller}
                            onChange={(event) => handleDispatch('SET_SELLER', event.target.value)}
                          >
                            <MenuItem value={undefined}></MenuItem>
                            {sellers && sellers.map((m) => <MenuItem value={m}>{m}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </div>
                    </Grid>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ paddingLeft: 0, marginTop: 30 }}
                    >
                      <TextField
                        variant="outlined"
                        label="Observaciones"
                        fullWidth
                        className={classes.textField}
                        value={checkoutState.observations}
                        onChange={(e) => handleDispatch('SET_OBSERVATIONS', e.target.value)}
                      />
                    </Grid>
                  </List>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
