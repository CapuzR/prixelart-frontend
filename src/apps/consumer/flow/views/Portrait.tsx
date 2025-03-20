import React from 'react';
import Button from 'components/Button';
import { Share as ShareIcon } from '@mui/icons-material';
import { generateWaProductMessage } from 'utils/utils';
import styles from './Portrait.module.scss';
import { Item } from '../../../../types/item.types';
import { MenuItem, FormControl, Select, InputLabel, } from '@mui/material';
import ArtsGrid from '../../art/components/ArtsGrid/ArtsGrid';
import { useCart } from '@context/CartContext';
import ProductsCatalog from '@apps/consumer/products/Catalog';
import ItemCard from '@components/ItemCard';
import CurrencySwitch from '@components/CurrencySwitch';
import { CartLine } from '../../../../types/cart.types';

interface PortraitProps {
  itemId: string;
  item: Partial<Item>;
  isUpdate: boolean;
  handleCart: (item: Item) => void;
  handleChangeElement: (type: 'producto' | 'arte', item: Item, lineId?: string) => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection?: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  openSection: string;
}

const Portrait: React.FC<PortraitProps> = (props) => {

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

  return (
    <div className={styles['prix-product-container']}>
      {/* Top Row: Title & Action Buttons */}
      <div className={styles['first-row']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>
            {props.item?.product?.name || 'Crea tu Prix ideal'}
          </div>
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
          <Button color="primary" onClick={handleCart}>
            {cart.lines.some((l: CartLine) => l.id === lineId)
              ? 'Actualizar'
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>

      {/* Main Content: Left Side & Right Side */}
      <div className={styles['main-content']}>
        {/* Left Side: Item Card */}
        <div className={styles['left-side']}>
          {props.item.sku && (
            <ItemCard
              item={props.item as Item}
              direction="column"
              handleChangeElement={props.handleChangeElement}
            />
          )}
        </div>

        {/* Right Side: Product Attributes & Gallery */}
        <div className={styles['right-side']}>
          {props.openSection === 'producto' && props.item?.product && (
            <div className={styles['select']}>
              <h2>Selecciona:</h2>
              <div className={`${styles['attributes-container']} ${props.item?.product?.attributes?.length > 1
                ? styles['space-between']
                : styles['flex-start']
                }`}>
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

          {/* Bottom Section: Gallery */}
          <div className={styles['right-side-bottom']}>
            <h2>{`Elige el ${props.openSection === 'arte' ? 'arte' : 'producto'}:`}</h2>
            <div className={styles['art-selection-container']}>
              <div className={styles['art-grid-wrapper']}>
                {props.openSection === 'arte' ? (
                  <ArtsGrid />
                ) : (
                  <ProductsCatalog />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portrait;