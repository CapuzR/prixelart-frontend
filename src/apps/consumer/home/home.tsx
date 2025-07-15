import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Paper, Typography, Button, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

import ProductElement from "components/ProductElement"
import BrandsCarousel from "components/brandsCarousel/brandsCarousel"

import { fetchCarouselImages } from "@api/preferences.api"
import { fetchBestSellers } from "@api/product.api"
import { fetchBestArts, fetchLatestArts } from "@api/art.api"

import backG from "images/Rectangle108.png"
import { CarouselItem } from "types/preference.types"
import { Product } from "types/product.types"
import { Art } from "types/art.types"
import { Slider } from "@components/Slider"
import { Image } from "@components/Image"
import Grid2 from "@mui/material/Grid"
import FooterSection from "./FooterSection"
import AboutUs from "./AboutUs"

const useBreakpoints = () => {
  const theme = useTheme()
  return {
    isXs: useMediaQuery(theme.breakpoints.down("sm")),
    isLg: useMediaQuery(theme.breakpoints.up("lg")),
    isMobile: useMediaQuery(theme.breakpoints.down("md")),
  }
}

interface CarouselSectionProps {
  title: string
  subtitle?: string
  bannerBg?: string
  items: Array<{ url: string } | Product | Art>
  onViewAll: () => void
  qtyPerSlide: number
  renderItem: (item: any, idx: number) => React.ReactNode
  isMobile: boolean
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  subtitle,
  bannerBg,
  items,
  onViewAll,
  qtyPerSlide,
  renderItem,
  isMobile,
}) => (
  <Paper
    elevation={5}
    sx={{ mb: 4, bgcolor: "grey.100", borderRadius: 8, position: "relative" }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        p: 0,
        backgroundColor: "#404e5c",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
    >
      {bannerBg && (
        <Box
          sx={{
            backgroundImage: `url(${bannerBg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: isMobile ? "right" : "center",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            p: isMobile ? 2.5 : 3,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "common.white",
              fontWeight: "bold",
              mb: 1,
              fontSize: isMobile ? "2.5rem" : "3rem",
            }}
          >
            {title}
          </Typography>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            {subtitle && (
              <Typography
                sx={{
                  color: "#b7bcc1",
                  mb: isMobile ? 0 : 2,
                  fontSize: isMobile ? "0.8rem" : "1rem",
                  textAlign: "end",
                  fontWeight: "normal",
                }}
              >
                {subtitle}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={onViewAll}
              sx={{
                backgroundColor: "#d33f49",
                color: "common.white",
                borderRadius: 5,
                textTransform: "none",
                minWidth: "6rem",
                mb: { lg: 0 },
                // height: 'fit-content'
              }}
            >
              Ver todos
            </Button>
          </div>
        </Box>
      )}
    </Box>

    <Box sx={{ p: 2, pt: 2, height: "300px" }}>
      <Slider
        images={items.map((it: any) => ({
          url: it.url || it.largeThumbUrl || it.thumbUrl,
        }))}
        useIndicators={{
          type: "dots",
          position: "below",
          color: { active: "primary", inactive: "secondary" },
        }}
        childConfig={{ qtyPerSlide, spacing: "sm" }}
        autoplay={false}
      >
        {items.map((item, idx) => (
          <React.Fragment key={idx}>{renderItem(item, idx)}</React.Fragment>
        ))}
      </Slider>
    </Box>
  </Paper>
)

interface HeroSliderProps {
  desktopImages: Array<{ url: string }>
  mobileImages: Array<{ url: string }>
  headline: string
}

const HeroSlider: React.FC<HeroSliderProps> = ({
  desktopImages,
  mobileImages,
  headline,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))

  const images = isLg ? desktopImages : mobileImages

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: `calc(100vh - 64px)`,
      }}
    >
      {images.length > 0 && (
        <Slider
          images={images}
          useIndicators={false}
          childConfig={{ qtyPerSlide: 1, spacing: "none" }}
          infinite
        >
          {images.map((item, idx) => (
            <Box
              key={idx}
              component="img"
              src={item.url}
              alt={`Hero slide ${idx}`}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ))}
        </Slider>
      )}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          bgcolor: "common.white",
          textAlign: "center",
          py: 2,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          fontSize={isMobile ? "1.4em" : "1.6em"}
        >
          {headline}
        </Typography>
      </Box>
    </Box>
  )
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { isXs, isLg, isMobile } = useBreakpoints()

  const [desktopCarousel, setDesktopCarousel] = useState<CarouselItem[]>([])
  const [mobileCarousel, setMobileCarousel] = useState<CarouselItem[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [mostSelledArts, setMostSelledArts] = useState<Art[]>([])
  const [latestArts, setLatestArts] = useState<Art[]>([])

  useEffect(() => {
    fetchCarouselImages().then((data) => {
      setDesktopCarousel(
        data
          .filter((i) => i.type === "desktop")
          .sort((a, b) => a.position - b.position)
      )
      setMobileCarousel(
        data
          .filter((i) => i.type === "mobile")
          .sort((a, b) => a.position - b.position)
      )
    })
    fetchBestSellers().then(setBestSellers)
    fetchBestArts().then(setMostSelledArts)
    fetchLatestArts().then(setLatestArts)
  }, [])

  return (
    <Box
      sx={{
        mt: isMobile ? "-56px" : "-64px",
        flex: 1,
        width: "100%",
        position: "relative",
      }}
    >
      <Grid2 container>
        <Grid2 size={{ xs: 12 }}>
          <HeroSlider
            desktopImages={desktopCarousel.map((i) => ({ url: i.imageURL }))}
            mobileImages={mobileCarousel.map((i) => ({ url: i.imageURL }))}
            headline="Encuentra el cuadro ideal para ti."
          />
        </Grid2>
        <AboutUs/>
        <Grid2 size={{ xs: 12 }}>
          <Box sx={{ mx: "auto", width: isXs ? "90%" : "80%", py: 4 }}>
            <CarouselSection
              title="¡Productos más vendidos!"
              subtitle="¡No te lo puedes perder! Descubre los favoritos de nuestros clientes"
              bannerBg={backG}
              items={bestSellers}
              onViewAll={() => navigate("/productos")}
              qtyPerSlide={isLg ? 4 : isXs ? 3 : 4}
              isMobile={isMobile}
              renderItem={(prod: Product, idx: number) => (
                <ProductElement
                  key={idx}
                  src={prod.sources?.images[0]?.url || prod.thumbUrl || ""}
                  productName={prod.name}
                  buttonLabel="Ver detalles"
                  onButtonClick={() => {
                    navigate("/productos")
                    setTimeout(() => {
                      document
                        .getElementById(prod.name)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }, 300)
                  }}
                  roundedCorner={true}
                />
              )}
            />

            <CarouselSection
              title="Artes más vendidos"
              bannerBg={
                mostSelledArts[0]?.largeThumbUrl || mostSelledArts[0]?.imageUrl
              }
              items={mostSelledArts}
              isMobile={isMobile}
              onViewAll={() => navigate("/galeria")}
              qtyPerSlide={isLg ? 3 : isXs ? 1 : 3}
              renderItem={(art: Art, idx: number) => (
                <Image
                  key={idx}
                  src={art.largeThumbUrl || art.imageUrl || ""}
                  roundedCorner={true}
                />
              )}
            />

            <CarouselSection
              title="Artes más recientes"
              bannerBg={latestArts[1]?.largeThumbUrl || latestArts[1]?.imageUrl}
              items={latestArts}
              isMobile={isMobile}
              onViewAll={() => navigate("/galeria")}
              qtyPerSlide={isLg ? 2 : isXs ? 1 : 2}
              renderItem={(art: Art, idx: number) => (
                <Image
                  key={idx}
                  src={art.largeThumbUrl || art.imageUrl || ""}
                  roundedCorner={false}
                />
              )}
            />
          </Box>
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <BrandsCarousel />
        </Grid2>
      </Grid2>

      {/* <Box
        component="footer"
        sx={{ bgcolor: "background.paper", p: 6, textAlign: "center" }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: "#404e5c" }}>
          Si quieres convertirte en un Prixer{" "}
          <a
            href="https://prixelart.com/registrar"
            target="_blank"
            rel="noopener noreferrer"
          >
            regístrate
          </a>
          .
        </Typography>
        <Typography variant="subtitle1" component="p">
          <IconButton
            href="https://instagram.com/prixelart"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon sx={{ color: "#404e5c" }} />
          </IconButton>
        </Typography>
        <Copyright />
      </Box> */}
      <FooterSection />
    </Box>
  )
}

export default Home
