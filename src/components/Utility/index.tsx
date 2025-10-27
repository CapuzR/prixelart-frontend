import { FC } from "react"
import { useSnackBar, useBackdrop } from "@context/UIContext"
import Snackbar from "components/SnackBar/SnackBar"
import Backdrop from "components/Backdrop"

const Utility: FC = () => {
  const { snackbarOpen, snackbarMessage, closeSnackBar } = useSnackBar()
  const { backdropOpen } = useBackdrop()
  return (
    <>
      {
        <Snackbar
          open={snackbarOpen}
          message={snackbarMessage}
          onClose={closeSnackBar}
        />
      }
      {backdropOpen && <Backdrop />}
    </>
  )
}

export default Utility
