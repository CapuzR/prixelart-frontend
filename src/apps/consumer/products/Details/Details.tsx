import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ReactGA from 'react-ga';
import { useConversionRate, useCurrency, useLoading } from 'context/GlobalContext';
import { getSelectedVariant } from '../services';
import { fetchVariantPrice } from '../api';
import { parsePrice } from 'utils/formats';
import { splitDescription } from '../utils';

import { fetchProductDetails } from '../api';

import Portrait from './views/Portrait';
import Landscape from './views/Landscape';

import { Product } from '../interfaces';
import { queryCreator, getUrlParams } from 'apps/consumer/flow/utils';
import { SelectChangeEvent } from '@mui/material';
import { parseProduct } from '../parseApi';

ReactGA.initialize('G-0RWP9B33D8');

const Details = () => {
  const navigate = useNavigate();
  const { loading, setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { id } = useParams();

  const [product, setProduct] = useState<Product>();
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

    if (!id) {
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = parseProduct(await fetchProductDetails(id));
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
        product?.selection.every((selection) => selection.value !== '')
      ) {
        const selectedVariant = getSelectedVariant(product?.selection, product?.variants);
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant.id, id!);
          const parsedPrice = parsePrice(updatedPrice);

          setProduct((prevProduct) =>
            prevProduct
              ? { ...prevProduct, price: parsedPrice }
              : prevProduct
          );
        }
      }
    };
    fetchAndSetPrice();
  }, [product?.selection, currency, conversionRate]);

  const handleSelection = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (!name || !id) return;

    setProduct((prevProduct) => {
      if (!prevProduct) return prevProduct;

      const newSelection = Array.isArray(prevProduct.selection)
        ? prevProduct.selection.map((sel) =>
          sel.name === name ? { ...sel, value } : sel
        )
        : [];

      if (!newSelection.find((sel) => sel.name === name)) {
        newSelection.push({ name, value });
      }

      return { ...prevProduct, selection: newSelection };
    });

    const searchParams = new URLSearchParams(window.location.search);
    if (product?.selection) {
      product.selection.forEach((selection) => {
        searchParams.set(selection.name, selection.value);
      });
    }
    searchParams.set(name, String(value));
    navigate(`/producto/${id}?${searchParams.toString()}`);
  };

  function handleArtSelection(): void {
    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
      ? product?.selection.reduce(
        (acc, item) => {
          acc[item.name] = item.value;
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
    );

    navigate(`/crear-prix${queryString ? `?${queryString}` : ''}`)
  }

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<object>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {isPortrait ? (
        product && (
          <Portrait
            product={product}
            handleChange={handleChange}
            handleSelection={handleSelection}
            expanded={expanded}
            description={description}
            handleArtSelection={handleArtSelection}
          />
        )
      ) : (
        product && (
          <Landscape
            product={product}
            handleChange={handleChange}
            handleSelection={handleSelection}
            expanded={expanded}
            description={description}
            handleArtSelection={handleArtSelection}
          />
        )
      )}
    </div>
  );
};

export default Details;
