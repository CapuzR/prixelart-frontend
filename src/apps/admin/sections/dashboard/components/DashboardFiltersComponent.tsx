import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, startOfMonth, isSameDay } from 'date-fns';

interface DashboardFiltersProps {
    filters: { startDate: Date; endDate: Date };
    onFiltersChange: (filters: { startDate: Date; endDate: Date }) => void;
}

type PredefinedRange = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({ filters, onFiltersChange }) => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([filters.startDate, filters.endDate]);
    const [activeRange, setActiveRange] = useState<PredefinedRange>('custom');

    const predefinedRanges = [
        { label: 'Hoy', value: 'today' as PredefinedRange, range: (): [Date, Date] => [new Date(), new Date()] },
        { label: 'Últimos 7 días', value: 'last7' as PredefinedRange, range: (): [Date, Date] => [subDays(new Date(), 6), new Date()] },
        { label: 'Últimos 30 días', value: 'last30' as PredefinedRange, range: (): [Date, Date] => [subDays(new Date(), 29), new Date()] },
        { label: 'Mes en curso', value: 'thisMonth' as PredefinedRange, range: (): [Date, Date] => [startOfMonth(new Date()), new Date()] },
    ];

    // Effect to check if the current filter dates match a predefined range
    useEffect(() => {
        const { startDate, endDate } = filters;
        const matchingRange = predefinedRanges.find(p => {
            const [start, end] = p.range();
            return isSameDay(startDate, start) && isSameDay(endDate, end);
        });
        setActiveRange(matchingRange ? matchingRange.value : 'custom');
        setDateRange([startDate, endDate]);
    }, [filters]);


    const handleDateRangeChange = (newRange: [Date | null, Date | null]) => {
        setDateRange(newRange);
        // When a date picker is used, it's always a custom range
        setActiveRange('custom');
        if (newRange[0] && newRange[1]) {
            onFiltersChange({ startDate: newRange[0], endDate: newRange[1] });
        }
    };

    const handlePredefinedRangeClick = (value: PredefinedRange, rangeFunc: () => [Date, Date]) => {
        const newRange = rangeFunc();
        setActiveRange(value);
        setDateRange(newRange);
        onFiltersChange({ startDate: newRange[0], endDate: newRange[1] });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 'bold' }}>Fecha:</Typography>

                {predefinedRanges.map(pRange => (
                    <Button
                        key={pRange.value}
                        size="small"
                        variant={activeRange === pRange.value ? 'contained' : 'outlined'}
                        onClick={() => handlePredefinedRangeClick(pRange.value, pRange.range)}
                    >
                        {pRange.label}
                    </Button>
                ))}

                <DatePicker
                    label="Fecha Inicial"
                    value={dateRange[0]}
                    onChange={(newValue) => {
                        const dateValue = newValue instanceof Date ? newValue : newValue ? new Date(newValue as any) : null;
                        handleDateRangeChange([dateValue, dateRange[1]]);
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="Fecha Final"
                    value={dateRange[1]}
                    onChange={(newValue) => {
                        const dateValue = newValue instanceof Date ? newValue : newValue ? new Date(newValue as any) : null;
                        handleDateRangeChange([dateRange[0], dateValue]);
                    }}
                    minDate={dateRange[0] ?? undefined}
                    slotProps={{ textField: { size: 'small' } }}
                />
            </Paper>
        </LocalizationProvider>
    );
};