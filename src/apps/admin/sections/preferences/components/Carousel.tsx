import { useState, useEffect } from "react"
import { makeStyles } from "tss-react/mui"
import { useTheme, Theme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Button, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Grid2 from "@mui/material/Grid2"
import { FormControl } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"
import ImageListItem from "@mui/material/ImageListItem"
import ImageList from "@mui/material/ImageList"
import EditIcon from "@mui/icons-material/Edit"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Snackbar from "@mui/material/Snackbar"
import axios from "axios"
import AppBar from "@mui/material/AppBar"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    images: {
      width: "500px",
      height: "300px",
      borderRadius: "10px",
      cursor: "pointer",
    },
    buttons: {
      position: "absolute",
      color: "#ccc",
      display: "flex",
      cursor: "pointer",
      padding: "10px",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "90%",
    },
    nameFile: {
      width: "300px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: "10px",
      fontSize: "1rem",
      margin: "0",
      background: "#cccc",
    },
    loaderImage: {
      height: "80vh",
      backgroundColor: "#cccc",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    imageLoad: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    buttonImgLoader: {
      color: "#d33f49",
      cursor: "pointer",
      // position: "absolute",
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
    tab: {
      flexGrow: 1,
      backgroundColor: "transparent",
    },
  }
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const aspectRatios = [
  {
    id: 1,
    name: "21:9",
    aspect: 21 / 9,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
]

export default function Carousel() {
  const theme = useTheme()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"))
  const [image, newImage] = useState({ file: "", _id: "" }) //enviar
  const [imageLoader, setLoadImage] = useState({
    loader: "",
    filename: "Subir imagenes",
  }) //loader de imagenes
  const [type, setType] = useState("")
  const [value, setValue] = useState(0)
  const [images, newImages] = useState({ images: [] }) // lista de imagenes para renderizar
  const [update, setUpdate] = useState(false) // modal de update
  const [open, setOpen] = useState(false) //modal de eliminar -> confirm
  const [Open, setOpenI] = useState(false) // Toast para imagen eliminada exitosamente
  const [withoutImage, setWithoutImage] = useState(false)
  const [maxImage, setMaxImages] = useState(false) //Toast para maximo de 6 imagenes
  const [create, setCreate] = useState(false) // toast para imagen creada y listada
  const [createF, setCreateF] = useState(false)
  const [croppedArt, setCroppedArt] = useState(aspectRatios)

  const classes = useStyles()

  const openWithoutImage = () => {
    setWithoutImage(true)
  }

  const closeWithoutImage = () => {
    setWithoutImage(false)
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const maxImageOpen = () => {
    setMaxImages(true)
  }

  const maxImageClose = () => {
    setMaxImages(false)
  }

  const createOpen = () => {
    setCreate(true)
  }

  const createClose = () => {
    setCreate(false)
  }

  const createOpenF = () => {
    setCreateF(true)
  }

  const createCloseF = () => {
    setCreateF(false)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleClickOpenI = () => {
    setOpenI(true)
  }

  const handleCloseI = () => {
    setOpenI(false)
  }

  const openUpdate = () => {
    setUpdate(true)
  }

  const closeUpdate = () => {
    setUpdate(false)
  }

  // CRUD
  //Editar imagen:
  const handleUpdate = async (x) => {
    x.preventDefault()
    setLoading(true)
    const URI = import.meta.env.VITE_BACKEND_URL + "/carousel/" + image._id
    const formData = new FormData()
    type === "bannerImagesDesktop"
      ? formData.append("bannerImagesDesktop", image.file)
      : formData.append("bannerImagesMobile", image.file)
    let res = await axios.put(URI, formData)
    setLoadImage({
      loader: "",
      filename: "Subir imagenes",
    })
    setType("")
    newImage({
      _id: "",
      file: "",
    })
    setLoadImage({ loader: "", filename: "Subir imagenes" })
    openUpdate()
    getImagesForTheCarousel()
    closeUpdate()
  }

  // Crear imagen:
  const handleSubmit = async (a) => {
    a.preventDefault()
    const imagesDesktop = images.images.filter(
      (obj) => obj.images?.type === "desktop"
    )
    const imagesMobile = images.images.filter(
      (obj) => obj.images?.type === "mobile"
    )
    if (
      imagesDesktop.length + imagesMobile.length === 12 ||
      (imagesDesktop.length === 6 && imagesMobile.length === 6)
    ) {
      maxImageOpen()
      setLoadImage({
        loader: "",
        filename: "Subir imagenes",
      })
    } else {
      setLoading(true)
      setLoadImage({
        loader: "",
        filename: "Subir imagenes",
      })

      const URI = import.meta.env.VITE_BACKEND_URL + "/carousel"
      const newFormData = new FormData()
      type === "bannerImagesDesktop"
        ? newFormData.append("bannerImagesDesktop", image.file)
        : newFormData.append("bannerImagesMobile", image.file)
      newFormData.append("adminToken", localStorage.getItem("adminTokenV"))
      let res = await axios.post(URI, newFormData, { withCredentials: true })
      createOpen()
      setType("")
      newImage({
        _id: "",
        file: "",
      })
      setLoadImage(false)
      createOpen()
      getImagesForTheCarousel()
    }
  }

  const deleteImage = async (d) => {
    d.preventDefault()
    const imagesDesktop = images.images.filter(
      (obj) => obj?.images?.type === "desktop"
    )
    const imagesMobile = images.images.filter(
      (obj) => obj?.images?.type === "mobile"
    )
    if (imagesDesktop.length + imagesMobile.length === 2) {
      openWithoutImage()
    } else {
      handleClose()
      setLoading(true)
      const URI =
        import.meta.env.VITE_BACKEND_URL +
        "/admin/preferences/carousel/" +
        image._id
      await axios.delete(URI)
      getImagesForTheCarousel()
      handleClickOpenI()
      handleCloseI()
    }
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
  // Actualizacion del estado para preview de imagen
  const loadImage = async (e) => {
    setType(e.target.name)
    const file = e.target.files[0]
    const resizedString = await convertToBase64(file)
    setLoadImage({ loader: resizedString, filename: file.name })
  }

  //Cancelar subida de imagen
  const cancelUploadImage = () => {
    setLoadImage({ loader: "", filename: "Subir imagenes" })
    newImage({ _id: "", file: "" })
  }
  //Tomar imagenes en array para ser listadas y renderizadas
  const getImagesForTheCarousel = () => {
    setLoading(true)
    const URI = import.meta.env.VITE_BACKEND_URL + "/carousel"
    fetch(URI)
      .then((res) =>
        res
          .json()
          .then((data) => {
            newImages({ images: data.imagesCarousels })
          })
          .catch((err) => console.error(`Your request is wrong: ${err}`))
      )
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    getImagesForTheCarousel()
  }, [])

  return (
    <>
      <Grid2>
        <div className={classes.tab}>
          <AppBar
            position="static"
            style={{
              backgroundColor: "transparent",
              color: "#d33f49",
              fontWeight: 400,
              boxShadow: "none",
              marginBottom: 10,
            }}
          >
            <Tabs value={value} onChange={handleChange}>
              <Tab label="Desktop" />
              <Tab label="Mobile" />
            </Tabs>
          </AppBar>
          {imageLoader.loader && (
            <Grid2 style={{ display: "flex", justifyContent: "center" }}>
              <Grid2 size={{ lg: 8 }} style={{ display: "flex" }}>
                <img
                  className={classes.imageLoad}
                  src={imageLoader.loader}
                  alt="Uploaded"
                />
                {/* {croppedArt.map(
                  (ar, index) =>
                    ar.id === tabValue && (
                      <Grid2
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        style={{
                          position: "relative",
                          height: 300,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        {croppedArt[index].thumb == "" ? (
                          <EasyCropper
                            art={art}
                            ar={ar}
                            croppedArt={croppedArt}
                            setCroppedArt={setCroppedArt}
                            index={index}
                            setCroppedAreaPixels={setCroppedAreaPixels}
                          />
                        ) : (
                          <Grid2
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            style={{
                              position: "relative",
                              height: 300,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip
                              title={
                                "Genera el recorte para recomendar a tus clientes las mejores secciones de tu arte."
                              }
                            >
                              <img
                                className={classes.img}
                                alt="Uploaded"
                                src={croppedArtTemp[index].thumb}
                              />
                            </Tooltip>
                          </Grid2>
                        )}
                        {croppedArt[index].cropped ? (
                          <Grid2
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            style={{
                              position: "absolute",
                              right: 5,
                              bottom: 5,
                            }}
                          >
                            <IconButton
                              color="secondary"
                              aria-label="add an alarm"
                              style={{ padding: 0 }}
                              onClick={() => {
                                updateCrop(index);
                              }}
                            >
                              <Typography>Recortar</Typography>
                              <CropIcon />
                            </IconButton>
                          </Grid2>
                        ) : (
                          <Grid2
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            style={{
                              position: "absolute",
                              right: 5,
                              bottom: 5,
                              zIndex: 20,
                            }}
                          >
                            <IconButton
                              color="secondary"
                              aria-label="add an alarm"
                              style={{ padding: 0 }}
                              onClick={() => {
                                handleCrop(index);
                              }}
                            >
                              <Typography>Listo</Typography>
                              <CheckCircleOutlineIcon />
                            </IconButton>
                          </Grid2>
                        )}
                      </Grid2>
                    )
                )} */}
                {/* <AspectRatioSelector
                  art={imageLoader.loader}
                  croppedArt={croppedArt}
                  setCroppedArt={setCroppedArt}
                /> */}

                <Tooltip
                  className={classes.buttonImgLoader}
                  title="Eliminar imagen"
                >
                  <HighlightOffOutlinedIcon
                    style={{ width: "2rem" }}
                    onClick={cancelUploadImage}
                  />
                </Tooltip>
              </Grid2>
            </Grid2>
          )}
          <TabPanel value={value} index={0}>
            <Box style={{ display: "flex", justifyContent: "center" }}>
              {permissions?.modifyBanners && (
                <FormControl>
                  <form
                    onSubmit={(s) => {
                      if (image._id !== "") {
                        handleUpdate(s)
                      } else {
                        handleSubmit(s)
                      }
                    }}
                    encType="multipart/form-data"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: isDesktop ? "row" : "column",
                      alignItems: isDesktop ? "center" : "stretch",
                      padding: isDesktop ? "15px" : "20px",
                      height: isDesktop ? "" : "30vh",
                      width: isDesktop ? "150%" : "auto",
                      marginLeft: isDesktop ? "-20%" : "",
                    }}
                  >
                    <Typography
                      className={classes.nameFile}
                      style={{ width: "auto" }}
                      id="uploadImage"
                    >
                      {imageLoader.filename}
                    </Typography>
                    <Button
                      variant="contained"
                      style={{ width: "auto" }}
                      component="label"
                    >
                      Upload File
                      <input
                        name="bannerImagesDesktop"
                        style={{ width: "auto" }}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(a) => {
                          a.preventDefault()
                          loadImage(a)
                          newImage({
                            _id: image._id,
                            file: a.target.files[0],
                          })
                        }}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: "auto" }}
                      color="primary"
                      type="submit"
                    >
                      Enviar
                    </Button>
                  </form>
                  {/* <Typography style={{ color: "gray", marginBottom: 10 }}>
                  Te recomendamos usar imágenes de proporción 16:9, o al menos
                  4:3
                </Typography> */}
                </FormControl>
              )}

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={create}
                onClose={createClose}
                autoHideDuration={5000}
                message="Process sucessfull"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={create}
                onClose={createClose}
                autoHideDuration={5000}
                message="Process sucessfull"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={createF}
                onClose={createCloseF}
                autoHideDuration={5000}
                message="You must send a image"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={update}
                onClose={closeUpdate}
                autoHideDuration={5000}
                message="Process sucessfull"
              />
            </Box>

            <ImageList cols={isDesktop ? 2 : 1} rowHeight={300}>
              {images.images ? (
                images.images.map((img, key_id) =>
                  img.images ? (
                    img.images.type === "desktop" && (
                      <ImageListItem key={key_id}>
                        <Box>
                          {permissions?.modifyBanners && (
                            <Box className={classes.buttons}>
                              <Button
                                variant="text"
                                style={{ color: "white" }}
                                component="label"
                              >
                                <input
                                  type="file"
                                  name="bannerImagesDesktop"
                                  hidden
                                  onChange={(a) => {
                                    a.preventDefault()
                                    loadImage(a)
                                    newImage({
                                      _id: img._id,
                                      file: a.target.files[0],
                                    })
                                  }}
                                />
                                <EditIcon />
                              </Button>
                              <Button
                                variant="text"
                                style={{ color: "white" }}
                                onClick={handleClickOpen}
                              >
                                <HighlightOffOutlinedIcon
                                  onClick={() => {
                                    newImage({
                                      _id: img._id,
                                      file: image.file,
                                    })
                                  }}
                                />
                              </Button>
                              <Dialog
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                              >
                                <DialogTitle id="alert-dialog-title">
                                  {
                                    "¿Estás seguro de eliminar esta imagen del carrusel?"
                                  }
                                </DialogTitle>
                                <DialogContent>
                                  <DialogContentText id="alert-dialog-description">
                                    Ésta imagen ya no se verá en el carrusel del
                                    banner principal
                                  </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={handleClose} color="primary">
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={(d) => {
                                      deleteImage(d)
                                    }}
                                    color="primary"
                                  >
                                    Aceptar
                                  </Button>
                                </DialogActions>
                              </Dialog>

                              <Snackbar
                                anchorOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                open={update}
                                onClose={closeUpdate}
                                autoHideDuration={5000}
                                message="Imagen borrada exitosamente"
                              />
                            </Box>
                          )}
                          <a href={img.images.url} target="_BLANK">
                            <img
                              className={classes.images}
                              title={img.images.url}
                              src={img.images.url}
                            ></img>
                          </a>
                        </Box>
                      </ImageListItem>
                    )
                  ) : (
                    <ImageListItem key={key_id}>
                      <Box>
                        {permissions?.modifyBanners && (
                          <Box className={classes.buttons}>
                            <Button
                              variant="text"
                              style={{ color: "white" }}
                              component="label"
                            >
                              <input
                                type="file"
                                name="bannerImagesDesktop"
                                hidden
                                onChange={(a) => {
                                  a.preventDefault()
                                  loadImage(a)
                                  newImage({
                                    _id: img._id,
                                    file: a.target.files[0],
                                  })
                                }}
                              />
                              <EditIcon />
                            </Button>
                            <Button
                              variant="text"
                              style={{ color: "white" }}
                              onClick={handleClickOpen}
                            >
                              <HighlightOffOutlinedIcon
                                onClick={() => {
                                  newImage({
                                    _id: img._id,
                                    file: image.file,
                                  })
                                }}
                              />
                            </Button>
                            <Dialog
                              open={open}
                              onClose={handleClose}
                              aria-labelledby="alert-dialog-title"
                              aria-describedby="alert-dialog-description"
                            >
                              <DialogTitle id="alert-dialog-title">
                                {
                                  "¿Estás seguro de eliminar esta imagen del carrusel?"
                                }
                              </DialogTitle>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  Ésta imagen ya no se verá en el carrusel del
                                  banner principal
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={(d) => {
                                    deleteImage(d)
                                  }}
                                  color="primary"
                                >
                                  Aceptar
                                </Button>
                              </DialogActions>
                            </Dialog>

                            <Snackbar
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              open={update}
                              onClose={closeUpdate}
                              autoHideDuration={5000}
                              message="Imagen borrada exitosamente"
                            />
                          </Box>
                        )}
                        <a href={img?.carouselImages} target="_BLANK">
                          <img
                            className={classes.images}
                            title={img?.carouselImages}
                            src={img?.carouselImages}
                          ></img>
                        </a>
                      </Box>
                    </ImageListItem>
                  )
                )
              ) : (
                <Typography>
                  Que mal, parece que no tienes imagenes en el carrusel
                </Typography>
              )}
            </ImageList>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Box style={{ display: "flex", justifyContent: "center" }}>
              {permissions?.modifyBanners && (
                <FormControl>
                  <form
                    onSubmit={(s) => {
                      if (image._id != "") {
                        handleUpdate(s)
                      } else {
                        handleSubmit(s)
                      }
                    }}
                    encType="multipart/form-data"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: isDesktop ? "row" : "column",
                      alignItems: isDesktop ? "center" : "stretch",
                      padding: isDesktop ? "15px" : "20px",
                      height: isDesktop ? "" : "30vh",
                      width: isDesktop ? "150%" : "auto",
                      marginLeft: isDesktop ? "-20%" : "",
                    }}
                  >
                    <Typography
                      className={classes.nameFile}
                      style={{ width: "auto" }}
                      id="uploadImage"
                    >
                      {imageLoader.filename}
                    </Typography>
                    <Button
                      variant="contained"
                      style={{ width: "auto" }}
                      component="label"
                    >
                      Upload File
                      <input
                        name="bannerImagesMobile"
                        style={{ width: "auto" }}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(a) => {
                          a.preventDefault()
                          loadImage(a)
                          newImage({
                            _id: image._id,
                            file: a.target.files[0],
                          })
                        }}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ width: "auto" }}
                      color="primary"
                      type="submit"
                    >
                      Enviar
                    </Button>
                  </form>
                  <Typography style={{ color: "gray", marginBottom: 10 }}>
                    Te recomendamos usar imágenes de proporción 9:16, o al menos
                    4:3
                  </Typography>
                </FormControl>
              )}

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={create}
                onClose={createClose}
                autoHideDuration={5000}
                message="Process sucessfull"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={create}
                onClose={createClose}
                autoHideDuration={5000}
                message="Process sucessfull"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={createF}
                onClose={createCloseF}
                autoHideDuration={5000}
                message="You must send a image"
              />

              <Snackbar
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={update}
                onClose={closeUpdate}
                autoHideDuration={5000}
                message="Process sucessfull"
              />
            </Box>

            <ImageList cols={isDesktop ? 2 : 1} rowHeight={300}>
              {images.images ? (
                images.images.map(
                  (img, key_id) =>
                    img.images?.type === "mobile" && (
                      <ImageListItem
                        key={key_id}
                        style={{ height: "", width: "" }}
                      >
                        <Box>
                          {permissions?.modifyBanners && (
                            <Box
                              className={classes.buttons}
                              style={{ width: "" }}
                            >
                              <Button
                                variant="text"
                                style={{ color: "white" }}
                                component="label"
                              >
                                <input
                                  type="file"
                                  name="bannerImagesMobile"
                                  hidden
                                  onChange={(a) => {
                                    a.preventDefault()
                                    loadImage(a)
                                    newImage({
                                      _id: img._id,
                                      file: a.target.files[0],
                                    })
                                  }}
                                />
                                <EditIcon />
                              </Button>
                              <Button
                                variant="text"
                                style={{ color: "white" }}
                                onClick={handleClickOpen}
                              >
                                <HighlightOffOutlinedIcon
                                  onClick={() => {
                                    newImage({
                                      _id: img._id,
                                      file: image.file,
                                    })
                                  }}
                                />
                              </Button>
                              <Dialog
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                              >
                                <DialogTitle id="alert-dialog-title">
                                  {
                                    "¿Estás seguro de eliminar esta imagen del carrusel?"
                                  }
                                </DialogTitle>
                                <DialogContent>
                                  <DialogContentText id="alert-dialog-description">
                                    Ésta imagen ya no se verá en el carrusel del
                                    banner principal
                                  </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={handleClose} color="primary">
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={(d) => {
                                      deleteImage(d)
                                    }}
                                    color="primary"
                                  >
                                    Aceptar
                                  </Button>
                                </DialogActions>
                              </Dialog>

                              <Snackbar
                                anchorOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                open={update}
                                onClose={closeUpdate}
                                autoHideDuration={5000}
                                message="Imagen borrada exitosamente"
                              />
                            </Box>
                          )}
                          <a href={img.images.url} target="_BLANK">
                            <img
                              style={{ height: "80vh", width: "25vw" }}
                              className={classes.images}
                              title={img.images.url}
                              src={img.images.url}
                            ></img>
                          </a>
                        </Box>
                      </ImageListItem>
                    )
                )
              ) : (
                <Typography>
                  Que mal, parece que no tienes imagenes en el carrusel
                </Typography>
              )}
            </ImageList>
          </TabPanel>
        </div>
      </Grid2>
      <Dialog
        open={maxImage}
        onClose={maxImageClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Limite alcanzado"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Solo puedes agregar 6 imagenes al carrusel, procura eliminar algunas
            imagenes o reemplazar
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={maxImageClose}>Aceptar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={withoutImage}
        onClose={closeWithoutImage}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"⚠ Alerta ⚠"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            No puedes dejar el carrusel sin imágenes 😢
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWithoutImage}>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
