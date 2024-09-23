//[]      17. Búsqueda de Prixers.

import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Carousel from "react-material-ui-carousel"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import WhatsAppIcon from "@material-ui/icons/WhatsApp"
import utils from "../utils/utils"
import axios from "axios"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import MaximizeIcon from "@material-ui/icons/Maximize"
import MDEditor from "@uiw/react-md-editor"
import Grid from "@material-ui/core/Grid"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import TextField from "@material-ui/core/TextField"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import {
  setProductAtts,
  setSecondProductAtts,
  getAttributes,
  getEquation,
} from "./services.js"
import Paper from "@material-ui/core/Paper"

import AddShoppingCartIcon from "@material-ui/icons/ShoppingCart"
import { useHistory } from "react-router-dom"
import Switch from "@material-ui/core/Switch"
import { getPVPtext, getPVMtext } from "../shoppingCart/pricesFunctions.js"
import ReactGA from "react-ga"

ReactGA.initialize("G-0RWP9B33D8")

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
    // flexWrap: "wrap",
    flexDirection: "row",
    overflow: "hidden",
    alignContent: "space-between",
    padding: 10,
    marginTop: "1.8rem",
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
}))

export default function ProductGrid(props) {
  const classes = useStyles()
  const [tiles, setTiles] = useState([])
  const [categories, setCategories] = useState([])
  const [discountList, setDiscountList] = useState([])
  const [imagesVariants, setImagesVariants] = useState([])
  // const [imagesProducts, setImagesProducts] = useState();
  const [width, setWidth] = useState([])
  const [maxLength, setMaxLength] = useState(0)

  const [order, setOrder] = useState("")
  const [filter, setFilter] = useState("")
  const history = useHistory()
  const [currency, setCurrency] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState([])
  const [currentPage, setCurrentPage] = useState(1);  // Track current page
  const [productsPerPage] = useState(10);

  const toggleDescription = (index) => {
    const updatedShowFullDescription = [...showFullDescription]
    updatedShowFullDescription[index] = !updatedShowFullDescription[index]
    setShowFullDescription(updatedShowFullDescription)
  }

  const handleChange = (event) => {
    setOrder(event.target.value)
  };

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all-v2";
    console.log("currentPage", (currentPage-1) * productsPerPage);
    console.log("productsPerPage", productsPerPage);
    axios.get(base_url, {
      params: {
        orderType: order === "A-Z" || order === "lowerPrice" ? "asc" : order === "" ? "" : "desc",
        sortBy: order === "lowerPrice" || order === "maxPrice" ? "priceRange" : order === "" ? "" : "name",
        initialPoint: (currentPage - 1) * productsPerPage,
        productsPerPage: productsPerPage
      }
    }).then(async (response) => {
      let productsAttTemp1 = response.data.products;
      let maxLength = response.data.maxLength;
      console.log("response.data", response.data)
      console.log("productsAttTemp1",productsAttTemp1);
      setMaxLength(maxLength);
      setTiles(productsAttTemp1);
    });
  }, [order, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };
  

  const viewDetails = (product) => {
    history.push({
      pathname: "/producto=" + product._id,
    })
    ReactGA.event({
      category: "Productos",
      action: "Ver_mas",
      label: product.name,
    })
  }

  const changeCurrency = () => {
    setCurrency(!currency)
  }

  const priceSelect = (item) => {
    return currency ? 
      "Bs. " + item.from * props.dollarValue + " - " + item.to * props.dollarValue :
      "$ " + item.from + " - " + item.to;
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "80%",
          margin: "0 auto",
          marginTop: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginRight: "10px", padding: "0px" }}>
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="small"
            style={{ minWidth: "auto", padding: "2px", marginRight: "0.2rem", transform: "scale(0.75)" }}
          >
            &lt;
          </Button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              style={{
                margin: "0 0.2rem",
                color: "#d33f49",
                textAlign: "center",
                transform: "scale(0.75)",
              }}
            >
              {currentPage}
            </Typography>
          </div>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(maxLength / productsPerPage)}
            size="small"
            style={{ minWidth: "auto", padding: "2px", marginLeft: "0.2rem", transform: "scale(0.75)" }}
          >
            &gt;
          </Button>
        </div>
        <FormControl className={classes.formControl}>
          <InputLabel
            style={{ marginLeft: 10 }}
            id="demo-simple-select-label"
          >
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
            <MenuItem value={"lowerPrice"}>Menor precio</MenuItem>
            <MenuItem value={"maxPrice"}>Mayor precio</MenuItem>
          </Select>
        </FormControl>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
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
              changeCurrency(e)
            }}
            style={{ marginRight: "-5px" }}
          />
        </div>
      </div>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1800: 3 }}>
        <Masonry style={{ columnGap: "1.8rem", width: "80%", margin: "0 auto" }}>
          {tiles && tiles.length > 0 ? (
            tiles.map((tile, iProd) => (
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
                <CardMedia style={{ width: "110%", maxWidth: "14.68rem" }}>
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
                    {
                      tile.sources &&
                      tile.sources.images && 
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
                  style={{
                    alignContent: "space-between",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2.5rem",
                    paddingBottom: 0,
                  }}
                >
                  <Grid>
                    <Typography
                      gutterBottom
                      style={{ padding: 0, marginBotom: "0.8rem" }}
                      variant="h5"
                      component="h2"
                    >
                      {tile.name}
                    </Typography>
                    <MDEditor.Markdown
                      source={
                        showFullDescription[iProd]
                          ? tile.description
                          : tile.description.split("\r\n")[0].length > 60
                          ? `${tile.description
                              .split("\r\n")[0]
                              .slice(0, 60)}...`
                          : `${tile.description.split("\r\n")[0]}`
                      }
                      style={{ whiteSpace: "pre-wrap" }}
                    />
                    <Typography
                      gutterBottom
                      style={{ fontSize: 15, padding: 0, marginTop: "1rem" }}
                      variant="h5"
                      component="h2"
                    >
                      {priceSelect(tile.priceRange)}
                    </Typography>
                  </Grid>
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
                      size="small"
                      style={{
                        backgroundColor: "#d33f49",
                        color: "white",
                        padding: "0 1rem",
                        margin: "0.5rem",
                      }}
                      color="white"
                      onClick={(e) => {
                        viewDetails(tile)
                      }}
                    >
                      Detalles
                    </Button>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          window.open(
                            utils.generateWaProductMessage(tile),
                            "_blank"
                          )
                        }}
                      >
                        <WhatsAppIcon /> Info
                      </Button>
                    </CardActions>
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <h1>Pronto encontrarás los productos ideales para ti.</h1>
          )}
        </Masonry>
      </ResponsiveMasonry>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", marginBottom: "50px" }}>
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          &lt;
        </Button>
        <Typography variant="h6" style={{ margin: "0 1rem", color: "#d33f49" }}>
          {currentPage}
        </Typography>
            <Button 
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(maxLength / productsPerPage)}
            >
              &gt;
            </Button>
      </div>
    </>
    
  )
}
