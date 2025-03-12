import { Product, Variant, Selection } from './interfaces';

export const getSelectedVariant = (selectedAtt: Selection[], variants: Variant[]): Variant | null => {

  const selectedVariant = variants?.find((variant) =>
    variant.attributes?.every((attr) =>
      selectedAtt.some(sel => sel.name === attr.name && sel.value === attr.value)
    )
  );

  if (!selectedVariant) {
    console.error('No matching variant found');
    return null;
  }

  return selectedVariant;
};

export const getFilteredOptions = (
  product: Product,
  att: { name: string; value: string[] }
): string[] => {

  const selection: Selection[] =
    Array.isArray(product.selection)
      ? product.selection
      : typeof product.selection === 'object' && product.selection !== null
        ? Object.values(product.selection) as Selection[]
        : [];

  const allEmpty = selection.every((s) => s.value === '');
  const hasOtherSelection = selection.some(
    (s) => s.name !== att.name && s.value !== ''
  );

  if (allEmpty || !hasOtherSelection) {
    return att.value || [];
  }

  const filteredOptions = selection
    .filter((sel) => sel.name !== att.name && sel.value !== '')
    .map((sel) => {
      const matchingVariants = product.variants.filter((variant) =>
        variant.attributes?.some(
          (a) => a.name === sel.name && a.value === sel.value
        )
      );
      return matchingVariants
        .map((variant) => {
          const matchingAttr = variant.attributes?.find(
            (a) => a.name === att.name
          );
          return matchingAttr ? matchingAttr.value : null;
        })
        .filter((value): value is string => value !== null);
    })
    .flat();

  return filteredOptions;
};
