import React, { useEffect } from "react";

import MDEditor from "@uiw/react-md-editor";
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

import styles from '../Details.module.scss';

import Product from '../../interfaces';
import { useCurrency } from "context/GlobalContext";


interface LandscapeProps {
  product: Product | null;
  selectedArt: any;
  selectedItem: any;
  setSelectedArt: (art: any) => void;
  addItemToBuyState: () => void;
  getFilteredOptions: (att: { name: string; value: string[] }) => string[];
  handleSelection: (e: React.ChangeEvent<{ name: string; value: number }>) => void;
  handleChange: (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  addArt: (art: any) => void;
  expanded: string | false;
  generalDescription: string;
  technicalSpecification: string;
  fullArt: any;
  setFullArt: (art: any) => void;
  searchResult: any;
  setSearchResult: (result: any) => void;
  searchParams: URLSearchParams;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { currency } = useCurrency();

  // useEffect(() => {
  //   console.log("Product: ", props.product);
  // }, [props.product]);
  
  return (
    <div className={styles['prix-product-container']}>

      <div className={styles['first-row']}>
        <div className={styles['first-row-title-container']}>
          <div className={styles['product-title']}>
            {props.product?.name}
          </div>
          <div
            className={styles['price-selected']}
          >
            {
              currency + " " + formatPriceForDisplay(props.product?.price, 'de-DE')
            }
          </div>
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
            onClick={props.addItemToBuyState}
          >
            Agregar al carrito
          </Button>
        </div>
      </div>

      <div className={styles['main-content']}>
        {/* Left Side - Carusel e Info */}
        <div className={styles['left-side']}>
          {/* Carousel Container */}
          <div className={styles['carousel-wrapper']}>
            <ProductCarousel product={props.product} selectedArt={props.selectedArt} selectedItem={props.selectedItem} type="withImages" size="100%" />
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
          <div className={styles['right-side-bottom']}>
            <h2>Elige el arte:</h2>
            <div className={styles['art-selection-container']}>
              <div className={styles['art-grid-wrapper']}>
                <ArtsGrid
                  setSelectedArt={props.addArt}
                  setFullArt={props.setFullArt}
                  fullArt={props.fullArt}
                  setSearchResult={props.setSearchResult}
                  searchResult={props.searchResult}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Landscape;