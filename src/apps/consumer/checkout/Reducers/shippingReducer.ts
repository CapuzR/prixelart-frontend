import { ShippingDetails, CheckoutAction } from '../interfaces';

export const shippingReducer = (
  shipping: ShippingDetails,
  action: CheckoutAction
): ShippingDetails => {
  switch (action.type) {
    case 'SET_SHIPPING_METHOD': {
      // Ensure payload has the expected structure
      const { method } = action.payload as { method: string };
      if (!method) {
        console.warn('Invalid shipping method in action payload.');
        return shipping;
      }

      const selectedMethod = shipping.method?.id === method ? shipping.method : undefined;

      if (!selectedMethod) {
        console.warn(`Shipping method "${method}" not found.`);
        return shipping;
      }

      return { ...shipping, method: selectedMethod };
    }

    case 'SET_SHIPPING_DETAILS':
      return { ...shipping, ...action.payload };

    default:
      return shipping;
  }
};
