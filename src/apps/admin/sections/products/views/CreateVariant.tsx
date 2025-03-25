import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Title from "../../../components/Title"
import axios from "axios"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import Snackbar from "@mui/material/Snackbar"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import FormControl from "@mui/material/FormControl"
import Checkbox from "@mui/material/Checkbox"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { nanoid } from "nanoid"
import Paper from "@mui/material/Paper"
import InputAdornment from "@mui/material/InputAdornment"
import { Product, Variant } from "../../../../../types/product.types"
import { useSnackBar, useLoading } from "@context/GlobalContext"

interface VariantProps {
  variant: Variant
  product: Product
  setVariant: (variant: Variant | undefined) => void
  setActiveVCrud: (active: string) => void
}

// interface sources {
//   images?: { type: string; url: string }[]
//   video?: { type: string; url: string }
// }
export default function CreateVariant({
  variant,
  product,
  setVariant,
  setActiveVCrud,
}: VariantProps) {
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [active, setActive] = useState((variant && variant.active) || false)
  const [attributes, setAttributes] = useState(
    (variant && variant.attributes) || []
  )
  // const [buttonAttState, setButtonAttState] = useState();
  const [variantName, setVariantName] = useState(
    (variant && variant.name) || ""
  )
  const [description, setDescription] = useState(
    (variant && variant.description) || ""
  )
  const [category, setCategory] = useState((variant && variant.category) || "")
  const [considerations, setConsiderations] = useState(
    (variant && variant.considerations) || ""
  )
  const [cost, setCost] = useState((variant && variant.cost) || "")
  const [publicPriceEq, setPublicPriceEq] = useState(
    (variant && variant.publicPrice.equation) || ""
  )
  // const [fromPublicPrice, setFromPublicPrice] = useState(
  //   (variant && variant.publicPrice?.from) || ""
  // )
  // const [toPublicPrice, setToPublicPrice] = useState(
  //   (variant && variant.publicPrice?.to) || ""
  // )
  const [prixerPriceEq, setPrixerPriceEq] = useState(
    (variant && variant.prixerPrice?.equation) || ""
  )
  // const [fromPrixerPrice, setFromPrixerPrice] = useState(
  //   (variant && variant.prixerPrice?.from) || ""
  // )
  // const [toPrixerPrice, setToPrixerPrice] = useState(
  //   (variant && variant.prixerPrice?.to) || ""
  // )
  const [buttonState, setButtonState] = useState(false)
  const navigate = useNavigate()
  const [image, setImage] = useState<any>(variant?.variantImage?.images)
  const [videoUrl, setVideoUrl] = useState(
    (variant && variant?.video) || undefined
  )
  const [videoPreview, setVideoPreview] = useState<string | undefined>(
    undefined
  )
  const [loadeImage, setLoadImage] = useState<any>({
    loader: [],
  }) //variant && variant.variantImage ||
  const [errorMessage, setErrorMessage] = useState()
  const [open, setOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [mustImage, setMustImages] = useState(false)

  if (loadeImage.loader[0] === undefined && image) {
    image.map((url: any) => {
      url.type === "images"
        ? loadeImage.loader.push(url.url)
        : setVideoUrl(url.url)
    })
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const convertToBase64 = (blob: File) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const replaceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (file) {
      const resizedString = await convertToBase64(file)
      loadeImage.loader[index] = resizedString
      image[index] = file
      setImage(image)
      setLoadImage({ loader: loadeImage.loader })
    }
  }

  const loadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (loadeImage.loader.length >= 4 || image?.length >= 5) {
      showSnackBar("No puedes colocar mas de 4 fotos")
    } else {
      const file = e.target.files?.[0]
      if (!file) return

      const resizedString = await convertToBase64(file)
      loadeImage.loader.push(resizedString)
      image.push(file)
      setImage(image)
      setLoadImage({ loader: loadeImage.loader })
    }
  }

  const modifyString = (
    a: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    sti: string
  ) => {
    const url = sti.split(" ")
    const width = sti.replace("560", "326").replace("315", "326")
    const previewMp4: string = sti.replace("1350", "510").replace("494", "350")
    setVideoUrl(width)
    setVideoPreview(previewMp4)
    // const index = url[3].indexOf()
    // sti.replace(index, '?controls=0\"')
    //sti[79]
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (image === undefined) {
      showSnackBar("No puedes actualizar un variant sin foto. Agrega 1 o mas")
    } else {
      if (
        !variantName &&
        !cost &&
        !publicPriceEq &&
        !prixerPriceEq &&
        !image &&
        !attributes
      ) {
        showSnackBar("Por favor completa todos los campos requeridos.")
        e.preventDefault()
      } else {
        setLoading(true)
        setButtonState(true)

        // const productData = props.product;
        const formData = new FormData()
        const variants = {
          _id: variant ? variant._id : nanoid(6),
          image: image,
          active: active,
          name: variantName,
          description: description,
          category: category,
          considerations: considerations,
          cost: cost,
          publicPrice: {
            // from: fromPublicPrice,
            // to: toPublicPrice,
            equation: publicPriceEq,
          },
          prixerPrice: {
            // from: fromPrixerPrice,
            // to: toPrixerPrice,
            equation: prixerPriceEq,
          },
          attributes: attributes,
        }

        variants.attributes?.map((obj: any, i: number) => {
          if (obj.name) {
            formData.append(`attributesName${i}`, obj.name.trim())
          }
          if (obj.value) {
            formData.append(`attributesValue${i}`, obj.value)
          }
        })
        formData.append("variant_id", variants._id)
        let varImages: any = []
        image.map((img: any) => {
          if (img.type === "images") {
            varImages.push(img.url + " ")
          } else if (typeof img.size === "number") {
            formData.append("variantImage", img)
          }
        })
        formData.append("images", varImages)
        if (videoUrl !== undefined) {
          formData.append("video", videoUrl)
        }
        formData.append("variantActive", variants.active.toString())
        formData.append("variantName", variants.name)
        formData.append("variantDescription", variants.description)
        formData.append("variantCategory", variants.category)
        formData.append("variantConsiderations", variants.considerations)
        formData.append("variantPrice", variants.cost.toString())
        if (variants.publicPrice.equation) {
          formData.append(
            "variantPublicPriceFrom",
            variants.publicPrice.equation.toString()
          )
        }
        // if (toPublicPrice) {
        //   formData.append("variantPublicPriceTo", variants.publicPrice.to)
        // }
        // formData.append("variantPublicPriceEq", variants.publicPrice.equation)
        if (variants.prixerPrice.equation) {
          formData.append(
            "variantPrixerPriceFrom",
            variants.prixerPrice.equation.toString()
          )
        }
        // if (toPrixerPrice) {
        //   formData.append("variantPrixerPriceTo", variants.prixerPrice.to)
        // }
        // if (prixerPriceEq) {
        //   formData.append("variantPrixerPriceEq", variants.prixerPrice.equation)
        // }

        const base_url =
          import.meta.env.VITE_BACKEND_URL +
          "/product/updateVariants/" +
          product._id
        const response = await axios.put(base_url, formData)

        if (response.data.success === false) {
          setButtonState(false)
          showSnackBar(response.data.message)
          // console.log(response.error)
          setVariant(undefined)
        } else {
          navigate("/product/update/" + product._id)
          showSnackBar("Actualización de variante exitoso.")
          setActive(true)
          setImage("")
          setVariantName("")
          setDescription("")
          setCategory("")
          setConsiderations("")
          setCost("")
          setPublicPriceEq("")
          // setFromPublicPrice("")
          // setToPublicPrice("")
          setPrixerPriceEq("")
          // setFromPrixerPrice("")
          // setToPrixerPrice("")
          setVariant(undefined)
          setActiveVCrud("read")
        }
      }
    }
  }

  return (
    <React.Fragment>
      <Title title="Variantes" />
      <form noValidate encType="multipart/form-data" onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 container spacing={2}>
            <Grid2 container spacing={2}>
              <Grid2
                size={{
                  sm: 12,
                  md: 4,
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormControl variant="outlined">
                  <Button variant="contained" component="label">
                    Upload File
                    <input
                      name="productImages"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(a) => {
                        loadImage(a)
                      }}
                    />
                  </Button>
                  - O -
                  <Button variant="contained" onClick={handleClickOpen}>
                    Upload video
                  </Button>
                </FormControl>
              </Grid2>
              <Grid2
                size={{
                  sm: 12,
                  md: 8,
                }}
                style={{ display: "flex" }}
              >
                {loadeImage.loader.length > 0 &&
                  loadeImage.loader.map((img: any, key_id: number) => {
                    return (
                      <div
                        style={{
                          width: "25%",
                          marginRight: "4px",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "right",
                          }}
                        >
                          <IconButton
                            style={{ color: "#d33f49" }}
                            component="label"
                          >
                            <input
                              name="productImages"
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(a) => {
                                const i = loadeImage.loader.indexOf(img)
                                replaceImage(a, i)
                              }}
                            />
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            style={{ color: "#d33f49" }}
                            onClick={(d) => {
                              loadeImage.loader.splice(key_id, 1)
                              image.splice(key_id, 1)
                              setImage(image)
                              setLoadImage({ loader: loadeImage.loader })
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
                            src={img || img.url}
                            alt="Imagen"
                          />
                        </Paper>
                        {/* {videoUrl && (
                          <span
                            key={key_id}
                            style={{ width: "100%" }}
                            dangerouslySetInnerHTML={{
                              __html: videoUrl.replace(/[,]/gi, ""),
                            }}
                          ></span>
                        )} */}
                      </div>
                    )
                  })}
                {videoUrl && (
                  <>
                    <div
                      style={{
                        // width: "25%",
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
                          onClick={handleClickOpen}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          style={{ color: "#d33f49" }}
                          onClick={(d) => {
                            setVideoUrl(undefined)
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={active}
                  color="primary"
                  onChange={() => {
                    setActive(!active)
                  }}
                />
                Habilitado / Visible{" "}
              </div>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="variantName"
                  label="Nombre"
                  name="variantName"
                  autoComplete="variantName"
                  value={variantName}
                  onChange={(e) => {
                    setVariantName(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <TextField
                  variant="outlined"
                  multiline
                  fullWidth
                  minRows={2}
                  id="description"
                  label="Descripción"
                  name="description"
                  autoComplete="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl variant="outlined" fullWidth={true}>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  id="considerations"
                  label="Consideraciones"
                  name="considerations"
                  autoComplete="considerations"
                  value={considerations}
                  onChange={(e) => {
                    setConsiderations(e.target.value)
                  }}
                />
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container style={{ marginTop: 20 }}>
            <h3>Precios </h3>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Costo de producción"
                value={cost}
                onChange={(e) => {
                  setCost(e.target.value)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="publicPriceEquation"
                label="Público"
                name="publicPriceEquation"
                autoComplete="publicPriceEquation"
                value={publicPriceEq}
                onChange={(e) => {
                  setPublicPriceEq(e.target.value)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                variant="outlined"
                fullWidth
                required
                id="prixerPriceEq"
                label="Prixers"
                name="prixerPriceEq"
                autoComplete="prixerPriceEq"
                value={prixerPriceEq}
                onChange={(e) => {
                  setPrixerPriceEq(e.target.value)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}></Grid2>
          <Grid2 container spacing={2}>
            <Grid2 container style={{ marginTop: 20 }}>
              <h3>Atributos</h3>
            </Grid2>
            {attributes &&
              attributes.map((att, i) => (
                <Grid2 container spacing={2} style={{ marginBottom: 10 }}>
                  <Grid2 size={{ xs: 12, md: 5 }}>
                    <FormControl variant="outlined" fullWidth={true}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="attribute"
                        label="Nombre"
                        name="attribute"
                        autoComplete="attribute"
                        value={att.name}
                        onChange={(e) => {
                          setAttributes(
                            attributes
                              .slice(0, i)
                              .concat({
                                name: e.target.value,
                                value: att.value,
                              })
                              .concat(attributes.slice(i + 1))
                          )
                        }}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 5 }}>
                    <FormControl variant="outlined" fullWidth={true}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="attributeValue"
                        label="Valor"
                        name="attributeValue"
                        autoComplete="attributeValue"
                        value={att.value}
                        onChange={(e) => {
                          setAttributes(
                            attributes
                              .slice(0, i)
                              .concat({ name: att.name, value: e.target.value })
                              .concat(attributes.slice(i + 1))
                          )
                        }}
                      />
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ sm: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setAttributes(
                          attributes.slice(0, i).concat(attributes.slice(i + 1))
                        )
                      }}
                      disabled={buttonState}
                      style={{ marginTop: 20 }}
                    >
                      -
                    </Button>
                  </Grid2>
                </Grid2>
              ))}
            <Grid2 sx={{ margin: "auto" }}>
              <Button
                variant="contained"
                onClick={() => {
                  setAttributes(
                    attributes
                      // .slice(0, 0)
                      .concat({ name: "", value: "" })
                  )
                }}
                disabled={buttonState}
                style={{ marginTop: 20 }}
              >
                +
              </Button>
            </Grid2>
          </Grid2>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
            {(variant && "Actualizar") || "Crear"}
          </Button>
        </Grid2>
      </form>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              const div = document.getElementById("ll")
              modifyString(a, a.target.value)
              // if (div) {
              //   div.innerHTML = videoPreview
              // }
            }}
            value={videoUrl}
            autoFocus
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
