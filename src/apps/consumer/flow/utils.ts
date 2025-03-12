export const queryCreator = (
  lineId: string | undefined,
  itemId: string | undefined,
  productId: string | undefined,
  artId: string | undefined,
  attributes: { [key: string]: string } | undefined,
) => {
  const searchParams = new URLSearchParams(window.location.search);

  for (const key of Array.from(searchParams.keys())) {
    searchParams.delete(key);
  }

  if (lineId) {
    searchParams.set('lineId', lineId);
  }

  if (itemId) {
    searchParams.set('itemId', itemId);
  }

  if (productId) {
    searchParams.set('producto', productId);
  }

  if (artId) {
    searchParams.set('arte', artId);
  }

  attributes &&
    attributes !== undefined &&
    Object.keys(attributes).forEach((attrKey) => {
      searchParams.set(attrKey, attributes[attrKey]);
    });

  return searchParams.toString();
};

export const updateAttributes = (
  productSelection: Selection[] | undefined,
  targetName: string,
  targetValue: string
): { [key: string]: string } => {
  const attributesFromSelection = (productSelection || []).reduce((acc, selection, index) => {
    acc[index] = String(selection);
    return acc;
  }, {} as { [key: string]: string });

  return {
    ...attributesFromSelection,
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
