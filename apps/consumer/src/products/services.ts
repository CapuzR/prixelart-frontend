import {
  Product,
  Variant,
  VariantAttribute,
} from "@prixpon/types/product.types";

type CurrentSelection = {
  [key: string]: string;
};

export const getSelectedVariant = (
  selectedAtt: VariantAttribute[],
  variants: Variant[],
): Variant | null => {
  // Ensure variants array exists and is not empty
  if (!variants || variants.length === 0) {
    console.warn("getSelectedVariant: No variants provided.");
    return null;
  }

  // Filter out any selected attributes with empty values, as these don't define a selection yet
  // (Details.tsx already does this, but good to be safe)
  const validSelectedAtt = selectedAtt.filter(
    (att) =>
      att.value !== null && att.value !== undefined && att.value.trim() !== "",
  );

  const selectedVariant = variants.find((variant) => {
    // A variant matches the selection if and only if:
    // 1. The variant exists and has attributes.
    // 2. The number of valid selected attributes exactly matches the number of attributes on the variant.
    //    This ensures that a complete set of attributes has been selected by the user to identify a unique variant.
    // 3. Every attribute in the validSelectedAtt array is found in the variant's attributes (matching name and value).

    if (!variant || !variant.attributes) {
      // If a variant has no attributes, it can only match an empty selection
      return (
        validSelectedAtt.length === 0 &&
        (!variant || !variant.attributes || variant.attributes.length === 0)
      );
    }

    // Condition 2: The number of selected attributes must match the number of attributes on the variant
    if (validSelectedAtt.length !== variant.attributes.length) {
      return false; // Mismatch in attribute count means it's not the specific variant for this selection
    }

    // Condition 3: Check if EVERY attribute in validSelectedAtt exists in the variant's attributes
    const allSelectedAttributesMatch = validSelectedAtt.every(
      (selectedAttr) => {
        // For each selected attribute, check if the variant has an attribute
        // with the same name AND same value.
        return variant.attributes.some(
          (variantAttr) =>
            variantAttr.name === selectedAttr.name &&
            variantAttr.value === selectedAttr.value,
        );
      },
    );

    return allSelectedAttributesMatch;
  });

  if (!selectedVariant) {
    // Use console.warn or console.debug for less critical messages in production
    // Logging the selected attributes is helpful for debugging why no match was found
    console.warn(
      "No matching variant found for selected attributes:",
      validSelectedAtt,
    );
    return null;
  }

  return selectedVariant;
};

export const getFilteredOptions = (
  product: Product | undefined, // Product can be undefined initially
  att: { name: string; value: string[] },
  currentSelection: CurrentSelection, // Receive the current selection here
): string[] => {
  // If product or its variants are not available, return the original options
  if (!product?.variants || product.variants.length === 0) {
    return att.value || [];
  }

  const allProductAttributeNames = new Set<string>();
  product.variants.forEach((variant) => {
    variant.attributes?.forEach((variantAttr) => {
      allProductAttributeNames.add(variantAttr.name);
    });
  });

  const otherSelectedAttributes = Object.entries(currentSelection)
    .filter(
      ([name, value]) =>
        name !== att.name && // Not the attribute we are currently finding options for
        value !== "" && // Has a value
        value !== undefined &&
        allProductAttributeNames.has(name), // IMPORTANT: Is this 'name' a real attribute of this product?
    )
    .map(
      ([name, value]) =>
        ({ name, value: String(value) }) as { name: string; value: string },
    );

  if (otherSelectedAttributes.length === 0) {
    return att.value || []; // Return all possible values for 'att.name'
  }

  // Filter the potential options for the current attribute
  const validOptions = (att.value || []).filter((option) => {
    // Check if any variant exists that:
    // 1. Has the current attribute with the option being considered.
    // 2. Matches all other currently selected attributes.
    return product.variants!.some((variant) => {
      // Check if the variant has the current attribute with the specific option
      const hasCurrentOption = variant.attributes?.some(
        (a) => a.name === att.name && a.value === option,
      );
      if (!hasCurrentOption) {
        return false; // This variant doesn't have the current option with the right value
      }

      // Check if the variant matches all other selected attributes
      const matchesAllOtherSelectedProductAttributes =
        otherSelectedAttributes.every((otherSelAttr) =>
          variant.attributes?.some(
            (variantAttribute) =>
              variantAttribute.name === otherSelAttr.name &&
              variantAttribute.value === otherSelAttr.value,
          ),
        );

      return matchesAllOtherSelectedProductAttributes;
    });
  });

  return validOptions;
};
