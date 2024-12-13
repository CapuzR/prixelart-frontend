import React, { useState, useEffect } from "react"
import axios from "axios"
import "./prixProduct.css" // Import the CSS file

import ArtsGrid from "../prixerProfile/grid/grid"
import WarpImage from "../admin/productCrud/warpImage.js"
import Snackbar from "@material-ui/core/Snackbar"
import Grid from "@material-ui/core/Grid"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { makeStyles } from "@material-ui/core/styles"
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core"
import Button from "@material-ui/core/Button"
import MenuItem from "@material-ui/core/MenuItem"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import { useHistory } from "react-router-dom"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import InputLabel from "@material-ui/core/InputLabel"
import ShareIcon from "@material-ui/icons/Share"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js"
import { splitDescription } from "./services"
import LoadingBackdrop from "../sharedComponents/loading/loading.jsx"
import { useGlobalContext } from "../context/globalContext"
import AddIcon from "@material-ui/icons/AddShoppingCart"
import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import StepButton from "@material-ui/core/StepButton"

import MDEditor from "@uiw/react-md-editor"
import ReactGA from "react-ga"
ReactGA.initialize("G-0RWP9B33D8")
import { ProductCarousel } from "../sharedComponents/productCarousel/productCarousel"

//TO DO:
// 1. Make the useEffect works when the product is selected from the grid with the props,
// but also when the product is selected from the URL, with an axios call.
// 2. Set Currency toggle switch as a global React context in special bar (?).

export default function PrixProduct(props) {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const gridProductState = location.state

  const isIphone = useMediaQuery(theme.breakpoints.down("xs"))
  const isTab = useMediaQuery(theme.breakpoints.down("sm"))
  const [product, setProduct] = useState({})
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedItem, setSelectedItem] = useState(undefined)
  const [selectedArt, setSelectedArt] = useState(undefined)
  const { zone, toggleZone } = useGlobalContext()

  let globalParams = new URLSearchParams(window.location.search)
  const productId = globalParams.get("producto")
  const [expanded, setExpanded] = useState(false)
  const { generalDescription, technicalSpecification } = splitDescription(
    product?.description
  )
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    "Selecciona el producto",
    "Selecciona el arte",
    "Agrega al carrito",
  ]

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleStep = (step) => () => {
    setActiveStep(step)
  }

  const handleChange = (panel) => (isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const getProductAtt = async () => {
    setLoading(true)
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read_v2"
    await axios
      .post(base_url, {
        _id: productId,
        inter: zone === "INTER" ? true : false,
      })
      .then(async (response) => {
        let attributes = response.data.attributes
        let variants = response.data.variants
        const initialSelection = attributes.map(() => "")
        if (gridProductState && gridProductState.product) {
          setProduct({
            ...gridProductState.product,
            attributes: attributes,
            selection: initialSelection,
            variants: variants,
          })
          setSelectedItem({
            ...gridProductState.product,
            attributes: attributes,
          })
        } else {
          setProduct({
            ...response.data.product,
            selection: initialSelection,
            attributes: attributes,
            variants: variants,
          })
          setSelectedItem({
            ...response.data.product,
            attributes: attributes,
            variants: variants,
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })
    setLoading(false)
  }

  useEffect(() => {
    getProductAtt()
  }, [])

  const addingToCart = (e, prod) => {
    e.preventDefault()
    setSelectedItem(prod)
    setOpen(true)
    setMessage(
      "¡Producto seleccionado! Puedes seleccionar el arte de tu gusto o ir a la galería"
    )
  }

  const addArt = (selectedArt) => {
    setSelectedArt(selectedArt)
    setOpen(true)
    setMessage("¡Arte seleccionado! Puedes agregar el item al carrito")
  }

  const addItemToBuyState = () => {
    if (selectedArt === undefined) {
      const newState = [...props.buyState]
      newState.push({
        product: selectedItem,
        quantity: 1,
      })
      props.setBuyState(newState)
      localStorage.setItem("buyState", JSON.stringify(newState))
      setOpen(true)
      setMessage(
        "Producto agregado! Puedes ir al carrito de compras o encontrar el arte de tu gusto en la galería"
      )
    } else {
      const newState = [...props.buyState]
      newState.push({
        art: selectedArt,
        product: selectedItem,
        quantity: 1,
      })

      props.setBuyState(newState)
      localStorage.setItem("buyState", JSON.stringify(newState))
      setOpen(true)
      setMessage("¡Item agregado! Puedes ir al carrito de compras")
    }
  }



  return (
    <>
      <LoadingBackdrop open={loading} />
      {!isTab ? (
        <div className="prix-product-container">
          <div className="first-row">
            <div className="first-row-title-container">
              <div className="product-title">{product?.name}</div>
            </div>
            <div className="first-row-buttons-container">
              <div className="button-wrapper">
                <Button
                  variant="outlined"
                  className="share-button"
                  onClick={(e) => {
                    window.open(
                      utils.generateWaProductMessage(product),
                      "_blank"
                    )
                  }}
                >
                  <ShareIcon className="share-icon" /> Compartir
                </Button>
              </div>
              <div className="button-wrapper">
                <Button
                  className={
                    selectedArt === undefined
                      ? "add-button-disabled"
                      : "add-button-enabled"
                  }
                  disabled={selectedArt === undefined}
                  onClick={addItemToBuyState}
                >
                  <AddIcon className="add-icon share-icon" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="left-side">
              <div className="carousel-wrapper">
                <ProductCarousel
                  product={product}
                  selectedArt={selectedArt}
                  selectedItem={selectedItem}
                  type="withImages"
                />
              </div>
              <div className="info-accordion-wrapper">
                <Accordion
                  expanded={expanded === "panel1"}
                  onChange={handleChange("panel1")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className="accordion-title">
                      Descripción
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDEditor.Markdown
                      whiteSpace="pre-wrap"
                      source={generalDescription || "No description available."}
                      className="markdown-content"
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel2"}
                  onChange={handleChange("panel2")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Typography className="accordion-title">
                      {" "}
                      Especificación Técnica{" "}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="accordion-details">
                    <MDEditor.Markdown
                      whiteSpace="pre-wrap"
                      source={
                        technicalSpecification ||
                        "No technical specifications available."
                      }
                      className="markdown-content"
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel3"}
                  onChange={handleChange("panel3")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                  >
                    <Typography className="accordion-title">
                      Observaciones
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDEditor.Markdown
                      whiteSpace="pre-wrap"
                      source={
                        product?.observations || "No observations available."
                      }
                      className="markdown-content"
                    />
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>
            <div className="right-side">
              <div className="right-side-top">
                <h2>Selecciona:</h2>
                <div
                  className={`attributes-container ${
                    product?.attributes?.length > 1
                      ? "space-between"
                      : "flex-start"
                  }`}
                >
                  {product?.attributes?.map((att, iAtt, attributesArr) => (
                    <div
                      key={iAtt}
                      style={{ width: "45%" }}
                    >
                      <FormControl
                        variant="outlined"
                        style={{ width: "100%" }}
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                      >
                        <InputLabel id={att.name}>{att.name}</InputLabel>
                        <Select
                          labelId={att.name}
                          id={att.name}
                          value={product.selection?.[iAtt] || ""}
                          onChange={(e) => {
                            const newSelection = [...product.selection]
                            newSelection[iAtt] = e.target.value
                            setProduct((prevProduct) => ({
                              ...prevProduct,
                              selection: newSelection,
                            }))
                          }}
                          label={att.name}
                        >
                          <MenuItem value="">
                            <em>Select an option</em>
                          </MenuItem>
                          {(product?.selection?.every((s) => s === "") ||
                            product?.selection.some((s) =>
                              att.value.includes(s)
                            )) &&
                            att.value &&
                            att.value.map((n) => {
                              return (
                                <MenuItem
                                  key={n}
                                  value={n}
                                >
                                  {n}
                                </MenuItem>
                              )
                            })}
                          {product?.selection?.map((sel) => {
                            return product?.variants?.map(
                              (vari, iVar, varArr) => {
                                const isValid = vari.attributes?.some(
                                  (a) => a.value === sel
                                )
                                if (isValid) {
                                  return vari.attributes?.map(
                                    (variAtt, iVarAtt, varAttArr) => {
                                      if (
                                        variAtt.value !== sel &&
                                        att.value.includes(variAtt.value)
                                      ) {
                                        return (
                                          <MenuItem
                                            key={variAtt.value}
                                            value={variAtt.value}
                                          >
                                            {variAtt.value}
                                          </MenuItem>
                                        )
                                      }
                                    }
                                  )
                                }
                              }
                            )
                          })}
                        </Select>
                      </FormControl>
                    </div>
                  ))}
                </div>
              </div>
              <div className="right-side-bottom">
                <h2>Elige el arte:</h2>
                <div className="art-selection-container">
                  <div className="art-grid-wrapper">
                    <ArtsGrid
                      setSelectedArt={addArt}
                      setFullArt={props.setFullArt}
                      fullArt={props.fullArt}
                      setSearchResult={props.setSearchResult}
                      searchResult={props.searchResult}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="prix-product-container">
          <div className="first-row">
            <div className="first-row-title-container">
              <div className="product-title">{product?.name}</div>
            </div>
            <div className="first-row-buttons-container">
              <div className="button-wrapper">
                <Button
                  variant="outlined"
                  className="share-button"
                  onClick={(e) => {
                    window.open(
                      utils.generateWaProductMessage(product),
                      "_blank"
                    )
                  }}
                >
                  <ShareIcon className="share-icon" />
                  {!isTab && "Compartir"}
                </Button>
              </div>
              <div className="button-wrapper">
                <Button
                  className={
                    selectedArt === undefined
                      ? "add-button-disabled"
                      : "add-button-enabled"
                  }
                  disabled={selectedArt === undefined}
                  onClick={addItemToBuyState}
                >
                  <AddIcon className="add-icon share-icon" />
                  {!isTab && "Agregar al carrito"}
                </Button>
              </div>
            </div>
          </div>

          <div className="main-content">
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              nonLinear
              className="stepper"
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepButton onClick={handleStep(index)}>{label}</StepButton>
                </Step>
              ))}
            </Stepper>
            <div>
              {activeStep === 0 ? (
                <div className="left-side">
                <div className="carousel-wrapper">
                  <ProductCarousel
                    product={product}
                    selectedArt={selectedArt}
                    selectedItem={selectedItem}
                    type="withImages"
                  />
                </div>
                {product?.attributes?.length > 0 && (
                  <div className="right-side-top">
                    <h2>Selecciona:</h2>
                    <div
                      className={`attributes-container ${
                        product?.attributes?.length > 1
                          ? "space-between"
                          : "flex-start"
                      }`}
                    >
                      {product?.attributes?.map((att, iAtt, attributesArr) => (
                        <div
                          key={iAtt}
                          style={{ width: "45%" }}
                        >
                          <FormControl
                            variant="outlined"
                            style={{ width: "100%" }}
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                          >
                            <InputLabel id={att.name}>{att.name}</InputLabel>
                            <Select
                              labelId={att.name}
                              id={att.name}
                              value={product.selection?.[iAtt] || ""}
                              onChange={(e) => {
                                const newSelection = [...product.selection]
                                newSelection[iAtt] = e.target.value
                                setProduct((prevProduct) => ({
                                  ...prevProduct,
                                  selection: newSelection,
                                }))
                              }}
                              label={att.name}
                            >
                              <MenuItem value="">
                                <em>Select an option</em>
                              </MenuItem>
                              {(product?.selection?.every((s) => s === "") ||
                                product?.selection.some((s) =>
                                  att.value.includes(s)
                                )) &&
                                att.value &&
                                att.value.map((n) => {
                                  return (
                                    <MenuItem
                                      key={n}
                                      value={n}
                                    >
                                      {n}
                                    </MenuItem>
                                  )
                                })}
                              {product?.selection?.map((sel) => {
                                return product?.variants?.map(
                                  (vari, iVar, varArr) => {
                                    const isValid = vari.attributes?.some(
                                      (a) => a.value === sel
                                    )
                                    if (isValid) {
                                      return vari.attributes?.map(
                                        (variAtt, iVarAtt, varAttArr) => {
                                          if (
                                            variAtt.value !== sel &&
                                            att.value.includes(variAtt.value)
                                          ) {
                                            return (
                                              <MenuItem
                                                key={variAtt.value}
                                                value={variAtt.value}
                                              >
                                                {variAtt.value}
                                              </MenuItem>
                                            )
                                          }
                                        }
                                      )
                                    }
                                  }
                                )
                              })}
                            </Select>
                          </FormControl>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="info-accordion-wrapper">
                  <Accordion
                    expanded={expanded === "panel1"}
                    onChange={handleChange("panel1")}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography className="accordion-title">
                        Descripción
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <MDEditor.Markdown
                        whiteSpace="pre-wrap"
                        source={generalDescription || "No description available."}
                        className="markdown-content"
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    expanded={expanded === "panel2"}
                    onChange={handleChange("panel2")}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <Typography className="accordion-title">
                        {" "}
                        Especificación Técnica{" "}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className="accordion-details">
                      <MDEditor.Markdown
                        whiteSpace="pre-wrap"
                        source={
                          technicalSpecification ||
                          "No technical specifications available."
                        }
                        className="markdown-content"
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion
                    expanded={expanded === "panel3"}
                    onChange={handleChange("panel3")}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3a-content"
                      id="panel3a-header"
                    >
                      <Typography className="accordion-title">
                        {" "}
                        Observaciones{" "}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <MDEditor.Markdown
                        whiteSpace="pre-wrap"
                        source={
                          product?.observations || "No observations available."
                        }
                        className="markdown-content"
                      />
                    </AccordionDetails>
                  </Accordion>
                </div>
              </div>
              ) : (
                <div className="right-side">
                <div className="right-side-bottom">
                  <h2>Elige el arte:</h2>
                  <div className="art-selection-container">
                    <div className="art-grid-wrapper">
                      <ArtsGrid
                        setSelectedArt={addArt}
                        setFullArt={props.setFullArt}
                        fullArt={props.fullArt}
                        setSearchResult={props.setSearchResult}
                        searchResult={props.searchResult}
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}
              <div>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className="backButton"
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? "Agregar" : "Siguiente"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
