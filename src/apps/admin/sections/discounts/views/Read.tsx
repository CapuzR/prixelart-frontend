import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Alert,
    Tooltip, Chip, TextField, InputAdornment, Select, MenuItem,
    FormControl, InputLabel, Toolbar, TablePagination, TableSortLabel // Added components
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // For overrides indicator


// Hooks, Types, Context, API
import { useSnackBar } from '@context/UIContext';
import { Discount, AdjustmentMethod } from 'types/discount.types';
import { getDiscounts, deleteDiscount } from '@api/discount.api';
import Title from '@apps/admin/components/Title';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';

// --- Sorting Helper Functions ---

function descendingComparator<T>(a: T, b: T, orderBy: keyof T | string): number {
    const bValue = getNestedValue(b, orderBy as string);
    const aValue = getNestedValue(a, orderBy as string);

    // Handle different types for comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
        return bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue;
    }
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return bValue === aValue ? 0 : bValue ? 1 : -1;
    }
    // Fallback for dates or mixed types (treat null/undefined as lowest)
    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
}

// Adjusted to handle dateRange.start potentially being null/undefined or needing Date conversion
function getNestedValue(obj: any, path: string): any {
    if (path.startsWith('dateRange.')) {
        const key = path.split('.')[1] as keyof Discount['dateRange'];
        const dateVal = obj?.dateRange?.[key];
        return dateVal ? new Date(dateVal).getTime() : null; // Compare timestamps, nulls sort first/last
    }
    const value = obj[path];
    return value === null || typeof value === 'undefined' ? (typeof value === 'number' ? -Infinity : '') : value; // Handle nulls consistently
}

type Order = 'asc' | 'desc';

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// --- Formatting Helper Functions (Keep as before) ---
const formatAdjustmentValue = (value: number, method: AdjustmentMethod): string => { /* ... */
    if (method === 'percentage') return `${(value * 100).toFixed(0)}%`;
    return `$${value.toFixed(2)}`;
};
const formatApplicability = (discount: Discount): string => { /* ... */
    const parts: string[] = [];
    if (discount.appliesToAllProducts) parts.push("Todos los Productos");
    else if (discount.applicableProducts && discount.applicableProducts.length > 0) parts.push(`${discount.applicableProducts.length} Prod.`);

    if (discount.appliestoAllArts) parts.push("Todas las Artes");
    else if (discount.applicableArts && discount.applicableArts.length > 0) parts.push(`${discount.applicableArts.length} Arte(s)`);

    if (parts.length === 0 && !(discount.entityOverrides && discount.entityOverrides.length > 0)) return "N/A"; // Maybe only overrides apply
    if (parts.length === 0 && discount.entityOverrides && discount.entityOverrides.length > 0) return "Solo Entidades";
    if (parts.includes("Todos los Productos") && parts.includes("Todas las Artes")) return "Todo";

    return parts.join(' + ');
};
const formatDateRange = (range?: { start: Date; end: Date }): string => { /* ... */
    if (!range?.start || !range?.end) return 'Siempre';
    try {
        // Added try-catch for invalid dates
        const startDate = new Date(range.start).toLocaleDateString();
        const endDate = new Date(range.end).toLocaleDateString();
        return `${startDate} - ${endDate}`;
    } catch (e) { return "Fechas Inválidas" }
};

// --- Component ---
const ReadDiscounts: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [discounts, setDiscounts] = useState<Discount[]>([]); // Original full list
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

    // Client-side processing state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'active', 'inactive'
    const [filterMethod, setFilterMethod] = useState<AdjustmentMethod | 'all'>('all'); // 'all', 'percentage', 'absolute'
    const [filterCurrentlyActive, setFilterCurrentlyActive] = useState<string>('all'); // 'all', 'yes', 'no'
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Discount | string>('name'); // Default sort column

    // Debouncer for search input
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearchTerm(searchTerm); setPage(0); }, 300);
        return () => { clearTimeout(handler); };
    }, [searchTerm]);

    // --- Fetch Data ---
    const loadDiscounts = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true); setError(null);
        try {
            const fetchedDiscounts = await getDiscounts() as Discount[];
            setDiscounts(fetchedDiscounts); // Set original data
        } catch (err: any) { /* ... error handling ... */
            const message = err.message || "Error al cargar descuentos."; setError(message); showSnackBar(message); console.error(err);
        } finally { if (showLoading) setIsLoading(false); }
    }, [showSnackBar]);

    useEffect(() => { loadDiscounts(); }, [loadDiscounts]);

    // --- Client-Side Processing Pipeline ---

    // 1. Filtering
    const filteredDiscounts = useMemo(() => {
        const now = new Date().getTime(); // Get current time once for filtering
        return discounts.filter(discount => {
            const searchLower = debouncedSearchTerm.toLowerCase();

            // Status Filter
            const statusMatch = filterStatus === 'all' || (discount.active ? 'active' : 'inactive') === filterStatus;

            // Method Filter
            const methodMatch = filterMethod === 'all' || discount.adjustmentMethod === filterMethod;

            // Currently Active Filter
            let currentlyActiveMatch = true;
            if (filterCurrentlyActive !== 'all') {
                const hasDateRange = !!discount.dateRange?.start && !!discount.dateRange?.end;
                if (!hasDateRange) {
                    // If no date range, it's always active
                    currentlyActiveMatch = filterCurrentlyActive === 'yes';
                } else {
                    try {
                        const startTime = new Date(discount.dateRange!.start).getTime();
                        const endTime = new Date(discount.dateRange!.end).getTime();
                        const isActiveNow = now >= startTime && now <= endTime;
                        currentlyActiveMatch = (filterCurrentlyActive === 'yes' && isActiveNow) || (filterCurrentlyActive === 'no' && !isActiveNow);
                    } catch (e) {
                        currentlyActiveMatch = false; // Treat invalid date range as not matching filter
                    }
                }
            }

            // Search Filter
            const searchMatch = !searchLower || (
                discount.name?.toLowerCase().includes(searchLower) ||
                discount.description?.toLowerCase().includes(searchLower)
            );

            return statusMatch && methodMatch && currentlyActiveMatch && searchMatch;
        });
    }, [discounts, debouncedSearchTerm, filterStatus, filterMethod, filterCurrentlyActive]);

    // 2. Sorting
    const sortedDiscounts = useMemo(() => {
        const comparator = (a: Discount, b: Discount): number => {
            const comp = descendingComparator(a, b, orderBy);
            return order === 'desc' ? comp : -comp;
        };
        return stableSort(filteredDiscounts, comparator);
    }, [filteredDiscounts, order, orderBy]);

    // 3. Pagination
    const paginatedDiscounts = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return sortedDiscounts.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedDiscounts, page, rowsPerPage]);

    // --- Handlers ---

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);
    const handleFilterChange = (event: ChangeEvent<{ name?: string; value: unknown }>, filterSetter: React.Dispatch<React.SetStateAction<any>>) => { // Use 'any' for simplicity with different filter types
        filterSetter(event.target.value as string);
        setPage(0);
    };
    const handleRequestSort = (property: keyof Discount | string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleRefresh = () => { loadDiscounts(false); showSnackBar("Lista actualizada."); };

    // Delete Handling
    const handleOpenDeleteDialog = (discount: Discount) => { /* ... */ setDiscountToDelete(discount); setDialogOpen(true); };
    const handleCloseDialog = () => { /* ... */ if (isDeleting) return; setDialogOpen(false); setDiscountToDelete(null); };
    const handleConfirmDelete = async () => { /* ... */
        if (!discountToDelete?._id) return; setIsDeleting(true);
        try {
            await deleteDiscount(discountToDelete._id.toString());
            showSnackBar(`Descuento "${discountToDelete.name}" eliminado.`);
            loadDiscounts(false); // Reload data after delete for client-side processing
            handleCloseDialog();
        } catch (err: any) { /* ... error handling ... */
            showSnackBar(err.message || "Error al eliminar."); handleCloseDialog();
        } finally { setIsDeleting(false); }
    };

    // Update & Create Navigation
    const handleUpdate = (discountId: string | undefined) => { if (discountId) navigate(`/admin/discount/update/${discountId}`); };
    const handleCreate = () => navigate('/admin/discount/create');

    // --- Render Logic ---
    return (
        <>
            <Title title="Gestionar Descuentos" />

            {/* Toolbar */}
            <Paper sx={{ mb: 2, p: 2 }}>
                <Toolbar disableGutters sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {/* Search */}
                    <TextField sx={{ flexBasis: { xs: '100%', sm: 'auto' }, flexGrow: 1, minWidth: '200px' }} variant="outlined" size="small" placeholder="Buscar Nombre, Descripción..." value={searchTerm} onChange={handleSearchChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                    {/* Filters */}
                    <FormControl size="small" sx={{ flexBasis: { xs: '45%', sm: 'auto' }, minWidth: 120 }}>
                        <InputLabel id="status-filter-label">Estado</InputLabel>
                        <Select labelId="status-filter-label" label="Estado" name="status" value={filterStatus} onChange={(e) => handleFilterChange(e as any, setFilterStatus)}>
                            <MenuItem value="all">Todos</MenuItem> <MenuItem value="active">Activo</MenuItem> <MenuItem value="inactive">Inactivo</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flexBasis: { xs: '45%', sm: 'auto' }, minWidth: 120 }}>
                        <InputLabel id="method-filter-label">Método</InputLabel>
                        <Select labelId="method-filter-label" label="Método" name="method" value={filterMethod} onChange={(e) => handleFilterChange(e as any, setFilterMethod)}>
                            <MenuItem value="all">Todos</MenuItem> <MenuItem value="percentage">Porcentaje</MenuItem> <MenuItem value="absolute">Absoluto</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flexBasis: { xs: '45%', sm: 'auto' }, minWidth: 140 }}>
                        <InputLabel id="active-now-filter-label">Activo Ahora</InputLabel>
                        <Select labelId="active-now-filter-label" label="Activo Ahora" name="activeNow" value={filterCurrentlyActive} onChange={(e) => handleFilterChange(e as any, setFilterCurrentlyActive)}>
                            <MenuItem value="all">Todos</MenuItem> <MenuItem value="yes">Sí</MenuItem> <MenuItem value="no">No</MenuItem>
                        </Select>
                    </FormControl>
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexBasis: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end', ml: 'auto' }}>
                        <Tooltip title="Refrescar Lista"><span><IconButton onClick={handleRefresh} disabled={isLoading || isDeleting}><RefreshIcon /></IconButton></span></Tooltip>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={isLoading || isDeleting}>Crear Descuento</Button>
                    </Box>
                </Toolbar>
            </Paper>

            {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
            {error && !isLoading && filteredDiscounts.length === 0 && (<Alert severity="error" sx={{ m: 2 }}>{error}<Button onClick={() => loadDiscounts()} size="small" sx={{ ml: 1 }}>Reintentar</Button></Alert>)}
            {error && !isLoading && filteredDiscounts.length > 0 && (<Alert severity="warning" sx={{ mb: 2 }}>No se pudo actualizar la lista: {error}</Alert>)}
            {!isLoading && filteredDiscounts.length === 0 && !error && (<Alert severity="info" sx={{ m: 2 }}>No se encontraron descuentos que coincidan con los criterios.</Alert>)}

            {!isLoading && filteredDiscounts.length > 0 && (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 800 }} aria-label="discounts table">
                        <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                            <TableRow>
                                <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                    <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleRequestSort('name')}>Nombre</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>
                                    <TableSortLabel active={orderBy === 'defaultValue'} direction={orderBy === 'defaultValue' ? order : 'asc'} onClick={() => handleRequestSort('defaultValue')}>Valor</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Aplica A</TableCell>
                                <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>
                                    <TableSortLabel active={orderBy === 'dateRange.start'} direction={orderBy === 'dateRange.start' ? order : 'asc'} onClick={() => handleRequestSort('dateRange.start')}>Rango Fechas</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ width: '10%', fontWeight: 'bold' }}>
                                    <TableSortLabel active={orderBy === 'active'} direction={orderBy === 'active' ? order : 'asc'} onClick={() => handleRequestSort('active')}>Estado</TableSortLabel>
                                </TableCell>
                                <TableCell align="right" sx={{ width: '10%', fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDiscounts.map((discount) => (
                                <TableRow hover key={discount._id?.toString()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {discount.name}
                                            {/* Overrides Indicator */}
                                            {discount.entityOverrides && discount.entityOverrides.length > 0 && (
                                                <Tooltip title={`Tiene ${discount.entityOverrides.length} excepción(es)`}>
                                                    <InfoOutlinedIcon color="action" sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                                                </Tooltip>
                                            )}
                                        </Box>
                                        <Tooltip title={discount.description} placement="bottom-start">
                                            <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                                {discount.description}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{formatAdjustmentValue(discount.defaultValue, discount.adjustmentMethod)}</TableCell>
                                    <TableCell>{formatApplicability(discount)}</TableCell>
                                    <TableCell>{formatDateRange(discount.dateRange)}</TableCell>
                                    <TableCell>
                                        <Chip icon={discount.active ? <CheckCircleIcon /> : <CancelIcon />} label={discount.active ? 'Activo' : 'Inactivo'} color={discount.active ? 'success' : 'default'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                            <Tooltip title="Editar Descuento"><IconButton aria-label="edit" color="primary" onClick={() => handleUpdate(discount._id?.toString())} disabled={!discount._id || isDeleting} size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar Descuento"><IconButton aria-label="delete" color="error" onClick={() => handleOpenDeleteDialog(discount)} disabled={!discount._id || (isDeleting && discountToDelete?._id === discount._id)} size="small"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredDiscounts.length} rowsPerPage={rowsPerPage} page={page}
                        onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por pág:" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                    />
                </TableContainer>
            )}

            <ConfirmationDialog
                open={dialogOpen} onClose={handleCloseDialog} onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación" message={<>¿Estás seguro de eliminar el descuento <strong>{discountToDelete?.name || ''}</strong>?</>}
                confirmText="Eliminar" cancelText="Cancelar" isPerformingAction={isDeleting}
            />
        </>
    );
};

export default ReadDiscounts;