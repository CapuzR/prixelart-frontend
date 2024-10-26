import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import WhatsAppIcon from "@material-ui/icons/WhatsApp"
import utils from "../../utils/utils"
import MDEditor from "@uiw/react-md-editor"
import Grid from "@material-ui/core/Grid"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

import { useHistory } from "react-router-dom"
import ReactGA from "react-ga"
import world from "images/world.svg"
import worldBlack from "images/world-black.svg"
import vzla from "images/vzla.svg"
import { formatPriceForUI } from "utils/formats"
import { useCurrency, useConversionRate } from 'context/GlobalContext';
import { fetchProducts } from '../api';
import { processProductsResponse } from '../services';

import { Slider } from "components/Slider";
import { Image } from "components/Image";

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
  thumbZ: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    backgroundImage: `url(${world})`,
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  thumbTrueZ: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    backgroundImage: `url(${vzla})`,
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
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
  trackZ: {
    borderRadius: "20px",
    backgroundColor: "silver !important",
    opacity: "1 !important",
    position: "relative",
    "&:after, &:before": {
      position: "absolute",
      top: "8px",
      width: "20px",
      height: "20px",
      content: "''",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
    },
    "&:after": {
      left: "8px",
      backgroundImage: `url(${vzla})`,
    },
    "&:before": {
      right: "7px",
      backgroundImage: `url(${worldBlack})`,
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
  const [maxLength, setMaxLength] = useState(0)

  const [order, setOrder] = useState("")
  const history = useHistory()
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const handleChange = (event) => {
    setOrder(event.target.value)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProducts(order, currentPage, productsPerPage);
        const { products, maxLength } = { products: response.products, maxLength: response.maxLength };
        setMaxLength(maxLength);
        setTiles(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [order, currentPage, productsPerPage]);

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
      pathname: "/",
      search: "?producto=" + product.id,
      state: { product: product }
    })
    ReactGA.event({
      category: "Productos",
      action: "Ver_mas",
      label: product.name,
    })
  }
  
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "80%",
          margin: "0 auto",
          marginTop: "1rem",
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
      </div>
      <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 768: 2 }}>
        <Masonry style={{ columnGap: "1.8rem", width: "80%", margin: "0 auto" }}>
          {tiles && tiles.length > 0 ? (
            tiles.map((tile) => (
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
                <div style={{ width: "50%", padding: 0, }}>
                  <Slider images={tile?.sources?.images} size="100%">
                    {tile?.sources?.images?.map((image, i) => (
                      <Image key={i} src={image.url} alt={tile?.product?.name} />
                    ))}
                  </Slider>
                </div>
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
                        tile.description.split("\r\n")[0].length > 60
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
                      { formatPriceForUI(tile.priceRange.from, currency, conversionRate, tile.priceRange.to) }
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
      {/* TO DO: Mover Paginación a su propio componente para poder utilizar en todo el website:
      galeria, productos, mini galería, órdenes, etc. */}
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
