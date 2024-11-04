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

import { CartItem, PickedProduct, PickedArt, Product, Art, Item } from './interfaces';
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
  const { backdropOpen, showBackdrop, closeBackdrop } = useBackdrop();
  const { cart } = useCart();
  const { addItemToCart, updateItemInCart } = useCart();
  
  const history = useHistory();
  const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  console.log("FLOW -> useEffect -> urlParams", urlParams);

  const [item, setItem] = useState<Item | undefined>(undefined);
  const [flow, setFlow] = useState<{ flowReady: boolean } | undefined>(undefined);

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
  const searchParams = new URLSearchParams(window.location.search);
  const isUpdate = cart.some((i)=> i.id === itemId);
  
  const debouncedCheckPermissions = useCallback(
    debounce((product: PickedProduct, selectedArt: PickedArt) => {
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
      debouncedCheckPermissions(item?.product, item?.art);
  }, [item?.product, item?.art]);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //TO DO: Todo debería ir dentro de un item (?)
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        let fetchedProduct = undefined;
        let selectedProduct = undefined;
        let selectedArt = undefined;
        let atts = {};

        if (urlParams.producto) {
          fetchedProduct = await fetchProductDetails(productId)
          selectedProduct = prepareProductData(fetchedProduct)
        };
        artId &&
          (selectedArt = await fetchArtDetails(artId));

        selectedAttributes &&
          selectedAttributes.map(att => {
            atts[att.name] = att.value;
          })

        setItem({
          id: urlParams.itemId,
          product: selectedProduct ?{
            ...selectedProduct,
            id: urlParams.producto,
            selection: atts || undefined,
          } : undefined,
          art: selectedArt ? selectedArt : undefined,
          price: undefined,
          discount: undefined
        })
      } catch (error) {
        console.error("Error fetching product attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [productId, artId]);
  
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      if(product?.selection && Object.keys(product?.selection).every((s) => product?.selection[s] !== '')) {
        const selectedVariant = getSelectedVariantPrice(product?.selection, product?.variants);
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id, selectedArt?.artId);
          const parsedPrice = parsePrice(updatedPrice);

          setItem((prevItem)=>({
            ...prevItem,
            price: parsedPrice
          }))
        }
      } 
    };
    fetchAndSetPrice();
  }, [JSON.stringify(item?.product?.selection), currency, conversionRate, item?.art?.artId]);

  const handleCart = (item : Item) => {
    isUpdate ? 
      updateItemInCart(item) : 
      addItemToCart({ product: item.product, art: item.art, quantity: undefined });
    
    showSnackBar("Item added in the cart");
    closeBackdrop();
    history.push("/shopping");
  };
  
  const handleDeleteElement = (type: 'producto' | 'arte', item: CartItem) => {
    // TO DO: Esto del selectionObject + QueryString + push debería agruparse de alguna manera...se utiliza mucho.
    const selectionAsObject: { [key: string]: string } = Array.isArray(item?.product?.selection)
        ? item?.product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (item?.product?.selection || {});
        
        type === 'arte' ? (
          setSelectedArt(undefined)
        ) : (
          setProduct(undefined)
        );

    const queryString = queryCreator(
      item?.id,
      type == 'producto' ? undefined : item?.product?.id,
      type == 'arte' ? undefined : item?.art?.artId,
      selectionAsObject,
      'producto',
      '3'
    );
    
    history.push({ pathname: location.pathname, search: queryString });
  };

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    let openSection : 'producto' | 'arte' = 'producto';
    const newSelection = item?.product?.selection && { ...item?.product?.selection };
    e.target.name && (newSelection[e.target.name] = e.target.value as number);
    setItem((prevItem) => ({
      ...prevItem,
      product: {
        ...prevItem.product,
        selection: newSelection,
      },
    }));

    const selectionAsObject = Array.isArray(newSelection)
        ? newSelection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (newSelection || {});

    Object.values(newSelection).every((s) => typeof s === "string" && s !== "") && 
    Object.values(newSelection).length === item?.product?.attributes?.length && 
    !item?.art?.artId &&
      (openSection = 'arte');
        
    const queryString = queryCreator(
      item?.id,
      item?.product?.id,
      item?.art?.artId,
      selectionAsObject,
      openSection,
      '3'
    );
    history.push({ pathname: location.pathname, search: queryString });
  };

  const getFilteredOptions = (att: { name: string; value: string[] }) => {
    if (Object.values(item?.product?.selection).every((s) => s.value === "") ||
    !Object.keys(item?.product?.selection).some((key) => key !== att.name && item?.product?.selection[key] !== "")) {
      return att.value || [];
    }
    
    return Object.keys(item?.product?.selection)
    .filter((key) => {
      if (key !== att.name && item?.product?.selection[key] !== "") {
        return att.value;
    }})
    .map((key) => {
      return item?.product?.variants?.filter((variant) => { return variant.attributes?.some(
          (a) => a.name === key && a.value === item?.product?.selection[key]
      )})
      ?.map((vari) => {
        return vari.attributes?.filter((a) => a.name === att.name)[0].value;
      });
    })
    .flat();
  };
  
  const addInFlow = (updatedArt?: Art, updatedProduct?: Product) => {
    setItem((prevItem) => ({
      ...prevItem,
      id: urlParams.itemId,
      product: updatedProduct ? updatedProduct : undefined,
      art: updatedArt ? updatedArt : undefined,
    }));

    const selectionAsObject: { [key: string]: string } = Array.isArray(item?.product?.selection)
        ? item?.product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (item?.product?.selection || {});
        
    const queryString = queryCreator(
      itemId,
      updatedProduct?.id || item?.product?.id,
      updatedArt?.artId || item?.art?.artId,
      updatedProduct ? undefined : selectionAsObject,
      updatedArt ? 'arte' : 'producto',
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
          item={item}
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
