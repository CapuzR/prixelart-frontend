
import Button from "components/Button";
import Typography from "@material-ui/core/Typography";
import { WhatsApp, AddShoppingCart } from "@material-ui/icons";
// import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import { formatPriceForUI } from "utils/formats";
import { Slider } from "components/Slider";
import { Image } from "components/Image";
import utils from "utils/utils.js";

import styles from "./styles.module.scss";
import { Product } from 'products/interfaces';

export interface CardProps {
  product: Product;
  currency: 'USD' | 'Bs';
  conversionRate: number;
  handleDetails: (product: Product) => void;
  pointedProduct: string;
  goToFlow: (updatedArt?: any, updatedProduct?: Product) => void;
  isSelectedInFlow?: boolean;
}
export default function Card({ product, currency, conversionRate, handleDetails, pointedProduct, goToFlow, isSelectedInFlow }: CardProps) {
  return (
    <div className={`${styles['card-root']} ${product.name === pointedProduct && styles['pointed']}`} id={product.name}>
      <div className={styles['slider-container']}>
        <Slider images={product?.sources?.images}>
          {product?.sources?.images?.map((image, i) => (
            <Image key={i} src={image.url} alt={product?.name} />
          ))}
        </Slider>
      </div>
      <div className={styles['card-content']}>
        <div className={styles['main-content']}>
          <Typography gutterBottom variant="h4" component="h3">
            {
              product.name.split("\r\n")[0].length > 15 ?
              `${product.name.split("\r\n")[0].slice(0, 15)}...` :
              `${product.name.split("\r\n")[0]}`
            }
          </Typography>
          <p>
            {
            product.description.split("\r\n")[0].length > 60
              ? `${product.description.split("\r\n")[0].slice(0, 65)}...`
              : `${product.description.split("\r\n")[0]}`
            }
          </p>
          <Typography gutterBottom style={{ fontSize: 15, marginTop: "1rem", backgroundColor: "#fff" }}>
            {formatPriceForUI(product.priceRange.from, currency, conversionRate, product.priceRange.to)}
          </Typography>
        </div>
        <div className={styles['buttons-wrapper']}>
          {
            !isSelectedInFlow &&
          <Button
            onClick={() => goToFlow(undefined, product)}
          >
            <AddShoppingCart />
          </Button>
          }
          <Button
            onClick={() => handleDetails(product)}
          >
            Detalles
          </Button>
          <Button
            type= "onlyText"
            color= "primary"
            onClick={() => window.open(utils.generateWaProductMessage(product), "_blank")}
          >
            <WhatsApp /> Info
          </Button>
        </div>
      </div>
    </div>
  );
}
