import React, { useEffect } from "react";

import MDEditor from "@uiw/react-md-editor";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from "@material-ui/core";
import { Share as ShareIcon, ExpandMore as ExpandMoreIcon } from "@material-ui/icons";

import Grid from "../../art/components/grid";
import Button from "components/Button";

import { generateWaProductMessage } from 'utils/utils';
import { formatPriceForUI } from 'utils/formats';

import styles from '../Flow.module.scss';

import { Product, Art } from '../interfaces';
import { useConversionRate, useCurrency } from "context/GlobalContext";
import ItemCard from "components/ItemCard";
import ProductsCatalog from "products/Catalog";
import { useCart } from "context/CartContext";


//TO DO: Voy por aquí. 

interface LandscapeProps {
  product: Product | null;
  selectedArt: any;
  setSelectedArt: (art: any) => void;
  isUpdate: boolean;
  handleCart: (product: Product | undefined, art: any, quantity?: number) => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  addArt: (art: any) => void;
  expanded: string | false;
  generalDescription: string;
  technicalSpecification: string;
  searchResult: any;
  setSearchResult: (result: any) => void;
  searchParams: URLSearchParams;
  openSection: string;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { cart } = useCart();

  const handleCart = () => {
      props.handleCart(props.product, props.selectedArt, 1)
  }

  return (
    <div className={styles['prix-product-container']}>

      <div className={styles['first-row']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>
            {props.product?.name}
          </div>
          {/* <div
            className={styles['price-selected']}
          >
            {
                props.product?.price ?
                  formatPriceForUI(props.product?.price, currency, conversionRate) :
                  formatPriceForUI(props.product?.priceRange?.from, currency, conversionRate, props.product?.priceRange?.to)

            }
          </div> */}
        </div>
        <div className={styles['buttons-container']}>
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              window.open(generateWaProductMessage(props.product), "_blank");
            }}
          >
            <ShareIcon className={styles['share-icon']} /> Compartir
          </Button>
          <Button
            color="primary"
            disabled={props.selectedArt === undefined}
            onClick={handleCart}
          >
            { props.isUpdate ? 'Actualizar' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>

      <div className={styles['main-content']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
            <ItemCard item={{ id: undefined, product: props.product, art: props.selectedArt, quantity: undefined }} direction="column" hasActionBar={false}/>
        </div>

        {/* Right Side - Gallery */}
        <div className={styles['right-side']}>
          <div className={styles['select']}>
            <h2>Selecciona:</h2>
            <div
              className={`${styles['attributes-container']} ${
                props.product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
              }`}
            >
              {
                props.product?.attributes?.map((att, iAtt) =>
                  <div key={iAtt} style={{ width: "45%" }}>
                    {console.log("att", att)}
                    <FormControl
                      variant="outlined"
                      style={{ width: "100%" }}
                    >
                      <InputLabel id={att.name}>{att.name}</InputLabel>
                      <Select
                        labelId={att.name}
                        id={att.name}
                        name={att.name}
                        value={props.product?.selection[att.name] || ''}
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
          <div className={styles['right-side-bottom']}>
            <h2>{`Elige el ${props.openSection === 'art' ? "arte" : "producto"}:`}</h2>
            <div className={styles['art-selection-container']}>
              <div className={styles['art-grid-wrapper']}>
                {
                  props.openSection === 'art' ?
                  (
                    <Grid
                      setSelectedArt={props.addArt}
                      setSearchResult={props.setSearchResult}
                      searchResult={props.searchResult}
                    />
                  ) : (
                    <ProductsCatalog onlyGrid={true}/>
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