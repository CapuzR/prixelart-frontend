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

  // Check if a discount percentage exists and is valid, and if there's a base price
  if (item.discount && item.discount > 0 && item.price && item.price !== 'Error') {
    const originalPriceNum = formatNumberString(item.price);

    if (!isNaN(originalPriceNum)) {
      // Calculate the final price after applying the discount percentage
      const discountMultiplier = 1 - (item.discount / 100);
      const finalPriceNum = originalPriceNum * discountMultiplier;

      // Prepare strings for the formatter
      // The calculated discounted price is the 'final' price for display
      finalPriceStrToFormat = finalPriceNum.toString();
      // The price stored in item.price is the 'original' price before discount
      originalPriceStrToFormat = item.price;
    } else {
      // Handle case where item.price couldn't be parsed
      finalPriceStrToFormat = 'Error';
      originalPriceStrToFormat = undefined; // Don't show original if final is error
    }
  }

  // Format the price using the new function (passing undefined for originalPrice)
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
            {/* Content for pricing-info  */}
          </div>
        )}
      </div>
      <div className={`${styles['unit-price']}`}>
        {/* Use Typography for the label */}
        <Typography level="h6">Unitario</Typography>

        {/* Render the formatted price HTML in a separate span */}
        {/* You might need to add a className to this span if you want */}
        {/* to apply similar font styling as Typography level="h6" */}
        <span dangerouslySetInnerHTML={{ __html: formattedPriceHtml }} />
      </div>
    </>
  );
}