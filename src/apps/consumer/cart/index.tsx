import React, { useState } from 'react';
import { Alert } from '@mui/lab';

import { useCart } from 'context/CartContext';

import CurrencySwitch from 'components/CurrencySwitch';
import Checkout from 'apps/consumer/checkout';
import CartGrid from './Grid';

import styles from './styles.module.scss';

const Cart = () => {
  const { cart } = useCart();
  const [valuesConsumerForm, setValuesConsumerForm] = useState<string>('');

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
          <CartGrid />
        </div>

        <div className={styles['checkout-container']}>
          <Checkout
            cart={cart}
            valuesConsumerForm={valuesConsumerForm}
            setValuesConsumerForm={setValuesConsumerForm}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
