import React from "react"

import { Slider } from "components/Slider"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

import cocacola from "../../images/brands/cocacola.png"
import iskia from "../../images/brands/iskia.png"
import modusistema from "../../images/brands/modusistema.png"
import posada from "../../images/brands/posada.png"

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
    <div className="carousel-container">
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
                filter: "brightness(0)",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default BrandsCarousel
