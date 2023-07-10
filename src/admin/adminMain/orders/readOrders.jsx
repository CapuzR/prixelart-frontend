import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TableCell, TableHead, TableRow, TableBody } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

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

  const handleChange = (event) => {
    props.setFilter(event.target.value);
    props.filterOrders(event.target.value);
  };

  return (
    <>
      {props.rows && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">
                <div style={{ display: "flex", justifyContent: "end" }}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label">Fecha</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={props.filter}
                      onChange={handleChange}
                    >
                      <MenuItem value={"recent"}>Recientes</MenuItem>
                      <MenuItem value={"previous"}>Anteriores</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </TableCell>
              <TableCell align="center">
                {/* <div style={{ display: "flex", justifyContent: "end" }}> */}
                {/* <FormControl className={classes.formControl}> */}
                {/* <InputLabel> */}
                Fecha de entrega
                {/* </InputLabel> */}
                {/* <Select value={filter} onChange={handleChange}>
                      <MenuItem value={"recent"}>Próximos</MenuItem>
                      <MenuItem value={"previous"}>Lejanos</MenuItem>
                    </Select> */}
                {/* </FormControl> */}
                {/* </div> */}
              </TableCell>
              <TableCell align="center">Nombre</TableCell>
              <TableCell align="center">Productos</TableCell>
              <TableCell align="center">Status de Pago</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Asesor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.rows &&
              props.rows.map((row, index) => (
                <>
                  <TableRow key={index}>
                    <TableCell align="center">{row.orderId}</TableCell>
                    <TableCell align="center">
                      {row.createdOn.substring(0, 10)}
                    </TableCell>
                    <TableCell align="center">
                      {row.shippingData?.shippingDate?.substring(0, 10)}
                    </TableCell>
                    <TableCell align="center">
                      {row.basicData?.firstname || row.basicData?.name}{" "}
                      {row.basicData?.lastname}
                    </TableCell>
                    <TableCell align="center">
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
                    <TableCell align="center">
                      <FormControl
                        disabled={
                          JSON.parse(localStorage.getItem("adminToken"))
                            .area !== "Master" &&
                          (!props.permissions?.detailPay ||
                            row.payStatus === "Pagado")
                        }
                      >
                        <Select
                          id="payStatus"
                          SelectClassKey
                          value={row.payStatus || "Pendiente"}
                          onChange={(e) => {
                            props.handleChangePayStatus(row, e.target.value);
                          }}
                        >
                          <MenuItem value={"Pendiente"}>Pendiente</MenuItem>
                          <MenuItem value={"Pagado"}>Pagado</MenuItem>
                          <MenuItem value={"Abonado"}>Abonado</MenuItem>
                          <MenuItem value={"Giftcard"}>Giftcard</MenuItem>
                          <MenuItem value={"Obsequio"}>Obsequio</MenuItem>
                          <MenuItem value={"Anulado"}>Anulado</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell align="center">
                      <FormControl
                        disabled={
                          !props.permissions?.orderStatus ||
                          (JSON.parse(localStorage.getItem("adminToken"))
                            .area !== "Master" &&
                            (row.status === "Cancelada" ||
                              row.status === "Concretado"))
                        }
                      >
                        <Select
                          id="status"
                          SelectClassKey
                          value={row.status}
                          onChange={(e) => {
                            props.handleChangeStatus(row, e.target.value);
                          }}
                        >
                          <MenuItem value={"Por producir"}>
                            Por producir
                          </MenuItem>
                          <MenuItem value={"En impresión"}>
                            En impresión
                          </MenuItem>
                          <MenuItem value={"En producción"}>
                            En producción
                          </MenuItem>
                          <MenuItem value={"Por entregar"}>
                            Por entregar
                          </MenuItem>
                          <MenuItem value={"Entregado"}>Entregado</MenuItem>
                          <MenuItem value={"Concretado"}>Concretado</MenuItem>
                          <MenuItem value={"Detenido"}>Detenido</MenuItem>
                          <MenuItem value={"Anulado"}>Anulado</MenuItem>
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
                    <TableCell align="center">
                      {/* <Select
                        disabled={
                          JSON.parse(localStorage.getItem("adminToken"))
                            .area !== "Master"
                        }
                        defaultValue={row.createdBy.username}
                        onChange={(e) => {
                          handleChangeSeller(row, e.target.value);
                        }}
                      >
                        <MenuItem value={row.createdBy.username}> */}
                      {row.createdBy.username}
                      {/* </MenuItem> */}

                      {/* {sellers &&
                          sellers.map((seller) => (
                            <MenuItem value={seller}>{seller}</MenuItem>
                          ))}
                      </Select> */}
                    </TableCell>
                  </TableRow>
                </>
              ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
