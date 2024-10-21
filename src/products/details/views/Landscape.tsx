import React from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import { Share as ShareIcon, ExpandMore as ExpandMoreIcon } from "@material-ui/icons";

import ArtsGrid from "art/components/grid";
import { ProductCarousel } from "components/productCarousel/productCarousel";
import Button from "components/Button/Button";

import { generateWaProductMessage } from 'utils/utils';
import { formatPriceForDisplay } from 'utils/formats';

import styles from './Landscape.module.scss';

import { Product } from '../../interfaces';
import { useCurrency } from "context/GlobalContext";
import { Slider } from "components/Slider";
import { Image } from "components/Image"


interface LandscapeProps {
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

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { currency } = useCurrency();

  return (
    <div className={styles['prix-product-container']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
          {/* Carousel Container */}
          <div className={styles['slider-wrapper']}>
            <Slider 
              images={props.product?.sources?.images || []}
              useIndicators={{ type: 'thumbnails', position: 'over', color: { active: 'primary', inactive: 'secondary' } }}
            >
              {
                props.product?.sources?.images?.map((image, i) => (
                  <Image key={i} src={image.url} alt={props.product?.name} />
                ))
              }
            </Slider>
          </div>
        </div>

        {/* Right Side - Gallery */}
        <div className={styles['right-side']}>
          <div className={styles['first-row-title-container']}>
            <div className={styles['product-title']}>
              {props.product?.name}
            </div>
            <div className={styles['price-selected']}>
              {
                currency + " " + formatPriceForDisplay(props.product?.price, 'de-DE')
              }
            </div>
            <Button
              type="onlyText"
              color="primary"
              onClick={(e) => {
                window.open(generateWaProductMessage(props.product), "_blank");
              }}
            >
              <ShareIcon className={styles['share-icon']} />
            </Button>
          </div>
          <div>
            <Accordion
              expanded={props.expanded === 'panel1'}
              onChange={props.handleChange('panel1')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography>Descripción general</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {props.generalDescription}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={props.expanded === 'panel2'}
              onChange={props.handleChange('panel2')}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2bh-content"
                id="panel2bh-header"
              >
                <Typography>Especificaciones técnicas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {props.technicalSpecification}
                </Typography>
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
        </div>

    </div>
  );
};

export default Landscape;