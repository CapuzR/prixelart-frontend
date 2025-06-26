import { OrderStatus } from "types/order.types";

export const orderStatusToSpanish: Record<string, string> = {
    Pending: 'Pendiente',
    Impression: 'En Impresión',
    Production: 'En Producción',
    ReadyToShip: 'Listo para Enviar',
    Delivered: 'Entregado',
    Finished: 'Finalizado',
    Paused: 'Pausado',
    Canceled: 'Cancelado',
    Desconocido: 'Desconocido'
};

export const getSpanishOrderStatus = (statusEnum: OrderStatus | undefined): string => {
    if (statusEnum === undefined) return orderStatusToSpanish.Desconocido;
    const statusKey = OrderStatus[statusEnum] || 'Desconocido';
    return orderStatusToSpanish[statusKey] || statusKey;
};