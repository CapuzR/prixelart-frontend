import React from 'react';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MenuItem, FormControl, Select } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';

import Button from 'components/Button';

import { generateWaProductMessage } from 'utils/utils';

import styles from '../Flow.module.scss';

import ItemCard from 'components/ItemCard';
import ProductsCatalog from 'apps/consumer/products/Catalog';
import { useCart } from 'context/CartContext';
import CurrencySwitch from 'components/CurrencySwitch';
import ArtsGrid from '@apps/consumer/art/components/ArtsGrid/ArtsGrid';
import Details from '@apps/consumer/products/Details/Details';
import { CartLine } from '../../../../types/cart.types';
import { Item } from '../../../../types/item.types';
import { Art } from '../../../../types/art.types';
import { Product } from '../../../../types/product.types';

interface LandscapeProps {
  item: Partial<Item>;
  handleCart: (item: Item) => void;
  handleChangeElement: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection?: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  isItemReady: boolean;
  onArtSelect: (selectedArt: Art) => void;
  onProductSelect: (selectedProduct: Product) => void;
  selectedProductId?: string | null;
  isProductAttributesComplete: boolean;
}

const Landscape: React.FC<LandscapeProps> = (props) => {

  const { cart } = useCart();
  const searchParams = new URLSearchParams(window.location.search);
  const lineId = searchParams.get('lineId');

  const handleCart = () => {
    if (!props.item.sku) {
      console.error("Item SKU is missing");
      return;
    }
    props.handleCart(props.item as Item);
  };

  const productExists = Boolean(props.item?.product);
  const artExists = Boolean(props.item?.art);
  const showRightSide = !props.isItemReady;

  return (
    <div className={styles['prix-product-container']}>
      <div className={styles['first-row']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>Crea tu Prix ideal</div>
          <CurrencySwitch />
        </div>
        <div className={styles['buttons-container']}>
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              const currentUrl = window.location.href;
              window.open(
                generateWaProductMessage(
                  props.item?.product! ? props.item.product! : props.item?.art!,
                  currentUrl
                ),
                '_blank'
              );
            }}
          >
            <ShareIcon className={styles['share-icon']} /> Compartir
          </Button>
          <Button
            color="primary"
            disabled={!props.isItemReady}
            onClick={handleCart}
            highlighted={props.isItemReady}
          >
            {cart.lines.some((l: CartLine) => l.id === lineId)
              ? 'Actualizar'
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>

      <div className={styles['main-content']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
          {(props.item.product || props.item.art) && (
            <ItemCard
              item={props.item as Item}
              direction="column"
              handleChangeElement={props.handleChangeElement}
            />
          )}
        </div>

        {/* Right Side - Gallery */}
        {showRightSide && (
          <div className={styles['right-side']}>
            {(!productExists && artExists) && (
              <div className={styles['select']}>
                <div className={(props.item?.product?.attributes?.length || 0) > 1 ? styles['attributes-container'] + ' ' + styles['space-between'] : + ' ' + styles['flex-start']}>
                  {props.item?.product?.attributes?.map((att, iAtt) => (
                    <div key={iAtt} style={{ width: '45%' }}>
                      <FormControl variant="outlined" style={{ width: '100%' }}>
                        <Select
                          labelId={att.name}
                          id={att.name}
                          name={att.name}
                          value={
                            props.item?.product?.selection?.find(
                              (sel: { name: string; value: string }) => sel.name === att.name
                            )?.value || ''
                          }
                          onChange={(e) =>
                            props.handleSelection?.(
                              e as unknown as React.ChangeEvent<{ name: string; value: number }>
                            )
                          }
                          label={att.name}
                        >
                          <MenuItem value="">
                            <em>Selecciona una opción</em>
                          </MenuItem>
                          {props.getFilteredOptions(att).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles['right-side-bottom']}>
              <h2>
                {props.selectedProductId
                  ? 'Detalles del producto:'
                  : (productExists && !artExists
                    ? 'Elige el arte:'
                    : (!productExists && artExists ? 'Elige el producto:' : ''))}
              </h2>
              <div className={styles['art-selection-container']}>
                <div className={styles['art-grid-wrapper']}>
                  {props.selectedProductId && !props.isProductAttributesComplete ? (
                    <Details productId={props.selectedProductId} />
                  ) : productExists && !artExists ? (
                    <ArtsGrid onArtSelect={props.onArtSelect} />
                  ) : !productExists && artExists ? (
                    <ProductsCatalog onProductSelect={props.onProductSelect} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landscape;
