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
  SelectChangeEvent,
} from '@mui/material';
import { Share as ShareIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

import Button from 'components/Button';

import { generateWaProductMessage } from 'utils/utils';
import { formatPriceForUI } from 'utils/formats';
import { useConversionRate } from 'context/GlobalContext';

import styles from './Landscape.module.scss';

import { getFilteredOptions } from 'apps/consumer/products/services';

import { useCurrency } from 'context/GlobalContext';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import CurrencySwitch from 'components/CurrencySwitch';
import { Product } from '../../../../../types/product.types';

interface LandscapeProps {
  product: Product;
  expanded: string | false;
  description: { generalDescription: string; technicalSpecification: string };
  handleArtSelection: () => void;
  handleSelection: (e: SelectChangeEvent<string>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  isFetchingVariantPrice: boolean;
  flowProductId?: string;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const isOptionSelected =
    Array.isArray(props.product.selection)
      ? props.product.selection.some(sel => sel.value !== '')
      : false;

  console.log("producto: ", props.product);

  const allAttributesSelected =
    !props.product?.attributes || props.product?.attributes.length === 0
      ? true
      : props.product.attributes.every(attribute => {
        const sel = props.product.selection?.find(s => s.name === attribute.name);
        return sel && sel.value.trim() !== '';
      });


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
          {!props.flowProductId && (
            <div className={styles['product-title']}>
              <CurrencySwitch />
            </div>
          )}

          <div className={styles['price-selected']}>
            {isOptionSelected
              ? formatPriceForUI(
                props.product.price ?? props.product.priceRange.from,
                currency,
                conversionRate
              )
              : formatPriceForUI(
                props.product.priceRange.from,
                currency,
                conversionRate,
                props.product.priceRange.to
              )}
          </div>
          <Button
            type="onlyText"
            color="primary"
            onClick={() => {
              const currentUrl = window.location.href;
              window.open(generateWaProductMessage(props.product, currentUrl), '_blank');
            }}>
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
            className={`${styles['attributes-container']} ${props.product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
              }`}
          >
            {props.product?.attributes?.map((att, iAtt) => {
              const selectedValue = (Array.isArray(props.product?.selection)
                ? props.product.selection
                : []).find((sel) => sel.name === att.name)?.value || '';

              return (
                <div key={iAtt} className={styles['attribute-select-wrapper']}>
                  <FormControl variant="outlined" className={styles['attribute-form-control']}>
                    <InputLabel id={att.name}>{att.name}</InputLabel>
                    <Select
                      labelId={att.name}
                      id={att.name}
                      name={att.name}
                      value={selectedValue}
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
              );
            })}

          </div>
        </div>
        <div className={styles['buttons-container']}>
          <Button
            color="primary"
            disabled={!allAttributesSelected || props.isFetchingVariantPrice}
            onClick={props.handleArtSelection}>
            {props.flowProductId ? 'Seleccionar' : 'Seleccionar Arte'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landscape;
