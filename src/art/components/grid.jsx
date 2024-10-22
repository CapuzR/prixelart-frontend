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
import SearchBar from "components/searchBar/searchBar.jsx"
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import CardActionArea from "@material-ui/core/CardActionArea"
import Box from "@material-ui/core/Box"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import FullscreenPhoto from "../../prixerProfile/fullscreenPhoto/fullscreenPhoto"
import Star from "@material-ui/icons/StarRate"
import StarOutline from "@material-ui/icons/StarOutline"

import { readGallery, setVisibleArt } from "../api"
import { searchPhotos } from "../services"
import ArtThumbnail from "./artThumbnail"
import PaginationBar from "../../components/Pagination/PaginationBar"

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
  // const [visible, setVisible] = useState(true)
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

  const makeVisible = async (art) => {
    setLoading(true)
    const response = await setVisibleArt(art.artId, art.visible)
    setSnackBarMessage("Arte modificado exitosamente")
    setSnackBar(true)
    setLoading(false)
    handleClose()
    setDisabledReason("")
    setSelectedArt(undefined)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        let filters = {}
        if (searchValue) filters.text = searchValue
        if (categoryValue) filters.category = categoryValue
        if (props.prixerUsername || globalParams.get("prixer")) {
          filters.username = props.prixerUsername || globalParams.get("prixer")
        }
        filters.initialPoint = (pageNumber - 1) * itemsPerPage
        filters.itemsPerPage = itemsPerPage

        const response = await readGallery(filters)
        setTiles(response.arts)
        setTotal(response.length)
        props.setSearchResult(response?.data?.arts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setBackdrop(false)
      }
    }
    fetchData()
  }, [searchValue, categoryValue, pageNumber, props, globalParams])

  const handleSearch = (queryValue, categories) => {
    setSearchValue(queryValue)
    setCategoryValue(categories)
    searchPhotos(queryValue, categories, history, props, globalParams)
  }

  const handleFullImageClick = (e, tile) => {
    handleFullImage(e, tile, props, history, setOpenFullArt)
  }

  const handleAddingToCart = (e, tile) => {
    addingToCart(e, tile, props)
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
            searchPhotos={handleSearch}
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
          position: "relative",
          height: "95%",
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
              tiles.map(
                (tile, i) => (
                  // tile.visible ? (
                  <ArtThumbnail
                    tile={tile}
                    i={i}
                    handleCloseVisible={handleCloseVisible}
                    setSelectedArt={props.setSelectedArt}
                    setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
                  />
                )
                // ) : (
                //   JSON.parse(localStorage.getItem("adminToken")) && (
                //     <div key={i}>
                //       <Img
                //         onClick={(e) => {
                //           handleFullImageClick(e, tile)
                //         }}
                //         placeholder="/imgLoading.svg"
                //         style={{
                //           backgroundColor: "#eeeeee",
                //           width: "100%",
                //           marginBottom: "7px",
                //           borderRadius: "4px",
                //           // objectFit: "cover",
                //         }}
                //         src={tile.squareThumbUrl}
                //         debounce={1000}
                //         cache
                //         error="/imgError.svg"
                //         // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                //         // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                //         // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 200px, (min-width: 375px) 80px"
                //         alt={tile.title}
                //         id={tile.artId}
                //         key={tile.artId}
                //       />
                //       {props.permissions?.banArt && (
                //         <IOSSwitch
                //           color="primary"
                //           size="normal"
                //           onChange={(e) => {
                //             if (e.target.checked === false) {
                //               setVisible(e.target.checked)
                //               setSelectedArt(tile.artId)
                //             } else {
                //               setVisible(e.target.checked)
                //               setVisibleArt(tile, tile.artId, e)
                //             }
                //           }}
                //         ></IOSSwitch>
                //       )}
                //     </div>
                //   )
                // )
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
      <PaginationBar
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        noOfPages={noOfPages}
      />
    </div>
  )
}
