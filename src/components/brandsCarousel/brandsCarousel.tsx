import React from "react"
import Grid2 from "@mui/material/Grid"
import { Slider } from "components/Slider"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

import bg from "../../assets/images/brands-carousel-bg.jpg"
import cocacola from "../../images/brands/cocacola.png"
import iskia from "../../images/brands/iskia.png"
import modusistema from "../../images/brands/modusistema.png"
import posada from "../../images/brands/posada.png"
import { Typography } from "@mui/material"

const images = [
  { url: cocacola },
  { url: iskia },
  { url: modusistema },
  { url: posada },
]

const BrandsCarousel: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const settings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    slidesToScroll: 1,
    speed: 1000,
  }

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
  )
}

export default BrandsCarousel
