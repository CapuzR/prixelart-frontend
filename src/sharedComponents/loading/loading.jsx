import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import './loading.css'; // Import the CSS file for styles

const LoadingBackdrop = ({ loading = false }) => {
  return (
    <Backdrop className="backdrop" open={loading}>
      <CircularProgress />
    </Backdrop>
  );
};

export default LoadingBackdrop;
