import styles from './styles.module.scss';
import ItemPlayground from 'components/ItemPlayground';
import ItemContent from 'components/ItemContent';
import Typography from 'components/Typography';
import { formatPriceForUI } from 'utils/formats';
import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { Item } from '../../types/item.types';
import { CartLine } from '../../types/cart.types';

export interface ItemCardProps {
  item: Item;
  direction?: 'row' | 'column';
  handleChangeElement?: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  line?: CartLine;
}

export default function ItemCard({ item, direction = 'row', handleChangeElement, line }: ItemCardProps) {
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
          handleChangeElement={handleChangeElement}
          line={line}
        />
      </div>
      <div className={styles['item-content']}>
        <ItemContent item={item} direction={direction === 'row' ? 'column' : 'row'} />
        {item.product && (
          <div className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`}          >
          </div>
        )}
      </div>
      <div className={`${styles['unit-price']}`}>
        <Typography level="h6">Unitario</Typography>
        <Typography level="h6">{getUnitPrice()}</Typography>
      </div>
    </>
  );
}
