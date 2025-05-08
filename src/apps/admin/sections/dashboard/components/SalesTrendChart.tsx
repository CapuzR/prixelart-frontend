import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesTrendChartProps {
    data: any[];
    loading?: boolean;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, loading }) => (
    <Paper sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Tendencia de Ventas</Typography>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
            </Box>
        ) : (
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Ventas" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        )}
    </Paper>
);