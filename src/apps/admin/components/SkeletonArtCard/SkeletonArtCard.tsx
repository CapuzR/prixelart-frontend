// components/SkeletonArtCard/SkeletonArtCard.tsx
import React from "react";
import { Card, Skeleton, Box } from "@mui/material";

const SkeletonArtCard: React.FC = () => {
  // Calculate a random height for the image placeholder to mimic masonry.
  // Ensure a substantial base height and integer values.
  const imageSkeletonHeight = 180 + Math.floor(Math.random() * 121); // Results in heights between 180px and 300px

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Allow card to take height defined by its content or masonry parent
      }}
    >
      {/* Image Skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={imageSkeletonHeight}
        animation="wave"
        sx={{
          // Ensure a minimum height in case calculation is too small (though unlikely with current range)
          minHeight: 150, // This should make it very visible
          backgroundColor: "grey.200", // Slightly more visible default skeleton color
        }}
      />
    </Card>
  );
};

export default SkeletonArtCard;
