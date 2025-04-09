import React, { useState, useEffect } from "react"
import { useTheme } from "@mui/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"

import InstagramIcon from "@mui/icons-material/Instagram"
// import SimpleDialog from '';
import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import Button from "@mui/material/Button"
import { useNavigate } from "react-router-dom"

import CreateService from "@components/createService"
import ArtUploader from "@apps/artist/artUploader/index"
import ReactGA from "react-ga"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import backG from "images/Rectangle108.png"
import BrandsCarousel from "components/brandsCarousel/brandsCarousel"
import { Slider } from "components/Slider"
import { Image } from "components/Image"
import ProductElement from "components/ProductElement"
import { Theme } from "@mui/material/styles"
import { Art } from "../../../types/art.types"
import { Product } from "../../../types/product.types"
import {
  fetchBestArts,
  fetchBestSellers,
  fetchCarouselImages,
  fetchLatestArts,
} from "./home.utils"
import Copyright from "@components/Copyright/copyright"
import useStyles from "./home.styles"

ReactGA.initialize("G-0RWP9B33D8")
ReactGA.pageview("/")

interface CarouselItem {
  images?: {
    type: string
    url: string
  }
  width?: string
  height?: string
}

interface FallbackImage {
  url: string
}

const Home: React.FC = () => {
  const theme = useTheme<Theme>()
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"))
  const isTab = useMediaQuery(theme.breakpoints.down("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const classes = useStyles()
  const navigate = useNavigate()

  const [imagesDesktop, setImagesDesktop] = useState<{
    images: CarouselItem[]
  }>({ images: [] })
  const [imagesMobile, setImagesMobile] = useState<{ images: CarouselItem[] }>({
    images: [],
  })
  // const [openModal, setOpenModal] = useState<boolean>(false)
  // const [openArts, setOpenArts] = useState<boolean>(true)
  const [bestSellers, setBestSellers] = useState<Product[] | undefined>(
    undefined
  )
  const [latestArts, setLatestArts] = useState<Art[] | undefined>(undefined)
  const [mostSelledArts, setMostSelledArts] = useState<Art[] | undefined>(
    undefined
  )
  const [openServiceFormDialog, setOpenServiceFormDialog] =
    useState<boolean>(false)
  const [createdService, setCreatedService] = useState<boolean>(false)
  const [openArtFormDialog, setOpenArtFormDialog] = useState<boolean>(false)
  // const [tabValue, setTabValue] = useState<string>("")

  const imgsMobile: FallbackImage[] = [
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Portada%20de%20Pagina%20Web_Museo%20Chuao%20Espejo_Telefono_V1.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Canva%20Studio%20en%20Pexels_16a9.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Medhat%20Ayad%20en%20Pexels_9a16.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Pixabay_%203X.2%20Phone.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Vecislavas%20Popa%20en%20Pexels_lINEAL%20120X40.2%20%20Phone.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Daria%20Shevtsova%20en%20Pexels.jpg",
    },
  ]

  useEffect(() => {
    const normalizedFallback = imgsMobile.map((item) => ({
      images: { type: "mobile", url: item.url },
    }))
    fetchCarouselImages(normalizedFallback).then(({ desktop, mobile }) => {
      setImagesDesktop({ images: desktop })
      setImagesMobile({ images: mobile })
    })
    fetchBestSellers().then(setBestSellers)
    fetchBestArts().then(setMostSelledArts)
    fetchLatestArts().then(setLatestArts)
  }, [])

  const getBorderRadius = () => {
    if (isDesktop) return "2.9375rem"
    if (isMobile) return "1.875rem"
    if (isTab) return "2.1875rem"
    return "2.1875rem"
  }

  const handleProductCatalog = (
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault()
    navigate("/productos")
  }

  const handleProduct = (product: Product): void => {
    navigate("/productos")
    setTimeout(() => {
      const element = document.getElementById(product.name)
      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 1000)
  }

  const handleGallery = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate("/galeria")
  }

  const desktopImages = imagesDesktop?.images.filter(
    (img) => img?.images?.type === "desktop"
  )

  const formattedDesktopImages = desktopImages.map((img) => ({
    url: img.images?.url || "",
    width: img.width,
    height: img.height,
  }))

  const mobileImages = imagesMobile?.images.filter(
    (img) => !img.images || img?.images?.type === "mobile"
  )

  const formattedMobileImages = mobileImages.map((img) => ({
    url: img.images?.url || "",
    width: img.width,
    height: img.height,
  }))

  return (
    <>
      <div style={{ flex: 1, position: "relative", width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: `calc(100vh - 64px)`,
              width: "100%",
              marginTop: "64px"
            }}
          >
            {/* First Row - Slider */}
            <div
              style={{
                flex: 1,
                position: "relative",
                overflow: "auto",
                scrollbarGutter: "stable",
                width: "100vw",
              }}
            >
              {isDesktop ? (
                <Slider
                  images={formattedDesktopImages}
                  useIndicators={{
                    type: "dots",
                    position: "over",
                    color: { active: "primary", inactive: "white" },
                  }}
                  childConfig={{ qtyPerSlide: 1, spacing: "none" }}
                >
                  {desktopImages.map((img, i) => (
                    <Image
                      src={img.images?.url || ""}
                      roundedCorner={false}
                      fitTo="width"
                      objectFit="fill"
                    />
                  ))}
                </Slider>
              ) : (
                <Slider
                  images={formattedMobileImages}
                  useIndicators={{
                    type: "dots",
                    position: "over",
                    color: { active: "primary", inactive: "white" },
                  }}
                  childConfig={{ qtyPerSlide: 1, spacing: "none" }}
                >
                  {mobileImages.map((img, i) => (
                    <Image
                      key={i}
                      src={img.images?.url || ""}
                      fitTo="height"
                      roundedCorner={false}
                      objectFit="cover"
                    />
                  ))}
                </Slider>
              )}
            </div>
            {/* Second Row - Text */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                color: "#404e5c",
                backgroundColor: "#fff",
                width: "100%",
                padding: "1rem",
                textAlign: "center",
                minHeight: "50px",
              }}
            >
              <div style={{ maxWidth: "400px" }}>
                <Typography
                  component="h1"
                  variant="h1"
                  style={{
                    fontSize: "1.6em",
                    marginBottom: 0,
                  }}
                  gutterBottom
                >
                  Encuentra el <strong>cuadro</strong> ideal para ti.
                </Typography>
              </div>
            </div>
          </div>
          <div style={{ width: "clamp(300px, 90%, 90%)", alignSelf: "center" }}>
            <Grid2 container style={{ padding: "20px", paddingTop: 0 }}>
              <Grid2 size={{ sm: 12, xs: 12 }}>
                <Paper
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                    justifyContent: "center",
                    position: "relative",
                    width: "100%",
                    borderRadius: getBorderRadius(),
                    backgroundColor: "gainsboro",
                    marginBottom: "1.8rem",
                    padding: "1.2rem",
                  }}
                  elevation={5}
                >
                  <div
                    style={{
                      backgroundImage: `url(${backG})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyItems: "center",
                      padding: "1.5rem 1.5625rem 1.5rem 0px",
                      paddingRight: isMobile ? "0.9375rem" : "1.5625rem",
                      marginBottom: "1.2rem",
                      backgroundColor: "#404e5c",
                      alignItems: "end",
                      borderRadius:
                        (isDesktop && 47) ||
                        (isMobile && 30) ||
                        (isTab && 35) ||
                        35,
                    }}
                  >
                    <Typography
                      variant="h3"
                      style={{
                        color: "white",
                        marginBottom: 12,
                        fontSize:
                          (isDesktop && 30) ||
                          (isMobile && 12) ||
                          (isTab && 18) ||
                          18,
                      }}
                      fontWeight="bold"
                    >
                      <strong>¡Productos más vendidos! </strong>
                    </Typography>
                    <Typography
                      style={{
                        color: "#b7bcc1",
                        textAlign:
                          (isDesktop && "start") ||
                          ((isMobile || isTab) && "end") ||
                          "start",
                        marginBottom: 12,
                        fontSize:
                          (isDesktop && 20) ||
                          (isMobile && 8) ||
                          (isTab && 14) ||
                          14,
                        marginLeft: "140px",
                      }}
                    >
                      ¡No te lo puedes perder! Descubre los favoritos de
                      nuestros clientes
                    </Typography>

                    <Button
                      style={{
                        backgroundColor: "#d33f49",
                        color: "white",
                        borderRadius: 40,
                        fontSize: isDesktop ? 20 : 12,
                        textTransform: "none",
                        paddingLeft: 20,
                        paddingRight: 20,
                      }}
                      onClick={handleProductCatalog}
                      size={isMobile ? "small" : "medium"}
                    >
                      Ver todos
                    </Button>
                  </div>
                  {bestSellers && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        position: "relative",
                        width: "100%",
                        height:
                          (isDesktop && 450) ||
                          (isMobile && 390) ||
                          (isTab && 235) ||
                          235,
                        marginLeft: 10,
                        padding: isMobile ? 20 : "10px 30px 10px 30px",
                        marginTop: "-10px",
                        marginBottom: "-10px",
                      }}
                    >
                      <Slider
                        images={bestSellers?.map((product) => ({
                          url:
                            product?.sources?.images &&
                            product?.sources?.images?.length > 0
                              ? product.sources.images[0]?.url
                              : product.thumbUrl,
                        }))}
                        useIndicators={{
                          type: "dots",
                          position: "below",
                          color: { active: "primary", inactive: "secondary" },
                        }}
                        childConfig={{
                          qtyPerSlide: isDesktop ? 5 : isMobile ? 3 : 5,
                          spacing: "sm",
                        }}
                        autoplay={false}
                      >
                        {bestSellers?.map((product) => (
                          <ProductElement
                            src={
                              product?.sources?.images &&
                              product?.sources?.images.length > 0
                                ? product.sources.images[0]?.url
                                : product.thumbUrl
                            }
                            productName={product.name}
                            buttonLabel="Ver detalles"
                            onButtonClick={() => handleProduct(product)}
                            roundedCorner={true}
                          />
                        ))}
                      </Slider>
                    </div>
                  )}
                </Paper>
              </Grid2>
              {mostSelledArts && (
                <Paper
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%",
                    height:
                      (isDesktop && 450) ||
                      (isMobile && 500) ||
                      (isTab && 380) ||
                      380,
                    borderRadius: getBorderRadius(),
                    backgroundColor: "gainsboro",
                    padding: "1rem",
                    paddingBottom: "3rem",
                    marginBottom: "1.8rem",
                    marginTop: "1.8rem",
                  }}
                  elevation={5}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyItems: "center",
                      margin: "1rem",
                      marginBottom: "1.2rem",
                      backgroundColor: "#404e5c",
                      alignItems: "start",
                      borderRadius:
                        (isDesktop && 47) ||
                        (isMobile && 30) ||
                        (isTab && 35) ||
                        35,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "50%",
                        margin: "1.2rem",
                        gap: "1rem",
                        alignItems: "center",
                        paddingLeft:
                          (isDesktop && 40) ||
                          (isMobile && 5) ||
                          (isTab && 20) ||
                          20,
                      }}
                    >
                      <Typography
                        variant="h4"
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize:
                            (isDesktop && 30) ||
                            (isMobile && 12) ||
                            (isTab && 18) ||
                            18,
                          marginBottom: 12,
                          margin: "0",
                        }}
                      >
                        Artes más vendidos
                      </Typography>
                      <Button
                        style={{
                          backgroundColor: "#d33f49",
                          color: "white",
                          borderRadius: 40,
                          fontSize: isDesktop ? 20 : 12,
                          textTransform: "none",
                          paddingLeft: 20,
                          paddingRight: 20,
                          maxWidth: 150,
                          transform: "tran",
                        }}
                        onClick={handleGallery}
                        size={isMobile ? "small" : "medium"}
                      >
                        Ver todos
                      </Button>
                    </div>
                    <div
                      style={{
                        backgroundImage: `linear-gradient(to left, transparent, rgba(64, 78, 92,1)), url(${
                          mostSelledArts[0]?.largeThumbUrl ||
                          mostSelledArts[0]?.imageUrl
                        })`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right",
                        width: "70%",
                        height: "100%",
                        borderRadius:
                          (isDesktop && 47) ||
                          (isMobile && 30) ||
                          (isTab && 35) ||
                          35,
                      }}
                    />
                  </div>
                  <Slider
                    images={mostSelledArts?.map((art) => ({
                      url: art?.largeThumbUrl
                        ? art?.largeThumbUrl
                        : art?.imageUrl,
                    }))}
                    useIndicators={{
                      type: "dots",
                      position: "below",
                      color: { active: "primary", inactive: "secondary" },
                    }}
                    childConfig={{
                      qtyPerSlide: isDesktop ? 5 : isMobile ? 1 : 5,
                      spacing: "sm",
                    }}
                    autoplay={false}
                  >
                    {mostSelledArts?.map((art) => (
                      <Image
                        src={
                          art?.largeThumbUrl
                            ? art?.largeThumbUrl
                            : art?.imageUrl
                        }
                        roundedCorner={true}
                        fitTo="square"
                        objectFit="contain"
                      />
                    ))}
                  </Slider>
                </Paper>
              )}
              {latestArts && (
                <Paper
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%",
                    borderRadius: getBorderRadius(),
                    backgroundColor: "gainsboro",
                    padding: "1rem",
                    paddingBottom: "3rem",
                    marginBottom: "1.8rem",
                    marginTop: "1.8rem",
                  }}
                  elevation={5}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyItems: "center",
                      margin: "1rem",
                      marginBottom: "1.2rem",
                      backgroundColor: "#404e5c",
                      alignItems: "start",
                      borderRadius:
                        (isDesktop && 47) ||
                        (isMobile && 30) ||
                        (isTab && 35) ||
                        35,
                    }}
                  >
                    <div
                      style={{
                        backgroundImage: `linear-gradient(to right, transparent, rgba(64, 78, 92,1)), url(${
                          latestArts[1]?.largeThumbUrl ||
                          latestArts[1]?.imageUrl
                        })`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "left",
                        width: "70%",
                        height: "100%",
                        borderRadius:
                          (isDesktop && 47) ||
                          (isMobile && 30) ||
                          (isTab && 35) ||
                          35,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        width: "50%",
                        margin: "1.2rem",
                        gap: "1rem",
                        // alignItems: "center",
                        justifyContent: "end",
                        paddingRight:
                          (isDesktop && 40) ||
                          (isMobile && 5) ||
                          (isTab && 20) ||
                          20,
                      }}
                    >
                      <Typography
                        variant="h4"
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize:
                            (isDesktop && 30) ||
                            (isMobile && 12) ||
                            (isTab && 18) ||
                            18,
                          marginBottom: 12,
                        }}
                      >
                        Artes más recientes
                      </Typography>
                      <Button
                        style={{
                          backgroundColor: "#d33f49",
                          color: "white",
                          borderRadius: 40,
                          fontSize: isDesktop ? 20 : 12,
                          textTransform: "none",
                          paddingLeft: 20,
                          paddingRight: 20,
                        }}
                        onClick={handleGallery}
                        size={isMobile ? "small" : "medium"}
                      >
                        Ver todos
                      </Button>
                    </div>
                  </div>
                  <Grid2
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      position: "relative",
                      width: isMobile ? "88%" : "100%",
                      height:
                        (isDesktop && 490) ||
                        (isMobile && 450) ||
                        (isTab && 490) ||
                        490,
                      marginLeft: 20,
                      padding: isMobile ? 0 : "0px 30px 0px 30px",
                      marginTop: "0",
                    }}
                  >
                    <Slider
                      images={latestArts.map((art) => ({
                        url: art?.largeThumbUrl
                          ? art?.largeThumbUrl
                          : art?.imageUrl,
                      }))}
                      useIndicators={{
                        type: "dots",
                        position: "below",
                        color: { active: "primary", inactive: "secondary" },
                      }}
                      childConfig={{
                        qtyPerSlide: isDesktop ? 5 : isMobile ? 1 : 5,
                        spacing: "sm",
                      }}
                      autoplay={false}
                    >
                      {latestArts.map((art) => {
                        const artUrl = art?.largeThumbUrl
                          ? art?.largeThumbUrl
                          : art?.imageUrl
                        return <Image src={artUrl} roundedCorner={false} />
                      })}
                    </Slider>
                  </Grid2>
                </Paper>
              )}
            </Grid2>
          </div>
          <div style={{ marginTop: "1.8rem" }}>
            <BrandsCarousel />
          </div>
        </div>

        <footer className={classes.footer}>
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ color: "#404e5c" }}
          >
            Si quieres convertirte en un Prixer{" "}
            <a target="blank" href="https://prixelart.com/registrar" style={{color: 'secondary'}}>
              regístrate
            </a>
            .
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="primary"
            component="p"
          >
            <a target="blank" href="https://instagram.com/prixelart">
              <InstagramIcon color="primary"/>
            </a>
          </Typography>
          <Copyright />
        </footer>
      </div>

      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid2 className={classes.float}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
        />
      </Grid2>
      {/* {openModal && (
        <SimpleDialog
          arts={openArts}
          setTabValue={setTabValue}
          setArts={setOpenArts}
          open={openModal}
          setOpen={setOpenModal}
        />
      )} */}
    </>
  )
}

export default Home
