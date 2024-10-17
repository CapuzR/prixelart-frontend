import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import ReactGA from "react-ga";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { getPriceWithSelectedVariant, formatPrice, splitDescription, prepareProductData } from "../services";

import { fetchProductDetails } from '../api';
import { fetchArtDetails } from 'gallery/api';

import Portrait from "./views/Portrait";
import Landscape from "./views/Landscape";

import Product from '../interfaces';
import { CartItem } from '../apiInterfaces';
import { queryCreator, getUrlParams } from "./services";

ReactGA.initialize("G-0RWP9B33D8");

interface Props {
  buyState: CartItem[];
  setBuyState: (state: any[]) => void;
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
  const artId = new URLSearchParams(window.location.search).get("arte");
  const selectedAttributes = getUrlParams(["producto", "arte", "step"]);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(undefined);
  const [selectedArt, setSelectedArt] = useState<any>(undefined);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [expanded, setExpanded] = useState<string | false>(false);
  const searchParams = new URLSearchParams(window.location.search);
  
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
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
    console.log("buyState", props.buyState);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(productId);
        const { product, selectedItem } = prepareProductData(productData);
        selectedAttributes ? 
          setProduct({...product, productId: productId, selection: selectedAttributes.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})}) :
          setProduct({...product, productId: productId});
        setSelectedItem({...selectedItem, price: product?.price});
      } catch (error) {
        console.error("Error fetching product attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchArt = async () => {
      try {
        if (artId) {
          const art = await fetchArtDetails(artId);
          setSelectedArt(art);
        }
      } catch (error) {
        console.error("Error fetching selected art:", error);
      };
    };

    fetchProduct();
    artId && fetchArt();
  }, [productId, artId]);
  
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      const updatedPrice = product?.selection && Object.keys(product?.selection).every((s) => s !== "")
        ? await getPriceWithSelectedVariant(product?.priceRange, currency, conversionRate, product?.selection, product?.variants, selectedArt)
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
  
  }, [product?.selection, selectedArt, currency, conversionRate]);

  const addArt = (selectedArt) => {
    setSelectedArt(selectedArt);

    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});

    const queryString = queryCreator(
      product?.productId,
      selectedArt?.artId,
      selectionAsObject,
      '3'
    );
  
    history.push({ pathname: location.pathname, search: queryString });
    showSnackBar("¡Arte seleccionado! Puedes agregar el item al carrito");
  };
//TO DO: CART. Esto no debería ir acá. Todo debería estar en el Cart, que QUIZÁS debería ser un Context.
  const addItemToBuyState = () => { 
    if (selectedArt === undefined) {
      const newState = [...props.buyState];
      newState.push({
        product: selectedItem,
        quantity: 1,
      });
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      showSnackBar("¡Producto agregado!");
    } else {
      const newState = [...props.buyState];
      newState.push({
        art: selectedArt,
        product: selectedItem,
        quantity: 1,
      });
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      showSnackBar("¡Producto agregado!");
    }
    history.push({
      pathname: "/shopping",
    })
  };

  return (
    <>
      {
      isPortrait ? (
        <Portrait
          product={product}
          selectedArt={selectedArt}
          setSelectedArt={setSelectedArt}
          addItemToBuyState={addItemToBuyState}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          addArt={addArt}
          selectedItem={selectedItem}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          fullArt={props.fullArt}
          setFullArt={props.setFullArt}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
        />
      ) : (
        <Landscape
          product={product}
          selectedArt={selectedArt}
          setSelectedArt={setSelectedArt}
          addItemToBuyState={addItemToBuyState}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          addArt={addArt}
          selectedItem={selectedItem}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          fullArt={props.fullArt}
          setFullArt={props.setFullArt}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
        />
      )}
    </>
  );
};

export default Details;
