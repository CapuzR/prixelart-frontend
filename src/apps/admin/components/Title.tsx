import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';

export default function Title({title}) {
  return (
    <Typography component="h2" variant="h5" color="primary" gutterBottom>
      {title}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};
