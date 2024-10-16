export const queryCreator = (
    productId: string | undefined,
    selectedArtId: string | undefined,
    attributes: { [key: string]: string },
    step: string
  ) => {
    const searchParams = new URLSearchParams(window.location.search);
  
    // Set the step in the URL
    searchParams.set("step", step);
  
    // Set the productId in the URL if available
    if (productId) {
      searchParams.set("producto", productId);
    }
  
    // Set the selected art in the URL if available
    if (selectedArtId) {
      searchParams.set("arte", selectedArtId);
    }
  
    // Set the selected attributes in the URL
    Object.keys(attributes).forEach((attrKey) => {
      searchParams.set(attrKey, attributes[attrKey]);
    });
  
    return searchParams.toString(); // Return the query string to use in the `history.push` function
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