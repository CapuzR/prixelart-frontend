import React from 'react';
import Grid from 'components/Grid';
import { useCart } from 'context/CartContext';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from 'components/Typography';
import styles from './cartReview.module.scss';
import { Item } from './interfaces';
import LineCard from 'components/lineCard';

const CartReview: React.FC = () => {
  const { cart } = useCart(); // Get cart from context
  const isMobile = useMediaQuery('(max-width: 600px)'); // Mobile media query
  const { deleteLineInCart, deleteElementInItem } = useCart();

  // const handleDeleteElement = (type: 'producto' | 'arte', item: Item) => {
  //   const hasOtherItem = type === 'arte' ? item.product : item.art;
  //   hasOtherItem ? deleteElementInItem(id, type) : deleteLineInCart(line.id);
  // };

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
