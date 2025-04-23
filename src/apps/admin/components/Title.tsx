import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';

interface TitleProps {
  title: string;
}
export default function Title({title}: TitleProps) {
  return (
    <Typography component="h2" variant="h5" color="primary" gutterBottom>
      {title}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};
