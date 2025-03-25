import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Title from "@apps/admin/components/Title"
import axios from "axios"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Grid2 from "@mui/material/Grid2"
import Snackbar from "@mui/material/Snackbar"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"
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

import {
  isAValidName,
  isAValidCi,
  isAValidPhoneNum,
  isAValidEmail,
} from "utils/validations"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import Paper from "@mui/material/Paper"
// import Mockup from './updateMockUp';
import InputAdornment from "@mui/material/InputAdornment"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import { Product } from "../../../../../types/product.types"
import { useSnackBar, useLoading } from "@context/GlobalContext"
const drawerWidth = 240

interface ProdProps {
  product: Product | undefined
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    textField: {
      marginRight: "8px",
    },
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "none",
      flexDirection: "column",
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
  }
})

export default function UpdateProductV2({ product }: ProdProps) {
  const { classes } = useStyles()
  const theme = useTheme()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  // const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  // const [productId, setProductId] = useState(product?._id);
  const [images, newImages] = useState({ images: [] })
  const [thumbUrl, setThumbUrl] = useState(product?.thumbUrl)
  const [imagesList, setImagesList] = useState(product?.sources.images)
  const [active, setActive] = useState(
    product?.active === "true" || product?.active === true ? true : false
  )
  const [productName, setProductName] = useState(product?.name)
  const [variants, setVariants] = useState(product?.variants)
  const [description, setDescription] = useState(product?.description)
  const [category, setCategory] = useState(product?.category)
  const [considerations, setConsiderations] = useState(
    product?.considerations || undefined
  )
  const [productionTime, setProductionTime] = useState(
    product?.productionTime || undefined
  )
  const [fromPublicPrice, setFromPublicPrice] = useState(
    product?.publicPrice?.from
  )
  const [toPublicPrice, setToPublicPrice] = useState(
    product?.publicPrice?.to || undefined
  )
  const [fromPrixerPrice, setFromPrixerPrice] = useState(
    product?.prixerPrice?.from
  )
  const [toPrixerPrice, setToPrixerPrice] = useState(
    product?.prixerPrice?.to || undefined
  )
  const [buttonState, setButtonState] = useState(false)
  const [activeVCrud, setActiveVCrud] = useState("read")
  const [hasSpecialVar, setHasSpecialVar] = useState(
    product?.hasSpecialVar === "true" || product?.hasSpecialVar === true
      ? true
      : false
  )
  const [videoUrl, setVideoUrl] = useState(product?.sources.video)
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: "Subir imagenes",
  })

  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const [focus, setFocus] = useState(undefined)

  //Error states.
  const [open, setOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [loaDOpen, setLoaDOpen] = useState(false)
  const [mustImage, setMustImages] = useState(false)

  useEffect(() => {
    // readProduct();
    const indexImage = imagesList && imagesList?.length

    // imagesList?.map((url) => {
    //   url?.type === 'images'
    //     ? imageLoader.loader.push(url && url.url)
    //     : setVideoUrl(url && url.url);
    // });

    // if (indexImage === -1) {
    //   imagesList && imagesList.push(thumbUrl);
    //   imageLoader.loader.push(thumbUrl);
    // }
    // setTimeout(() => {
    //   if (product?.sources.images) {
    //     product?.sources.images.map((element) => {
    //       element.type === 'video' && setVideoUrl(element.url);
    //     });
    //   }
    // }, 1000);
    // return () => {
    //   localStorage.removeItem('product');
    // };
  }, [])

  // function handleKeyDown(event) {
  //   if (event.key === 'Escape') {
  //     handleClose();
  //   } else return;
  // }
  // document.addEventListener('keydown', handleKeyDown);

  return (
    <React.Fragment>
      <Grid2 container className={classes.paper2}>
        <Tabs
          value={value}
          onChange={handleChange}
          style={{ width: "70%" }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Descripción" />
          <Tab label="Variantes" />
          <Tab label="MockUp" />
        </Tabs>

        {/* <TabPanel value={value} index={0}> */}
        <form
          encType="multipart/form-data"
          noValidate
          //  onSubmit={handleSubmit}
        >
          <Grid2 container spacing={2}>
            <Grid2 container spacing={2}>
              <Grid2
                size={{
                  xs: 12,
                  md: 4,
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormControl variant="outlined">
                  <Button
                    variant="contained"
                    component="label"
                    style={{ textTransform: "none" }}
                  >
                    Subir imagen{" "}
                    <input
                      name="newProductImages"
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(a) => {
                        a.preventDefault()
                        // loadImage(a);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    // onClick={handleClickOpen}
                    style={{ textTransform: "none", marginTop: 10 }}
                  >
                    Subir video
                  </Button>
                </FormControl>
              </Grid2>
              <Grid2
                size={{
                  xs: 11,
                  md: 7,
                }}
                style={{ display: "flex" }}
              >
                {imageLoader.loader &&
                  imageLoader.loader.map((img, key_id) => {
                    return (
                      <div
                        key={key_id}
                        style={{
                          width: "25%",
                          marginRight: "4px",
                          flexDirection: "row",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "right",
                          }}
                        >
                          <IconButton
                            style={{
                              color: "#d33f49",
                            }}
                            component="label"
                          >
                            <input
                              name="productImages"
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(a) => {
                                const i = imageLoader.loader.indexOf(img)
                                // replaceImage(a, i);
                                imagesList?.splice(key_id, 1)
                              }}
                            />
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            style={{ color: "#d33f49" }}
                            onClick={(d) => {
                              imageLoader.loader.splice(key_id, 1)
                              images.images.splice(key_id, 1)
                              imagesList?.splice(key_id, 1)
                              setLoadImage({
                                loader: imageLoader.loader,
                                filename: "Subir Imagenes",
                              })
                              newImages({ images: images.images })
                            }}
                          >
                            <HighlightOffOutlinedIcon />
                          </IconButton>
                        </div>
                        <Paper elevation={3} style={{ padding: 10 }}>
                          <img
                            style={{
                              width: "100%",
                              objectFit: "contain",
                            }}
                            src={img}
                            alt="Imagen"
                          />
                        </Paper>
                      </div>
                    )
                  })}
                {videoUrl && (
                  <>
                    <div
                      style={{
                        marginRight: "4px",
                        flexDirection: "row",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                        }}
                      >
                        <IconButton
                          style={{
                            color: "#d33f49",
                          }}
                          component="label"
                          //   onClick={handleClickOpen}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          style={{ color: "#d33f49" }}
                          onClick={(d) => {
                            // setVideoUrl(undefined);
                          }}
                        >
                          <HighlightOffOutlinedIcon />
                        </IconButton>
                      </div>

                      <Paper elevation={3} style={{ padding: 10 }}>
                        <span
                          key={1}
                          style={{ width: "100%" }}
                          dangerouslySetInnerHTML={{
                            __html: videoUrl,
                          }}
                        />
                      </Paper>
                    </div>
                  </>
                )}
              </Grid2>
              <IconButton
                style={{
                  color: "#d33f49",
                  width: 40,
                  height: 40,
                }}
                onClick={(e) => {
                  setImagesList([])
                  setLoadImage({ loader: [], filename: "Subir imagenes" })
                }}
              >
                <DeleteOutlineIcon style={{ width: 30, height: 30 }} />
              </IconButton>
              <Grid2 container>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Checkbox
                    checked={active}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onChange={() => {
                      active ? setActive(false) : setActive(true)
                    }}
                  />
                  Habilitado / Visible
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Checkbox
                    checked={hasSpecialVar}
                    color="primary"
                    onChange={() => {
                      hasSpecialVar
                        ? setHasSpecialVar(false)
                        : setHasSpecialVar(true)
                    }}
                  />
                  ¿Tiene variables especiales?
                </Grid2>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                {/* product?.hasSpecialVar === "true"> */}

                <FormControl variant="outlined" fullWidth={true}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="productName"
                    label="Nombre"
                    name="productName"
                    autoComplete="productName"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value)
                    }}
                    // autoFocus={focus === "name"}
                    // onFocus={() => {
                    //   handleFocus("name");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    id="category"
                    label="Categoría"
                    name="category"
                    autoComplete="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                    }}
                    // autoFocus={focus === "category"}
                    // onFocus={() => {
                    //   handleFocus("category");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl
                  className={classes.textField}
                  data-color-mode="light"
                  variant="outlined"
                  fullWidth={true}
                >
                  <InputLabel style={{ marginTop: "-5%" }}>
                    Descripción
                  </InputLabel>
                  <MDEditor
                    value={description}
                    onChange={setDescription}
                    preview="edit"
                    hideToolbar={false}
                    // autoFocus={focus === "description"}
                    // onFocus={() => {
                    //   handleFocus("description");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                  {/* <ReactQuill
                  style={{
                    marginBottom: 10,
                    marginTop: 15,
                    maxWidth: 1100,
                    width: "100%",

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
                  value={description}
                  onChange={handleEditorChange}
                  placeholder="Escribe la descripción aquí..."
                  // autoFocus={focus === "description"}
                  onFocus={() => {
                    handleFocus("description");
                  }}
                  onBlur={() => {
                    handleBlur();
                  }}
                /> */}
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    minRows={2}
                    label="Consideraciones"
                    value={considerations}
                    onChange={(e) => {
                      setConsiderations(e.target.value)
                    }}
                    // autoFocus={focus === "considerations"}
                    // onFocus={() => {
                    //   handleFocus("considerations");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                >
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Tiempo de producción"
                    value={productionTime}
                    onChange={(e) => {
                      setProductionTime(Number(e.target.value))
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">días</InputAdornment>
                        ),
                      },
                    }}
                    // autoFocus={focus === "productionTime"}
                    // onFocus={() => {
                    //   handleFocus("productionTime");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
            </Grid2>
            <Grid2 container style={{ marginTop: 20 }}>
              <Title title="PVP" />
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 4, md: 5 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="fromPublicPrice"
                    label="Desde"
                    name="fromPublicPrice"
                    autoComplete="fromPublicPrice"
                    value={fromPublicPrice}
                    onChange={(e) => {
                      setFromPublicPrice(Number(e.target.value))
                    }}
                    // error={
                    //   fromPublicPrice !== undefined &&
                    //   !isAValidPrice(fromPublicPrice)
                    // }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                    // autoFocus={focus === "fromPublicPrice"}
                    // onFocus={() => {
                    //   handleFocus("fromPublicPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 4, md: 5 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    // required
                    fullWidth
                    id="toPublicPrice"
                    label="Hasta"
                    name="toPublicPrice"
                    autoComplete="toPublicPrice"
                    value={toPublicPrice}
                    onChange={(e) => {
                      setToPublicPrice(Number(e.target.value))
                    }}
                    // error={
                    //   toPublicPrice !== undefined &&
                    //   toPublicPrice !== "" &&
                    //   toPublicPrice !== null &&
                    //   !isAValidPrice(toPublicPrice)
                    // }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                    // autoFocus={focus === "toPublicPrice"}
                    // onFocus={() => {
                    //   handleFocus("toPublicPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
            </Grid2>
            <Grid2 container style={{ marginTop: 20 }}>
              <Title title="PVM" />
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 4, md: 5 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="fromPrixerPrice"
                    label="Desde"
                    name="fromPrixerPrice"
                    autoComplete="fromPrixerPrice"
                    value={fromPrixerPrice}
                    onChange={(e) => {
                      setFromPrixerPrice(Number(e.target.value))
                    }}
                    // error={
                    //   fromPrixerPrice !== undefined &&
                    //   fromPrixerPrice !== "" &&
                    //   fromPrixerPrice !== null &&
                    //   !isAValidPrice(fromPrixerPrice)
                    // }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                    // autoFocus={focus === "fromPrixerPrice"}
                    // onFocus={() => {
                    //   handleFocus("fromPrixerPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 4, md: 5 }}>
                <FormControl
                  className={classes.textField}
                  variant="outlined"
                  fullWidth={true}
                >
                  <TextField
                    variant="outlined"
                    // required
                    fullWidth
                    id="toPrixerPrice"
                    label="Hasta"
                    name="toPrixerPrice"
                    autoComplete="toPrixerPrice"
                    value={toPrixerPrice}
                    onChange={(e) => {
                      setToPrixerPrice(Number(e.target.value))
                    }}
                    // error={
                    //   toPrixerPrice !== undefined &&
                    //   toPrixerPrice !== "" &&
                    //   toPrixerPrice !== null &&
                    //   !isAValidPrice(toPrixerPrice)
                    // }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                    // autoFocus={focus === "toPrixerPrice"}
                    // onFocus={() => {
                    //   handleFocus("toPrixerPrice");
                    // }}
                    // onBlur={() => {
                    //   handleBlur();
                    // }}
                  />
                </FormControl>
              </Grid2>
            </Grid2>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={buttonState}
              style={{ marginTop: 20 }}
            >
              Actualizar
            </Button>
          </Grid2>
        </form>
        {/* </TabPanel>

        <TabPanel value={value} index={1}>
          <Variants
            product={product}
            activeVCrud={activeVCrud}
            setActiveVCrud={setActiveVCrud}
          />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Mockup product={product} />
        </TabPanel> */}
      </Grid2>
      {/* <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              modifyString(a, a.target.value);
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
      </Dialog> */}
    </React.Fragment>
  )
}
