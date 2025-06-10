import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Box, Button } from '@mui/material';
import { Order, OrderStatus } from 'types/order.types';

interface RecentOrdersListProps {
    orders: Order[];
    loading?: boolean;
    onViewOrder: (orderId: string) => void;
}
export const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders, loading, onViewOrder }) => (
    <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Órdenes Recientes</Typography>
        {loading ? <CircularProgress /> :
            <List dense>
                {orders.length === 0 && <Typography variant="body2">No hay órdenes recientes.</Typography>}
                {orders.slice(0, 5).map((order, index) => ( // Show top 5
                    <React.Fragment key={order._id?.toString() || index}>
                        <ListItem
                            secondaryAction={
                                <Button size="small" onClick={() => onViewOrder(order._id!.toString())}>Ver</Button>
                            }
                        >
                            <ListItemText
                                primary={`Órden #${order.number || order._id?.toString().slice(-6)}`}
                                secondary={`On: ${new Date(order.createdOn).toLocaleDateString()} - Status: ${order.lines.length > 0 ? OrderStatus[order.lines[0].status[order.lines[0].status.length - 1][0]] : 'N/A'}`}
                            />
                        </ListItem>
                        {index < orders.slice(0, 5).length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>}
        {orders.length > 5 && <Button size="small" sx={{ mt: 1 }}>Ver todas</Button>}
    </Paper>
);