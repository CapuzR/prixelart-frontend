import styles from './styles.module.scss';
import { Image } from 'components/Image';
import AddImage from 'components/AddImage';
import OverlayWithIcon from 'components/OverlayWithIcon';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { CartLine } from '../../types/cart.types';
import { Item } from 'types/order.types';

export interface ItemPlaygroundProps {
  item: Item;
  handleChangeElement?: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  line?: CartLine;
}

export default function ItemPlayground({ item, handleChangeElement, line }: ItemPlaygroundProps) {
  return (
    <div className={styles['container']}>
      {/* {item?.product?.mockUp ? (
        <div className={styles['warp-container']}></div>
      ) : ( */}
        <div className={styles['sel-container']}>
          <div className={styles['product-area']}>
            {item?.product ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                coverTarget="parent"
                onClickLeft={() => handleChangeElement!('producto', item, line ? line.id : undefined)}
              >
                <Image
                  src={item?.product?.sources?.images[0]?.url}
                  alt={item?.product?.name}
                  objectFit="cover"
                />
              </OverlayWithIcon>
            ) : (
              <AddImage />
            )}
          </div>
          <div className={styles['art-area']}>
            {item?.art ? (
              <OverlayWithIcon
                iconLeft={<AutorenewIcon />}
                coverTarget="parent"
                onClickLeft={() => handleChangeElement!('arte', item, line ? line.id : undefined)}
              >
                <Image
                  src={'largeThumbUrl' in item.art ? item.art.largeThumbUrl : item.art.url}
                  alt={item.art?.title}
                  objectFit="contain"
                />
              </OverlayWithIcon>
            ) : (
              <AddImage />
            )}
          </div>
        </div>
      {/* )
      } */}
    </div >
  );
}
