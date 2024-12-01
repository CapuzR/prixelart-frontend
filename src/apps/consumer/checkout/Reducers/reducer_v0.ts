// import { CheckoutState, CheckoutAction } from '../interfaces';

// export const checkoutReducer = (
//   state: CheckoutState,
//   action: CheckoutAction
// ): CheckoutState => {
//   switch (action.type) {
//     case 'SET_ACTIVE_STEP':
//         return {
//             ...state,
//             activeStep:
//             action.payload === 'back'
//                 ? Math.max(state.activeStep - 1, 0)
//                 : action.payload === 'next'
//                 ? state.activeStep + 1
//                 : action.payload, // Directly set if it's a number
//         };
//     case 'SET_LOADING':
//       return { ...state, loading: action.payload };
//     case 'UPDATE_ORDER':
//       return { ...state, order: { ...state.order, ...action.payload } };
//     case 'ADD_ORDER_LINE':
//       const newLines = [...state.order.lines, action.payload];
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           lines: newLines,
//           totalUnits: newLines.reduce((sum, line) => sum + line.quantity, 0),
//           subTotal: newLines.reduce((sum, line) => sum + line.subtotal, 0),
//         },
//       };
//     case 'REMOVE_ORDER_LINE':
//       const updatedLines = state.order.lines.filter(
//         (line) => line.id !== action.payload
//       );
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           lines: updatedLines,
//           totalUnits: updatedLines.reduce((sum, line) => sum + line.quantity, 0),
//           subTotal: updatedLines.reduce((sum, line) => sum + line.subtotal, 0),
//         },
//       };
//     case 'SET_SHIPPING_METHOD': {
//       const selectedMethod = state.shippingMethods?.find(
//         (method) => method.name === action.payload.method
//       );
    
//       if (!selectedMethod) {
//         console.warn(`Shipping method "${action.payload.method}" not found.`);
//         return state; // No changes if the method is not found
//       }
    
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           consumerDetails: {
//             ...state.order.consumerDetails,
//             shipping: {
//               ...state.order.consumerDetails.shipping,
//               method: selectedMethod, // Store the matched shipping method object
//             },
//           },
//         },
//       };
//     }
//     case 'SET_SHIPPING_METHODS':
//       return {
//         ...state,
//         shippingMethods: action.payload, // Update the top-level `shippingMethods`
//       };
//     case 'SET_PAYMENT_METHOD': {
//       const newPaymentMethods = Array.isArray(action.payload)
//         ? action.payload // Replace all methods
//         : [...(state.order.paymentMethod || []), action.payload]; // Add a new method
    
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           paymentMethod: newPaymentMethods,
//         },
//       };
//     }
//     case 'SET_SELLERS':
//     return {
//       ...state,
//       sellers: action.payload,
//     };
//     case 'SET_PAYMENT_METHODS': {
//       return {
//         ...state,
//         paymentMethods: action.payload,
//       };
//     }
//     case 'REMOVE_PAYMENT_METHOD': {
//       const updatedPaymentMethods = (state.order.paymentMethod || []).filter(
//         (method) => method.id !== action.payload // Remove by ID
//       );
    
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           paymentMethod: updatedPaymentMethods,
//         },
//       };
//     };
//     case 'SET_CONSUMER_DETAILS':
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           consumerDetails: {
//             ...state.order.consumerDetails,
//             basic: {
//               ...state.order.consumerDetails.basic, // Preserve existing fields in `basic`
//               ...action.payload, // Update specific fields passed in `action.payload`
//             },
//           },
//         },
//       };
//     case 'SET_BILLING_DETAILS':
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           consumerDetails: {
//             ...state.order.consumerDetails,
//             billing: {
//               ...state.order.consumerDetails.billing, // Preserve existing fields in `billing`
//               ...action.payload, // Update specific fields passed in `action.payload`
//             },
//           },
//         },
//       };      
//     case 'SET_SHIPPING_DETAILS':
//       return {
//         ...state,
//         order: {
//           ...state.order,
//           consumerDetails: {
//             ...state.order.consumerDetails,
//             shipping: {
//               ...state.order.consumerDetails.shipping,
//               ...action.payload,
//             },
//           },
//         },
//       };
//       case 'SET_PAYMENT_VOUCHER':
//         return {
//           ...state,
//           order: {
//             ...state.order,
//             paymentVoucher: action.payload
//           }
//         };
//       case 'SET_SELLER':
//         return {
//           ...state,
//           order: {
//             ...state.order,
//             seller: action.payload.seller
//           }
//         };
//       case 'SET_OBSERVATIONS':
//         console.log("SELLER", action.payload);
//         return {
//           ...state,
//           order: {
//             ...state.order,
//             observations: action.payload.observations
//           }
//         };
//     case 'SET_EXPANDED_SECTION':
//       return {
//         ...state,
//         expandedSection: action.payload, // Update the expandedSection with the provided value
//       };
//     default:
//       return state;
//   }
// };

