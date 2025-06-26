import React from 'react';
import { Paper, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import { PerformanceData } from './PerformanceTable';
import EmptyState from './EmptyState';

interface PerformanceBarChartProps {
    data: PerformanceData[];
    metric: 'sales' | 'units';
    loading: boolean;
    title: string;
}

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data, metric, loading, title }) => {
    const theme = useTheme();

    const chartData = React.useMemo(() => {
        return [...data]
            .sort((a, b) => metric === 'sales' ? (b.totalSales || 0) - (a.totalSales || 0) : (b.totalUnits || 0) - (a.totalUnits || 0))
            .slice(0, 10)
            .map(item => ({
                name: item.name,
                Ventas: item.totalSales,
                Unidades: item.totalUnits,
            })).reverse();
    }, [data, metric]);


    const dataKey = metric === 'sales' ? 'Ventas' : 'Unidades';
    const fill = metric === 'sales' ? theme.palette.primary.main : theme.palette.secondary.main;

    return (
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length === 0 ? (
                <EmptyState
                    icon={BarChartIcon}
                    title="No hay datos suficientes"
                    message="No hay rendimiento para mostrar en este período."
                />
            ) : (
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                tickFormatter={(value) => metric === 'sales' ? `$${(Number(value) / 1000).toFixed(0)}k` : String(value)}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                                formatter={(value: number) => {
                                    if (metric === 'sales') {
                                        return new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        }).format(value);
                                    }
                                    return value.toLocaleString('en-US');
                                }}
                            />
                            <Legend />
                            <Bar dataKey={dataKey} fill={fill} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
};

export default PerformanceBarChart;