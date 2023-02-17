import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import utils from "../utils/utils";

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
  const prixerUsername = "all";
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));

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
                        src={buy.art ? buy.art.squareThumbUrl : ""}
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
                      src={buy.product ? buy.product.thumbUrl : ""}
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
                        <strong> Prixer: </strong>{" "}
                        {buy.art?.prixerUsername.substring(0, 10)}
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
                      <strong>Precio Unitario:</strong>
                      {JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username &&
                      props.currency === true
                        ? " Bs" +
                          (
                            buy.product?.prixerEquation * props.dollarValue
                          ).toFixed(2)
                        : JSON.parse(localStorage.getItem("token")) &&
                          JSON.parse(localStorage.getItem("token")).username
                        ? " $" + buy.product?.prixerEquation
                        : props.currency === true
                        ? " Bs" +
                            (
                              buy.product?.publicEquation * props.dollarValue
                            ).toFixed(2) ||
                          " Bs" +
                            (
                              buy.product?.publicPrice.from.replace(
                                /[$]/gi,
                                ""
                              ) * props.dollarValue
                            ).toFixed(2)
                        : " $" + buy.product?.publicEquation ||
                          " $" +
                            buy.product?.publicPrice.from.replace(/[$]/gi, "")}
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
