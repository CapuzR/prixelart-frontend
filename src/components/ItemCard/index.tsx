import React, { useState } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import styles from "./styles.module.scss";
import { useCart } from 'context/CartContext';
import { CartItem } from 'cart/interfaces';
import ItemContent from "components/ItemContent";
import ItemPlayground from "components/ItemPlayground";
import ActionBar from "./components/ActionBar"; // Import ActionBar
import Typography from "components/Typography";

export interface ItemCardProps {
  item: CartItem;
}

export default function ItemCard({
  item
}: ItemCardProps) {
  const { deleteItemInCart, addItemToCart, updateItemInCart } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleDelete = () => {
    deleteItemInCart(item.id);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    setQuantity(newQuantity);
    updateItemInCart({ ...item, quantity: newQuantity });
  }

  const handleCopy = () => {
    addItemToCart({
      product: item.product,
      art: item.art,
      quantity: item.quantity,
    });
  };

  const getUnitPrice = () => {
    return '0';
  };

  const getFinalPrice = () => {
    return '0';
  };

  return (
    <div className={`${styles['card-root']}`} id={item.id}>
    <div className={styles['card-content']}>

      <div className={styles['item-playground']}>
        <ItemPlayground item={item} />
      </div>

      <div className={styles['item-content']}>
        <ItemContent item={item} /><div className={styles['pricing-info']}>
          <div className={styles['price-group']}>
            <small>Unidad</small>
            <p>{getUnitPrice()}</p>
          </div>

          <div className={styles['price-group']}>
            <small>Cantidad</small>
            <input 
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className={styles['quantity-input']}
              min="1"
            />
          </div>

          <div className={styles['price-group']}>
            <small>Subtotal</small>
            <p>{getFinalPrice()}</p>
          </div>
        </div>
      </div>
    </div>
    
    <ActionBar
      onUpperAction={handleDelete}
      onLowerAction={handleCopy}
      upperIcon={<DeleteIcon className={styles['icon']} />}
      lowerIcon={<FileCopyIcon className={styles['icon']} />}
    />

    </div>
  );
}
