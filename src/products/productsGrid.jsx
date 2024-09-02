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
import ProductOrdering from "./productOrdering.jsx";
import CurrencySwitch from "../sharedComponents/currencySwitch/currencySwitch.jsx";
import ProductCard from "./productCard.jsx";

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

  //Probablemente vaya a desaparecer porque el cálculo del precio debería ocurrir en el back.
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

  //Esto debería ser parte del orderingProduct? 
  //Probablemente vaya a desaparecer porque el cálculo del precio debería ocurrir en el back.
  //Por qué? Porque debería consultar productos de n en n y no traer todos para ordenar en el front, imo. 
  //Si es así, el ordering nunca puede ocurrir en el front.
  const handleOrder = (event) => {
    setOrder(event.target.value);
  };

  
  //Probablemente vaya a desaparecer porque el cálculo del precio debería ocurrir en el back.
  useEffect(() => {
    getDiscounts();
  }, []);

  //Probablemente la mayoría vaya a desaparecer porque el cálculo del precio debería ocurrir en el back.
  //Por qué? Porque debería consultar productos de n en n y no traer todos para ordenar en el front, imo. 
  //Si es así, el ordering nunca puede ocurrir en el front.
  useEffect(() => {
    ///Esto debería ser reemplazado por una función que llame a get products y que ya incluya el 
    //precio correcto. Que también se incluya paginación acá.
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product_v2/read-all";
    axios.get(base_url).then(async (response) => {
      let productsAttTemp1 = response.data.products;
      console.log("productsAttTemp1", productsAttTemp1);
      setTiles(productsAttTemp1);
      // if (order === "") {
      //   //DEBO REEMPLAZAR ESTE GETATTRIBUTES PARA QUE TENGA UN MODELO MAS SENCILLO!!!!
      //   const t = getAttributes(productsAttTemp1);
      //   console.log("tttttttttttt", t);
      //   setTiles(t);
      // } else if (order === "A-Z") {
      //   let products = productsAttTemp1.sort(function (a, b) {
      //     if (a.name.toLowerCase() > b.name.toLowerCase()) {
      //       return 1;
      //     }
      //     if (a.name.toLowerCase() < b.name.toLowerCase()) {
      //       return -1;
      //     }
      //     return 0;
      //   });
      //   setTiles(getAttributes(products));
      // } else if (order === "Z-A") {
      //   let products = productsAttTemp1.sort(function (a, b) {
      //     if (a.name.toLowerCase() < b.name.toLowerCase()) {
      //       return 1;
      //     }
      //     if (a.name.toLowerCase() > b.name.toLowerCase()) {
      //       return -1;
      //     }
      //     return 0;
      //   });
      //   setTiles(getAttributes(products));
      // } else if (order === "Price") {
      //   let products = productsAttTemp1.sort(function (a, b) {
      //     let aPrice = a.publicPrice.from;
      //     let bPrice = b.publicPrice.from;
      //     return aPrice - bPrice;
      //   });
      //   const t = getAttributes(products);
      //   console.log("tttttttttttt", t);
      //   setTiles(t);
      // }
    });
  }, [order]);

  //Probablemente va en ProductCard
  const addingToCart = (e, tile) => {
    e.preventDefault();
    props.setSelectedProduct(tile);
    props.setIsOpenAssociateArt(true);
  };

  //Esto deberia ir en currencySwitch y currency debería ser un CONTEXT.
  const changeCurrency = () => {
    setCurrency(!currency);
  };

  return (
    <>
      {/* Control Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "end",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginRight: 40,
      }}>
        {/* Currency component */}
          <CurrencySwitch classes={classes} currency={currency} changeCurrency={changeCurrency} />
        {/* Order component */}
          <ProductOrdering order={order} handleOrder={handleOrder} classes={classes} />
      </div>
      
      {/* Grid component */}
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1080: 3 }}
      >
        <Masonry style={{ columnGap: "30px" }}>
          {tiles ? (
            tiles.map((tile, iProd, productsArr) => (
              // Product Card Component
              <ProductCard
                tile={tile}
                width={width}
                setTiles={setTiles}
                iProd={iProd}
                productsArr={productsArr}
                classes={classes}
                addingToCart={addingToCart}
                toggleDescription={toggleDescription}
                showFullDescription={showFullDescription}
                height={height}
                setProductAtts={setProductAtts}
                setSecondProductAtts={setSecondProductAtts}
                utils={utils}
                currency={currency}
                discountList={discountList}
              />

            ))
          ) : (
            <h1>Pronto encontrarás los productos ideales para ti.</h1>
          )}
        </Masonry>
      </ResponsiveMasonry>
    </>
  );
}
