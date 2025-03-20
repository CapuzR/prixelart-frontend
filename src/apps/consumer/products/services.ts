import { Product, Variant, Selection } from "../../../types/product.types";

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

export const getFilteredOptions = (product: Product, att: { name: string; value: string[] }): string[] => {

  const selection: Selection[] = Array.isArray(product.selection)
    ? product.selection
    : typeof product.selection === 'object' && product.selection !== null
      ? Object.values(product.selection) as Selection[]
      : [];

  const otherSelections = selection.filter(sel => sel.name !== att.name && sel.value !== '');

  if (otherSelections.length === 0) {
    return att.value || [];
  }

  const validOptions = (att.value || []).filter(option => {
    return product.variants.some(variant => {
      const hasCurrentOption = variant.attributes?.some(a => a.name === att.name && a.value === option);
      if (!hasCurrentOption) return false;

      const matchesAllOthers = otherSelections.every(sel =>
        variant.attributes?.some(a => a.name === sel.name && a.value === sel.value)
      );
      return matchesAllOthers;
    });
  });

  return validOptions;
};