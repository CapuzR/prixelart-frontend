    const parsePriceFromInput = (input: string | number): number => {
        if (typeof input === 'number') {
            return input; // If already a number, no need to parse
        }
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