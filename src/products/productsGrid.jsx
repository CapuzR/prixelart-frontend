//[]      17. Búsqueda de Prixers.

import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import utils from "../utils/utils";
import axios from "axios";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import MaximizeIcon from "@material-ui/icons/Maximize";
import MDEditor from "@uiw/react-md-editor";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  setProductAtts,
  setSecondProductAtts,
  getAttributes,
  getEquation,
} from "./services.js";
import Paper from "@material-ui/core/Paper";

import AddShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { useHistory } from "react-router-dom";
import Switch from "@material-ui/core/Switch";

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
    borderRadius: 30,
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
  adjust1: {
    objectFit: "cover",
    width: 434,
    height: 142,
    transformOrigin: "top left",
    transform:
      "perspective(130px) rotateX(2deg) skew(2deg, 8.7deg) translateX(1px) rotateY(14deg)",
  },
}));

export default function ProductGrid(props) {
  const classes = useStyles();
  const [tiles, setTiles] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [imagesVariants, setImagesVariants] = useState([]);
  // const [imagesProducts, setImagesProducts] = useState();
  const [width, setWidth] = useState([]);
  const [height, setHeight] = useState([]);

  const [order, setOrder] = useState("");
  const history = useHistory();
  const [currency, setCurrency] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState([]);

  const toggleDescription = (index) => {
    const updatedShowFullDescription = [...showFullDescription];
    updatedShowFullDescription[index] = !updatedShowFullDescription[index];
    setShowFullDescription(updatedShowFullDescription);
  };

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

  const handleChange = (event) => {
    setOrder(event.target.value);
  };

  useEffect(() => {
    getDiscounts();
  }, []);

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all";
    axios.get(base_url).then(async (response) => {
      let productsAttTemp1 = response.data.products;

      await productsAttTemp1.map(async (p, iProd, pArr) => {
        p.variants.map((variant) => {
          imagesVariants.push(variant.variantImage);
        });
        productsAttTemp1 = await getEquation(p, iProd, pArr);
      });

      if (order === "") {
        setTiles(getAttributes(productsAttTemp1));
      } else if (order === "A-Z") {
        let products = productsAttTemp1.sort(function (a, b) {
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          return 0;
        });
        setTiles(getAttributes(products));
      } else if (order === "Z-A") {
        let products = productsAttTemp1.sort(function (a, b) {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return 1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return -1;
          }
          return 0;
        });
        setTiles(getAttributes(products));
      } else if (order === "Price") {
        let products = productsAttTemp1.sort(function (a, b) {
          let aPrice = a.publicPrice.from;
          let bPrice = b.publicPrice.from;
          return aPrice - bPrice;
        });
        setTiles(getAttributes(products));
      }
    });
  }, [order]);

  const addingToCart = (e, tile) => {
    e.preventDefault();
    props.setSelectedProduct(tile);
    props.setIsOpenAssociateArt(true);
  };

  const changeCurrency = () => {
    setCurrency(!currency);
  };

  const priceSelect = (item) => {
    if (
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      item.prixerEquation !== "" &&
      typeof item.discount === "string" &&
      currency
    ) {
      return (
        "PVM: Bs" +
        (item.prixerEquation * props.dollarValue).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.prixerEquation !== "" &&
      typeof item.discount === "string"
    ) {
      return (
        "PVM: $" +
        item.prixerEquation.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.attributes.length > 0 &&
      item.prixerPrice.to !== item.prixerPrice.from &&
      item.prixerPrice.to !== "" &&
      item.prixerPrice.to !== null &&
      currency &&
      typeof item.discount === "string"
    ) {
      return (
        "PVM: Bs" +
        (Number(item.prixerPrice.from) * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ) +
        " - " +
        Number(item.prixerPrice?.to * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.attributes.length > 0 &&
      item.prixerPrice.to !== item.prixerPrice.from &&
      item.prixerPrice.to !== "" &&
      item.prixerPrice.to !== null &&
      typeof item.discount === "string"
    ) {
      return (
        "PVM: $" +
        Number(item.prixerPrice.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        " - " +
        Number(item.prixerPrice?.to).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      typeof item.discount === "string" &&
      currency
    ) {
      return (
        "PVM: Bs" +
        Number(item?.prixerPrice?.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      typeof item.discount === "string"
    ) {
      return (
        "PVM: $" +
        Number(item?.prixerPrice?.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage?.getItem("token")) ||
        JSON.parse(localStorage?.getItem("adminToken"))) &&
      (JSON.parse(localStorage?.getItem("token"))?.username ||
        JSON.parse(localStorage?.getItem("adminToken"))?.username) &&
      item.prixerEquation !== "" &&
      currency
    ) {
      return (
        "PVM: Bs" +
        (item.prixerEquation * props.dollarValue).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.prixerEquation !== ""
    ) {
      return (
        "PVM: $" +
        item.prixerEquation.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.attributes.length > 0 &&
      item.prixerPrice.to !== item.prixerPrice.from &&
      item.prixerPrice.to !== "" &&
      item.prixerPrice.to !== null &&
      currency
    ) {
      return (
        "PVM: Bs" +
        (Number(item.prixerPrice.from) * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ) +
        " - " +
        Number(item.prixerPrice?.to * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      item.attributes.length > 0 &&
      item.prixerPrice.to !== item.prixerPrice.from &&
      item.prixerPrice.to !== "" &&
      item.prixerPrice.to !== null
    ) {
      return (
        "PVM: $" +
        Number(item.prixerPrice.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        " - " +
        Number(item.prixerPrice?.to).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username) &&
      currency
    ) {
      return (
        "PVM: Bs" +
        Number(item?.prixerPrice?.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      (JSON.parse(localStorage.getItem("token")) ||
        JSON.parse(localStorage.getItem("adminToken"))) &&
      (JSON.parse(localStorage.getItem("token"))?.username ||
        JSON.parse(localStorage.getItem("adminToken"))?.username)
    ) {
      return (
        "PVM: $" +
        Number(item?.prixerPrice?.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      typeof item.discount === "string" &&
      item.publicEquation !== "" &&
      currency
    ) {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: Bs
            {Number(item.publicEquation * props.dollarValue).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </del>
          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" &&
              " Bs" +
                Number(dis?.value * props.dollarValue).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                })}
          </div>
          {dis?.type === "Porcentaje" && (
            <div>
              PVP: Bs
              {Number(
                (item.publicEquation -
                  (item.publicEquation / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: Bs
              {Number(
                (item.publicEquation - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </>
      );
    } else if (
      typeof item.discount === "string" &&
      item.publicEquation !== ""
    ) {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: $
            {item.publicEquation.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </del>
          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" && " $" + Number(dis?.value)}
          </div>
          {dis?.type === "Porcentaje" && (
            <div>
              PVP: $
              {Number(
                item.publicEquation - (item.publicEquation / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: $
              {Number(
                item.publicEquation -
                  //  -
                  dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </>
      );
    } else if (
      typeof item.discount === "string" &&
      currency &&
      item.publicPrice?.to !== "" &&
      item.publicPrice?.to !== null
    ) {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: Bs
            {Number(item.publicPrice.from * props.dollarValue).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ) +
              " - " +
              Number(item.publicPrice?.to * props.dollarValue).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
          </del>

          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" &&
              " Bs" +
                Number(dis?.value * props.dollarValue).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                })}
          </div>

          {dis?.type === "Porcentaje" && (
            <div>
              PVP: Bs
              {Number(
                (item.publicPrice.from -
                  (item.publicPrice.from / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) +
                " - " +
                Number(
                  (item.publicPrice.to -
                    (item.publicPrice.to / 100) * dis?.value) *
                    props.dollarValue
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: $
              {Number(
                (item.publicPrice.from - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) +
                " - " +
                Number(
                  (item.publicPrice?.to - dis?.value) * props.dollarValue
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </div>
          )}
        </>
      );
    } else if (
      typeof item.discount === "string" &&
      item.publicPrice.to !== "" &&
      item.publicPrice.to !== null
    ) {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: $
            {Number(item.publicPrice.from).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) +
              " - " +
              Number(item.publicPrice?.to).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </del>

          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" && " $" + dis?.value}
          </div>

          {dis?.type === "Porcentaje" && (
            <div>
              PVP: $
              {Number(
                item.publicPrice.from -
                  (item.publicPrice.from / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) +
                " - " +
                Number(
                  item.publicPrice?.to -
                    (item.publicPrice?.to / 100) * dis?.value
                ).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: $
              {Number(item.publicPrice.from - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ) +
                " - " +
                Number(item.publicPrice?.to - dis?.value).toLocaleString(
                  "de-DE",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
            </div>
          )}
        </>
      );
    } else if (typeof item.discount === "string" && currency) {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: Bs
            {Number(item.publicPrice.from * props.dollarValue).toLocaleString(
              "de-DE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </del>

          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" &&
              " Bs" +
                Number(dis?.value * props.dollarValue).toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </div>

          {dis?.type === "Porcentaje" && (
            <div>
              PVP: Bs
              {Number(
                (item.publicPrice.from -
                  (item.publicPrice.from / 100) * dis?.value) *
                  props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: $
              {Number(
                (item.publicPrice.from - dis?.value) * props.dollarValue
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </>
      );
    } else if (typeof item.discount === "string") {
      let dis = discountList?.filter((dis) => dis._id === item.discount)[0];
      return (
        <>
          <del>
            PVP: $
            {Number(item.publicPrice.from).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </del>

          <div
            style={{
              backgroundColor: "#d33f49",
              padding: 3,
              width: 180,
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Descuento de
            {dis?.type === "Porcentaje" && " %" + dis?.value}
            {dis?.type === "Monto" && " $" + dis?.value}
          </div>

          {dis?.type === "Porcentaje" && (
            <div>
              PVP: $
              {Number(
                item.publicPrice.from -
                  (item.publicPrice.from / 100) * dis?.value
              ).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          {dis?.type === "Monto" && (
            <div>
              PVP: $
              {Number(item.publicPrice.from - dis?.value).toLocaleString(
                "de-DE",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </div>
          )}
        </>
      );
    } else if (item.publicEquation !== "" && currency) {
      return (
        "PVP: Bs" +
        Number(item.publicEquation * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (item.publicEquation !== "") {
      return (
        "PVP: $" +
        Number(item.publicEquation).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (
      item.attributes.length > 0 &&
      item.publicPrice.to !== item.publicPrice.from &&
      item.publicPrice.to !== "" &&
      item.publicPrice.to !== null &&
      currency
    ) {
      return (
        "PVP: Bs" +
        Number(item.publicPrice.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ) +
        " - " +
        Number(item.publicPrice?.to * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else if (
      item.attributes.length > 0 &&
      item.publicPrice.to !== item.publicPrice.from &&
      item.publicPrice.to !== "" &&
      item.publicPrice.to !== null
    ) {
      return (
        "PVP: $" +
        Number(item.publicPrice.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        " - " +
        Number(item.publicPrice?.to)?.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else if (currency) {
      return (
        "PVP: Bs" +
        Number(item.publicPrice.from * props.dollarValue).toLocaleString(
          "de-DE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )
      );
    } else {
      return (
        "PVP: $" +
        Number(item.publicPrice.from).toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  };
  return (
    <>
      {/* <Grid container style={{ marginTop: 20 }}>
        <Grid item xs={12} align={"center"}>
          <Paper
            style={{
              width: 800,
              height: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
            elevation={5}
          >
            <div>
              <img src={tiles[2]?.sources.images[0]?.url}></img>
              <div
                style={{
                  position: "absolute",
                  // transformStyle: "preserve-3d",
                  // perspective: "800px",
                  top: 137,
                  left: 280,
                }}
              >
                <img
                  src={props.buyState[0].art.smallThumbUrl}
                  className={classes.adjust1}
                ></img>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid> */}

      <div style={{ display: "flex", justifyContent: "end" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginRight: 40,
          }}
        >
          <Switch
            classes={{
              root: classes.base,
              switchBase: classes.switchBase,
              thumb: currency ? classes.thumbTrue : classes.thumb,
              track: classes.track,
              checked: classes.checked,
            }}
            color="primary"
            value={currency}
            onChange={(e) => {
              changeCurrency(e);
            }}
            style={{ marginRight: "-5px" }}
          />
        </div>

        <FormControl className={classes.formControl}>
          <InputLabel style={{ marginLeft: 10 }} id="demo-simple-select-label">
            Ordenar
          </InputLabel>
          <Select
            variant="outlined"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={order}
            onChange={handleChange}
          >
            <MenuItem value={"A-Z"}>A-Z</MenuItem>
            <MenuItem value={"Z-A"}>Z-A</MenuItem>
            <MenuItem value={"Price"}>Menor precio</MenuItem>
          </Select>
        </FormControl>
      </div>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1080: 3 }}
      >
        <Masonry style={{ columnGap: "30px" }}>
          {tiles ? (
            tiles.map((tile, iProd, productsArr) => (
              <Card
                className={classes.root}
                id={tile.name}
                style={{
                  transition:
                    tile.name === props.pointedProduct &&
                    "box-shadow 0.3s ease-in-out",
                  boxShadow:
                    tile.name === props.pointedProduct &&
                    " 0 0 10px 3px #d33f49",
                }}
              >
                <CardMedia style={{ width: "110%" }}>
                  <Carousel
                    autoPlay={false}
                    stopAutoPlayOnHover={true}
                    animation="slide"
                    duration={500}
                    fullHeightHover={true}
                    IndicatorIcon={<MaximizeIcon />}
                    NextIcon={<ArrowForwardIosIcon />}
                    PrevIcon={<ArrowBackIosIcon />}
                    activeIndicatorIconButtonProps={{
                      style: {
                        color: "#d33f49",
                      },
                    }}
                    navButtonsProps={{
                      style: {
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        color: "#d33f49",
                        width: "98%",
                        height: "100vh",
                        marginTop: "-50vh",
                        borderRadius: "0",
                        marginLeft: "1px",
                      },
                    }}
                    indicatorContainerProps={{
                      style: {
                        position: "absolute",
                        marginTop: "-17px",
                      },
                    }}
                  >
                    {typeof tile.selection[0] === "string" &&
                    typeof tile.variants[0]?.variantImage === "object" &&
                    tile.variants.find(
                      ({ name }) => name === tile.selection[0]
                    ) ? (
                      tile.variants
                        .find(({ name }) => name === tile.selection[0])
                        .variantImage.map((img, key_id) =>
                          img.type === "images" ? (
                            <img
                              key={key_id}
                              src={img.url}
                              className={classes.img}
                              alt="variant"
                              style={{ borderRadius: 30 }}
                            />
                          ) : (
                            img.type === "video" &&
                            img.url !== null && (
                              <span
                                key={"video"}
                                style={{ width: "100%", borderRadius: 30 }}
                                dangerouslySetInnerHTML={{
                                  __html: img.url,
                                }}
                              />
                            )
                          )
                        )
                    ) : tile.sources.images &&
                      tile.sources.images[0] !== undefined ? (
                      tile.sources.images?.map((img, i) =>
                        img.url !== null && img.type === "images" ? (
                          <img
                            key={i}
                            src={img.url?.replace(/[,]/gi, "") || tile.thumbUrl}
                            className={classes.img}
                            alt="product.png"
                            style={{ borderRadius: 30 }}
                          />
                        ) : (
                          img.type === "video" &&
                          img.url !== null && (
                            <span
                              key={"video"}
                              style={{ width: "100%", borderRadius: 30 }}
                              dangerouslySetInnerHTML={{
                                __html: img.url,
                              }}
                            />
                          )
                        )
                      )
                    ) : (
                      <img
                        src={tile.thumbUrl}
                        className={classes.img}
                        alt="*"
                        style={{ borderRadius: 30 }}
                      />
                    )}
                  </Carousel>
                </CardMedia>

                <CardContent
                  data-color-mode="light"
                  style={{ alignContent: "space-between" }}
                >
                  <Typography
                    gutterBottom
                    style={{ padding: 0, marginBotom: 12, width: 10 }}
                    variant="h5"
                    component="h2"
                  >
                    {tile.name}
                  </Typography>
                  <Typography
                    gutterBottom
                    style={{ fontSize: 15, padding: 0, marginBottom: 15 }}
                    variant="h5"
                    component="h2"
                  >
                    {tile && priceSelect(tile)}
                  </Typography>
                  <MDEditor.Markdown
                    source={
                      showFullDescription[iProd]
                        ? tile.description
                        : tile.description.split("\r\n")[0].length > 130
                        ? `${tile.description
                            .split("\r\n")[0]
                            .slice(0, 130)}...`
                        : `${tile.description.split("\r\n")[0]}`
                    }
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                  {tile.description.length > 130 && (
                    <Button
                      style={{
                        color: "dimgray",
                        // backgroundColor: "gainsboro",
                      }}
                      onClick={() => toggleDescription(iProd)}
                    >
                      {showFullDescription[iProd] ? "Ver menos" : "Ver más"}
                    </Button>
                  )}

                  {tile.productionTime && (
                    <div
                      style={{
                        fontFamily:
                          "apple-system, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
                        fontSize: 16,
                        lineHeight: 1.5,
                        wordWrap: "break-word",
                        // color: "gray",
                      }}
                    >
                      Tiempo de producción estimado: {tile.productionTime}{" "}
                      {tile.productionTime == 1 ? "día." : "días."}
                    </div>
                  )}
                </CardContent>
                {/* </CardActionArea> */}
                {tile.hasSpecialVar && (
                  <>
                    <CardActions style={{ width: "25%" }}>
                      <Grid item xs={12} md={12}>
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                        >
                          <TextField
                            variant="outlined"
                            display="inline"
                            id="width"
                            label="Ancho"
                            name="width"
                            autoComplete="width"
                            value={width[iProd]}
                            onChange={async (e) => {
                              if (!e.target.value) {
                                let w = width;
                                w[iProd] = e.target.value;
                                setWidth([...w]);
                                let l = await getEquation(
                                  tile,
                                  iProd,
                                  tiles,
                                  width,
                                  height
                                );
                                setTiles([...l]);
                              } else {
                                if (
                                  /^\d+$/.test(e.target.value) &&
                                  e.target.value[0] !== "0"
                                ) {
                                  if (e.target.value && e.target.value != 0) {
                                    let w = width;
                                    w[iProd] = e.target.value;
                                    setWidth([...w]);
                                    let l = await getEquation(
                                      tile,
                                      iProd,
                                      tiles,
                                      width,
                                      height
                                    );
                                    setTiles([...l]);
                                  } else {
                                    let w = width;
                                    w[iProd] = e.target.value;
                                    setWidth([...w]);
                                    let l = await getEquation(
                                      tile,
                                      iProd,
                                      tiles,
                                      width,
                                      height
                                    );
                                    setTiles([...l]);
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </CardActions>
                    <CardActions style={{ width: "25%" }}>
                      <Grid item xs={12} md={12}>
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                        >
                          <TextField
                            variant="outlined"
                            display="inline"
                            id="height"
                            label="Alto"
                            name="height"
                            autoComplete="height"
                            value={height[iProd]}
                            onChange={async (e) => {
                              if (!e.target.value) {
                                let h = height;
                                h[iProd] = e.target.value;
                                setHeight([...h]);
                                let l = await getEquation(
                                  tile,
                                  iProd,
                                  tiles,
                                  width,
                                  height
                                );
                                setTiles([...l]);
                              } else {
                                if (
                                  /^\d+$/.test(e.target.value) &&
                                  e.target.value[0] !== "0"
                                ) {
                                  if (e.target.value && e.target.value != 0) {
                                    let h = height;
                                    h[iProd] = e.target.value;
                                    setHeight([...h]);
                                    let l = await getEquation(
                                      tile,
                                      iProd,
                                      tiles,
                                      width,
                                      height
                                    );
                                    setTiles([...l]);
                                  } else {
                                    let h = height;
                                    h[iProd] = e.target.value;
                                    setHeight([...h]);
                                    let l = await getEquation(
                                      tile,
                                      iProd,
                                      tiles,
                                      width,
                                      height
                                    );
                                    setTiles([...l]);
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                      </Grid>
                      {/* </Grid> */}
                    </CardActions>
                  </>
                )}

                {tile.attributes &&
                  tile.attributes.map((att, iAtt, attributesArr) =>
                    iAtt === 0 ? (
                      <CardActions key={iAtt} style={{ width: "50%" }}>
                        <Grid item xs={12} sm={12} md={12}>
                          <FormControl
                            variant="outlined"
                            className={classes.form}
                            xs={12}
                            sm={12}
                            md={12}
                          >
                            <InputLabel required id="att.name">
                              {att.name}
                            </InputLabel>
                            <Select
                              value={tile.selection && tile.selection[0]}
                              onChange={async (e) => {
                                const pAtts = await setProductAtts(
                                  e.target.value,
                                  attributesArr,
                                  iProd,
                                  iAtt,
                                  productsArr,
                                  width,
                                  height
                                );
                                if (pAtts) {
                                  setTiles(
                                    pAtts.pAtt
                                      ? [...pAtts.pAtt]
                                      : [...pAtts.att]
                                  );
                                }
                              }}
                              label={att.selection}
                            >
                              <MenuItem value={undefined}>
                                <em></em>
                              </MenuItem>
                              {att.value &&
                                att.value.map((n, i) => (
                                  <MenuItem key={n} value={n}>
                                    {n}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </CardActions>
                    ) : (
                      tile.selection[0] !== undefined && (
                        <CardActions key={1} style={{ width: "50%" }}>
                          <Grid item xs={12} sm={12} md={12}>
                            <FormControl
                              variant="outlined"
                              className={classes.form}
                              xs={12}
                              sm={12}
                              md={12}
                            >
                              <InputLabel required id="att.name">
                                {att.name}
                              </InputLabel>
                              <Select
                                value={tile.selection[1] && tile.selection[1]}
                                onChange={async (e) => {
                                  const pAtts = await setSecondProductAtts(
                                    e.target.value,
                                    attributesArr,
                                    iProd,
                                    iAtt,
                                    productsArr,
                                    width,
                                    height
                                  );
                                  if (pAtts) {
                                    setTiles(
                                      pAtts.pAtt
                                        ? [...pAtts.pAtt]
                                        : [...pAtts.att]
                                    );
                                  }
                                }}
                                label={att.selection}
                              >
                                <MenuItem value={undefined}>
                                  <em></em>
                                </MenuItem>
                                {tile.variants.map(
                                  (variant) =>
                                    (variant.attributes[0].value ===
                                      tile.selection ||
                                      variant.attributes[0].value ===
                                        tile.selection[0]) && (
                                      <MenuItem
                                        key={variant._id}
                                        value={variant.attributes[1]?.value}
                                      >
                                        {variant.attributes[1]?.value}
                                      </MenuItem>
                                    )
                                )}
                              </Select>
                            </FormControl>
                          </Grid>
                        </CardActions>
                      )
                    )
                  )}

                <CardActions>
                  {tile.variants &&
                    tile.variants.map((v) => {
                      if (v.attributes) {
                        const test = v.attributes.reduce((r, a) => {
                          return a.name in tile.attributes === true;
                        }, true);
                      }
                    })}
                </CardActions>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button
                    disabled={
                      (tile.attributes[0] !== undefined &&
                        tile.selection[0] === undefined) ||
                      (tile.attributes.length === 2 &&
                        typeof tile.selection === "string")
                        ? true
                        : false
                    }
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      addingToCart(e, tile);
                    }}
                  >
                    <AddShoppingCartIcon />
                    Agregar
                  </Button>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        window.open(
                          utils.generateWaProductMessage(tile),
                          "_blank"
                        );
                      }}
                    >
                      Información <WhatsAppIcon />
                    </Button>
                  </CardActions>
                </Grid>
              </Card>
            ))
          ) : (
            <h1>Pronto encontrarás los productos ideales para ti.</h1>
          )}
        </Masonry>
      </ResponsiveMasonry>
    </>
  );
}
