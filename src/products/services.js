import { format, toggleDecimalSeparator } from '../utils/utils';
import { fetchVariantPrice } from './api'; // Importing the API function


export const formatPrice = (item, currency, conversionRate) => {
  const from = +toggleDecimalSeparator(item?.from);
  const to = +toggleDecimalSeparator(item?.to);
  const formattedFrom = currency === "Bs" ? format(from * conversionRate) : format(from);

  if (from === to) {
    return currency === "Bs" ? `${formattedFrom}` : `${formattedFrom}`;
  }
  const formattedTo = currency === "Bs" ? format(to * conversionRate) : format(to);

  return currency === "Bs"
    ? `${formattedFrom} - ${formattedTo}`
    : `${formattedFrom} - ${formattedTo}`;
};

export const getPriceWithSelectedVariant = async (item, currency, conversionRate, selectedAtt, variants, selectedArt) => {
  if ((selectedAtt && selectedArt) || selectedAtt) {
    const variantPrice = await getSelectedVariantArtPrice(variants, selectedAtt, selectedArt);
    if (variantPrice) {
      return currency === "Bs"
        ? format(Number(toggleDecimalSeparator(variantPrice)) * Number(toggleDecimalSeparator(conversionRate)))
        : format(variantPrice);
    }
  } else if (selectedArt) {
    return currency === "Bs"
      ? format(Number(toggleDecimalSeparator(item?.from)) * Number(toggleDecimalSeparator(conversionRate)))
      : format(item?.from);
  }
  return formatPrice(item, currency, conversionRate);
};

export const prepareProductData = (product) => {
  const initialSelection = product.attributes?.reduce((acc, attr) => { acc[attr.name] = ""; return acc; }, {});

    return {
      product: { ...product, selection: initialSelection },
      selectedItem: product
    };
};

export const processProductsResponse = (response) => {
  const products = response.products;
  const maxLength = response.maxLength;
  return { products, maxLength };
};

const getSelectedVariantArtPrice = async (variants, selectedAtt, selectedArt) => {
  const selectedVariant = variants?.find(variant =>
    variant.attributes?.every(attr => selectedAtt && Object.keys(selectedAtt).includes(attr.name))
  );

  if (!selectedVariant) {
    console.error('No matching variant found');
    return null;
  }
  
  const variantPrice = await fetchVariantPrice(selectedVariant._id, selectedArt?.artId);

  return variantPrice;
};