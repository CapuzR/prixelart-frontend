import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { useLocation } from "react-router-dom"
import {
  makeStyles,
  withStyles,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Button,
  Typography,
  Container,
  Grid,
  TextField,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Chip,
  Modal,
  useMediaQuery,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core"

import {
  WhatsApp as WhatsAppIcon,
  Share as ShareIcon,
  AddShoppingCart as AddShoppingCartIcon,
  StarRate as Star,
  StarOutline,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
} from "@material-ui/icons"

import AppBar from "components/appBar/appBar"
import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import ArtUploader from "components/artUploader/artUploader"
import CartReview from "../../cart/cartReview"
import PaginationBar from "../../components/Pagination/PaginationBar"
import axios from "axios"
import Img from "react-cool-img"
import MDEditor from "@uiw/react-md-editor"
import Autocomplete from "@material-ui/lab/Autocomplete"
import styles from "./detail.module.scss"

import utils from "../../utils/utils"
import { verifyStandardArts } from "../api"
import { useTheme } from "@material-ui/core/styles"
import { useLoading, useSnackBar } from "context/GlobalContext"

const IOSSwitch = (props) => {
  return (
    <Switch
      className="iosSwitch"
      disableRipple
      {...props}
    />
  )
}

const photoIsos = ["100", "200", "400"]

export default function ArtDetail(props) {
  const location = useLocation()
  const history = useHistory()

  const theme = useTheme()
  const globalParams = new URLSearchParams(window.location.pathname)
  const [ready, setReady] = useState(false)
  const [tiles, setTiles] = useState(location.state?.searchResult || undefined)
  const [updatedTile, setUpdatedTile] = useState([])
  const { setLoading } = useLoading()
  const [artDataState, setArtDataState] = useState()
  const [snackBar, setSnackBar] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState(false)
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [fullArt, setFullArt] = useState(
    props.fullArt?.artId || globalParams.get("/art")
  )
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [hiddenArt, setHiddenArt] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [openV, setOpenV] = useState(false)
  const [disabledReason, setDisabledReason] = useState("")
  const [visible, setVisible] = useState(true)
  const [points, setPoints] = useState(50)
  const [termsAgreeVar, setTermsAgreeVar] = useState(true)
  const [value, setValue] = useState("")
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  const [allowExclusive, setAllowExclusive] = useState(false)
  const [comission, setComission] = useState(10)
  const [openSettings, setOpenSettings] = useState(false)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const [code, setCode] = useState("XX")
  const [serial, setSerial] = useState(0)
  const [sequence, setSequence] = useState(0)
  const totalArts = tiles?.length
  const itemsPerPage = 8
  const noOfPages = Math.ceil(totalArts / itemsPerPage)
  const [pageNumber, setPageNumber] = useState(1)
  const itemsToSkip = (pageNumber - 1) * itemsPerPage

  const propsRank = {
    min: 0,
    max: 100,
  }

  const verifyStandardArtsQ = async () => {
    setAllowExclusive(verifyStandardArts)
  }
  
  useEffect(() => {
    if (JSON.parse(localStorage.getItem("token"))) {
      verifyStandardArts()
    }
  }, [])

  const handleArtEdit = async (e, tile) => {
    setLoading(true)
    if (artDataState === tile.artId) {
      if (updatedTile.title !== "" && updatedTile.description !== "") {
        setUpdatedTile(tile)
        const base_url =
          process.env.REACT_APP_BACKEND_URL + "/art/update/" + selectedArt
        const data = {
          title: tile.title,
          description: tile.description,
          tags: tile.tags,
          category: tile.category,
          // artId: tile.artId,
          artType: tile.artType,
          artLocation: tile.artLocation,
          exclusive: tile.exclusive,
          comission: Number(tile.comission),
        }
        await axios
          .put(base_url, data)
          .then((response) => {
            if (response.data.data.success == true) {
              setSnackBarMessage(response.data.data.success)
              setSnackBar(true)
              setSelectedArt(undefined)
            } else {
              setSnackBarMessage(response.data.data.error_message)
              setSnackBar(true)
              setSelectedArt(undefined)
            }
          })
          .catch((error) => {
            setSelectedArt(undefined)
          })
        setArtDataState("")
      } else {
        setSnackBarMessage("Por favor llena los campos requeridos")
        setSnackBar(true)
      }
    } else {
      setArtDataState(tile.artId)
    }
    setLoading(false)
  }

  const handleArtDescriptionEdit = async (e, tile) => {
    let tempTiles = tiles
    let result = await descriptionEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleArtTitleEdit = async (e, tile) => {
    let tempTiles = tiles
    let result = await titleEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleOriginalPhotoHeight = async (e, tile) => {
    let tempTiles = tiles
    let result = await originalPhotoHeightEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleOriginalPhotoWidth = async (e, tile) => {
    let tempTiles = tiles
    let result = await originalPhotoWidthEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleOriginalPhotoPpi = async (e, tile) => {
    let tempTiles = tiles
    let result = await originalPhotoPpiEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleOriginalPhotoIso = async (e, tile) => {
    let tempTiles = tiles
    let result = await originalPhotoIsoEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleArtLocationEdit = async (e, tile) => {
    let tempTiles = tiles
    let result = await locationEdit(tempTiles, tile, e)
    setTiles(result)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClickVisible = () => {
    setOpenV(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedArt(undefined)
    setOpenSettings(false)
  }

  const handleCloseVisible = () => {
    setOpenV(false)
    setHiddenArt(undefined)
  }

  function tagsEdit(tempTiles, tile, e, tags) {
    return tempTiles.map((item) => {
      const result = tags.trim().split(/\s+/)
      if (item.artId === tile.artId) {
        item.tags = tags
      }
      return item
    })
  }

  function locationEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.artLocation = e.target.value
      }
      return item
    })
  }

  function titleEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.title = e.target.value
      }
      return item
    })
  }

  function originalPhotoHeightEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoHeight = e.target.value
      }
      return item
    })
  }

  function originalPhotoWidthEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoWidth = e.target.value
      }
      return item
    })
  }

  function originalPhotoPpiEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoPpi = e.target.value
      }
      return item
    })
  }

  function originalPhotoIsoEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoIso = e.target.value
      }
      return item
    })
  }

  function descriptionEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.description = e.target.value
      }
      return item
    })
  }

  const maxPrintValues = (tile) => {
    const [maxPrintWidthCm, maxPrintHeightCm] = utils.maxPrintCalc(
      tile.originalPhotoWidth,
      tile.originalPhotoHeight,
      tile.originalPhotoPpi,
      tile.originalPhotoIso
    )

    return maxPrintWidthCm + " x " + maxPrintHeightCm + " cm"
  }

  const navigateToPrixer = (e, prixerUsername) => {
    e.preventDefault()
    history.push({ pathname: "/prixer=" + prixerUsername })
  }

  const deleteArt = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/art/delete/" + selectedArt
    let res = await axios.delete(base_url)
    handleClose()
    setSnackBarMessage("Arte eliminado exitosamente")
    setSnackBar(true)
    history.goBack()
  }

  const setVisibleArt = async (art, id, event) => {
    setLoading(true)
    art.visible = !art.visible

    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/art/disable/" + art.artId
    const response = await axios.put(base_url, {
      art: art,
      disabledReason: disabledReason,
      adminToken: localStorage.getItem("adminTokenV"),
    })
    setSnackBarMessage("Arte modificado exitosamente")
    setSnackBar(true)
    setLoading(false)
    setDisabledReason("")
    setHiddenArt(undefined)
    handleClose()
    readArt()
  }

  const rankArt = async (art, id, event) => {
    setLoading(true)
    const URI = process.env.REACT_APP_BACKEND_URL + "/art/rank/" + id
    art.points = parseInt(points)
    const certificate = {
      code: code,
      serial: serial,
      sequence: sequence,
    }
    art.certificate = certificate
    const response = await axios.put(
      URI,
      art,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    )
    setSnackBarMessage("Puntuación agregada exitosamente")
    setInterval(() => {
      setLoading(false)
    }, 3000)
    setSnackBar(true)
    setSelectedArt(undefined)
    readArt()
  }

  const readArt = async () => {
    setLoading(true)
    if (
      props.fullArt &&
      props?.searchResult &&
      props?.searchResult?.length > 0
    ) {
      let index
      const s = props?.searchResult?.find((art, i) => {
        if (art.artId === fullArt) {
          index = i
        }
      })
      index = Number(index) / itemsPerPage
      const newPage = Math.floor(index + 1)
      setPageNumber(newPage)
    } else {
      const URI = process.env.REACT_APP_BACKEND_URL + "/art/read-by-id"
      await axios.post(URI, { _id: fullArt }).then((response) => {
        setTiles([response.data.arts])
        setPageNumber(1)
      })
    }
    setReady(true)
    setLoading(false)
    setTimeout(accurateLocation, 1000)
  }

  useEffect(() => {
    readArt()
  }, [])

  const accurateLocation = () => {
    document.getElementById(fullArt)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  const updateArtData = async (e, tile) => {
    setLoading(true)
    if (artDataState === "") {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/update/" + selectedArt
      const data = {
        title: tile.title,
        description: tile.description,
        tags: tile.tags,
        category: tile.category,
        // artId: tile.artId,
        artType: tile.artType,
        artLocation: tile.artLocation,
      }
      await axios
        .put(base_url, data)
        .then((response) => {
          if (response.data.data.success == true) {
            setSnackBarMessage(response.data.data.success)
            setSnackBar(true)
            setSelectedArt(undefined)
          } else {
            setSnackBarMessage(response.data.data.error_message)
            setSnackBar(true)
            setSelectedArt(undefined)
          }
        })
        .catch((error) => {
          setSelectedArt(undefined)
        })
    }
    setArtDataState(tile.artId)
    setLoading(false)
  }

  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read"
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleExclusive = async (e, tile) => {
    let tempTiles = tiles
    let result = await exclusiveEdit(tempTiles, tile, e)
    setTiles(result)
  }

  function exclusiveEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.exclusive = e.target.value
        if (e.target.value === "standard") {
          item.comission = 10
        }
      }
      return item
    })
  }

  const handleComission = async (e, tile) => {
    let tempTiles = tiles
    let result = await comissionEdit(tempTiles, tile, e)
    setTiles(result)
  }

  function comissionEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.comission = e.target.value
      }
      return item
    })
  }

  const addingToCart = (e, tile) => {
    e.preventDefault()
    setSelectedArt(tile)
    props.setIsOpenAssociateProduct(true)
  }

  return (
    <>
      <Container
        component="main"
        className={styles.paper}
      >
        <div className={styles.top}>
          {tiles !== undefined ? (
            tiles.map((tile) =>
              artDataState !== tile.artId ? (
                <div
                  id={tile.artId}
                  key={tile.artId}
                >
                  {tile.visible === true ? (
                    <>
                      <Card className={styles.littleTop}>
                        <CardActionArea disabled>
                          {tile.exclusive === "exclusive" && (
                            <Tooltip title="Arte exclusivo">
                              <IconButton className={styles.starButton}>
                                <Star
                                  className={styles.star}
                                  color="primary"
                                  fontSize="large"
                                />
                                <StarOutline
                                  className={styles.white}
                                  fontSize="large"
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Img
                            placeholder="/imgLoading.svg"
                            className={styles.imgBg}
                            src={tile.largeThumbUrl || tile.thumbnailUrl}
                            debounce={1000}
                            cache
                            error="/imgError.svg"
                            srcSet={
                              tile.smallThumbUrl +
                              " 600w, " +
                              tile.mediumThumbUrl +
                              " 850w, " +
                              tile.largeThumbUrl +
                              " 1300w"
                            }
                            sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                            alt={tile.title}
                            id={tile.artId}
                          />
                        </CardActionArea>
                        <CardContent>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            className={styles.info}
                          >
                            <Typography className={styles.info__id}>
                              ID: {tile.artId}
                            </Typography>
                            <Grid
                              container
                              spacing={1}
                              className={styles.info__prixer}
                            >
                              <Grid item>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) =>
                                    navigateToPrixer(e, tile.prixerUsername)
                                  }
                                >
                                  <Typography
                                    gutterBottom
                                    className={styles.info__prixer__text}
                                  >
                                    Prixer: {tile.prixerUsername}
                                  </Typography>
                                </Button>
                              </Grid>
                              <Grid item>
                                {/* ADMIN:  */}
                                {JSON.parse(
                                  localStorage.getItem("adminToken")
                                ) && (
                                  <div>
                                    <IconButton
                                      onClick={(e) => {
                                        if (
                                          selectedArt !== undefined &&
                                          tile.artId === selectedArt?.artId
                                        ) {
                                          setSelectedArt(undefined)
                                          setOpenSettings(false)
                                        } else {
                                          setSelectedArt(tile)
                                          setOpenSettings(true)
                                          setCode(tile?.certificate?.code)
                                          setSequence(
                                            tile?.certificate?.sequence
                                          )
                                          setSerial(tile?.certificate?.serial)
                                        }
                                      }}
                                    >
                                      {selectedArt !== undefined &&
                                      tile.artId === selectedArt?.artId ? (
                                        <CloseIcon />
                                      ) : (
                                        <MoreVertIcon />
                                      )}
                                    </IconButton>
                                  </div>
                                )}
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            className={styles.info__title}
                          >
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              className={styles.info__title__container}
                            >
                              <Typography
                                gutterBottom
                                variant="h5"
                                className={styles.info__title__text}
                              >
                                {tile.title}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            className={styles.info__location}
                          >
                            {tile.artLocation && (
                              <Typography
                                className={styles.info__location__littleText}
                              >
                                Ubicación: {tile.artLocation}
                              </Typography>
                            )}
                          </Grid>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            className={styles.info__description}
                          >
                            {tile.description}
                          </Typography>
                          {tile.originalPhotoHeight &&
                            tile.originalPhotoWidth && (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                              >
                                Máximo para impresión: {maxPrintValues(tile)}
                              </Typography>
                            )}
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            className={styles.info__creationDate}
                          >
                            Creado el{" "}
                            {new Date(tile?.createdOn).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </Typography>
                        </CardContent>

                        {/* ADMIN: Art ban */}
                        <CardActions>
                          {props.permissions?.artBan && (
                            <div className={styles.switch}>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                              >
                                Activo:
                              </Typography>
                              <IOSSwitch
                                color="primary"
                                size="normal"
                                checked={tile.visible}
                                onChange={(e) => {
                                  setHiddenArt(tile.artId)
                                  if (e.target.checked === false) {
                                    handleClickVisible()
                                    setVisible(e.target.checked)
                                  } else {
                                    setVisibleArt(tile, tile.artId, e)
                                    setVisible(e.target.checked)
                                  }
                                }}
                              />
                            </div>
                          )}
                          {openSettings === true &&
                          selectedArt !== undefined &&
                          tile.artId === selectedArt.artId ? (
                            <div className={styles.certificate}>
                              <Grid
                                container
                                spacing={0.5}
                                className={styles.certificate__container}
                              >
                                <Grid
                                  item
                                  xs={2}
                                >
                                  <TextField
                                    type="number"
                                    variant="outlined"
                                    label="Puntos"
                                    inputProps={propsRank}
                                    defaultValue={tile.points}
                                    onChange={(e) => {
                                      setPoints(e.target.value)
                                    }}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={6}
                                  className={styles.flex}
                                >
                                  <TextField
                                    className={styles.eight}
                                    variant="outlined"
                                    label="Código"
                                    onChange={(e) => {
                                      setCode(e.target.value)
                                    }}
                                    value={code}
                                  />
                                  <TextField
                                    className={styles.eight}
                                    type="number"
                                    variant="outlined"
                                    label="Arte"
                                    value={serial}
                                    onChange={(e) => {
                                      setSerial(Number(e.target.value))
                                    }}
                                  />
                                  <TextField
                                    type="number"
                                    variant="outlined"
                                    label="Seguimiento"
                                    value={sequence}
                                    onChange={(e) => {
                                      setSequence(Number(e.target.value))
                                    }}
                                  />
                                </Grid>
                                <div className={styles.certificate__button}>
                                  <Button
                                    color="primary"
                                    variant="outlined"
                                    className={styles.certificate__button__text}
                                    onClick={(e) => {
                                      rankArt(tile, tile.artId, e)
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </Grid>
                            </div>
                          ) : (
                            <div className={styles.certificate}>
                              <Button
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  addingToCart(e, tile)
                                }}
                              >
                                <AddShoppingCartIcon /> Comprar
                              </Button>
                              <Button
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  window.open(
                                    utils.generateWaMessage(tile),
                                    "_blank"
                                  )
                                }}
                              >
                                <ShareIcon /> Compartir
                              </Button>
                              {JSON.parse(localStorage.getItem("token")) &&
                                JSON.parse(localStorage.getItem("token"))
                                  .username === tile.prixerUsername && (
                                  <Button
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      handleArtEdit(e, tile)
                                      setSelectedArt(tile.artId)
                                    }}
                                  >
                                    Editar
                                  </Button>
                                )}

                              {JSON.parse(localStorage.getItem("token")) &&
                                JSON.parse(localStorage.getItem("token"))
                                  .username == tile.prixerUsername && (
                                  <Button
                                    color="primary"
                                    size="small"
                                    onClick={(e) => {
                                      handleClickOpen(e)
                                      setSelectedArt(tile.artId)
                                    }}
                                  >
                                    Eliminar
                                  </Button>
                                )}
                            </div>
                          )}
                        </CardActions>
                      </Card>
                      {/* PRIXER: Modal de ocultar arte  */}
                      <Dialog
                        open={hiddenArt === tile.artId}
                        onClose={handleCloseVisible}
                      >
                        <DialogTitle>
                          {"¿Estás seguro de ocultar este arte?"}
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            style={{
                              textAlign: "center",
                            }}
                          >
                            Este arte ya no será visible en este perfil y la
                            página de inicio.
                          </DialogContentText>
                        </DialogContent>
                        <Grid
                          item
                          xs
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
                            id="disableReason"
                            label="¿Por qué quieres ocultar este arte?"
                            variant="outlined"
                            onChange={(e) => {
                              setDisabledReason(e.target.value)
                              // handleArtTitleEdit(e, tile);
                            }}
                          />
                        </Grid>
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
                              setHiddenArt(undefined)
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
                      {/* PRIXER: Eliminar arte */}
                      <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle id="alert-dialog-title">
                          {"¿Estás seguro de eliminar este arte?"}
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            id="alert-dialog-description"
                            style={{
                              textAlign: "center",
                            }}
                          >
                            Este arte se eliminará permanentemente de tu perfil.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            onClick={handleClose}
                            color="primary"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => {
                              deleteArt(selectedArt)
                              setSelectedArt(undefined)
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
                    </>
                  ) : (
                    // ADMIN: Bloque de admin con cosas de Prixer mezcladas
                    JSON.parse(localStorage.getItem("adminToken")) && (
                      <Card style={{ marginTop: 35 }}>
                        <CardActionArea disabled>
                          <Img
                            placeholder="/imgLoading.svg"
                            style={{
                              backgroundColor: "#eeeeee",
                              width: "100%",
                            }}
                            src={tile.largeThumbUrl || tile.thumbnailUrl}
                            debounce={1000} // Default is 300 (ms)
                            cache
                            error="/imgError.svg"
                            srcSet={
                              tile.smallThumbUrl +
                              " 600w, " +
                              tile.mediumThumbUrl +
                              " 850w, " +
                              tile.largeThumbUrl +
                              " 1300w"
                            }
                            sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                            alt={tile.title}
                            id={tile.artId}
                          />
                        </CardActionArea>
                        <CardContent>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            style={{
                              whiteSpace: "nowrap",
                              padding: 0,
                              margin: 0,
                            }}
                            justify="space-between"
                          >
                            <Typography
                              style={{
                                display: "inline-block",
                                fontSize: "0.8em",
                                paddingLeft: 0,
                              }}
                            >
                              ID: {tile.artId}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) =>
                                navigateToPrixer(e, tile.prixerUsername)
                              }
                            >
                              <Typography
                                gutterBottom
                                variant="h7"
                                component="h2"
                                style={{
                                  display: "inline-block",
                                  right: 0,
                                  textAlign: "right",
                                  margin: 0,
                                  fontSize: 12,
                                }}
                              >
                                Prixer: {tile.prixerUsername}
                              </Typography>
                            </Button>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            justify="space-between"
                            style={{ textAlign: "left", padding: 0, margin: 0 }}
                          >
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              style={{
                                textAlign: "left",
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Typography
                                gutterBottom
                                variant="h5"
                                component="h2"
                                style={{ margin: 0 }}
                              >
                                {tile.title}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            style={{ textAlign: "left", padding: 0, margin: 0 }}
                          >
                            {tile.artLocation && (
                              <Typography
                                style={{
                                  fontSize: "0.8em",
                                  paddingBottom: 10,
                                  paddingLeft: 3,
                                }}
                              >
                                Ubicación: {tile.artLocation}
                              </Typography>
                            )}
                          </Grid>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            style={{
                              whiteSpace: "pre-line",
                              fontSize: "1.1em",
                              marginBottom: 10,
                            }}
                          >
                            {tile.description}
                          </Typography>
                          {tile.originalPhotoHeight &&
                            tile.originalPhotoWidth && (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                component="p"
                              >
                                Máximo para impresión: {maxPrintValues(tile)}
                              </Typography>
                            )}
                        </CardContent>
                        <CardActions>
                          {/* <Button size="small" color="primary">
                  Comparte
                </Button> */}
                          <Button
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              window.open(
                                utils.generateWaMessage(tile),
                                "_blank"
                              )
                            }}
                          >
                            <WhatsAppIcon /> Escríbenos
                          </Button>
                          {/* ADMIN: Dentro de un área que ya es de admin (?) */}
                          {JSON.parse(localStorage.getItem("adminToken")) && (
                            <IOSSwitch
                              color="primary"
                              size="normal"
                              onChange={(e) => {
                                if (e.target.checked === false) {
                                  handleClickVisible()
                                  setVisible(e.target.checked)
                                  setHiddenArt(tile.artId)
                                } else {
                                  setVisible(e.target.checked)
                                  setVisibleArt(tile, tile.artId, e)
                                }
                              }}
                            ></IOSSwitch>
                          )}
                          {/* PRIXER: Pero dentro de un bloque de ADMIN (?) */}
                          {JSON.parse(localStorage.getItem("token")) &&
                            JSON.parse(localStorage.getItem("token"))
                              .username == tile.prixerUsername && (
                              <Button
                                color="primary"
                                size="small"
                                onClick={(e) => {
                                  handleClickOpen(e)
                                  setSelectedArt(tile.artId)
                                }}
                              >
                                Eliminar
                              </Button>
                            )}
                          {/* PRIXER: Pero dentro de un bloque de ADMIN (?) */}
                          <Dialog
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">
                              {"¿Estás seguro de eliminar este arte?"}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText
                                id="alert-dialog-description"
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                Este arte se eliminará permanentemente de tu
                                perfil.
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={handleClose}
                                color="primary"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  deleteArt(selectedArt)
                                  setSelectedArt(undefined)
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
                        </CardActions>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                // QUÉ ES ESTO? EDICIÓN DEL ARTE??
                <Card
                  id={tile.artId}
                  key={tile.artId}
                  style={{ marginTop: 35 }}
                >
                  <Img
                    placeholder="/imgLoading.svg"
                    style={{ backgroundColor: "#eeeeee", width: "100%" }}
                    src={tile.largeThumbUrl || tile.thumbnailUrl}
                    debounce={1000} // Default is 300 (ms)
                    cache
                    error="/imgError.svg"
                    srcSet={
                      tile.smallThumbUrl +
                      " 600w, " +
                      tile.mediumThumbUrl +
                      " 850w, " +
                      tile.largeThumbUrl +
                      " 1300w"
                    }
                    sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                    alt={tile.title}
                    id={tile.artId}
                  />
                  <CardContent>
                    <Grid
                      item
                      xs={12}
                      container
                    >
                      <Grid
                        item
                        xs
                        container
                        direction="column"
                      >
                        <Grid
                          item
                          xs
                        >
                          <Grid
                            item
                            xs
                          >
                            <TextField
                              fullWidth
                              required
                              id="artTitle"
                              label="Titulo del arte"
                              variant="outlined"
                              value={tile.title}
                              onChange={(e) => {
                                // setTitle(e.target.value);
                                handleArtTitleEdit(e, tile)
                              }}
                            />
                          </Grid>
                          {tile.artType === "Foto" && (
                            <React.Fragment>
                              <Grid
                                item
                                container
                                xs={12}
                                style={{ paddingTop: 15, paddingBottom: 15 }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    Medida del archivo original{" "}
                                  </Typography>
                                </Grid>
                                {tile.originalPhotoWidth &&
                                  tile.originalPhotoHeight && (
                                    <Grid
                                      item
                                      container
                                      xs={12}
                                      sm={12}
                                      style={{ paddingTop: 15 }}
                                      justify="space-between"
                                    >
                                      <Grid
                                        item
                                        xs={5}
                                        sm={5}
                                      >
                                        <TextField
                                          variant="outlined"
                                          fullWidth
                                          id="originalPhotoWidth"
                                          label="Ancho"
                                          type="number"
                                          name="originalPhotoWidth"
                                          autoComplete="originalPhotoWidth"
                                          value={tile.originalPhotoWidth}
                                          onChange={(e) => {
                                            handleOriginalPhotoWidth(e, tile)
                                            if (e.target.value < 2000) {
                                              setSnackBarMessage(
                                                "La foto original debe tener un ancho mayor a 2.000 px."
                                              )
                                              setSnackBar(true)
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Typography style={{ paddingTop: 13 }}>
                                        {" "}
                                        x{" "}
                                      </Typography>
                                      <Grid
                                        item
                                        xs={5}
                                        sm={5}
                                      >
                                        <TextField
                                          variant="outlined"
                                          fullWidth
                                          type="number"
                                          id="originalPhotoHeight"
                                          label="Alto"
                                          name="originalPhotoHeight"
                                          autoComplete="originalPhotoHeight"
                                          value={tile.originalPhotoHeight}
                                          onChange={(e) => {
                                            handleOriginalPhotoHeight(e, tile)
                                            if (e.target.value < 2000) {
                                              setSnackBarMessage(
                                                "La foto original debe tener un alto mayor a 2.000 px."
                                              )
                                              setSnackBar(true)
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Typography
                                        style={{
                                          paddingTop: 13,
                                          paddingLeft: 2,
                                        }}
                                      >
                                        {" "}
                                        px{" "}
                                      </Typography>
                                    </Grid>
                                  )}
                                <Grid
                                  item
                                  container
                                  xs={12}
                                  sm={12}
                                  style={{ paddingTop: 15 }}
                                  justify="space-between"
                                >
                                  <Grid
                                    item
                                    xs={5}
                                    sm={5}
                                  >
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      type="number"
                                      id="originalPhotoPpi"
                                      label="PPI"
                                      name="originalPhotoPpi"
                                      autoComplete="originalPhotoPpi"
                                      value={tile.originalPhotoPpi}
                                      onChange={(e) => {
                                        handleOriginalPhotoPpi(e, tile)
                                        if (e.target.value < 100) {
                                          setSnackBarMessage(
                                            "La foto original debe ser mayor a 100 ppi."
                                          )
                                          setSnackBar(true)
                                        }
                                      }}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={6}
                                    style={{ paddingLeft: 0 }}
                                  >
                                    <FormControl
                                      variant="outlined"
                                      style={{ width: "100%" }}
                                    >
                                      <InputLabel
                                        id="originalPhotoIsoLabel"
                                        style={{ width: "100%" }}
                                      >
                                        ISO
                                      </InputLabel>
                                      <Select
                                        labelId="originalPhotoIsoLabel"
                                        id="originalPhotoIso"
                                        value={tile.originalPhotoIso}
                                        onChange={(e) => {
                                          handleOriginalPhotoIso(e, tile)
                                        }}
                                        label="originalPhotoIso"
                                      >
                                        <MenuItem value="">
                                          <em></em>
                                        </MenuItem>
                                        {photoIsos.map((n) => (
                                          <MenuItem
                                            key={n}
                                            value={n}
                                          >
                                            {n}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid
                                item
                                container
                                xs={12}
                                justify="space-between"
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    Medida máxima para impresión:
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    {maxPrintValues(tile)}{" "}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Grid
                                item
                                container
                                xs={12}
                              ></Grid>
                            </React.Fragment>
                          )}
                          <Grid
                            item
                            xs
                            style={{ marginBottom: 20, marginTop: 20 }}
                          >
                            <TextField
                              multiline
                              minRows={2}
                              fullWidth
                              required
                              id="artDescription"
                              variant="outlined"
                              label="Descripción del arte"
                              value={tile.description}
                              onChange={(e) => {
                                handleArtDescriptionEdit(e, tile)
                              }}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            style={{ marginBottom: 20, marginTop: 20 }}
                          >
                            <Autocomplete
                              multiple
                              freeSolo
                              id="tags-outlined"
                              options={tile.tags.map((tag) => tag)}
                              value={tile.tags}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    style={{ marginRight: 5 }}
                                    onDelete={() => {
                                      const newTiles = [...tiles]
                                      newTiles.find(
                                        (item) => item.artId === tile.artId
                                      ).tags = tile.tags.filter(
                                        (tag) => tag !== option
                                      )
                                      setTiles(newTiles)
                                    }}
                                    variant="outlined"
                                    label={option}
                                  />
                                ))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  label="Etiquetas"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value) {
                                      const newTiles = [...tiles]
                                      newTiles
                                        .find(
                                          (item) => item.artId === tile.artId
                                        )
                                        .tags.push(e.target.value)
                                      setTiles(newTiles)
                                    } else if (
                                      e.key === " " &&
                                      e.target.value
                                    ) {
                                      const newTiles = [...tiles]
                                      newTiles
                                        .find(
                                          (item) => item.artId === tile.artId
                                        )
                                        .tags.push(e.target.value)
                                      setTiles(newTiles)
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                          >
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="artLocation"
                              label="Ubicación"
                              name="artLocation"
                              autoComplete="artLocation"
                              value={tile.artLocation}
                              onChange={(e) => handleArtLocationEdit(e, tile)}
                            />
                          </Grid>
                          {allowExclusive && (
                            <Grid
                              container
                              spacing={2}
                              style={{
                                marginTop: 20,
                                justifyContent: "center",
                              }}
                            >
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                              >
                                <FormControl
                                  variant="outlined"
                                  className={styles.form}
                                  fullWidth
                                >
                                  <InputLabel
                                    required
                                    id="artTypeLabel"
                                  >
                                    Exclusividad
                                  </InputLabel>
                                  <Select
                                    value={tile.exclusive}
                                    onChange={(e) => handleExclusive(e, tile)}
                                    label="artType"
                                  >
                                    <MenuItem value="standard">
                                      Estándar
                                    </MenuItem>
                                    <MenuItem value={"exclusive"}>
                                      Exclusivo
                                    </MenuItem>
                                    <MenuItem value={"private"}>
                                      Privado
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                              >
                                <TextField
                                  variant="outlined"
                                  fullWidth
                                  label="Comisión"
                                  disabled={tile.exclusive === "standard"}
                                  value={tile.comission}
                                  type="number"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        %
                                      </InputAdornment>
                                    ),
                                  }}
                                  inputProps={{
                                    min: 10,
                                  }}
                                  onChange={(e) => handleComission(e, tile)}
                                />
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    {JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            handleArtEdit(e, tile)
                          }}
                        >
                          Guardar
                        </Button>
                      )}
                  </CardActions>
                </Card>
              )
            )
          ) : (
            <p>Prueba prueba</p>
          )}
          {/* Art uploader */}
          {openArtFormDialog && (
            <ArtUploader
              openArtFormDialog={openArtFormDialog}
              setOpenArtFormDialog={setOpenArtFormDialog}
            />
          )}
          {/* Floating buttons */}
          <Grid className={styles.float}>
            <FloatingAddButton
              setOpenArtFormDialog={setOpenArtFormDialog}
              setOpenShoppingCart={setOpenShoppingCart}
            />
          </Grid>
          {/* Snackbar */}
          <Snackbar
            open={snackBar}
            autoHideDuration={2000}
            message={snackBarMessage}
            className={styles.snackbar}
            onClose={() => setSnackBar(false)}
          />
        </div>

        <PaginationBar
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          noOfPages={noOfPages}
        />

        {/* Asociación de productos */}
        <Dialog
          open={props.isOpenAssociateProduct}
          keepMounted
          fullWidth
          onClose={() => props.setIsOpenAssociateProduct(false)}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"Asocia el arte a un producto dentro de tu carrito de compras"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {!props.selectedProductToAssociate?.previous &&
                props.buyState?.length > 0 &&
                props.buyState.find((buy) => buy.product !== undefined) && (
                  <strong>
                    Puedes asociar el arte a un producto de tu carrito de
                    compras o agregarlo y asociarlo mas tarde.
                  </strong>
                )}
              <div style={{ display: "flex" }}>
                {props.selectedProductToAssociate?.previous ? (
                  "¿Deseas asociar este producto al item seleccionado previamente en el carrito?"
                ) : props.buyState?.length > 0 &&
                  props.buyState.find((buy) => buy.product !== undefined) ? (
                  props.buyState.map((buy, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          width: "180px",
                        }}
                      >
                        {buy.product && (
                          <div
                            key={index}
                            style={{
                              marginBottom: "32px",
                              height: "180px",
                              width: "180px",
                            }}
                            onClick={() =>
                              props.setSelectedProductToAssociate({
                                index,
                                item: buy.product,
                              })
                            }
                          >
                            <Img
                              placeholder="/imgLoading.svg"
                              style={{
                                backgroundColor: "#eeeeee",
                                height: "180px",
                                width: "180px",
                                opacity:
                                  props.selectedProductToAssociate?.index ===
                                  index
                                    ? "1"
                                    : "0.6",
                              }}
                              src={buy.product ? buy.product.thumbUrl : ""}
                              debounce={1000}
                              cache
                              error="/imgError.svg"
                              // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                              sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                              alt={buy.product && buy.product.name}
                              id={index}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <strong>
                    Parece que no tienes ningun producto dentro del carrito de
                    compras, aun asi, puedes agregar este producto y asociarlo
                    más tarde.
                  </strong>
                )}
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                !props.selectedProductToAssociate?.previous &&
                  props.setSelectedProductToAssociate(undefined)
                props.setIsOpenAssociateProduct(false)
              }}
              color="primary"
            >
              {props.selectedProductToAssociate?.previous ? "No" : "Cerrar"}
            </Button>
            {props.buyState?.length > 0 &&
              props.buyState.find((buy) => buy.product !== undefined) && (
                <Button
                  disabled={!props.selectedProductToAssociate}
                  onClick={() => {
                    props.AssociateProduct({
                      index: props.selectedProductToAssociate.index,
                      item: selectedArt,
                      type: "art",
                    })
                    props.setSelectedProductToAssociate(undefined)
                    setSelectedArt(undefined)
                    props.setIsOpenAssociateProduct(false)
                  }}
                  color="primary"
                >
                  {props.selectedProductToAssociate?.previous
                    ? "Sí"
                    : "Asociar"}
                </Button>
              )}
            {!props.selectedProductToAssociate?.previous && (
              <Button
                onClick={() => {
                  props.addItemToBuyState({
                    type: "art",
                    item: selectedArt,
                  })

                  setSelectedArt(undefined)
                  history.push({ pathname: "/productos" })
                }}
                color="primary"
              >
                Agregar como nuevo
              </Button>
            )}
          </DialogActions>
        </Dialog>
        {/* Cart Review (?) */}
        <Dialog
          maxWidth={"lg"}
          open={openShoppingCart}
          style={{
            width: isDeskTop ? 850 : "100%",
            margin: isDesktop ? "auto" : 0,
          }}
        >
          {props.buyState?.length > 0 ? (
            <div
              style={{
                marginLeft: 15,
                marginRight: 15,
                marginTop: -60,
              }}
            >
              <CartReview
                buyState={props.buyState}
                changeQuantity={props.changeQuantity}
                deleteItemInBuyState={props.deleteItemInBuyState}
                deleteProductInItem={props.deleteProductInItem}
                setSelectedArtToAssociate={props.setSelectedArtToAssociate}
              />
            </div>
          ) : (
            <div style={{ margin: "90px 10px 40px 10px" }}>
              <Typography
                variant={"h6"}
                align={"Center"}
                justify={"center"}
              >
                Actualmente no tienes ningun producto dentro del carrito de
                compra.
              </Typography>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: 20,
            }}
          >
            <Button
              onClick={() => {
                setOpenShoppingCart(false)
              }}
              color="primary"
            >
              Cerrar
            </Button>
            {props.buyState?.length > 0 && (
              <Button
                onClick={() => {
                  history.push({ pathname: "/shopping" })
                }}
                color="primary"
              >
                Comprar
              </Button>
            )}
          </div>
        </Dialog>
      </Container>
    </>
  )
}
