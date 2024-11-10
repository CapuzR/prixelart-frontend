import { format } from '../../../utils/utils.js';

export const calculateTotalPrice = (cart) => {
  // Step 1: Calculate the subTotal using reduce
  const subTotal = cart.reduce((sum, item) => {
    // Convert the price string to a number using the format function
    const itemPrice = parseFloat(item.product.price.replace(',', '.'));

    // Add the current item's price (considering its quantity) to the sum
    return sum + itemPrice * item.quantity;
  }, 0); // Start the sum from 0

  // Step 2: Calculate IVA (16% of the subtotal)
  const IVA = subTotal * 0.16;

  // Step 3: Calculate the Total (subTotal + IVA)
  const total = subTotal + IVA;

  // Return the formatted subTotal, IVA, and total
  return {
    subTotal: format(subTotal),
    IVA: format(IVA),
    total: format(total),
  };
};
