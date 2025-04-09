import React from "react"

import { Slider } from "components/Slider"

import chiguire from "../../images/brands/chiguire.png"
import cocacola from "../../images/brands/cocacola.png"
import iskia from "../../images/brands/iskia.png"
import modusistema from "../../images/brands/modusistema.png"
import posada from "../../images/brands/posada.png"
import "./brands.styles.scss"

const images = [
  { url: chiguire },
  { url: cocacola },
  { url: iskia },
  { url: modusistema },
  { url: posada },
]

const BrandsCarousel: React.FC = () => {
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
        childConfig={{ qtyPerSlide: 3, spacing: "md" }}
      >
        {images.map((art, i) => (
          <div key={i} className="carousel-item">
            <img
              src={art.url}
              alt={`brand-${i}`}
              style={{
                width: "fit-content",
                height: "100px",
                margin: "0 auto 20px",
                // filter: "brightness(0)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default BrandsCarousel
