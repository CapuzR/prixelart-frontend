import { FC } from "react"
import { useLoading, useSnackBar, useBackdrop } from "context/GlobalContext"
import LoadingScreen from "@components/LoadingScreen/LoadingScreen"
import Snackbar from "components/SnackBar/SnackBar"
import Backdrop from "components/Backdrop"

const Utility: FC = () => {
  const { loading } = useLoading()
  const { snackbarOpen, snackbarMessage, closeSnackBar } = useSnackBar()
  const { backdropOpen } = useBackdrop()
  return (
    <>
      {loading && <LoadingScreen />}
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
