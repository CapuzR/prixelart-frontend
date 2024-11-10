import React from 'react';

import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@material-ui/core';
import { Share as ShareIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons';

import Button from 'components/Button';

import { generateWaProductMessage } from 'utils/utils';
import { formatPriceForUI } from 'utils/formats';
import { useConversionRate, useLoading } from 'context/GlobalContext';

import styles from './Landscape.module.scss';

import { getFilteredOptions } from 'apps/consumer/products/services';

import { Product, Item } from '../../interfaces';
import { useCurrency } from 'context/GlobalContext';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import CurrencySwitch from 'components/CurrencySwitch';

interface LandscapeProps {
  product: Product;
  expanded: string | false;
  description: { generalDescription: string; technicalSpecification: string };
  handleArtSelection: () => void;
  // handleSaveProduct: () => void;
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  return (
    <div className={styles['prix-product-container']}>
      {/* Left Side - Carusel e Info */}
      <div className={styles['left-side']}>
        {/* Carousel Container */}
        <div className={styles['slider-wrapper']}>
          <Slider
            images={props.product?.sources?.images || []}
            useIndicators={{
              type: 'thumbnails',
              position: 'over',
              color: { active: 'primary', inactive: 'secondary' },
            }}
          >
            {props.product?.sources?.images?.map((image, i) => (
              <Image key={i} src={image.url} alt={props.product?.name} />
            ))}
          </Slider>
        </div>
      </div>

      {/* Right Side */}
      <div className={styles['right-side']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>{props.product?.name}</div>
          <div className={styles['product-title']}>
            <CurrencySwitch />
          </div>
          <div className={styles['price-selected']}>
            {props.product?.price
              ? formatPriceForUI(props.product?.price, currency, conversionRate)
              : formatPriceForUI(
                  props.product?.priceRange.from,
                  currency,
                  conversionRate,
                  props.product?.priceRange.to
                )}
          </div>
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              window.open(generateWaProductMessage(props.product), '_blank');
            }}
          >
            <ShareIcon className={styles['share-icon']} />
          </Button>
        </div>
        <div>
          <Accordion expanded={props.expanded === 'panel1'} onChange={props.handleChange('panel1')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography>Descripción general</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{props.description.generalDescription}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={props.expanded === 'panel2'} onChange={props.handleChange('panel2')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2bh-content"
              id="panel2bh-header"
            >
              <Typography>Especificaciones técnicas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{props.description.technicalSpecification}</Typography>
            </AccordionDetails>
          </Accordion>
        </div>
        <div className={styles['select']}>
          <h4>Selecciona:</h4>
          <div
            className={`${styles['attributes-container']} ${
              props.product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
            }`}
          >
            {props.product?.attributes?.map((att, iAtt, attributesArr) => (
              <div key={iAtt} className={styles['attribute-select-wrapper']}>
                <FormControl variant="outlined" className={styles['attribute-form-control']}>
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

                    {getFilteredOptions(props.product, att).map((option) => (
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
        <div className={styles['buttons-container']}>
          {/* <Button
              type="onlyText"
              color="primary"
              onClick={props.handleSaveProduct}
            >
              Guardar
            </Button> */}
          <Button
            color="primary"
            disabled={
              props.product?.selection &&
              Object.keys(props.product.selection).length === 0 &&
              Object.keys(props.product.selection).every((el: string) => el === '')
            }
            onClick={props.handleArtSelection}
          >
            Seleccionar Arte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landscape;
