import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, PickedProduct, PickedArt } from "cart/interfaces";
import { v4 as uuidv4 } from 'uuid';


interface CartContextType {
  cart: CartItem[];
  addItemToCart: (input: { product: PickedProduct | undefined; art: PickedArt | undefined; quantity?: number }) => void;
  updateItemInCart: (input: { product: PickedProduct | undefined; art: PickedArt | undefined; id: string; quantity?: number }) => void;
  deleteItemInCart: (id: string) => void;
  deleteElementInItem: (id: string, type: "product" | "art") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider: React.FC = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addItemToCart = (input: { product: PickedProduct | undefined; art: PickedArt | undefined; quantity?: number }) => {
    console.log("CartProvider -> addItemToCart -> input", input);
    if (!input.art && !input.product) {
      throw new Error("Either 'art' or 'product' must be provided.");
    }
  
    const newCart = [...cart];
  
    newCart.push({
      id: uuidv4(),
      art: input.art || undefined,
      product: input.product || undefined,
      quantity: input.quantity || 1,
    });
  
    setCart(newCart);
  };

  const updateItemInCart = (input: { product?: PickedProduct; art?: PickedArt; id: string; quantity?: number }) => {
    const newCart = cart.map(item => {
      if (item.id === input.id) {
        return {
          ...item,
          product: input.product || item.product,
          art: input.art || item.art,
          quantity: input.quantity !== undefined ? input.quantity : item.quantity,
        };
      }
      return item;
    });
    setCart(newCart);
  };

  const deleteItemInCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
  };

  const deleteElementInItem = (id: string, type: "product" | "art") => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        if (type === "product") {
          return { ...item, product: undefined };
        } else {
          return { ...item, art: undefined };
        }
      }
      return item;
    }).filter(item => item.product || item.art);
    setCart(newCart);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItemToCart,
        updateItemInCart,
        deleteItemInCart,
        deleteElementInItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
