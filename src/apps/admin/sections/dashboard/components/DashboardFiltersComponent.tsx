import React from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Typography, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays } from 'date-fns';

interface DashboardFiltersProps {
    filters: { startDate: Date; endDate: Date };
    onFiltersChange: (filters: { startDate: Date; endDate: Date }) => void;
}

type DateTuple = [Date | null, Date | null];

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({ filters, onFiltersChange }) => {
    const [dateRange, setDateRange] = React.useState<DateTuple>([filters.startDate, filters.endDate]);

    const predefinedRanges = [
        { label: 'Hoy', range: (): [Date, Date] => [new Date(), new Date()] },
        { label: 'Últimos 7 días', range: (): [Date, Date] => [subDays(new Date(), 6), new Date()] },
        { label: 'Últimos 30 días', range: (): [Date, Date] => [subDays(new Date(), 29), new Date()] },
        { label: 'Mes en curso', range: (): [Date, Date] => [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] },
    ];

    const handleDateRangeChange = (newRange: DateTuple) => {
        setDateRange(newRange);
        if (newRange[0] && newRange[1]) {
            onFiltersChange({ startDate: newRange[0], endDate: newRange[1] });
        }
    };

    const handlePredefinedRangeClick = (rangeFunc: () => [Date, Date]) => {
        const newRange = rangeFunc();
        setDateRange(newRange);
        onFiltersChange({ startDate: newRange[0], endDate: newRange[1] });
    };

    const processDatePickerValue = (value: unknown): Date | null => {
        if (!value) {
            return null;
        }
        // Check if it's a Dayjs-like object (has a .toDate method)
        if (typeof (value as any).toDate === 'function') {
            return (value as any).toDate();
        }
        // Check if it's already a Date object
        if (value instanceof Date) {
            return value;
        }
        return null;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>Fecha:</Typography>
                {predefinedRanges.map(pRange => (
                    <Button key={pRange.label} size="small" onClick={() => handlePredefinedRangeClick(pRange.range)}>
                        {pRange.label}
                    </Button>
                ))}

                <DatePicker
                    label="Fecha Inicial"
                    value={dateRange[0]}
                    onChange={(newValue) => {
                        const processedStartDate = processDatePickerValue(newValue);
                        handleDateRangeChange([processedStartDate, dateRange[1]]);
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="Fecha Final"
                    value={dateRange[1]}
                    onChange={(newValue) => {
                        const processedEndDate = processDatePickerValue(newValue);
                        handleDateRangeChange([dateRange[0], processedEndDate]);
                    }}
                    minDate={dateRange[0] ?? undefined}
                    slotProps={{ textField: { size: 'small' } }}
                />
            </Paper>
        </LocalizationProvider>
    );
};