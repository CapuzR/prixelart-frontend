import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";

import ReactGA, { set } from "react-ga";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useBackdrop, useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { getSelectedVariantPrice, prepareProductData } from "products/services";

import { fetchProductDetails, fetchVariantPrice } from 'products/api';
import { fetchArtDetails } from 'art/api';

import Portrait from "flow/views/Portrait";
import Landscape from "flow/views/Landscape";

import { CartItem, PickedProduct, PickedArt, Product, Art } from './interfaces';
import { queryCreator, getUrlParams } from "./utils";
import { parsePrice } from "utils/formats";
import { useCart } from "context/CartContext"; 
import { debounce } from "utils/util";
import { checkPermissions } from "./services";

ReactGA.initialize("G-0RWP9B33D8");

//TO DO: Revisar todos los props y validar que las funciones no tengan código redudante.
interface Props {
  setFullArt: (art: any) => void;
  fullArt: any;
  setSearchResult: (result: any) => void;
  searchResult: any;
}

const Flow: React.FC<Props> = (props) => {
  const { setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  const { backdropOpen, showBackdrop } = useBackdrop();
  const { cart } = useCart();
  const { addItemToCart, updateItemInCart } = useCart();
  
  const history = useHistory();

  //TO DO: Todo esto debería estar dentro de ITEM!!!
  const itemId = new URLSearchParams(window.location.search).get("itemId");
  const productId = new URLSearchParams(window.location.search).get("producto");
  const artId = new URLSearchParams(window.location.search).get("arte");
  const openSection = new URLSearchParams(window.location.search).get("openSection");
  const selectedAttributes = getUrlParams(["producto", "arte", "step", "itemId", "openSection"]);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedArt, setSelectedArt] = useState<any>(undefined);
  const [flowReady, setFlowReady] = useState(false);

  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [expanded, setExpanded] = useState<string | false>(false);
  const searchParams = new URLSearchParams(window.location.search);
  const isUpdate = cart.some((i)=> i.id === itemId);
  

  //Create a useEffect that check if product, and selectedArt are not undefined...
  //Also checks if the product has all its attributes selected (using .every)
  //If all those conditions are met, set flowReady to true.

  const debouncedCheckPermissions = useCallback(
    debounce((product: Product | null, selectedArt: string | null) => {
      const hasPermission = checkPermissions(product, selectedArt);
      if (hasPermission) {
        setFlowReady(true);
        if (!backdropOpen) showBackdrop();
      } else {
        setFlowReady(false);
      }
    }, 300),
    [showBackdrop, backdropOpen]
  );

  useEffect(() => {
    debouncedCheckPermissions(product, selectedArt);
  }, [product, selectedArt]);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id, selectedArt?.artId);
          const parsedPrice = parsePrice(updatedPrice);

          setProduct((prevProduct) => ({
            ...prevProduct,
            price: parsedPrice
          }));
        }
      } else {
        product &&
        setProduct((prevProduct) => ({
          ...prevProduct,
          price: undefined
        }));
      }
    };
    fetchAndSetPrice();
  }, [JSON.stringify(product?.selection), currency, conversionRate, selectedArt?.artId]);

  const handleCart = (product?: Product, art?: PickedArt, quantity?: number) => {
    isUpdate ? 
      updateItemInCart({ id : itemId, product, art, quantity }) : 
      addItemToCart({ product, art, quantity });
    
    showSnackBar("Item added in the cart");
    history.push("/shopping");
  };
  
  const handleDeleteElement = (type: 'producto' | 'arte', item: CartItem) => {
    // TO DO: Esto del selectionObject + QueryString + push debería agruparse de alguna manera...se utiliza mucho.
    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});
          console.log("HANDLE DELETE ELEMENT");
        type === 'arte' ? (
          setSelectedArt(undefined)
        ) : (
          setProduct(undefined)
        );

    const queryString = queryCreator(
      itemId,
      type == 'producto' ? undefined : product?.id,
      type == 'arte' ? undefined : selectedArt?.artId,
      selectionAsObject,
      'producto',
      '3'
    );
    
    history.push({ pathname: location.pathname, search: queryString });
  };

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    let openSection : 'producto' | 'arte' = 'producto';
    const newSelection = product?.selection && { ...product?.selection };
    e.target.name && (newSelection[e.target.name] = e.target.value as number);
    setProduct((prevProduct) => ({
      ...prevProduct,
      selection: newSelection,
    }));

    const selectionAsObject = Array.isArray(newSelection)
        ? newSelection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (newSelection || {});

    Object.values(newSelection).every((s) => typeof s === "string" && s !== "") && 
    Object.values(newSelection).length === product?.attributes.length && 
    !selectedArt?.artId &&
      (openSection = 'arte');
        
    const queryString = queryCreator(
      itemId,
      product?.id,
      selectedArt?.artId,
      selectionAsObject,
      openSection,
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
  
  const addInFlow = (updatedArt?: Art, updatedProduct?: Product) => {
    updatedArt && setSelectedArt(updatedArt);
    updatedProduct && setProduct(updatedProduct);

    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});
        
    const queryString = queryCreator(
      itemId,
      updatedProduct?.id || product?.id,
      updatedArt?.artId || selectedArt?.artId,
      updatedProduct ? undefined : selectionAsObject,
      updatedArt ? 'arte' : 'producto',
      '3'
    );
  
    history.push({ pathname: location.pathname, search: queryString });
    showSnackBar("¡Arte seleccionado! Puedes agregar el item al carrito");
  };
  
  return (
    <>
    {console.log("FLOW -> useEffect -> flowReady", flowReady)}
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
          addInFlow={addInFlow}
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
          itemId={itemId}
          product={product}
          selectedArt={selectedArt}
          handleCart={handleCart}
          getFilteredOptions={getFilteredOptions}
          handleSelection={handleSelection}
          handleDeleteElement={handleDeleteElement}
          addInFlow={addInFlow}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
          openSection={openSection}
          flowReady={flowReady}
        />
      {/* )} */}
    </>
  );
};

export default Flow;
