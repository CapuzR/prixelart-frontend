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

import { queryCreator } from '@apps/consumer/flow/helpers';
import { SelectChangeEvent } from '@mui/material';
import { parseProduct } from '../parseApi';
import { getUrlParams } from '@utils/util';
import { Product } from '../../../../types/product.types';

ReactGA.initialize('G-0RWP9B33D8');

interface DetailsProps {
  productId?: string;
}

const Details: React.FC<DetailsProps> = ({ productId }) => {
  const navigate = useNavigate();
  const { loading, setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { id: routeId } = useParams();
  const id = productId || routeId || '';
  const [isFetchingVariantPrice, setIsFetchingVariantPrice] = useState(false);


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

    if (!id && !productId) {
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const fetchedProduct = await fetchProductDetails(productId ? productId : id);
        const parsed = parseProduct(fetchedProduct);

        const selectedAttributes = Array.from(getUrlParams([]).entries()).map(
          ([name, value]) => ({ name, value })
        );

        setProduct({
          ...parsed,
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
      if (product?.selection && product?.selection.some((selection) => selection.value !== '')) {
        const selectedVariant = getSelectedVariant(product?.selection, product?.variants);
        if (selectedVariant) {
          setIsFetchingVariantPrice(true);
          const updatedPrice = await fetchVariantPrice(selectedVariant.id, id!);
          const parsedPrice = parsePrice(updatedPrice);

          setProduct((prevProduct) =>
            prevProduct
              ? { ...prevProduct, price: parsedPrice }
              : prevProduct
          );
          setIsFetchingVariantPrice(false);
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
    if (!productId) {
      if (value) {
        navigate(`/producto/${id}?${searchParams.toString()}`);
      } else {
        navigate(`/producto/${id}`);
      }
    }
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

    let art: string | undefined;
    if (productId) {
      const params = new URLSearchParams(window.location.search);
      art = params.get('arte') || undefined;
    }
    const queryString = queryCreator(
      undefined,
      id,
      art,
      selectionAsObject || undefined,
    );

    navigate(`/crear-prix?${queryString}`)
  }

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<object>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {!isPortrait && !productId ? (
        product && (
          <Landscape
            product={product}
            handleChange={handleChange}
            handleSelection={handleSelection}
            expanded={expanded}
            description={description}
            handleArtSelection={handleArtSelection}
            isFetchingVariantPrice={isFetchingVariantPrice}
            flowProductId={productId}
          />
        )
      ) : (
        product && (
          <Portrait
            product={product}
            handleChange={handleChange}
            handleSelection={handleSelection}
            expanded={expanded}
            description={description}
            handleArtSelection={handleArtSelection}
            isFetchingVariantPrice={isFetchingVariantPrice}
            flowProductId={productId}
          />
        )
      )}
    </div>
  );
};

export default Details;
