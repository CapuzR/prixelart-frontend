import React, { useState, useEffect } from "react"
import axios from "axios"

import AppBar from "../sharedComponents/appBar/appBar"
import ArtsGrid from "../prixerProfile/grid/grid"
import WarpImage from "../admin/productCrud/warpImage.js"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Snackbar from "@material-ui/core/Snackbar"
import Grid from "@material-ui/core/Grid"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Typography } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import { useHistory } from "react-router-dom"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Backdrop } from "@material-ui/core"
import Switch from "@material-ui/core/Switch"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Img from "react-cool-img"
import CardActions from "@material-ui/core/CardActions"
import InputLabel from "@material-ui/core/InputLabel"
import ShareIcon from "@material-ui/icons/Share"

import MDEditor from "@uiw/react-md-editor"
import ReactGA from "react-ga"
ReactGA.initialize("G-0RWP9B33D8")
import { getPVPtext, getPVMtext } from "../shoppingCart/pricesFunctions.js"
import {
  setProductAtts,
  setSecondProductAtts,
  getAttributes,
  getEquation,
} from "./services.js"
import utils from "../utils/utils.js"

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    fontFamily: "Lastik",
    textTransform: "none",
    color: "black",
    fontWeight: 600,
    fontSize: 18,
  },
  formControl: {
    marginTop: theme.spacing(6),
    width: 120,
  },
  dotsContainer: {
    position: "relative",
    display: "flex !important",
    justifyContent: "center",
    padding: "unset",
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
}))

export default function PrixProduct(props) {
  const classes = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)

  const [prixerUsername, setPrixerUsername] = useState(null)
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"))
  const isTab = useMediaQuery(theme.breakpoints.down("sm"))
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  const [currency, setCurrency] = useState(false)
  const [discountList, setDiscountList] = useState([])
  const [imagesVariants, setImagesVariants] = useState([])
  const [tiles, setTiles] = useState([])
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedItem, setSelectedItem] = useState(undefined)
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [base64Image1, setBase64Image1] = useState(null)

  const [buyState, setBuyState] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState"))
      : []
  )
  const [width, setWidth] = useState([])
  const [height, setHeight] = useState([])
  const [openMatch, setOpenMatch] = useState(false)
  // const [cartLength, setCartLength] = useState()
  const url = window.location.pathname
  const id = url.substring(url.lastIndexOf("=") + 1)

  const changeCurrency = () => {
    setCurrency(!currency)
  }

  const getProduct = async () => {
    setLoading(true)
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read"
    await axios
      .post(base_url, { _id: id })
      .then(async (response) => {
        let productsAttTemp1 = response.data.products

        await productsAttTemp1.map(async (p, iProd, pArr) => {
          p.variants.map((variant) => {
            imagesVariants.push(variant.variantImage)
          })
          productsAttTemp1 = await getEquation(p, iProd, pArr)
        })
        setTiles(getAttributes(productsAttTemp1))
        setSelectedItem(getAttributes(productsAttTemp1)[0])
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv2"
    await axios
      .post(base_url)
      .then((response) => {
        setDiscountList(response.data.discounts)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  useEffect(() => {
    getProduct(), getDiscounts()
  }, [])

  const fetchImages = async (product) => {
    const url =
      process.env.REACT_APP_BACKEND_URL + "/mockupImages/" + product._id
    try {
      const response = await axios.get(url)
      const base64Image = response.data
      if (response.data.size < 1250) {
        props?.setOpen(true)
        props?.setMessage("Error al cargar imagen")
      } else {
        setBase64Image1(base64Image)
      }
    } catch (error) {
      props?.setOpen(true)
      props?.setMessage("Error al cargar imagen")
      console.error("Error fetching image:", error)
    }
  }
  console.log(selectedArt)

  // useEffect(() => {
  //   allowMockup()
  // }, [selectedArt])

  const allowMockup = (tile) => {
    if (tile?.mockUp !== undefined && selectedArt !== undefined) {
      // fetchImages(tile)

      return (
        <div
          style={{
            width: 210,
            height: 210,
            position: "relative",
          }}
        >
          <WarpImage
            warpPercentage={tile.mockUp.warpPercentage}
            warpOrientation={tile.mockUp.warpOrientation}
            invertedWrap={tile.mockUp.invertedWrap}
            randomArt={selectedArt}
            topLeft={tile.mockUp.topLeft}
            width={tile.mockUp.width}
            height={tile.mockUp.height}
            perspective={tile.mockUp.perspective}
            rotate={tile.mockUp.rotate}
            rotateX={tile.mockUp.rotateX}
            rotateY={tile.mockUp.rotateY}
            skewX={tile.mockUp.skewX}
            skewY={tile.mockUp.skewY}
            translateX={tile.mockUp.translateX}
            translateY={tile.mockUp.translateY}
            setOpen={props.setOpen}
            setMessage={props.setMessage}
          />
          <div
            style={{
              backgroundImage: "url(" + tile.mockUp.mockupImg + ")",
              width: 210,
              height: 210,
              backgroundSize: "cover",
              borderRadius: 20,
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: "2",
            }}
          />
        </div>
      )
    } else {
      return (
        <Slider {...settings}>
          {tile &&
            tile?.sources?.images?.map((art, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "25.5rem",
                  width: "100%",
                  marginRight: 10,
                }}
              >
                <div
                  style={{
                    marginTop: 5,
                    width: "95%",
                    height: "25.5rem",
                    backgroundImage: `url(${art.url})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            ))}
        </Slider>
      )
    }
  }

  const addingToCart = (e, selectedItem) => {
    e.preventDefault()
    // props.setSelectedProduct(selectedItem);
    props.setIsOpenAssociateArt(true);

    props.addItemToBuyState({
      type: "product",
      item: selectedItem,
    })
    setSelectedItem(undefined)
    history.push({ pathname: "/galeria" })
    // props.addItemToBuyState({
    //   type: "product",
    //   item: selectedItem,
    // })
    // setOpenMatch(true)
  }

  const priceSelect = (item) => {
    if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token"))?.username
    ) {
      return getPVMtext(item, currency, props.dollarValue, discountList)
    } else {
      return getPVPtext(item, currency, props.dollarValue, discountList)
    }
  }

  const settings = {
    customPaging: function (i) {
      let image = selectedItem?.sources?.images[i]?.url

      return (
        <li
          style={{
            listStyle: "none",
            marginLeft: "-12px",
            marginRight: "30px",
          }}
        >
          <a style={{ display: "block", textDecoration: "none" }}>
            <img
              src={image}
              style={{
                width: isTab ? 45 : 70,
                height: isTab ? 45 : 70,
                objectFit: "cover",
              }}
            />
          </a>
        </li>
      )
    },
    dots: true,
    dotsClass: classes.dotsContainer,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    pauseOnHover: true,
  }

  return (
    <>
      <Backdrop
        className={classes.backdrop}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>
      <AppBar prixerUsername={prixerUsername} />

      {tiles !== undefined &&
        tiles.length > 0 &&
        tiles.map((tile, iProd, productsArr) => (
          <Grid
            container
            style={{
              marginLeft: "5%",
              paddingRight: isTab ? "5%" : "12.5%",
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "3.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
                margin: "2rem auto",
              }}
            >
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
                    changeCurrency(e)
                  }}
                  style={{ marginRight: "-5px" }}
                />
              </div>
            </div>
            {isTab && (
              <Typography
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  display: "flex",
                  width: "100%",
                  color: "#404e5c",
                }}
              >
                {tile.name}
              </Typography>
            )}
            {isTab && (
              <div
                data-color-mode="light"
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  display: "flex",
                }}
              >
                <MDEditor.Markdown
                  source={tile?.description}
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: isTab ? 13 : 16,
                    marginBottom: 35,
                  }}
                />
              </div>
            )}
            <Grid
              item
              xs={12}
              sm={6}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "50%",
              }}
            >
              {tile?.mockUp !== undefined && selectedArt !== undefined ? (
                <div
                  style={{
                    width: 210,
                    height: 210,
                    position: "relative",
                  }}
                >
                  <WarpImage
                    warpPercentage={tile.mockUp.warpPercentage}
                    warpOrientation={tile.mockUp.warpOrientation}
                    invertedWrap={tile.mockUp.invertedWrap}
                    randomArt={selectedArt}
                    topLeft={tile.mockUp.topLeft}
                    width={tile.mockUp.width}
                    height={tile.mockUp.height}
                    perspective={tile.mockUp.perspective}
                    rotate={tile.mockUp.rotate}
                    rotateX={tile.mockUp.rotateX}
                    rotateY={tile.mockUp.rotateY}
                    skewX={tile.mockUp.skewX}
                    skewY={tile.mockUp.skewY}
                    translateX={tile.mockUp.translateX}
                    translateY={tile.mockUp.translateY}
                    setOpen={props.setOpen}
                    setMessage={props.setMessage}
                  />
                  <div
                    style={{
                      backgroundImage: "url(" + tile.mockUp.mockupImg + ")",
                      width: 210,
                      height: 210,
                      backgroundSize: "cover",
                      borderRadius: 20,
                      position: "absolute",
                      top: "0",
                      left: "0",
                      zIndex: "2",
                    }}
                  />
                </div>
              ) : (
                <Slider {...settings}>
                  {tile &&
                    tile?.sources?.images?.map((art, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "25.5rem",
                          width: "100%",
                          marginRight: 10,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 5,
                            width: "95%",
                            height: "25.5rem",
                            backgroundImage: `url(${art.url})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                          }}
                        />
                      </div>
                    ))}
                </Slider>
              )}
              {openMatch && (
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: 20,
                    marginTop: 50,
                  }}
                >
                  {!isTab && (
                    <Typography
                      style={{
                        fontSize: 40,
                        fontWeight: 600,
                        color: "#404e5c",
                      }}
                    >
                      {tile?.name}
                    </Typography>
                  )}
                  {!isTab && (
                    <div
                      data-color-mode="light"
                      style={{
                        marginTop: 50,
                        marginBottom: 30,
                        display: "flex",
                      }}
                    >
                      <MDEditor.Markdown
                        source={tile?.description}
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: isTab ? 13 : 16,
                          marginBottom: 35,
                        }}
                      />
                    </div>
                  )}

                  {tile.attributes &&
                    tile.attributes.map((att, iAtt, attributesArr) =>
                      iAtt === 0 ? (
                        <CardActions key={iAtt}>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                          >
                            <FormControl
                              variant="outlined"
                              style={{ width: "100%" }}
                              className={classes.form}
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                            >
                              <InputLabel
                                required
                                id="att.name"
                              >
                                {att.name}
                              </InputLabel>
                              <Select
                                value={
                                  selectedItem?.selection &&
                                  selectedItem?.selection[0]
                                }
                                onChange={async (e) => {
                                  const pAtts = await setProductAtts(
                                    e.target.value,
                                    attributesArr,
                                    iProd,
                                    iAtt,
                                    productsArr,
                                    width,
                                    height
                                  )
                                  if (pAtts) {
                                    setTiles(
                                      pAtts.pAtt
                                        ? [...pAtts.pAtt]
                                        : [...pAtts.att]
                                    )
                                  }
                                }}
                                label={att.selection}
                              >
                                <MenuItem value={undefined}>
                                  <em></em>
                                </MenuItem>
                                {att.value &&
                                  att.value.map((n, i) => (
                                    <MenuItem
                                      key={n}
                                      value={n}
                                    >
                                      {n}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </CardActions>
                      ) : (
                        selectedItem?.selection[0] !== undefined && (
                          <CardActions
                            key={1}
                            // style={{ width: "50%" }}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                            >
                              <FormControl
                                variant="outlined"
                                className={classes.form}
                                xs={12}
                                sm={12}
                                md={12}
                              >
                                <InputLabel
                                  required
                                  id="att.name"
                                >
                                  {att.name}
                                </InputLabel>
                                <Select
                                  value={
                                    selectedItem.selection[1] &&
                                    selectedItem.selection[1]
                                  }
                                  onChange={async (e) => {
                                    const pAtts = await setSecondProductAtts(
                                      e.target.value,
                                      attributesArr,
                                      iProd,
                                      iAtt,
                                      productsArr,
                                      width,
                                      height
                                    )
                                    if (pAtts) {
                                      setTiles(
                                        pAtts.pAtt
                                          ? [...pAtts.pAtt]
                                          : [...pAtts.att]
                                      )
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
                  {/* <CardActions>
                  {selectedItem.variants &&
                    selectedItem.variants.map((v) => {
                      if (v.attributes) {
                        const test = v.attributes.reduce((r, a) => {
                          return a.name in selectedItem.attributes === true;
                        }, true);
                      }
                    })}
                </CardActions> */}
                  <Typography
                    style={{ fontSize: 24, fontWeight: 600, color: "#404e5c" }}
                  >
                    {priceSelect(tile)}
                  </Typography>
                  <Grid></Grid>

                  {/* {selectedItem?.product?.specs && (
            <div
              data-color-mode="light"
              style={{
                marginTop: 50,
                marginBottom: 30,
                display: "flex",
              }}
            >
              <MDEditor.Markdown
                source={selectedItem.product?.specs}
                style={{ whiteSpace: "pre-wrap", fontSize: isTab ? 13 : 16 }}
              />
            </div>
          )} */}
                </Grid>
              )}
            </Grid>

            {openMatch && (
              <Grid
                item
                xs={12}
                sm={5}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: 20,
                  backgroundColor: "gainsboro",
                  borderRadius: 16,
                  padding: "20px",
                  marginBottom: 20,
                }}
              >
                <Typography
                  variant="h5"
                  style={{
                    fontWeight: 600,
                    color: "#404e5c",
                    margin: "10px auto",
                  }}
                >
                  Asocia el producto a un arte
                </Typography>
                <ArtsGrid
                  setSelectedArt={setSelectedArt}
                  setFullArt={props.setFullArt}
                  fullArt={props.fullArt}
                  setSearchResult={props.setSearchResult}
                  searchResult={props.searchResult}
                />
              </Grid>
            )}
            {!openMatch && (
              <Grid
                item
                xs={12}
                sm={4}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginRight: 20,
                }}
              >
                {!isTab && (
                  <Typography
                    style={{ fontSize: 40, fontWeight: 600, color: "#404e5c" }}
                  >
                    {tile?.name}
                  </Typography>
                )}
                {!isTab && (
                  <div
                    data-color-mode="light"
                    style={{
                      marginTop: 50,
                      marginBottom: 30,
                      display: "flex",
                    }}
                  >
                    <MDEditor.Markdown
                      source={tile?.description}
                      style={{
                        whiteSpace: "pre-wrap",
                        fontSize: isTab ? 13 : 16,
                        marginBottom: 35,
                      }}
                    />
                  </div>
                )}

                {tile.attributes &&
                  tile.attributes.map((att, iAtt, attributesArr) =>
                    iAtt === 0 ? (
                      <CardActions key={iAtt}>
                        <Grid
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={12}
                        >
                          <FormControl
                            variant="outlined"
                            style={{ width: "100%" }}
                            className={classes.form}
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                          >
                            <InputLabel
                              required
                              id="att.name"
                            >
                              {att.name}
                            </InputLabel>
                            <Select
                              value={
                                selectedItem?.selection &&
                                selectedItem?.selection[0]
                              }
                              onChange={async (e) => {
                                const pAtts = await setProductAtts(
                                  e.target.value,
                                  attributesArr,
                                  iProd,
                                  iAtt,
                                  productsArr,
                                  width,
                                  height
                                )
                                if (pAtts) {
                                  setTiles(
                                    pAtts.pAtt
                                      ? [...pAtts.pAtt]
                                      : [...pAtts.att]
                                  )
                                }
                              }}
                              label={att.selection}
                            >
                              <MenuItem value={undefined}>
                                <em></em>
                              </MenuItem>
                              {att.value &&
                                att.value.map((n, i) => (
                                  <MenuItem
                                    key={n}
                                    value={n}
                                  >
                                    {n}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </CardActions>
                    ) : (
                      selectedItem?.selection[0] !== undefined && (
                        <CardActions
                          key={1}
                          // style={{ width: "50%" }}
                        >
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                          >
                            <FormControl
                              variant="outlined"
                              className={classes.form}
                              xs={12}
                              sm={12}
                              md={12}
                            >
                              <InputLabel
                                required
                                id="att.name"
                              >
                                {att.name}
                              </InputLabel>
                              <Select
                                value={
                                  selectedItem.selection[1] &&
                                  selectedItem.selection[1]
                                }
                                onChange={async (e) => {
                                  const pAtts = await setSecondProductAtts(
                                    e.target.value,
                                    attributesArr,
                                    iProd,
                                    iAtt,
                                    productsArr,
                                    width,
                                    height
                                  )
                                  if (pAtts) {
                                    setTiles(
                                      pAtts.pAtt
                                        ? [...pAtts.pAtt]
                                        : [...pAtts.att]
                                    )
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
                {/* <CardActions>
                  {selectedItem.variants &&
                    selectedItem.variants.map((v) => {
                      if (v.attributes) {
                        const test = v.attributes.reduce((r, a) => {
                          return a.name in selectedItem.attributes === true;
                        }, true);
                      }
                    })}
                </CardActions> */}
                <Typography
                  style={{ fontSize: 24, fontWeight: 600, color: "#404e5c" }}
                >
                  {priceSelect(tile)}
                </Typography>
                <Grid>
                  <Grid
                    style={{ display: "flex", justifyContent: "space-around" }}
                  >
                    <Button
                      variant="outlined"
                      style={{
                        textTransform: "none",
                        width: "40%",
                        size: "small",
                        borderRadius: 10,
                        fontSize: 18,
                        marginTop: 20,
                        marginBottom: 40,
                        color: "#d33f49",
                      }}
                      onClick={(e) => {
                        window.open(
                          utils.generateWaProductMessage(tile),
                          "_blank"
                        )
                      }}
                    >
                      <ShareIcon /> Compartir
                    </Button>
                    <Button
                      style={{
                        textTransform: "none",
                        width: "55%",
                        size: "small",
                        backgroundColor: "#d33f49",
                        borderRadius: 10,
                        fontSize: 18,
                        marginTop: 20,
                        marginBottom: 40,
                        color: "white",
                      }}
                      onClick={(e) =>
                        // addItemToBuyState(selectedItem)
                        addingToCart(e, tile)
                      }
                    >
                      {/* Agregar al carrito */}
                      Seleccionar
                    </Button>
                  </Grid>
                </Grid>

                {/* {selectedItem?.product?.specs && (
            <div
              data-color-mode="light"
              style={{
                marginTop: 50,
                marginBottom: 30,
                display: "flex",
              }}
            >
              <MDEditor.Markdown
                source={selectedItem.product?.specs}
                style={{ whiteSpace: "pre-wrap", fontSize: isTab ? 13 : 16 }}
              />
            </div>
          )} */}
              </Grid>
            )}
          </Grid>
        ))}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  )
}