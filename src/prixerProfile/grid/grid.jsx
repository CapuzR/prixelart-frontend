//[]      17. Búsqueda de Prixers.

import React, { useState, useEffect } from "react"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import { useTheme } from "@material-ui/core/styles"
import axios from "axios"
import { useHistory } from "react-router-dom"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import Backdrop from "@material-ui/core/Backdrop"
import CircularProgress from "@material-ui/core/CircularProgress"
import Img from "react-cool-img"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Switch from "@material-ui/core/Switch"
import Typography from "@material-ui/core/Typography"
import utils from "../../utils/utils"
import SearchBar from "../../sharedComponents/searchBar/searchBar.jsx"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import CardActionArea from "@material-ui/core/CardActionArea"
import Box from "@material-ui/core/Box"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import FullscreenPhoto from "../fullscreenPhoto/fullscreenPhoto"
import Star from "@material-ui/icons/StarRate"
import StarOutline from "@material-ui/icons/StarOutline"

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
    position: "absolute",
    marginLeft: "-8vh",
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "primary",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  )
})

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: theme.palette.background.paper,
    marginBottom: "15px",
  },
  img: {
    [theme.breakpoints.down("sm")]: {
      maxHeight: 180,
    },
    [theme.breakpoints.up("sm")]: {
      minHeight: 300,
      maxHeight: 300,
    },
    [theme.breakpoints.up("lg")]: {
      // minHeight: 300,
      // maxHeight: 450,
      minWidth: 300,
    },
    [theme.breakpoints.up("xl")]: {
      minHeight: 450,
      maxHeight: 450,
    },
  },
  imagen: {
    objectFit: "fill",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}))

export default function Grid(props) {
  const classes = useStyles()
  const [tiles, setTiles] = useState([])
  const [total, setTotal] = useState(1)
  const history = useHistory()
  const [onAdmin, setOnAdmin] = useState(false)
  let globalParams = new URLSearchParams(window.location.search)
  const [searchValue, setSearchValue] = useState(
    globalParams.get("name") || null
  )
  const [categoryValue, setCategoryValue] = useState(
    globalParams.get("category") || null
  )
  const [backdrop, setBackdrop] = useState(true)
  const theme = useTheme()
  const [snackBar, setSnackBar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState(false)
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [openV, setOpenV] = useState(false)
  const [openFullArt, setOpenFullArt] = useState(false)
  const [disabledReason, setDisabledReason] = useState("")
  const [visible, setVisible] = useState(true)
  const itemsPerPage = 30
  const [pageNumber, setPageNumber] = useState(1)
  const itemsToSkip = (pageNumber - 1) * itemsPerPage
  const noOfPages = Math.ceil(total / itemsPerPage)

  const handleClickVisible = () => {
    setOpenV(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedArt(undefined)
  }
  const handleCloseVisible = () => {
    setOpenV(false)
    setSelectedArt(undefined)
  }

  const setVisibleArt = async (art, id, event) => {
    setLoading(true)
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/art/disable/" + art.artId
    art.visible = !art.visible
    const response = await axios.put(
      base_url,
      art,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    )
    setSnackBarMessage("Arte modificado exitosamente")
    setSnackBar(true)
    setLoading(false)
    handleClose()
    setDisabledReason("")
    setSelectedArt(undefined)
  }

  useEffect(() => {
    if (window.location.pathname.includes("/admin/preferences/read")) {
      setOnAdmin(true)
    }
  }, [])

  const getLatest = () => {
    try {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/get-latest"
      axios.get(base_url).then((response) => {
        setTiles(response.data.arts)
        props.setSearchResult(response.data.arts)
        setBackdrop(false)
      })
    } catch {
      console.error("Error consultando artes")
      setBackdrop(false)
    }
  }

  const readGallery = async (filters) => {
    try {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/read-for-gallery"
      const response = await axios.post(base_url, filters)
      setTiles(response.data.arts)
      setTotal(response.data.length)
      props.setSearchResult(response.data.arts)
      setBackdrop(false)
    } catch {
      console.error("Error consultando artes")
      setBackdrop(false)
    }
  }

  useEffect(() => {
    let filters = {}
    if (searchValue) filters.text = searchValue
    if (categoryValue) filters.category = categoryValue
    if (props.prixerUsername || globalParams.get("prixer")) {
      filters.username = props.prixerUsername || globalParams.get("prixer")
    }
    filters.initialPoint = (pageNumber - 1) * itemsPerPage
    filters.itemsPerPage = itemsPerPage

    if (props.inHome) {
      getLatest()
    } else {
      readGallery(filters)
    }
  }, [searchValue, categoryValue, props.artSaved])

  const handleFullImage = async (e, tile) => {
    if (onAdmin) {
      props.addMostSellerToBestSeller(tile.title)
    } else {
      props.setFullArt(tile)
      props.setSearchResult(tiles)
      let art = e.target.id
      history.push({
        pathname: "/art=" + art,
      })
      setOpenFullArt(true)
    }
  }

  const searchPhotos = (queryValue, categories) => {
    setSearchValue(queryValue)
    setCategoryValue(categories)
    if (window.location.search.includes("producto=")) {
      if (queryValue !== null && categories !== null) {
        history.push({
          pathname:
            window.location.pathname +
            "/s?category=" +
            categories +
            "&name=" +
            queryValue,
        })
      } else if ((categories?.length > 0 && queryValue === null) || "") {
        history.push({
          pathname: window.location.pathname + "/s?category=" + categories,
        })
      } else if (queryValue) {
        history.push({
          pathname: window.location.pathname + "/s?name=" + queryValue,
        })
      }
    } else if (onAdmin) {
      if (queryValue !== null && categories !== null) {
        history.push({
          pathname:
            "/admin/preferences/read/s?category=" +
            categories +
            "&name=" +
            queryValue,
        })
      } else if ((categories?.length > 0 && queryValue === null) || "") {
        history.push({
          pathname: "/admin/preferences/read/s?category=" + categories,
        })
      } else if (queryValue) {
        history.push({
          pathname: "/admin/preferences/read/s?name=" + queryValue,
        })
      } else {
        history.push({
          pathname: "/admin/preferences/read/",
        })
      }
    } else if (props.prixerUsername || globalParams.get("prixer")) {
      //
      if (queryValue !== null && categories !== null) {
        history.push({
          pathname:
            "/galeria/s?prixer=" +
            (props.prixerUsername || globalParams.get("prixer")) +
            "&category=" +
            categories +
            "&name=" +
            queryValue,
        })
      } else if ((categories.length > 0 && queryValue === null) || "") {
        history.push({
          pathname:
            "/galeria/s?prixer=" +
            (props.prixerUsername || globalParams.get("prixer")) +
            "&category=" +
            categories,
        })
      } else if (queryValue) {
        history.push({
          pathname:
            "/galeria/s?prixer=" +
            (props.prixerUsername || globalParams.get("prixer")) +
            "&name=" +
            queryValue,
        })
      } else {
        history.push({
          pathname:
            "/galeria/s?prixer=" + props.prixerUsername + "&name=" + queryValue,
        })
      }
    } else {
      if (queryValue !== null && categories !== null) {
        history.push({
          pathname: "/galeria/s?category=" + categories + "&name=" + queryValue,
        })
      } else if ((categories?.length > 0 && queryValue === null) || "") {
        history.push({
          pathname: "/galeria/s?category=" + categories,
        })
      } else if (queryValue) {
        history.push({
          pathname: "/galeria/s?name=" + queryValue,
        })
      } else {
        history.push({
          pathname: "/galeria/",
        })
      }
    }
  }

  const addingToCart = (e, tile) => {
    e.preventDefault()
    if (window.location.search.includes("producto=")) {
      props.setSelectedArt(tile)
    } else {
      props.setSelectedArt(tile)
      props.setIsOpenAssociateProduct(true)
    }
  }

  const msnry = new Masonry(".grid", {
    columnWidth: 200,
    itemSelector: ".grid-item",
  })

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div className={classes.root}>
        <Backdrop
          className={classes.backdrop}
          open={backdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <SearchBar
            searchPhotos={searchPhotos}
            searchValue={3}
            setSearchValue={setSearchValue}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingBottom: "20px",
          overflow: "auto",
          position: "relative",
          height: "90%",
        }}
      >
        <ResponsiveMasonry
          columnsCountBreakPoints={{
            350: 1,
            750: 2,
            900: 3,
            1080: window.location.search.includes("producto=") ? 3 : 4,
          }}
        >
          <Masonry style={{ columnGap: "7px" }}>
            {tiles ? (
              tiles.map((tile, i) =>
                tile.visible ? (
                  <div key={i}>
                    {JSON.parse(localStorage.getItem("adminToken")) &&
                      tile.visible && (
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          style={{
                            position: "absolute",
                            marginTop: "10px",
                            marginLeft: "10px",
                            color: "#fff",
                          }}
                          disabled
                        >
                          <Typography
                            style={{
                              opacity: 0.5,
                              fontSize: "0.8rem",
                              fontWeight: 100,
                            }}
                          >
                            Puntos: {tile.points}
                          </Typography>
                        </Button>
                      )}

                    <CardActionArea>
                      {!onAdmin && (
                        <Tooltip
                          title={
                            window.location.search.includes("producto=")
                              ? "Asociar al producto"
                              : "Agregar al carrito"
                          }
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              addingToCart(e, tile)
                            }}
                            style={{ position: "absolute", padding: "8px" }}
                          >
                            <AddShoppingCartIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {tile.exclusive === "exclusive" && (
                        <Tooltip title="Arte exclusivo">
                          <IconButton
                            size="small"
                            color="primary"
                            style={{ position: "absolute", right: 0 }}
                          >
                            <Star
                              style={{
                                marginRight: "-2.2rem",
                                marginTop: "0.05rem",
                              }}
                              color="primary"
                              fontSize="large"
                            />
                            <StarOutline
                              style={{
                                color: "white",
                              }}
                              fontSize="large"
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Img
                        draggable={false}
                        onClick={(e) => {
                          handleFullImage(e, tile)
                        }}
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          width: "100%",
                          marginBottom: "7px",
                          borderRadius: "4px",
                        }}
                        src={tile.largeThumbUrl || tile.squareThumbUrl}
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        alt={tile.title}
                        id={tile.artId}
                        key={tile.artId}
                      />

                      {props.permissions?.artBan && (
                        <IOSSwitch
                          color="primary"
                          size="normal"
                          checked={tile.visible}
                          onChange={(e) => {
                            if (e.target.checked === false) {
                              handleClickVisible()
                              setSelectedArt(tile.artId)
                              setVisible(e.target.checked)
                            } else {
                              setVisibleArt(tile, tile.artId, e)
                              setVisible(e.target.checked)
                            }
                          }}
                        />
                      )}
                    </CardActionArea>
                    <Dialog
                      open={selectedArt === tile.artId}
                      onClose={handleCloseVisible}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"¿Estás seguro de ocultar este arte?"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText
                          id="alert-dialog-description"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          Este arte ya no será visible en tu perfil y la página
                          de inicio.
                        </DialogContentText>
                      </DialogContent>
                      <div
                        item
                        xs={12}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <TextField
                          style={{ width: "95%", marginBottom: "5px" }}
                          fullWidth
                          multiline
                          required
                          id="disabledReason"
                          label="¿Por qué quieres ocultar este arte?"
                          variant="outlined"
                          onChange={(e) => {
                            setDisabledReason(e.target.value)
                          }}
                        />
                      </div>
                      <DialogActions>
                        <Button
                          onClick={handleCloseVisible}
                          color="primary"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={(e) => {
                            setVisibleArt(tile, selectedArt, e)
                            setSelectedArt(undefined)
                            handleCloseVisible()
                          }}
                          background="primary"
                          style={{
                            color: "white",
                            backgroundColor: "#d33f49",
                          }}
                        >
                          Aceptar
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
                ) : (
                  JSON.parse(localStorage.getItem("adminToken")) && (
                    <div key={i}>
                      <Img
                        onClick={(e) => {
                          handleFullImage(e, tile)
                        }}
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          width: "100%",
                          marginBottom: "7px",
                          borderRadius: "4px",
                          // objectFit: "cover",
                        }}
                        src={tile.squareThumbUrl}
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                        // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                        // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 200px, (min-width: 375px) 80px"
                        alt={tile.title}
                        id={tile.artId}
                        key={tile.artId}
                      />
                      {props.permissions?.banArt && (
                        <IOSSwitch
                          color="primary"
                          size="normal"
                          onChange={(e) => {
                            if (e.target.checked === false) {
                              setVisible(e.target.checked)
                              setSelectedArt(tile.artId)
                            } else {
                              setVisible(e.target.checked)
                              setVisibleArt(tile, tile.artId, e)
                            }
                          }}
                        ></IOSSwitch>
                      )}
                    </div>
                  )
                )
              )
            ) : (
              <h1>Pronto encontrarás todo el arte que buscas.</h1>
            )}
          </Masonry>
        </ResponsiveMasonry>
      </div>
      {openFullArt && (
        <FullscreenPhoto
          art={props.fullArt}
          buyState={props.buyState}
          // prixer={fullPrixer}
          searchResult={props.searchResult}
        />
      )}
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignSelf: "center",
          paddingTop: 5,
          marginBottom: 4,
          width: "100%",
        }}
      >
        {pageNumber - 3 > 0 && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(1)
            }}
          >
            {1}
          </Button>
        )}
        {pageNumber - 3 > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 5,
            }}
          >
            ...
          </div>
        )}
        {pageNumber - 2 > 0 && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(pageNumber - 2)
            }}
          >
            {pageNumber - 2}
          </Button>
        )}
        {pageNumber - 1 > 0 && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(pageNumber - 1)
            }}
          >
            {pageNumber - 1}
          </Button>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 80,
            marginRight: 5,
            backgroundColor: "rgb(238, 238, 238)",
            borderRadius: 4,
          }}
        >
          Página {pageNumber}
        </div>
        {pageNumber + 1 <= noOfPages && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(pageNumber + 1)
            }}
          >
            {pageNumber + 1}
          </Button>
        )}

        {pageNumber + 2 <= noOfPages && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(pageNumber + 2)
            }}
          >
            {pageNumber + 2}
          </Button>
        )}
        {pageNumber + 3 <= noOfPages && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 5,
            }}
          >
            ...
          </div>
        )}
        {pageNumber + 3 <= noOfPages && (
          <Button
            style={{ minWidth: 30, marginRight: 5 }}
            onClick={() => {
              setPageNumber(noOfPages)
            }}
          >
            {noOfPages}
          </Button>
        )}
      </Box>
    </div>
  )
}
