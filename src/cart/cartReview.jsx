import React, { useState, useEffect, useRef } from "react"
import axios from "axios"

import Button from "@material-ui/core/Button"
import { makeStyles, useTheme } from "@material-ui/core/styles"
// import utils from "../utils/utils";

// import Grid from "@material-ui/core/Grid"

import Tooltip from "@material-ui/core/Tooltip"
import Paper from "@material-ui/core/Paper"
import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"
import FilterNoneIcon from "@material-ui/icons/FilterNone"

import Info from "@material-ui/icons/Info"
import Img from "react-cool-img"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useHistory } from "react-router-dom"
import IconButton from "@material-ui/core/IconButton"
import { Typography } from "@material-ui/core"
import WarpImage from "../admin/productCrud/warpImage"
import { toggleDecimalSeparator } from "utils/utils"

import Grid from "components/Grid";
import { useCart } from "context/CartContext"
import ItemCard from "components/ItemCard"
import { useConversionRate, useCurrency } from "context/GlobalContext"

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  float: {
    position: "relative",
    marginLeft: "95%",
  },
  iconButton: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}))

export default function CartReview(props) {
  const classes = useStyles()
  const history = useHistory()
  const { conversionRate } = useConversionRate();
  const { currency } = useCurrency();
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"))
  const [discountList, setDiscountList] = useState([])
  const warpImageRef = useRef(null)
  const mockupRef = useRef(null)
  const [base64Image1, setBase64Image1] = useState(null)
  const [base64Image2, setBase64Image2] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const { cart } = useCart();
  console.log( "CART: ", cart );
  
  const [buyState, setBuyState] = useState(cart);
  // const [buyState, setBuyState] = useState(
  //   localStorage.getItem("buyState")
  //     ? JSON.parse(localStorage.getItem("buyState"))
  //     : []
  // )
  // console.log("BUYSTATE: ", buyState);
  
  
  // const { cart, addItemToCart, associateProduct, changeQuantity, deleteItemInCart, deleteProductInItem } = useCart();

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
    getDiscounts()
  }, [])

  // const allowMockup = (buy, index) => {
  //   if (buy.product?.mockUp !== undefined) {
  //     fetchImages(buy.product)

  //     return (
  //       <div style={{ marginRight: 16 }}>
  //         <div
  //           ref={mockupRef}
  //           style={{
  //             width: 210,
  //             height: 210,
  //             position: "relative",
  //           }}
  //           onClick={() => {
  //             props.setSelectedArtToAssociate({
  //               index,
  //               item: buy.product,
  //               previous: true,
  //             })
  //             history.push({ pathname: "/galeria" })
  //           }}
  //         >
  //           <WarpImage
  //             ref={warpImageRef}
  //             warpPercentage={buy.product.mockUp.warpPercentage}
  //             warpOrientation={buy.product.mockUp.warpOrientation}
  //             invertedWrap={buy.product.mockUp.invertedWrap}
  //             randomArt={buy.art}
  //             topLeft={buy.product.mockUp.topLeft}
  //             width={buy.product.mockUp.width}
  //             height={buy.product.mockUp.height}
  //             perspective={buy.product.mockUp.perspective}
  //             rotate={buy.product.mockUp.rotate}
  //             rotateX={buy.product.mockUp.rotateX}
  //             rotateY={buy.product.mockUp.rotateY}
  //             skewX={buy.product.mockUp.skewX}
  //             skewY={buy.product.mockUp.skewY}
  //             translateX={buy.product.mockUp.translateX}
  //             translateY={buy.product.mockUp.translateY}
  //             setOpen={props.setOpen}
  //             setMessage={props.setMessage}
  //           />
  //           <div
  //             style={{
  //               backgroundImage: `url(${base64Image1})`,
  //               width: 210,
  //               height: 210,
  //               backgroundSize: "cover",
  //               borderRadius: 5,
  //               position: "absolute",
  //               top: "0",
  //               left: "0",
  //               zIndex: "2",
  //             }}
  //           />
  //         </div>
  //         <div
  //           style={{
  //             display: "flex",
  //             alignItems: "center",
  //             justifyContent: "center",
  //           }}
  //         >
  //           <Tooltip title="Nuestro equipo se encargará de que se vea perfecto para ti.">
  //             <IconButton
  //               size="small"
  //               color="gainsboro"
  //             >
  //               <Info />
  //             </IconButton>
  //           </Tooltip>
  //           <Typography
  //             color="secondary"
  //             variant="p"
  //           >
  //             Imagen referencial
  //           </Typography>
  //         </div>
  //         <Button
  //           primary
  //           onClick={handleDownloadImage}
  //         >
  //           JPG
  //         </Button>
  //       </div>
  //     )
  //   } else if (buy.art && buy.product) {
  //     return (
  //       <>
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             height: isIphone ? 160 : 220,
  //           }}
  //         >
  //           <div
  //             style={{
  //               backgroundColor: "#eeeeee",
  //               width: isIphone ? 120 : 180,
  //               height: isIphone ? 120 : 180,
  //               borderRadius: "10px",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //             }}
  //           >
  //             <Img
  //               placeholder="/imgLoading.svg"
  //               style={{
  //                 backgroundColor: "#eeeeee",
  //                 maxWidth: isIphone ? 120 : 180,
  //                 maxHeight: isIphone ? 120 : 180,
  //                 borderRadius: 10,
  //               }}
  //               src={
  //                 buy.art ? buy.art.squareThumbUrl : buy.art.largeThumbUrl || ""
  //               }
  //               debounce={1000}
  //               cache
  //               error="/imgError.svg"
  //               alt={buy.art && buy.art.title}
  //               id={buy.art && buy.art.artId}
  //             />
  //           </div>
  //           <div
  //             style={{
  //               display: "flex",
  //               justifyContent: "space-evenly",
  //             }}
  //           >
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() =>
  //                 props.deleteProductInItem({
  //                   id: index,
  //                   type: "art",
  //                 })
  //               }
  //             >
  //               <DeleteIcon />
  //             </IconButton>
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() => {
  //                 props.setSelectedArtToAssociate({
  //                   index,
  //                   item: buy.product,
  //                   previous: true,
  //                 })
  //                 history.push({ pathname: "/galeria" })
  //               }}
  //             >
  //               <AddIcon fontSize="medium" />
  //             </IconButton>
  //           </div>
  //         </div>
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             height: isIphone ? 160 : 220,
  //           }}
  //         >
  //           <Img
  //             placeholder="/imgLoading.svg"
  //             style={{
  //               backgroundColor: "#eeeeee",
  //               height: isIphone ? 120 : 180,
  //               borderRadius: "10px",
  //               marginRight: "20px",
  //               marginLeft: "20px",
  //             }}
  //             src={
  //               buy.product?.sources?.images?.[0]?.url ||
  //               buy.product?.thumbUrl ||
  //               ""
  //             }
  //             debounce={1000}
  //             // cache
  //             error="/imgError.svg"
  //             alt={buy.product && buy.product.name}
  //             id={index}
  //           />
  //           <div
  //             style={{
  //               display: "flex",
  //               justifyContent: "space-evenly",
  //               marginRight: "20px",
  //               marginLeft: "20px",
  //             }}
  //           >
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() =>
  //                 props.deleteProductInItem({
  //                   id: index,
  //                   type: "product",
  //                 })
  //               }
  //             >
  //               <DeleteIcon />
  //             </IconButton>
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() => {
  //                 props.setSelectedArtToAssociate({
  //                   index,
  //                   item: buy.art,
  //                   previous: true,
  //                 })
  //                 history.push({ pathname: "/productos" })
  //               }}
  //             >
  //               <AddIcon fontSize="medium" />
  //             </IconButton>
  //           </div>
  //         </div>
  //       </>
  //     )
  //   } else if (buy.art) {
  //     return (
  //       <>
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             height: isIphone ? 160 : 220,
  //           }}
  //         >
  //           <div
  //             style={{
  //               backgroundColor: "#eeeeee",
  //               width: isIphone ? 120 : 180,
  //               height: isIphone ? 120 : 180,
  //               borderRadius: "10px",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //             }}
  //           >
  //             <Img
  //               placeholder="/imgLoading.svg"
  //               style={{
  //                 backgroundColor: "#eeeeee",
  //                 maxWidth: isIphone ? 120 : 180,
  //                 maxHeight: isIphone ? 120 : 180,
  //                 borderRadius: 10,
  //               }}
  //               src={
  //                 buy.art ? buy.art.squareThumbUrl : buy.art.largeThumbUrl || ""
  //               }
  //               debounce={1000}
  //               cache
  //               error="/imgError.svg"
  //               alt={buy.art && buy.art.title}
  //               id={buy.art && buy.art.artId}
  //             />
  //           </div>
  //           <div
  //             style={{
  //               display: "flex",
  //               justifyContent: "space-evenly",
  //             }}
  //           >
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() =>
  //                 props.deleteProductInItem({
  //                   id: index,
  //                   type: "art",
  //                 })
  //               }
  //             >
  //               <DeleteIcon />
  //             </IconButton>
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() => {
  //                 props.setSelectedArtToAssociate({
  //                   index,
  //                   item: buy.product,
  //                   previous: true,
  //                 })
  //                 history.push({ pathname: "/galeria" })
  //               }}
  //             >
  //               <AddIcon fontSize="medium" />
  //             </IconButton>
  //           </div>
  //         </div>
  //         <div
  //           style={{
  //             height: "180px",
  //             width: "180px",
  //             display: "grid",
  //             marginLeft: "20px",
  //             marginRight: "20px",
  //           }}
  //         >
  //           <IconButton
  //             className={classes.addItemContainer}
  //             onClick={() => {
  //               props.setSelectedArtToAssociate({
  //                 index,
  //                 item: buy.art,
  //                 previous: true,
  //               })
  //               history.push({ pathname: "/productos" })
  //             }}
  //           >
  //             <AddIcon
  //               style={{ fontSize: 80 }}
  //               color="primary"
  //             />
  //           </IconButton>
  //         </div>
  //       </>
  //     )
  //   } else if (buy.product) {
  //     return (
  //       <>
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             height: isIphone ? 160 : 220,
  //           }}
  //         >
  //           <Img
  //             placeholder="/imgLoading.svg"
  //             style={{
  //               backgroundColor: "#eeeeee",
  //               height: isIphone ? 120 : 180,
  //               borderRadius: "10px",
  //               marginRight: "20px",
  //               marginLeft: "20px",
  //             }}
  //             src={ buy.product?.sources?.images?.[0]?.url || buy.product?.thumbUrl || "" }
  //             debounce={1000}
  //             // cache
  //             error="/imgError.svg"
  //             alt={buy.product && buy.product.name}
  //             id={index}
  //           />
  //           <div
  //             style={{
  //               display: "flex",
  //               justifyContent: "space-evenly",
  //               marginRight: "20px",
  //               marginLeft: "20px",
  //             }}
  //           >
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() =>
  //                 props.deleteProductInItem({
  //                   id: index,
  //                   type: "product",
  //                 })
  //               }
  //             >
  //               <DeleteIcon />
  //             </IconButton>
  //             <IconButton
  //               className={classes.iconButton}
  //               style={{ height: 40, width: 40 }}
  //               onClick={() => {
  //                 props.setSelectedArtToAssociate({
  //                   index,
  //                   item: buy.art,
  //                   previous: true,
  //                 })
  //                 history.push({ pathname: "/productos" })
  //               }}
  //             >
  //               <AddIcon fontSize="medium" />
  //             </IconButton>
  //           </div>
  //         </div>

  //         <div
  //           style={{
  //             height: "180px",
  //             width: "180px",
  //             display: "grid",
  //           }}
  //         >
  //           <IconButton
  //             className={classes.addItemContainer}
  //             onClick={() => {
  //               props.setSelectedArtToAssociate({
  //                 index,
  //                 item: buy.art,
  //                 previous: true,
  //               })
  //               history.push({ pathname: "/galeria" })
  //             }}
  //           >
  //             <AddIcon
  //               style={{ fontSize: 80 }}
  //               color="primary"
  //             />
  //           </IconButton>
  //         </div>
  //       </>
  //     )
  //   }
  // }

  const deleteItemInBuyState = (i) => {
    const newState = [...buyState]
    const filterState = newState.filter((buy, index) => index !== i)
    setBuyState(filterState)
    localStorage.setItem("buyState", JSON.stringify(filterState))
    props.setOpen(true)
    props.setMessage("Item eliminado correctamente")
  }

  const copyItem = (i) => {
    let newState = JSON.parse(localStorage.getItem("buyState"))
    newState.push(newState[i])
    setBuyState(newState)
    localStorage.setItem("buyState", JSON.stringify(newState))
    props.setMessage("Item duplicado correctamente.")
    props.setOpen(true)
  }
  return (
    <>
      <Grid>
        <h1
          style={{
            marginBottom: isMobile ? 40 : 20,
            marginTop: 100,
            color: "#404e5c",
          }}
        >
          {isMobile ? "Carrito" : "Carrito de compras"}
        </h1>
      </Grid>
      {cart?.map((item, index) => {
        return (
          <Grid isParent={true}>
            <ItemCard 
              item={item}
              currency={currency}
              conversionRate={conversionRate}
              index={index}
              deleteItemInBuyState={deleteItemInBuyState}
              isIphone={isIphone}
            />
          </Grid>
        )
      })}
    </>
  )
}
