import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Avatar, ListItemAvatar, CircularProgress, Box, Button } from '@mui/material';

interface TopItem {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    imageUrl?: string;
}
interface TopPerformingItemsListProps {
    items: TopItem[];
    loading?: boolean;
}
export const TopPerformingItemsList: React.FC<TopPerformingItemsListProps> = ({ items, loading }) => (
    <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Productos más vendidos</Typography>
        {loading ? <CircularProgress /> :
            <List dense>
                {items.length === 0 && <Typography variant="body2">No hay estadísticas de Productos</Typography>}
                {items.map((item) => (
                    <ListItem key={item.id}>
                        <ListItemAvatar>
                            <Avatar src={item.imageUrl || undefined} alt={item.name} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={item.name}
                            secondary={`${item.quantity} unidades vendidas`}
                        />
                    </ListItem>
                ))}
            </List>}
        {items.length > 0 && <Button size="small" sx={{ mt: 1 }}>Ver analíticas de todos los Items</Button>}
    </Paper>
);
