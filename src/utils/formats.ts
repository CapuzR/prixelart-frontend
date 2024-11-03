const parsePrice = (input: string | number): number => {
    if (!input) {
      return 0;
    }

    if (typeof input === 'number') {
      return input;
    }
    
    const cleanedInput = input.replace(/[^\d.,-]/g, '').trim();

    return parseFloat(cleanedInput.replace(/\./g, '').replace(',', '.'));
  };

const formatPriceForUI = (
    from: string | number | undefined,
    currency: "Bs" | "USD",
    conversionRate: number,
    to?: string | number
  ): string => {

    if (!from) {
      return '';
    }
    
    const stringPrice = (price: number): string => {
      return new Intl.NumberFormat('es-ES', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    };
  
    const parsedFrom = parsePrice(from);
    const parsedTo = to ? parsePrice(to) : undefined;
  
    const formattedFrom = currency === "Bs" ? stringPrice(parsedFrom * conversionRate) : stringPrice(parsedFrom);
  
    if (!to || parsedFrom === parsedTo) {
      return `${currency} ${formattedFrom}`;
    }
  
    const formattedTo = currency === "Bs" ? stringPrice(parsedTo * conversionRate) : stringPrice(parsedTo);
  
    return `${currency} ${formattedFrom} - ${formattedTo}`;
  };

export { formatPriceForUI, parsePrice };