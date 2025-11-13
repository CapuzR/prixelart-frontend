import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Grid2 from '@mui/material/Grid';
import { Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Copyright from '@components/Copyright/copyright';
import { fetchActiveProductDetails } from '../../../../api/product.api';
import { fetchArt } from '../../../../api/art.api';
import { useCart } from 'context/CartContext';
import { useSnackBar } from 'context/GlobalContext';

import ReactGA from 'react-ga4';
import banner1 from '@assets/images/prix-item-bg1.webp';
import banner2 from '@assets/images/prix-item-bg2.webp';
import banner3 from '@assets/images/prix-item-bg3.webp';

import item1 from '@assets/images/prix-item1.png';
import item2 from '@assets/images/prix-item2.png';
import item3 from '@assets/images/prix-item3.png';

const items = [
  {
    productId: '649ec9521d692e001182512d',
    artId: 'DynYqTt',
    price: '72',
    title: 'X-Lona X Ávila y Esfera de Soto',
  },

  {
    productId: '649ec9521d692e001182512d',
    artId: 'NQZSJpd',
    price: '72',
    title: 'X-Lona X Ávila desde Chuao',
  },

  {
    productId: '649ec9521d692e001182512d',
    artId: 'bwBVDIK',
    price: '72',
    title: 'X-Lona X Ávila en Colores fondo negro ',
  },
];

const BANNERS = [banner1, banner2, banner3];

const SLIDER_ITEMS = [
  {
    title: 'Ávila y Esfera de Soto',
    text: 'Cuadro X-Lona, de 150 x 50 cm',
    sub: 'Prixer: dhenriquez',
    imageUrl: item1,
  },
  {
    title: 'Ávila Chuao',
    text: 'Cuadro X-Lona, de 150 x 50 cm',
    sub: 'Prixer: dhenriquez',
    imageUrl: item2,
  },
  {
    title: 'Ávila en colores',
    text: 'Cuadro X-Lona, de 150 x 50 cm',
    sub: 'Prixer: antuangio',
    imageUrl: item3,
  },
];

type Item = {
  sku: string;
  art: any;
  product: any;
  price: string;
  quantity: number;
};

export default function PrixItem() {
  const { addOrUpdateItemInCart } = useCart();
  const { showSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const ctaRef = useRef<HTMLDivElement>(null);

  const [item, setItem] = useState<Partial<Item>>({});
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isProductLoading, setIsProductLoading] = useState(true);

  useEffect(() => {
    const currentItemData = items[activeSlide];
    if (!currentItemData) return;

    const buildPredefinedItem = async () => {
      setIsProductLoading(true);
      setItem({});
      try {
        const productResponse = await fetchActiveProductDetails(currentItemData.productId);
        const artResponse = await fetchArt(currentItemData.artId);

        if (!productResponse || !artResponse) {
          console.error('No se pudo cargar el producto o el arte.');
          setItem({ price: 'Error' });
          return;
        }

        const completeItem: Partial<Item> = {
          sku: productResponse._id?.toString(),
          art: artResponse,
          product: {
            ...productResponse,
            selection: [{ name: 'Medida', value: '150x50cm' }],
          },
          price: currentItemData.price,
        };
        setItem(completeItem);
      } catch (error) {
        console.error('Error al construir el item predefinido:', error);
        setItem({ price: 'Error' });
      } finally {
        setIsProductLoading(false);
      }
    };

    buildPredefinedItem();
  }, [activeSlide]);

  const handleAddToCart = () => {
    if (isProductLoading || !item.price || item.price === 'Error') {
      showSnackBar('El producto se está cargando, por favor espera.');
      return;
    }
    
    ReactGA.event('add_to_cart', {
      currency: 'USD',
      value: Number(item.price) * (item.quantity || 1),
      items: [
        {
          item_id: item.sku || item.product?._id,
          item_name: item.product.name,
          price: Number(item.price),
          quantity: item.quantity || 1,

          item_variant: item.product.selection
            ?.map((s: { name: string; value: string }) => `${s.name}: ${s.value}`)
            .join(', '),
          arte_titulo: item.art.title,
          arte_prixer: item.art.prixerUsername,
        },
      ],
      pagina: window.location.pathname,
    });

    addOrUpdateItemInCart(item as Item, 1);
    showSnackBar("¡Producto agregado al carrito!");
    navigate("/carrito", { state: { fromPrixItem: true } })  };

  const handleSlideClick = (index: number) => {
    ReactGA.event("select_item", {
      item_list_name: "Slider de Previsualización de Item Prix",
      items: [
        {
          item_name: item.art.title,
        }
      ]
    });
    setActiveSlide(index);
  };

  const currentSlideData = SLIDER_ITEMS[activeSlide];

  return (
    <Grid2
      container
      sx={{
        marginTop: '-64px',
        background: '#565C66',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <Grid2
        size={{ xs: 12 }}
        sx={{
          position: 'relative',
          height: '61vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'end',
          alignItems: 'center',
        }}
      >
        {BANNERS.map((bannerUrl, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: isDesktop ? '100% 20%' : 'bottom',
              opacity: activeSlide === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        ))}
        <Grid2
          ref={ctaRef}
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
            padding: '10px 0 18px',
            maxWidth: isDesktop ? '550px' : '340px',
            backdropFilter: 'blur(10px)',
            backgroundColor: '#3333335e',
            borderRadius: '40px 40px 0 0',
            border: '1px solid #FFF',
            borderBottom: 'none',
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 600,
              fontSize: '25px',
              lineHeight: '100%',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            DECORA TU HOGAR{' '}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              lineHeight: '100%',
              color: '#B8B8B8',
              margin: ' 6px 0 20px',
            }}
          >
            Con Nosotros{' '}
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={handleAddToCart}
            disabled={isProductLoading}
            sx={{
              padding: '10px 94px',
              color: 'rgba(245, 246, 246, 1)',
              width: 'max-content',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: '400',
              fontSize: '8.52px',
              lineHeight: '100%',
              transition: 'all 0.3s ease-in-out',
              backgroundColor: 'rgba(210, 63, 73, 1)',
              textTransform: 'none',
            }}
          >
            {isProductLoading ? 'Cargando producto...' : 'Comprar Ahora'}
          </Button>
        </Grid2>
      </Grid2>

      <Grid2 size={{ xs: 12 }} sx={{ height: '40vh' }}>
        <Box sx={{ padding: '1rem 0 0', textAlign: 'center' }}>
          {currentSlideData && (
            <>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 700,
                  fontSize: '21px',
                  lineHeight: '100%',
                  color: '#C1C1C1',
                }}
              >
                {currentSlideData.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  marginTop: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  lineHeight: '100%',
                  color: '#B8B8B8',
                }}
              >
                {currentSlideData.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '100%',
                  color: '#B8B8B8',
                }}
              >
                {currentSlideData.sub}
              </Typography>
            </>
          )}
        </Box>

        <Box
          p={{ xs: 0, sm: 5 }}
          sx={{
            backgroundColor: 'transparent',
            display: 'flex',
            overflowX: 'auto',
            gap: '0px',
            padding: '0 10px 0 15px !important',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: '4px',
            },
            justifyContent: 'center',
          }}
        >
          {SLIDER_ITEMS.map((item, index) => (
            <Box
              key={index}
              sx={{
                padding: '10px 5px',
                cursor: 'pointer',
                minWidth: { xs: '60vw', sm: '30vw', md: '15vw' },
                flexShrink: 0,
              }}
              onClick={() => handleSlideClick(index)}
            >
              <Grid2
                sx={{
                  background: `url(${item.imageUrl})`,
                  width: '100%',
                  height: 'auto',
                  minHeight: isDesktop ? '20vh' : '45vw',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  borderRadius: '5px',
                  border: activeSlide === index ? '3px solid #FFF' : '3px solid transparent',
                  transition: 'border 0.4s ease-in-out',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '40%',
                    borderRadius: '0 0 5px 5px',
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: '400',
                    color: 'white',
                    fontSize: '11px',
                  }}
                >
                  {item.title}
                </Typography>
              </Grid2>
            </Box>
          ))}
        </Box>

        <Copyright sx={{ color: 'white', margin: 2 }} align="center" />
      </Grid2>
    </Grid2>
  );
}
