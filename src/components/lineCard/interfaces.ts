import { CartLine as Line } from 'apps/consumer/cart/interfaces'; 
import { Item } from 'types/item.types';

export type CartLine = Partial<Line>;
export type { Item };
