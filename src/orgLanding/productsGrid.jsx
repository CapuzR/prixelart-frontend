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

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import ReactGA from "react-ga"
import world from "../images/world.svg"
import worldBlack from "../images/world-black.svg"
import vzla from "../images/vzla.svg"

ReactGA.initialize("G-0RWP9B33D8")

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  typography: { fontFamily: "Lastik" },
  base: {
    width: "70px",
    height: "37px",
    padding: "0px",
    margin: "16px",
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
    <Grid
      id="prods"
      container
    >
      {!isTab ? (
        <Grid
          item
          md={2}
        >
          <div style={{ display: "flex" }}>
            <Switch
              classes={{
                root: classes.base,
                switchBase: classes.switchBase,
                thumb: zone === "VZLA" ? classes.thumbTrueZ : classes.thumbZ,
                track: classes.trackZ,
                checked: classes.checked,
              }}
              color="primary"
              value={zone === "VZLA" ? true : false}
              onChange={(e) => {
                toggleZone()
              }}
              style={{ marginRight: "-5px" }}
            />
            <Typography
              style={{ alignContent: "center" }}
              className={classes.heading}
            >
              {zone === "VZLA" ? "Nacionales" : "Internacionales"}
            </Typography>
          </div>

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
      ) : (
        <Tabs
          style={{
            width: "100vw",
            backgroundColor: "rgb(0, 97, 52)",
            marginBottom: 20,
          }}
          value={tab}
          onChange={handleTab}
        >
          <Tab
            className={classes.button}
            label="Productos en Venezuela"
            index={0}
          />
          <Tab
            className={classes.button}
            label="Productos internacionales"
            index={1}
          />
        </Tabs>
      )}

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
                          opacity: tile?.product.available === false ? 0.5 : 1,
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
  )
}
