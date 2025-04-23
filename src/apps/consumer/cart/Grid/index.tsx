import React from 'react';
import Grid from 'components/Grid';
import { useCart } from 'context/CartContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from 'components/Typography';
import styles from './styles.module.scss';
import LineCard from '../Detail';
import { useNavigate } from 'react-router-dom';
import { queryCreator } from '@apps/consumer/flow/helpers';
import { Button } from '@mui/material';
import { Item } from '../../../../types/item.types';
import { CartLine } from '../../../../types/cart.types';

interface CartReviewProps {
  checking: boolean;
}

const CartReview: React.FC<CartReviewProps> = ({ checking }) => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 600px)');

  const handleChangeElement = (type: 'producto' | 'arte', item: Item, lineId?: string) => {

    const selectionAsObject: { [key: string]: string } = Array.isArray(item.product?.selection)
      ? item.product.selection.reduce((acc, sel) => {
        acc[sel.name] = sel.value;
        return acc;
      }, {} as { [key: string]: string })
      : item.product?.selection || {};

    const queryString = queryCreator(
      lineId ? lineId : undefined,
      type === 'producto' ? undefined : item.product?.id,
      type === 'arte' ? undefined : item.art?._id,
      selectionAsObject
    );
    navigate(`/crear-prix?${queryString}`);
  };

  return (
    <div className={styles['cart-container']}>
      {!checking && (
        <>
          <div className={styles['cart-title-container']}>
            <Typography level="h3" align="center">
              {isMobile ? 'Carrito' : 'Carrito de compras'}
            </Typography>
          </div>

          {cart.lines.length > 0 ? (
            <div className={styles['cart-grid-container']}>
              <Grid isParent={true}>
                {cart.lines.map((line: CartLine, index: number) => (
                  <LineCard
                    key={index}
                    direction="row"
                    line={line}
                    handleChangeElement={handleChangeElement}
                    checking={checking}
                  />
                ))}
              </Grid>
            </div>
          ) : (
            <div className={styles['cart-grid-container']}>
              <Typography level="h5" align="center">
                Tu carrito está vacío!
              </Typography>
            </div>
          )}

          <div className={styles['cart-add-more']}>
            <Button style={{ backgroundColor: 'red', color: 'white', borderRadius: '8px', padding: '10px 20px', width: '80%', marginLeft: '10%', marginTop: '33px' }} onClick={() => navigate('/productos')}>
              {cart.lines.length > 0 ? 'Añadir Más Productos' : 'Añadir Productos'}
            </Button>
          </div>
        </>
      )}

    </div>
  );
};

export default CartReview;
