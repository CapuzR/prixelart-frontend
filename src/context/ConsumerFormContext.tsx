import { Consumer } from "../types/consumer.types"
import React, { createContext, useReducer, useContext } from "react"

interface ConsumerFormState {
  _id?: string
  active: boolean
  consumerType: string
  username: string
  firstname: string
  lastname: string
  ci: string
  phone: string
  email: string
  address: string
  billingAddress: string
  shippingAddress: string
  contactedBy: string | object
  birthdate: Date | undefined
  instagram: string
  facebook: string
  twitter: string
  nationalIdType: string
  nationalId: string
  gender: string
  prixerId: string
}

const initialState: ConsumerFormState = {
  active: false,
  consumerType: "",
  username: "",
  firstname: "",
  lastname: "",
  ci: "",
  email: "",
  phone: "",
  address: "",
  billingAddress: "",
  shippingAddress: "",
  contactedBy: "",
  birthdate: undefined,
  instagram: "",
  facebook: "",
  twitter: "",
  nationalIdType: "V",
  nationalId: "",
  gender: "",
  prixerId: "",
}

type ConsumerFormAction =
  | {
      type: "SET_FIELD"
      field: keyof ConsumerFormState
      value: string | boolean
    }
  | { type: "SET_CLIENT"; client: Consumer }
  | { type: "RESET_FORM" }

const ConsumerFormReducer = (
  state: ConsumerFormState,
  action: ConsumerFormAction
): ConsumerFormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
       case "SET_CLIENT":
      return { ...state, ...action.client }
    case "RESET_FORM":
      return initialState
    default:
      return state
  }
}

const ConsumerFormContext = createContext<{
  state: ConsumerFormState
  dispatch: React.Dispatch<ConsumerFormAction>
} | null>(null)

export const ConsumerFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(ConsumerFormReducer, initialState)
  return (
    <ConsumerFormContext.Provider value={{ state, dispatch }}>
      {children}
    </ConsumerFormContext.Provider>
  )
}

export const useConsumerForm = () => {
  const context = useContext(ConsumerFormContext)
  if (!context) {
    throw new Error(
      "useConsumerForm debe usarse dentro de ConsumerFormProvider"
    )
  }
  return context
}
