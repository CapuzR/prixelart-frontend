import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
// import utils from "../utils/utils";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterNoneIcon from "@material-ui/icons/FilterNone";

import Star from "@material-ui/icons/Stars";
import StarOutline from "@material-ui/icons/StarOutline";
import Info from "@material-ui/icons/Info";
import Img from "react-cool-img";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { Typography } from "@material-ui/core";
import WarpImage from "../admin/productCrud/warpImage";
import { getPVM, getPVP, getComission } from "./pricesFunctions";

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
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const PriceSelect = (item) => {
    if (
      JSON.parse(localStorage?.getItem("token")) &&
      JSON.parse(localStorage?.getItem("token"))?.username
    ) {
      const prixer = JSON.parse(localStorage?.getItem("token"))?.username;

      return getPVM(
        item,
        props.currency,
        props.dollarValue,
        discountList,
        prixer
      );
    } else {
      return getPVP(item, props.currency, props.dollarValue, discountList);
    }
  };

  const allowMockup = (buy, index) => {
    if (buy.product?.mockUp !== undefined) {
      return (
        <div>
          <div
            style={{
              width: 210,
              height: 210,
              position: "relative",
            }}
            onClick={() => {
              props.setSelectedArtToAssociate({
                index,
                item: buy.product,
                previous: true,
              });
              history.push({ pathname: "/galeria" });
            }}
          >
            <WarpImage
              warpPercentage={buy.product.mockUp.warpPercentage}
              warpOrientation={buy.product.mockUp.warpOrientation}
              invertedWrap={buy.product.mockUp.invertedWrap}
              randomArt={buy.art}
              topLeft={buy.product.mockUp.topLeft}
              width={buy.product.mockUp.width}
              height={buy.product.mockUp.height}
              perspective={buy.product.mockUp.perspective}
              rotate={buy.product.mockUp.rotate}
              rotateX={buy.product.mockUp.rotateX}
              rotateY={buy.product.mockUp.rotateY}
              skewX={buy.product.mockUp.skewX}
              skewY={buy.product.mockUp.skewY}
              translateX={buy.product.mockUp.translateX}
              translateY={buy.product.mockUp.translateY}
            />
            <div
              style={{
                backgroundImage: "url(" + buy.product.mockUp.mockupImg + ")",
                width: 210,
                height: 210,
                backgroundSize: "cover",
                borderRadius: 5,
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: "2",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tooltip title="Nuestro equipo se encargará de que se vea perfecto para ti.">
              <IconButton size="small" color="gainsboro">
                <Info />
              </IconButton>
            </Tooltip>
            <Typography color="secondary" variant="p">
              Imagen referencial
            </Typography>
          </div>
        </div>
      );
    } else if (buy.art && buy.product) {
      return (
        <>
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
                  buy.art ? buy.art.squareThumbUrl : buy.art.largeThumbUrl || ""
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
                buy.product?.sources?.images[0]?.url ||
                buy.product?.thumbUrl ||
                ""
              }
              debounce={1000}
              // cache
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
        </>
      );
    } else if (buy.art) {
      return (
        <>
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
                  buy.art ? buy.art.squareThumbUrl : buy.art.largeThumbUrl || ""
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
        </>
      );
    } else if (buy.product) {
      return (
        <>
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
                buy.product?.sources?.images[0]?.url ||
                buy.product?.thumbUrl ||
                ""
              }
              debounce={1000}
              // cache
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
        </>
      );
    }
  };

  const copyItem = (i) => {
    let newState = JSON.parse(localStorage.getItem("buyState"));
    newState.push(newState[i]);
    props.setBuyState(newState);
    localStorage.setItem("buyState", JSON.stringify(newState));
    props.setMessage("Item duplicado correctamente.");
    props.setOpen(true);
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
        <h1
          style={{
            marginBottom: isMobile ? 40 : 20,
            marginTop: 100,
            color: "#404e5c",
          }}
        >
          {isMobile ? "Carrito" : "Carrito de compras"}
        </h1>
        {isMobile && (
          <Button
            style={{
              marginBottom: isMobile ? 40 : 20,
              marginTop: 100,
              textTransform: "none",
              padding: 0,
            }}
            color="primary"
            variant="contained"
            size="small"
            onClick={props.handleBuy}
          >
            Comprar
          </Button>
        )}
      </Grid>
      {props.buyState.map((buy, index) => {
        return (
          <Grid
            key={index}
            style={{
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Paper
              style={{
                padding: isMobile ? 10 : "10px 10px 10px 10px",
                marginTop: "2px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
              }}
              elevation={3}
            >
              <Grid
                container
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 15,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "end",
                    marginBottom: "-30px",
                    width: "100%",
                  }}
                >
                  <Tooltip
                    title="Duplicar item"
                    style={{ height: 40, width: 40 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyItem(index)}
                      color="gainsboro"
                    >
                      <FilterNoneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Eliminar item"
                    style={{
                      height: 40,
                      width: 40,
                      marginLeft: "-5px",
                      marginRight: "-5px",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => props.deleteItemInBuyState({ id: index })}
                      color="primary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <Grid
                  item
                  style={{
                    display: "flex",
                    height:
                      buy.product?.mockUp !== undefined && isIphone
                        ? 210
                        : isIphone
                        ? 160
                        : 220,
                    marginBottom: buy.product?.mockUp !== undefined && 20,
                  }}
                >
                  {allowMockup(buy, index)}
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
                          width: "80%",
                        }}
                      >
                        <Typography variant="h6" color="secondary">
                          {buy.product.name + " - " + buy.art.title}
                        </Typography>
                      </div>
                    )}
                    {buy.product ? (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="p"
                          color="secondary"
                          style={{
                            fontSize: "12px",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <strong> Producto: </strong> {buy.product?.name}
                        </Typography>
                        {buy.product.attributes.map((a, i) => {
                          return (
                            <Typography
                              variant="p"
                              color="secondary"
                              style={{
                                fontSize: 12,
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <strong>{a.name + ": "} </strong>{" "}
                              {typeof buy?.product?.selection?.attributes ===
                              "object"
                                ? buy?.product?.selection?.attributes[i]?.value
                                : buy.product.selection}
                            </Typography>
                          );
                        })}
                      </div>
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
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="p"
                          color="secondary"
                          style={{
                            fontSize: "12px",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <strong> Arte: </strong> {buy.art?.title}
                        </Typography>
                        <Typography
                          variant="p"
                          color="secondary"
                          style={{
                            fontSize: "12px",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <strong> Prixer: </strong> {buy.art?.prixerUsername}
                        </Typography>
                      </div>
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
                          <Typography
                            variant="p"
                            color="secondary"
                            style={{
                              fontSize: "12px",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            <strong> Tiempo de producción estimado: </strong>{" "}
                            {buy.product.productionTime}{" "}
                            {buy.product.productionTime == 1 ? "día." : "días."}
                          </Typography>
                        )}
                        <br />
                        <Typography variant="p" color="secondary">
                          <strong>Precio Unitario:</strong>
                          {props.currency ? " Bs" : " $"}
                          {PriceSelect(buy).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="p" color="secondary">
                          <strong>Cantidad: </strong>{" "}
                        </Typography>
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

                {buy.art &&
                  buy.product &&
                  buy.art.exclusive === "exclusive" && (
                    <Grid
                      item
                      xs={12}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Star
                        style={{
                          marginRight: "-2.2rem",
                          marginTop: "0.05rem",
                        }}
                        color="primary"
                        fontSize="large"
                      />
                      <StarOutline
                        style={{
                          color: "white",
                        }}
                        fontSize="large"
                      />
                      <Typography variant="p" color="primary">
                        Este arte es exclusivo, el artista recibirá
                        {props.currency ? " Bs" : "$"}
                        {getComission(
                          buy.product,
                          buy.art,
                          props.currency,
                          props.dollarValue,
                          discountList,
                          buy.quantity,
                          JSON.parse(localStorage?.getItem("token"))?.username,
                          props.surchargeList
                        ).toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        de comisión
                      </Typography>
                    </Grid>
                  )}
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}
