import React from "react";
import { Image } from "components/Image"; // Assuming Image component is already created
import Button from "components/Button"; // Using material UI button, replace if needed
import styles from "./Styles.module.scss"; // Custom SCSS file

interface ProductElement1Props {
  src: string;
  productName: string;
  buttonLabel: string;
  onButtonClick: () => void;
  roundedCorner?: boolean;
}

export const ProductElement1: React.FC<ProductElement1Props> = ({
  src,
  productName,
  buttonLabel,
  onButtonClick,
  roundedCorner = true,
}) => {
  return (
    <div className={styles['product-element']}>
      {/* Image */}
      <div className={styles['image-container']}>
        <Image
          src={src}
          alt={productName}
          objectFit="cover"
          roundedCorner={roundedCorner}
          fitTo="square"
        />
      </div>

      {/* Product Name */}
      <div className={styles['product-name']}>
        <span>{productName}</span>
      </div>

      {/* Button */}
      <div className={styles['button-container']}>
        <Button
          type="filled"
          color="primary"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
