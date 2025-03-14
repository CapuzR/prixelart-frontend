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
