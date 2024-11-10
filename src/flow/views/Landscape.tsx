import React from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from "@material-ui/core";
import { Share as ShareIcon } from "@material-ui/icons";

import Grid from "../../art/components/grid";
import Button from "components/Button";

import { generateWaProductMessage } from 'utils/utils';

import styles from '../Flow.module.scss';

import { Product, Art, Item, PickedProduct, PickedArt } from '../interfaces';
import ItemCard from "components/ItemCard";
import ProductsCatalog from "products/Catalog";
import { useCart } from "context/CartContext";
import CurrencySwitch from "components/CurrencySwitch";

interface LandscapeProps {
  itemId: string;
  item: Item;
  isUpdate: boolean;
  addInFlow: (updatedArt?: Art, updatedProduct?: Product) => void;
  handleCart: (item : Item) => void;
  handleDeleteElement: (type: 'producto' | 'arte', item: any) => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  openSection: string;
  flowReady: boolean;
  handleFlow: (type: 'producto' | 'arte') => void;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { cart } = useCart();

  const handleCart = () => {
      props.handleCart(props.item)
  }

  return (
    <div className={styles['prix-product-container']}>

      <div className={styles['first-row']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>
            Crea tu Prix ideal
          </div>
          <CurrencySwitch />
        </div>
        <div className={styles['buttons-container']}>
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              window.open(generateWaProductMessage(props.item?.product), "_blank");
            }}
          >
            <ShareIcon className={styles['share-icon']} /> Compartir
          </Button>
            <Button
              color="primary"
              disabled={!props.flowReady}
              onClick={handleCart}
              highlighted={props.flowReady}
            >
              { cart.lines.some((l) => l.item.sku === props.item.sku) ? 'Actualizar' : 'Agregar al carrito'}
            </Button>
        </div>
      </div>

      <div className={styles['main-content']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
            <ItemCard item={props.item} direction="column" handleDeleteElement={props.handleDeleteElement} handleFlow={props.handleFlow} />
        </div>

        {/* Right Side - Gallery */}
        <div className={styles['right-side']}>
          {
            props.openSection === 'producto' && props.item?.product &&
              <div className={styles['select']}>
                <h2>Selecciona:</h2>
                <div
                  className={`${styles['attributes-container']} ${
                    props.item?.product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
                  }`}
                >
                  {
                    props.item?.product?.attributes?.map((att, iAtt) =>
                      <div key={iAtt} style={{ width: "45%" }}>
                        <FormControl
                          variant="outlined"
                          style={{ width: "100%" }}
                        >
                          <InputLabel id={att.name}>{att.name}</InputLabel>
                          <Select
                            labelId={att.name}
                            id={att.name}
                            name={att.name}
                            value={props.item?.product?.selection[att.name] || ''}
                            onChange={props.handleSelection}
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
                    )
                  }
                </div>
              </div>
          }
          <div className={styles['right-side-bottom']}>
            <h2>{`Elige el ${props.openSection === 'arte' ? "arte" : "producto"}:`}</h2>
            <div className={styles['art-selection-container']}>
              <div className={styles['art-grid-wrapper']}>
                {
                  props.openSection === 'arte' ?
                  (
                    <Grid
                      setSelectedArt={props.addInFlow}
                      selectedArtId={props.item?.art?.artId || undefined}
                    />
                  ) : (
                    <ProductsCatalog flowData={{ onlyGrid : true, addInFlow: props.addInFlow, selectedProductId: props.item?.product?.id || undefined }}/>
                  )
                }
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Landscape;