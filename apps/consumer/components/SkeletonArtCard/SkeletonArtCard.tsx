import React from "react";
import { Card, Skeleton } from "@mui/material";

const SkeletonArtCard: React.FC = () => {
  const imageSkeletonHeight = 180 + Math.floor(Math.random() * 121);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={imageSkeletonHeight}
        animation="wave"
        sx={{
          minHeight: 150,
          backgroundColor: "grey.200",
        }}
      />
    </Card>
  );
};

export default SkeletonArtCard;
