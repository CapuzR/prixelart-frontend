import { Cart } from './interfaces';

// Define the structure of the return object
interface PriceDetails {
  subTotal: number;
  IVA: number;
  total: number;
}

// Function to calculate total price
export const calculateTotalPrice = (cart: Cart): PriceDetails => {
  // Step 1: Calculate the subTotal using reduce
  const subTotal = cart.lines.reduce((sum, line) => {
    // Convert the price string to a number using the format function
    const itemPrice = line.item.product?.price;

    // Add the current item's price (considering its quantity) to the sum
    return sum + itemPrice * line.quantity;
  }, 0); // Start the sum from 0

  // Step 2: Calculate IVA (16% of the subtotal)
  const IVA = subTotal * 0.16;

  // Step 3: Calculate the Total (subTotal + IVA)
  const total = subTotal + IVA;

  // Return the formatted subTotal, IVA, and total
  return {
    subTotal: subTotal,
    IVA: IVA,
    total: total,
  };
};
