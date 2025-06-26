import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper, IconButton, Tooltip, CircularProgress, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, startOfMonth, isSameDay } from 'date-fns';
import ReplayIcon from '@mui/icons-material/Replay';

interface DashboardFiltersProps {
    filters: { startDate: Date; endDate: Date };
    onFiltersChange: (filters: { startDate: Date; endDate: Date }) => void;
    onReload: () => void;
    loading: boolean;
}

type PredefinedRange = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({ filters, onFiltersChange, onReload, loading }) => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([filters.startDate, filters.endDate]);
    const [activeRange, setActiveRange] = useState<PredefinedRange>('custom');

    const predefinedRanges = [
        { label: 'Hoy', value: 'today' as PredefinedRange, range: (): [Date, Date] => [new Date(), new Date()] },
        { label: 'Últimos 7 días', value: 'last7' as PredefinedRange, range: (): [Date, Date] => [subDays(new Date(), 6), new Date()] },
        { label: 'Últimos 30 días', value: 'last30' as PredefinedRange, range: (): [Date, Date] => [subDays(new Date(), 29), new Date()] },
        { label: 'Mes en curso', value: 'thisMonth' as PredefinedRange, range: (): [Date, Date] => [startOfMonth(new Date()), new Date()] },
    ];

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
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 'bold' }}>Fecha:</Typography>

                {predefinedRanges.map(pRange => (
                    <Button
                        key={pRange.value}
                        size="small"
                        variant={activeRange === pRange.value ? 'contained' : 'outlined'}
                        onClick={() => handlePredefinedRangeClick(pRange.value, pRange.range)}
                        disabled={loading}
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
                    format="dd/MM/yyyy"
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
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { size: 'small' } }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Recargar Datos">
                    <Box sx={{ position: 'relative' }}>
                        <IconButton onClick={onReload} disabled={loading}>
                            <ReplayIcon />
                        </IconButton>
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'primary.main',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </Tooltip>
            </Paper>
        </LocalizationProvider>
    );
};