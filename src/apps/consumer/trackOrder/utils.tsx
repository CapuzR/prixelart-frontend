import {
  HourglassEmpty,
  Print, // Added for Impression
  Cached,
  Inventory,
  LocalShipping, // Re-purposed for Delivered
  CheckCircleOutline, // Re-purposed for Finished
  PauseCircleOutline, // Added for Paused
  HighlightOff,
  HelpOutline,
} from "@mui/icons-material";
import { OrderStatus } from "types/order.types"; // Assuming this path is correct
import React from "react";

/**
 * Gets the Spanish label for a given OrderStatus.
 * @param status The OrderStatus enum value.
 * @returns A user-friendly string label.
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return "Pendiente";
    case OrderStatus.Impression:
      return "Impresión";
    case OrderStatus.Production:
      return "Producción";
    case OrderStatus.ReadyToShip:
      return "Listo para Enviar";
    case OrderStatus.Delivered:
      return "Entregado";
    case OrderStatus.Finished:
      return "Finalizado";
    case OrderStatus.Paused:
      return "En Pausa";
    case OrderStatus.Canceled:
      return "Cancelado";
    default:
      return "Estado Desconocido";
  }
};

/**
 * Gets a Material-UI icon for a given OrderStatus.
 * @param status The OrderStatus enum value.
 * @returns A ReactElement representing the icon.
 */
export const getOrderStatusIcon = (status: OrderStatus): React.ReactElement => {
  switch (status) {
    case OrderStatus.Pending:
      return <HourglassEmpty color="warning" />;
    case OrderStatus.Impression:
      return <Print color="info" />;
    case OrderStatus.Production:
      return <Cached color="info" />;
    case OrderStatus.ReadyToShip:
      return <Inventory color="primary" />;
    case OrderStatus.Delivered:
      return <LocalShipping sx={{ color: "purple" }} />;
    case OrderStatus.Finished:
      return <CheckCircleOutline color="success" />;
    case OrderStatus.Paused:
      return <PauseCircleOutline color="warning" />;
    case OrderStatus.Canceled:
      return <HighlightOff sx={{ color: "grey.700" }} />;
    default:
      return <HelpOutline color="disabled" />;
  }
};

/**
 * Gets the most recent status from a history array.
 * This function does not need changes as its logic is based on the array structure, not the enum values.
 * @param statusHistory An array of [OrderStatus, Date] tuples.
 * @returns The most recent [OrderStatus, Date] tuple or null if the history is empty.
 */
export const getCurrentOrderStatus = (
  statusHistory: [OrderStatus, Date][],
): [OrderStatus, Date] | null => {
  if (!statusHistory || statusHistory.length === 0) {
    return null;
  }
  // Sort by date descending to get the most recent status first
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
  );
  return sortedHistory[0];
};
