import React, { FC } from 'react';
import { useLoading, useSnackBar } from 'context/GlobalContext';
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import Snackbar from 'components/SnackBar/SnackBar';

const Utility: FC = () => {
  const { loading } = useLoading();
  const { snackbarOpen, snackbarMessage } = useSnackBar();
  return (
    <>
      {loading && <LoadingScreen />}
      {snackbarOpen && <Snackbar message={snackbarMessage} />}
    </>
  );
};

export default Utility;
