import {
    HourglassEmpty, CreditCardOff, PriceCheck, Cached, Inventory,
    LocalShipping, PublishedWithChanges, CheckCircleOutline, HighlightOff,
    SyncProblem, Undo, AssignmentReturn, HelpOutline
} from '@mui/icons-material';
import { OrderStatus } from 'types/order.types';
import React from 'react'; // Import React for JSX.Element

export const getOrderStatusLabel = (status: OrderStatus): string => {
    switch (status) {
        case OrderStatus.PendingPayment: return "Pendiente de Pago";
        case OrderStatus.PaymentFailed: return "Pago Fallido";
        case OrderStatus.PaymentConfirmed: return "Pago Confirmado";
        case OrderStatus.Processing: return "Procesando";
        case OrderStatus.ReadyToShip: return "Listo para Enviar";
        case OrderStatus.Shipped: return "Enviado";
        case OrderStatus.InTransit: return "En Tránsito";
        case OrderStatus.Delivered: return "Entregado";
        case OrderStatus.Canceled: return "Cancelado";
        case OrderStatus.OnHold: return "En Espera";
        case OrderStatus.ReturnRequested: return "Devolución Solicitada";
        case OrderStatus.ReturnReceived: return "Devolución Recibida";
        case OrderStatus.Refunded: return "Reembolsado";
        default: return "Estado Desconocido";
    }
};

export const getOrderStatusIcon = (status: OrderStatus): React.ReactElement => {
    switch (status) {
        case OrderStatus.PendingPayment: return <HourglassEmpty color="warning" />;
        case OrderStatus.PaymentFailed: return <CreditCardOff color="error" />;
        case OrderStatus.PaymentConfirmed: return <PriceCheck color="success" />;
        case OrderStatus.Processing: return <Cached color="info" />;
        case OrderStatus.ReadyToShip: return <Inventory color="info" />;
        case OrderStatus.Shipped: return <LocalShipping color="primary" />;
        case OrderStatus.InTransit: return <PublishedWithChanges color="primary" />;
        case OrderStatus.Delivered: return <CheckCircleOutline color="success" />;
        case OrderStatus.Canceled: return <HighlightOff sx={{ color: 'grey.700' }} />;
        case OrderStatus.OnHold: return <SyncProblem color="warning" />;
        case OrderStatus.ReturnRequested: return <Undo sx={{ color: 'grey.700' }} />;
        case OrderStatus.ReturnReceived: return <AssignmentReturn color="info" />;
        case OrderStatus.Refunded: return <PriceCheck color="success" />;
        default: return <HelpOutline color="disabled" />;
    }
};

export const getCurrentOrderStatus = (statusHistory: [OrderStatus, Date][]): [OrderStatus, Date] | null => {
    if (!statusHistory || statusHistory.length === 0) {
        return null;
    }
    // Sort by date descending to get the most recent status first
    const sortedHistory = [...statusHistory].sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime());
    return sortedHistory[0];
};