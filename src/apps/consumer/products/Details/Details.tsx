import React, { useState, useEffect } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';

import ReactGA from 'react-ga';
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { useCart } from 'context/CartContext';
import { prepareProductData, getSelectedVariant } from '../services';
import { fetchVariantPrice } from '../api';
import { parsePrice } from 'utils/formats';
import { splitDescription } from '../utils';

import { fetchProductDetails } from '../api';

import Portrait from './views/Portrait';
import Landscape from './views/Landscape';

import { Item, Product } from '../interfaces';
import { queryCreator, getUrlParams } from 'apps/consumer/flow/utils';

ReactGA.initialize('G-0RWP9B33D8');

const Details = () => {
  const history = useHistory();
  const { loading, setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { id } = useParams();
  const location = useLocation();

  const urlParams = Object.fromEntries(new URLSearchParams(location.search).entries());

  const [product, setProduct] = useState<Product | null>(null);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const description = splitDescription(product?.description);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(id);
        const product = prepareProductData(productData);

        const selectedAttributes = getUrlParams([]);

        setProduct({
          ...product,
          id,
          selection: selectedAttributes,
        });
      } catch (error) {
        console.error('Error fetching product attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchAndSetPrice = async () => {
      if (
        product?.selection &&
        Object.keys(product?.selection).every((s) => product?.selection[s] !== '')
      ) {
        const selectedVariant = getSelectedVariant(product?.selection, product?.variants);

        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id);
          const parsedPrice = parsePrice(updatedPrice);

          setProduct((prevProduct) => ({
            ...prevProduct,
            price: parsedPrice,
          }));
        }
      }
    };
    fetchAndSetPrice();
  }, [product?.selection, currency, conversionRate]);

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    const { name, value } = e.target;
    if (!name) return;

    setProduct((prevProduct) => ({
      ...prevProduct,
      id,
      selection: {
        ...prevProduct?.selection,
        [name]: value,
      },
    }));

    //TO DO: Refactor this. La tortura de los query params
    const searchParams = new URLSearchParams(window.location.search);
    product.selection &&
      product.selection !== undefined &&
      Object.keys(product.selection).forEach((attrKey) => {
        searchParams.set(attrKey, product.selection[attrKey]);
      });

    searchParams.set(name, String(value));

    history.push({
      pathname: `/producto/${id}`,
      search: searchParams.toString(),
    });
  };

  function handleArtSelection(): void {
    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
      ? product?.selection.reduce(
          (acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          },
          {} as { [key: string]: string }
        )
      : product?.selection || {};

    const queryString = queryCreator(
      undefined,
      undefined,
      id,
      undefined,
      selectionAsObject || undefined,
      Object.values(selectionAsObject).every((s) => typeof s === 'string' && s !== '')
        ? 'arte'
        : 'producto',
      '1'
    );

    history.push({ pathname: '/flow', search: queryString });
  }

  // const handleSaveProduct = async () => {
  //   addItemToCart({ product, art: undefined, quantity: 1 });
  // };

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<object>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {isPortrait ? (
        <Portrait
          product={product}
          handleChange={handleChange}
          handleSelection={handleSelection}
          expanded={expanded}
          description={description}
          handleArtSelection={handleArtSelection}
          // handleSaveProduct={handleSaveProduct}
        />
      ) : (
        <Landscape
          product={product}
          handleChange={handleChange}
          handleSelection={handleSelection}
          expanded={expanded}
          description={description}
          handleArtSelection={handleArtSelection}
          // handleSaveProduct={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default Details;
