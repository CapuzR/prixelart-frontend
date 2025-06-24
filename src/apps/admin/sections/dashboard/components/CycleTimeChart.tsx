import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CycleTimeData } from '@api/order.api';
import EmptyState from './EmptyState';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { getSpanishOrderStatus } from '@apps/admin/utils/translations';
import { OrderStatus } from 'types/order.types';

interface CycleTimeChartProps {
    cycleTimeData: CycleTimeData[];
    loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    'Pending': '#FFBB28',
    'Production': '#0088FE',
    'ReadyToShip': '#AA00FF',
    'Delivered': '#4CAF50',
};

export const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ cycleTimeData, loading }) => {
    const theme = useTheme();

    const chartData = useMemo(() => {
        if (!cycleTimeData) return [];
        return cycleTimeData
            .map(item => ({
                // We need to translate the status name from the backend (english) to spanish for the chart label
                name: getSpanishOrderStatus(OrderStatus[item.status as keyof typeof OrderStatus]),
                dias: item.averageDays,
                fill: STATUS_COLORS[item.status] || theme.palette.grey[500]
            }))
            .filter(item => item.dias > 0); // Only show stages that have a duration
    }, [cycleTimeData]);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length === 0 ? (
                <EmptyState
                    icon={TimelapseIcon}
                    title="Sin Tiempos de Ciclo"
                    message="No hay suficientes datos para calcular el tiempo promedio por etapa."
                />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `${value.toFixed(1)}d`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} días`, 'Promedio']} />
                        <Bar dataKey="dias">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Box>
    );
};