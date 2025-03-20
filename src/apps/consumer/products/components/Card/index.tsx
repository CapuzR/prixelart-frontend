import Button from 'components/Button';
import Typography from '@mui/material/Typography';
import { WhatsApp, AddShoppingCart } from '@mui/icons-material';
// import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { formatPriceForUI } from 'utils/formats';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import utils from 'utils/utils.js';

import styles from './styles.module.scss';
import { Product } from '../../../../../types/product.types';
import { queryCreator } from '@apps/consumer/flow/helpers';
import { useNavigate } from 'react-router-dom';

export interface CardProps {
  product: Product;
  currency: 'USD' | 'Bs';
  conversionRate: number;
  handleDetails: (product: Product) => void;
  isCart?: boolean;
  onProductSelect?: (product: Product) => void;
}
export default function Card({ product, currency, conversionRate, handleDetails, isCart, onProductSelect }: CardProps) {

  const navigate = useNavigate();

  function handleProductSelection(): void {

    let art: string | undefined;
    const queryString = queryCreator(
      undefined,
      product.id,
      undefined,
      undefined,
    );

    navigate(`/crear-prix?${queryString}`)
  }



  return (
    <div
      className={`${styles['card-root']}`}
      id={product.name}
      style={isCart ? { flexDirection: 'column', alignItems: 'center' } : {}}
    >
      <div className={styles['slider-container']}>
        <Slider images={product?.sources?.images}>
          {product?.sources?.images?.map((image, i) => (
            <Image key={i} src={image.url} alt={product?.name} />
          ))}
        </Slider>
      </div>
      <div className={styles['card-content']}>
        <div className={styles['main-content']}>
          <Typography gutterBottom variant="h4" component="h3" className="truncate" sx={{ fontSize: '1.9rem' }} >
            {product.name.split('\r\n')[0]}
          </Typography>
          <p style={isCart ? { margin: 0 } : {}}>
            {product.description.split('\r\n')[0].length > 60
              ? `${product.description.split('\r\n')[0].slice(0, 65)}...`
              : `${product.description.split('\r\n')[0]}`}
          </p>
          <Typography
            gutterBottom
            style={{
              fontSize: 15,
              marginTop: '1rem',
              backgroundColor: '#fff',
              ...(isCart ? { margin: 0 } : {})
            }}
          >
            {formatPriceForUI(
              product.priceRange.from,
              currency,
              conversionRate,
              product.priceRange.to
            )}
          </Typography>
        </div>
        <div className={styles['buttons-wrapper']} >

          {!onProductSelect && (
            <Button onClick={() => handleProductSelection()}>
              <AddShoppingCart />
            </Button>
          )}
          <Button onClick={() => handleDetails(product)}>Detalles</Button>
          <Button
            type="onlyText"
            color="primary"
            className={styles['waButton']}
            onClick={() => {
              const currentUrl = window.location.href;
              window.open(utils.generateWaProductMessage(product, currentUrl), '_blank');
            }}>
            <WhatsApp /> Info
          </Button>
        </div>
      </div>
    </div>
  );
}
