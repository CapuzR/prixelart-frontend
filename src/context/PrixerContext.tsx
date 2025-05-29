import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
} from "react"

export interface ModalState {
}

export type ModalAction =
  | { type: "OPEN_UPLOAD_ART_MODAL" }
  | { type: "CLOSE_UPLOAD_ART_MODAL" }
  | { type: "OPEN_UPLOAD_SERVICE_MODAL" }
  | { type: "CLOSE_UPLOAD_SERVICE_MODAL" }

export const modalReducer = (
  state: ModalState,
  action: ModalAction
): ModalState => {
  switch (action.type) {
    case "OPEN_UPLOAD_ART_MODAL":
      return { ...state, isUploadArtModalOpen: true }
    case "CLOSE_UPLOAD_ART_MODAL":
      return { ...state, isUploadArtModalOpen: false }
    case "OPEN_UPLOAD_SERVICE_MODAL":
      return { ...state, isUploadServiceModalOpen: true }
    case "CLOSE_UPLOAD_SERVICE_MODAL":
      return { ...state, isUploadServiceModalOpen: false }
    default:
      return state
  }
}

const initialState: ModalState = {
  isUploadArtModalOpen: false,
  isUploadServiceModalOpen: false,
}

interface ModalContextProps {
  state: ModalState
  dispatch: Dispatch<ModalAction>
  openUploadArtModal: () => void
  closeUploadArtModal: () => void
  openUploadServiceModal: () => void
  closeUploadServiceModal: () => void
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined)

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState)
  const openUploadArtModal = () => dispatch({ type: "OPEN_UPLOAD_ART_MODAL" })
  const closeUploadArtModal = () => dispatch({ type: "CLOSE_UPLOAD_ART_MODAL" })
  const openUploadServiceModal = () =>
    dispatch({ type: "OPEN_UPLOAD_SERVICE_MODAL" })
  const closeUploadServiceModal = () =>
    dispatch({ type: "CLOSE_UPLOAD_SERVICE_MODAL" })

  return (
    <ModalContext.Provider
      value={{
        state,
        dispatch,
        openUploadArtModal,
        closeUploadArtModal,
        openUploadServiceModal,
        closeUploadServiceModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModals = (): ModalContextProps => {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error("useModals debe ser usado dentro de un ModalProvider")
  }
  return context
}
