import React from 'react';
import Grid from 'components/Grid';
import { useCart } from 'context/CartContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from 'components/Typography';
import styles from './styles.module.scss';
import { Item } from '../interfaces';
import LineCard from '../Detail';
import { useNavigate } from 'react-router-dom';
import { queryCreator } from '@apps/consumer/flow/utils';
import { Button } from '@mui/material';

interface CartReviewProps {
  checking: boolean;
}

const CartReview: React.FC<CartReviewProps> = ({ checking }) => {
  const { cart, deleteLineInCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 600px)');

  const handleChangeElement = (type: 'producto' | 'arte', item: Item) => {
    const matchingLine = cart.lines.find((line) => {
      const skuMatch = line.item.sku === item.sku;
      const artMatch = item.art ? line.item.art?._id === item.art._id : true;
      return skuMatch && artMatch;
    });
    if (matchingLine) {
      deleteLineInCart(matchingLine.item.sku);

      const selectionAsObject: { [key: string]: string } = Array.isArray(item.product?.selection)
        ? item.product.selection.reduce((acc, sel) => {
          acc[sel.name] = sel.value;
          return acc;
        }, {} as { [key: string]: string })
        : item.product?.selection || {};

      const queryString = queryCreator(
        undefined,
        undefined,
        type === 'producto' ? undefined : item.product?.id,
        type === 'arte' ? undefined : item.art?._id,
        selectionAsObject
      );
      console.log(`/crear-prix?${queryString}`);
      navigate(`/crear-prix?${queryString}`);
    }
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
              handleChangeElement={handleChangeElement}
              checking={checking}
            />
          ))}
        </Grid>
      </div>
      {!checking && (
        <div className={styles['cart-add-more']}>
          <Button style={{ backgroundColor: 'red', color: 'white', borderRadius: '8px', padding: '10px 20px', width: '80%', marginLeft: '10%', marginTop: '33px' }} onClick={() => navigate('/productos')}>
            Añadir Más Productos
          </Button>
        </div>
      )}

    </div>
  );
};

export default CartReview;
