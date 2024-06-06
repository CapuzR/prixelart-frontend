import { React, useState, useEffect } from "react";
import axios from "axios";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment from "moment";
import "moment/locale/es";

const useStyles = makeStyles((theme) => ({
  paper1: {
    position: "absolute",
    width: "80%",
    maxHeight: "90%",
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
    display: "flex",
    flexDirection: "row",
  },
}));

export default function MovementRecord(props) {
  const classes = useStyles();
  const [movements, setMovements] = useState();

  const getMovements = async (account) => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/movement/readByPrixer";
    await axios
      .post(base_url, {
        adminToken: localStorage.getItem("adminTokenV"),
        _id: account,
      })
      .then((res) => {
        setMovements(res.data.movements);
      });
  };

  // const deleteMov = async () => {
  //   const url = process.env.REACT_APP_BACKEND_URL + "/movement/deleteByPrixer";

  //   await axios.put(url, {
  //     adminToken: localStorage.getItem("adminTokenV"),
  //     _id: props.selectedPrixer.account,
  //   });
  //   setOpen(true);
  //   setMessage("Rol de Prixer agregado a todos los usuarios.");
  // };

  // function handleKeyDown(event) {
  //   if (event.key === "*") {
  //     deleteMov();
  //   } else return;
  // }

  // document.addEventListener("keydown", handleKeyDown);

  useEffect(() => {
    getMovements(props.selectedPrixer.account);
  }, []);

  return (
    <Grid container className={classes.paper1}>
      <div
        style={{
          display: "flex",
          width: "100%",

          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Historial de
          {" " +
            props.selectedPrixer?.firstName +
            " " +
            props.selectedPrixer?.lastName}
        </Typography>

        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </div>

      {movements?.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Fecha efectiva</TableCell>
              <TableCell align="center">Descripción</TableCell>
              <TableCell align="center">Monto</TableCell>
              <TableCell align="center">Fecha</TableCell>
              <TableCell align="center">Creado por</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((mov) => (
              <TableRow>
                <TableCell align="center">
                  {moment(mov?.date).format("DD/MM/YYYY") ||
                    moment(mov.createdOn).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>{mov.description}</TableCell>
                <TableCell align="right">
                  {mov.type === "Retiro" && "-"}$
                  {mov.value
                    .toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    .replace("-", "")}
                </TableCell>
                <TableCell align="center">
                  {moment(mov.createdOn).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center">{mov.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography style={{ display: "flex", justifyContent: "center" }}>
          Aún no hay movimientos registrados para este Prixer.
        </Typography>
      )}
    </Grid>
  );
}
