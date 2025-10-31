import React, { useMemo } from "react";

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
} from "@mui/material";
import {
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import Button from "components/Button";

import { generateWaProductMessage } from "utils/utils";
import { formatRange, formatSinglePrice } from "utils/formats";
import { useConversionRate } from "context/GlobalContext";

import styles from "./Landscape.module.scss";

import { getFilteredOptions } from "apps/consumer/products/services";

import { useCurrency } from "context/GlobalContext";
import { Slider } from "components/Slider";
import { Image } from "components/Image";
import CurrencySwitch from "components/CurrencySwitch";
import { Product, Variant } from "../../../../../types/product.types";
import { DisplayPriceInfo } from "../Details";
import MDEditor from "@uiw/react-md-editor";
import ReactQuill from "react-quill-new";
import "react-quill/dist/quill.snow.css";

interface LandscapeProps {
  product: Product;
  expanded: string | false;
  description: { generalDescription: string; technicalSpecification: string };
  handleArtSelection: () => void;
  handleSelection: (e: SelectChangeEvent<string>) => void;
  handleChange: (
    panel: string,
  ) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
  isFetchingVariantPrice: boolean;
  flowProductId?: string;
  selectedVariant?: Variant;
  currentSelectionParams: { [key: string]: string };
  priceInfo: DisplayPriceInfo;
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const RenderHTML: React.FC<{ htmlString: string }> = ({ htmlString }) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlString }}
        style={{ margin: 10 }}
      />
    );
  };

  const uniqueAttributes = useMemo(() => {
    const attributesMap = new Map<string, Set<string>>();
    props.product?.variants?.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        if (!attributesMap.has(attr.name)) {
          attributesMap.set(attr.name, new Set<string>());
        }
        attributesMap.get(attr.name)?.add(attr.value);
      });
    });
    return Array.from(attributesMap.entries())
      .map(([name, values]) => ({ name, value: Array.from(values).sort() }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [props.product?.variants]);

  const allAttributesSelected = useMemo(() => {
    if (uniqueAttributes.length === 0) return true;
    return uniqueAttributes.every(
      (attribute) =>
        props.currentSelectionParams[attribute.name]?.trim() !== "",
    );
  }, [uniqueAttributes, props.currentSelectionParams]);

  const renderPriceDisplay = () => {
    const { priceInfo } = props;

    switch (priceInfo.type) {
      case "loading":
        return "Cargando precio...";
      case "error":
        // Optionally show specific error: priceInfo.errorMessage
        return "Precio no disponible";
      case "single":
        // Use formatSinglePrice which handles potential strikethrough
        return (
          <span
            dangerouslySetInnerHTML={{
              __html: formatSinglePrice(
                priceInfo.finalPrice !== undefined
                  ? priceInfo.finalPrice.toString()
                  : priceInfo.finalPrice, // Final price converted to string
                currency,
                conversionRate,
                priceInfo.originalPrice !== undefined
                  ? priceInfo.originalPrice.toString()
                  : priceInfo.originalPrice, // Convert original price if defined
              ),
            }}
          />
        );
      case "range":
        // Format the final range
        const finalRangeString = formatRange(
          priceInfo.finalMin,
          priceInfo.finalMax,
          currency,
          conversionRate,
        );

        // Check if base range differs from final range
        const baseRangeDiffers =
          priceInfo.baseMin !== null &&
          (priceInfo.baseMin !== priceInfo.finalMin ||
            priceInfo.baseMax !== priceInfo.finalMax);

        if (baseRangeDiffers) {
          // Format the base range
          const baseRangeString = formatRange(
            priceInfo.baseMin,
            priceInfo.baseMax,
            currency,
            conversionRate,
          );
          // Render base with strikethrough + final range
          return (
            <span
              dangerouslySetInnerHTML={{
                __html: `
                        <span style="text-decoration: line-through; opacity: 0.7; margin-right: 0.5em;">
                            ${baseRangeString}
                        </span>
                        <span>
                            ${finalRangeString}
                        </span>
                    `,
              }}
            />
          );
        } else {
          // Just render the final range
          return <span>{finalRangeString}</span>;
        }
      case "none":
        // If attributes exist, prompt selection, otherwise show unavailable
        return uniqueAttributes.length > 0
          ? "Selecciona opciones para ver el precio"
          : "Precio no disponible";
      default:
        return null; // Should not happen
    }
  };

  return (
    <div className={styles["prix-product-container"]}>
      {/* Left Side */}
      <div className={styles["left-side"]}>
        <div className={styles["slider-wrapper"]}>
          <Slider
            images={
              props.product?.sources?.images.filter((image) => image?.url) || []
            }
            useIndicators={{
              type: "thumbnails",
              position: "over",
              color: { active: "primary", inactive: "secondary" },
            }}
          >
            {props.product?.sources?.images
              ?.filter((image) => image?.url)
              .map((image, i) => (
                <Image key={i} src={image.url} alt={props.product?.name} />
              ))}
          </Slider>
        </div>
      </div>

      {/* Right Side */}
      <div className={styles["right-side"]}>
        <div className={styles["first-row-title-container"]}>
          <div className={styles["product-title"]}>{props.product?.name}</div>
          {/*           {!props.flowProductId && (
            <div className={styles['currency-switch-container']}><CurrencySwitch /></div>
          )} */}
          {/* Price Display Area */}
          <div className={styles["price-selected"]}>{renderPriceDisplay()}</div>
          {/* Share Button */}
          <Button
            type="onlyText"
            color="primary"
            onClick={() => {
              const currentUrl = window.location.href;
              window.open(
                generateWaProductMessage(props.product, currentUrl),
                "_blank",
              );
            }}
          >
            <ShareIcon className={styles["share-icon"]} />
          </Button>
        </div>

        {/* Accordions */}
        <div>
          {props.description.generalDescription && (
            <Accordion
              expanded={props.expanded === "panel1"}
              onChange={props.handleChange("panel1")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Descripción general</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{
                    __html: props.product.description,
                  }}
                /> */}
                {/* <div className="ql-editor" style={{ height: "auto" }}>
                  <RenderHTML htmlString={props.product.description} />
                </div> */}
                <div data-color-mode="light" className={styles["modal-text"]}>
                  <MDEditor.Markdown source={props.product.description} />
                </div>
              </AccordionDetails>
            </Accordion>
          )}
          {props.description.technicalSpecification && (
            <Accordion
              expanded={props.expanded === "panel2"}
              onChange={props.handleChange("panel2")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Especificaciones técnicas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* <Typography>
                  {props.description.technicalSpecification}
                </Typography> */}
                {/* <RenderHTML htmlString={props.description}/> */}
                <div data-color-mode="light" className={styles["modal-text"]}>
                  <MDEditor.Markdown
                    source={props.description.technicalSpecification}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          )}
        </div>

        {/* Attribute Selection */}
        {uniqueAttributes.length > 0 && (
          <div className={styles["select"]}>
            <h4>Selecciona:</h4>
            <div
              className={`${styles["attributes-container"]} ${uniqueAttributes.length > 1 ? styles["space-between"] : styles["flex-start"]}`}
            >
              {uniqueAttributes.map((att, iAtt) => {
                const selectedValue =
                  props.currentSelectionParams[att.name] || "";
                // Assuming getFilteredOptions works correctly based on currentSelectionParams
                const filteredOptions =
                  getFilteredOptions(
                    props.product,
                    att,
                    props.currentSelectionParams,
                  ) || [];

                return (
                  <div
                    key={iAtt}
                    className={styles["attribute-select-wrapper"]}
                  >
                    <FormControl
                      variant="outlined"
                      className={styles["attribute-form-control"]}
                    >
                      <InputLabel id={`label-${att.name}`}>
                        {att.name}
                      </InputLabel>
                      <Select
                        labelId={`label-${att.name}`}
                        id={`select-${att.name}`}
                        name={att.name}
                        value={selectedValue}
                        onChange={props.handleSelection}
                        label={att.name}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Selecciona una opción</em>
                        </MenuItem>
                        {filteredOptions.map((option) => (
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
        )}

        {/* Action Button */}
        <div className={styles["buttons-container"]}>
          <Button
            color="primary"
            // Disable if not all attributes selected OR if price is loading (check specific loading state )
            disabled={
              !allAttributesSelected || props.priceInfo.type === "loading"
            }
            onClick={props.handleArtSelection}
          >
            {props.flowProductId ? "Seleccionar" : "Seleccionar Arte"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landscape;
