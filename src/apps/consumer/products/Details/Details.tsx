import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import ReactGA from 'react-ga';
// import { useUser } from '@context/UIContext';
import { useAuth } from '@context/AuthContext';
import { getSelectedVariant } from '../services';
import { splitDescription } from '../helpers';

import Portrait from './views/Portrait';
import Landscape from './views/Landscape';

import { queryCreator } from '@apps/consumer/flow/helpers';
import { SelectChangeEvent } from '@mui/material';
import { Product, Variant, VariantAttribute } from '../../../../types/product.types'; // Import VariantAttribute
import { fetchActiveProductDetails, fetchVariantPrice, fetchAllVariantPricesForProduct } from '@api/product.api';
import { formatNumberString } from '@utils/formats';

ReactGA.initialize('G-0RWP9B33D8');

interface DetailsProps {
  productId?: string;
}

export interface DisplayPriceInfo {
  type: 'single' | 'range' | 'loading' | 'error' | 'none';
  // If type is 'single'
  finalPrice?: number;
  originalPrice?: number; // Store original price if different from final
  // If type is 'range'
  baseMin?: number | null;
  baseMax?: number | null;
  finalMin?: number | null;
  finalMax?: number | null;
  // If type is 'error'
  errorMessage?: string;
}

const Details: React.FC<DetailsProps> = ({ productId }) => {
  const navigate = useNavigate();
  // const { setLoading } = useLoading();
  const { user } = useAuth();
  const { id: routeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const id = productId || routeId || '';

  const [product, setProduct] = useState<Product>();
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);

  const [calculatedRangeInfo, setCalculatedRangeInfo] = useState<{
    baseMin: number | null;
    baseMax: number | null;
    finalMin: number | null;
    finalMax: number | null;
    isLoading: boolean;
    error: string | null;
  }>({
    baseMin: null, baseMax: null, finalMin: null, finalMax: null,
    isLoading: true, error: null,
  });

  // State for the specific price of the currently selected variant
  const [selectedVariantPriceInfo, setSelectedVariantPriceInfo] = useState<{
    original: number | null;
    final: number | null;
    isLoading: boolean;
    error: string | null;
  }>({
    original: null, final: null, isLoading: false, error: null,
  });

  const [isPortrait, setIsPortrait] = useState(window.innerWidth < 768);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const description = useMemo(() => splitDescription(product?.description), [product?.description]);

  // Derive current selection from search params for passing down
  const currentSelectionParams = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);


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
      setProduct(undefined);
      // setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      // setLoading(true);
      setProduct(undefined);
      setSelectedVariant(undefined);
      setCalculatedRangeInfo({ baseMin: null, baseMax: null, finalMin: null, finalMax: null, isLoading: true, error: null });
      setSelectedVariantPriceInfo({ original: null, final: null, isLoading: false, error: null });
      try {
        const fetchedProduct = await fetchActiveProductDetails(id);
        setProduct(fetchedProduct || undefined);
        // Price calculation will trigger in the next effect
      } catch (error) {
        console.error('Error fetching product details:', error);
        setProduct(undefined);
        setCalculatedRangeInfo({ baseMin: null, baseMax: null, finalMin: null, finalMax: null, isLoading: false, error: 'Error al cargar producto.' });
      } finally {
        // setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product?._id || !product.variants || product.variants.length === 0) {
        setCalculatedRangeInfo({ baseMin: null, baseMax: null, finalMin: null, finalMax: null, isLoading: false, error: product ? 'Producto sin variantes.' : null });
        return;
    }

    let isMounted = true;

    const calculatePrices = async () => {
        setCalculatedRangeInfo(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const allVariantPrices = await fetchAllVariantPricesForProduct(product._id!.toString());

            if (!isMounted) return; 

            if (allVariantPrices.length === 0) {
                throw new Error("No se pudieron determinar los precios para ninguna variante.");
            }

            const isPrixer = user?.prixer;
            const basePriceField: keyof Variant = isPrixer && 'prixerPrice' in product.variants![0] ? 'prixerPrice' : 'publicPrice';

            const basePrices = product.variants!
                .map(v => {
                    const priceValue = v[basePriceField];
                    return priceValue != null ? formatNumberString(String(priceValue)) : NaN;
                })
                .filter(p => !isNaN(p));

            const currentBaseMin = basePrices.length > 0 ? Math.min(...basePrices) : null;
            const currentBaseMax = basePrices.length > 0 ? Math.max(...basePrices) : null;

            const finalPrices = allVariantPrices.map(p => p.finalPrice);
            const currentFinalMin = Math.min(...finalPrices);
            const currentFinalMax = Math.max(...finalPrices);

            if (isMounted) {
                setCalculatedRangeInfo({
                    baseMin: currentBaseMin,
                    baseMax: currentBaseMax,
                    finalMin: currentFinalMin,
                    finalMax: currentFinalMax,
                    isLoading: false,
                    error: null,
                });
            }

        } catch (err) {
            console.error("Error al calcular el rango de precios del producto:", err);
            if (isMounted) {
                setCalculatedRangeInfo({
                    baseMin: null, baseMax: null, finalMin: null, finalMax: null,
                    isLoading: false,
                    error: err instanceof Error ? err.message : 'Error al calcular rango de precios.',
                });
            }
        }
    };

    calculatePrices();
    return () => { isMounted = false; };
}, [product, user]);

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setSelectedVariant(undefined);
      return;
    }
    const params = Object.fromEntries(searchParams.entries());
    const variantAttributes: VariantAttribute[] = Object.entries(params)
      .filter(([_, value]) => value?.trim() !== '')
      .map(([name, value]) => ({ name, value }));

    // Assuming getSelectedVariant finds the best match
    const foundVariant = getSelectedVariant(variantAttributes, product.variants);
    setSelectedVariant(foundVariant || undefined);

  }, [product?.variants, searchParams]);

  useEffect(() => {
    setSelectedVariantPriceInfo({ original: null, final: null, isLoading: false, error: null });

    if (selectedVariant?._id && product?._id) {
      let isMounted = true;

      const fetchSpecificPrice = async () => {
          setSelectedVariantPriceInfo({ original: null, final: null, isLoading: true, error: null });
          try {
              const priceResult = await fetchVariantPrice(selectedVariant._id!, product._id!.toString());

              if (isMounted) {
                  if (priceResult && priceResult.length === 2) { 
                      setSelectedVariantPriceInfo({
                          original: priceResult[0],
                          final: priceResult[1],
                          isLoading: false,
                          error: null,
                      });
                  } else {
                      throw new Error("No se pudo obtener el precio para la variante seleccionada.");
                  }
              }
          } catch (error) {
              console.error('Error fetching selected variant price:', error);
              if (isMounted) {
                  setSelectedVariantPriceInfo({
                      original: null, final: null, isLoading: false,
                      error: error instanceof Error ? error.message : 'Error al obtener precio.',
                  });
              }
          }
      };

      fetchSpecificPrice();
      return () => { isMounted = false; };
  }  }, [selectedVariant?._id, product?._id]);


  // --- Event Handlers ---
  const handleSelection = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (!name) return;
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== '') {
      currentSearchParams.set(name, value);
    } else {
      currentSearchParams.delete(name);
    }
    if (!productId) {
      navigate(`/producto/${id}?${currentSearchParams.toString()}`);
    } else {
      setSearchParams(currentSearchParams);
    }
  };

  function handleArtSelection(): void {
    if (!selectedVariant) {
      console.error("handleArtSelection called without a selected variant.");
      return;
    }
    const variantAttributesObject: { [key: string]: string } = selectedVariant.attributes.reduce(
      (acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      },
      {} as { [key: string]: string }
    );
    let art: string | undefined;
    if (productId) {
      const params = new URLSearchParams(window.location.search);
      art = params.get('arte') || undefined;
    }
    const queryString = queryCreator(undefined, id, art, variantAttributesObject);
    navigate(`/crear-prix?${queryString}`);
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<object>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const displayPriceInfo = useMemo((): DisplayPriceInfo => {
    // Priority 1: Show loading/error for the specific selected variant if applicable
    if (selectedVariant && selectedVariantPriceInfo.isLoading) {
      return { type: 'loading' };
    }
    if (selectedVariant && selectedVariantPriceInfo.error) {
      return { type: 'error', errorMessage: selectedVariantPriceInfo.error };
    }
    // Priority 2: Show the successfully fetched price for the selected variant
    if (selectedVariant && selectedVariantPriceInfo.final !== null) {
      return {
        type: 'single',
        finalPrice: selectedVariantPriceInfo.final,
        // Include original only if it's different
        originalPrice: (selectedVariantPriceInfo.original !== null && selectedVariantPriceInfo.original !== selectedVariantPriceInfo.final)
          ? selectedVariantPriceInfo.original
          : undefined,
      };
    }

    // --- If no variant is selected or its price fetch failed ---

    // Priority 3: Show loading/error for the overall range calculation
    if (calculatedRangeInfo.isLoading) {
      return { type: 'loading' };
    }
    if (calculatedRangeInfo.error) {
      // Don't show range calculation errors if a variant *is* selected but its *own* price fetch failed (handled above)
      if (!selectedVariant) {
        return { type: 'error', errorMessage: calculatedRangeInfo.error };
      }
      // If a variant is selected but its price failed, fall back to 'none' or prompt
      return { type: 'none' }; // Or a specific message like "Selecciona otra opción"
    }
    // Priority 4: Show the calculated price range
    if (calculatedRangeInfo.finalMin !== null) {
      return {
        type: 'range',
        baseMin: calculatedRangeInfo.baseMin,
        baseMax: calculatedRangeInfo.baseMax,
        finalMin: calculatedRangeInfo.finalMin,
        finalMax: calculatedRangeInfo.finalMax,
      };
    }

    // Fallback: No price info available
    return { type: 'none' };

  }, [selectedVariant, selectedVariantPriceInfo, calculatedRangeInfo]);

  const ViewComponent = isPortrait || productId ? Portrait : Landscape;

  return (
    <div style={{ maxHeight: `${windowHeight - (productId ? 0 : 64)}px`, overflowY: 'auto' }}>
      {product ? (
        <ViewComponent
          product={product}
          handleChange={handleChange}
          handleSelection={handleSelection}
          expanded={expanded}
          description={description}
          handleArtSelection={handleArtSelection}
          // Pass down loading status based on relevant context
          isFetchingVariantPrice={selectedVariantPriceInfo.isLoading} // Use specific loading state
          flowProductId={productId}
          selectedVariant={selectedVariant}
          currentSelectionParams={currentSelectionParams}
          // Pass the consolidated price info object
          priceInfo={displayPriceInfo}
        />
      ) : (
        // Show loading indicator or error message while product is fetching
        calculatedRangeInfo.isLoading || calculatedRangeInfo.error ? null : null // Or a dedicated loading/error view
      )}
    </div>
  );
};

export default Details;