import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import './loading.css'; // Import the CSS file for styles

const LoadingBackdrop = ({ loading = false }) => {
  return (
    <Backdrop className="backdrop" open={loading}>
      <CircularProgress />
    </Backdrop>
  );
};

export default LoadingBackdrop;
