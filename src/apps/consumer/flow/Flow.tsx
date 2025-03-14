import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ReactGA from 'react-ga';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useConversionRate, useCurrency, useLoading, useSnackBar, } from 'context/GlobalContext';
import { getSelectedVariant } from 'apps/consumer/products/services';

import { fetchProductDetails, fetchVariantPrice } from 'apps/consumer/products/api';
import { fetchArt } from 'apps/consumer/art/api';

import Landscape from 'apps/consumer/flow/views/Landscape';

import { Item, Art, Product } from './interfaces';
import { queryCreator } from './utils';
import { parsePrice } from 'utils/formats';
import { useCart } from 'context/CartContext';
import { checkPermissions } from './services';
import { getUrlParams } from '@utils/util';
import { url } from 'inspector';

ReactGA.initialize('G-0RWP9B33D8');

const Flow = () => {
  const [item, setItem] = useState<Partial<Item>>({});

  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  const { cart, addOrUpdateItemInCart } = useCart();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const location = useLocation();

  const urlParams = Object.fromEntries(new URLSearchParams(location.search).entries());
  const isUpdate = cart.lines.some((l) => l.id === urlParams.lineId);

  const isItemReady = Boolean(urlParams.producto && urlParams.arte);

  useEffect(() => {
    !urlParams.producto && !urlParams.arte && navigate('/');
  }, [urlParams, navigate]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        let selectedProduct = undefined;
        let selectedArt = undefined;
        const atts: Record<string, string> = {};

        if (urlParams.producto) {
          selectedProduct = await fetchProductDetails(urlParams.producto);
        }

        if (urlParams.arte) {
          selectedArt = await fetchArt(urlParams.arte);
        }

        console.log('Fetched art from API:', selectedArt);
        const selectedAttributes = getUrlParams([
          'producto',
          'arte',
          'itemId',
          'lineId',
        ]);

        Array.from(selectedAttributes.entries()).map(([key, value]) => {
          atts[key] = value;
        });

        setItem((prevItem) => ({
          ...prevItem,
          sku: urlParams.producto,
          product: selectedProduct
            ? {
              ...selectedProduct,
              id: urlParams.producto,
              selection: Object.entries(atts).map(([name, value]) => ({ name, value })),
            }
            : prevItem.product,
          art: selectedArt || prevItem.art,
        }));
      } catch (error) {
        console.error('Error fetching product attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [urlParams.producto, urlParams.arte]);

  useEffect(() => {
    const fetchAndSetPrice = async () => {

      const isSelectionComplete = item.product?.selection?.every(
        (sel) => sel.value !== ''
      );

      if (item.product?.selection && isSelectionComplete) {
        const selectedVariant = getSelectedVariant(item.product?.selection, item.product?.variants);
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id, urlParams.producto);
          const parsedPrice = parsePrice(updatedPrice);

          setItem((prevItem) => ({
            ...prevItem,
            price: parsedPrice,
          }));
        }
      } else {
        setItem((prevItem) => ({
          ...prevItem,
          price: undefined,
        }));
      }
    };
    fetchAndSetPrice();
  }, [JSON.stringify(item.product?.selection), currency, conversionRate, item.art?.artId]);

  const handleArtSelect = (selectedArt: Art) => {
    const newQueryString = queryCreator(
      urlParams.lineId,
      urlParams.itemId,
      urlParams.producto,
      selectedArt._id,
      undefined
    );
    navigate(`${location.pathname}?${newQueryString}`);
    showSnackBar('¡Arte seleccionado! Puedes agregar el item al carrito');
  };

  const handleProductSelect = (selectedProduct: Product) => {
    const attributes = selectedProduct.selection?.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    setSelectedProductId(selectedProduct.id);

    if (attributes) {
      const newQueryString = queryCreator(
        urlParams.lineId,
        urlParams.itemId,
        selectedProduct.id,
        urlParams.arte,
        attributes
      );
      navigate(`${location.pathname}?${newQueryString}`);
      showSnackBar('¡Producto seleccionado! Puedes agregar el item al carrito');
    }
  };

  const handleCart = (item: Item) => {
    addOrUpdateItemInCart(item, 1, urlParams.lineId);
    showSnackBar('Item added in the cart');
    navigate('/carrito');
  };

  const handleChangeElement = (type: 'producto' | 'arte', item: Item) => {

    const selectionAsObject =
      type === 'producto'
        ? {}
        : (item.product?.selection || []).reduce((acc, sel, index) => {
          acc[`selection-${index}`] = sel.value;
          return acc;
        }, {} as Record<string, string>);

    if (type === 'arte') {
      setItem((prevItem) => ({
        ...prevItem,
        art: undefined,
      }));
    } else if (type === 'producto') {
      setItem((prevItem) => ({
        ...prevItem,
        product: undefined,
        attributes: undefined,
      }));
    }
    const queryString = queryCreator(
      urlParams.lineId,
      type === 'producto' ? undefined : item.sku,
      type === 'producto' ? undefined : item.product?.id,
      type === 'arte' ? undefined : item.art?._id,
      selectionAsObject,
    );


    navigate({ pathname: location.pathname, search: queryString });
  };


  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {

    const prevSelection = item.product?.selection || [];
    const newSelection = [...prevSelection];
    const existingIndex = newSelection.findIndex((sel) => sel.name === e.target.name);

    if (existingIndex >= 0) {
      newSelection[existingIndex] = { ...newSelection[existingIndex], value: e.target.value.toString() };
    } else {
      newSelection.push({ name: e.target.name, value: e.target.value.toString() });
    }

    setItem((prevItem) => ({
      ...prevItem,
      product: prevItem.product ? { ...prevItem.product, selection: newSelection } : prevItem.product,
    }));

    const selectionAsObject = (item.product?.selection || []).reduce(
      (acc, sel, index) => {
        acc[`selection-${index}`] = sel.value;
        return acc;
      },
      {} as Record<string, string>
    );

    const queryString = queryCreator(
      urlParams.lineId,
      item.sku,
      item.product?.id,
      item.art?.artId,
      selectionAsObject,
    );

    navigate(`${location.pathname}?${queryString}`);
  };

  const getFilteredOptions = (att: { name: string; value: string[] }) => {
    const selections = item.product?.selection || [];
    if (
      selections.every((sel) => sel.value === '') ||
      !selections.some((sel) => sel.name !== att.name && sel.value !== '')
    ) {
      return att.value || [];
    }
    return selections
      .filter((sel) => sel.name !== att.name && sel.value !== '')
      .map((sel) => {
        return (
          item.product?.variants
            ?.filter((variant) =>
              variant.attributes?.some(
                (a) => a.name === sel.name && a.value === sel.value
              )
            )
            ?.map((vari) => {
              const found = vari.attributes?.find((a) => a.name === att.name);
              return found ? found.value : '';
            }) || []
        );
      })
      .flat();
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
          expanded={expanded}
          generalDescription={generalDescription}
          technicalSpecification={technicalSpecification}
          searchResult={props.searchResult}
          setSearchResult={props.setSearchResult}
          searchParams={searchParams}
          selectedProductId={selectedProductId}
        />
      ) : ( */}
      <Landscape
        item={item}
        isUpdate={isUpdate}
        itemId={urlParams.itemId}
        handleCart={handleCart}
        getFilteredOptions={getFilteredOptions}
        handleSelection={handleSelection}
        handleChangeElement={handleChangeElement}
        isItemReady={isItemReady}
        onArtSelect={handleArtSelect}
        onProductSelect={handleProductSelect}
        selectedProductId={selectedProductId}
      />
      {/* )} */}
    </>
  );
};

export default Flow;
