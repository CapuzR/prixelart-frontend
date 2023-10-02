import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Backdrop from "@material-ui/core/Backdrop";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MDEditor from "@uiw/react-md-editor";
import { Typography, Checkbox } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "100%",
      height: "100%",
    },
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
}));

export default function BestSellers(props) {
  const classes = useStyles();
  const [value, setValue] = useState("");
  const [products, setProducts] = useState();
  const [loading, setLoading] = useState(false);
  const [bestSellers, setBestSellers] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const getProducts = async () => {
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-allv1";
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setProducts(response.data.products);
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  const getBestSellers = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/getBestSellers";
    await axios
      .get(base_url)
      .then((response) => {
        setBestSellers(response.data.bestSellers);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getProducts();
    getBestSellers();
  }, []);

  const closeAd = () => {
    setSnackBarError(false);
  };

  const updateBestSellers = async () => {
    let data = [];
    bestSellers.map((prod) => {
      data.push(prod._id);
    });
    const base_url = process.env.REACT_APP_BACKEND_URL + "/updateBestSellers";
    await axios
      .put(base_url, {
        data: data,
        adminToken: localStorage.getItem("adminTokenV"),
      })
      .then((response) => {
        setSnackBarError(true);
        setErrorMessage(response.data.message);
      });
  };

  return (
    <div
      className={classes.root}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Backdrop className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper
        className={classes.paper}
        style={{
          height: 150,
          width: "90%",
          backgroundColor: "gainsboro",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        elevation={3}
      >
        {bestSellers.length > 0 ? (
          bestSellers.map((prod, i) => (
            <div>
              <div
                key={i}
                style={{
                  backgroundImage:
                    prod.sources.images.length > 0
                      ? "url(" + prod.sources.images[0]?.url + ")"
                      : "url(" + prod.thumbUrl + ")",
                  width: 100,
                  height: 100,
                  backgroundSize: "cover",
                  borderRadius: 10,
                  marginTop: 5,
                  marginRight: 10,
                }}
              />
              <div
                style={{
                  color: "#404e5c",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {prod.name}
              </div>
            </div>
          ))
        ) : (
          <Typography
            variant="h4"
            style={{
              color: "#404e5c",
              textAlign: "center",
            }}
            fontWeight="bold"
          >
            No tienes productos seleccionados aún
          </Typography>
        )}
      </Paper>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          size="small"
          style={{ marginTop: 20 }}
          onClick={updateBestSellers}
        >
          Actualizar
        </Button>
      </div>
      <Grid container style={{ marginTop: 20 }}>
        {products &&
          products.map((product) => (
            <Grid item xs={3}>
              <Checkbox
                checked={bestSellers.some((p) => p.name === product.name)}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onChange={() => {
                  if (bestSellers.length === 0) {
                    setBestSellers([product]);
                  } else if (bestSellers.some((p) => p.name === product.name)) {
                    setBestSellers(
                      bestSellers.filter((item) => item.name !== product.name)
                    );
                  } else if (bestSellers.length === 9) {
                    setSnackBarError(true);
                    setErrorMessage(
                      "Has alcanzado el máximo de Productos a mostrar (9 productos)."
                    );
                  } else {
                    setBestSellers([...bestSellers, product]);
                  }
                }}
              />
              {product.name}
            </Grid>
          ))}
      </Grid>
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
        onClose={closeAd}
      />
    </div>
  );
}
