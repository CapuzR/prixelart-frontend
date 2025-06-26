import React from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, Chip, Skeleton } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface KPICardProps {
    title: string;
    value: number;
    previousValue: number;
    icon?: SvgIconComponent;
    loading?: boolean;
    prefix?: string;
    isInteger?: boolean;
}

const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

export const KPICardWithComparison: React.FC<KPICardProps> = ({ title, value, previousValue, icon: IconComponent, loading, prefix = '', isInteger = false }) => {

    const percentageChange = calculatePercentageChange(value, previousValue);
    const isPositive = percentageChange >= 0;
    const isNeutral = percentageChange === 0;

    const formattedValue = () => {
        const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        const formatOptions: Intl.NumberFormatOptions = {
            minimumFractionDigits: isInteger ? 0 : 2,
            maximumFractionDigits: isInteger ? 0 : 2,
        };
        const formatted = new Intl.NumberFormat('en-US', formatOptions).format(numericValue);
        return `${prefix}${formatted}`;
    };

    const renderChangeChip = () => {
        if (loading) return <Skeleton variant="rounded" width={60} height={24} />;

        const changeIcon = isNeutral ? <TrendingFlatIcon fontSize="small" /> : (isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />);
        const changeColor = isNeutral ? 'default' : (isPositive ? 'success' : 'error');
        const changeLabel = `${Math.abs(percentageChange).toFixed(1)}%`;

        return (
            <Chip
                icon={changeIcon}
                label={changeLabel}
                color={changeColor}
                size="small"
                sx={{ fontWeight: 'bold' }}
            />
        );
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    {IconComponent && <IconComponent color="action" sx={{ fontSize: 30, opacity: 0.6 }} />}
                </Box>
                {loading ? (
                    <CircularProgress size={36} />
                ) : (
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {formattedValue()}
                    </Typography>
                )}
                <Box mt={1.5} display="flex" alignItems="center" gap={1}>
                    {renderChangeChip()}
                    <Typography variant="caption" color="text.secondary">
                        vs. período anterior
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};