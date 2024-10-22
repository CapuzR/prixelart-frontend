import React from 'react';

import MDEditor from "@uiw/react-md-editor";
import Button from 'components/Button/Button';
import { EditAttributes, Share as ShareIcon } from '@material-ui/icons';
import { generateWaProductMessage } from 'utils/utils';
// import { ProductCarousel } from 'components/productCarousel/productCarousel';
import ArtsGrid from 'art/components/grid';
import FlowStepper from 'components/FlowStepper/FlowStepper';
import { formatPriceForDisplay } from 'utils/formats';
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
import { useHistory, useLocation } from 'react-router-dom';

import { useCurrency } from 'context/GlobalContext';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';

interface PortraitProps {
  product: Product | null;
  selectedItem: any;
  addItemToBuyState: () => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  expanded: string | false;
  generalDescription: string;
  technicalSpecification: string;
  fullArt: any;
  setFullArt: (art: any) => void;
  searchResult: any;
  setSearchResult: (result: any) => void;
}

const Portrait: React.FC<PortraitProps> = (props) => {
    const history = useHistory();
    const location = useLocation();
    const { currency } = useCurrency();

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
                    currency + " " + formatPriceForDisplay(props.product?.price, 'de-DE')
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
                        value={props.product?.selection[att.name] || ''}
                        onChange={handleSelect}
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

        <div className={styles['buttons-container']}>
            <Button
              type="onlyText"
              color="primary"
              onClick={props.addItemToBuyState}
            >
              Guardar
            </Button>
            <Button
              color="primary"
              disabled={props.product?.selection && Object.keys(props.product.selection).length === 0 && Object.keys(props.product.selection).every((item: any) => item === "")}
              onClick={props.addItemToBuyState}
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
                source={props.generalDescription || "No description available."}
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
                source={props.technicalSpecification || "No technical specifications available."}
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
