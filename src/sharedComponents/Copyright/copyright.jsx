import React from 'react';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';


export default function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" label='prixelart.com' href="https://prixelart.com/">
          prixelart.com
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }