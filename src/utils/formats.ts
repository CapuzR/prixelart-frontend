export const formatNumberString = (priceStr: string | null | undefined): number => {
  if (priceStr == null || priceStr === '') return NaN;
  // Replace comma with dot for reliable conversion, then parse
  return Number(String(priceStr).replace(',', '.'));
};

const toLocalePriceString = (price: number): string => {
  if (isNaN(price)) return 'N/A'; // Or return '' or 'Error'
  return new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatNumericPrice = (priceNum: number | null | undefined, currency: 'Bs' | 'USD', conversionRate: number): string => {
  if (priceNum == null || isNaN(priceNum)) {
    return 'N/A'; // Or handle 
  }

  const displayValue = currency === 'Bs' ? priceNum * conversionRate : priceNum;
  return toLocalePriceString(displayValue);
};

export const formatRange = (minPrice: number | null | undefined, maxPrice: number | null | undefined, currency: 'Bs' | 'USD', conversionRate: number): string => {
  const formattedMin = formatNumericPrice(minPrice, currency, conversionRate);

  if (formattedMin === 'N/A') {
    return 'Precio no disponible'; // Or a more specific message
  }

  // Check if maxPrice is valid and different from minPrice
  if (maxPrice != null && !isNaN(maxPrice) && maxPrice !== minPrice) {
    const formattedMax = formatNumericPrice(maxPrice, currency, conversionRate);
    if (formattedMax !== 'N/A') {
      // Important: Use the same currency symbol for both parts of the range
      return `${currency} ${formattedMin} - ${formattedMax}`; // Only one currency symbol at start if preferred: `${currency} ${formattedMin} - ${formattedMax}`
    }
  }

  // If only min price is valid or min/max are the same
  return `${currency} ${formattedMin}`;
};

export const formatSinglePrice = (finalPriceStr: string | null | undefined, currency: 'Bs' | 'USD', conversionRate: number, originalPriceStr?: string | null | undefined): string => {

  const finalPriceNum = formatNumberString(finalPriceStr);
  const originalPriceNum = formatNumberString(originalPriceStr); // Will be NaN if originalPriceStr is null/undefined/empty

  if (isNaN(finalPriceNum)) {
    return finalPriceStr === 'Error' ? 'Error al cargar precio' : ''; // Handle specific error string or return empty
  }

  // Calculate the numeric value to display based on currency
  const displayFinalValue = currency === 'Bs' ? finalPriceNum * conversionRate : finalPriceNum;
  const formattedFinal = toLocalePriceString(displayFinalValue);

  // Check if original price is valid, provided, and different from final price
  if (!isNaN(originalPriceNum) && originalPriceNum !== finalPriceNum) {
    const displayOriginalValue = currency === 'Bs' ? originalPriceNum * conversionRate : originalPriceNum;
    const formattedOriginal = toLocalePriceString(displayOriginalValue);

    // Return HTML with strikethrough. Use CSS classes for styling.
    return `
          <span class="original-price" style="text-decoration: line-through; opacity: 0.7; margin-right: 0.4em;">
              ${currency} ${formattedOriginal}
          </span>
          <span class="final-price">
              ${currency} ${formattedFinal}
          </span>
      `;
  } else {
    // Just return the formatted final price
    return `<span class="final-price">${currency} ${formattedFinal}</span>`;
  }
};