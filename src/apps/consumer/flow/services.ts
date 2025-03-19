import { PickedProduct, PickedArt } from './interfaces';

export const checkPermissions = (product: PickedProduct | null, art: PickedArt | null): boolean => {
  if (!product || !art || !product.selection) {
    return false;
  }

  const selection = product.selection;
  const keys = Object.keys(selection);

  if (keys.length === 0) {
    return false;
  }

  return keys.every((key) => {
    const value = selection[key as keyof typeof selection];
    return typeof value === 'string' && value !== '';
  });
};