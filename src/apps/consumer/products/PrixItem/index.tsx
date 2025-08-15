import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom";

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Grid2 from "@mui/material/Grid"
import Slider from "react-slick"
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

import banner from "@assets/images/prixItem.png"
import banner2 from "@assets/images/prixItem2.png"
import Copyright from "@components/Copyright/copyright"

import { fetchActiveProductDetails } from "../../../../api/product.api"
import { fetchArt } from "../../../../api/art.api"
import { Item } from "../../../../types/order.types"
import { useCart } from "context/CartContext";
import { useSnackBar } from "context/GlobalContext";

export default function PrixItem() {
  const { addOrUpdateItemInCart } = useCart();
const { showSnackBar } = useSnackBar();
const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState<number>(0)
  const sliderRef = useRef<any>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const basicItem = {
    productId: "6657f83b7a000200122b54de",
    artId: "qLJw_NI",
    price: "23",
    quantity: 1,
  }
  // discount
  // id
  // item
  // quantity
  // subtotal
  const [item, setItem] = useState<Partial<Item>>({})

  const buildPredefinedItem = async () => {
    try {
      const productResponse = await fetchActiveProductDetails(
        basicItem.productId
      )
      const artResponse = await fetchArt(basicItem.artId)

      if (!productResponse || !artResponse) {
        console.error("No se pudo cargar el producto o el arte.")
        return
      }

      const completeItem: Partial<Item> = {
        sku: productResponse._id?.toString(),
        art: artResponse,
        product: {
          ...productResponse,
          selection: [{ name: "General", value: "General" }],
        },
        price: basicItem.price,
      }

      setItem(completeItem)
    } catch (error) {
      console.error("Error al construir el item predefinido:", error)
    }
  }

  useEffect(() => {
    buildPredefinedItem()
  }, [])

  const handleAddToCart = () => {
    if (!item.price || item.price === "Error") {
      showSnackBar("El producto se está cargando, por favor espera.");
      return;
    }
  
    addOrUpdateItemInCart(item as Item, 1);
    showSnackBar("¡Producto agregado al carrito!");
    navigate("/carrito");
  };

  const banners = [banner, banner2]

  const items = [
    {
      title: "Descripción 1",
      description:
        "Una descripción breve pero atractiva del producto o servicio.",
      imageUrl:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500",
    },
    {
      title: "Descripción 2",
      description: "Detalles sobre por qué este servicio es la mejor opción.",
      imageUrl:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500",
    },
    {
      title: "Descripción 3",
      description: "Lo último que hemos lanzado. ¡No te lo puedes perder!",
      imageUrl:
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500",
    },
    {
      title: "Oferta Especial",
      description:
        "Aprovecha este descuento por tiempo limitado. Ideal para ti.",
      imageUrl:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500",
    },
  ]

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 1.5 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    afterChange: (current: any) => setActiveSlide(current),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.5,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.5,
        },
      },
    ],
  }

  return (
    <Grid2
      container
      sx={{
        marginTop: "-64px",
        background:
          "linear-gradient(to top, #404e5c 30%, rgba(64, 78, 92, 0) 100%)",
      }}
    >
      <Grid2
        size={{ xs: 12 }}
        sx={{
          position: "relative",
          height: "70vh",
        }}
      >
        <Grid2
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${banners[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: activeSlide % 2 === 0 ? 1 : 0,
            transition: "opacity 0.25s ease-in-out",
          }}
        />

        <Grid2
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${banners[1]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: activeSlide % 2 !== 0 ? 1 : 0,
            transition: "opacity 0.25s ease-in-out",
          }}
        />
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <Box p={5} sx={{ backgroundColor: "transparent" }}>
          <Slider {...settings} ref={sliderRef}>
            {items.map((item, index) => (
              <Box
                key={index}
                sx={{ padding: "0 10px" }}
                onClick={() =>
                  sliderRef && sliderRef?.current?.slickGoTo(index)
                }
              >
                <Card sx={{ maxWidth: "30rem", margin: "0 auto" }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={banner}
                    alt={item.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Grid2>
      <Grid2
        size={{ xs: 12 }}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {/* CTA */}
        <Button
          variant="outlined"
          size="large"
          sx={{
            color: "#fff",
            textAlign: "center",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderColor: "white",
            fontFamily: "Futura, sans-serif",
            fontStyle: "italic",
            fontWeight: "700",
          }}
           onClick={handleAddToCart}
          // disabled={isSubmitting}
        >
          Agregar al carrito
        </Button>
      </Grid2>
      <Copyright
        sx={{ color: "white", width: "100%", margin: 4 }}
        align="center"
      />
    </Grid2>
  )
}
