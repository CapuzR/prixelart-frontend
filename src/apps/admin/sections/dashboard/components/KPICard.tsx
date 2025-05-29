import React from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, Icon } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface KPICardProps {
    title: string;
    value: string | number;
    icon?: SvgIconComponent;
    loading?: boolean;
    tooltip?: string;
    trend?: string; // e.g., "+5%"
    trendColor?: 'success.main' | 'error.main';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: IconComponent, loading, trend, trendColor }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                {IconComponent && <IconComponent color="primary" sx={{ fontSize: 30 }} />}
            </Box>
            {loading ? (
                <CircularProgress size={24} />
            ) : (
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
            )}
            {trend && !loading && (
                <Typography variant="caption" color={trendColor || 'text.secondary'}>
                    {trend}
                </Typography>
            )}
        </CardContent>
    </Card>
);