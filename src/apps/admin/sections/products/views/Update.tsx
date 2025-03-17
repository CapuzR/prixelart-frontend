import React from "react"
import { useState, useEffect } from "react"
import { makeStyles } from "@mui/styles"
import Title from "../../../components/Title"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"
import Snackbar from "@mui/material/Snackbar"
import CircularProgress from "@mui/material/CircularProgress"
import FormControl from "@mui/material/FormControl"
import clsx from "clsx"
import Checkbox from "@mui/material/Checkbox"
import { useHistory } from "react-router-dom"
import { useTheme } from "@mui/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import EditIcon from "@mui/icons-material/Edit"
import MDEditor from "@uiw/react-md-editor"
import Variants from "./VariantsIndex"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PropTypes from "prop-types"
import {
  isAValidName,
  isAValidCi,
  isAValidPhoneNum,
  isAValidEmail,
  isAValidPrice,
} from "utils/validations"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Paper from "@mui/material/Paper"
import Mockup from "./UpdateMockUp"
import InputAdornment from "@mui/material/InputAdornment"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import ProductForm from "../components/ProductForm"
import { useProductForm } from "@context/ProductContext"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { updateProduct } from "../api"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    height: 550,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  loaderImage: {
    width: "120%",
    border: "2px",
    height: "30vh",
    borderStyle: "groove",
    borderColor: "#d33f49",
    backgroundColor: "#ededed",
    display: "flex",
    flexDirection: "row",
  },
  imageLoad: {
    width: "100%",
    height: "95%",
    padding: "15px",
    marginTop: "5px",
  },
  formHead: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  buttonImgLoader: {
    cursor: "pointer",
    padding: "5px",
  },
}))
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <>{children}</>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function UpdateProduct() {
  const classes = useStyles()
  const theme = useTheme()
  const { state, dispatch } = useProductForm()

  const history = useHistory()
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  // const [productId, setProductId] = useState(
  //  state._id || window.location.pathname.slice(22)
  // )
  const [images, newImages] = useState({ images: [] })
  // const [thumbUrl, setThumbUrl] = useState(props?.product?.thumbUrl)
  const [imagesList, setImagesList] = useState(state?.sources.images)
  // const [active, setActive] = useState(props?.product?.active)
  // const [productName, setProductName] = useState(props?.product?.name)
  // const [variants, setVariants] = useState(props?.product?.variants)
  // const [description, setDescription] = useState(props?.product?.description)
  // const [category, setCategory] = useState(props?.product?.category)
  // const [considerations, setConsiderations] = useState(
  //  state.considerations || undefined
  // )
  // const [productionTime, setProductionTime] = useState(
  //  state.productionTime || undefined
  // )
  // const [cost, setCost] = useState(props?.product?.cost || undefined)
  // const [fromPublicPrice, setFromPublicPrice] = useState(
  //  state.publicPrice?.from
  // )
  // const [toPublicPrice, setToPublicPrice] = useState(
  //  state.publicPrice?.to || undefined
  // )
  // const [fromPrixerPrice, setFromPrixerPrice] = useState(
  //  state.prixerPrice?.from
  // )
  // const [toPrixerPrice, setToPrixerPrice] = useState(
  //  state.prixerPrice?.to || undefined
  // )
  // const [loading, setLoading] = useState(false)
  // const [buttonState, setButtonState] = useState(false)
  // const [activeVCrud, setActiveVCrud] = useState("read")
  // const [hasSpecialVar, setHasSpecialVar] = useState(
  //  state.hasSpecialVar || false
  // )
  // const [autoCertified, setAutoCertified] = useState(
  //  state.autoCertified || false
  // )

  const [videoUrl, setVideoUrl] = useState(state?.sources.video)
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: "Subir imagenes",
  })

  const [value, setValue] = useState(0)
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  //Error states.
  const [errorMessage, setErrorMessage] = useState()
  const [snackBarError, setSnackBarError] = useState(false)
  const [open, setOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [loaDOpen, setLoaDOpen] = useState(false)
  const [mustImage, setMustImages] = useState(false)

  // const readProduct = () => {
  //   const base_url2 = import.meta.env.VITE_BACKEND_URL + "/product/read"
  //   axios.post(base_url2, { _id: productId }).then((response) => {
  //     let product = response.data.products[0]
  //     props.setProduct(product)
  //     localStorage.setItem("product", JSON.stringify(product))
  //   })
  //   props.setProductEdit(false)
  // }

  useEffect(() => {
    // readProduct()
    const indexImage =
      imagesList?.length < 1 ? imagesList?.indexOf(thumbUrl) : undefined

    imagesList?.map((url) => {
      url?.type === "images"
        ? imageLoader.loader.push(url && url.url)
        : setVideoUrl(url && url.url)
    })

    if (indexImage === -1) {
      imagesList.push(thumbUrl)
      imageLoader.loader.push(thumbUrl)
    }
    setTimeout(() => {
      if (state?.sources.images) {
        state?.sources.images.map((element) => {
          element.type === "video" && setVideoUrl(element.url)
        })
      }
    }, 1000)
    return () => {
      localStorage.removeItem("product")
    }
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  //Preview de imagen antes de enviar
  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const loadImage = async (e) => {
    e.preventDefault()
    if (imageLoader.loader.length >= 4 || imagesList?.length >= 5) {
      setLoadOpen(true)
      setTimeout(() => {
        setLoadOpen(false)
      }, 3000)
    } else {
      const file = e.target.files[0]
      const resizedString = await convertToBase64(file)
      imageLoader.loader.push(resizedString)
      images.images.push(file)
      setLoadImage({
        loader: imageLoader.loader,
        filename: file.name.replace(/[,]/gi, ""),
      })
    }
  }

  const replaceImage = async (e, index) => {
    e.preventDefault()
    const file = e.target.files[0]
    const resizedString = await convertToBase64(file)
    imageLoader.loader[index] = resizedString
    images.images[index] = file
    setLoadImage({ loader: imageLoader.loader, filename: file.name })
  }

  const modifyString = (a, sti) => {
    const width = sti.replace("560", "326").replace("315", "326")
    setVideoUrl(width)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      images.images.length &&
      imageLoader.loader.length &&
      imagesList?.length >= 5
    ) {
      setLoaDOpen(true)
    } else {
      if (images?.images.length === 0 && imagesList?.length === 0) {
        setMustImages(true)
        setTimeout(() => {
          setMustImages(false)
        }, 3000)
      } else {
        if (
          // !active &&
          !state.name &&
          !state.description &&
          !state.publicPrice.from &&
          !images
        ) {
          showSnackBar("Por favor completa todos los campos requeridos.")
        } else {
          setLoading(true)
          const newFormData = new FormData()
          // const data = {
          //   specialVars: [
          //     {
          //       name: "",
          //       isSpecialVarVisible: "",
          //     },
          //   ],
          // }
          newFormData.append("active", state.active)
          newFormData.append("name", state.name)
          newFormData.append("description", state.description)
          newFormData.append("category", state.category)
          newFormData.append("thumbUrl", state.thumbUrl)

          newFormData.append("variants", JSON.stringify(variants))
          newFormData.append("considerations", state.considerations)
          newFormData.append("productionTime", state.productionTime)
          newFormData.append("cost", state.cost.toString())
          newFormData.append(
            "publicPriceFrom",
            state.publicPrice?.from.toString()
          )
          newFormData.append("publicPriceTo", state.publicPrice?.to.toString())
          newFormData.append(
            "prixerPriceFrom",
            state.prixerPrice?.from.toString()
          )
          newFormData.append("prixerPriceTo", state.prixerPrice?.to.toString())
          newFormData.append("hasSpecialVar", state.hasSpecialVar.toString())
          newFormData.append("autoCertified", state.autoCertified.toString())

          if (imagesList[0] !== undefined && imagesList.length > 0) {
            const images = []

            imagesList?.map((img) => {
              img !== null &&
                typeof img !== "string" &&
                images.push(img.url + " ")
            })
            newFormData.append("images", images)
          } else newFormData.append("images", [])
          if (images.images) {
            images.images.map((file) => {
              newFormData.append("newProductImages", file)
            })
          }
          if (videoUrl) {
            newFormData.append("video", videoUrl)
          }
          const response = await updateProduct(newFormData)
          if (response.success === false) {
            showSnackBar(response.message)
          } else {
            showSnackBar("Actualización de producto exitosa.")
            // history.push("/product/read");
          }
        }
      }
    }
  }

  return (
    <React.Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        style={{ width: "70%" }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Descripción" {...a11yProps(0)} />
        <Tab label="Variantes" {...a11yProps(1)} />
        <Tab label="MockUp" {...a11yProps(2)} />
      </Tabs>

      <TabPanel value={value} index={0}>
        <ProductForm handleSubmit={handleSubmit} openVideo={handleClickOpen} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Variants
          product={state}
          activeVCrud={activeVCrud}
          setActiveVCrud={setActiveVCrud}
        />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Mockup product={state} setProduct={props.setProduct} />
      </TabPanel>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              modifyString(a, a.target.value)
            }}
            value={videoUrl}
            label="Url"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
