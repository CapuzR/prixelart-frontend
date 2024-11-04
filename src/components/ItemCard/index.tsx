import React, { useEffect, useState } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import styles from "./styles.module.scss";
import { useCart } from 'context/CartContext';
import { CartItem } from 'cart/interfaces';
import ItemContent from "components/ItemContent";
import ItemPlayground from "components/ItemPlayground";
import ActionBar from "./components/ActionBar"; // Import ActionBar
import Typography from "components/Typography";
import { formatPriceForUI } from "utils/formats";
import { useConversionRate, useCurrency } from "context/GlobalContext";

export interface ItemCardProps {
  item: CartItem;
  direction?: 'row' | 'column';
  hasActionBar?: boolean;
  handleDeleteElement?: (type: 'producto' | 'arte', item: CartItem) => void;
}

export default function ItemCard({
  item,
  direction = 'row',
  hasActionBar=true,
  handleDeleteElement,
}: ItemCardProps) {
  const { deleteItemInCart, addItemToCart } = useCart();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const [quantity, setQuantity] = useState<string | number>(item.quantity);


  useEffect(() => {
    item?.product?.price === undefined &&
    setQuantity(1);
  }, [item]);

  const handleDelete = () => {
    deleteItemInCart(item.id);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuantity(value ? Math.max(1, parseInt(value, 10)) : "");
  };
  
  const handleQuantityBlur = () => {
    if (!quantity) setQuantity(1);
  };

  const handleCopy = () => {
    addItemToCart({
      product: item.product,
      art: item.art,
      quantity: item.quantity,
    });
  };

  const getUnitPrice = () => {
    return item?.product?.price ?
      formatPriceForUI(item.product.price, currency, conversionRate) :
      formatPriceForUI(item?.product?.priceRange?.from, currency, conversionRate, item?.product?.priceRange?.to)
  };

  const getFinalPrice = () => {
    const qty = typeof quantity === 'string' ? 1 : quantity;
    return item?.product?.price ?
      formatPriceForUI(qty * item.product.price, currency, conversionRate) :
      undefined;
  };

  return (
    <div className={`${styles['card-root']}`} id={item.id}>
      <div className={`${styles['card-content']} ${styles[direction]}`}>
        <div className={styles['item-playground']}>
          <ItemPlayground item={item} handleDeleteElement={handleDeleteElement} />
        </div>

        <div className={styles['item-content']}>
          {/* To do: Cambiar esta confusión cochina donde direction es distinto en todos lados conceptualmente. */}
          <ItemContent item={item} direction={direction == 'row' ? 'column' : 'row'} />
          {console.log("ItemCard -> item.product", item.product)}
          {
            item.product &&
              <div className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`}>
                <div className={styles['unit-price']}>
                  <Typography level="h6">Unitario</Typography>
                  <Typography level="p">{getUnitPrice()}</Typography>
                </div>

                {item?.product?.price !== undefined && item.quantity !== undefined && (
                  <>
                    <div className={styles['quantity']}>
                      <Typography level="h6">Cantidad</Typography>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        className={styles['quantity-input']}
                        min="1"
                        disabled={item.product.price === undefined}
                      />
                    </div>

                    <div className={styles['subtotal']}>
                      <Typography level="h6">Subtotal</Typography>
                      <Typography level="p">{getFinalPrice()}</Typography>
                    </div>
                  </>
                )}
              </div>
          }
        </div>
      </div>
    
      {hasActionBar &&
      <ActionBar
        onUpperAction={handleDelete}
        onLowerAction={handleCopy}
        upperIcon={<DeleteIcon className={styles['icon']} />}
        lowerIcon={<FileCopyIcon className={styles['icon']} />}
      />}

    </div>
  );
}
