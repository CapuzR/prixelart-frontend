import React from 'react';

import MDEditor from "@uiw/react-md-editor";
import Button from 'components/Button';
import { formatPriceForUI } from 'utils/formats';
import styles from './Portrait.module.scss';
import { Product } from '../../interfaces';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { getFilteredOptions } from 'products/services';

import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';

interface PortraitProps {
  product: Product;
  expanded: string | false;
  description: { generalDescription: string; technicalSpecification: string };
  handleArtSelection: () => void;
  handleSaveProduct: () => void;
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
}

const Portrait: React.FC<PortraitProps> = (props) => {
    const { currency } = useCurrency();
    const { conversionRate } = useConversionRate();

  const handleSelect = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    props.handleSelection(e);
  };

  return (
    <div className={styles['prix-product-container']}>
        <div className={styles['title-price']}>
            <div className={styles['title']}>
                {props.product?.name}
            </div>
            <div
                className={styles['price']}
            >
                {
                  formatPriceForUI(props.product?.price, currency, conversionRate)
                }
            </div>
        </div>
        <div className={styles['carousel-wrapper']}>
            <Slider images={props.product?.sources?.images || []}>
              {
                props.product?.sources?.images?.map((image, i) => (
                  <Image key={i} src={image.url} alt={props.product?.name} />
                ))
              }
            </Slider>
        </div>

        <div className={styles['select']}>
            <h2>Selecciona:</h2>
            <div
            className={`${styles['attributes-container']} ${
                props.product?.attributes?.length > 1 ? styles['space-between'] : styles['flex-start']
            }`}
            >
            {
                props.product?.attributes?.map((att, iAtt, attributesArr) =>
                <div key={iAtt} className={styles['attribute-select-wrapper']}>
                    <FormControl
                    variant="outlined"
                    className={styles['attribute-form-control']}
                    >
                    <InputLabel id={att.name}>{att.name}</InputLabel>
                    <Select
                        labelId={att.name}
                        id={att.name}
                        name={att.name}
                        value={props.product?.selection[att.name] || ''}
                        onChange={handleSelect}
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
                )
            }
            </div>
        </div>

        <div className={styles['buttons-container']}>
            <Button
              type="onlyText"
              color="primary"
              onClick={props.handleSaveProduct}
            >
              Guardar
            </Button>
            <Button
              color="primary"
              disabled={props.product?.selection && Object.keys(props.product.selection).length === 0 && Object.keys(props.product.selection).every((item: any) => item === "")}
              onClick={props.handleArtSelection}
            >
              Seleccionar Arte
            </Button>
          </div>

        <div className={styles['info-accordion-wrapper']}>
            {/* First Accordion - General Description */}
            <Accordion expanded={props.expanded === 'panel1'} onChange={props.handleChange('panel1')}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
            <Typography className={styles['accordion-title']}> Descripción </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <MDEditor.Markdown
                source={props.description.generalDescription || "No description available."}
                className={styles['markdown-content']}
                />
            </AccordionDetails>
            </Accordion>

            {/* Second Accordion - Technical Specification */}
            <Accordion expanded={props.expanded === 'panel2'} onChange={props.handleChange('panel2')}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
            <Typography className={styles['accordion-title']}> Especificación Técnica </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles['accordion-details']}>
                <MDEditor.Markdown
                source={props.description.technicalSpecification || "No technical specifications available."}
                className={styles['markdown-content']}
                />
            </AccordionDetails>
            </Accordion>

            {/* Third Accordion - Observations */}
            <Accordion expanded={props.expanded === 'panel3'} onChange={props.handleChange('panel3')}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3a-content"
                id="panel3a-header"
            >
            <Typography className={styles['accordion-title']}> Observaciones </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <MDEditor.Markdown
                source={props.product?.observations || "No observations available."}
                className={styles['markdown-content']}
                />
            </AccordionDetails>
            </Accordion>
        </div>
    </div>

  );
};

export default Portrait;