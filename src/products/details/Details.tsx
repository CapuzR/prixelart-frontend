import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import ReactGA from "react-ga";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { getPriceWithSelectedVariant, formatPrice, prepareProductData } from "../services";
import { splitDescription } from "../utils";

import { fetchProductDetails } from '../api';

import Portrait from "./views/Portrait";
import Landscape from "./views/Landscape";

import { CartItem, Product } from '../interfaces';
import { getUrlParams } from "./services";

ReactGA.initialize("G-0RWP9B33D8");

interface Props {
  buyState: CartItem[];
  setBuyState: (cart: CartItem[]) => void;
  setFullArt: (art: any) => void;
  fullArt: any;
  setSearchResult: (result: any) => void;
  searchResult: any;
}

const Details: React.FC<Props> = (props) => {
  const { setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  
  const history = useHistory();
  const productId = new URLSearchParams(window.location.search).get("producto");

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(undefined);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [expanded, setExpanded] = useState<string | false>("panel1");
  
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
      setWindowHeight(window.innerHeight)
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { generalDescription, technicalSpecification } = splitDescription(product?.description);
  

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    const newSelection = product?.selection && { ...product?.selection };
    e.target.name && (newSelection[e.target.name] = e.target.value as number);
    setProduct((prevProduct) => ({
      ...prevProduct,
      selection: newSelection,
    }));
  };

  const getFilteredOptions = (att: { name: string; value: string[] }) => {
    
    if (Object.values(product?.selection).every((s) => s.value === "") ||
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

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(productId);
        const { product, selectedItem } = prepareProductData(productData);
        setProduct({...product, productId: productId});
        setSelectedItem({...selectedItem, price: product?.price});
      } catch (error) {
        console.error("Error fetching product attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);
  
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      const updatedPrice = product?.selection && Object.keys(product?.selection).every((s) => s !== "")
        ? await getPriceWithSelectedVariant(product?.priceRange, currency, conversionRate, product?.selection, product?.variants)
        : formatPrice(product?.priceRange, currency, conversionRate);
        
        const numericPrice = typeof updatedPrice === 'string'
          ? Math.round(parseFloat(updatedPrice.replace(',', '.')) * 100) / 100
          : Math.round(updatedPrice * 100) / 100;

      setProduct((prevProduct) => ({
        ...prevProduct,
        price: numericPrice
      }));
      setSelectedItem((prevSelectedProduct) => ({
        ...prevSelectedProduct,
        price: updatedPrice,
        //Esto está acá solo por el carrito, hay que volárselo..
        //Considerar qué pasa si el user metió todo en el carrito y de repente inicia sesión como Prixer.
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
  
  }, [product?.selection, currency, conversionRate]);

//TO DO: CART. Esto no debería ir acá. Todo debería estar en el Cart, que QUIZÁS debería ser un Context.
  const addItemToBuyState = () => { 
      const newState = [...props.buyState];
      newState.push({
        product: selectedItem,
        quantity: 1,
      });
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      showSnackBar("¡Producto agregado!");
    history.push({
      pathname: "/shopping",
    })
  };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {
      isPortrait ? (
        <Portrait
          product={product}
          addItemToBuyState={addItemToBuyState}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          selectedItem={selectedItem}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          fullArt={props.fullArt}
          setFullArt={props.setFullArt}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
        />
      ) : (
        <Landscape
          product={product}
          addItemToBuyState={addItemToBuyState}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          selectedItem={selectedItem}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          fullArt={props.fullArt}
          setFullArt={props.setFullArt}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
        />
      )}
    </div>
  );
};

export default Details;