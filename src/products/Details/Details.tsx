import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import ReactGA from "react-ga";
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { useCart } from 'context/CartContext';
import { prepareProductData, getSelectedVariantPrice } from "../services";
import { fetchVariantPrice } from "../api";
import { parsePrice } from "utils/formats";
import { splitDescription } from "../utils";

import { fetchProductDetails } from '../api';

import Portrait from "./views/Portrait";
import Landscape from "./views/Landscape";

import { CartItem, Product } from '../interfaces';
import { queryCreator } from "flow/utils";

ReactGA.initialize("G-0RWP9B33D8");

interface Props {
  buyState: CartItem[];
  setBuyState: (cart: CartItem[]) => void;
}

const Details: React.FC<Props> = (props) => {
  const history = useHistory();
  const { loading, setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { addItemToCart } = useCart();
  
  const productId = new URLSearchParams(window.location.search).get("producto");

  const [product, setProduct] = useState<Product | null>(null);
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [expanded, setExpanded] = useState<string | false>("panel1");

  const description = splitDescription(product?.description);
  
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerWidth < 768);
      setWindowHeight(window.innerHeight)
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductDetails(productId);
        const product = prepareProductData(productData);
        setProduct({...product, productId: productId});
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
      if(product?.selection && Object.keys(product?.selection).every((s) => product?.selection[s] !== '')) {
        const selectedVariant = getSelectedVariantPrice(product?.selection, product?.variants);
        
        if (selectedVariant) {
          const updatedPrice = await fetchVariantPrice(selectedVariant._id);
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

  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    const { name, value } = e.target;
    if (!name) return;
  
    setProduct((prevProduct) => ({
      ...prevProduct,
      id: productId,
      selection: {
        ...prevProduct?.selection,
        [name]: value,
      },
    }));
  };
  
  function handleArtSelection(): void {
    const selectionAsObject: { [key: string]: string } = Array.isArray(product?.selection)
        ? product?.selection.reduce((acc, item, index) => {
            acc[`selection-${index}`] = String(item);
            return acc;
          }, {} as { [key: string]: string })
        : (product?.selection || {});

    const queryString = queryCreator(
      undefined,
      product?.id,
      undefined,
      selectionAsObject,
      'arte',
      '1'
    );

    addItemToCart({ product, art: undefined, quantity: 1 });

    history.push({ pathname: '/flow', search: queryString });
  };

  const handleSaveProduct = async () => {
    addItemToCart({ product, art: undefined, quantity: 1 });
  };


  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {
          isPortrait ? (
            <Portrait
              product={product}
              handleChange={handleChange}
              handleSelection={handleSelection}
              expanded={expanded}
              description={description}
              handleArtSelection={handleArtSelection}
              handleSaveProduct={handleSaveProduct}
            />
          ) : (
            <Landscape
              product={product}
              handleChange={handleChange}
              handleSelection={handleSelection}
              expanded={expanded}
              description={description}
              handleArtSelection={handleArtSelection}
              handleSaveProduct={handleSaveProduct}
            />
          )
    }
    </div>
  );
};

export default Details;
