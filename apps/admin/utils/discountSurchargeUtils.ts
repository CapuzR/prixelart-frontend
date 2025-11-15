import { AdjustmentMethod, Entity } from "types/discount.types";
import { Product, Variant } from "types/product.types";

export const ADJUSTMENT_METHOD_OPTIONS: {
  value: AdjustmentMethod;
  label: string;
}[] = [
  { value: "percentage", label: "Porcentaje" },
  { value: "absolute", label: "Monto Absoluto" },
];
export const ENTITY_TYPE_OPTIONS: { value: Entity; label: string }[] = [
  { value: "user", label: "Usuario Específico" },
  { value: "prixer", label: "Prixer Específico" },
  { value: "seller", label: "Vendedor Específico" },
  { value: "organization", label: "Organización Específica" },
  { value: "manufacturer", label: "Fabricante Específico" },
];

export const formatPrice = (priceStr: string | undefined | null): string => {
  if (priceStr === undefined || priceStr === null) {
    return "USD N/A";
  }
  const priceVal = parseFloat(priceStr);
  if (!isNaN(priceVal)) {
    // Format to 2 decimal places as requested
    return `USD ${priceVal.toFixed(2)}`;
  } else {
    return "USD N/A"; // Indicate if the source string is not a valid number
  }
};

export interface ProductOrVariantOption {
  id: string;
  label: string; // Includes price info
  isProduct: boolean;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  imageUrl?: string;
}

export const getProductImageUrl = (
  product?: Product,
  variant?: Variant,
): string | undefined => {
  if (variant?.variantImage) return variant.variantImage;
  if (product?.thumbUrl && product.thumbUrl !== "undefined")
    return product.thumbUrl; // Check for 'undefined' string just in case
  if (product?.sources?.images?.[0]?.url) return product.sources.images[0].url;
  return undefined; // No image found
};

export const calculateDiscountedPrice = (
  originalPriceStr: string | undefined | null,
  method: AdjustmentMethod,
  value: number | undefined | null,
): number | null => {
  if (
    originalPriceStr === undefined ||
    originalPriceStr === null ||
    value === undefined ||
    value === null
  ) {
    return null; // Cannot calculate
  }
  const originalPrice = parseFloat(originalPriceStr);
  if (isNaN(originalPrice)) {
    return null; // Invalid original price
  }
  const discountValue = Number(value); // Ensure value is number
  if (isNaN(discountValue)) {
    return originalPrice; // No valid discount value provided
  }

  if (method === "percentage") {
    // Ensure percentage is between 0 and 1
    const validPercentage = Math.max(0, Math.min(1, discountValue));
    return originalPrice * (1 - validPercentage);
  } else if (method === "absolute") {
    // Ensure discount isn't negative (can make price higher)
    const validAbsolute = Math.max(0, discountValue);
    return originalPrice - validAbsolute;
  }
  return originalPrice; // Fallback if method is unknown
};
