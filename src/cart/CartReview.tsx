import React from "react";
import Grid from "components/Grid";
import { useCart } from "context/CartContext";
import ItemCard from "components/ItemCard";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "components/Typography";
import styles from './cartReview.module.scss';
import { CartItem } from "./interfaces";

const CartReview: React.FC = () => {
  const { cart } = useCart(); // Get cart from context
  const isMobile = useMediaQuery("(max-width: 600px)"); // Mobile media query
  const { deleteItemInCart, deleteElementInItem } = useCart();

  const handleDeleteElement = (type: 'producto' | 'arte', item: CartItem) => {
    const hasOtherItem = type === 'arte' ? item?.product : item?.art;
    hasOtherItem ? deleteElementInItem(item?.id, type) : deleteItemInCart(item?.id);
  };

  return (
    <div className={styles['cart-container']}>
      <div className={styles['cart-title-container']}>
        <Typography level="h3" align="center">
        {isMobile ? "Carrito" : "Carrito de compras"}
        </Typography>
      </div>

      <div className={styles['cart-grid-container']}>
        <Grid isParent={true}>
          {cart?.map((item, index) => (
            <ItemCard 
              key={index}
              item={item}
              handleDeleteElement={handleDeleteElement}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default CartReview;
