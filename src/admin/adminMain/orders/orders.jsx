import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Title from "../Title";
import {
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Typography,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Table from "@material-ui/core/Table";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "none",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
  fab: {
    right: 0,
    position: "absolute",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    // maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

function Orders() {
  const classes = useStyles();
  // const history = useHistory();
  // const location = useLocation();
  const theme = useTheme();

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [rows, setRows] = useState();
  const [modalContent, setModalContent] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    readOrders();
  }, []);

  const readOrders = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/read-all";
    axios
      .get(base_url)
      .then((response) => {
        setRows(response.data.orders);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const deleteOrder = async (id) => {
    const URI = process.env.REACT_APP_BACKEND_URL + "/order/delete/" + id;
    await axios.delete(URI);
    readOrders();
  };

  const handleClose = () => {
    setIsShowDetails(false);
  };

  const handleChangeStatus = async (id, status) => {
    const URI = process.env.REACT_APP_BACKEND_URL + "/order/update/" + id;
    await axios.put(URI, { status: status });
    readOrders();
  };

  return (
    <div style={{ position: "relative" }}>
      <Backdrop
        className={classes.backdrop}
        open={loading}
        transitionDuration={3000}
      >
        <CircularProgress />
      </Backdrop>
      <Grid container spacing={3} style={{ margin: isDesktop ? "12px" : "" }}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Title>Órdenes</Title>
              <Fab
                color="primary"
                size="small"
                aria-label="edit"
                onClick={() => {
                  setLoading(true);
                  readOrders();
                  setLoading(false);
                }}
              >
                <RefreshIcon />
              </Fab>
            </div>

            {rows && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">ID</TableCell>
                    <TableCell align="center">Fecha</TableCell>
                    <TableCell align="center">Nombre</TableCell>
                    <TableCell align="center">Productos</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                    {/* <TableCell align="center">Total</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows &&
                    rows.map((row, index) => (
                      <>
                        <TableRow key={index}>
                          <TableCell align="center">{row.orderId}</TableCell>
                          <TableCell align="center">{row.createdOn}</TableCell>
                          <TableCell align="center">
                            {row.createdBy.firstname} {row.createdBy.lastname}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              onClick={() => {
                                setIsShowDetails(!isShowDetails);
                                setModalContent(row);
                              }}
                              style={{
                                padding: 10,
                                textTransform: "none",
                                backgroundColor: "#eee",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {row.requests?.map((item) => (
                                  <div>
                                    {item.art.title +
                                      " X " +
                                      item.product.name +
                                      " X " +
                                      item.quantity}
                                  </div>
                                ))}
                              </div>
                            </Button>
                          </TableCell>

                          <TableCell align="center">${row.total}</TableCell>
                          <TableCell align="center">
                            <FormControl disabled={row.status !== "Procesando"}>
                              <Select
                                SelectClassKey
                                value={row.status}
                                onChange={(e) => {
                                  handleChangeStatus(
                                    row.orderId,
                                    e.target.value
                                  );
                                }}
                              >
                                <MenuItem value={"Procesando"}>
                                  Procesando
                                </MenuItem>

                                <MenuItem value={"Cancelada"}>
                                  Cancelada
                                </MenuItem>
                                <MenuItem value={"Completada"}>
                                  Completada
                                </MenuItem>
                              </Select>
                            </FormControl>
                            {/* <Fab
                              color="default"
                              style={{ width: 35, height: 35 }}
                              aria-label="Delete"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteOrder(row.orderId);
                                readOrders();
                              }}
                            >
                              <DeleteIcon />
                            </Fab> */}
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Modal
        // xl={12}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        open={isShowDetails}
        // onClose={!}
      >
        <Grid container className={classes.paper2}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid
            style={{
              display: "flex",
              flexDirection: rows?.lenght > 2 || isMobile ? "column" : "row",
              // margin: "10px 0px 20px 0px",
            }}
            item
            xs={12}
            sm={6}
            md={6}
            lg={6}
          >
            {modalContent?.requests.map((item, index) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "0px 20px 20px 0px",
                  // borderWidth: 1,
                }}
              >
                <strong>
                  {"Item #"}
                  {index + 1}
                </strong>
                <div>{"Arte: " + item.art.title}</div>
                <div>{"Id: " + item.art.artId}</div>
                <div style={{ marginBottom: 10 }}>
                  {"Prixer: " + item.art.prixerUsername}
                </div>
                <div>{"Producto: " + item.product.name}</div>
                <div>{"Id: " + item.product._id}</div>
                {item.product.attributes.map((a, i) => {
                  return (
                    <p
                      style={{
                        // fontSize: 12,
                        padding: 0,
                        margin: 0,
                        marginBottom: 10,
                      }}
                    >
                      {a.name + ": "}
                      {item.product.selection[i]}
                    </p>
                  );
                })}
                <div>{"Cantidad: " + item.quantity}</div>
              </div>
            ))}
          </Grid>

          <Grid item xs={12} sm={12} md={6} lg={3} style={{ marginBottom: 20 }}>
            <strong>Datos de pago</strong>
            <div>{"Subtotal: $" + modalContent?.subtotal.toFixed(2)}</div>
            <div>{"IVA: $" + modalContent?.tax.toFixed(2)}</div>
            <div style={{ marginBottom: 10 }}>
              {"Total: $" + modalContent?.total.toFixed(2)}
            </div>
            <div style={{ marginBottom: 40 }}>
              {"Forma de pago: " + modalContent?.orderPaymentMethod}
            </div>
            {/* <div>{"Dirección: " + row.billingAddress}</div> */}
            {/* </Grid>
          <Grid item xs={12} sm={12} md={6} lg={3}> */}
            <strong>Datos de envío</strong>
            <div>
              {"Nombre: " +
                modalContent?.createdBy.firstname +
                " " +
                modalContent?.createdBy.lastname}
            </div>
            <div>{"Email: " + modalContent?.createdBy.email}</div>
            <div>{"Teléfono: " + modalContent?.createdBy.phone}</div>
            <div>
              {"Dirección de cobro: " + modalContent?.createdBy.billingAddress}
            </div>
            <div>
              {"Dirección de envío: " + modalContent?.createdBy.shippingAddress}
            </div>
          </Grid>
        </Grid>
      </Modal>
    </div>
  );
}

export default Orders;
