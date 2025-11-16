import React from "react";
import { Card, Typography, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const borderRadiusValue = roundedCorner ? 2 : 0;

  return (
    <Card
      onClick={onButtonClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        borderRadius: borderRadiusValue,
        cursor: "pointer",
      }}
      variant="outlined"
    >
      <Box
        sx={{
          position: "relative",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "370px" : "440px",
          display: "flex",
          alignItems: "end",
          background: `url(${src}) center / cover no-repeat transparent`,
          padding: isMobile ? "0" : "2rem",
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h3"}
          sx={{
            position: "relative",
            fontFamily: "Futura, sans-serif",
            fontStyle: "italic",
            fontWeight: "700",
            color: "white",
            textShadow: "-3px 8px 22px rgba(0,0,0,0.7)",
          }}
        >
          {productName}
        </Typography>
      </Box>
    </Card>
  );
};

export default ProductElement;
