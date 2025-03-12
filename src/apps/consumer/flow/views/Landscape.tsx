import React from 'react';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';

import Button from 'components/Button';

import { generateWaProductMessage } from 'utils/utils';

import styles from '../Flow.module.scss';

import { Art, Item } from '../interfaces';
import ItemCard from 'components/ItemCard';
import ProductsCatalog from 'apps/consumer/products/Catalog';
import { useCart } from 'context/CartContext';
import CurrencySwitch from 'components/CurrencySwitch';
import ArtsGrid from '@apps/consumer/art/components/ArtsGrid/ArtsGrid';

interface LandscapeProps {
  itemId: string;
  item: Partial<Item>;
  isUpdate: boolean;
  handleCart: (item: Item) => void;
  handleDeleteElement: (type: 'producto' | 'arte', item: Item) => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection?: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  isItemReady: boolean;
  onArtSelect: (selectedArt: Art) => void;
}

const Landscape: React.FC<LandscapeProps> = (props) => {

  const { cart } = useCart();

  const handleCart = () => {
    if (!props.item.sku) {
      console.error("Item SKU is missing");
      return;
    }
    props.handleCart(props.item as Item);
  };

  const handleArtSelection = (selectedArt: Art) => {
    props.onArtSelect(selectedArt);
  };

  const productExists = Boolean(props.item?.product);
  const artExists = Boolean(props.item?.art);
  const showRightSide = productExists !== artExists;

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
              window.open(generateWaProductMessage(props.item?.product), '_blank');
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
            {cart.lines.some((l) => l.item.sku === props.item.sku)
              ? 'Actualizar'
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>

      <div className={styles['main-content']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
          {props.item.sku && (
            <ItemCard
              item={props.item as Item}
              direction="column"
              handleDeleteElement={props.handleDeleteElement}
            />
          )}
        </div>

        {/* Right Side - Gallery */}
        {showRightSide && (
          <div className={styles['right-side']}>
            {(!productExists && artExists) && (
              <div className={styles['select']}>
                <h2>Selecciona:</h2>
                <div
                  className={
                    (props.item?.product?.attributes?.length || 0) > 1
                      ? styles['attributes-container'] + ' ' + styles['space-between']
                      : styles['attributes-container'] + ' ' + styles['flex-start']
                  }
                >
                  {props.item?.product?.attributes?.map((att, iAtt) => (
                    <div key={iAtt} style={{ width: '45%' }}>
                      <FormControl variant="outlined" style={{ width: '100%' }}>
                        <InputLabel id={att.name}>{att.name}</InputLabel>
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
                {productExists && !artExists
                  ? 'Elige el arte:'
                  : (!productExists && artExists ? 'Elige el producto:' : '')}
              </h2>
              <div className={styles['art-selection-container']}>
                <div className={styles['art-grid-wrapper']}>
                  {productExists && !artExists ? (
                    <ArtsGrid onArtSelect={handleArtSelection} />
                  ) : !productExists && artExists ? (
                    <ProductsCatalog />
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
