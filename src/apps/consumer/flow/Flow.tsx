import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ReactGA from 'react-ga';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useLoading, useSnackBar, useUser } from 'context/GlobalContext';
import { getSelectedVariant } from 'apps/consumer/products/services';

import Landscape from 'apps/consumer/flow/views/Landscape';

import { queryCreator } from './helpers';
import { useCart } from 'context/CartContext';
import { getUrlParams } from '@utils/util';
import { PickedProduct, Product, VariantAttribute } from '../../../types/product.types';
import { Art } from '../../../types/art.types';
import { fetchArt } from '@api/art.api';
import { fetchActiveProductDetails, fetchVariantPrice } from '@api/product.api';
import { Item } from 'types/order.types';

ReactGA.initialize('G-0RWP9B33D8');

const Flow = () => {
  const [item, setItem] = useState<Partial<Item>>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoading();
  const { showSnackBar } = useSnackBar();
  const { addOrUpdateItemInCart } = useCart();

  const urlParams = Object.fromEntries(new URLSearchParams(location.search).entries());

  const allAttributeNames = useMemo(() => {
    if (!item.product?.variants) {
      return new Set<string>();
    }
    const names = new Set<string>();
    item.product.variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        names.add(attr.name);
      });
    });
    return names;
  }, [item.product?.variants]);

  // 2. Check if all derived attributes have a value in the URL params
  const isProductAttributesComplete = useMemo(() => {
    // Requires a product and defined attributes
    if (!item.product || allAttributeNames.size === 0) {
      return false;
    }
    // Check if every attribute name derived from variants exists in urlParams
    return Array.from(allAttributeNames).every(attributeName => {
      // Ensure the param exists and is not empty/whitespace
      return urlParams[attributeName] && urlParams[attributeName].trim() !== '';
    });
  }, [item.product, allAttributeNames, urlParams]);

  // 3. Check if the core requirements (product, art, attributes) are met
  const isItemReady = Boolean(urlParams.producto && urlParams.arte && isProductAttributesComplete);

  useEffect(() => {
    !urlParams.producto && !urlParams.arte && navigate('/');
  }, [urlParams.producto, urlParams.arte, navigate]);

  useEffect(() => {
    const fetchItem = async () => {
      // Only fetch if params exist
      if (!urlParams.producto && !urlParams.arte) return;

      setLoading(true);
      try {
        let selectedProduct: Product | undefined = undefined; // Use new Product type
        let selectedArt: Art | undefined = undefined;

        // Fetch product details if ID exists
        if (urlParams.producto) {
          selectedProduct = await fetchActiveProductDetails(urlParams.producto);
        }

        // Fetch art details if ID exists
        if (urlParams.arte) {
          // Assuming fetchArt returns the correct Art type
          selectedArt = await fetchArt(urlParams.arte);
        }

        // Extract attribute selections from URL, excluding specific keys
        const selectedAttributes = getUrlParams([
          'producto',
          'arte',
          'itemId',
          'lineId',
        ]); // Get all other params

        const atts: Record<string, string> = {};
        Array.from(selectedAttributes.entries()).map(([key, value]) => {
          atts[key] = value;
        });

        // Update item state
        setItem((prevItem) => ({
          ...prevItem,
          sku: urlParams.producto || prevItem.sku, // Keep existing SKU if product param disappears temp.
          product: selectedProduct
            ? ({
              ...selectedProduct,
              selection: Object.entries(atts).map(([name, value]) => ({ name, value })),
            } as PickedProduct) // Cast to PickedProduct
            : prevItem.product, // Keep previous product if fetch fails or no ID
          art: selectedArt || prevItem.art, // Update art or keep previous
        }));

      } catch (error) {
        console.error('Error fetching item details:', error);
        // Optional: navigate away or clear state on error
        // navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [location.search]);

  // Effect to update selectedProductId state (used potentially for UI)
  useEffect(() => {
    if (urlParams.producto) {
      setSelectedProductId(urlParams.producto);
    } else {
      setSelectedProductId(null); // Clear if no product in URL
    }
  }, [urlParams.producto]);


  // Effect to fetch and set the price based on the selected variant
  useEffect(() => {
    const fetchAndSetPrice = async () => {
      if (!item.product?.variants || !item.product.selection || !isProductAttributesComplete || !item.sku) {
        // Clear price and discount if selection is incomplete or product/variants/sku missing
        if (item.price !== undefined || item.discount !== undefined) {
          setItem((prevItem) => ({
            ...prevItem,
            price: undefined,
            discount: undefined, // Also clear discount
          }));
        }
        return;
      }

      const selectedVariant = getSelectedVariant(item.product.selection, item.product.variants);

      if (selectedVariant?._id) { // Ensure variant and its ID exist
        try {
          const priceResult = await fetchVariantPrice(selectedVariant._id, item.sku);
          const originalPriceStr = priceResult[1].toString(); // Assuming result format is [?, priceString]

          let discountValue: number | undefined = undefined;

          // *** ADDED DISCOUNT LOGIC ***
          // Check if art exists, user exists, and prixerUsername matches user's username
          if (item.art?.prixerUsername && user?.username && item.art.prixerUsername === user.username) {
            discountValue = 15; // Apply 15% discount
          }
          // *** END ADDED DISCOUNT LOGIC ***

          // Update item state with the fetched ORIGINAL price and potential discount
          setItem((prevItem) => ({
            ...prevItem,
            price: originalPriceStr,   // Store the ORIGINAL price
            discount: discountValue,   // Store discount percentage (15 or undefined)
          }));

        } catch (error) {
          console.error('Error fetching variant price:', error);
          showSnackBar('Error obteniendo el prix.'); // Corrected snackbar message typo
          setItem((prevItem) => ({
            ...prevItem,
            price: 'Error', // Indicate price error state better
            discount: undefined, // Clear discount on error
          }));
        }
      } else {
        // If no matching variant found clear price and discount
        if (item.price !== undefined || item.discount !== undefined) {
          setItem((prevItem) => ({
            ...prevItem,
            price: undefined,
            discount: undefined, // Clear discount
          }));
        }
      }
    };

    fetchAndSetPrice();
  }, [
    item.product?.variants,
    JSON.stringify(item.product?.selection), // Deep comparison
    item.sku,
    item.art?.prixerUsername, // Add dependency for art's owner
    user?.username, // Add dependency for logged-in user
    isProductAttributesComplete,
    // Removed showSnackBar, setLoading dependencies as they don't directly influence price calculation logic
  ]);

  const handleArtSelect = (selectedArt: Art) => {
    // Keep existing product attribute selections from URL params
    const excludedKeys = new Set(['producto', 'arte', 'lineId', 'itemId']); // Exclude core identifiers
    const existingAttributes = Object.entries(urlParams).reduce((acc, [key, value]) => {
      if (!excludedKeys.has(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Generate new query string
    const newQueryString = queryCreator(
      urlParams.lineId,
      urlParams.producto, // Keep current product ID
      selectedArt.artId?.toString(), // Use the new Art's ID (ensure _id exists and handle type)
      existingAttributes // Keep current attribute selections
    );
    navigate(`${location.pathname}?${newQueryString}`);
    showSnackBar('¡Arte seleccionado! Puedes agregar el item al carrito');
  };

  // Handler for selecting a different Product (e.g., from a list)
  const handleProductSelect = (selectedProduct: Product) => { // Base Product type here initially
    const attributes = {}; // Start with empty attributes for the new product

    const newQueryString = queryCreator(
      urlParams.lineId,
      selectedProduct._id?.toString(), // Use the new Product's ID
      urlParams.arte, // Keep current art ID
      attributes // Pass empty attributes, let user select again
    );
    navigate(`${location.pathname}?${newQueryString}`);
    showSnackBar('¡Producto seleccionado! Elige las opciones.'); // Updated message
  };

  const handleCart = (itemToAdd: Item) => { // Expects the fully configured Item object
    if (!isItemReady || !itemToAdd.price) {
      showSnackBar('Por favor completa la selección antes de añadir al carrito.');
      return;
    }

    addOrUpdateItemInCart(itemToAdd, 1, urlParams.lineId);
    showSnackBar('Item agregado al carrito');
    navigate('/carrito');
  };

  const handleChangeElement = (type: 'producto' | 'arte', currentItem: Item, lineId?: string) => {
    let newProductId: string | undefined = currentItem.sku;
    let newArtId: string | undefined = currentItem.art?.artId; // Use _id
    let selectionAsObject: Record<string, string> = {};

    if (type === 'arte') {
      newArtId = undefined; // Clear art
      // Keep product and its current selections
      selectionAsObject = (currentItem.product?.selection || []).reduce((acc, sel) => {
        acc[sel.name] = sel.value;
        return acc;
      }, {} as Record<string, string>);
      // Clear art state locally immediately for responsiveness
      setItem(prev => ({ ...prev, art: undefined, price: undefined }));

    } else if (type === 'producto') {
      newProductId = undefined; // Clear product
      selectionAsObject = {}; // Clear attributes
      // Clear product state locally immediately
      setItem(prev => ({ ...prev, product: undefined, sku: undefined, price: undefined, selection: undefined }));
    }

    const queryString = queryCreator(
      lineId ? lineId : urlParams.lineId, // Use provided lineId or from URL
      newProductId,
      newArtId,
      selectionAsObject,
    );

    navigate({ pathname: location.pathname, search: queryString });
  };

  // Handler for selecting a specific attribute value (e.g., from dropdown)
  const handleSelection = (e: React.ChangeEvent<{ name: string; value: number }>) => { // Now value is a number
    const { name, value } = e.target;
    // Update the selection in the local state optimistically

    const currentSelection = item.product?.selection || [];
    const selectionAsObject = currentSelection.reduce(
      (acc, sel) => {
        // Keep existing selections
        if (sel.name !== name) {
          acc[sel.name] = sel.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Regenerate query string with the updated selection
    const queryString = queryCreator(
      urlParams.lineId,
      item.sku, // Keep current product sku
      item.art?.artId?.toString(), // Keep current art id (use _id)
      selectionAsObject, // Pass the updated selections
    );

    // Update URL without full page reload
    navigate(`${location.pathname}?${queryString}`, { replace: true }); // Use replace to avoid history spam
  };

  return (
    <>
      {/* {
      isPortrait ? (
        <Portrait
        item={item}
        handleCart={handleCart}
        getFilteredOptions={getFilteredOptions}
        handleSelection={handleSelection}
        handleChangeElement={handleChangeElement}
        isItemReady={isItemReady}
        onArtSelect={handleArtSelect}
        onProductSelect={handleProductSelect}
        selectedProductId={selectedProductId}
        />
      ) : ( */}
      <Landscape
        item={item}
        handleCart={handleCart}
        handleSelection={handleSelection}
        handleChangeElement={handleChangeElement}
        isItemReady={isItemReady}
        onArtSelect={handleArtSelect}
        onProductSelect={handleProductSelect}
        selectedProductId={selectedProductId}
        isProductAttributesComplete={isProductAttributesComplete}
        allAttributeNames={Array.from(allAttributeNames)}
      />
      {/* )} */}
    </>
  );
};

export default Flow;
