import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"

import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Accordion from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import Typography from "@material-ui/core/Typography"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Box from "@material-ui/core/Box"
import Checkbox from "@material-ui/core/Checkbox"
import Button from "@material-ui/core/Button"
import { getProducts } from "./xoxo"
import Slider from "react-slick"
import Switch from "@material-ui/core/Switch"
import { useGlobalContext } from "../context/globalContext"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import { Backdrop } from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import ReactGA from "react-ga"
import world from "../images/world-black.svg"
import worldBlack from "../images/world-black.svg"
import vzla from "../images/vzla.svg"

ReactGA.initialize("G-0RWP9B33D8")

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  typography: { fontFamily: "Lastik" },
  base: {
    width: "100px",
    height: "37px",
    padding: "0px",
    margin: "16px",
    marginLeft: "0px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchBase: {
    color: "white",
    padding: "1px",
    "&$checked": {
      "& + $track": {
        backgroundColor: "white",
      },
    },
  },
  thumbZ: {
    color: "white",
    width: "30px",
    height: "30px",
    margin: "2px",
    marginLeft: "3px",
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${vzla})`,
  },
  thumbFalseZ: {
    color: "white",
    width: "30px",
    height: "30px",
    margin: "2px",
    marginLeft: "3px",
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${world})`,
  },
  trackZ: {
    borderRadius: "20px",
    backgroundColor: "silver !important",
    opacity: "1 !important",
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
  },
  labelText: {
    color: "#333",
    fontSize: "14px",
    fontWeight: "bold",
    marginLeft: "10px",
  },
  checked: {
    color: "#d33f49 !important",
    transform: "translateX(61px) !important",
    padding: "1px",
  },
  button: {
    fontFamily: "Lastik ",
    textTransform: "none",
    width: "50%",
    color: "white",
  },
}))

export default function CBProducts() {
  const classes = useStyles()
  const theme = useTheme()

  const isTab = useMediaQuery(theme.breakpoints.down("sm"))

  const [all, setAll] = useState([])
  const [tiles, setTiles] = useState([])
  const history = useHistory()
  const [checkedProducts, setCheckedProducts] = useState([])
  const [checkedDesigns, setCheckedDesigns] = useState([])
  const { currency, toggleCurrency, zone, toggleZone } = useGlobalContext()
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleTab = (event, newValue) => {
    setTab(newValue)
    toggleZone()
  }

  const handleChange = (prod, filterType) => {
    let copyP = [...checkedProducts]
    let copyD = [...checkedDesigns]

    let result = all

    if (filterType === "product") {
      const index = copyP.indexOf(prod)

      if (index !== -1) {
        copyP.splice(index, 1)
      } else {
        copyP.push(prod)
      }
      setCheckedProducts(copyP)
    } else if (filterType === "art") {
      const index = copyD.indexOf(prod)
      if (index !== -1) {
        copyD.splice(index, 1)
      } else {
        copyD.push(prod)
      }
      setCheckedDesigns(copyD)
    }

    if (copyP.length > 0) {
      result = result.filter((item) => {
        return copyP.some((param) =>
          item.product.name.includes(param.slice(0, -1))
        )
      })
    }
    if (copyD.length > 0) {
      result = result.filter((item) => {
        return copyD.some((param) =>
          item.art.title.includes(param.slice(0, -1))
        )
      })
    }
    setTiles(result)
  }

  useEffect(() => {
    setTiles(getProducts())
    setAll(getProducts())
  }, [])

  const products = ["Franelas", "Tazas"]

  const designs = [
    "Cartoon",
    "Cafecito",
    "Independizar",
    "Pasante Subpagado",
    "Sobreviví",
  ]

  const viewDetails = (item) => {
    history.push({
      pathname: "/chiguirebipolar/item=" + item.product.item,
    })
    ReactGA.event({
      category: "Home CB",
      action: "Ver_mas",
      label: item.product.item,
    })
  }

  const setZone = () => {
    setLoading(true)
    toggleZone()
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: true,
    dots: true,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  }

  const settings2 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: true,
    pauseOnHover: true,
    arrows: false,
  }
  function SampleNextArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          backgroundColor: "#789BEC",
          borderRadius: "50%",
          width: "17px",
          height: "17px",
          display: "flex",
          right: "-20px",
          placeContent: "center",
        }}
        onClick={onClick}
      />
    )
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          backgroundColor: "#789BEC",
          borderRadius: "50%",
          width: "17px",
          height: "17px",
          display: "flex",
          left: "-20px",
          placeContent: "center",
        }}
        onClick={onClick}
      />
    )
  }

  return (
    <>
      <Backdrop
        className={classes.backdrop}
        open={loading}
        transitionDuration={500}
      >
        <CircularProgress />
      </Backdrop>
      <Grid
        id="prods"
        container
      >
        <Grid
          item
          xs={12}
        >
          <Grid
            item
            xs={12}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "rgb(120, 155, 236)",
                width: !isTab ? "30%" : "90%",
                borderRadius: 25,
                margin: "0 auto 20px",
                maxWidth: 350,
              }}
            >
              <Switch
                classes={{
                  root: classes.base,
                  switchBase: classes.switchBase,
                  thumb: zone === "VZLA" ? classes.thumbZ : classes.thumbFalseZ,
                  track: classes.trackZ,
                  checked: classes.checked,
                }}
                value={zone === "VZLA"}
                onChange={() => setZone()}
                style={{ color: "rgb(0, 97, 52)" }}
              >
                <span className={classes.labelText}>
                  {zone === "VZLA" ? "Nacional" : "Internacionales"}
                </span>
              </Switch>
              <Typography
                style={{
                  alignContent: "center",
                  color: "white",
                  fontWeight: "normal",
                  fontFamily: "Lastik",
                  width: "50%",
                }}
                variant="h5"
              >
                {zone === "VZLA" ? "Nacionales" : "Internacionales"}
              </Typography>
            </div>
          </Grid>
        </Grid>
        {!isTab && (
          <Grid
            item
            md={2}
          >
            <Accordion style={{ marginBottom: 20 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>Productos</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ display: "flex", flexDirection: "column" }}
              >
                {products.map((prod) => (
                  <Box
                    m={1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={checkedProducts.includes(prod)}
                      onClick={() => handleChange(prod, "product")}
                    />

                    <Typography>{prod}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
            <Accordion style={{ marginBottom: 20 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>Diseños</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ display: "flex", flexDirection: "column" }}
              >
                {designs.map((des) => (
                  <Box
                    m={1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={checkedDesigns.includes(des)}
                      onClick={() => handleChange(des, "art")}
                    />

                    <Typography>{des}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ) }

        <Grid
          item
          xs={12}
          md={9}
          style={{ marginRight: !isTab && 30 }}
        >
          <Grid
            container
            spacing={isTab ? 3 : 4}
            style={{ marginLeft: !isTab && 20 }}
          >
            {tiles.map((tile) => (
              <Grid
                item
                sm={6}
                xs={12}
                style={{
                  display: "flex",
                  justifyContent: "start",
                }}
              >
                <Grid
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    position: "relative",
                    width: isTab ? 215 : 250,
                    height: isTab ? 135 : 225,
                    padding: "0px 30px 0px 30px",
                    margin: isTab && "0px -15px 0px -15px",
                  }}
                >
                  <Slider {...(isTab ? settings2 : settings)}>
                    {tile.art?.images.map((art, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: isTab ? 130 : 181,
                          width: isTab ? 154 : 200,
                          marginRight: 10,
                          placeContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: isTab ? 154 : "100%",
                            height: isTab ? 130 : 181,
                            backgroundImage: `url(${art.img})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            borderRadius: 10,
                            opacity:
                              tile?.product.available === false ? 0.5 : 1,
                          }}
                        />
                      </div>
                    ))}
                  </Slider>
                </Grid>
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Typography
                        className={classes.typography}
                        style={{ fontSize: isTab ? 16 : 20, fontWeight: 600 }}
                      >{`${tile.product.name} ${tile.art.title}`}</Typography>
                      <Typography
                        className={classes.typography}
                        style={{ fontSize: isTab ? 13 : 16 }}
                      >
                        {tile?.product.description}
                      </Typography>
                    </div>
                    <Typography
                      className={classes.typography}
                      color="primary"
                      style={{
                        fontSize: isTab ? 16 : 20,
                        fontWeight: 600,
                        color:
                          tile.product.available === false
                            ? "#d33f49"
                            : "#00A650",
                      }}
                    >
                      {tile.product.available === true
                        ? zone === "INTER"
                          ? `$${tile?.product.interPrice?.toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          : `$${tile?.product.finalPrice?.toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                        : "Agotado"}
                    </Typography>
                  </div>
                  {tile.product.available !== false && (
                    <Button
                      className={classes.typography}
                      style={{
                        textTransform: "none",
                        width: "100%",
                        backgroundColor: "#F4DF46",
                        borderRadius: 10,
                      }}
                      onClick={() => viewDetails(tile)}
                    >
                      Ver detalles
                    </Button>
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
