import React, { useEffect, useState } from 'react';

import MDEditor from "@uiw/react-md-editor";
import Button from 'components/Button';
import { Share as ShareIcon } from '@material-ui/icons';
import { generateWaProductMessage } from 'utils/utils';
import Grid from "../../art/components/grid";
import FlowStepper from 'components/FlowStepper/FlowStepper';
import { updateAttributes } from "../utils";
import { queryCreator } from "../utils";
import styles from './Portrait.module.scss';
import { Product, Art } from '../interfaces';
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

import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { formatPriceForUI } from 'utils/formats';

import { ProductCarousel } from 'components/ProductCarousel';

interface PortraitProps {
  product: Product | null;
  selectedArt: any;
  selectedItem: any;
  setSelectedArt: (art: any) => void;
  handleUpdateItem: (product?: Product, art?: Art, quantity?: number) => void;
//   addItemToBuyState: () => void;
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

const Portrait: React.FC<PortraitProps> = (props) => {
    const history = useHistory();
    const location = useLocation();
    const { currency } = useCurrency();
    const { conversionRate } = useConversionRate();
    const [ step, setStep ] = useState<number>(props.searchParams.get('step') ? parseInt(props.searchParams.get('step') as string) : 1);
    const steps = ['Selecciona', 'Elige el Arte', 'Confirmar'];

  useEffect(() => {
    if (
      props.product?.selection &&
      Object.keys(props.product?.selection).length > 0 &&
      Object.values(props.product?.selection).every((s) => typeof s === 'string' && s !== '') && 
      !props.selectedArt
    ) {
      setStep(2);
    } else if (props.selectedArt) {
      setStep(3);
    }
  }, [props.selectedItem, props.selectedArt]);

  const handleStepClick = (stepIndex: number) => {
    console.log(`Step ${stepIndex + 1} clicked`);
    if (stepIndex === 2) {
        setStep(2);
    } else if (stepIndex === 3) {
      setStep(1);
    } else {

    };
  };

  const handleSelect = (e: React.ChangeEvent<{ name: string; value: number }>) => {
    props.handleSelection(e);

    (Object.keys(props.product?.selection).every(key => props.product?.selection[key] !== '')) && setStep(2);
    const queryString = queryCreator(
        undefined,
        props.product?.id,
        props.selectedArt?.artId,
        updateAttributes(props.product?.selection, e.target.name, String(e.target.value)),
        '2'
    );
    history.push({ pathname: location.pathname, search: queryString });
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
                props.product?.price ?
                  formatPriceForUI(props.product?.price, currency, conversionRate) :
                  formatPriceForUI(props.product?.priceRange.from, currency, conversionRate, props.product?.priceRange.to)

                }
            </div>
        </div>
        
        <div className={styles['steps-wrapper']}>

        <div className="flow-stepper-wrapper">
            <FlowStepper activeStep={step-1} steps={steps} showLabels={false} onStepClick={handleStepClick} />
        </div>

            {
                step === 1 && (
                    <>
                        
                        <div className={styles['carousel-wrapper']}>
                            <ProductCarousel product={props.product} selectedArt={props.selectedArt} selectedItem={props.selectedItem} type="withImages" size="100%" />
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
                    </>
                )
            }

            {
                step === 2 && (
                        <>
                            <h2>Elige el arte:</h2>
                            <div className={styles['art-selection-container']}>
                                <div className={styles['art-grid-wrapper']}>
                                <Grid
                                    setSelectedArt={props.addArt}
                                    setFullArt={props.setFullArt}
                                    fullArt={props.fullArt}
                                    setSearchResult={props.setSearchResult}
                                    searchResult={props.searchResult}
                                />
                                </div>
                            </div>
                        </>
                )
            }

            {
                step === 3 && (
                    <>
                        <div className={styles['carousel-wrapper']}>
                            {/* <ProductCarousel product={props.product} selectedArt={props.selectedArt} selectedItem={props.selectedItem} type="withImages" size="100%" /> */}
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
                                // onClick={props.addItemToBuyState}
                            >
                                Agregar al carrito
                            </Button>
                        </div>
                    </>
                )
            }
        </div>
    </div>

  );
};

export default Portrait;
