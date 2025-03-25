import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Theme, useTheme } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

import Title from "../../../components/Title"

import Grid2 from "@mui/material/Grid2"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Tooltip from "@mui/material/Tooltip"
import ViewListIcon from "@mui/icons-material/ViewList"
import Variants from "./VariantsIndex"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import PropTypes from "prop-types"
import Mockup from "./UpdateMockUp"
import "react-quill/dist/quill.snow.css"
import ProductForm from "../components/ProductForm"
import { useProductForm } from "@context/ProductContext"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { updateProduct } from "../api"
import { makeStyles } from "tss-react/mui"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
  }
})
function TabPanel(props: TabPanelProps) {
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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function UpdateProduct() {
  const theme = useTheme()
  const { state, dispatch } = useProductForm()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))

  const [images, newImages] = useState({ images: [] })
  const [imagesList, setImagesList] = useState(state?.sources || [])
  const [activeVCrud, setActiveVCrud] = useState("read")

  const [videoUrl, setVideoUrl] = useState<string>("")
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: "Subir imagenes",
  })

  const [value, setValue] = useState(0)
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const [open, setOpen] = useState(false)
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
    const prev: any = { loader: [] }

    const indexImage =
      imagesList?.length < 1 ? imagesList?.indexOf(state?.thumbUrl) : undefined

    imagesList?.map((img: any) => {
      img?.type === "images"
        ? prev.loader.push(img && img.url)
        : setVideoUrl(img && img.url)
    })

    if (indexImage === -1) {
      imagesList.push(state.thumbUrl)
      prev.loader.push(state.thumbUrl)
    }
    // setImagesList(prev)
    setTimeout(() => {
      if (state?.sources.images) {
        state?.sources.images.map((element: any) => {
          element.type === "video" && setVideoUrl(element.url)
        })
      }
    }, 1000)
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  //Preview de imagen antes de enviar
  // const convertToBase64 = (blob) => {
  //   return new Promise((resolve) => {
  //     var reader = new FileReader()
  //     reader.onload = function () {
  //       resolve(reader.result)
  //     }
  //     reader.readAsDataURL(blob)
  //   })
  // }

  // const loadImage = async (e) => {
  //   e.preventDefault()
  //   if (imageLoader.loader.length >= 4 || imagesList?.length >= 5) {
  //     setLoadOpen(true)
  //     setTimeout(() => {
  //       setLoadOpen(false)
  //     }, 3000)
  //   } else {
  //     const file = e.target.files[0]
  //     const resizedString = await convertToBase64(file)
  //     imageLoader.loader.push(resizedString)
  //     images.images.push(file)
  //     setLoadImage({
  //       loader: imageLoader.loader,
  //       filename: file.name.replace(/[,]/gi, ""),
  //     })
  //   }
  // }

  // const replaceImage = async (e, index) => {
  //   e.preventDefault()
  //   const file = e.target.files[0]
  //   const resizedString = await convertToBase64(file)
  //   imageLoader.loader[index] = resizedString
  //   images.images[index] = file
  //   setLoadImage({ loader: imageLoader.loader, filename: file.name })
  // }

  const modifyString = (
    a: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    sti: string
  ) => {
    const width = sti.replace("560", "326").replace("315", "326")
    setVideoUrl(width)
  }

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    images: any
  ) => {
    e.preventDefault()
    if (
      images.images.length &&
      imageLoader.loader.length &&
      imagesList?.length >= 5
    ) {
    } else {
      if (images?.images.length === 0 && imagesList?.length === 0) {
      } else {
        if (
          !state.name &&
          !state.description &&
          !state.publicPrice?.from &&
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
          newFormData.append("active", state.active.toString())
          newFormData.append("name", state.name)
          newFormData.append("description", state.description)
          if (state?.category) {
            newFormData.append("category", state?.category?.toString())
          } // newFormData.append("thumbUrl", state?.thumbUrl)

          newFormData.append("variants", JSON.stringify(state.variants))
          newFormData.append("considerations", state.considerations)
          newFormData.append("productionTime", state?.productionTime.toString())
          newFormData.append("cost", state.cost.toString())
          if (state.publicPrice?.from) {
            newFormData.append(
              "publicPriceFrom",
              state.publicPrice?.from.toString()
            )
          }
          if (state.publicPrice?.to) {
            newFormData.append(
              "publicPriceTo",
              state.publicPrice?.to.toString()
            )
          }
          if (state.prixerPrice?.from) {
            newFormData.append(
              "prixerPriceFrom",
              state.prixerPrice?.from.toString()
            )
          }
          if (state.prixerPrice?.to) {
            newFormData.append(
              "prixerPriceTo",
              state.prixerPrice?.to.toString()
            )
          }
          newFormData.append("hasSpecialVar", state.hasSpecialVar.toString())
          newFormData.append("autoCertified", state.autoCertified.toString())

          if (imagesList.length > 0) {
            newFormData.append(
              "images",
              JSON.stringify(imagesList.map((img: any) => img.url))
            )
          }
          // if (imagesList[0] !== undefined && imagesList.length > 0) {
          //   const images = []

          //   imagesList?.map((img) => {
          //     img !== null &&
          //       typeof img !== "string" &&
          //       images.push(img.url + " ")
          //   })
          //   newFormData.append("images", images)
          // } else newFormData.append("images", [])
          if (images.images) {
            images.images.forEach((file: File) => {
              newFormData.append("newProductImages", file)
            })
          }
          // if (images.images) {
          //   images.images.map((file) => {
          //     newFormData.append("newProductImages", file)
          //   })
          // }
          if (videoUrl) {
            newFormData.append("video", videoUrl)
          }
          const id = state._id
          if (id) {
            const response = await updateProduct(newFormData, id)
            if (response.success === false) {
              showSnackBar(response.message)
            } else {
              showSnackBar("Actualización de producto exitosa.")
              navigate("/admin/product/read")
            }
          }
        }
      }
    }
  }

  const handleProductAction = (action: string) => {
    navigate({ pathname: "/admin/product/" + action })
  }

  return (
    <React.Fragment>
      <Grid2 container padding={3}>
        <Grid2
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title title="Actualizar producto" />
          <Tooltip title="Volver al listado">
            <IconButton
              color="default"
              onClick={() => {
                handleProductAction("read")
              }}
              style={{ marginRight: "10px" }}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Grid2>
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
          <ProductForm
            handleSubmit={handleSubmit}
            openVideo={handleClickOpen}
          />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Variants
            product={state}
            // activeVCrud={activeVCrud}
            // setActiveVCrud={setActiveVCrud}
          />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Mockup product={state} handleSubmit={handleSubmit}/>
        </TabPanel>
      </Grid2>
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
