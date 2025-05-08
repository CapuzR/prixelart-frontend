import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Alert,
    Tooltip, Avatar, Link, Stack,
    TablePagination,
    TableSortLabel,
    FormControl,
    Select,
    TextField,
    InputLabel,
    MenuItem,
    Skeleton,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { visuallyHidden } from '@mui/utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackBar } from 'context/GlobalContext';
import Title from '@apps/admin/components/Title';
import { Movement } from 'types/movement.types';
import { getMovements } from '@api/movement.api';
import { User } from 'types/user.types';
import { getUsers } from '@api/user.api';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

interface UserAccountMap {
    [accountId: string]: {
        name: string;
        avatar?: string;
    };
}

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;
const formatDate = (date?: Date): string => date ? new Date(date).toLocaleString() : 'N/A';

// --- Sortable Columns ---
interface HeadCell {
    id: keyof Movement | 'actions';
    label: string;
    numeric: boolean;
    sortable: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'date', numeric: false, label: 'Fecha', sortable: true },
    { id: 'type', numeric: false, label: 'Tipo', sortable: true },
    { id: 'description', numeric: false, label: 'Descripción', sortable: true },
    { id: 'destinatary', numeric: false, label: 'Destinatario', sortable: false },
    { id: 'order', numeric: false, label: 'Orden Asociada', sortable: true },
    { id: 'value', numeric: true, label: 'Valor', sortable: true },
    { id: 'actions', numeric: false, label: 'Acciones', sortable: false },
];

type Order = 'asc' | 'desc';

const ReadMovements: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [movements, setMovements] = useState<Movement[]>([]);
    const [ownerInfoMap, setOwnerInfoMap] = useState<UserAccountMap>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Pagination State ---
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [totalMovements, setTotalMovements] = useState<number>(0);

    // --- Sorting State ---
    const [orderBy, setOrderBy] = useState<keyof Movement>('date');
    const [order, setOrder] = useState<Order>('desc');

    // --- Filtering & Search State ---
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterType, setFilterType] = useState<string>(''); // Store the value ('Ingreso', 'Egreso', '')
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Fetch Data (Paginated & Sorted) ---
    const loadMovementsAndUsers = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        // Don't clear the error immediately if we are just refreshing/filtering
        // setError(null);

        try {
            // 1. Fetch Paginated, Sorted, Filtered Movements
            const apiPage = page + 1;
            const response = await getMovements({
                page: apiPage,
                limit: rowsPerPage,
                sortBy: orderBy,
                sortOrder: order,
                // Pass filter/search values
                search: searchQuery,
                type: filterType,
                dateFrom: startDate?.toISOString(), // Send ISO string to backend
                dateTo: endDate?.toISOString(), // Send ISO string to backend
            });

            setMovements(response.data);
            setTotalMovements(response.totalCount);
            setError(null); // Clear error only on successful fetch

            // ... (rest of the user fetching logic remains the same) ...
            // 2. Extract Unique Destinatary Account IDs *from the current page*
            const accountIds = [...new Set(response.data.map(m => m.destinatary).filter(id => !!id))] as string[];

            // 3. Fetch User Details *only* for users on the current page 
            if (accountIds.length > 0) {
                const idsToFetch = accountIds.filter(id => !ownerInfoMap[id]);
                if (idsToFetch.length > 0) {
                    // !! Optimization Note: Consider a backend endpoint getUsersByIds(idsToFetch)
                    const allUsers = await getUsers() as User[];
                    const relevantUsers = allUsers.filter(user => user.account && idsToFetch.includes(user.account));

                    setOwnerInfoMap(prevMap => {
                        const newMap = { ...prevMap };
                        relevantUsers.forEach(user => {
                            if (user?.account) {
                                newMap[user.account] = {
                                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario Desconocido',
                                    avatar: user.avatar
                                };
                            }
                        });
                        return newMap;
                    });
                }
            }

        } catch (err: any) {
            const message = err.message || "Error al cargar movimientos.";
            setError(message);
            // Only show snackbar for background refresh errors, initial errors shown in Alert
            if (!showLoadingIndicator) {
                showSnackBar(`Error al actualizar: ${message}`);
            }
            console.error("Error fetching filtered/paginated data:", err);
        } finally {
            // Keep loading true only for the initial full-page spinner
            if (showLoadingIndicator || movements.length === 0) {
                setIsLoading(false);
            } else {
                // For subsequent loads (filter/page/sort), set loading false quicker
                // The skeleton display will handle the visual loading state
                setIsLoading(false); // We rely on Skeleton now
            }
        }
        // Update dependencies: add all filter/search state vars
    }, [page, rowsPerPage, order, orderBy, showSnackBar, searchQuery, filterType, startDate, endDate, ownerInfoMap /* Keep ownerInfoMap to avoid refetching known users */]);

    useEffect(() => {
        loadMovementsAndUsers();
    }, [loadMovementsAndUsers]); // Trigger fetch when dependencies change

    const triggerSearch = useCallback(() => {
        // Reset page to 0 when search changes
        setPage(0);
        // Call loadMovementsAndUsers, pass false to avoid full page spinner
        // We rely on the skeleton loader now
        loadMovementsAndUsers(false); // Trigger refetch without main spinner
    }, [loadMovementsAndUsers]);

    // --- Event Handlers ---
    const handleCreate = () => navigate('/admin/movements/create');
    const handleUpdate = (movementId: string) => { if (!movementId) { showSnackBar("Falta ID."); return; } navigate(`/admin/movements/update/${movementId}`); };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Movement) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchQuery(value);

        // Clear existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new debounce timeout
        debounceTimeoutRef.current = setTimeout(() => {
            // Reset page to 0 when search triggers
            // setPage(0); Let triggerSearch handle this
            triggerSearch(); // Call the debounced fetch trigger
        }, 500); // 500ms debounce
    };

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (event: any) => {
        // For Select event: event.target.value
        // For DatePicker event: the date value itself
        const value = event?.target?.value ?? event; // Handle both event types
        setter(value);
        setPage(0); // Reset page on filter change
        // loadMovementsAndUsers(false); // Let useEffect handle the refetch triggered by state change
    };


    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterType('');
        setStartDate(null);
        setEndDate(null);
        setPage(0); // Reset page
        // Clear debounce timeout if a search was pending
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // loadMovementsAndUsers(false); // Let useEffect handle the refetch
    };

    // --- Enhanced Table Head ---
    interface EnhancedTableProps {
        onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Movement) => void;
        order: Order;
        orderBy: string;
    }

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { order, orderBy, onRequestSort } = props;
        const createSortHandler = (property: keyof Movement) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                            sx={{ fontWeight: 'bold' }}
                        >
                            {headCell.sortable ? (
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={createSortHandler(headCell.id as keyof Movement)}
                                >
                                    {headCell.label}
                                    {orderBy === headCell.id ? (
                                        <Box component="span" sx={visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            ) : (
                                headCell.label
                            )}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }


    // --- Render Logic ---
    const renderContent = () => {
        // Initial loading state (full screen spinner handled outside this function)
        // Error on initial load
        if (!isLoading && error && movements.length === 0) {
            return (<Alert severity="error" sx={{ m: 2 }}>{error}<Button onClick={() => loadMovementsAndUsers(true)} size="small">Reintentar</Button></Alert>);
        }
        // No data found after load/filter
        if (!isLoading && movements.length === 0 && !error) {
            return (<Alert severity="info" sx={{ m: 2 }}>No se encontraron movimientos con los filtros aplicados.</Alert>);
        }
        // If loading but we already have *some* data (paging/sorting/filtering), show skeletons
        const showSkeletons = isLoading && movements.length > 0;

        return (
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-label="movements table">
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {/* Show Skeletons OR Actual Data */}
                            {showSkeletons
                                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} style={{ height: 53 }}>
                                        {headCells.map((cell) => (
                                            <TableCell key={cell.id} align={cell.numeric ? 'right' : 'left'}>
                                                <Skeleton animation="wave" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : movements.map((movement) => {
                                    const destinataryInfo = movement.destinatary ? ownerInfoMap[movement.destinatary] : null;
                                    const isDestinataryLoading = movement.destinatary && !destinataryInfo; // Check if ID exists but info hasn't loaded

                                    return (
                                        <TableRow hover key={movement._id?.toString()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            {/* Apply responsive hiding here  */}
                                            <TableCell>{formatDate(movement.date)}</TableCell>
                                            <TableCell>{movement.type}</TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{movement.description}</TableCell> {/* Example Hide Description on XS */}
                                            <TableCell>
                                                {movement.destinatary ? (
                                                    destinataryInfo ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar src={destinataryInfo.avatar || undefined} sx={{ width: 24, height: 24 }} />
                                                            <Typography variant="body2">{destinataryInfo.name}</Typography>
                                                        </Box>
                                                    ) : isDestinataryLoading ? (
                                                        <Typography variant="caption" color="textSecondary">Cargando...</Typography>
                                                    ) : (
                                                        <Tooltip title="ID de cuenta (Usuario no encontrado o no cargado)">
                                                            <Typography variant="caption" fontStyle="italic">{movement.destinatary}</Typography>
                                                        </Tooltip>
                                                    )
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}> {/* Example Hide Order on XS/SM/MD */}
                                                {movement.order ? (
                                                    <Link component="button" variant="body2" onClick={() => navigate(`/admin/order/detail/${movement.order}`)} sx={{ textAlign: 'left' }}>
                                                        {movement.order}
                                                    </Link>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: movement.value >= 0 ? 'success.main' : 'error.main', fontWeight: 'medium' }}>
                                                {formatCurrency(movement.value)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="Editar Movimiento">
                                                        {/* Disable edit if ID is somehow missing */}
                                                        <IconButton aria-label="edit" color="primary" onClick={() => handleUpdate(movement._id!.toString())} disabled={!movement._id || isLoading} size="small">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* --- Pagination --- */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalMovements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                />
            </Paper>
        );
    };

    // --- Main Return Structure ---
    return (
        // Wrap with LocalizationProvider for Date Pickers
        <LocalizationProvider dateAdapter={AdapterDateFns} /* adapterLocale={es} */ >
            <>
                <Title title="Historial de Movimientos" />

                {/* --- Filter and Search Controls --- */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Buscar (Descripción, Dest., Orden)"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={filterType}
                                    label="Tipo"
                                    onChange={handleFilterChange(setFilterType)}
                                >
                                    <MenuItem value=""><em>Todos</em></MenuItem>
                                    <MenuItem value="Depósito">Depósito</MenuItem>
                                    <MenuItem value="Retiro">Retiro</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <DatePicker
                                label="Fecha Desde"
                                value={startDate}
                                onChange={handleFilterChange(setStartDate)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                maxDate={endDate || undefined} // Prevent start date being after end date
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                            <DatePicker
                                label="Fecha Hasta"
                                value={endDate}
                                onChange={handleFilterChange(setEndDate)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                minDate={startDate || undefined} // Prevent end date being before start date
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }} container justifyContent="flex-end" alignItems="center">
                            <Tooltip title="Limpiar Filtros y Búsqueda">
                                <span> {/* Tooltip needs a span wrapper if button is disabled */}
                                    <IconButton
                                        onClick={handleClearFilters}
                                        disabled={!searchQuery && !filterType && !startDate && !endDate} // Disable if no filters applied
                                        color="default"
                                    >
                                        <FilterListOffIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid2>
                    </Grid2>
                </Paper>

                {/* --- Action Buttons --- */}
                <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2} mt={1}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={isLoading && movements.length === 0}>
                        Crear Movimiento
                    </Button>
                </Stack>

                {/* --- Loading / Error / Content --- */}
                {isLoading && movements.length === 0 && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
                {/* Show persistent error/warning if fetch failed during filtering/paging */}
                {error && !isLoading && movements.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        No se pudo actualizar la lista: {error}
                        <Button onClick={() => loadMovementsAndUsers(false)} size="small" sx={{ ml: 1 }}>Reintentar</Button>
                    </Alert>
                )}
                {renderContent()}
            </>
        </LocalizationProvider>
    );
};

export default ReadMovements;