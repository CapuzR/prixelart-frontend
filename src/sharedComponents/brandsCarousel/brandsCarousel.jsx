import React, { useState, useEffect } from "react"
import { useTheme } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"

import "./brands.scss"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

import chiguire from "../../images/brands/chiguire.png"
import cocacola from "../../images/brands/cocacola.png"
import iskia from "../../images/brands/iskia.png"
import modusistema from "../../images/brands/modusistema.png"
import posada from "../../images/brands/posada.png"

const images = [chiguire, cocacola, iskia, modusistema, posada]

const BrandsCarousel = () => {
  const [nextIndex, setNextIndex] = useState(0)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTab = useMediaQuery(theme.breakpoints.down("lg"))

  const handleNext = (current, next) => {
    setNextIndex(next)
  }

  const settings = {
    autoplay: true,
    autoplaySpeed: 4000,
    beforeChange: (current, next) => handleNext(current, next),
    infinite: true,
    slidesToScroll: 1,
    slidesToShow: isMobile ? 1 : 3,
    speed: 1000,
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {images?.map((art, i) => (
          <div
            key={i}
            className="container"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100% !important",
            }}
          >
            <div
              className={`${nextIndex + 1 === i ? "brand-next" : "brand"}`}
              style={{
                backgroundImage: `url(${art})`,
                height: isMobile ? 80 : nextIndex + 1 === i ? 100 : 60,
                width: "100%",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                marginTop: nextIndex + 1 !== i && 20,
                transition: "height 0.5s ease, margin-top 0.5s ease",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default BrandsCarousel
