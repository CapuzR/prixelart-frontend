import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import styles from './styles.module.scss';
import { useCart } from 'context/CartContext';
import ActionBar from './components/ActionBar';
import Typography from 'components/Typography';
import ItemCard from 'components/ItemCard';
import { CartLine, Item } from '../interfaces';
import { formatPriceForUI } from 'utils/formats';
import { useConversionRate, useCurrency } from 'context/GlobalContext';

export interface LineCardProps {
  line: CartLine;
  direction?: 'row' | 'column';
  handleDeleteElement?: (type: 'producto' | 'arte', item: Item) => void;
}

export default function LineCard({ line, direction = 'row', handleDeleteElement }: LineCardProps) {
  const { deleteLineInCart } = useCart();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const [quantity, setQuantity] = useState<string | number>(line.quantity);

  useEffect(() => {
    line.item.product?.price === undefined && setQuantity(1);
  }, [line.quantity]);

  const handleDelete = () => {
    deleteLineInCart(line.item.sku);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuantity(value ? Math.max(1, parseInt(value, 10)) : '');
  };

  const handleQuantityBlur = () => {
    if (!quantity) setQuantity(1);
  };

  const getFinalPrice = () => {
    const qty = typeof quantity === 'string' ? 1 : quantity;
    return line.item.price
      ? formatPriceForUI(qty * line.item.price, currency, conversionRate)
      : undefined;
  };

  return (
    <div className={`${styles['card-root']}`} id={line.id}>
      <div className={`${styles['card-content']} ${styles[direction]}`}>
        <ItemCard
          item={line.item}
          direction="row"
          handleDeleteElement={handleDeleteElement}
        />
        {line.item.product && line.quantity !== undefined && (
          <div className={styles['line-details']}>
            <div className={styles['quantity']}>
              <Typography level="h6">Cantidad</Typography>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className={styles['quantity-input']}
                min="1"
                disabled={line.item.product.price === undefined}
              />
            </div>

            <div className={styles['subtotal']}>
              <Typography level="h6">Subtotal</Typography>
              <Typography level="p">{getFinalPrice()}</Typography>
            </div>
          </div>
        )}
      </div>

      <ActionBar
        onUpperAction={handleDelete}
        onLowerAction={() => { }}
        upperIcon={<DeleteIcon className={styles['icon']} />}
        lowerIcon={<FileCopyIcon className={styles['icon']} />}
      />
    </div>
  );
}
