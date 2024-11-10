import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";

import ReactGA, { set } from "react-ga";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useBackdrop, useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { getSelectedVariant, prepareProductData } from "products/services";

import { fetchProductDetails, fetchVariantPrice } from 'products/api';
import { fetchArtDetails } from 'art/api';

import Portrait from "flow/views/Portrait";
import Landscape from "flow/views/Landscape";

import { Item, PickedProduct, PickedArt, Product, Art } from './interfaces';
import { queryCreator, getUrlParams } from "./utils";
import { parsePrice } from "utils/formats";
import { useCart } from "context/CartContext"; 
import { debounce } from "utils/util";
import { checkPermissions } from "./services";

ReactGA.initialize("G-0RWP9B33D8");


const Flow = () => {
  const [item, setItem] = useState<Item>({
    sku: undefined,
    product: undefined,
    art: undefined,
    price: undefined,
    discount: undefined
  });

  const [flowReady, setFlowReady] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);

  const history = useHistory();
  const { setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  const { backdropOpen, showBackdrop, closeBackdrop } = useBackdrop();
  const { cart, addOrUpdateItemInCart } = useCart();

  const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const isUpdate = cart.lines.some((l)=> l.id === urlParams.lineId);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    debouncedCheckPermissions(item.product, item.art);
}, [item.product, item.art]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        let fetchedProduct = undefined;
        let selectedProduct = undefined;
        let selectedArt = undefined;
        let atts = {};

        if (urlParams.producto) {
          fetchedProduct = await fetchProductDetails(urlParams.producto)
          selectedProduct = prepareProductData(fetchedProduct)
        };

        urlParams.arte &&
          (selectedArt = await fetchArtDetails(urlParams.arte));
        
        const selectedAttributes = getUrlParams(["producto", "arte", "step", "itemId", "openSection", "lineId"]);

        selectedAttributes &&
          selectedAttributes.map(att => {
            atts[att.name] = att.value;
          });

        setItem({
          sku: urlParams.itemId,
          product: selectedProduct ? {
            ...selectedProduct,
            id: urlParams.producto,
            selection: atts || undefined,
          } : undefined,
          art: selectedArt || undefined,
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
  }, [urlParams.producto, urlParams.arte]);
  
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      if(item.product?.selection && Object.keys(item.product?.selection).every((s) => item.product?.selection[s] !== '')) {
        const selectedVariant = getSelectedVariant(item.product?.selection, item.product?.variants);
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id, item.art?.artId);
          const parsedPrice = parsePrice(updatedPrice);

          setItem((prevItem)=>({
            ...prevItem,
            price: parsedPrice
          }))
        }
      } else {
        setItem((prevItem)=>({
          ...prevItem,
          price: undefined
        }))
      }
    };
    fetchAndSetPrice();
  }, [JSON.stringify(item.product?.selection), currency, conversionRate, item.art?.artId]);

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

  const handleCart = (item : Item) => {
      addOrUpdateItemInCart(item, 1, urlParams.lineId);
    
    showSnackBar("Item added in the cart");
    closeBackdrop();
    history.push("/shopping");
  };
  
  const handleDeleteElement = (type: 'producto' | 'arte', item: Item) => {
    // TO DO: Esto del selectionObject + QueryString + push debería agruparse de alguna manera...se utiliza mucho.
    const selectionAsObject: { [key: string]: string } = Array.isArray(item.product?.selection)
        ? item.product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (item.product?.selection || {});
        
        type === 'arte' ? (
          setItem((prevItem)=>({
            ...prevItem,
            art: undefined
          }))
        ) : (
          setItem((prevItem)=>({
            ...prevItem,
            product: undefined
          }))
        );

    const queryString = queryCreator(
      urlParams.lineId,
      item.sku,
      type == 'producto' ? undefined : item.product?.id,
      type == 'arte' ? undefined : item.art?.artId,
      selectionAsObject,
      type === 'producto' ? 'producto' : 'arte',
      '3'
    );
    
    history.push({ pathname: location.pathname, search: queryString });
  };

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    let openSection : 'producto' | 'arte' = 'producto';
    const newSelection = item.product?.selection && { ...item.product?.selection };
    e.target.name && (newSelection[e.target.name] = e.target.value as number);

    setItem((prevItem) => ({
      ...prevItem,
      product: {
        ...prevItem?.product,
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
    Object.values(newSelection).length === item.product?.attributes?.length && 
    !item.art?.artId &&
      (openSection = 'arte');
        
    const queryString = queryCreator(
      urlParams.lineId,
      item.sku,
      item.product?.id,
      item.art?.artId,
      selectionAsObject,
      openSection,
      '3'
    );
    history.push({ pathname: location.pathname, search: queryString });
  };

  const getFilteredOptions = (att: { name: string; value: string[] }) => {
    if (Object.values(item.product?.selection).every((s) => s.value === "") ||
    !Object.keys(item.product?.selection).some((key) => key !== att.name && item.product?.selection[key] !== "")) {
      return att.value || [];
    }
    return Object.keys(item.product?.selection)
    .filter((key) => {
      if (key !== att.name && item.product?.selection[key] !== "") {
        return att.value;
    }})
    .map((key) => {
      return item.product?.variants?.filter((variant) => { return variant.attributes?.some(
          (a) => a.name === key && a.value === item.product?.selection[key]
      )})
      ?.map((vari) => {
        return vari.attributes?.filter((a) => a.name === att.name)[0].value;
      });
    })
    .flat();
  };
  
  const handleFlow = (type : 'producto' | 'arte') => {
    const lineId = urlParams.lineId;
    const selectionAsObject: { [key: string]: string } = Array.isArray(item.product?.selection)
      ? item.product?.selection.reduce((acc, sel, index) => {
          acc[`selection-${index}`] = String(sel);
          return acc;
        }, {} as { [key: string]: string })
      : (item.product?.selection || {});

    const queryString = queryCreator(
        lineId,
        item.sku,
        item.product?.id,
        item.art?.artId,
        selectionAsObject,
        type,
        '1'
    );
    
    history.push({ pathname: '/flow', search: queryString });
};

  const addInFlow = (updatedArt?: Art, updatedProduct?: Product) => {
    const openSection : 'arte' | 'producto' = urlParams.openSection === 'arte' ? 'producto' : 'arte';
    setItem((prevItem) => ({
      ...prevItem,
      id: urlParams.itemId,
      product: updatedProduct ? updatedProduct : undefined,
      art: updatedArt ? updatedArt : undefined,
    }));

    const selectionAsObject: { [key: string]: string } = Array.isArray(item.product?.selection)
        ? item.product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (item.product?.selection || {});
        
    const queryString = queryCreator(
      urlParams.lineId,
      urlParams.itemId,
      updatedProduct?.id || item.product?.id,
      updatedArt?.artId || item.art?.artId,
      updatedProduct ? undefined : selectionAsObject,
      !flowReady ? openSection : updatedArt ? 'arte' : 'producto',
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
          isUpdate={isUpdate}
          itemId={urlParams.itemId}
          handleCart={handleCart}
          getFilteredOptions={getFilteredOptions}
          handleSelection={handleSelection}
          handleDeleteElement={handleDeleteElement}
          addInFlow={addInFlow}
          openSection={urlParams.openSection}
          flowReady={flowReady}
          handleFlow={handleFlow}
        />
      {/* )} */}
    </>
  );
};

export default Flow;