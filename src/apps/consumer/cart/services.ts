import { Cart } from './interfaces';

interface PriceDetails {
  subTotal: number;
  IVA: number;
  total: number;
}

export const calculateTotalPrice = (cart: Cart): PriceDetails => {
  const subTotal = cart.lines.reduce((sum, line) => {
    const itemPrice = line.item.product?.price;
    return sum + itemPrice * line.quantity;
  }, 0);

  const IVA = subTotal * 0.16;
  const total = subTotal + IVA;

  return {
    subTotal: subTotal,
    IVA: IVA,
    total: total,
  };
};