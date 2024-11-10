import { Dispatch, SetStateAction } from 'react';
import { Cart } from 'cart/interfaces';

export interface CheckoutProps {
  cart: Cart;
  props: {
    setValuesConsumerForm: (values: any) => void;
    valuesConsumerForm: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setMessage: (message: string) => void;
    onCreateConsumer: () => void;
    setValues: (values: any) => void;
  };
}
