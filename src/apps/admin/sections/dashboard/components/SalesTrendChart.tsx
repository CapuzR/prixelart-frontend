import React, { useMemo } from 'react';
import { Paper, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Order } from 'types/order.types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface SalesTrendChartProps {
    orders: Order[];
    loading: boolean;
    metric: 'sales' | 'units';
    startDate: Date;
    endDate: Date;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ orders, loading, metric, startDate, endDate }) => {
    const theme = useTheme();

    const chartData = useMemo(() => {
        const dailyData: Record<string, { sales: number; units: number }> = {};

        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
        dateInterval.forEach(day => {
            const formattedDate = format(day, 'MMM d');
            dailyData[formattedDate] = { sales: 0, units: 0 };
        });

        orders.forEach(order => {
            const orderDate = parseISO(order.createdOn.toString());
            const formattedDate = format(orderDate, 'MMM d');
            if (dailyData[formattedDate]) {
                dailyData[formattedDate].sales += order.total || 0;
                dailyData[formattedDate].units += order.totalUnits || 0;
            }
        });
        
        return Object.entries(dailyData).map(([date, values]) => ({
            date,
            Ventas: values.sales,
            Unidades: values.units,
        }));

    }, [orders, startDate, endDate]);

    const dataKey = metric === 'sales' ? 'Ventas' : 'Unidades';
    const stroke = metric === 'sales' ? theme.palette.primary.main : theme.palette.secondary.main;
    const yAxisLabel = metric === 'sales' ? 'Ingresos ($)' : 'Unidades Vendidas';

    return (
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
                Tendencia de {yAxisLabel}
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => metric === 'sales' ? `$${(value / 1000).toFixed(0)}k` : value} />
                            <Tooltip formatter={(value: number) => metric === 'sales' ? `$${value.toFixed(2)}` : value} />
                            <Legend />
                            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
};

export default SalesTrendChart;