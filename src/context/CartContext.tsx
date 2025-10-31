import { Item } from "types/order.types";
import { Cart, CartLine } from "../types/cart.types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "./GlobalContext";
import { Variant, VariantAttribute } from "types/product.types";
import { fetchVariantPrice } from "@api/product.api";
import { User } from "types/user.types";

interface CartContextType {
  cart: Cart;
  addOrUpdateItemInCart: (
    item: Item,
    quantity?: number,
    lineId?: string,
  ) => void;
  updateCartLine: (
    lineId: string,
    updates: Partial<Pick<CartLine, "quantity" | "discount" | "subtotal">>,
  ) => void;
  deleteLineInCart: (line: CartLine) => void;
  emptyCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

interface MyComponentProps {
  children: ReactNode;
}

export const CartProvider: React.FC<MyComponentProps> = ({ children }) => {
  const { user } = useUser() as { user: User | null | undefined }; // Cast if useUser() has a generic return

  const [cart, setCart] = useState<Cart>(() => {
    const storedCart = localStorage.getItem("cart");
    console.log(
      "Initializing cart. Stored cart:",
      storedCart ? "found" : "not found",
    );
    return storedCart
      ? JSON.parse(storedCart)
      : {
          lines: [],
          subTotal: 0,
          totalUnits: 0,
          cartDiscount: 0,
          totalDiscount: 0,
        };
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const calculateCartTotals = useCallback((lines: CartLine[]) => {
    const subTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const totalUnits = lines.reduce((count, line) => count + line.quantity, 0);
    const cartDiscount = lines.reduce(
      (discount, line) => discount + line.discount,
      0,
    );
    return {
      subTotal,
      totalUnits,
      cartDiscount,
      totalDiscount: cartDiscount,
    };
  }, []);

  // Effect to update item prices when user changes or on initial load with a user
  useEffect(() => {
    // user === undefined could mean user state is still loading
    if (user === undefined) {
      console.log("User state is undefined, skipping price update.");
      return;
    }

    if (cart.lines.length === 0) {
      // console.log('Cart is empty, no prices to update.');
      return;
    }

    const updatePricesForCurrentUser = async () => {
      let pricesActuallyChanged = false;

      const updatedLinesPromises = cart.lines.map(async (line) => {
        const product = line.item.product;

        // Validate necessary data for fetching price
        if (
          !product ||
          !product._id ||
          !product.variants ||
          !product.selection
        ) {
          console.warn(
            `Skipping price update for line ID ${line.id} (Product: ${product?.name || "N/A"}): missing essential product data (ID, variants, or selection).`,
          );
          return line;
        }

        let variantId: string | null = null;
        const currentSelection = product.selection; // e.g., [{ name: "Color", value: "Plateado" }]

        if (
          Array.isArray(currentSelection) &&
          Array.isArray(product.variants)
        ) {
          for (const variant of product.variants as Variant[]) {
            // Added type assertion for variant
            if (
              variant &&
              variant._id &&
              Array.isArray(variant.attributes) &&
              variant.attributes.length === currentSelection.length
            ) {
              const isMatch = (currentSelection as VariantAttribute[]).every(
                (
                  selAttr, // Type assertion
                ) =>
                  (variant.attributes as VariantAttribute[]).some(
                    (
                      varAttr, // Type assertion
                    ) =>
                      varAttr.name === selAttr.name &&
                      varAttr.value === selAttr.value,
                  ),
              );
              if (isMatch) {
                variantId = variant._id;
                break;
              }
            }
          }
        }

        if (!variantId) {
          console.warn(
            `Could not find matching variantId for product "${product.name}" with selection:`,
            currentSelection,
            "Available variants:",
            product.variants.map((v) => ({
              _id: (v as Variant)._id,
              name: (v as Variant).name,
              attributes: (v as Variant).attributes,
            })),
          );
          return line;
        }

        try {
          const artId =
            line.item.art && "_id" in line.item.art
              ? line.item.art._id
              : undefined;

          const [_originalApiPrice, userSpecificPrice] =
            await fetchVariantPrice(
              String(variantId),
              String(product._id),
              artId?.toString(),
            );
          const newPriceToUse = userSpecificPrice;

          if (Number(line.item.price) !== newPriceToUse) {
            console.log(
              `Price update for ${product.name} (Variant: ${variantId}): OLD ${line.item.price} -> NEW ${newPriceToUse}`,
            );
            pricesActuallyChanged = true;
            return {
              ...line,
              item: {
                ...line.item,
                price: String(newPriceToUse), // Update item's price
              },
              subtotal: (Number(newPriceToUse) - line.discount) * line.quantity,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching/processing price for product ${product.name}, variant ${variantId}:`,
            error,
          );
          return line; // Return original line on error to prevent cart corruption
        }
        return line; // No price change needed for this line
      });

      const newLines = await Promise.all(updatedLinesPromises);

      if (pricesActuallyChanged) {
        const totals = calculateCartTotals(newLines);
        setCart({
          lines: newLines,
          ...totals,
        });
      }
    };

    updatePricesForCurrentUser();
  }, [user, cart.lines, setCart, calculateCartTotals]); // Added cart.lines to dependencies

  const addOrUpdateItemInCart = async (
    item: Item,
    quantity: number = 1,
    lineId?: string,
  ) => {
    try {
      const lineDiscount = 0; // Placeholder as per original: await fetchLineDiscount(item, quantity);

      const isSameSelection = (
        sel1: { name: string; value: string }[] = [],
        sel2: { name: string; value: string }[] = [],
      ): boolean => {
        if (!sel1 && !sel2) return true;
        if (!sel1 || !sel2) return false;
        if (sel1.length !== sel2.length) return false;
        return sel1.every((s1) =>
          sel2.some((s2) => s1.name === s2.name && s1.value === s2.value),
        );
      };

      let updatedLines = [...cart.lines];
      // Note: The item.price passed to this function might be generic.
      // The useEffect above will correct prices later if they differ for the user.
      // For immediate price correctness upon adding, fetchVariantPrice could also be called here.

      if (lineId) {
        const existingLineIndex = updatedLines.findIndex(
          (line) => line.id === lineId,
        );
        if (existingLineIndex !== -1) {
          const existingLine = updatedLines[existingLineIndex];
          const newQuantity = quantity; // Use the passed quantity for update operations

          // It's assumed `item` contains the potentially updated item details (e.g., different selection)
          // and `item.price` reflects the price for *that specific new configuration*.
          // The useEffect will handle user-specific adjustments if this price is not yet user-specific.
          const priceOfItemToUpdate = Number(item.price);
          const discountOnItemToUpdate = Number(item.discount) || 0;
          const combinedLineDiscount = existingLine.discount + lineDiscount; // Assuming line.discount is per-unit

          const updatedSubtotal =
            (priceOfItemToUpdate -
              discountOnItemToUpdate -
              combinedLineDiscount) *
            newQuantity;

          updatedLines[existingLineIndex] = {
            ...existingLine,
            item: { ...item, sku: existingLine.item.sku }, // Update item, retain SKU
            quantity: newQuantity,
            discount: combinedLineDiscount, // This is per-unit line discount
            subtotal: updatedSubtotal,
          };
        } else {
          console.warn(
            `Line with specified lineId "${lineId}" not found. Item not updated.`,
          );
        }
      } else {
        const existingLineIndex = updatedLines.findIndex(
          (line) =>
            line.item.product?._id === item.product?._id &&
            line.item.art?.artId === item.art?.artId &&
            isSameSelection(
              line.item.product?.selection as VariantAttribute[],
              item.product?.selection as VariantAttribute[],
            ),
        );
        if (existingLineIndex !== -1) {
          const existingLine = updatedLines[existingLineIndex];
          const updatedQuantity = existingLine.quantity + quantity;
          // Price from existing line (should be user-specific if effect ran)
          const currentItemPrice = Number(existingLine.item.price);
          // Product discount on existing item (potentially already factored into item.price by effect)
          const currentItemProductDiscount =
            Number(existingLine.item.discount) || 0;
          const combinedLineDiscount = existingLine.discount + lineDiscount;

          // Using original calculation logic here which subtracts item.discount from item.price
          const updatedSubtotal =
            (currentItemPrice -
              currentItemProductDiscount -
              combinedLineDiscount) *
            updatedQuantity;

          updatedLines[existingLineIndex] = {
            ...existingLine,
            quantity: updatedQuantity,
            discount: combinedLineDiscount,
            subtotal: updatedSubtotal,
          };
        } else {
          const newItemPrice = Number(item.price);
          const newItemProductDiscount = Number(item.discount) || 0;
          const subtotalForNewLine =
            (newItemPrice - newItemProductDiscount - lineDiscount) * quantity;

          const newLine: CartLine = {
            id: uuidv4(),
            item: { ...item, sku: item.sku || uuidv4() },
            quantity,
            discount: lineDiscount, // Per-unit line discount
            subtotal: subtotalForNewLine,
          };
          updatedLines = [...updatedLines, newLine];
        }
      }

      const totals = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, ...totals });
    } catch (error) {
      console.error("Error adding or updating item in cart:", error);
    }
  };

  const updateCartLine = async (
    lineId: string,
    updates: Partial<Pick<CartLine, "quantity" | "discount" | "subtotal">>,
  ) => {
    try {
      const updatedLines = cart.lines.map((line) => {
        if (line.id === lineId) {
          const currentItemPrice = Number(line.item.price); // Should be user-specific
          const currentItemProductDiscount = Number(line.item.discount) || 0;

          const updatedQuantity =
            updates.quantity !== undefined ? updates.quantity : line.quantity;
          const updatedLineDiscount =
            updates.discount !== undefined ? updates.discount : line.discount;

          const recalculatedSubtotal =
            (currentItemPrice -
              currentItemProductDiscount -
              updatedLineDiscount) *
            updatedQuantity;
          const newSubtotal =
            updates.subtotal !== undefined
              ? updates.subtotal
              : recalculatedSubtotal;

          return {
            ...line,
            quantity: updatedQuantity,
            discount: updatedLineDiscount,
            subtotal: newSubtotal,
          };
        }
        return line;
      });

      const totals = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, ...totals });
    } catch (error) {
      console.error("Error updating cart line:", error);
    }
  };

  const deleteLineInCart = async (lineToDelete: CartLine) => {
    try {
      const updatedLines = cart.lines.filter(
        (cartLine) => cartLine.id !== lineToDelete.id,
      );
      const totals = calculateCartTotals(updatedLines);
      setCart({ lines: updatedLines, ...totals });
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  const emptyCart = () => {
    setCart({
      lines: [],
      subTotal: 0,
      totalUnits: 0,
      cartDiscount: 0,
      totalDiscount: 0,
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addOrUpdateItemInCart,
        updateCartLine,
        deleteLineInCart,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
