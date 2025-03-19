import styles from './styles.module.scss';
import { Item } from './interfaces';
import Typography from 'components/Typography';

export interface ItemContentProps {
  item: Item;
  direction?: 'row' | 'column';
}

export default function ItemContent({ item, direction = 'row' }: ItemContentProps) {
  const getSelectedAttributes = () => {
    return item.product?.selection
      .slice(0, 3)
      .filter((attr) => attr.value !== '')
      .map((attr, index) => (
        <Typography key={index} level="p" color="textSecondary" leading="normal">
          <strong>{attr.name}</strong>: {attr.value}
        </Typography>
      ));
  };

  console.log('ItemContent', item);

  return (
    <div className={`${styles['content-section']} ${styles[direction]}`}>
      <div className={`${styles['product-section']} ${direction === 'row' && styles['paper']}`}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Producto:</strong> {item.product?.name || 'Elígelo'}
        </Typography>
        {getSelectedAttributes()}
      </div>

      <div className={`${styles['art-section']} ${direction === 'row' && styles['paper']}`}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Arte:</strong> {item.art?.title || 'Selecciónalo'}
        </Typography>
        {item.art?.title && item.art?.prixerUsername && (
          <Typography level="p" color="textSecondary" leading="normal">
            <strong>Prixer:</strong> {item.art?.prixerUsername}
          </Typography>
        )}
      </div>
    </div>
  );
}
