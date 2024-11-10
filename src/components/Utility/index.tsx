import React, { FC } from 'react';
import { useLoading, useSnackBar, useBackdrop } from 'context/GlobalContext';
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import Snackbar from 'components/SnackBar/SnackBar';
import Backdrop from 'components/Backdrop';

const Utility: FC = () => {
  const { loading } = useLoading();
  const { snackbarOpen, snackbarMessage } = useSnackBar();
  const { backdropOpen } = useBackdrop();
  return (
    <>
      {loading && <LoadingScreen />}
      {snackbarOpen && <Snackbar message={snackbarMessage} />}
      {backdropOpen && <Backdrop />}
    </>
  );
};

export default Utility;
