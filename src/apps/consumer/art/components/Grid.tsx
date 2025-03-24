// Hay un montón de imports que no se utilizan, eliminar
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import SearchBar from "@components/searchBar/searchBar.js"

import { readGallery, setVisibleArt } from "../api"
import { handleFullImage } from "../services"
import ArtThumbnail from "./ArtThumbnail"
import PaginationBar from "../../../../components/Pagination/PaginationBar"
import { useLoading, useSnackBar } from "context/GlobalContext"
import Detail from "./Detail"
import { Theme, Typography } from "@mui/material"
import { makeStyles } from "tss-react/mui"

// Todos los estilo debería estar en el SCSS
const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      display: "flex",
      flexWrap: "wrap",
      backgroundColor: theme.palette.background.paper,
      marginBottom: "15px",
      width: "100%",
      justifyContent: "center",
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
  }
})

export default function Grid(props) {
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()

  const navigate = useNavigate()
  const { classes } = useStyles()
  const [tiles, setTiles] = useState([])
  const [total, setTotal] = useState(1)

  let globalParams = new URLSearchParams(window.location.search)
  const username = window.location.pathname.split("=")?.[1]
  // ? globalParams.get("/org")
  // : globalParams.get("/prixer")
  const [searchValue, setSearchValue] = useState(
    globalParams.get("name") || null
  )
  const [categoryValue, setCategoryValue] = useState(
    globalParams.get("category") || null
  )
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [openV, setOpenV] = useState(false)
  const [openFullArt, setOpenFullArt] = useState(false)
  const [disabledReason, setDisabledReason] = useState("")
  const itemsPerPage = 30
  const [pageNumber, setPageNumber] = useState(1)
  const activePrixer = globalParams.get("prixer")
  const [searchResult, setSearchResult] = useState([])

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

  // const makeVisible = async (art) => {
  //   setLoading(true)
  //   const response = await setVisibleArt(art.artId, art.visible)
  //   showSnackBar("Arte modificado exitosamente")
  //   handleClose()
  //   setDisabledReason("")
  //   setSelectedArt(undefined)
  // }

  interface Filters {
    text: string
    category: string
    username: string
    initialPoint: number
    itemsPerPage: number
  }

  const fetchData = async () => {
    try {
      let filters: Partial<Filters> = {}
      if (searchValue) filters.text = searchValue
      if (categoryValue) filters.category = categoryValue
      if (activePrixer !== null) {
        filters.username = activePrixer
      } else if (username !== null) {
        filters.username = username
      }
      filters.initialPoint = (pageNumber - 1) * itemsPerPage
      filters.itemsPerPage = itemsPerPage

      const response = await readGallery(filters)
      setTiles(response.arts)
      setTotal(response.length)
      setSearchResult(response?.arts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [searchValue, categoryValue, pageNumber, username])

  const handleSearch = (queryValue, categories) => {
    setSearchValue(queryValue)
    setCategoryValue(categories)
    //TODO War: Se debe utilizar para ?s= si no hay más params, si hay otros se debe usar &s=, igual con cat, etc.
    // const finalPath= searchPhotos(queryValue, categories, history, props.prixerUsername, globalParams);
    // navigate({ pathname: finalPath })
  }

  const handleFullImageClick = (e, tile) => {
    handleFullImage(e, tile, props, history, setOpenFullArt)
  }

  // const handleAddingToCart = (e, tile) => {
  //   addingToCart(e, tile, props)
  // }
  return (
    // Todos los estilo debería estar en el SCSS
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className={classes.root}>
        <SearchBar
          searchPhotos={handleSearch}
          searchValue={3}
          setSearchValue={setSearchValue}
        />
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
        {tiles.length > 0 ? (
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
                tiles.map((tile, i) => (
                  <div key={i + 1000}>
                    <ArtThumbnail
                      tile={tile}
                      i={i}
                      handleCloseVisible={handleCloseVisible}
                      setSelectedArt={props.setSelectedArt}
                      handleFullImageClick={handleFullImageClick}
                      isSelectedInFlow={
                        props.selectedArtId === tile.artId || undefined
                      }
                    />
                  </div>
                ))
              ) : (
                <h1>Pronto encontrarás todo el arte que buscas.</h1>
              )}
            </Masonry>
          </ResponsiveMasonry>
        ) : (
          <div
            style={{
              display: "flex",
              margin: "40px auto auto",
            }}
          >
            <Typography variant="h4" style={{ color: "#404e5c" }}>
              Este Prixer aún no ha cargado artes :(
            </Typography>
          </div>
        )}{" "}
      </div>

      {openFullArt && (
        <Detail art={props.fullArt} searchResult={searchResult} />
      )}

      <PaginationBar
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={total}
        // noOfPages={noOfPages}
      />
    </div>
  )
}
