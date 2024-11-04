import { Dispatch, SetStateAction } from 'react';
import { CartItem } from 'cart/interfaces';

export interface CheckoutProps {
  cart: CartItem[];
  props: {
    setValuesConsumerForm: (values: any) => void;
    valuesConsumerForm: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setMessage: (message: string) => void;
    onCreateConsumer: () => void;
    setValues: (values: any) => void;
  };
}
