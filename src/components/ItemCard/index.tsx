import styles from './styles.module.scss';
import ItemPlayground from 'components/ItemPlayground';
import ItemContent from 'components/ItemContent';
import Typography from 'components/Typography';
import { formatNumberString, formatSinglePrice } from 'utils/formats';
import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { CartLine } from '../../types/cart.types';
import { Item } from 'types/order.types';

export interface ItemCardProps {
  item: Item;
  direction?: 'row' | 'column';
  handleChangeElement?: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  line?: CartLine;
}

export default function ItemCard({ item, direction = 'row', handleChangeElement, line }: ItemCardProps) {


  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  let finalPriceStrToFormat: string | null | undefined = item.price;
  let originalPriceStrToFormat: string | null | undefined = undefined;
  if (item.discount && item.discount > 0 && item.price && item.price !== 'Error') {
    const originalPriceNum = formatNumberString(item.price);

    if (!isNaN(originalPriceNum)) {
      const discountMultiplier = 1 - (item.discount / 100);
      const finalPriceNum = originalPriceNum * discountMultiplier;
      finalPriceStrToFormat = finalPriceNum.toString();
      originalPriceStrToFormat = item.price;
    } else {
      finalPriceStrToFormat = 'Error';
      originalPriceStrToFormat = undefined;
    }
  }

  const formattedPriceHtml = formatSinglePrice(
    finalPriceStrToFormat,
    currency,
    conversionRate,
    originalPriceStrToFormat
  );

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
          <div className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`} >
          </div>
        )}
      </div>
      <div className={`${styles['unit-price']}`}>
        <Typography level="h6">Unitario</Typography>
        <span dangerouslySetInnerHTML={{ __html: formattedPriceHtml }} />
      </div>
    </>
  );
}