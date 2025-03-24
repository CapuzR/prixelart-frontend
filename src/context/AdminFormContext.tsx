import { Admin } from "../types/admin.types"
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

interface AdminState {
  page: number
  admin: AdminFormState
}

const initialState: AdminState = {
  page: 0,
  admin: {
    username: "",
    firstname: "",
    lastname: "",
    area: "",
    email: "",
    phone: "",
    password: "",
    isSeller: false,
  },
}

type AdminFormAction =
  | { type: "SET_FIELD"; field: keyof AdminFormState; value: string }
  | { type: "SET_ADMIN"; admin: Admin }
  | { type: "RESET_FORM" }
  | { type: "SET_PAGE"; page: number }
  | { type: "RESET_PAGE" }

const adminFormReducer = (
  state: AdminState,
  action: AdminFormAction
): AdminState => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        admin: {
          ...state.admin,
          [action.field]: action.value,
        },
      }
    case "SET_ADMIN":
      return {
        ...state,
        admin: {
          ...state.admin,
          ...action.admin,
        },
      }
    case "RESET_FORM":
      return initialState
    case "SET_PAGE":
      return { ...state, page: action.page }
    case "RESET_PAGE":
      return { ...state, page: 0 }
    default:
      return state
  }
}

const AdminFormContext = createContext<{
  state: AdminState
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
