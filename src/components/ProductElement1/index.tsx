import React from "react";
import { Image } from "components/Image"; // Assuming Image component is already created
import Button from "@material-ui/core/Button"; // Using material UI button, replace if needed
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
    <div className={styles.productElement}>
      {/* Image */}
      <div className={styles.imageContainer}>
        <Image
          src={src}
          alt={productName}
          aspectRatio="square"
          objectFit="contain"
          roundedCorner={roundedCorner}
          fitTo="width"
        />
      </div>

      {/* Product Name */}
      <div className={styles.productName}>
        <span>{productName}</span>
      </div>

      {/* Button */}
      <div className={styles.buttonContainer}>
        <Button
          variant="contained"
          className={styles.detailsButton}
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
