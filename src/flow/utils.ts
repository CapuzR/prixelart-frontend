export const queryCreator = (
    productId: string | undefined,
    selectedArtId: string | undefined,
    attributes: { [key: string]: string },
    step: string
  ) => {
    const searchParams = new URLSearchParams(window.location.search);
  
    searchParams.set("step", step);
  
    if (productId) {
      searchParams.set("producto", productId);
    }
  
    if (selectedArtId) {
      searchParams.set("arte", selectedArtId);
    }
    
    Object.keys(attributes).forEach((attrKey) => {
      searchParams.set(attrKey, attributes[attrKey]);
    });
  
    return searchParams.toString();
  };
  
  export const updateAttributes = (
    productSelection: { [key: string]: any } | undefined,
    targetName: string,
    targetValue: string
  ): { [key: string]: string } => {
    return {
      ...Object.keys(productSelection || {}).reduce((acc, key) => {
        acc[key] = String(productSelection?.[key]);
        return acc;
      }, {} as { [key: string]: string }),
      [targetName]: String(targetValue),
    };
  };

  export function getUrlParams(excludedParams: string[] = []): { name: string; value: string }[] {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsArray: { name: string; value: string }[] = [];
  
    searchParams.forEach((value, key) => {
      if (!excludedParams.includes(key)) {
        paramsArray.push({ name: key, value });
      }
    });
  
    return paramsArray;
  }