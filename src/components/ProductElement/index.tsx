import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material';

interface ProductElementProps {
  src: string;
  productName: string;
  buttonLabel: string;
  onButtonClick: () => void;
  roundedCorner?: boolean;
}

const ProductElement: React.FC<ProductElementProps> = ({
  src,
  productName,
  buttonLabel,
  onButtonClick,
  roundedCorner = true,
}) => {
  const borderRadiusValue = roundedCorner ? 2 : 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        borderRadius: borderRadiusValue,
        overflow: 'hidden',
      }}
      variant="outlined"
    >
      {/* Image Container - Use Box for layout control */}
      <Box
        sx={{
          // Aim for ~70% height, but prioritize square aspect ratio
          // Using aspect-ratio is more modern, but paddingTop is safer for cross-browser
          position: 'relative', // Needed for the paddingTop trick to work correctly with content inside/overlayed
          width: '100%', // Take full width
          paddingTop: '100%', // Square aspect ratio (height is 100% of width)
          // flex: '0 1 70%', // Alternative if fixed percentage is more important than aspect ratio
          // height: '70%' // Alternative: use fixed height instead of aspect ratio
        }}
      >
        <CardMedia
          component="img"
          image={src}
          alt={productName}
          sx={{
            position: 'absolute', // Position inside the Box
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Cover the area
            // Optional: If you want the image ITSELF rounded, not just the card
            // borderRadius: roundedCorner ? 'inherit' : 0,
          }}
        />
      </Box>

      {/* Product Name */}
      <CardContent
        sx={{
          // Allow content to grow but prioritize image and actions space
          flexGrow: 1,
          // Or control height more explicitly :
          // flex: '0 0 auto', // Don't grow or shrink, take natural height
          // height: '10%', // Approximate height, might cause overflow
          py: 1, // Add some padding top/bottom (adjust )
          px: 1,
        }}
      >
        <Typography variant="subtitle1" component="div" noWrap fontWeight="bold">
          {productName}
        </Typography>
      </CardContent>

      {/* Button */}
      <CardActions
        sx={{
          justifyContent: 'center', // Center the button within the actions area
          // Control height explicitly :
          // flex: '0 0 auto', // Don't grow or shrink
          // height: '10%', // Approximate height
          pb: 2, // Add some padding bottom (adjust )
          px: 1,
        }}
      >
        {/* Removed fullWidth to allow centering */}
        <Button
          size="small"
          variant="contained" // Matches original 'filled' type conceptually
          color="primary" // Matches original 'primary' color
          onClick={onButtonClick}
          sx={{ textTransform: 'none' }} // Keep label case as is
        >
          {buttonLabel}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductElement;