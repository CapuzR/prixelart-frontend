import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Box, Button, Chip } from '@mui/material';
import { Order, OrderStatus } from 'types/order.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSpanishOrderStatus } from '@apps/admin/utils/translations';

interface FilteredOrdersListProps {
    orders: Order[];
    loading?: boolean;
    onViewOrder: (orderId: string) => void;
    emptyMessage: string;
}

const getStatusLabel = (status: OrderStatus) => {
    return OrderStatus[status] || 'Desconocido';
}

const FilteredOrdersList: React.FC<FilteredOrdersListProps> = ({ orders, loading, onViewOrder, emptyMessage }) => (
    <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        ) : (
            <List dense>
                {orders.slice(0, 10).map((order, index) => {
                    const latestStatus = order.status?.[order.status.length - 1]?.[0];
                    const customer = order.consumerDetails?.basic;
                    const customerName = customer ? `${customer.name} ${customer.lastName}`.trim() : 'N/A';

                    return (
                        <React.Fragment key={order._id?.toString() || index}>
                            <ListItem /* ... */ >
                                <ListItemText
                                    primary={`Órden #${order.number || order._id?.toString().slice(-6)} - ${customerName}`}
                                    secondary={
                                        <>
                                            {`Hace ${formatDistanceToNow(new Date(order.createdOn), { locale: es })} - Total: $${(order.total || 0).toFixed(2)}`}
                                            <br />
                                            {latestStatus !== undefined && <Chip label={getSpanishOrderStatus(latestStatus)} size="small" sx={{ mt: 0.5 }} />}
                                        </>
                                    }
                                />
                            </ListItem>
                            {index < orders.slice(0, 10).length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    )
                })}
            </List>
        )}
        {orders.length > 10 && <Button size="small" sx={{ mt: 1 }}>Ver todas las {orders.length} órdenes</Button>}
    </Paper>
);

export default FilteredOrdersList;