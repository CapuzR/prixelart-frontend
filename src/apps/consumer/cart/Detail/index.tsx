import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import styles from './styles.module.scss';
import { useCart } from 'context/CartContext';
import ActionBar from './components/ActionBar';
import Typography from 'components/Typography';
import ItemCard from 'components/ItemCard';
import { formatPriceForUI } from 'utils/formats';
import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { Item } from '../../../../types/item.types';
import { CartLine } from '../../../../types/cart.types';

export interface LineCardProps {
  line: CartLine;
  direction?: 'row' | 'column';
  handleChangeElement?: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  checking?: boolean
}

export default function LineCard({ line, direction = 'row', handleChangeElement, checking }: LineCardProps) {
  const { deleteLineInCart, updateCartLine } = useCart();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const [quantity, setQuantity] = useState<string | number>(line.quantity);

  const handleDelete = () => {
    deleteLineInCart(line);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuantity(value ? Math.max(1, parseInt(value, 10)) : '');
  };

  const handleQuantityBlur = () => {

    const qty = typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity;

    setQuantity(qty);

    if (qty !== line.quantity) {
      updateCartLine(line.id, { quantity: qty });
    }
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
          handleChangeElement={handleChangeElement}
          line = {line}
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
                disabled={checking}
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
        onUpperAction={!checking ? handleDelete : undefined}
        // onLowerAction={() => { }}
        upperIcon={<DeleteIcon className={styles['icon']} />}
      // lowerIcon={<FileCopyIcon className={styles['icon']} />}
      />

    </div>
  );
}
