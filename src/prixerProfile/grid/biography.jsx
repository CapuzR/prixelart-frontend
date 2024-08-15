import React, { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useTheme } from "@material-ui/core/styles"
import axios from "axios"
import { useHistory } from "react-router-dom"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import Backdrop from "@material-ui/core/Backdrop"
import CircularProgress from "@material-ui/core/CircularProgress"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import Grid from "@material-ui/core/Grid"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import EditIcon from "@material-ui/icons/Edit"
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined"
import Snackbar from "@material-ui/core/Snackbar"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import Tooltip from "@material-ui/core/Tooltip"

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    // marginBottom: "20px",
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
  paper: {
    padding: theme.spacing(1),
    // margin: "auto",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: "90%",
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  padding: {
    padding: 0,
  },
  textField: {
    width: "25ch",
  },
  form: {
    width: "40%",
    marginTop: 10,
  },
  buttonImgLoader: {
    cursor: "pointer",
    padding: "5px",
    color: "#d33f49",
  },
  buttonEdit: {
    cursor: "pointer",
    padding: "5px",
  },
}))

export default function Biography(props) {
  const classes = useStyles()
  const history = useHistory()
  const [backdrop, setBackdrop] = useState(false)
  const theme = useTheme()
  const [snackBar, setSnackBar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState(false)
  const globalParams = new URLSearchParams(window.location.pathname)
  const entries = globalParams.entries()
  const firstEntry = entries.next().value
  const [key, value] = firstEntry
  const [data, setData] = useState({ biography: "" })
  const [openEdit, setOpenEdit] = useState(false)

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const isTab = useMediaQuery(theme.breakpoints.up("xs"))
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"))
  const isnDesk = useMediaQuery(theme.breakpoints.down("md"))
  const [showFullDescription, setShowFullDescription] = useState([])
  const [disableButton, setDisableButton] = useState(false)
  const [images, setImages] = useState([]) // Imágenes visaulizadas
  const [newImg, setNewImg] = useState([])

  const getBio = async () => {
    setBackdrop(true)
    const base_url = window.location.pathname.includes("/org=")
      ? process.env.REACT_APP_BACKEND_URL +
        "/organization/getBio/" +
        props.prixerUsername
      : process.env.REACT_APP_BACKEND_URL +
        "/prixer/getBio/" +
        props.prixerUsername
    await axios
      .get(base_url)
      .then((response) => {
        setData(response.data.data)
      })
      .catch((error) => {
        console.log(error)
      })
    setBackdrop(false)
  }

  useEffect(() => {
    getBio()
  }, [])

  const updateBio = async () => {
    let formData = new FormData()
    setDisableButton(true)
    setLoading(true)
    setBackdrop(true)
    setSnackBar(true)
    setSnackBarMessage(
      "No cierres esta ventana mientras se sube tu biografía, por favor espera."
    )
    formData.append("biography", data.biography)
    formData.append(
      "prixerId",
      JSON.parse(localStorage.getItem("token")).prixerId
    )
    if (data?.images?.length > 0) {
      data?.images?.map((file) => formData.append("bioImages", file))
    }

    if (newImg.length > 0) {
      newImg.map((file) => formData.append("newBioImages", file))
    }
    const espc_url = key.includes("org") ? "/organization" : "/prixer"
    const ID = key.includes("org")
      ? JSON.parse(localStorage.getItem("token")).orgId
      : JSON.parse(localStorage.getItem("token")).prixerId
    const base_url =
      process.env.REACT_APP_BACKEND_URL + espc_url + "/updateBio/" + ID

    const petition = await axios.put(base_url, formData, {
      "Content-Type": "multipart/form-data",
    })
    if (petition.data.success) {
      setBackdrop(false)
      setSnackBarMessage(petition.data.message)
      setSnackBar(true)
      changeState("read")
      setNewImg([])
      setImages([])
      getBio()
    } else {
      setSnackBarMessage(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      )
      setSnackBar(true)
    }
    setLoading(false)
    setBackdrop(false)
    setDisableButton(false)
  }

  const checkImages = async () => {
    const prevImg = []
    await data?.images?.map((img) => {
      prevImg.push(img)
    })
    setImages(prevImg)
  }

  const loadNewImage = async (e) => {
    e.preventDefault()
    if (images.length === 4) {
      setSnackBar(true)
      setSnackBarMessage("Has alcanzado el máximo de imágenes (4).")
    } else {
      const file = e.target.files[0]
      const resizedString = await convertToBase64(file)
      setImages([...images, resizedString])
      setNewImg([...newImg, file])
    }
  }

  const deleteImg = async (e, x) => {
    e.preventDefault()
    const filteredPrev = data?.images?.filter((prev) => prev !== x)
    setData({ ...data, images: filteredPrev })
    const filteredImg = images.filter((img) => img !== x)
    setImages(filteredImg)
    if (newImg.length > 0) {
      const filteredNewImg = newImg.filter((img) => img !== x)
      setNewImg(filteredNewImg)
    }
  }

  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const closeAd = () => {
    setSnackBar(false)
  }

  const RenderHTML = ({ htmlString }) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlString }}
        style={{ margin: 10 }}
      />
    )
  }

  const handleEditorChange = (value) => {
    setData((prevState) => ({
      ...prevState,
      biography: value,
    }))
  }

  function SampleNextArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          background: "silver",
          paddingTop: "1px",
          borderRadius: 50,
        }}
        onClick={onClick}
      />
    )
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          background: "silver",
          borderRadius: 50,
          paddingTop: "1px",
        }}
        onClick={onClick}
      />
    )
  }

  const settings = {
    slidesToShow:
      images.length < 3
        ? images.length
        : (isMobile && 2) || (isTab && 3) || (isDesktop && 3),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
    adaptiveHeight: true,
  }

  const setting2 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
    adaptiveHeight: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  }

  const changeState = () => {
    setOpenEdit(!openEdit)
    checkImages()
  }

  return (
    <>
      <div className={classes.root}>
        <Backdrop
          className={classes.backdrop}
          open={backdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
      <Grid
        container
        style={{ justifyContent: "center", marginBottom: 20 }}
      >
        {openEdit ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <Paper
              className={classes.paper}
              style={{
                minHeight: 160,
                width: isDesktop ? "50%" : "100%",
                backgroundColor: "gainsboro",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
              elevation={3}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  width: "90%",
                }}
              >
                {images ? (
                  <Slider {...settings}>
                    {images?.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 40,
                          display: "flex",
                          flexDirection: "column",
                          width: "80%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <IconButton
                            className={classes.buttonImgLoader}
                            onClick={(d) => {
                              deleteImg(d, img)
                            }}
                          >
                            <HighlightOffOutlinedIcon />
                          </IconButton>
                          <img
                            style={{
                              width: "90%",
                              objectFit: "cover",
                              borderRadius: 10,
                            }}
                            src={img}
                            alt="Imagen"
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <Typography
                    variant="h4"
                    style={{
                      color: "#404e5c",
                      textAlign: "center",
                    }}
                    fontWeight="bold"
                  >
                    No tienes imágenes seleccionadas aún
                  </Typography>
                )}
                <Button
                  className={classes.buttonImgLoader}
                  size="medium"
                  style={{ display: "flex", marginTop: 15 }}
                  component="label"
                >
                  <input
                    name="bioImages"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(a) => {
                      loadNewImage(a)
                    }}
                  />
                  Cargar imagen
                </Button>
              </div>
            </Paper>
            <ReactQuill
              style={{
                marginBottom: 10,
                marginTop: 15,
                maxWidth: 1100,
                width: isDesktop ? "50%" : "100%",

                borderRadius: 30,
              }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ align: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                ],
              }}
              value={data?.biography}
              onChange={handleEditorChange}
              placeholder="Escribe tu biografía aquí..."
            />
            <Button
              color="primary"
              size="large"
              onClick={updateBio}
              disabled={disableButton}
            >
              Guardar
            </Button>
          </div>
        ) : data?.biography !== undefined &&
          JSON.parse(localStorage.getItem("token")) &&
          JSON.parse(localStorage.getItem("token"))?.username ===
            props.prixerUsername ? (
          <Paper
            elevation={3}
            className={classes.paper}
            style={{ width: isDesktop ? "50%" : "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
              }}
            >
              <Tooltip title="Editar biografía">
                <IconButton
                  component="span"
                  color="primary"
                  onClick={(e) => {
                    changeState("edit")
                  }}
                  variant="contained"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </div>
            {data?.images?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  width: "100%",
                  marginTop: 20,
                }}
              >
                <Slider {...setting2}>
                  {data?.images?.map(
                    (img, i) =>
                      img !== null &&
                      img !== undefined && (
                        <div
                          key={i}
                          style={{
                            borderRadius: 40,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            width: "90%",
                            // marginTop: 50,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <img
                              style={{
                                width: "90%",
                                objectFit: "cover",
                                borderRadius: 10,
                              }}
                              src={img}
                              alt="Imagen"
                            />
                          </div>
                        </div>
                      )
                  )}
                </Slider>
              </div>
            )}
            <div
              class="ql-editor"
              style={{ height: "auto" }}
            >
              <RenderHTML
                htmlString={
                  //   showFullDescription[i]
                  data?.biography
                  // : `${tile.description.slice(0, 450)}...`
                }
              />
            </div>
          </Paper>
        ) : data?.biography === undefined &&
          JSON.parse(localStorage.getItem("token")) &&
          JSON.parse(localStorage.getItem("token"))?.username ===
            props.prixerUsername ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h4"
              color="secondary"
              align="center"
              style={{
                paddingTop: 30,
              }}
            >
              No has publicado tu biografía aún.
            </Typography>
            <Button
              color="primary"
              size="large"
              onClick={(e) => {
                changeState("edit")
              }}
            >
              Crear ahora
            </Button>
          </div>
        ) : data?.biography !== undefined ? (
          <Paper
            elevation={3}
            className={classes.paper}
            style={{ width: isDesktop ? "50%" : "100%" }}
          >
            {data?.images?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  width: "92%",
                  marginLeft: "4%",
                  marginTop: 20,
                }}
              >
                <Slider {...setting2}>
                  {data?.images?.map(
                    (img, i) =>
                      img !== null &&
                      img !== undefined && (
                        <div
                          key={i}
                          style={{
                            borderRadius: 40,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <img
                              style={{
                                width: "100%",
                                objectFit: "cover",
                                borderRadius: 10,
                              }}
                              src={img}
                              alt="Imagen"
                            />
                          </div>
                        </div>
                      )
                  )}
                </Slider>
              </div>
            )}
            <div
              class="ql-editor"
              style={{ height: "auto" }}
            >
              <RenderHTML
                htmlString={
                  //   showFullDescription[i]
                  data?.biography
                  // : `${tile.description.slice(0, 450)}...`
                }
              />
            </div>
          </Paper>
        ) : (
          <Typography
            variant="h4"
            color="secondary"
            align="center"
            style={{
              paddingTop: 30,
            }}
          >
            Pronto publicaré mi biografía.
          </Typography>
        )}
      </Grid>
      <Snackbar
        open={snackBar}
        autoHideDuration={5000}
        message={snackBarMessage}
        onClose={closeAd}
      />
    </>
  )
}
