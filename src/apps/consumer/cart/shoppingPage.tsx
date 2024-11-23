import React from 'react';
import { Alert } from '@material-ui/lab';

import { useCart } from 'context/CartContext';

import CurrencySwitch from 'components/CurrencySwitch';
import Checkout from 'apps/consumer/checkout';
import CartReview from './CartReview';

import styles from './cart.module.scss';

// Define the types for props if any additional ones are passed
interface ShoppingPageProps {
  setValuesConsumerForm: (values: any) => void;
  valuesConsumerForm: any;
}

const ShoppingPage: React.FC<ShoppingPageProps> = (props) => {
  const { cart } = useCart();

  return (
    <div className={styles['main-container']}>
      <div className={styles['alert-container']}>
        <Alert severity="info">
          <strong>Importante:</strong> tus datos son 100% confidenciales y no serán compartidos con
          terceros
        </Alert>
      </div>

      <div className={styles['switch-container']}>
        <CurrencySwitch />
      </div>

      <div className={styles['content-row']}>
        <div className={styles['cart-review-container']}>
          <CartReview />
        </div>

        <div className={styles['checkout-container']}>
          <Checkout
            cart={cart}
            props={props}
          />
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
