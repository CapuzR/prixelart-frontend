import React from "react";
import Button from "components/Button";
import { Share as ShareIcon } from "@mui/icons-material";
import { generateWaProductMessage } from "utils/utils";
import styles from "./Portrait.module.scss";
import { Art } from "../../../../types/art.types";
import { Product } from "../../../../types/product.types";
import { MenuItem, FormControl, Select, InputLabel } from "@mui/material";
import ArtsGrid from "@apps/consumer/art/components/ArtsGrid/ArtsGrid";
import { useCart } from "@context/CartContext";
import ProductsCatalog from "@apps/consumer/products/Catalog";
import ItemCard from "@components/ItemCard";
import CurrencySwitch from "@components/CurrencySwitch";
import { CartLine } from "../../../../types/cart.types";
import { Item } from "types/order.types";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface PortraitProps {
  itemId?: string;
  item: Partial<Item>;
  handleCart: (item: Item) => void;
  handleChangeElement: (
    type: "producto" | "arte",
    item: Item,
    lineId?: string,
  ) => void;
  handleSelection?: (
    e: React.ChangeEvent<{ name: string; value: number }>,
  ) => void;
  isItemReady: boolean;
  onArtSelect: (selectedArt: Art) => void;
  onProductSelect: (selectedProduct: Product) => void;
  selectedProductId?: string | null;
  isProductAttributesComplete?: boolean;
  allAttributeNames?: string[];
  isUpdate?: boolean;
  getFilteredOptions?: (attributeName: string) => string[];
  openSection?: "producto" | "arte";
}

export default function Portrait(props: PortraitProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { cart } = useCart();
  const searchParams = new URLSearchParams(window.location.search);
  const lineId = searchParams.get("lineId");

  const handleCart = () => {
    if (!props.isItemReady || !props.item.sku) {
      console.error("Item not ready or SKU is missing");
      return;
    }
    props.handleCart(props.item as Item);
  };

  const showItemCard = Boolean(props.item?.product || props.item?.art);

  const attributeNames = props.allAttributeNames;

  return (
    <div className={styles["prix-product-container"]}>
      <div className={styles["first-row"]}>
        <div className={styles["first-row-title-container"]}>
          <div className={styles["product-title"]}>
            {props.item?.product?.name || "Crea tu Prix ideal"}
          </div>
          {/*    <CurrencySwitch /> */}
        </div>
        <div className={styles["buttons-container"]}>
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              const currentUrl = window.location.href;
              const itemToShare = props.item?.product || props.item?.art;
              if (itemToShare) {
                window.open(
                  generateWaProductMessage(itemToShare, currentUrl),
                  "_blank",
                );
              } else {
                console.error("No product or art selected to share.");
              }
            }}
          >
            <ShareIcon className={styles["share-icon"]} /> Compartir
          </Button>
          <Button
            color="primary"
            onClick={handleCart}
            disabled={!props.isItemReady}
            highlighted={props.isItemReady}
          >
            {cart.lines.some((l: CartLine) => l.id === lineId)
              ? "Actualizar"
              : "Agregar al carrito"}
          </Button>
        </div>
      </div>

      <div className={styles["main-content"]}>
        <div
          className={styles["left-side"]}
          style={{ paddingTop: isMobile ? "3rem !important" : 0 }}
        >
          {showItemCard && (
            <ItemCard
              item={props.item as Item}
              direction="column"
              handleChangeElement={props.handleChangeElement}
            />
          )}
        </div>

        <div className={styles["right-side"]}>
          {props.openSection === "producto" && props.item?.product && (
            <div className={styles["select"]}>
              <h2>Selecciona atributos:</h2>
              <div
                className={`${styles["attributes-container"]} ${
                  attributeNames && attributeNames.length > 1
                    ? styles["space-between"]
                    : styles["flex-start"]
                }`}
              >
                {attributeNames &&
                  attributeNames.map((attributeName) => (
                    <div key={attributeName} style={{ width: "45%" }}>
                      <FormControl variant="outlined" style={{ width: "100%" }}>
                        <InputLabel id={attributeName}>
                          {attributeName}
                        </InputLabel>
                        <Select
                          labelId={attributeName}
                          id={attributeName}
                          name={attributeName}
                          value={
                            props.item?.product?.selection?.find(
                              (sel: { name: string; value: string }) =>
                                sel.name === attributeName,
                            )?.value || ""
                          }
                          onChange={(e) =>
                            props.handleSelection?.(
                              e as unknown as React.ChangeEvent<{
                                name: string;
                                value: number;
                              }>,
                            )
                          }
                          label={attributeName}
                        >
                          <MenuItem value="">
                            <em>Selecciona una opción</em>
                          </MenuItem>
                          {props?.getFilteredOptions &&
                            props
                              ?.getFilteredOptions(attributeName)
                              .map((option) => (
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
          )}

          <div className={styles["right-side-bottom"]}>
            <h2>{`Elige el ${props.openSection === "arte" ? "arte" : "producto"}:`}</h2>
            <div className={styles["art-selection-container"]}>
              <div className={styles["art-grid-wrapper"]}>
                {props.openSection === "arte" ? (
                  <ArtsGrid onArtSelect={props.onArtSelect} />
                ) : (
                  <ProductsCatalog onProductSelect={props.onProductSelect} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
