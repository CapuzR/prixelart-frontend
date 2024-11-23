import { Item } from './interfaces';
import styles from './styles.module.scss';
import { Image } from 'components/Image';
import AddImage from 'components/AddImage';
import OverlayWithIcon from 'components/OverlayWithIcon';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';

export interface ItemPlaygroundProps {
  item: Item;
  handleDeleteElement?: (type: 'producto' | 'arte', item: Item) => void;
  handleFlow?: (type: 'producto' | 'arte') => void;
}

export default function ItemPlayground({
  item,
  handleDeleteElement,
  handleFlow,
}: ItemPlaygroundProps) {
  return (
    <div className={styles['container']}>
      {item?.product?.mockUp ? (
        <div className={styles['warp-container']}></div>
      ) : (
        <div className={styles['sel-container']}>
          <div className={styles['product-area']}>
            {item?.product ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                iconRight={<DeleteIcon />}
                coverTarget="parent"
                onClickLeft={() => handleFlow('producto')}
                onClickRight={() => handleDeleteElement('producto', item)}
              >
                <Image
                  src={item?.product?.sources?.images?.[0]?.url}
                  alt={item?.product?.name}
                  fitTo="width"
                  objectFit="cover"
                />
              </OverlayWithIcon>
            ) : (
              <AddImage onClick={() => handleFlow('producto')} />
            )}
          </div>
          <div className={styles['art-area']}>
            {item?.art ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                iconRight={<DeleteIcon />}
                coverTarget="parent"
                onClickLeft={() => handleFlow('arte')}
                onClickRight={() => handleDeleteElement('arte', item)}
              >
                <Image
                  src={item.art?.largeThumbUrl}
                  alt={item.art?.title}
                  fitTo="width"
                  objectFit="contain"
                />
              </OverlayWithIcon>
            ) : (
              <AddImage onClick={() => handleFlow('arte')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
