import Button from 'components/Button';
import Typography from '@mui/material/Typography';
import { WhatsApp, AddShoppingCart } from '@mui/icons-material';
// import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import { formatPriceForUI } from 'utils/formats';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import utils from 'utils/utils.js';

import styles from './styles.module.scss';
import { Product, Art } from 'apps/consumer/products/interfaces';

export interface CardProps {
  product: Product;
  currency: 'USD' | 'Bs';
  conversionRate: number;
  handleDetails: (product: Product) => void;
  isCart?: boolean;
}
export default function Card({
  product,
  currency,
  conversionRate,
  handleDetails,
  isCart
}: CardProps) {
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
          <Typography gutterBottom variant="h4" component="h3">
            {product.name.split('\r\n')[0].length > 15
              ? `${product.name.split('\r\n')[0].slice(0, 15)}...`
              : `${product.name.split('\r\n')[0]}`}
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
          <Button onClick={() => handleDetails(product)}>Detalles</Button>
          <Button
            type="onlyText"
            color="primary"
            onClick={() => window.open(utils.generateWaProductMessage(product), '_blank')}
          >
            <WhatsApp /> Info
          </Button>
        </div>
      </div>
    </div>
  );
}
