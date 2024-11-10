import { Product, Variant, Selection } from './interfaces';

//Details.tsx
export const prepareProductData = (product) => {
  const initialSelection = product.attributes?.reduce((acc, attr) => {
    acc[attr.name] = '';
    return acc;
  }, {});

  return { ...product, selection: initialSelection };
};

//Details.tsx
export const getSelectedVariant = (selectedAtt: Selection[], variants: Variant[]): Variant | null => {
  const selectedVariant = variants?.find((variant) =>
    variant.attributes?.every((attr) => selectedAtt && Object.keys(selectedAtt).includes(attr.name))
  );

  if (!selectedVariant) {
    console.error('No matching variant found');
    return null;
  }

  return selectedVariant; // Just return the variant object
};

//Lanscape.tsx & Portrait.tsx
export const getFilteredOptions = (
  product: Product | undefined,
  att: { name: string; value: string[] }
): string[] => {
  if (
    Object.values(product?.selection).every((s) => s.value === '') ||
    !Object.keys(product?.selection).some(
      (key) => key !== att.name && product?.selection[key] !== ''
    )
  ) {
    return att.value || [];
  }

  return Object.keys(product?.selection ?? {})
    .filter((key) => {
      if (key !== att.name && product?.selection[key] !== '') {
        return att.value;
      }
    })
    .map((key) => {
      return product?.variants
        ?.filter((variant) => {
          return variant.attributes?.some(
            (a) => a.name === key && a.value === product?.selection[key]
          );
        })
        ?.map((vari) => {
          return vari.attributes?.filter((a) => a.name === att.name)[0].value;
        });
    })
    .flat();
};
