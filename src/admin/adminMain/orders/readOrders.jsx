import React, { useEffect, useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { TableCell, TableHead, TableRow, TableBody } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import moment from "moment";
import "moment/locale/es";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    display: "flex",
    flexWrap: "wrap",
    overflow: "hidden",
    alignContent: "space-between",
    padding: 10,
    marginTop: 10,
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    overflow: "hidden",
    padding: 10,
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  form: {
    width: "100%",
  },
  CarouselContent: {
    width: "100%",
    heigh: "40vh",
  },
  dollar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: "50%",
    fontSize: 20,
  },
  base: {
    width: "70px",
    height: "37px",
    padding: "0px",
  },
  switchBase: {
    color: "silver",
    padding: "1px",
    "&$checked": {
      "& + $track": {
        backgroundColor: "silver",
      },
    },
  },
  thumb: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'$'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  thumbTrue: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'Bs'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  track: {
    borderRadius: "20px",
    backgroundColor: "silver",
    opacity: "1 !important",
    "&:after, &:before": {
      color: "black",
      fontSize: "18px",
      position: "absolute",
      top: "6px",
    },
    "&:after": {
      content: "'$'",
      left: "8px",
    },
    "&:before": {
      content: "'Bs'",
      right: "7px",
    },
  },
  checked: {
    color: "#d33f49 !important",
    transform: "translateX(35px) !important",
    padding: "1px",
  },
}));

export default function ReadOrders(props) {
  const classes = useStyles();
  const totalOrders = props.rows?.length;
  const itemsPerPage = 20;
  const noOfPages = Math.ceil(totalOrders / itemsPerPage);
  const [pageNumber, setPageNumber] = useState(1);
  const itemsToSkip = (pageNumber - 1) * itemsPerPage;
  const rowsv2 = props.rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip);
  // const [filters, setFilters] = useState(props.filters);

  const handleID = (event) => {
    props.findOrder(event.target.value);
  };

  const handleCreationDate = (event) => {
    props.handleFilters("creationDate", event.target.value);
    // setFilters({ ...filters, creationDate: event.target.value });
  };

  const handleShippingDate = (event) => {
    props.handleFilters("shippingDate", event.target.value);
  };

  const handleClient = (event) => {
    props.handleFilters("client", event.target.value);
  };

  const handlePayStatus = (event) => {
    props.handleFilters("payStatus", event.target.value);
  };

  const handleStatus = (event) => {
    props.handleFilters("status", event.target.value);
  };

  const handleSeller = (event) => {
    props.handleFilters("seller", event.target.value);
  };

  const handleChangeSeller = async (order, seller) => {
    const url =
      process.env.REACT_APP_BACKEND_URL +
      "/order/updateSeller/" +
      order.orderId;
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      seller: { username: seller },
    };
    await axios.put(url, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        props.setErrorMessage(res.data.message);
        props.setSnackBarError(true);
      }
    });
    props.readOrders();
  };

  return (
    <>
      <Table style={{ overflowX: "scroll" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <TextField
                variant="outlined"
                // fullWidth
                label="ID"
                onChange={handleID}
                style={{ marginLeft: -15, width: "150%" }}
              />
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel id="demo-simple-select-label">
                    Fecha de creación
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={props.filters.creationDate}
                    onChange={handleCreationDate}
                  >
                    <MenuItem key={0} value={"recent"}>
                      Recientes
                    </MenuItem>
                    <MenuItem key={1} value={"previous"}>
                      Anteriores
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Fecha de entrega</InputLabel>
                  <Select
                    value={props.filters.shippingDate}
                    onChange={handleShippingDate}
                  >
                    <MenuItem key={0} value={"coming"}>
                      Próximos
                    </MenuItem>
                    <MenuItem key={1} value={"later"}>
                      Lejanos
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Cliente</InputLabel>
                  <Select value={props.filters.client} onChange={handleClient}>
                    <MenuItem style={{ color: "gray" }} value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    {props.clients &&
                      props.clients.map((c, i) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <Typography color="secondary">Productos</Typography>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel> Status de Pago</InputLabel>
                  <Select
                    value={props.filters.payStatus}
                    onChange={handlePayStatus}
                  >
                    <MenuItem value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    <MenuItem key={0} value={"Pendiente"}>
                      Pendiente
                    </MenuItem>
                    <MenuItem key={1} value={"Pagado"}>
                      Pagado
                    </MenuItem>
                    <MenuItem key={2} value={"Abonado"}>
                      Abonado
                    </MenuItem>
                    <MenuItem key={3} value={"Giftcard"}>
                      Giftcard
                    </MenuItem>
                    <MenuItem key={4} value={"Obsequio"}>
                      Obsequio
                    </MenuItem>
                    <MenuItem key={5} value={"Anulado"}>
                      Anulado
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select value={props.filters.status} onChange={handleStatus}>
                    <MenuItem value={undefined}>
                      <em>Todos</em>
                    </MenuItem>

                    <MenuItem key={0} value={"Por producir"}>
                      Por producir
                    </MenuItem>
                    <MenuItem key={1} value={"En impresión"}>
                      En impresión
                    </MenuItem>
                    <MenuItem key={2} value={"En producción"}>
                      En producción
                    </MenuItem>
                    <MenuItem key={3} value={"Por entregar"}>
                      Por entregar
                    </MenuItem>
                    <MenuItem key={4} value={"Entregado"}>
                      Entregado
                    </MenuItem>
                    <MenuItem key={5} value={"Concretado"}>
                      Concretado
                    </MenuItem>
                    <MenuItem key={6} value={"Detenido"}>
                      Detenido
                    </MenuItem>
                    <MenuItem key={7} value={"Anulado"}>
                      Anulado
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: "flex", justifyContent: "end" }}>
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel>Asesor</InputLabel>
                  <Select value={props.filters.seller} onChange={handleSeller}>
                    <MenuItem style={{ color: "gray" }} value={undefined}>
                      <em>Todos</em>
                    </MenuItem>
                    {props.sellers &&
                      props.sellers?.map((seller, index) => (
                        <MenuItem key={index} value={seller}>
                          {seller}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsv2?.length > 0 &&
            rowsv2.map((row, index) => (
              <>
                <TableRow key={index}>
                  <TableCell align="center">{row.orderId}</TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {moment(row.createdOn).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {moment(row?.shippingData?.shippingDate).format(
                      "DD/MM/YYYY"
                    )}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    {row.basicData?.firstname || row.basicData?.name}{" "}
                    {row.basicData?.lastname}
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    <Button
                      onClick={() => {
                        props.setModalContent(row);
                        props.setIsShowDetails(!props.isShowDetails);
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
                        Detalles
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell align="center" style={{ padding: 10 }}>
                    <FormControl
                      disabled={
                        JSON.parse(localStorage.getItem("adminToken")).area !==
                          "Master" &&
                        (!props.permissions?.detailPay ||
                          row.payStatus === "Pagado")
                      }
                      variant="outlined"
                    >
                      <Select
                        id="payStatus"
                        value={row.payStatus || "Pendiente"}
                        onChange={(e) => {
                          props.handleChangePayStatus(row, e.target.value);
                        }}
                      >
                        <MenuItem key={0} value={"Pendiente"}>
                          Pendiente
                        </MenuItem>
                        <MenuItem key={1} value={"Pagado"}>
                          Pagado
                        </MenuItem>
                        <MenuItem key={2} value={"Abonado"}>
                          Abonado
                        </MenuItem>
                        <MenuItem key={3} value={"Giftcard"}>
                          Giftcard
                        </MenuItem>
                        <MenuItem key={4} value={"Obsequio"}>
                          Obsequio
                        </MenuItem>
                        <MenuItem key={5} value={"Anulado"}>
                          Anulado
                        </MenuItem>
                      </Select>
                      {row.payStatus === "Pagado" && row.payDate && (
                        <Typography variant="body2" color="secondary">
                          el {moment(row.payDate).format("DD/MM/YYYY")}
                        </Typography>
                      )}
                    </FormControl>
                  </TableCell>

                  <TableCell align="center" style={{ padding: 10 }}>
                    <FormControl
                      disabled={
                        !props.permissions?.orderStatus ||
                        (JSON.parse(localStorage.getItem("adminToken")).area !==
                          "Master" &&
                          (row.status === "Cancelada" ||
                            row.status === "Concretado"))
                      }
                      variant="outlined"
                    >
                      <Select
                        id="status"
                        value={row.status}
                        onChange={(e) => {
                          props.handleChangeStatus(row, e.target.value);
                        }}
                      >
                        <MenuItem key={0} value={"Por producir"}>
                          Por producir
                        </MenuItem>
                        <MenuItem key={1} value={"En impresión"}>
                          En impresión
                        </MenuItem>
                        <MenuItem key={2} value={"En producción"}>
                          En producción
                        </MenuItem>
                        <MenuItem key={0} value={"Por entregar"}>
                          Por entregar
                        </MenuItem>
                        <MenuItem key={1} value={"Entregado"}>
                          Entregado
                        </MenuItem>
                        <MenuItem key={2} value={"Concretado"}>
                          Concretado
                        </MenuItem>
                        <MenuItem key={3} value={"Detenido"}>
                          Detenido
                        </MenuItem>
                        <MenuItem key={4} value={"Anulado"}>
                          Anulado
                        </MenuItem>
                      </Select>
                      {row.status === "Concretado" && row.completionDate && (
                        <Typography variant="body2" color="secondary">
                          el {moment(row?.completionDate).format("DD/MM/YYYY")}
                        </Typography>
                      )}
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
                  <TableCell align="center" style={{ padding: 10 }}>
                    <Select
                      variant="outlined"
                      disabled={
                        JSON.parse(localStorage.getItem("adminToken")).area !==
                        "Master"
                      }
                      value={row.createdBy?.username}
                      onChange={(e) => {
                        handleChangeSeller(row, e.target.value);
                      }}
                    >
                      <MenuItem
                        key={0}
                        value={
                          JSON.parse(localStorage.getItem("adminToken"))
                            .firstname +
                          " " +
                          JSON.parse(localStorage.getItem("adminToken"))
                            .lastname
                        }
                      >
                        {JSON.parse(localStorage.getItem("adminToken"))
                          .firstname +
                          " " +
                          JSON.parse(localStorage.getItem("adminToken"))
                            .lastname}
                      </MenuItem>

                      {props.sellers &&
                        props.sellers.map((seller) => (
                          <MenuItem key={seller} value={seller}>
                            {seller}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>
                </TableRow>
              </>
            ))}
        </TableBody>
      </Table>
      {rowsv2?.length < 1 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: 20,
          }}
        >
          <Typography style={{ margin: 20 }} align="center" color="secondary">
            No hay órdenes que coincidan con tu criterio de búsqueda, intenta de
            nuevo.
          </Typography>
          <Button
            style={{
              textTransform: "none",
              backgroundColor: "gainsboro",
              color: "#404e5c",
              width: 200,
            }}
            size="small"
            onClick={() => props.removeFilters()}
          >
            Borrar filtros
          </Button>
        </div>
      )}
      {rowsv2?.length > 0 && (
        <Box
          style={{
            display: "flex",
            alignSelf: "center",
            paddingTop: 5,
            marginBottom: 4,
          }}
        >
          {pageNumber - 3 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(1);
              }}
            >
              {1}
            </Button>
          )}
          {pageNumber - 3 > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 5,
              }}
            >
              ...
            </div>
          )}
          {pageNumber - 2 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber - 2);
              }}
            >
              {pageNumber - 2}
            </Button>
          )}
          {pageNumber - 1 > 0 && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber - 1);
              }}
            >
              {pageNumber - 1}
            </Button>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 80,
              marginRight: 5,
              backgroundColor: "rgb(238, 238, 238)",
              borderRadius: 4,
            }}
          >
            Página {pageNumber}
          </div>
          {pageNumber + 1 <= noOfPages && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber + 1);
              }}
            >
              {pageNumber + 1}
            </Button>
          )}

          {pageNumber + 2 <= noOfPages && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(pageNumber + 2);
              }}
            >
              {pageNumber + 2}
            </Button>
          )}
          {pageNumber + 3 <= noOfPages && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 5,
              }}
            >
              ...
            </div>
          )}
          {pageNumber + 3 <= noOfPages && (
            <Button
              style={{ minWidth: 30, marginRight: 5 }}
              onClick={() => {
                setPageNumber(noOfPages);
              }}
            >
              {noOfPages}
            </Button>
          )}
        </Box>
      )}
    </>
  );
}
