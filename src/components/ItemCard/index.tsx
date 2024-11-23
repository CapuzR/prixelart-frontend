// import React, { useEffect, useState } from "react";
// import DeleteIcon from "@mui/icons-material/Delete";
// import FileCopyIcon from "@mui/icons-material/FileCopy";
// import styles from "./styles.module.scss";
// import { useCart } from 'context/CartContext';
// import { CartLine } from './interfaces';
// import ItemContent from "components/ItemContent";
// import ItemPlayground from "components/ItemPlayground";
// import ActionBar from "./components/ActionBar"; // Import ActionBar
// import Typography from "components/Typography";
// import { formatPriceForUI } from "utils/formats";
// import { useConversionRate, useCurrency } from "context/GlobalContext";

// export interface ItemCardProps {
//   line: CartLine;
//   direction?: 'row' | 'column';
//   hasActionBar?: boolean;
//   handleDeleteElement?: (type: 'producto' | 'arte', line: CartLine) => void;
// }

// export default function ItemCard({
//   line,
//   direction = 'row',
//   hasActionBar=true,
//   handleDeleteElement
// }: ItemCardProps) {
//   const { deleteLineInCart, addOrUpdateItemInCart } = useCart();
//   const { currency } = useCurrency();
//   const { conversionRate } = useConversionRate();
//   const [quantity, setQuantity] = useState<string | number>(line.quantity);

//   useEffect(() => {
//     line.item.product?.price === undefined &&
//     setQuantity(1);
//   }, [line.quantity]);

//   const handleDelete = () => {
//     deleteLineInCart(line.item.sku);
//   };

//   const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setQuantity(value ? Math.max(1, parseInt(value, 10)) : "");
//   };

//   const handleQuantityBlur = () => {
//     if (!quantity) setQuantity(1);
//   };

//   //TODO: Implementar la función handleCopy
//   const handleCopy = () => {
//     //Esto te debería llevar a flow para que edites una nueva copia del producto como quieras
//     //Es decir, será un queryString + history.push
//     // addOrUpdateItemInCart({
//     //   product: line.item.product,
//     //   art: line.item.art,
//     //   quantity: line.quantity,
//     // });
//   };

//   const getUnitPrice = () => {
//     return line.item.product?.price ?
//       formatPriceForUI(line.item.product.price, currency, conversionRate) :
//       formatPriceForUI(line.item.product?.priceRange?.from, currency, conversionRate, line.item.product?.priceRange?.to)
//   };

//   const getFinalPrice = () => {
//     const qty = typeof quantity === 'string' ? 1 : quantity;
//     return line.item.product?.price ?
//       formatPriceForUI(qty * line.item.product.price, currency, conversionRate) :
//       undefined;
//   };

//   return (
//     <div className={`${styles['card-root']}`} id={line.item.sku}>
//       <div className={`${styles['card-content']} ${styles[direction]}`}>
//         <div className={styles['item-playground']}>
//           <ItemPlayground item={line.item} handleDeleteElement={handleDeleteElement} />
//         </div>

//         <div className={styles['item-content']}>
//           {/* To do: Cambiar esta confusión cochina donde direction es distinto en todos lados conceptualmente. */}
//           <ItemContent item={line.item} direction={direction == 'row' ? 'column' : 'row'} />
//           {
//             line.item.product &&
//               <div className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`}>
//                 <div className={styles['unit-price']}>
//                   <Typography level="h6">Unitario</Typography>
//                   <Typography level="p">{getUnitPrice()}</Typography>
//                 </div>

//                 {line.item.product?.price !== undefined && line.quantity !== undefined && (
//                   <>
//                     <div className={styles['quantity']}>
//                       <Typography level="h6">Cantidad</Typography>
//                       <input
//                         type="number"
//                         value={quantity}
//                         onChange={handleQuantityChange}
//                         onBlur={handleQuantityBlur}
//                         className={styles['quantity-input']}
//                         min="1"
//                         disabled={line.item.product.price === undefined}
//                       />
//                     </div>

//                     <div className={styles['subtotal']}>
//                       <Typography level="h6">Subtotal</Typography>
//                       <Typography level="p">{getFinalPrice()}</Typography>
//                     </div>
//                   </>
//                 )}
//               </div>
//           }
//         </div>
//       </div>

//       {hasActionBar &&
//       <ActionBar
//         onUpperAction={handleDelete}
//         onLowerAction={handleCopy}
//         upperIcon={<DeleteIcon className={styles['icon']} />}
//         lowerIcon={<FileCopyIcon className={styles['icon']} />}
//       />}

//     </div>
//   );
// }

import React from 'react';
import styles from './styles.module.scss';
import ItemPlayground from 'components/ItemPlayground';
import ItemContent from 'components/ItemContent';
import Typography from 'components/Typography';
import { formatPriceForUI } from 'utils/formats';
import { Item } from './interfaces';
import { useConversionRate, useCurrency } from 'context/GlobalContext';

export interface ItemCardProps {
  item: Item;
  direction?: 'row' | 'column';
  handleFlow: (type: 'producto' | 'arte') => void;
  handleDeleteElement?: (type: 'producto' | 'arte', item: Item) => void;
}

export default function ItemCard({
  item,
  direction = 'row',
  handleFlow,
  handleDeleteElement,
}: ItemCardProps) {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const getUnitPrice = () => {
    console.log('ItemCard - getUnitPrice - item: ', item);
    return item.price
      ? formatPriceForUI(item.price, currency, conversionRate)
      : formatPriceForUI(
          item.product?.priceRange?.from,
          currency,
          conversionRate,
          item.product?.priceRange?.to
        );
  };

  return (
    <>
      <div className={styles['item-playground']}>
        <ItemPlayground
          item={item}
          handleDeleteElement={handleDeleteElement}
          handleFlow={handleFlow}
        />
      </div>
      <div className={styles['item-content']}>
        <ItemContent item={item} direction={direction === 'row' ? 'column' : 'row'} />
        {item.product && (
          <div
            className={`${styles['pricing-info']} ${direction === 'column' && styles['extra-padding']}`}
          >
            <div className={styles['unit-price']}>
              <Typography level="h6">Unitario</Typography>
              <Typography level="p">{getUnitPrice()}</Typography>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
