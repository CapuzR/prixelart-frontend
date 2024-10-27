import React from "react";
import styles from "./styles.module.scss";
import { CartItem } from 'cart/interfaces';
import Typography from "components/Typography";

export interface ItemContentProps {
  item: CartItem;
}

export default function ItemContent({ item }: ItemContentProps) {

  const getSelectedAttributes = () => {
    return Object.keys(item?.product?.selection || {})
      .slice(0, 3)
      .map((key, index) => (
        <Typography key={index} level="p" color="textSecondary" leading="normal">
          <strong>{key}</strong>: {item?.product?.selection[key]}
        </Typography>
      ));
  };

  return (
    <div className={styles['content-section']}>
      
      <div className={styles['product-section']}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Producto:</strong> {item.product?.name || 'Elígelo'}
        </Typography>
        {getSelectedAttributes()}
      </div>

      <div className={styles['art-section']}>
        <Typography level="h5" leading="normal" color="inherit">
          <strong>Arte:</strong> {item.art?.title || 'Elígelo'}
        </Typography>
        {item.art?.title && item.art?.prixerUsername &&
        <Typography level="p" color="textSecondary" leading="normal">
        <strong>Prixer:</strong> {item.art?.prixerUsername}
        </Typography>}
      </div>

    </div>
  );
}
