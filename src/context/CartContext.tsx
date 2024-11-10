import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartLine, Item, PickedProduct, PickedArt } from "cart/interfaces";
import { v4 as uuidv4 } from 'uuid';
import { fetchLineDiscount } from "cart/api";


interface CartContextType {
  cart: Cart;
  addOrUpdateItemInCart: (item: Item, quantity?: number, lineId?: string) => void;
  updateCartLine: (lineId: string, updates: Partial<Pick<CartLine, 'quantity' | 'discount' | 'subtotal'>>) => void;
  deleteLineInCart: (id: string) => void;
  deleteElementInItem: (id: string, type: "producto" | "arte") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider: React.FC = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : { lines: [], subTotal: 0, totalUnits: 0, cartDiscount: 0, totalDiscount: 0 };
  });
  
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const calculateCartTotals = (lines: CartLine[]) => {
    const subTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const totalUnits = lines.reduce((count, line) => count + line.quantity, 0);
    const cartDiscount = lines.reduce((discount, line) => discount + line.discount, 0);
    return { subTotal, totalUnits, cartDiscount, totalDiscount: subTotal - cartDiscount };
  };

  //Creo que aquí necesitaré varios calculateSubtotal en el backend: para line-level y para...
  //...cart-level que me traiga subtotal, totalUnits, cartDiscount y totalDiscount.
  //También necesite un calculateTotal que me traiga totalShipping, totalTax, totalWithoutTax y totalWithTax.
  //Quizás en vez de tener fetchLineDiscount, tenga un fetchLineDetails (?)
  //Los descuentos deberían calcularse en caliente en el momento de verlos, si se agregan al lS se puede confundir la cosa.
  const addOrUpdateItemInCart = async (item: Item, quantity: number = 1, lineId?: string) => {
    try {
      // const lineDiscount = await fetchLineDiscount(item, quantity);
      const lineDiscount = 0;
  
      let updatedLines = [...cart.lines];
  
      if (lineId) {
        const existingLineIndex = updatedLines.findIndex(line => line.id === lineId);
  
        if (existingLineIndex !== -1) {
          const existingLine = updatedLines[existingLineIndex];
          const updatedQuantity = existingLine.quantity + quantity;
          const updatedDiscount = existingLine.discount + lineDiscount;
          const updatedSubtotal = (item.price - item.discount - updatedDiscount) * updatedQuantity;
  
          updatedLines[existingLineIndex] = {
            ...existingLine,
            item: { ...item, sku: existingLine.item.sku },
            quantity: updatedQuantity,
            discount: updatedDiscount,
            subtotal: updatedSubtotal,
          };
        } else {
          console.warn("Line with specified lineId not found. Adding as new line.");
        }
      } else {
        const existingLineIndex = updatedLines.findIndex(
          line => line.item.product?.id === item.product?.id && line.item.art?.artId === item.art?.artId
        );
  
        if (existingLineIndex !== -1) {
          const existingLine = updatedLines[existingLineIndex];
          const updatedQuantity = existingLine.quantity + quantity;
          const updatedDiscount = existingLine.discount + lineDiscount;
          const updatedSubtotal = (item.price - item.discount - updatedDiscount) * updatedQuantity;
  
          updatedLines[existingLineIndex] = {
            ...existingLine,
            quantity: updatedQuantity,
            discount: updatedDiscount,
            subtotal: updatedSubtotal,
          };
        } else {
          const newLine: CartLine = {
            id: uuidv4(),
            item: { ...item, sku: uuidv4() },
            quantity,
            discount: lineDiscount,
            subtotal: (item.price - item.discount - lineDiscount) * quantity,
          };
  
          updatedLines = [...updatedLines, newLine];
        }
      }
  
      const { subTotal, totalUnits, cartDiscount, totalDiscount } = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, subTotal, totalUnits, cartDiscount, totalDiscount });
    } catch (error) {
      console.error("Error adding or updating item in cart:", error);
    }
  };
  
  
  const updateCartLine = async (lineId: string, updates: Partial<Pick<CartLine, 'quantity' | 'discount' | 'subtotal'>>) => {
    try {
      const updatedLines = cart.lines.map(line => {
        if (line.id === lineId) {
          const updatedQuantity = updates.quantity ?? line.quantity;
          const updatedDiscount = updates.discount ?? line.discount;
          const updatedSubtotal = updates.subtotal ?? (line.item.price - line.item.discount - updatedDiscount) * updatedQuantity;
  
          return {
            ...line,
            quantity: updatedQuantity,
            discount: updatedDiscount,
            subtotal: updatedSubtotal,
          };
        }
        return line;
      });
  
      // Recalculate the cart totals based on the updated lines
      const { subTotal, totalUnits, cartDiscount, totalDiscount } = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, subTotal, totalUnits, cartDiscount, totalDiscount });
    } catch (error) {
      console.error("Error updating cart line:", error);
    }
  };
  
  const deleteLineInCart = async (id: string) => {
    try {
      const updatedLines = cart.lines.filter(line => line.item.sku !== id);
      const { subTotal, totalUnits, cartDiscount, totalDiscount } = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, subTotal, totalUnits, cartDiscount, totalDiscount });
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  const deleteElementInItem = async (id: string, type: "producto" | "arte") => {
    try {
      const updatedLines = cart.lines
        .map(line => {
          if (line.item.sku === id) {
            // Remove the specified element while keeping the rest of the item data
            if (type === "producto") {
              return { ...line, item: { ...line.item, product: undefined } };
            } else {
              return { ...line, item: { ...line.item, art: undefined } };
            }
          }
          return line;
        })
        .filter(line => line.item.product || line.item.art); // Keep only lines with at least one valid element
  
      const { subTotal, totalUnits, cartDiscount, totalDiscount } = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, subTotal, totalUnits, cartDiscount, totalDiscount });
    } catch (error) {
      console.error("Error deleting element from item:", error);
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addOrUpdateItemInCart,
        updateCartLine,
        deleteLineInCart,
        deleteElementInItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
