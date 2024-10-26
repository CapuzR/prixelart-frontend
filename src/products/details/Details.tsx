import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import ReactGA from "react-ga";
import { useConversionRate, useCurrency, useLoading, useSnackBar } from 'context/GlobalContext';
import { prepareProductData, getSelectedVariantPrice } from "../services";
import { fetchVariantPrice } from "../api";
import { parsePrice } from "utils/formats";
import { splitDescription } from "../utils";

import { fetchProductDetails } from '../api';

import Portrait from "./views/Portrait";
import Landscape from "./views/Landscape";

import { CartItem, Product } from '../interfaces';

ReactGA.initialize("G-0RWP9B33D8");

interface Props {
  buyState: CartItem[];
  setBuyState: (cart: CartItem[]) => void;
}

const Details: React.FC<Props> = (props) => {
  const { loading, setLoading } = useLoading();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  
  const history = useHistory();
  const productId = new URLSearchParams(window.location.search).get("producto");

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(undefined);
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
        const { product, selectedItem } = prepareProductData(productData);
        setProduct({...product, productId: productId});
        setSelectedItem({...selectedItem, price: product?.price});
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
          setSelectedItem((prevSelectedProduct) => ({
            ...prevSelectedProduct,
            price: parsedPrice,
            //Esto está acá solo por el carrito, hay que volárselo..
            //Considerar qué pasa si el user metió todo en el carrito y de repente inicia sesión como Prixer.
            publicEquation: {
              from: parsedPrice,
              to: parsedPrice
            },
            publicPrice: {
              from: parsedPrice,
              to: parsedPrice
            }
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

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

//TO DO: CART. Esto no debería ir acá. Todo debería estar en el Cart, que QUIZÁS debería ser un Context.
  const addItemToBuyState = () => { 
      const newState = [...props.buyState];
      newState.push({
        product: selectedItem,
        quantity: 1,
      });
      props.setBuyState(newState);
      localStorage.setItem("buyState", JSON.stringify(newState));
      showSnackBar("¡Producto agregado!");
    history.push({
      pathname: "/shopping",
    })
  };

  return (
    <div style={{ maxHeight: `${windowHeight - 64}px`, overflowY: 'auto' }}>
      {
          isPortrait ? (
            <Portrait
              product={product}
              addItemToBuyState={addItemToBuyState}
              handleChange={handleChange}
              handleSelection={handleSelection}
              expanded={expanded}
              description={description}
            />
          ) : (
            <Landscape
              product={product}
              addItemToBuyState={addItemToBuyState}
              handleChange={handleChange}
              handleSelection={handleSelection}
              expanded={expanded}
              description={description}
            />
          )
    }
    </div>
  );
};

export default Details;
