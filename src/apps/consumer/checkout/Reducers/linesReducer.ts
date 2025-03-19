import { OrderLine, CheckoutAction } from '../interfaces';

const updateOrderTotals = (lines: OrderLine[]) => {
  const totalUnits = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { totalUnits, subTotal };
};

export const linesReducer = (lines: OrderLine[], action: CheckoutAction): { lines: OrderLine[]; totals: { totalUnits: number; subTotal: number } } => {

  switch (action.type) {

    case 'ADD_ORDER_LINE': {
      const newLines = [...lines, action.payload];
      return { lines: newLines, totals: updateOrderTotals(newLines) };
    }

    case 'REMOVE_ORDER_LINE': {
      const updatedLines = lines.filter((line) => line.id !== action.payload);
      return { lines: updatedLines, totals: updateOrderTotals(updatedLines) };
    }

    default:
      return { lines, totals: updateOrderTotals(lines) };
      
  }

};
