import React from 'react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface KPICardProps {
    title: string;
    value: number; 
    icon?: SvgIconComponent;
    loading?: boolean;
    prefix?: string;
    suffix?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: IconComponent, loading, prefix = '', suffix = '' }) => {
    
    const formattedValue = () => {
        const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);

        return `${prefix}${formatted}${suffix}`;
    };

    return (
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
                        {formattedValue()}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}