import React from 'react';
import styles from './styles.module.scss';
import ItemPlayground from 'components/ItemPlayground';
import ItemContent from 'components/ItemContent';
import Typography from 'components/Typography';
import { formatPriceForUI } from 'utils/formats';
import { Item } from './interfaces';
import { useConversionRate, useCurrency } from 'context/GlobalContext';

export interface ItemCardProps {
  item: Item;
  direction?: 'row' | 'column';
  handleDeleteElement?: (type: 'producto' | 'arte', item: Item) => void;
}

export default function ItemCard({
  item,
  direction = 'row',
  handleDeleteElement,
}: ItemCardProps) {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const getUnitPrice = () => {
    return item.price
      ? formatPriceForUI(item.price, currency, conversionRate)
      : formatPriceForUI(
          item.product?.priceRange?.from,
          currency,
          conversionRate,
          item.product?.priceRange?.to
        );
  };

  return (
    <>
      <div className={styles['item-playground']}>
        <ItemPlayground
          item={item}
          handleDeleteElement={handleDeleteElement}
        />
      </div>
      <div className={styles['item-content']}>
        <ItemContent item={item} direction={direction === 'row' ? 'column' : 'row'} />
        {item.product && (
          <div
            className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`}
          >
            <div className={styles['unit-price']}>
              <Typography level="h6">Unitario</Typography>
              <Typography level="p">{getUnitPrice()}</Typography>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
