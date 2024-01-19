import React, { useEffect, useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import DeleteIcon from "@material-ui/icons/Delete";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Img from "react-cool-img";
import Tooltip from "@material-ui/core/Tooltip";
import { getAttributes, getEquation } from "../../../products/services";
import x from "../../../apple-touch-icon-180x180.png";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  form: {
    height: "auto",
    // padding: "15px",
  },
  gridInput: {
    display: "flex",
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
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
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
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

export default function ShoppingCart(props) {
  const classes = useStyles();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [productList, setProductList] = useState([]);
  const [artist, setArtist] = useState([]);
  const [artList, setArtList] = useState([]);
  const [artList0, setArtList0] = useState([]);
  const [artistFilter, setArtistFilter] = useState();
  let custom = {
    title: "Personalizado",
  };
  const getProducts = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all";
    axios.get(base_url).then(async (response) => {
      let productsAttTemp1 = response.data.products;
      await productsAttTemp1.map(async (p, iProd, pArr) => {
        productsAttTemp1 = await getEquation(p, iProd, pArr);
      });
      setProductList(getAttributes(productsAttTemp1));
      // setTimeout(() => {
      // setProducts(getAttributes(productsAttTemp1));
      // }, 100);
    });
  };
  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-all";
    axios.get(base_url).then((response) => {
      const arts = response.data.arts;
      arts.unshift({ title: "Personalizado" });
      setArtList(arts);
      setArtList0(arts);
      let artist = [];
      arts.map((art) => {
        if (artist.includes(art.prixerUsername)) {
          return;
        } else {
          artist.push(art.prixerUsername);
        }
      });
      setArtist(artist);
    });
  }, []);

  const changeArtistFilter = (artist) => {
    setArtistFilter(artist);
    if (artist === undefined) {
      setArtList(artList0);
    } else {
      const filteredArt = artList0.filter(
        (art) => art.prixerUsername === artist
      );
      filteredArt.unshift({ title: "Personalizado", prixerUsername: artist });
      setArtList(filteredArt);
    }
  };

  const UnitPrice = (product) => {
    if (product.modifyPrice) {
      return Number(product.publicEquation).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== "" &&
      props.currency
    ) {
      let dis = props.discountList?.filter(
        (dis) => dis._id === product.discount
      )[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          (product.publicEquation -
            (product.publicEquation / 100) * dis?.value) *
            props.dollarValue
        );
      } else if (dis?.type === "Monto") {
        return Number(
          (product.publicEquation - dis?.value) * props.dollarValue
        );
      }
    } else if (
      typeof product.discount === "string" &&
      product.publicEquation !== ""
    ) {
      let dis = props.discountList?.filter(
        (dis) => dis._id === product.discount
      )[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          product.publicEquation - (product.publicEquation / 100) * dis?.value
        );
      } else if (dis?.type === "Monto") {
        return Number(product.publicEquation - dis?.value);
      }
    } else if (typeof product.discount === "string" && props.currency) {
      let dis = props.discountList?.filter(
        (dis) => dis._id === product.discount
      )[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          (product.publicPrice.from -
            (product.publicPrice.from / 100) * dis?.value) *
            props.dollarValue
        );
      }
      if (dis?.type === "Monto") {
        return Number(
          (product.publicPrice.from - dis?.value) * props.dollarValue
        );
      }
    } else if (typeof product.discount === "string") {
      let dis = props.discountList?.filter(
        (dis) => dis._id === product.discount
      )[0];
      if (dis?.type === "Porcentaje") {
        return Number(
          product.publicPrice.from -
            (product.publicPrice.from / 100) * dis?.value
        );
      }
      if (dis?.type === "Monto") {
        return Number(product.publicPrice.from - dis?.value);
      }
    } else if (product.publicEquation !== "" && props.currency) {
      return Number(product.publicPriceEquation * props.dollarValue);
    } else if (product.publicEquation !== "") {
      return Number(product.publicEquation);
    } else if (props.currency) {
      return Number(product.publicPrice.from * props.dollarValue);
    } else {
      return Number(product.publicPrice.from);
    }
  };

  const changeArt = (art, product, index) => {
    props.setSelectedProductToAssociate({
      index,
      item: product,
      previous: true,
    });
    let selectedArt = art;
    let selectedArtFull = artList.find(
      (result) => result.artId === selectedArt.artId
    );
    props.AssociateProduct({
      index: index,
      item: selectedArtFull,
      type: "art",
    });
    setArtistFilter(undefined);
  };

  const changeProduct = (event, art, index) => {
    props.setSelectedArtToAssociate({
      index,
      item: art,
      previous: true,
    });
    let selectedProduct = event.target.value;
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    );
    props.AssociateProduct({
      index: index,
      item: selectedProductFull,
      type: "product",
    });
  };

  const handleVariantProduct = (variant, index, product) => {
    let prod = product;
    prod.selection = variant;
    prod.publicEquation = variant?.publicPrice?.equation;
    props.AssociateProduct({
      index: index,
      item: prod,
      type: "product",
    });
    props.buyState.map((item) => {});
    getProducts();
  };

  const modifyPrice = (product, index, newPrice) => {
    const purchase = props.buyState;
    let item = props.buyState[index];
    item.product.publicEquation = newPrice;
    purchase.splice(index, 1, item);
    product.modifyPrice = true;
    // product.comission = newPrice/10;
    product.publicEquation = newPrice.replace(/[,]/gi, ".");
    localStorage.setItem("buyState", JSON.stringify(purchase));
    props.setBuyState(purchase);
  };

  const handleProduct = (event) => {
    let selectedProduct = event.target.value;
    props.addItemToBuyState({
      type: "product",
      item: selectedProduct,
    });
  };

  return (
    <Grid container style={{ display: "flex", justifyContent: "center" }}>
      {props.buyState.length > 0 &&
        props.buyState.map((buy, index) => {
          return (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xl={12}
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
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                }}
                elevation={3}
              >
                <Grid
                  container
                  style={{
                    display: "flex",
                  }}
                >
                  <Grid item xs={5}>
                    <div
                      style={{
                        display: "flex",
                        height: 120,
                        marginRight: 20,
                      }}
                    >
                      <Img
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          height: 120,
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
                        cache
                        error="/imgError.svg"
                        alt={buy.product && buy.product.name}
                        id={index}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <FormControl
                          className={classes.formControl}
                          style={{
                            minWidth: 200,
                            marginBottom: 10,
                          }}
                        >
                          {buy.product ? (
                            <Typography
                              variant="h6"
                              style={{ fontWeight: 300, fontSize: 18 }}
                            >
                              {buy.product.name}
                            </Typography>
                          ) : (
                            <>
                              <InputLabel style={{ paddingLeft: 15 }}>
                                Agrega un producto
                              </InputLabel>
                              <Select
                                id={"product " + index}
                                variant="outlined"
                                onChange={(e) => {
                                  changeProduct(e, buy.art, index);
                                }}
                              >
                                {productList[0] !== null &&
                                  productList.map((product) => {
                                    return (
                                      <MenuItem value={product.name}>
                                        {product.name}
                                      </MenuItem>
                                    );
                                  })}
                              </Select>
                            </>
                          )}
                        </FormControl>
                        {buy.product.variants.length > 0 && (
                          <FormControl
                            className={classes.formControl}
                            style={{ minWidth: 200 }}
                          >
                            {typeof buy.product.selection?._id === "string" ? (
                              <Typography
                                variant="h6"
                                style={{
                                  fontWeight: 300,
                                  fontSize: 18,
                                  marginTop: -10,
                                }}
                              >
                                {buy.product.selection.name}
                                {buy.product.selection?.attributes?.length >
                                  1 &&
                                  buy.product.selection?.attributes[1]
                                    ?.value !== undefined &&
                                  " " +
                                    buy.product.selection.attributes[1].value}
                              </Typography>
                            ) : (
                              <>
                                <InputLabel style={{ paddingLeft: 15 }}>
                                  {buy.product.attributes[0]?.name}
                                </InputLabel>
                                <Select
                                  id={"variant " + index}
                                  variant="outlined"
                                  onChange={(e) => {
                                    handleVariantProduct(
                                      e.target.value,
                                      index,
                                      buy.product
                                    );
                                  }}
                                >
                                  {buy.product.variants.map((a) => {
                                    return (
                                      <MenuItem value={a}>
                                        {a.name}
                                        {a.attributes[1]?.value &&
                                          " " + a.attributes[1]?.value}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </>
                            )}
                          </FormControl>
                        )}
                        {props.discountList !== undefined &&
                          props.discountList !== null &&
                          typeof buy.product.discount === "string" && (
                            <Typography
                              variant="p"
                              style={{ paddingTop: 5, color: "grey" }}
                            >
                              Este producto tiene aplicado un descuento de
                              {props.discountList?.find(
                                ({ _id }) => _id === buy.product.discount
                              )?.type === "Porcentaje"
                                ? " %" +
                                  props.discountList?.find(
                                    ({ _id }) => _id === buy.product.discount
                                  ).value
                                : props.discountList?.find(
                                    ({ _id }) => _id === buy.product.discount
                                  )?.type === "Monto" &&
                                  " $" +
                                    props.discountList?.find(
                                      ({ _id }) => _id === buy.product.discount
                                    ).value}
                            </Typography>
                          )}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={7} style={{ display: "flex" }}>
                    <div
                      style={{
                        backgroundColor: "#eeeeee",
                        width: 120,
                        height: 120,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 20,
                      }}
                    >
                      {buy.art && (
                        <Img
                          placeholder="/imgLoading.svg"
                          style={{
                            backgroundColor: "#eeeeee",
                            maxWidth: 120,
                            maxHeight: 120,
                            borderRadius: 10,
                          }}
                          src={
                            buy.art
                              ? buy.art.title === "Personalizado"
                                ? x
                                : buy.art?.squareThumbUrl
                              : ""
                          }
                          debounce={1000}
                          cache
                          error="/imgError.svg"
                          alt={buy.art && buy.art.title}
                          id={buy.art && buy.art?.artId}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        // width: "100%",
                        // height: 200,
                        display: "flex",
                        flexDirection: "column",
                        alignContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <FormControl
                          className={classes.formControl}
                          style={{
                            marginBottom: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <InputLabel style={{ paddingLeft: 15 }}>
                            {(buy.art &&
                              buy.art.prixerUsername?.substring(0, 22)) ||
                              artistFilter ||
                              "Selecciona un Prixer"}
                          </InputLabel>
                          <Select
                            variant="outlined"
                            onChange={(e) => changeArtistFilter(e.target.value)}
                            style={{ width: 180, marginRight: 10 }}
                          >
                            <MenuItem value={undefined}>Todos</MenuItem>
                            {artist !== "" &&
                              artist.map((art) => {
                                return <MenuItem value={art}>{art}</MenuItem>;
                              })}
                          </Select>
                        </FormControl>
                        <FormControl
                          className={classes.formControl}
                          style={{
                            marginBottom: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <InputLabel style={{ paddingLeft: 15 }}>
                            {buy.art
                              ? buy.art.title.substring(0, 22)
                              : "Agrega un arte"}
                          </InputLabel>
                          <Select
                            id={"Art " + index}
                            variant="outlined"
                            onChange={(e) =>
                              changeArt(e.target.value, buy.product, index)
                            }
                            style={{ width: 210 }}
                          >
                            {artList !== "" &&
                              artList.map((art) => {
                                return (
                                  <MenuItem value={art}>
                                    <Img
                                      placeholder="/imgLoading.svg"
                                      style={{
                                        backgroundColor: "#eeeeee",
                                        maxWidth: 40,
                                        maxHeight: 40,
                                        borderRadius: 3,
                                        marginRight: 10,
                                      }}
                                      src={
                                        art.title === "Personalizado"
                                          ? x
                                          : art?.squareThumbUrl
                                      }
                                      debounce={1000}
                                      cache
                                      error="/imgError.svg"
                                      alt={art.title}
                                      id={art?.artId}
                                    />
                                    {art.title.substring(0, 22)}
                                  </MenuItem>
                                );
                              })}
                          </Select>
                        </FormControl>
                      </div>
                      {buy.art && buy.art.title !== "Personalizado" && (
                        <>
                          <p
                            style={{
                              fontSize: "12px",
                              // padding: 0,
                              marginBottom: 10,
                              marginTop: -2,
                            }}
                          >
                            Arte: {buy.art?.artId}
                          </p>
                        </>
                      )}
                      {buy.product && (
                        <Grid
                          item
                          xs
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <TextField
                            variant="outlined"
                            label={
                              buy.product.selection
                                ? "Precio variante: " + UnitPrice(buy.product)
                                : "Precio base: " + UnitPrice(buy.product)
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                            // type="Number"
                            style={{ width: 160, height: 80 }}
                            defaultValue={UnitPrice(buy.product)}
                            // value={UnitPrice(buy.product) || ""}
                            onChange={(e) => {
                              modifyPrice(buy.product, index, e.target.value);
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              // alignItems: "center",
                              alignItems: "end",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                              }}
                            >
                              Cantidad:
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
                          </div>
                        </Grid>
                      )}
                    </div>
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

                  {/* <Grid
                    item
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      height: 160,
                      width: 50,
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
                  </Grid> */}
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      <Grid
        style={{
          // height: isMobile ? "370px" : "240px",
          // marginBottom: 20,
          width: "50%",
        }}
      >
        <Paper
          style={{
            padding: 10,
            marginTop: "2px",
            // height: isMobile ? "400px" : "230px",
            display: "flex",
            justifyContent: "center",
            flexDirection: isMobile ? "column" : "row",
          }}
          elevation={3}
        >
          <FormControl
            className={classes.formControl}
            style={{ width: "100%" }}
          >
            <InputLabel
              id="demo-simple-select-label"
              style={{ paddingLeft: 15 }}
            >
              Agrega un producto
            </InputLabel>
            <Select
              variant="outlined"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={""}
              onChange={handleProduct}
            >
              {productList !== "" &&
                productList.map((product, index) => {
                  return <MenuItem value={product}>{product.name}</MenuItem>;
                })}
            </Select>
          </FormControl>
        </Paper>
      </Grid>
    </Grid>
  );
}
