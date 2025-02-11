import React, { createContext, useReducer, useContext } from "react"

interface AdminFormState {
  username: string
  firstname: string
  lastname: string
  area: string
  email: string
  phone: string
  password: string
  isSeller: boolean
}

const initialState: AdminFormState = {
  username: "",
  firstname: "",
  lastname: "",
  area: "",
  email: "",
  phone: "",
  password: "",
  isSeller: false
}

type AdminFormAction =
  | { type: "SET_FIELD"; field: keyof AdminFormState; value: string }
  | { type: "RESET_FORM" }

const adminFormReducer = (
  state: AdminFormState,
  action: AdminFormAction
): AdminFormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "RESET_FORM":
      return initialState
    default:
      return state
  }
}

const AdminFormContext = createContext<{
  state: AdminFormState
  dispatch: React.Dispatch<AdminFormAction>
} | null>(null)

export const AdminFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(adminFormReducer, initialState)
  return (
    <AdminFormContext.Provider value={{ state, dispatch }}>
      {children}
    </AdminFormContext.Provider>
  )
}

export const useAdminForm = () => {
  const context = useContext(AdminFormContext)
  if (!context) {
    throw new Error("useAdminForm debe usarse dentro de AdminFormProvider")
  }
  return context
}
