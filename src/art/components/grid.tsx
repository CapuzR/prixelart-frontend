// Hay un montón de imports que no se utilizan, eliminar
import { useState, useEffect } from "react"
import styles from "./grid.module.scss"
import { useHistory } from "react-router-dom"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { readGallery } from "../api"
import { searchPhotos, handleFullImage } from "../services"
import ArtThumbnail from "./ArtThumbnail"
import PaginationBar from "../../components/Pagination/PaginationBar"
import SearchBar from "components/searchBar/searchBar"
import Detail from "./Detail"
import { Filters, Art } from "../interface"
import { useLoading, useSnackBar } from "context/GlobalContext"

export default function Grid(props) {
  const { setLoading } = useLoading()
  const { showSnackBar } = useSnackBar()

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
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [openFullArt, setOpenFullArt] = useState(false)
  const itemsPerPage = 30
  const [pageNumber, setPageNumber] = useState(1)
  const noOfPages = Math.ceil(total / itemsPerPage)

  const handleCloseVisible = () => {
    setSelectedArt(undefined)
  }

  const fetchData = async () => {
    try {
      let filters: Filters = {
        initialPoint: (pageNumber - 1) * itemsPerPage,
        itemsPerPage: itemsPerPage,
      }
      if (searchValue) filters.text = searchValue
      if (categoryValue) filters.category = categoryValue
      if (props.prixerUsername || globalParams.get("prixer")) {
        filters.username = props.prixerUsername || globalParams.get("prixer")
      }

      const response = await readGallery(filters)
      setTiles(response.arts)
      setTotal(response.length)
      props.setSearchResult(response?.arts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData()
    setLoading(false)
  }, [searchValue, categoryValue, pageNumber, props.prixerUsername])

  const handleSearch = (queryValue, categories) => {
    setSearchValue(queryValue)
    setCategoryValue(categories)
    searchPhotos(queryValue, categories, history, props, globalParams)
  }

  const handleFullImageClick = (e: React.MouseEvent<HTMLImageElement>, tile: Art) => {
    handleFullImage(e, tile, props, history, setOpenFullArt)
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.root}>
        <div className={styles.searchContainer}>
          <SearchBar
            searchPhotos={handleSearch}
            searchValue={3}
            setSearchValue={setSearchValue}
          />
        </div>
      </div>
      <div className={styles.content}>
        <ResponsiveMasonry
          columnsCountBreakPoints={{
            350: 1,
            750: 2,
            900: 3,
            1080: window.location.search.includes("producto=") ? 3 : 4,
          }}
        >
          <Masonry className={styles.masonry}>
            {tiles ? (
              tiles.map((tile, i) => (
                <div key={i + 1000}>
                  <ArtThumbnail
                    tile={tile}
                    i={i}
                    handleCloseVisible={handleCloseVisible}
                    setSelectedArt={props.setSelectedArt}
                    setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
                    handleFullImageClick={handleFullImageClick}
                  />
                </div>
              ))
            ) : (
              <h1>Pronto encontrarás todo el arte que buscas.</h1>
            )}
          </Masonry>
        </ResponsiveMasonry>
      </div>

      {openFullArt && (
        <Detail
          art={props.fullArt}
          buyState={props.buyState}
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
