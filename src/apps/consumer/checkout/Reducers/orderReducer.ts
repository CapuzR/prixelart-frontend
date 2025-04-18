import { linesReducer } from "./linesReducer"
import { consumerDetailsReducer } from "./consumerDetailsReducer"
import { shippingReducer } from "./shippingReducer"
import { billingReducer } from "./billingReducer"
import { paymentReducer } from "./paymentReducer"
import {
  Order,
  CheckoutAction,
  ConsumerDetails,
  PaymentDetails,
  BillingDetails,
  ShippingDetails,
} from "../interfaces"
// import { initializeCheckoutState } from "../init"
// import { useCart } from "@context/CartContext"
import { nanoid } from "nanoid"

// const { cart, emptyCart } = useCart()
const initialConsumerDetails: ConsumerDetails = {
  basic: {
    name: "",
    lastName: "",
    phone: "",
  },
  selectedAddress: {
    line1: "",
    city: "",
    state: "",
    country: "",
  },
  addresses: [],
  type: "Particular",
}

const initialPaymentDetails: PaymentDetails = {}
const initialShippingDetails: ShippingDetails = {
  basic: {
    name: "",
    lastName: "",
    phone: "",
  },
}
const initialBillingDetails: BillingDetails = {
  basic: {
    name: "",
    lastName: "",
    phone: "",
  },
}

const initialOrder: Order = {
  id: nanoid(8),
  lines: [],
  createdOn: new Date(),
  createdBy: "",
  // updates: [Date, string]; // updates when and by whom
  status: { name: "Por producir" },
  consumerDetails: initialConsumerDetails,
  // payment?: initialPaymentDetails,
  shipping: initialShippingDetails,
  billing: initialBillingDetails,
  payment: { methods: [] },
  totalUnits: 0,
  subTotal: 0,
  // discount?: undefined,
  // shippingCost?: 0,
  tax: [],
  totalWithoutTax: 0,
  total: 0,
  // seller?: undefined,
  // observations?: undefined
}

export const orderReducer = (order: Order, action: CheckoutAction): Order => {
  switch (action.type) {
    case "UPDATE_ORDER":
      return { ...order, ...action.payload }

    // case "UPDATE_ORDER_LINE":
    //   return {
    //     ...order,
    //     lines: order.lines.some((line) => line.id === action.payload.id)
    //       ? order.lines.map((line) =>
    //           line.id === action.payload.id
    //             ? { ...line, ...action.payload }
    //             : line
    //         )
    //       : [...order.lines, action.payload],
    //   }

    // case "REMOVE_ORDER_LINE":
    //   return {
    //     ...order,
    //     lines: order.lines.filter((line) => line.id !== action.payload.id),
    //   }

    case "SET_SELLER":
      return {
        ...order,
        seller: action.payload,
      }

    case "SET_OBSERVATIONS":
      return {
        ...order,
        observations: action.payload,
      }

    case "SET_BILLING_DETAILS":
    case "SET_BILLING_BASIC":
      return {
        ...order,
        billing: billingReducer(order.billing, action),
      }

    case "RESET_ORDER":
      return initialOrder

    case "RESET_BASIC_DATA":
      return {
        ...order,
        consumerDetails: {
          ...order.consumerDetails,
          ...action.payload.consumerDetails,
        },
        shipping: {
          ...order.shipping,
          ...action.payload.shipping,
        },
        billing: {
          ...order.billing,
          ...action.payload.billing,
        },
      }

    default:
      const { lines, totals } = linesReducer(order.lines, action)

      return {
        ...order,
        lines,
        totalUnits: totals?.totalUnits ?? order.totalUnits,
        subTotal: totals?.subTotal ?? order.subTotal,
        consumerDetails: consumerDetailsReducer(
          order.consumerDetails ?? initialConsumerDetails,
          action
        ),
        shipping: shippingReducer(order.shipping, action),
        billing: billingReducer(order.billing, action),
        payment: paymentReducer(order.payment ?? initialPaymentDetails, action),
      }
  }
}
