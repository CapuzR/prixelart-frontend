import { ShippingDetails, CheckoutAction } from "../interfaces"

const defaultState = { name: "", lastName: "", phone: "", email: "" }

export const shippingReducer = (
  shipping: ShippingDetails,
  action: CheckoutAction
): ShippingDetails => {
  const currentState = shipping || defaultState

  switch (action.type) {
    case "SET_SHIPPING_METHOD": {
      // Ensure payload has the expected structure
      const { method } = action.payload as { method: string }
      if (!method) {
        console.warn("Invalid shipping method in action payload.")
        return shipping
      }

      const selectedMethod =
        typeof shipping.method !== "string" && shipping.method?.id === method
          ? shipping.method
          : undefined

      if (!selectedMethod) {
        console.warn(`Shipping method "${method}" not found.`)
        return shipping
      }

      return { ...shipping, method: selectedMethod }
    }
    case "SET_SHIPPING_BASIC": {
      const { payload } = action

      return {
        ...currentState,
        basic: {
          ...currentState.basic,
          ...payload,
        },
      }
    }

    case "SET_SHIPPING_DETAILS":
      return { ...shipping, ...action.payload }

    default:
      return shipping
  }
}
