//[]      17. Búsqueda de Prixers.
//[]      16. Filtros para las búsquedas (Por etiqueta).
//[]      25. Editar datos de la imagen en la tarjeta del grid grande.

import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { isWidthUp } from "@material-ui/core/withWidth";
import CircularProgress from "@material-ui/core/CircularProgress";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
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
import { setProductAtts, getAttributes, getEquation } from "./services.js";

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
}));

const getGridListCols = () => {
  if (isWidthUp("md", 200)) {
    return 4;
  }

  return 1;
};

export default function ProductGrid(props) {
  const classes = useStyles();
  const [tiles, setTiles] = useState();
  const [imagesVariants, setImagesVariants] = useState([]);
  const [imagesProducts, setImagesProducts] = useState();
  const [width, setWidth] = useState([]);
  const [height, setHeight] = useState([]);
  const [order, setOrder] = useState("");

  const handleChange = (event) => {
    setOrder(event.target.value);
  };

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all";
    axios.get(base_url).then(
      async (response) => {
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
            let aPrice = a.publicPrice.from.replace(/[$]/gi, "");
            let bPrice = b.publicPrice.from.replace(/[$]/gi, "");
            return aPrice - bPrice;
          });
          setTiles(getAttributes(products));
        }
      },
      [order]
    );
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Ordenar</InputLabel>
          <Select
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
              <Card className={classes.root}>
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
                    {tile.needsEquation ? (
                      tile.variants[0].variantImage ? (
                        tile.variants[0].variantImage.map((img, key_id) =>
                          img.type === "images" ? (
                            <img
                              key={key_id}
                              src={img.url}
                              className={classes.img}
                              alt="variant"
                            />
                          ) : (
                            <span
                              key={key_id}
                              style={{ width: "100%" }}
                              dangerouslySetInnerHTML={{ __html: img.url }}
                            ></span>
                          )
                        )
                      ) : (
                        <img
                          src={tile.thumbUrl}
                          className={classes.img}
                          alt="product"
                        />
                      )
                    ) : tile.sources && tile.sources.images?.length > 0 ? (
                      tile.sources.images.map((img, key_id) =>
                        img.type === "images" ? (
                          <img
                            key={key_id}
                            src={img.url}
                            className={classes.img}
                            alt="product"
                          />
                        ) : (
                          <span
                            key={key_id}
                            style={{ width: "100%" }}
                            dangerouslySetInnerHTML={{ __html: img.url }}
                          ></span>
                        )
                      )
                    ) : (
                      <img
                        src={tile.thumbUrl}
                        className={classes.img}
                        alt="product"
                      />
                    )}
                  </Carousel>
                </CardMedia>
                <CardActionArea style={{ alignContent: "space-between" }}>
                  <CardContent data-color-mode="light">
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
                      {JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username
                        ? tile.needsEquation &&
                          tile.prixerEquation &&
                          tile.prixerEquation != 0
                          ? "PVP: $" +
                            Math.round(parseFloat(tile.publicEquation)) +
                            " \n PVM: $" +
                            Math.round(parseFloat(tile.prixerEquation))
                          : "PVP: $" +
                            tile.publicPrice?.from +
                            " - " +
                            tile.publicPrice?.to +
                            " \n PVM: $" +
                            tile.prixerPrice?.from +
                            " - " +
                            tile.prixerPrice?.to
                        : tile.needsEquation &&
                          tile.publicEquation &&
                          tile.publicEquation != 0
                        ? "PVP: $" + Math.round(parseFloat(tile.publicEquation))
                        : "PVP: " +
                          tile.publicPrice?.from +
                          " - " +
                          tile.publicPrice?.to}
                    </Typography>
                    {/* <Typography variant="body2" color="textSecondary" component="p">
                  {tile.description}
                </Typography> */}
                    <MDEditor.Markdown
                      source={tile.description}
                      style={{ whiteSpace: "pre-wrap" }}
                    />
                  </CardContent>
                </CardActionArea>
                {tile.hasSpecialVar && (
                  <>
                    <CardActions style={{ width: "25%" }}>
                      {/* <Grid container xs={12} md={12} spacing={2}> */}
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
                  tile.attributes.map((att, iAtt, attributesArr) => (
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
                            labelId="artTypeLabel"
                            id="artType"
                            value={tile.selection && tile.selection[iAtt]}
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
                                  pAtts.pAtt ? [...pAtts.pAtt] : [...pAtts.att]
                                );
                              }
                            }}
                            label={att.selection}
                          >
                            <MenuItem value="">
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
                  ))}
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
