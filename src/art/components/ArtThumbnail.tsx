import {
  CardActionArea,
  Typography,
  IconButton,
  Tooltip,
} from "@material-ui/core"
import Img from "react-cool-img"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import Star from "@material-ui/icons/StarRate"
import StarOutline from "@material-ui/icons/StarOutline"
import { addingToCart } from "../services"
import styles from "./artThumbnail.module.scss"

export default function ArtThumbnail({
  tile,
  i,
  setSelectedArt,
  setIsOpenAssociateProduct,
  handleFullImageClick
}) {
  return (
    <div key={i}>
      {JSON.parse(localStorage.getItem("adminToken")) && tile.visible && (
        <Typography className={styles.points}>Puntos: {tile.points}</Typography>
      )}

      <CardActionArea>
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
              addingToCart(e, tile, setSelectedArt, setIsOpenAssociateProduct)
            }}
            className={styles.iconButton}
          >
            <AddShoppingCartIcon />
          </IconButton>
        </Tooltip>
        {tile.exclusive === "exclusive" && (
          <Tooltip title="Arte exclusivo">
            <IconButton
              size="small"
              color="primary"
              className={styles.iconButton2}
            >
              <Star
                className={styles.iconButton2__star}
                color="primary"
                fontSize="large"
              />
              <StarOutline
                className={styles.iconButton2__star__outline}
                fontSize="large"
              />
            </IconButton>
          </Tooltip>
        )}
        <Img
          draggable={false}
          onClick={(e) => {
            handleFullImageClick(e, tile)
          }}
          placeholder="/imgLoading.svg"
          className={styles.img}
          src={tile.largeThumbUrl || tile.squareThumbUrl}
          debounce={1000}
          cache
          error="/imgError.svg"
          alt={tile.title}
          id={tile.artId}
          key={tile.artId}
        />
      </CardActionArea>
    </div>
  )
}
