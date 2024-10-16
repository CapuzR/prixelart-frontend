import Product from 'products/interfaces';

declare module 'utils/utils.js' {
    export function generateWaProductMessage(input: Product): string;
  }