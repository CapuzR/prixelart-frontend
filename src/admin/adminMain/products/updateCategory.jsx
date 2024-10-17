import React from "react"
import { useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"

import Title from "../Title"
import axios from "axios"
import TextField from "@material-ui/core/TextField"
import InputLabel from "@material-ui/core/InputLabel"
import OutlinedInput from "@material-ui/core/OutlinedInput"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import Grid from "@material-ui/core/Grid"
import Snackbar from "@material-ui/core/Snackbar"
import CircularProgress from "@material-ui/core/CircularProgress"
import { useTheme } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import FormControl from "@material-ui/core/FormControl"
import clsx from "clsx"
import validations from "../../../cart/validations"
import Checkbox from "@material-ui/core/Checkbox"
import Backdrop from "@material-ui/core/Backdrop"
import InputAdornment from "@material-ui/core/InputAdornment"
import { Typography } from "@material-ui/core"
import { nanoid } from "nanoid"
import Accordion from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Divider from "@material-ui/core/Divider"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined"
import IconButton from "@material-ui/core/IconButton"

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
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
    maxWidth: "100%",
    maxHeight: "100%",
    padding: "5px",
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
  buttonEdit: {
    cursor: "pointer",
    padding: "5px",
  },
}))

export default function UpdateCategory(props) {
  const classes = useStyles()
  const theme = useTheme()
  const history = useHistory()

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const [active, setActive] = useState(props.category.active)
  const [name, setName] = useState(props.category.name)
  const [appliedProducts, setAppliedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [buttonState, setButtonState] = useState(false)
  const [products, setProducts] = useState()
  const [loadIcon, setLoadIcon] = useState({
    icon: [],
    filename: "",
  })
  const [loadImage, setLoadImage] = useState({
    image: [],
    filename: "",
  })
  const [image, setImage] = useState()
  const [icon, setIcon] = useState()

  //Error states.
  const [errorMessage, setErrorMessage] = useState()
  const [snackBarError, setSnackBarError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name) {
      setErrorMessage("Por favor completa todos los campos requeridos.")
      setSnackBarError(true)
    } else {
      setLoading(true)
      setButtonState(true)
      const data = {
        name: name,
        active: active,
        // appliedProducts: appliedProducts,
      }
      const base_url = process.env.REACT_APP_BACKEND_URL + "/product/update-category/" + props.category._id
      const response = await axios.put(base_url, data)
      if (response.data.success === false) {
        setLoading(false)
        setButtonState(false)
        setErrorMessage(response.data.message)
        setSnackBarError(true)
      } else {
        setErrorMessage("¡Categoría actualizada exitosamente!")
        setSnackBarError(true)
        setActive(false)
        setName()
        setAppliedProducts([])
        history.push("/admin/product/read")
      }
    }
  }

  const getProducts = async () => {
    setLoading(true)
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-allv1"
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setProducts(response.data.products)
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  useEffect(() => {
    getProducts()
  }, [])

  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const loadImg = async (e, type) => {
    e.preventDefault()

    const file = e.target.files[0]
    const resizedString = await convertToBase64(file)

    if (type === "icon") {
      setLoadIcon({ loader: resizedString, filename: file.name })
    } else {
      setLoadImage({ loader: resizedString, filename: file.name })
    }
  }

  return (
    <React.Fragment>
      {
        <Backdrop
          className={classes.backdrop}
          open={loading}
        >
          <CircularProgress />
        </Backdrop>
      }
      <Title>Crear Categoría</Title>
      <form
        style={{
          height: "auto",
        }}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid>
          <Checkbox
            checked={active}
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            onChange={() => {
              active ? setActive(false) : setActive(true)
            }}
          />
          Habilitado
        </Grid>
        <Grid
          container
          style={{ display: "flex", marginTop: 10, marginBottom: 20 }}
        >
          <Grid md={4}>
            <FormControl
              className={classes.margin}
              variant="outlined"
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
              />
            </FormControl>
          </Grid>
          <Grid
            md={4}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {icon !== undefined && (
              <div
                style={{
                  width: "180px",
                }}
              >
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <IconButton
                    variant="text"
                    className={classes.buttonImgLoader}
                    style={{ color: "#d33f49" }}
                    onClick={() => {
                      setIcon()
                    }}
                  >
                    <HighlightOffOutlinedIcon />
                  </IconButton>
                </div>

                <img
                  style={{
                    width: "100%",
                    // height: "200px",
                    objectFit: "contain",
                  }}
                  src={img}
                  alt="+"
                />
              </div>
            )}
            <Button
              variant="contained"
              component="label"
              style={{ textTransform: "none", width: "fit-content" }}
            >
              Subir ícono
              <input
                name="categoryIcon"
                type="file"
                accept="image/*"
                hidden
                onChange={(a) => {
                  loadImg(a, "icon")
                }}
              />
            </Button>
          </Grid>
          <Grid
            md={4}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              component="label"
              style={{ textTransform: "none", width: "fit-content" }}
            >
              Subir imagen
              <input
                name="categoryImg"
                type="file"
                accept="image/*"
                hidden
                onChange={(a) => {
                  loadImg(a, "img")
                }}
              />
            </Button>
          </Grid>
        </Grid>
        <Divider
          light
          variant="fullWidth"
        />

        <Grid
          container
          spacing={2}
          style={{ marginTop: 20 }}
        >
          <Grid
            item
            xs={12}
          >
            <Checkbox
              checked={appliedProducts.length === products?.length}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={() => {
                if (appliedProducts.length !== products.length) {
                  let v1 = []
                  products.map((product) => v1.push(product.name))
                  setAppliedProducts(v1)
                } else if (appliedProducts.length === products.length) {
                  setAppliedProducts([])
                }
              }}
            />
            Todos los productos
          </Grid>
          {products &&
            products.map((product) => (
              <Grid
                item
                xs={3}
              >
                <Checkbox
                  checked={appliedProducts.includes(product.name)}
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => {
                    if (appliedProducts[0] === undefined) {
                      setAppliedProducts([product.name])
                    } else if (appliedProducts.includes(product.name)) {
                      setAppliedProducts(
                        appliedProducts.filter((item) => item !== product.name)
                      )
                    } else {
                      setAppliedProducts([...appliedProducts, product.name])
                    }
                  }}
                />
                {product.name}
              </Grid>
            ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={buttonState}
          style={{ marginTop: 20 }}
        >
          Crear
        </Button>
      </form>

      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  )
}
