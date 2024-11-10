import { PickedProduct, PickedArt } from './interfaces';

export const checkPermissions = (product: PickedProduct | null, art: PickedArt | null) => {
  return (
    product &&
    art &&
    product?.selection &&
    Object.keys(product?.selection).length !== 0 &&
    Object.keys(product?.selection).every(
      (key) => typeof product?.selection![key] === 'string' && product?.selection![key] !== ''
    )
  );
};
