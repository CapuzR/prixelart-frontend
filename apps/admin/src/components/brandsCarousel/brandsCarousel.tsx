import React from "react";
import Grid2 from "@mui/material/Grid";
import { Slider } from "components/Slider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import bg from "@assets/images/brands-carousel-bg.jpg";
import cocacola from "@assets/images/brands/cocacola.png";
import iskia from "@assets/images/brands/iskia.png";
import modusistema from "@assets/images/brands/modusistema.png";
import posada from "@assets/images/brands/posada.png";
import avenrut from "@assets/images/brands/avenrut.png";
import bancaribe from "@assets/images/brands/bancaribe.png";
import beco from "@assets/images/brands/beco.png";
import calox from "@assets/images/brands/calox.png";
import humanitas from "@assets/images/brands/humanitas.png";
import megalabs from "@assets/images/brands/megalabs.png";
import praline from "@assets/images/brands/praline.png";
import vesergenca from "@assets/images/brands/vesergenca.png";

import { Typography } from "@mui/material";

const images = [
  { url: cocacola },
  { url: iskia },
  { url: modusistema },
  { url: posada },
  { url: avenrut },
  { url: bancaribe },
  { url: beco },
  { url: calox },
  { url: humanitas },
  { url: megalabs },
  { url: praline },
  { url: vesergenca },
];

const BrandsCarousel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const settings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    slidesToScroll: 1,
    speed: 1000,
  };

  return (
    <Grid2
      className="carousel-container"
      sx={{
        pt: 6,
        pb: 6,
        background: `url(${bg}) center / cover no-repeat transparent`,
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          mb: 4,
          textTransform: "uppercase",
          letterSpacing: -1,
          textAlign: "center",
          fontWeight: 700,
          fontStyle: "italic",
          fontFamily: "Futura, sans-serif",
          color: "white",
        }}
      >
        Hemos trabajado con:
      </Typography>
      <Grid2 sx={{ width: isMobile ? "100%" : "80%", margin: "0 auto" }}>
        <Slider
          {...settings}
          images={images}
          childConfig={{ qtyPerSlide: 3, spacing: "none" }}
        >
          {images.map((art, i) => (
            <div key={i}>
              <img
                src={art.url}
                alt={`brand-${i}`}
                style={{
                  width: "auto",
                  height: "auto",
                  maxHeight: isMobile ? "100px" : "60px",
                  margin: "auto 0",
                }}
              />
            </div>
          ))}
        </Slider>
      </Grid2>
    </Grid2>
  );
};

export default BrandsCarousel;
