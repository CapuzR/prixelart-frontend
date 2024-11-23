import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
import { queryCreator } from 'apps/consumer/flow/utils';

export interface LineCardProps {
  line: CartLine;
  direction?: 'row' | 'column';
  handleDeleteElement?: (type: 'producto' | 'arte', item: Item) => void;
}

export default function LineCard({ line, direction, handleDeleteElement }: LineCardProps) {
  const { deleteLineInCart } = useCart();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const [quantity, setQuantity] = useState<string | number>(line.quantity);

  const history = useHistory();

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
    return line.item.product?.price
      ? formatPriceForUI(qty * line.item.product.price, currency, conversionRate)
      : undefined;
  };

  const handleFlow = (type: 'producto' | 'arte') => {
    const selectionAsObject: { [key: string]: string } = Array.isArray(line.item.product?.selection)
      ? line.item.product?.selection.reduce(
          (acc, sel, index) => {
            acc[`selection-${index}`] = String(sel);
            return acc;
          },
          {} as { [key: string]: string }
        )
      : line.item.product?.selection || {};

    const queryString = queryCreator(
      line.id,
      line.item.sku,
      line.item.product?.id,
      line.item.art?.artId,
      selectionAsObject,
      type,
      '1'
    );

    history.push({ pathname: '/flow', search: queryString });
  };

  return (
    <div className={`${styles['card-root']}`} id={line.id}>
      <div className={`${styles['card-content']} ${styles[direction]}`}>
        <ItemCard
          item={line.item}
          direction="row"
          handleDeleteElement={handleDeleteElement}
          handleFlow={handleFlow}
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
              <Typography level="p">0</Typography>
            </div>
          </div>
        )}
      </div>

      <ActionBar
        onUpperAction={handleDelete}
        onLowerAction={() => {}}
        upperIcon={<DeleteIcon className={styles['icon']} />}
        lowerIcon={<FileCopyIcon className={styles['icon']} />}
      />
    </div>
  );
}
