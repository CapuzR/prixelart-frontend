import React, { useMemo } from 'react';

import MDEditor from '@uiw/react-md-editor';
import Button from 'components/Button';
import { formatRange, formatSinglePrice } from 'utils/formats';
import { generateWaProductMessage } from 'utils/utils';
import styles from './Portrait.module.scss';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShareIcon from '@mui/icons-material/Share'; // Import ShareIcon

import { getFilteredOptions } from 'apps/consumer/products/services';

import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import CurrencySwitch from 'components/CurrencySwitch';
import { Product, Variant } from '../../../../../types/product.types';
import { DisplayPriceInfo } from '../Details';

interface PortraitProps {
  product: Product;
  expanded: string | false;
  description: { generalDescription: string; technicalSpecification: string };
  handleArtSelection: () => void;
  handleSelection: (e: SelectChangeEvent<string>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  flowProductId?: string;
  selectedVariant?: Variant; // Add selected variant prop (copied from Landscape)
  currentSelectionParams: { [key: string]: string }; // Add current selection params prop
  priceInfo: DisplayPriceInfo;
}

const Portrait: React.FC<PortraitProps> = (props) => {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const uniqueAttributes = useMemo(() => {
    const attributesMap = new Map<string, Set<string>>();

    props.product?.variants?.forEach(variant => {
      variant.attributes?.forEach(attr => {
        if (!attributesMap.has(attr.name)) {
          attributesMap.set(attr.name, new Set<string>());
        }
        attributesMap.get(attr.name)?.add(attr.value);
      });
    });

    return Array.from(attributesMap.entries())
      .map(([name, values]) => ({
        name,
        value: Array.from(values).sort()
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [props.product?.variants]);

  const allAttributesSelected = useMemo(() => {
    if (uniqueAttributes.length === 0) {
      return true;
    }
    return uniqueAttributes.every((attribute) =>
      props.currentSelectionParams[attribute.name]?.trim() !== ''
    );
  }, [uniqueAttributes, props.currentSelectionParams]);

  const renderPriceDisplay = () => {
    const { priceInfo } = props;

    switch (priceInfo.type) {
      case 'loading':
        return 'Cargando precio...';
      case 'error':
        // Optionally show specific error: priceInfo.errorMessage
        return 'Precio no disponible';
      case 'single':
        // Use formatSinglePrice which handles potential strikethrough
        return (
          <span
            dangerouslySetInnerHTML={{
              __html: formatSinglePrice(
                // Ensure price is passed as string or number as expected by formatSinglePrice
                priceInfo.finalPrice !== undefined ? priceInfo.finalPrice.toString() : undefined,
                currency,
                conversionRate,
                priceInfo.originalPrice !== undefined ? priceInfo.originalPrice.toString() : undefined
              )
            }}
          />
        );
      case 'range':
        // Format the final range
        const finalRangeString = formatRange(
          priceInfo.finalMin,
          priceInfo.finalMax,
          currency,
          conversionRate
        );

        // Check if base range differs from final range (and base exists)
        const baseRangeDiffers = priceInfo.baseMin !== null && priceInfo.baseMax !== null &&
          (priceInfo.baseMin !== priceInfo.finalMin || priceInfo.baseMax !== priceInfo.finalMax);

        if (baseRangeDiffers) {
          // Format the base range
          const baseRangeString = formatRange(
            priceInfo.baseMin, // Known not to be null here
            priceInfo.baseMax, // Known not to be null here
            currency,
            conversionRate
          );
          // Render base with strikethrough + final range
          return (
            <span dangerouslySetInnerHTML={{
              __html: `
                      <span style="text-decoration: line-through; opacity: 0.7; margin-right: 0.5em;">
                          ${baseRangeString}
                      </span>
                      <span>
                          ${finalRangeString}
                      </span>
                    `}} />
          );
        } else {
          // Just render the final range
          return <span>{finalRangeString}</span>;
        }
      case 'none':
        // If attributes exist, prompt selection, otherwise show unavailable
        return uniqueAttributes.length > 0
          ? 'Selecciona opciones para ver el precio'
          : 'Precio no disponible';
      default:
        // Log error for unexpected priceInfo.type
        console.error("Unhandled priceInfo type:", priceInfo);
        return 'Precio no disponible'; // Fallback
    }
  };

  return (
    <div className={styles['prix-product-container']}>
      <div className={styles['title-price']}>
        <div className={styles['title']}>{props.product?.name}</div>
        {/* Use the renderPriceDisplay function */}
        <div className={styles['price']}>
          {renderPriceDisplay()}
        </div>
{/*         {!props.flowProductId && (
          <div className={styles['currency-switch-container']}>
            <CurrencySwitch />
          </div>
        )} */}
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

      <div className={styles['carousel-wrapper']}>
        <Slider images={props.product?.sources?.images || []} useIndicators={{ type: 'thumbnails', position: 'over', color: { active: 'primary', inactive: 'secondary' } }}>
          {props.product?.sources?.images?.map((image, i) => (
            <Image key={i} src={image.url} alt={props.product?.name} />
          ))}
        </Slider>
      </div>

      {/* Attribute Selection */}
      {uniqueAttributes.length > 0 && (
        <div className={styles['select']}>
          <h4>Selecciona:</h4>
          <div className={`${styles['attributes-container']} ${uniqueAttributes.length > 1 ? styles['space-between'] : styles['flex-start']}`}>
            {uniqueAttributes.map((att, iAtt) => {
              const selectedValue = props.currentSelectionParams[att.name] || '';
              const filteredOptions = getFilteredOptions(props.product, att, props.currentSelectionParams) || [];

              return (
                <div key={iAtt} className={styles['attribute-select-wrapper']}>
                  <FormControl variant="outlined" className={styles['attribute-form-control']}>
                    <InputLabel id={`label-${att.name}`}>{att.name}</InputLabel>
                    <Select labelId={`label-${att.name}`} id={`select-${att.name}`} name={att.name} value={selectedValue} onChange={props.handleSelection} label={att.name} displayEmpty>
                      <MenuItem value=""><em>Selecciona una opción</em></MenuItem>
                      {filteredOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className={styles['buttons-container']}>
        <Button
          color="primary"
          // Update disabled logic to use priceInfo.type
          disabled={!allAttributesSelected || props.priceInfo.type === 'loading'}
          onClick={props.handleArtSelection}
        >
          {props.flowProductId ? 'Seleccionar' : 'Seleccionar Arte'}
        </Button>
      </div>

      {/* Accordions */}
      <div className={styles['info-accordion-wrapper']}>
        {props.description.generalDescription && (
          <Accordion expanded={props.expanded === 'panel1'} onChange={props.handleChange('panel1')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography className={styles['accordion-title']}>Descripción general</Typography></AccordionSummary>
            <AccordionDetails><MDEditor.Markdown source={props.description.generalDescription} className={styles['markdown-content']} /></AccordionDetails>
          </Accordion>
        )}
        {props.description.technicalSpecification && (
          <Accordion expanded={props.expanded === 'panel2'} onChange={props.handleChange('panel2')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography className={styles['accordion-title']}>Especificaciones técnicas</Typography></AccordionSummary>
            <AccordionDetails className={styles['accordion-details']}><MDEditor.Markdown source={props.description.technicalSpecification} className={styles['markdown-content']} /></AccordionDetails>
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default Portrait;