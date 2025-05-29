import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrderStatusDistributionChartProps {
    data: { name: string; value: number }[]; // e.g. { name: OrderStatus.Processing, value: 10 }
    loading?: boolean;
}
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF00AA', '#00AAAA']; // Add more colors

export const OrderStatusDistributionChart: React.FC<OrderStatusDistributionChartProps> = ({ data, loading }) => (
    <Paper sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Estado de Órdenes</Typography>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
            </Box>
        ) : (
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        )}
    </Paper>
);