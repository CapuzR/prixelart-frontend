import React, { useMemo } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Order } from 'types/order.types';

interface PaymentMethodChartProps {
    orders: Order[];
    loading: boolean;
}

const COLORS = ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'];

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ orders, loading }) => {

    const chartData = useMemo(() => {
        if (!orders) return [];
        const methodCounts: Record<string, number> = {};

        orders.forEach(order => {
            const methodName = order.payment?.payment?.[0]?.method?.name;
            if (methodName) {
                methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
            }
        });

        return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
    }, [orders]);

    return (
        <Paper sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Popularidad de Métodos de Pago</Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                paddingAngle={5}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value} órdenes`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
};