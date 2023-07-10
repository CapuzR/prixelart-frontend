import React, { useState, useEffect } from "react";
import axios from "axios";

import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
// import utils from "../utils/utils";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import Img from "react-cool-img";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  float: {
    position: "relative",
    marginLeft: "95%",
  },
  iconButton: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

export default function CartReview(props) {
  // const prixerUsername = "all";
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const [discountList, setDiscountList] = useState([]);

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv2";
    await axios
      .post(base_url)
      .then((response) => {
        setDiscountList(response.data.discounts);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getDiscounts();
  }, []);

  const PriceSelect = (product) => {
    if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      product.prixerEquation !== "" &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.prixerEquation -
                  (product.prixerEquation / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.prixerEquation - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      product.prixerEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                product.prixerEquation -
                  (product.prixerEquation / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(product.prixerEquation - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                }
              )}
        </>
      );
    }
    if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.prixerPrice.from -
                  (product.prixerPrice.from / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.prixerPrice.from - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username)
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                product.prixerPrice.from -
                  (product.prixerPrice.from / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(product.prixerPrice.from - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                }
              )}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== "" &&
      props.currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.publicEquation -
                  (product.publicEquation / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicEquation - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                product.publicEquation -
                  (product.publicEquation / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(product.publicEquation - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                }
              )}
        </>
      );
    } else if (typeof product.discount === "string" && props.currency) {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " Bs" +
              Number(
                (product.publicPrice.from -
                  (product.publicPrice.from / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " Bs" +
              Number(
                (product.publicPrice.from - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
        </>
      );
    } else if (typeof product.discount === "string") {
      let dis = discountList?.filter((dis) => dis._id === product.discount)[0];
      return (
        <>
          {dis?.type === "Porcentaje" &&
            " $" +
              Number(
                product.publicPrice.from -
                  (product.publicPrice.from / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
              })}
          {dis?.type === "Monto" &&
            " $" +
              Number(product.publicPrice.from - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                }
              )}
        </>
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      product.prixerEquation !== "" &&
      props.currency
    ) {
      return (
        " Bs" +
        Number(product.prixerEquation * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
          }
        )
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      product.prixerEquation !== ""
    ) {
      return (
        " $" +
        Number(product.prixerEquation).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username &&
      props.currency
    ) {
      return (
        " Bs" +
        Number(product.prixerPrice.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
          }
        )
      );
    } else if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username
    ) {
      return (
        " $" +
        Number(product.prixerPrice.from.replace(/[$]/gi, "")).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
          }
        )
      );
    } else if (product.publicEquation !== "" && props.currency) {
      return (
        " Bs" +
        Number(product.publicPriceEquation * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
          }
        )
      );
    } else if (product.publicEquation !== "") {
      return (
        " $" +
        Number(product.publicEquation).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
        })
      );
    } else if (props.currency) {
      return (
        " Bs" +
        Number(product.publicPrice.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
          }
        )
      );
    } else {
      return " $" + Number(product.publicPrice.from.replace(/[$]/gi, ""));
    }
  };

  return (
    <>
      <Grid
        item
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ marginBottom: 20, marginTop: 90 }}>Carrito de compras</h1>
      </Grid>

      {props.buyState.map((buy, index) => {
        return (
          <Grid
            key={index}
            style={{
              // height: isMobile ? "370px" : "240px",
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Paper
              style={{
                padding: isMobile ? 10 : "10px 10px 0px 10px",
                marginTop: "2px",
                // height: isMobile ? "400px" : "230px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
              }}
              elevation={3}
            >
              <Grid
                item
                // xs={12}
                // sm={12}
                // md={12}
                // lg
                // xl
                style={{
                  display: "flex",
                  height: isIphone ? 160 : 220,
                }}
              >
                {buy.art ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: isIphone ? 160 : 220,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#eeeeee",
                        width: isIphone ? 120 : 180,
                        height: isIphone ? 120 : 180,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Img
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          maxWidth: isIphone ? 120 : 180,
                          maxHeight: isIphone ? 120 : 180,
                          borderRadius: 10,
                        }}
                        src={
                          buy.art
                            ? buy.art.squareThumbUrl
                            : buy.art.largeThumbUrl || ""
                        }
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        alt={buy.art && buy.art.title}
                        id={buy.art && buy.art.artId}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <IconButton
                        className={classes.iconButton}
                        style={{ height: 40, width: 40 }}
                        onClick={() =>
                          props.deleteProductInItem({
                            id: index,
                            type: "art",
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        className={classes.iconButton}
                        style={{ height: 40, width: 40 }}
                        onClick={() => {
                          props.setSelectedArtToAssociate({
                            index,
                            item: buy.product,
                            previous: true,
                          });
                          history.push({ pathname: "/galeria" });
                        }}
                      >
                        <AddIcon fontSize="medium" />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: "180px",
                      width: "180px",
                      display: "grid",
                    }}
                  >
                    <IconButton
                      className={classes.addItemContainer}
                      onClick={() => {
                        props.setSelectedArtToAssociate({
                          index,
                          item: buy.art,
                          previous: true,
                        });
                        history.push({ pathname: "/galeria" });
                      }}
                    >
                      <AddIcon style={{ fontSize: 80 }} color="primary" />
                    </IconButton>
                  </div>
                )}
                {buy.product ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: isIphone ? 160 : 220,
                    }}
                  >
                    <Img
                      placeholder="/imgLoading.svg"
                      style={{
                        backgroundColor: "#eeeeee",
                        height: isIphone ? 120 : 180,
                        borderRadius: "10px",
                        marginRight: "20px",
                        marginLeft: "20px",
                      }}
                      src={
                        buy.product.sources?.images[0]?.url
                          ? buy.product?.thumbUrl
                          : ""
                      }
                      debounce={1000}
                      cache
                      error="/imgError.svg"
                      alt={buy.product && buy.product.name}
                      id={index}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        marginRight: "20px",
                        marginLeft: "20px",
                      }}
                    >
                      <IconButton
                        className={classes.iconButton}
                        style={{ height: 40, width: 40 }}
                        onClick={() =>
                          props.deleteProductInItem({
                            id: index,
                            type: "product",
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        className={classes.iconButton}
                        style={{ height: 40, width: 40 }}
                        onClick={() => {
                          props.setSelectedArtToAssociate({
                            index,
                            item: buy.art,
                            previous: true,
                          });
                          history.push({ pathname: "/productos" });
                        }}
                      >
                        <AddIcon fontSize="medium" />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: "180px",
                      width: "180px",
                      display: "grid",
                      marginLeft: "20px",
                      marginRight: "20px",
                    }}
                  >
                    <IconButton
                      className={classes.addItemContainer}
                      onClick={() => {
                        props.setSelectedArtToAssociate({
                          index,
                          item: buy.art,
                          previous: true,
                        });
                        history.push({ pathname: "/productos" });
                      }}
                    >
                      <AddIcon style={{ fontSize: 80 }} color="primary" />
                    </IconButton>
                  </div>
                )}
                {isMobile && (
                  <Grid
                    item
                    xs
                    sm
                    md
                    lg
                    xl
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      height: 160,
                    }}
                  >
                    <Tooltip
                      title="Eliminar item"
                      style={{ height: 40, width: 40 }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          props.deleteItemInBuyState({ id: index })
                        }
                        color="primary"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md
                lg
                xl
                style={{
                  minWidth: 290,
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignContent: "space-between",
                }}
              >
                <div>
                  {buy.product && buy.art && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h6">
                        {buy.product.name +
                          " X " +
                          buy.art.title.substring(0, 27)}
                      </Typography>
                    </div>
                  )}
                  {buy.product ? (
                    <>
                      <p
                        style={{
                          fontSize: "12px",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <strong> Producto: </strong>{" "}
                        {buy.product?.name.substring(0, 10)}
                      </p>
                      {buy.product.attributes.map((a, i) => {
                        return (
                          <p
                            style={{
                              fontSize: 12,
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            <strong>{a.name + ": "} </strong>{" "}
                            {buy.product.selection[i]}
                          </p>
                        );
                      })}
                      {/* {buy.product.productionTime && (
                        <p
                          style={{
                            fontSize: "12px",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <strong> Tiempo de producción estimado: </strong>{" "}
                          {buy.product.productionTime} días
                        </p>
                      )} */}
                    </>
                  ) : (
                    <Button
                      style={{ fontSize: 14 }}
                      size="small"
                      onClick={() => {
                        props.setSelectedArtToAssociate({
                          index,
                          item: buy.art,
                          previous: true,
                        });
                        history.push({
                          pathname: "/productos",
                        });
                      }}
                    >
                      Elige tu producto
                    </Button>
                  )}
                  {buy.art ? (
                    <>
                      <p
                        style={{
                          fontSize: "12px",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <strong> Arte: </strong>{" "}
                        {buy.art?.title.substring(0, 10)}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <strong> Prixer: </strong> {buy.art?.prixerUsername}
                      </p>
                    </>
                  ) : (
                    <Button
                      style={{ fontSize: 14 }}
                      size="small"
                      onClick={() => {
                        props.setSelectedArtToAssociate({
                          index,
                          item: buy.product,
                          previous: true,
                        });
                        history.push({ pathname: "/galeria" });
                      }}
                    >
                      Elige tu arte
                    </Button>
                  )}
                </div>
                {buy.product ? (
                  <Grid
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "end",
                    }}
                  >
                    <div style={{ paddingBottom: 5 }}>
                      {buy.product.productionTime && (
                        <p
                          style={{
                            fontSize: "12px",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <strong> Tiempo de producción estimado: </strong>{" "}
                          {buy.product.productionTime}{" "}
                          {buy.product.productionTime == 1 ? "día." : "días."}
                        </p>
                      )}
                      <strong>Precio Unitario:</strong>
                      {PriceSelect(buy.product)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <strong>Cantidad: </strong>
                      <input
                        style={{
                          width: 80,
                          padding: "10px",
                          borderRadius: 4,
                        }}
                        type="number"
                        defaultValue={1}
                        value={buy.quantity}
                        min="1"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onChange={(e) => {
                          props.changeQuantity({
                            index,
                            art: buy.art,
                            product: buy.product,
                            quantity: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
              {!isMobile && (
                <Tooltip
                  title="Eliminar item"
                  style={{ height: 40, width: 40 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => props.deleteItemInBuyState({ id: index })}
                    color="primary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}
