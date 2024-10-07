import React, { useState, useEffect } from "react";

import ArtsGrid from "../../prixerProfile/grid/grid";
import Snackbar from "@material-ui/core/Snackbar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Typography, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";
import { splitDescription } from "../services";
import { getPriceWithSelectedVariant, formatPrice } from "../services"

import MDEditor from "@uiw/react-md-editor";
import ReactGA from "react-ga";
import { ProductCarousel } from "../../sharedComponents/productCarousel/productCarousel";
import { useConversionRate, useCurrency  } from '../../context/globalContext';
import styles from './details.module.css';
import { fetchProductDetails } from '../api';
import { prepareProductData } from '../services';
import { CollectionsOutlined } from "@material-ui/icons";

ReactGA.initialize("G-0RWP9B33D8");

//TO DO:
// 1. Allow to remove the art completely from the cart

export default function Details(props) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const gridProductState = location.state;
  const { currency } = useCurrency();

  const [product, setProduct] = useState({});
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(undefined);
  const [selectedArt, setSelectedArt] = useState(undefined);

  let globalParams = new URLSearchParams(window.location.search);
  const productId = globalParams.get("producto");
  const [expanded, setExpanded] = useState(false);
  const { generalDescription, technicalSpecification } = splitDescription(product?.description);
  const { conversionRate } = useConversionRate();

  const handleSelection = (e) => {
    const newSelection = product?.selection && { ...product?.selection };
    console.log("e.target", e.target);
    newSelection[e.target.name] = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      selection: newSelection,
    }));
  };

  const getFilteredOptions = (att) => {
    
    if (Object.values(product?.selection).every((s) => s === "") ||
    !Object.keys(product?.selection).some((key) => key !== att.name && product?.selection[key] !== "")) {
      return att.value || [];
    }
    
    return Object.keys(product?.selection)
    .filter((key) => {
      if (key !== att.name && product?.selection[key] !== "") {
        return att.value;
    }})
    .map((key) => {
      return product?.variants?.filter((variant) => { return variant.attributes?.some(
          (a) => a.name === key && a.value === product?.selection[key]
      )})
      ?.map((vari) => {
        return vari.attributes?.filter((a) => a.name === att.name)[0].value;
      });
    })
    .flat();
  };

  const handleChange = (panel) => (isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    //Esto debería olvidarse de si viene desde el grid o no y siempre buscar la data.
    //Sino, el priceRange está malo.
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(productId);
        const { product, selectedItem } = prepareProductData(productData, gridProductState);
        console.log("product.price", product.price);
        setProduct(product);
        setSelectedItem({...selectedItem, price: product.price});
      } catch (error) {
        console.error("Error fetching product attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, gridProductState]);
  
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      const updatedPrice = product?.selection && Object.keys(product?.selection).every((s) => s !== "")
        ? await getPriceWithSelectedVariant(product?.priceRange, currency, conversionRate, product?.selection, product?.variants, selectedArt)
        : formatPrice(product?.priceRange, currency, conversionRate);
  
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: updatedPrice
      }));
      setSelectedItem((prevSelectedProduct) => ({
        ...prevSelectedProduct,
        price: updatedPrice,
        publicEquation: {
          from: updatedPrice,
          to: updatedPrice
        },
        publicPrice: {
          from: updatedPrice,
          to: updatedPrice
        }
      }));
    };
  
    fetchAndSetPrice();
  
  }, [product.selection, selectedArt, currency, conversionRate]);

  const addArt = (selectedArt) => {
    setSelectedArt(selectedArt);
    setOpen(true);
    setMessage("¡Arte seleccionado! Puedes agregar el item al carrito");
  };

  const addItemToBuyState = () => { 
    console.log("props.buyState", props.buyState);
    console.log("selectedItem", selectedItem);
    if (selectedArt === undefined) {
      const newState = [...props.buyState];
      newState.push({
        product: selectedItem,
        quantity: 1,
      });
      console.log("newState if", newState);
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      setOpen(true);
      setMessage(
        "Producto agregado! Puedes ir al carrito de compras o encontrar el arte de tu gusto en la galería"
      );
    } else {
      const newState = [...props.buyState];
      newState.push({
        art: selectedArt,
        product: selectedItem,
        quantity: 1,
      });
      console.log("newState else", newState);
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      setOpen(true);
      setMessage("¡Item agregado! Puedes ir al carrito de compras");
    }
  };

  return (
    <>

      <div className={styles['prix-product-container']}>

      
        <div className={styles['first-row']}>
          <div className={styles['first-row-title-container']}>
            <div className={styles['product-title']}>
              {product?.name}
            </div>
            <div
              className={styles['price-selected']}
            >
              {
                currency + " " + product.price
              }
            </div>
          </div>
          <div className={styles['first-row-buttons-container']}>
            <div className={styles['button-wrapper']}>
              <Button
                variant="outlined"
                className={styles['share-button']}
                onClick={(e) => {
                  window.open(utils.generateWaProductMessage(product), "_blank");
                }}
              >
                <ShareIcon className={styles['share-icon']} /> Compartir
              </Button>
            </div>
            <div className={styles['button-wrapper']}>
              <Button
                className={
                  selectedArt === undefined
                    ? styles['add-button-disabled']
                    : styles['add-button-enabled']
                }
                disabled={selectedArt === undefined}
                onClick={addItemToBuyState}
              >
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>

        <div className={styles['main-content']}>
          {/* Left Side - Carusel e Info */}
          <div className={styles['left-side']}>
            {/* Carousel Container */}
            <div className={styles['carousel-wrapper']}>
              <ProductCarousel product={product} selectedArt={selectedArt} selectedItem={selectedItem} type="withImages" />
            </div>
            <div className={styles['info-accordion-wrapper']}>
              {/* First Accordion - General Description */}
              <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                <Typography className={styles['accordion-title']}> Descripción </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MDEditor.Markdown
                    whiteSpace= "pre-wrap"
                    source={generalDescription || "No description available."}
                    className={styles['markdown-content']}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Second Accordion - Technical Specification */}
              <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                <Typography className={styles['accordion-title']}> Especificación Técnica </Typography>
                </AccordionSummary>
                <AccordionDetails className={styles['accordion-details']}>
                  <MDEditor.Markdown
                    whiteSpace= "pre-wrap"
                    source={technicalSpecification || "No technical specifications available."}
                    className={styles['markdown-content']}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Third Accordion - Observations */}
              <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                >
                <Typography className={styles['accordion-title']}> Observaciones </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MDEditor.Markdown
                    whiteSpace= "pre-wrap"
                    source={product?.observations || "No observations available."}
                    className={styles['markdown-content']}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          </div>

          {/* Right Side - Gallery */}
          <div className={styles['right-side']}>
            <div className={styles['rightSide-top']}>
              <h2>Selecciona:</h2>
              <div
                className={`${styles['attributes-container']} ${
                  product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
                }`}
              >
                {
                  product?.attributes?.map((att, iAtt, attributesArr) =>
                    <div key={iAtt} style={{ width: "45%" }}>
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
                          name={att.name}
                          value={product?.selection[att.name] || ''}
                          onChange={handleSelection}
                          label={att.name}
                        >
                          <MenuItem value="">
                            <em>Selecciona una opción</em>
                          </MenuItem>

                          {getFilteredOptions(att, iAtt).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  )
                }
              </div>
            </div>
            <div className={styles['right-side-bottom']}>
              <h2>Elige el arte:</h2>
              <div className={styles['art-selection-container']}>
                <div className={styles['art-grid-wrapper']}>
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

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}