import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import util from "../utils/utils";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import BusinessIcon from "@material-ui/icons/Business";
import HomeIcon from "@material-ui/icons/Home";
import EmailIcon from "@material-ui/icons/Email";
import LocalPhoneIcon from "@material-ui/icons/LocalPhone";
import { Typography } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  gridInput: {
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}));

function OrderForm(props) {
  const classes = useStyles();
  const theme = useTheme();

  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getTotalPrice = (state) => {
    let prices = [];
    state.map(
      (item) =>
        item.product &&
        item.art &&
        prices.push(item.product.publicEquation * item.quantity)
    );
    let total = prices.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const getTotalCombinedItems = (state) => {
    const totalNotCompleted = state.filter(
      (item) => !item.art || !item.product
    );
    return {
      totalNotCompleted,
    };
  };

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    return iva;
    // let prices = [];
    // state.map(
    //   (item) =>
    //     item.product &&
    //     item.art &&
    //     prices.push(item.product.publicEquation * 0.16)
    // );
    // let total = prices.reduce(function (a, b) {
    //   return a + b;
    // });
    // return total;
  };

  return (
    <>
      {/* <h2>Datos de la orden</h2> */}
      <form noValidate autoComplete="off">
        <Grid container>
          <Grid
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className={classes.gridInput}
          >
            <AppBar position="static" style={{ borderRadius: 5 }}>
              <Toolbar>Orden de compra</Toolbar>
            </AppBar>
            <div
              style={{
                display: "flex",
                padding: "8px",
              }}
            >
              <div style={{ width: "100%" }}>
                <div style={{ fontWeight: "bold" }}>Items:</div>
                <div>
                  <List component="div" disablePadding>
                    {props.buyState?.map((item, index) => (
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
                                          {item.product.name +
                                            " X " +
                                            item.art.title}
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          md={4}
                                          style={{
                                            display: "flex",
                                            justifyContent: isMobile
                                              ? "space-between"
                                              : "",
                                          }}
                                        >
                                          <div>
                                            Cantidad: {item.quantity || 1}
                                          </div>
                                          <div
                                            style={{
                                              textAlign: "end",
                                              paddingLeft: 10,
                                            }}
                                          >
                                            {`Precio: $${
                                              item.product.publicEquation *
                                              (item.quantity || 1)
                                            }`}
                                          </div>
                                        </Grid>
                                      </Grid>
                                    }
                                  />
                                </ListItem>
                              </List>
                            </Collapse>
                            <Divider />
                            {getTotalCombinedItems(props.buyState)
                              .totalNotCompleted?.length >= 1 && (
                              <Typography
                                style={{
                                  fontSize: "11px",
                                  // color: "primary",
                                }}
                              >
                                {getTotalCombinedItems(props.buyState)
                                  .totalNotCompleted?.length > 1
                                  ? `Faltan ${
                                      getTotalCombinedItems(props.buyState)
                                        .totalNotCompleted.length
                                    } productos por definir.`
                                  : `Falta 1 producto por definir.`}
                              </Typography>
                            )}
                          </>
                        )}
                      </>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid
                        item
                        lg={6}
                        md={6}
                        sm={6}
                        xs={6}
                        style={{ paddingLeft: 0 }}
                      >
                        <FormControl
                          variant="outlined"
                          fullWidth
                          style={{ marginTop: 25 }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">
                            Método de pago
                          </InputLabel>
                          <Select
                            input={
                              <OutlinedInput
                                name="age"
                                id="outlined-age-simple"
                              />
                            }
                            value={props.orderPaymentMethod}
                            onChange={(event) =>
                              props.setOrderPaymentMethod(event.target.value)
                            }
                          >
                            <MenuItem value={"PM"}>Pago Movil</MenuItem>
                            <MenuItem value={"TRANSFER"}>
                              Transferencia
                            </MenuItem>
                            <MenuItem value={"PANAMA"}>Banco Panamá</MenuItem>
                            <MenuItem value={"ZELLE"}>Zelle</MenuItem>
                            <MenuItem value={"USD"}>
                              Efectivo en dólares
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        item
                        lg={6}
                        md={6}
                        sm={6}
                        xs={6}
                        style={{
                          display: "flex",
                          alignItems: "end",
                          marginTop: "24px",
                          marginRight: "14px",
                          flexDirection: "column",
                        }}
                      >
                        <strong>{`Subtotal: $${getTotalPrice(
                          props.buyState
                        ).toFixed(2)}`}</strong>
                        <strong>
                          {`IVA: $${getIvaCost(props.buyState).toFixed(2)}`}
                        </strong>
                        <strong>{`Total: $${
                          getTotalPrice(props.buyState) +
                          getIvaCost(props.buyState)
                        }`}</strong>
                        <br />
                      </Grid>
                    </div>
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

export default OrderForm;
