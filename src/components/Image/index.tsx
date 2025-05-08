import React from 'react';
import { Box } from '@mui/material';

interface ImageProps {
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  roundedCorner?: boolean;
  width?: string | number;
  height?: string | number;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  objectFit = 'cover',
  roundedCorner = true,
  width = '100%',
  height = 'auto',
}) => (
  <Box
    component="img"
    src={src}
    alt={alt}
    sx={{
      width,
      height,
      objectFit,
      borderRadius: roundedCorner ? 2 : 0,
      display: 'block',
    }}
  />
);