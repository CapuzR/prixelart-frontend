import { Product } from "products/interfaces";


export const checkPermissions = (product: Product | null, selectedArt: string | null) => {
    return (
        product &&
        selectedArt &&
        product.selection &&
        Object.keys(product.selection).every(
            (key) => typeof product.selection![key] === 'string' && product.selection![key] !== ''
        )
    );
};
  