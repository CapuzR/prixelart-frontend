import React from 'react';
import Grid from 'components/Grid';
import { useCart } from 'context/CartContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from 'components/Typography';
import styles from './styles.module.scss';
import { Item } from '../interfaces';
import LineCard from '../Detail';

const CartReview: React.FC = () => {
  const { cart } = useCart();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const { deleteLineInCart, deleteElementInItem } = useCart();

  const handleDeleteElement = (type: 'producto' | 'arte', item: Item) => {
    const hasOtherItem = type === 'arte' ? item.product : item.art;
    const line = cart.lines.filter((line) => line.item.sku === item.sku);
    hasOtherItem ? deleteElementInItem(item.sku, type) : deleteLineInCart(line[0].id);
  };

  return (
    <div className={styles['cart-container']}>
      <div className={styles['cart-title-container']}>
        <Typography level="h3" align="center">
          {isMobile ? 'Carrito' : 'Carrito de compras'}
        </Typography>
      </div>

      <div className={styles['cart-grid-container']}>
        <Grid isParent={true}>
          {cart.lines.map((line, index) => (
            <LineCard
              key={index}
              direction="row"
              line={line}
              handleDeleteElement={handleDeleteElement}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default CartReview;
