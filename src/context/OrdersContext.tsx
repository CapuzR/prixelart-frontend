import React, { createContext, useReducer, useContext } from "react"
import {
  CheckoutState,
  CheckoutAction,
} from "@apps/consumer/checkout/interfaces"
import { initializeCheckoutState } from "@apps/consumer/checkout/init"
import { checkoutReducer } from "@apps/consumer/checkout/Reducers/reducer"
import { useCart } from "./CartContext"


// TODO: move a Checkout fully to Admin bc is bigger and must be independent
const OrderContext = createContext<{
  state: CheckoutState
  dispatch: React.Dispatch<CheckoutAction>
} | null>(null)

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { cart } = useCart()

  const [state, dispatch] = useReducer(
    checkoutReducer,
    initializeCheckoutState(cart)
  )
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrder debe usarse dentro de OrderProvider")
  }
  return context
}
