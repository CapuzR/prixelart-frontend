import { useTheme } from '@mui/styles';
import Grid2 from '@mui/material/Grid2';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useConversionRate, useCurrency } from 'context/GlobalContext';

import { CheckoutState, Tax } from '../interfaces.js';
import useStyles from './order.styles.js';

interface OrderSummaryProps {
  checkoutState: CheckoutState;
  newSubTotal: number;
}

const Order: React.FC<OrderSummaryProps> = ({ checkoutState, newSubTotal }) => {
  const classes = useStyles();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const theme = useTheme<Theme>();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [balance, setBalance] = useState(0);

  // TODO : Debo obtener el saldo del prixer.
  // TODO : Debo obtener los vendedores.
  // TODO : Debo obtener los métodos de pago.

  //Voucher O.O
  // xd
  // const onImageChange = async (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     props.setPaymentVoucher(e.target.files[0]);
  //     setPreviewVoucher(URL.createObjectURL(e.target.files[0]));
  //   }
  // };

  useEffect(() => {

    checkoutState.order.subTotal = newSubTotal;

    const taxes: Tax[] = [];

    // IVA  16%
    const ivaValue = 16;
    const ivaAmount = newSubTotal * (ivaValue / 100);

    console.log('IVA Amount:', ivaAmount);

    taxes.push({
      id: 'iva',
      name: 'IVA:',
      value: ivaValue,
      amount: ivaAmount,
    });

    // PaymentMethod = "Efectivo $", IGTF tax 3%
    if (checkoutState.order.billing?.method === 'Efectivo $') {
      const igtfValue = 3;
      const igtfAmount = newSubTotal * (igtfValue / 100);

      console.log('IGTF Amount:', igtfAmount);
      taxes.push({
        id: 'igtf',
        name: 'IGTF:',
        value: igtfValue,
        amount: igtfAmount,
      });
    }

    checkoutState.order.tax = taxes;

    const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);

    console.log('Total Taxes:', totalTaxes);

    checkoutState.order.total = parseFloat((newSubTotal + totalTaxes).toFixed(2));
  }, [checkoutState]);


  return (
    <div style={{ width: '700px' }}>
      <form noValidate autoComplete="off">
        <Grid2 container>
          <Grid2 size={{ lg: 12, md: 12, sm: 12, xs: 12 }} className={classes.gridInput}>
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
                    {checkoutState.order.lines.map((line, index) => (
                      <>
                        {line.item.product && line.item.art && (
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
                                      <Grid2 container>
                                        <Grid2 size={{ md: 8, xs: 12 }}>
                                          Producto: {line.item.product.name}
                                          <br />
                                          Arte: {line.item.art.title}
                                        </Grid2>
                                        <Grid2
                                          size={{ md: 4, xs: 12 }}
                                          style={{
                                            display: 'flex',
                                            justifyContent: isMobile ? 'space-between' : '',
                                          }}
                                        >
                                          <div>
                                            Cantidad:
                                            <br></br> {line.quantity}
                                          </div>
                                          <div
                                            style={{
                                              textAlign: 'end',
                                              paddingLeft: 10,
                                            }}
                                          >
                                            Monto:
                                            <br></br>
                                            {currency === 'Bs' ? 'Bs ' : '$ '}
                                            {currency === 'Bs' ? (line.item.price * line.quantity * conversionRate).toLocaleString('de-DE', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }) : (line.item.price * line.quantity)}
                                          </div>
                                        </Grid2>
                                      </Grid2>
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
                        justifyContent: 'end',
                      }}
                    >
                      {/* <Grid item lg={6} md={6} sm={6} xs={6} style={{ paddingLeft: 0 }}>
                        <FormControl
                          variant="outlined"
                          style={{ marginTop: 25 }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">Método de pago</InputLabel>
                          <Select
                            input={<OutlinedInput />}
                            value={checkoutState.order.billing.method}
                            // onChange={(event) => handleDispatch('SET_ORDER_PAYMENT_METHOD', event.target.value)}
                          >
                            {paymentMethods &&
                              paymentMethods.map((m) => <MenuItem value={m}>{m.name}</MenuItem>)}
                          </Select>
                        </FormControl> */}
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
                      {/* </Grid> */}
                      <Grid2
                        size={{ lg: 6, md: 6, sm: 6, xs: 6 }}
                        style={{
                          display: 'flex',
                          alignItems: 'end',
                          marginTop: '24px',
                          marginRight: '14px',
                          flexDirection: 'column',
                        }}
                      >
                        {checkoutState.order.billing?.method === 'Balance Prixer' && (
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
                          {`${currency === 'Bs' ? 'Subtotal: Bs ' : 'Subtotal: $'}`}
                          {currency === 'Bs'
                            ? (checkoutState.order.subTotal * conversionRate).toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                            : checkoutState.order.subTotal.toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </strong>
                        {checkoutState.order.tax.length > 0 &&
                          checkoutState.order.tax.map((tax) => (
                            <strong key={tax.id}>
                              {`${tax.name} (${tax.value}%) : ${currency === 'Bs'
                                ? 'Bs ' +
                                (tax.amount * conversionRate).toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                : '$' +
                                tax.amount.toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                }`}
                            </strong>
                          ))}

                        {checkoutState.order.shipping.method &&
                          typeof checkoutState.order.shippingCost !== 'undefined' && (
                            currency === 'Bs' ? (
                              <strong>
                                {`Envío: Bs${(
                                  checkoutState.order.shippingCost * conversionRate
                                ).toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`}
                              </strong>
                            ) : (
                              <strong>
                                {`Envío: $${checkoutState.order.shippingCost.toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`}
                              </strong>
                            )
                          )}
                        <strong>
                          {`${currency === 'Bs' ? 'Total: Bs ' : 'Total: $'}`}
                          {currency === 'Bs'
                            ? (checkoutState.order.total * conversionRate).toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                            : checkoutState.order.total.toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </strong>
                        <br />
                      </Grid2>
                    </div>
                  </List>
                </div>
              </div>
            </div>
          </Grid2>
        </Grid2>
      </form>
    </div>
  );
}

export default Order;