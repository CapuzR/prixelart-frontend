    const parsePriceFromInput = (input: string): number => {
        // Replace commas with dots and remove thousand separators (dot in comma-decimal locales)
        return parseFloat(input.replace(/\./g, '').replace(',', '.'));
    };

    const formatPriceForDisplay = (price: number, locale: string): string => {
        return new Intl.NumberFormat(locale, {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

export { parsePriceFromInput, formatPriceForDisplay };