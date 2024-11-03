import React from "react";
import styles from "./styles.module.scss";
import { CartItem } from 'cart/interfaces';
import Typography from "components/Typography";

export interface ItemContentProps {
  item: CartItem;
  direction?: 'row' | 'column';
}

export default function ItemContent({ item, direction='row' }: ItemContentProps) {

  const getSelectedAttributes = () => {
    return Object.keys(item?.product?.selection || {})
        .slice(0, 3)
        .filter((key) => item?.product?.selection[key] !== '')
        .map((key, index) => (
          <Typography key={index} level="p" color="textSecondary" leading="normal">
            <strong>{key}</strong>: {item?.product?.selection[key]}
          </Typography>
        ));
  };

  return (
    <div className={`${styles['content-section']} ${styles[direction]}`}>
      
      <div className={`${styles['product-section']} ${ direction === "row" && styles['paper']  }`}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Producto:</strong> {item.product?.name || 'Elígelo'}
        </Typography>
        {getSelectedAttributes()}
      </div>

      <div className={`${styles['art-section']} ${ direction === "row" && styles['paper']  }`}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Arte:</strong> {item.art?.title || 'Selecciónalo'}
        </Typography>
        {item.art?.title && item.art?.prixerUsername &&
        <Typography level="p" color="textSecondary" leading="normal">
        <strong>Prixer:</strong> {item.art?.prixerUsername}
        </Typography>}
      </div>

    </div>
  );
}
