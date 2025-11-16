import {
  OrderArchive,
  Status as OrderStatus,
  PayStatus as OrderPayStatus,
} from "@prixpon/types/orderArchive.types";
import { ChipProps } from "@mui/material/Chip";

export const formatDate = (
  dateInput?: { $date: Date | string | number } | string | Date | number,
): string => {
  let dateValue: string | Date | number | undefined | null = undefined;

  if (!dateInput) {
    return "N/A";
  }

  // Check if it's the object { $date: ... }
  if (
    typeof dateInput === "object" &&
    dateInput !== null &&
    !(dateInput instanceof Date) &&
    "$date" in dateInput
  ) {
    dateValue = dateInput.$date;
  }
  // Otherwise, assume it's the direct value (string, Date, or number)
  else if (
    typeof dateInput === "string" ||
    dateInput instanceof Date ||
    typeof dateInput === "number"
  ) {
    dateValue = dateInput;
  }

  // If we couldn't extract a usable value
  if (dateValue === null || dateValue === undefined) {
    console.warn("Could not extract date value from input:", dateInput);
    return "Fecha Inválida";
  }

  try {
    // Attempt to create a Date object from the extracted value
    const date = new Date(dateValue);

    // Crucial check: Verify the date is valid
    // `new Date('invalid string')` results in an "Invalid Date" object
    if (isNaN(date.getTime())) {
      // Or use date-fns: if (!isValid(date))
      console.warn("Created invalid date from value:", dateValue);
      return "Fecha Inválida";
    }

    // Format the valid date
    return date.toLocaleDateString("en-GB"); // e.g., "3/18/2025" in en-US locale
  } catch (error) {
    console.error("Error processing date input:", dateInput, error);
    return "Fecha Inválida";
  }
};

export const formatCurrency = (value?: number | null): string => {
  const numericValue = value ?? 0; // Default to 0 if null/undefined
  return new Intl.NumberFormat("en-US", {
    // Use en-US for standard $ formatting
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export const getStatusColor = (status?: OrderStatus): ChipProps["color"] => {
  switch (status) {
    case "En producción":
    case "En impresión":
    case "Por producir":
      return "warning";
    case "Por entregar":
      return "info";
    case "Entregado":
    case "Concretado": // Assuming Concretado means successfully delivered/finished
      return "success";
    case "Anulado":
      return "error";
    default:
      return "default"; // For unknown or undefined statuses
  }
};

export const getPayStatusColor = (
  status?: OrderPayStatus,
): ChipProps["color"] => {
  switch (status) {
    case "Pendiente":
      return "warning";
    case "Abonado":
      return "info";
    case "Pagado":
      return "success";
    case "Anulado":
      return "error";
    case "Obsequio":
      return "secondary"; // Using secondary for Gift/Obsequio
    default:
      return "default"; // For unknown or undefined statuses
  }
};

export const getCustomerName = (order?: OrderArchive | null): string => {
  if (!order) return "Cliente Desconocido";
  // console.log(order.basicData)
  // Prioritize basicData if available
  if (
    order.basicData?.firstname ||
    order.basicData?.name ||
    order.basicData?.lastname
  ) {
    return `${order.basicData.firstname || order.basicData?.name || ""} ${order.basicData.lastname || ""}`.trim();
  }

  // Fallback to shippingData name fields
  // if (order.shippingData?.shippingName || order.shippingData?.shippingLastName) {
  //     return `${order.shippingData.shippingName || ''} ${order.shippingData.shippingLastName || ''}`.trim();
  // }
  // if (order.shippingData?.name || order.shippingData?.lastname) {
  //     return `${order.shippingData.name || ''} ${order.shippingData.lastname || ''}`.trim();
  // }

  // // Fallback to billingData name fields
  // if (order.billingData?.name || order.billingData?.lastname) {
  //     return `${order.billingData.name || ''} ${order.billingData.lastname || ''}`.trim();
  // }
  // if (order.billingData?.billingCompany || order.billingData?.company) {
  //     return order.billingData.billingCompany || order.billingData.company || 'Empresa';
  // }

  // Final fallback
  return "Cliente no especificado";
};
