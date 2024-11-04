import { useHistory } from 'react-router-dom';
import { useCart } from 'context/CartContext';
import { CartItem } from 'cart/interfaces';
import styles from "./styles.module.scss";
import { Image } from "components/Image";
import AddImage from 'components/AddImage';
import OverlayWithIcon from 'components/OverlayWithIcon';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import DeleteIcon from '@material-ui/icons/Delete';
import { queryCreator } from 'flow/utils';

export interface ItemPlaygroundProps {
    item: CartItem;
    handleDeleteElement: (type: 'producto' | 'arte', item : CartItem) => void;
}
export default function ItemPlayground({ item, handleDeleteElement }: ItemPlaygroundProps) {
    const history = useHistory();

    const handleCartUpdate = (type : 'producto' | 'arte') => {
        console.log("itemPlayground.tsx: ", item);
        const selectionAsObject: { [key: string]: string } = Array.isArray(item?.product?.selection)
          ? item?.product?.selection.reduce((acc, sel, index) => {
              acc[`selection-${index}`] = String(sel);
              return acc;
            }, {} as { [key: string]: string })
          : (item?.product?.selection || {});

        const queryString = queryCreator(
            item?.id,
            item?.product?.id,
            item?.art?.artId,
            selectionAsObject,
            type,
            '1'
        );
        console.log("itemPlayground.tsx: ", queryString);
        history.push({ pathname: '/flow', search: queryString });
    };

  return (
    <div className={styles['container']}>
        {
            item?.product?.mockUp ?
            (
                <div className={styles['warp-container']}>
                </div>
            ) :
            (
                <div className={styles['sel-container']}>
                    <div className={styles['product-area']}>
                        {
                            item?.product ?
                                <OverlayWithIcon
                                    iconLeft={<AutorenewIcon />}
                                    iconRight={<DeleteIcon />}
                                    coverTarget='parent'
                                    onClickLeft={() => handleCartUpdate('producto')}
                                    onClickRight={() => handleDeleteElement('producto', item)}
                                >
                                    <Image
                                        src={item?.product?.sources?.images?.[0]?.url}
                                        alt={item?.product?.name}
                                        fitTo='width'
                                        objectFit='cover'
                                    /> 
                                </OverlayWithIcon> :
                                <AddImage  onClick={() => handleCartUpdate('producto')}/>
                        }
                    </div>
                    <div className={styles['art-area']}>
                        {
                            item?.art ?
                                <OverlayWithIcon
                                    iconLeft={<AutorenewIcon />}
                                    iconRight={<DeleteIcon />}
                                    coverTarget='parent'
                                    onClickLeft={() => handleCartUpdate('arte')}
                                    onClickRight={() => handleDeleteElement('arte', item)}
                                >
                                    <Image
                                        src={item?.art?.largeThumbUrl}
                                        alt={item?.art?.title}
                                        fitTo='width'
                                        objectFit='contain'
                                    /> 
                                </OverlayWithIcon> :
                                <AddImage onClick={() => handleCartUpdate('arte')}/>
                        }
                    </div>
                </div>
            )
        }
    </div>
  );
}