import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import ReactGA from "react-ga";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { getSelectedVariantPrice, prepareProductData } from "products/services";
  import { splitDescription } from "products/utils";

import { fetchProductDetails, fetchVariantPrice } from 'products/api';
import { fetchArtDetails } from 'art/api';

import Portrait from "flow/views/Portrait";
import Landscape from "flow/views/Landscape";

import { CartItem, PickedProduct, PickedArt, Product } from './interfaces';
import { queryCreator, getUrlParams } from "./utils";
import { parsePrice } from "utils/formats";
import { useCart } from "context/CartContext"; 

ReactGA.initialize("G-0RWP9B33D8");

interface Props {
  setFullArt: (art: any) => void;
  fullArt: any;
  setSearchResult: (result: any) => void;
  searchResult: any;
  openSection: string;
}

const Flow: React.FC<Props> = (props) => {
  const { setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  const { cart } = useCart();
  
  const history = useHistory();
  const itemId = new URLSearchParams(window.location.search).get("itemId");
  const productId = new URLSearchParams(window.location.search).get("producto");
  const artId = new URLSearchParams(window.location.search).get("arte");
  const selectedAttributes = getUrlParams(["producto", "arte", "step", "itemId", "openSection"]);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedArt, setSelectedArt] = useState<any>(undefined);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [expanded, setExpanded] = useState<string | false>(false);
  const searchParams = new URLSearchParams(window.location.search);
  const isUpdate = cart.some((i)=> i.id === itemId);
  
  const { addItemToCart, updateItemInCart } = useCart();

  const handleCart = (product?: Product, art?: PickedArt, quantity?: number) => {
    isUpdate ? 
      updateItemInCart({ id : itemId, product, art, quantity }) : 
      addItemToCart({ product, art, quantity });
    
    showSnackBar("Item added in the cart");
    history.push("/shopping");
  };

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
    
    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});

    const queryString = queryCreator(
      undefined,
      product?.id,
      selectedArt?.artId,
      { ...selectionAsObject, [e.target.name]: String(e.target.value) },
      'product',
      '3'
    );
    history.push({ pathname: location.pathname, search: queryString });
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
  //TO DO: Eliminar
  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  //TO DO: Todo debería ir dentro de un item (?)
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(productId);
        const product= prepareProductData(productData);
        selectedAttributes ? 
          setProduct({...product, id: productId, selection: selectedAttributes.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})}) :
          setProduct({...product, id: productId});
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
      if(product?.selection && Object.keys(product?.selection).every((s) => product?.selection[s] !== '')) {
        const selectedVariant = getSelectedVariantPrice(product?.selection, product?.variants);
        console.log("selectedVariant", selectedVariant);
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id, selectedArt?.artId);
          console.log("updatedPrice", updatedPrice);
          const parsedPrice = parsePrice(updatedPrice);

          setProduct((prevProduct) => ({
            ...prevProduct,
            price: parsedPrice
          }));
        }
      }
    };
    fetchAndSetPrice();
  }, [product?.selection, currency, conversionRate]);

  const addArt = (selectedArt) => {
    setSelectedArt(selectedArt);

    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});

    const queryString = queryCreator(
      undefined,
      product?.id,
      selectedArt?.artId,
      selectionAsObject,
      'art',
      '3'
    );
  
    history.push({ pathname: location.pathname, search: queryString });
    showSnackBar("¡Arte seleccionado! Puedes agregar el item al carrito");
  };
  
  return (
    <>
      {/* {
      isPortrait ? (
        <Portrait
          product={product}
          selectedArt={selectedArt}
          setSelectedArt={setSelectedArt}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          addArt={addArt}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
          openSection={props.openSection}
        />
      ) : ( */}
        <Landscape
          product={product}
          selectedArt={selectedArt}
          setSelectedArt={setSelectedArt}
          isUpdate={isUpdate}
          handleCart={handleCart}
          getFilteredOptions={getFilteredOptions}
          handleChange={handleChange}
          handleSelection={handleSelection}
          addArt={addArt}
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
          openSection={props.openSection}
        />
      {/* )} */}
    </>
  );
};

export default Flow;
